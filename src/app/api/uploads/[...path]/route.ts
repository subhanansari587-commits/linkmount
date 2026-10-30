import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import connectDB from '@/lib/db';
import UploadedFile from '@/models/UploadedFile';

export const runtime = 'nodejs';

const MIME_MAP: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
};

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const { path: segments } = await context.params;

  if (!segments || segments.length === 0) {
    return new NextResponse('Not Found', { status: 404 });
  }

  const relativePath = `/uploads/${segments.join('/')}`;

  // 1. Try reading from local disk (fast path for local dev / VPS)
  try {
    const baseUploads = path.resolve(process.cwd(), 'public', 'uploads');
    const targetPath = path.resolve(baseUploads, ...segments);

    // Path traversal check
    if (targetPath.startsWith(baseUploads) && fs.existsSync(targetPath)) {
      const stat = await fs.promises.stat(targetPath);
      if (stat.isFile()) {
        const ext = path.extname(targetPath).toLowerCase();
        const contentType = MIME_MAP[ext] || 'application/octet-stream';
        const fileBuffer = await fs.promises.readFile(targetPath);

        return new NextResponse(new Uint8Array(fileBuffer), {
          status: 200,
          headers: {
            'Content-Type': contentType,
            'Content-Length': stat.size.toString(),
            'Cache-Control': 'public, max-age=31536000, immutable',
          },
        });
      }
    }
  } catch {
    // Disk read failed, fallback to database storage
  }

  // 2. Fallback to MongoDB storage (for Vercel serverless deployments)
  try {
    await connectDB();
    const fileDoc = await UploadedFile.findOne({ path: relativePath }).lean();

    if (fileDoc && fileDoc.data) {
      const buffer = Buffer.isBuffer(fileDoc.data)
        ? fileDoc.data
        : Buffer.from((fileDoc.data as any).buffer || fileDoc.data);

      return new NextResponse(new Uint8Array(buffer), {
        status: 200,
        headers: {
          'Content-Type': fileDoc.mimeType || 'image/png',
          'Content-Length': buffer.length.toString(),
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      });
    }
  } catch (dbErr) {
    console.error('Error serving file from database:', dbErr);
  }

  return new NextResponse('File Not Found', { status: 404 });
}
