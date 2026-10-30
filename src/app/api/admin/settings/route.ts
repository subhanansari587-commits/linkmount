import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Settings from '@/models/Settings';
import Admin from '@/models/Admin';
import { getServerSession, comparePassword, hashPassword } from '@/lib/auth';
import { settingsSchema, changePasswordSchema, sanitizeText } from '@/lib/validators';
import { deleteUploadedFile } from '@/lib/upload';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    let settings = await Settings.findOne().lean();
    if (!settings) {
      settings = await Settings.create({ siteName: 'LinkMount', defaultQrLogoPath: '' });
    }

    return NextResponse.json({
      siteName: settings.siteName,
      defaultQrLogoPath: settings.defaultQrLogoPath || '',
      adminEmail: session.email,
    });
  } catch (error) {
    console.error('Error getting settings:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve settings' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    await connectDB();

    // Check if updating password
    if (body.action === 'change-password') {
      const parsed = changePasswordSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          { error: parsed.error.issues[0]?.message || 'Invalid password data' },
          { status: 400 }
        );
      }

      const admin = await Admin.findById(session.id);
      if (!admin) {
        return NextResponse.json({ error: 'Admin not found' }, { status: 404 });
      }

      const isValid = await comparePassword(parsed.data.currentPassword, admin.passwordHash);
      if (!isValid) {
        return NextResponse.json(
          { error: 'Current password is incorrect' },
          { status: 400 }
        );
      }

      admin.passwordHash = await hashPassword(parsed.data.newPassword);
      await admin.save();

      return NextResponse.json({
        success: true,
        message: 'Password changed successfully',
      });
    }

    // Otherwise updating general settings (siteName, defaultQrLogoPath)
    const parsed = settingsSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.format() },
        { status: 400 }
      );
    }

    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings({ siteName: 'LinkMount', defaultQrLogoPath: '' });
    }

    const oldLogo = settings.defaultQrLogoPath || '';
    const newLogo = parsed.data.defaultQrLogoPath || '';

    // If logo removed or changed, clean up previous file
    if (oldLogo && oldLogo !== newLogo) {
      await deleteUploadedFile(oldLogo);
    }

    settings.siteName = sanitizeText(parsed.data.siteName);
    settings.defaultQrLogoPath = newLogo;
    await settings.save();

    return NextResponse.json({
      success: true,
      settings,
      message: 'Settings updated successfully',
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}
