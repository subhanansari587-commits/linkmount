import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Tenant from '@/models/Tenant';
import { generateVCardString } from '@/lib/vcard';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await context.params;
    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }

    await connectDB();
    const tenant = await Tenant.findOne({ token, isActive: true }).lean();
    if (!tenant) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
    }

    // Extract primary phone and email from links if available
    const phoneLink = tenant.links?.find(
      (l) => l.enabled !== false && (l.icon === 'phone' || l.icon === 'whatsapp')
    );
    const emailLink = tenant.links?.find(
      (l) => l.enabled !== false && l.icon === 'mail'
    );
    const websiteLink = tenant.links?.find(
      (l) => l.enabled !== false && (l.icon === 'website' || l.icon === 'link')
    );

    const fullName = tenant.displayName?.trim() || tenant.name?.trim() || 'Contact';

    const vcardString = generateVCardString({
      fullName,
      designation: tenant.designation,
      companyName: tenant.companyName,
      phone: tenant.contactPhone || phoneLink?.url,
      email: tenant.contactEmail || emailLink?.url,
      website: tenant.contactWebsite || websiteLink?.url,
      address: tenant.companyAddress,
      note: tenant.companyBio || tenant.bio,
      avatarUrl: tenant.avatarPath,
    });

    const safeFilename = fullName.replace(/[^a-zA-Z0-9_-]/g, '_') || 'contact';

    return new NextResponse(vcardString, {
      status: 200,
      headers: {
        'Content-Type': 'text/vcard; charset=utf-8',
        'Content-Disposition': `attachment; filename="${safeFilename}.vcf"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('Error generating vCard:', error);
    return NextResponse.json({ error: 'Failed to generate vCard' }, { status: 500 });
  }
}
