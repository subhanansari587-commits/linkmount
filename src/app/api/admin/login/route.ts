import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Admin from '@/models/Admin';
import { comparePassword, hashPassword, signSession, setSessionCookie } from '@/lib/auth';
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
    let admin = await Admin.findOne({ email: email.toLowerCase() });
    
    // Auto-seed initial admin on fresh database deployment (e.g. on Vercel)
    if (!admin) {
      const adminCount = await Admin.countDocuments();
      if (adminCount === 0) {
        const defaultEmail = (process.env.ADMIN_EMAIL || 'admin@example.com').toLowerCase();
        const defaultPassword = process.env.ADMIN_PASSWORD || 'AdminStrongPassword123!';
        const defaultHash = await hashPassword(defaultPassword);
        admin = await Admin.create({
          email: defaultEmail,
          passwordHash: defaultHash,
        });
        console.log(`Auto-seeded initial admin account for ${defaultEmail}`);
      }
    }

    if (!admin || admin.email !== email.toLowerCase()) {
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
  } catch (error: any) {
    console.error('Login error:', error);

    let userFriendlyError = 'An unexpected error occurred during login';
    if (!process.env.MONGODB_URI) {
      userFriendlyError = 'Database error: MONGODB_URI is not set in Vercel Environment Variables.';
    } else if (process.env.MONGODB_URI.includes('localhost') || process.env.MONGODB_URI.includes('127.0.0.1')) {
      userFriendlyError = 'Database error: MONGODB_URI is set to localhost. Please provide a MongoDB Atlas cloud URI in Vercel settings.';
    } else if (
      error?.name === 'MongooseServerSelectionError' ||
      error?.message?.includes('ECONNREFUSED') ||
      error?.message?.includes('querySrv') ||
      error?.message?.includes('ETIMEDOUT')
    ) {
      userFriendlyError =
        'Database connection failed. Please ensure MongoDB Atlas Network Access has IP 0.0.0.0/0 allowed.';
    }

    return NextResponse.json(
      { error: userFriendlyError, details: error?.message },
      { status: 500 }
    );
  }
}
