import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Admin from '@/models/Admin';
import { comparePassword, signSession, setSessionCookie } from '@/lib/auth';
import { loginSchema } from '@/lib/validators';
import { checkRateLimit, resetRateLimit } from '@/lib/rateLimit';

export async function POST(request: NextRequest) {
  try {
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      request.headers.get('x-real-ip') ||
      '127.0.0.1';

    // In-memory rate limit: 5 attempts per 15 minutes per IP
    const rateLimit = checkRateLimit(`login_${ip}`, 5, 15 * 60 * 1000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: `Too many login attempts. Please try again in ${Math.ceil(
            rateLimit.resetInSeconds / 60
          )} minutes.`,
        },
        { status: 429 }
      );
    }

    const body = await request.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;

    await connectDB();
    const admin = await Admin.findOne({ email: email.toLowerCase() });
    if (!admin) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const passwordsMatch = await comparePassword(password, admin.passwordHash);
    if (!passwordsMatch) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Reset rate limit counter on successful authentication
    resetRateLimit(`login_${ip}`);

    const token = await signSession({
      id: admin._id.toString(),
      email: admin.email,
    });

    await setSessionCookie(token);

    return NextResponse.json({
      success: true,
      email: admin.email,
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred during login' },
      { status: 500 }
    );
  }
}
