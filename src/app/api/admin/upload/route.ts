import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import {
  processAndSaveImage,
  deleteUploadedFile,
  MAX_FILE_SIZE,
  MAX_BG_FILE_SIZE,
  UploadType,
} from '@/lib/upload';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const type = (formData.get('type') as UploadType) || 'avatar';
    const oldPath = formData.get('oldPath') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const allowedTypes: UploadType[] = ['avatar', 'logo', 'bg-desktop', 'bg-mobile'];
    if (!allowedTypes.includes(type)) {
      return NextResponse.json(
        { error: 'Invalid upload type. Must be "avatar", "logo", "bg-desktop", or "bg-mobile".' },
        { status: 400 }
      );
    }

    const maxLimit = type.startsWith('bg-') ? MAX_BG_FILE_SIZE : MAX_FILE_SIZE;
    if (file.size > maxLimit) {
      return NextResponse.json(
        { error: `File size exceeds maximum permitted limit of ${type.startsWith('bg-') ? '5MB' : '2MB'}.` },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { relativePath } = await processAndSaveImage(buffer, type);

    // If an old file path was passed, delete the previous image to prevent disk bloat
    if (oldPath && oldPath !== relativePath) {
      await deleteUploadedFile(oldPath);
    }

    return NextResponse.json({
      success: true,
      path: relativePath,
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: error.message || 'File upload failed' },
      { status: 400 }
    );
  }
}
