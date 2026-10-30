import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Tenant from '@/models/Tenant';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    let token = '';
    let linkId = '';
    const contentType = request.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      const body = await request.json();
      token = body.token;
      linkId = body.linkId;
    } else {
      const text = await request.text();
      try {
        const body = JSON.parse(text);
        token = body.token;
        linkId = body.linkId;
      } catch {
        return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
      }
    }

    if (!token || !linkId) {
      return NextResponse.json({ error: 'Missing token or linkId' }, { status: 400 });
    }

    await connectDB();
    const tenant = await Tenant.findOne({ token, isActive: true });
    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found or inactive' }, { status: 404 });
    }

    if (tenant.expiresAt && new Date(tenant.expiresAt) < new Date()) {
      return NextResponse.json({ error: 'Tenant expired' }, { status: 410 });
    }

    // Validate that link belongs to this tenant and increment click count atomically
    const updateResult = await Tenant.updateOne(
      { _id: tenant._id, 'links._id': linkId },
      { $inc: { 'links.$.clicks': 1 } }
    );

    if (updateResult.matchedCount === 0) {
      return NextResponse.json({ error: 'Link does not belong to this page' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error tracking link click:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
