import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

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

  const baseUploads = path.resolve(process.cwd(), 'public', 'uploads');
  const targetPath = path.resolve(baseUploads, ...segments);

  // Path traversal prevention: target must be inside public/uploads
  if (!targetPath.startsWith(baseUploads)) {
    return new NextResponse('Forbidden', { status: 403 });
  }

  if (!fs.existsSync(targetPath)) {
    return new NextResponse('File Not Found', { status: 404 });
  }

  const stat = await fs.promises.stat(targetPath);
  if (!stat.isFile()) {
    return new NextResponse('Not Found', { status: 404 });
  }

  const ext = path.extname(targetPath).toLowerCase();
  const contentType = MIME_MAP[ext] || 'application/octet-stream';

  const fileBuffer = await fs.promises.readFile(targetPath);

  return new NextResponse(fileBuffer, {
    status: 200,
    headers: {
      'Content-Type': contentType,
      'Content-Length': stat.size.toString(),
      'Cache-Control': 'public, max-age=86400',
    },
  });
}
