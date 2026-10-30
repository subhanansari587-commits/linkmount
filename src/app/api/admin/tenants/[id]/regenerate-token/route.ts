import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import connectDB from '@/lib/db';
import Tenant from '@/models/Tenant';
import Settings from '@/models/Settings';
import { getServerSession } from '@/lib/auth';
import { generateTenantQrCode } from '@/lib/qr';

export const runtime = 'nodejs';

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

    // Generate brand new unique 12-char token
    let newToken = nanoid(12);
    let existing = await Tenant.findOne({ token: newToken });
    while (existing) {
      newToken = nanoid(12);
      existing = await Tenant.findOne({ token: newToken });
    }

    tenant.token = newToken;

    const settings = await Settings.findOne().lean();
    const defaultLogo = settings?.defaultQrLogoPath || '';

    // Regenerate QR with new token
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
      token: tenant.token,
      qr: tenant.qr,
    });
  } catch (error) {
    console.error('Error regenerating token:', error);
    return NextResponse.json(
      { error: 'Failed to regenerate token' },
      { status: 500 }
    );
  }
}
