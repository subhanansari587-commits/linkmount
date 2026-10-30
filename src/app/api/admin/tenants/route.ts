import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import connectDB from '@/lib/db';
import Tenant from '@/models/Tenant';
import Settings from '@/models/Settings';
import { getServerSession } from '@/lib/auth';
import { tenantCreateSchema, sanitizeText, normalizeLinkUrl } from '@/lib/validators';
import { generateTenantQrCode } from '@/lib/qr';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.trim() || '';

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = {};
    if (search) {
      const regex = new RegExp(search, 'i');
      query.$or = [{ name: regex }, { displayName: regex }];
    }

    const tenants = await Tenant.find(query).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ tenants });
  } catch (error) {
    console.error('Error fetching tenants:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve tenants' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = tenantCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.format() },
        { status: 400 }
      );
    }

    await connectDB();
    const data = parsed.data;

    // Generate unique 12-character URL-safe token
    let token = nanoid(12);
    let existing = await Tenant.findOne({ token });
    while (existing) {
      token = nanoid(12);
      existing = await Tenant.findOne({ token });
    }

    const settings = await Settings.findOne().lean();
    const defaultLogo = settings?.defaultQrLogoPath || '';

    // Create preliminary tenant document to obtain its _id for QR naming
    const newTenant = new Tenant({
      name: sanitizeText(data.name),
      displayName: sanitizeText(data.displayName || ''),
      bio: sanitizeText(data.bio || ''),
      avatarPath: data.avatarPath || '',
      token,
      links: (data.links || []).map((link, idx) => ({
        ...link,
        url: normalizeLinkUrl(link.url, link.icon),
        label: sanitizeText(link.label),
        order: link.order ?? idx,
      })),
      theme: data.theme || {},
      qr: {
        logoPath: data.qrLogoPath || '',
        color: data.qrColor || '#000000',
        imagePath: '',
        updatedAt: new Date(),
      },
      isActive: data.isActive ?? true,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
    });

    const tenantId = newTenant._id.toString();

    // Generate QR code with logo priority: tenant logo -> default logo -> plain
    const qrResult = await generateTenantQrCode({
      tenantId,
      token,
      color: data.qrColor || '#000000',
      tenantLogoPath: data.qrLogoPath,
      defaultLogoPath: defaultLogo,
    });

    newTenant.qr.imagePath = qrResult.imagePath;
    newTenant.qr.updatedAt = qrResult.updatedAt;

    await newTenant.save();

    return NextResponse.json({
      success: true,
      tenant: newTenant,
    });
  } catch (error) {
    console.error('Error creating tenant:', error);
    return NextResponse.json(
      { error: 'Failed to create link page' },
      { status: 500 }
    );
  }
}
