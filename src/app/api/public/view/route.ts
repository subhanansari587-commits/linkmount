import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Tenant from '@/models/Tenant';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    let token = '';
    const contentType = request.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      const body = await request.json();
      token = body.token;
    } else {
      const text = await request.text();
      try {
        const body = JSON.parse(text);
        token = body.token;
      } catch {
        token = text.trim();
      }
    }

    if (!token || typeof token !== 'string') {
      return NextResponse.json({ error: 'Missing token' }, { status: 400 });
    }

    await connectDB();
    const tenant = await Tenant.findOne({ token, isActive: true });
    if (!tenant) {
      return NextResponse.json({ error: 'Not found or inactive' }, { status: 404 });
    }

    if (tenant.expiresAt && new Date(tenant.expiresAt) < new Date()) {
      return NextResponse.json({ error: 'Tenant expired' }, { status: 410 });
    }

    // Increment view count atomically
    await Tenant.updateOne({ _id: tenant._id }, { $inc: { views: 1 } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error tracking page view:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
