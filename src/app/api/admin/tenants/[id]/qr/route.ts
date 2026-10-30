import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import connectDB from '@/lib/db';
import Tenant from '@/models/Tenant';
import Settings from '@/models/Settings';
import { getServerSession } from '@/lib/auth';
import { generateTenantQrCode } from '@/lib/qr';

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

    const { searchParams } = new URL(request.url);
    const isDownload = searchParams.get('download') === 'true';

    const qrRelPath = tenant.qr?.imagePath;
    if (!qrRelPath) {
      return NextResponse.json({ error: 'QR not generated' }, { status: 404 });
    }

    let fileBuffer: Buffer | null = null;
    const fullPath = path.resolve(process.cwd(), 'public', qrRelPath.replace(/^\//, ''));
    if (fs.existsSync(fullPath)) {
      try {
        fileBuffer = await fs.promises.readFile(fullPath);
      } catch {
        // Disk read failed, try DB
      }
    }

    if (!fileBuffer) {
      const UploadedFile = (await import('@/models/UploadedFile')).default;
      const fileDoc = await UploadedFile.findOne({ path: qrRelPath }).lean();
      if (fileDoc && fileDoc.data) {
        fileBuffer = Buffer.isBuffer(fileDoc.data)
          ? fileDoc.data
          : Buffer.from((fileDoc.data as any).buffer || fileDoc.data);
      }
    }

    if (!fileBuffer) {
      return NextResponse.json({ error: 'QR file not found' }, { status: 404 });
    }

    const safeName = (tenant.name || 'qr-code').replace(/[^a-zA-Z0-9_-]/g, '_');

    if (isDownload) {
      return new NextResponse(new Uint8Array(fileBuffer), {
        status: 200,
        headers: {
          'Content-Type': 'image/png',
          'Content-Disposition': `attachment; filename="qr-${safeName}.png"`,
          'Cache-Control': 'no-cache',
        },
      });
    }

    return new NextResponse(new Uint8Array(fileBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('Error handling QR request:', error);
    return NextResponse.json(
      { error: 'Failed to process QR code request' },
      { status: 500 }
    );
  }
}

export async function POST(
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

    const settings = await Settings.findOne().lean();
    const defaultLogo = settings?.defaultQrLogoPath || '';

    const qrResult = await generateTenantQrCode({
      tenantId: tenant._id.toString(),
      token: tenant.token,
      color: tenant.qr.color || '#000000',
      tenantLogoPath: tenant.qr.logoPath,
      defaultLogoPath: defaultLogo,
    });

    tenant.qr.imagePath = qrResult.imagePath;
    tenant.qr.updatedAt = qrResult.updatedAt;
    await tenant.save();

    return NextResponse.json({
      success: true,
      qr: tenant.qr,
    });
  } catch (error) {
    console.error('Error regenerating QR code:', error);
    return NextResponse.json(
      { error: 'Failed to regenerate QR code' },
      { status: 500 }
    );
  }
}
