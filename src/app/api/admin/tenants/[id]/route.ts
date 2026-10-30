import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Tenant from '@/models/Tenant';
import Settings from '@/models/Settings';
import { getServerSession } from '@/lib/auth';
import { tenantUpdateSchema, sanitizeText } from '@/lib/validators';
import { generateTenantQrCode } from '@/lib/qr';
import { deleteUploadedFile } from '@/lib/upload';

export const runtime = 'nodejs';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    await connectDB();
    const tenant = await Tenant.findById(id).lean();
    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    return NextResponse.json({ tenant });
  } catch (error) {
    console.error('Error fetching tenant:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve tenant' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    const body = await request.json();
    const parsed = tenantUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.format() },
        { status: 400 }
      );
    }

    await connectDB();
    const tenant = await Tenant.findById(id);
    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    const data = parsed.data;

    // Check if avatar changed, clean up previous file
    if (data.avatarPath !== undefined && data.avatarPath !== tenant.avatarPath) {
      if (tenant.avatarPath) {
        await deleteUploadedFile(tenant.avatarPath);
      }
      tenant.avatarPath = data.avatarPath;
    }

    // Check if QR logo changed, clean up previous file
    const oldQrLogo = tenant.qr?.logoPath || '';
    const newQrLogo = data.qrLogoPath ?? oldQrLogo;
    if (newQrLogo !== oldQrLogo && oldQrLogo) {
      await deleteUploadedFile(oldQrLogo);
    }

    // Check if background images changed, clean up previous files
    const oldBgDesktop = tenant.theme?.bgDesktopImage || '';
    const newBgDesktop = data.theme?.bgDesktopImage ?? oldBgDesktop;
    if (oldBgDesktop && oldBgDesktop !== newBgDesktop) {
      await deleteUploadedFile(oldBgDesktop);
    }

    const oldBgMobile = tenant.theme?.bgMobileImage || '';
    const newBgMobile = data.theme?.bgMobileImage ?? oldBgMobile;
    if (oldBgMobile && oldBgMobile !== newBgMobile) {
      await deleteUploadedFile(oldBgMobile);
    }

    const qrColorChanged = data.qrColor && data.qrColor !== tenant.qr?.color;
    const qrLogoChanged = newQrLogo !== oldQrLogo;

    tenant.name = sanitizeText(data.name);
    tenant.displayName = sanitizeText(data.displayName || '');
    tenant.bio = sanitizeText(data.bio || '');
    tenant.isActive = data.isActive ?? tenant.isActive;
    tenant.expiresAt = data.expiresAt ? new Date(data.expiresAt) : null;
    tenant.theme = data.theme || tenant.theme;

    // Preserve clicks for existing links when updating
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const existingClicksMap = new Map<string, number>();
    for (const l of tenant.links) {
      if (l._id) {
        existingClicksMap.set(l._id.toString(), l.clicks || 0);
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    tenant.links = (data.links || []).map((link: any, idx: number) => ({
      _id: link._id,
      label: sanitizeText(link.label),
      url: link.url.trim(),
      icon: link.icon || 'link',
      enabled: link.enabled ?? true,
      order: link.order ?? idx,
      clicks: link._id ? existingClicksMap.get(link._id.toString()) || 0 : 0,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    })) as any;

    tenant.qr.color = data.qrColor || tenant.qr.color || '#000000';
    tenant.qr.logoPath = newQrLogo;

    // If QR settings changed, regenerate QR code
    if (qrColorChanged || qrLogoChanged || !tenant.qr.imagePath) {
      const settings = await Settings.findOne().lean();
      const defaultLogo = settings?.defaultQrLogoPath || '';

      const qrResult = await generateTenantQrCode({
        tenantId: tenant._id.toString(),
        token: tenant.token,
        color: tenant.qr.color,
        tenantLogoPath: tenant.qr.logoPath,
        defaultLogoPath: defaultLogo,
      });

      tenant.qr.imagePath = qrResult.imagePath;
      tenant.qr.updatedAt = qrResult.updatedAt;
    }

    await tenant.save();

    return NextResponse.json({
      success: true,
      tenant,
    });
  } catch (error) {
    console.error('Error updating tenant:', error);
    return NextResponse.json(
      { error: 'Failed to update tenant' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    await connectDB();
    const tenant = await Tenant.findById(id);
    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    // Clean up all associated uploaded files
    if (tenant.avatarPath) {
      await deleteUploadedFile(tenant.avatarPath);
    }
    if (tenant.qr?.logoPath) {
      await deleteUploadedFile(tenant.qr.logoPath);
    }
    if (tenant.qr?.imagePath) {
      await deleteUploadedFile(tenant.qr.imagePath);
    }
    if (tenant.theme?.bgDesktopImage) {
      await deleteUploadedFile(tenant.theme.bgDesktopImage);
    }
    if (tenant.theme?.bgMobileImage) {
      await deleteUploadedFile(tenant.theme.bgMobileImage);
    }

    await Tenant.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: 'Tenant and associated assets deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting tenant:', error);
    return NextResponse.json(
      { error: 'Failed to delete tenant' },
      { status: 500 }
    );
  }
}
