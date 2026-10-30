import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { nanoid } from 'nanoid';

export const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2 MB
export const MAX_BG_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export type UploadType = 'avatar' | 'logo' | 'bg-desktop' | 'bg-mobile';

export interface FileValidationResult {
  valid: boolean;
  mime?: string;
  ext?: string;
  error?: string;
}

/**
 * Validates file buffer by checking magic bytes for PNG, JPEG, and WEBP.
 * Explicitly rejects SVG and other non-raster files.
 */
export function validateImageMagicBytes(buffer: Buffer): FileValidationResult {
  if (!buffer || buffer.length < 12) {
    return { valid: false, error: 'File buffer is too small or empty' };
  }

  // PNG magic bytes: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return { valid: true, mime: 'image/png', ext: 'png' };
  }

  // JPEG magic bytes: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { valid: true, mime: 'image/jpeg', ext: 'jpg' };
  }

  // WEBP magic bytes: RIFF....WEBP (52 49 46 46 .... 57 45 42 50)
  if (
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50
  ) {
    return { valid: true, mime: 'image/webp', ext: 'webp' };
  }

  return {
    valid: false,
    error: 'Unsupported image format. Only PNG, JPG, and WEBP are allowed (SVGs are prohibited).',
  };
}

export const UPLOADS_BASE_DIR = path.join(process.cwd(), 'public', 'uploads');

export function ensureUploadDirs(): void {
  const dirs = [
    UPLOADS_BASE_DIR,
    path.join(UPLOADS_BASE_DIR, 'avatars'),
    path.join(UPLOADS_BASE_DIR, 'logos'),
    path.join(UPLOADS_BASE_DIR, 'qr'),
    path.join(UPLOADS_BASE_DIR, 'backgrounds'),
  ];
  for (const dir of dirs) {
    if (!fs.existsSync(/*turbopackIgnore: true*/ dir)) {
      fs.mkdirSync(/*turbopackIgnore: true*/ dir, { recursive: true });
    }
  }
}

/**
 * Saves and processes an uploaded file buffer.
 * - Resizes avatars to max 512px.
 * - Resizes desktop backgrounds to max 2560px.
 * - Resizes mobile backgrounds to max 1200px.
 * - Saves into public/uploads/[avatars|logos|backgrounds]/
 * - Returns relative path (e.g. /uploads/backgrounds/abc123xyz.webp)
 */
export async function processAndSaveImage(
  buffer: Buffer,
  type: UploadType
): Promise<{ relativePath: string; fullPath: string }> {
  ensureUploadDirs();

  const validation = validateImageMagicBytes(buffer);
  if (!validation.valid || !validation.ext) {
    throw new Error(validation.error || 'Invalid file format');
  }

  let processedBuffer = buffer;
  const ext = validation.ext;

  if (type === 'avatar') {
    // Resize avatar to max 512px, maintaining aspect ratio
    processedBuffer = await sharp(buffer)
      .resize(512, 512, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .toBuffer();
  } else if (type === 'bg-desktop') {
    // Resize desktop background to max 2560px width/height, maintaining aspect ratio
    processedBuffer = await sharp(buffer)
      .resize(2560, 2560, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .toBuffer();
  } else if (type === 'bg-mobile') {
    // Resize mobile background to max 1200px width/height, maintaining aspect ratio
    processedBuffer = await sharp(buffer)
      .resize(1200, 1200, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .toBuffer();
  }

  const filename = `${nanoid(16)}.${ext}`;
  const folder =
    type === 'avatar' ? 'avatars' : type === 'logo' ? 'logos' : 'backgrounds';
  const targetDir = path.join(UPLOADS_BASE_DIR, folder);
  const targetPath = path.join(targetDir, filename);

  await fs.promises.writeFile(targetPath, processedBuffer);

  const relativePath = `/uploads/${folder}/${filename}`;
  return { relativePath, fullPath: targetPath };
}

/**
 * Safely deletes an uploaded file if it resides in public/uploads/
 */
export async function deleteUploadedFile(relativePath?: string | null): Promise<void> {
  if (!relativePath || typeof relativePath !== 'string') return;

  try {
    // Strip query strings if present
    const cleanPath = relativePath.split('?')[0];
    const normalized = cleanPath.startsWith('/') ? cleanPath.slice(1) : cleanPath;
    const fullPath = path.resolve(process.cwd(), 'public', normalized);

    // Path traversal check
    const publicUploadsResolved = path.resolve(UPLOADS_BASE_DIR);
    if (!fullPath.startsWith(publicUploadsResolved)) {
      console.warn(`Prevented path traversal deletion attempt: ${relativePath}`);
      return;
    }

    if (fs.existsSync(fullPath)) {
      await fs.promises.unlink(fullPath);
    }
  } catch (error) {
    console.error(`Error deleting file ${relativePath}:`, error);
  }
}
