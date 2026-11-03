import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Tenant from '@/models/Tenant';
import { leadSubmitSchema, sanitizeText } from '@/lib/validators';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = leadSubmitSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid contact information', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { token, name, phone, email, note } = parsed.data;

    await connectDB();
    const tenant = await Tenant.findOne({ token, isActive: true });
    if (!tenant) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    if (!tenant.leads) {
      tenant.leads = [];
    }

    tenant.leads.push({
      name: sanitizeText(name),
      phone: sanitizeText(phone),
      email: sanitizeText(email || ''),
      note: sanitizeText(note || ''),
      createdAt: new Date(),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    await tenant.save();

    return NextResponse.json({
      success: true,
      message: 'Contact shared successfully!',
    });
  } catch (error) {
    console.error('Error exchanging contact:', error);
    return NextResponse.json({ error: 'Failed to share contact' }, { status: 500 });
  }
}
