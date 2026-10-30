import QRCode from 'qrcode';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import connectDB from '@/lib/db';
import UploadedFile from '@/models/UploadedFile';
import { ensureUploadDirs, UPLOADS_BASE_DIR } from './upload';

export interface GenerateQrOptions {
  tenantId: string;
  token: string;
  color?: string;
  tenantLogoPath?: string;
  defaultLogoPath?: string;
}

export interface GenerateQrResult {
  imagePath: string;
  updatedAt: Date;
}

/**
 * Generates a high-resolution QR code with optional composited logo.
 * Follows strict spec:
 * - Error correction level 'H'
 * - 1024x1024, margin 2
 * - Configurable dark color
 * - Logo max ~22% width with white rounded backing for scannability
 * - Logo priority: tenant logo -> global default logo -> plain QR
 */
export async function generateTenantQrCode({
  tenantId,
  token,
  color = '#000000',
  tenantLogoPath,
  defaultLogoPath,
}: GenerateQrOptions): Promise<GenerateQrResult> {
  ensureUploadDirs();

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const content = `${baseUrl.replace(/\/$/, '')}/p/${token}`;

  const qrColor = color && /^#([0-9A-F]{3}){1,2}$/i.test(color) ? color : '#000000';

  // Generate base QR buffer
  const qrBuffer = await QRCode.toBuffer(content, {
    type: 'png',
    width: 1024,
    margin: 2,
    errorCorrectionLevel: 'H',
    color: {
      dark: qrColor,
      light: '#ffffff',
    },
  });

  // Resolve logo buffer according to priority (tenant logo -> global default logo)
  let logoBufferToComposite: Buffer | null = null;
  const targetLogoRelPath = tenantLogoPath?.trim() || defaultLogoPath?.trim();

  if (targetLogoRelPath) {
    const cleanRelPath = targetLogoRelPath.split('?')[0];
    const normalized = cleanRelPath.startsWith('/') ? cleanRelPath.slice(1) : cleanRelPath;
    const full = path.join(process.cwd(), 'public', normalized);

    // 1. Try reading from disk first
    if (fs.existsSync(full)) {
      try {
        logoBufferToComposite = await fs.promises.readFile(full);
      } catch {
        // Disk read failed, try DB
      }
    }

    // 2. Fallback to MongoDB if not on disk (e.g. on Vercel)
    if (!logoBufferToComposite) {
      try {
        await connectDB();
        const logoDoc = await UploadedFile.findOne({
          path: cleanRelPath.startsWith('/') ? cleanRelPath : `/${cleanRelPath}`,
        }).lean();

        if (logoDoc && logoDoc.data) {
          logoBufferToComposite = Buffer.isBuffer(logoDoc.data)
            ? logoDoc.data
            : Buffer.from((logoDoc.data as any).buffer || logoDoc.data);
        }
      } catch (err) {
        console.error('Failed to retrieve logo from database:', err);
      }
    }
  }

  let finalBuffer: Buffer = qrBuffer;

  if (logoBufferToComposite) {
    try {
      const qrDimension = 1024;
      const backingSize = 250; // ~24% of QR dimension
      const logoMaxSize = 190; // ~18.5% of QR dimension (well within 22% limit)

      // 1. Create a white rounded-square backing
      const backingSvg = Buffer.from(
        `<svg width="${backingSize}" height="${backingSize}">
          <rect x="0" y="0" width="${backingSize}" height="${backingSize}" rx="48" ry="48" fill="#ffffff" />
        </svg>`
      );

      // 2. Read and resize the logo maintaining aspect ratio
      const resizedLogo = await sharp(logoBufferToComposite)
        .resize(logoMaxSize, logoMaxSize, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .toBuffer();

      const logoMetadata = await sharp(resizedLogo).metadata();
      const logoWidth = logoMetadata.width || logoMaxSize;
      const logoHeight = logoMetadata.height || logoMaxSize;

      // 3. Composite logo onto center of white backing
      const logoLeftOnBacking = Math.round((backingSize - logoWidth) / 2);
      const logoTopOnBacking = Math.round((backingSize - logoHeight) / 2);

      const compositeLogoWithBacking = await sharp(backingSvg)
        .composite([
          {
            input: resizedLogo,
            left: logoLeftOnBacking,
            top: logoTopOnBacking,
          },
        ])
        .png()
        .toBuffer();

      // 4. Composite the combined backing + logo in the center of the QR code
      const centerLeft = Math.round((qrDimension - backingSize) / 2);
      const centerTop = Math.round((qrDimension - backingSize) / 2);

      finalBuffer = await sharp(qrBuffer)
        .composite([
          {
            input: compositeLogoWithBacking,
            left: centerLeft,
            top: centerTop,
          },
        ])
        .png()
        .toBuffer();
    } catch (err) {
      console.error('Failed to composite logo onto QR, falling back to plain QR:', err);
      finalBuffer = qrBuffer;
    }
  }

  const qrFilename = `${tenantId}.png`;
  const imagePath = `/uploads/qr/${qrFilename}`;

  // 1. Try writing to local disk
  try {
    const qrOutputDir = path.join(UPLOADS_BASE_DIR, 'qr');
    const qrOutputPath = path.join(qrOutputDir, qrFilename);
    await fs.promises.writeFile(qrOutputPath, finalBuffer);
  } catch {
    // Read-only filesystem on Vercel
  }

  // 2. Persist in MongoDB
  try {
    await connectDB();
    await UploadedFile.findOneAndUpdate(
      { path: imagePath },
      {
        path: imagePath,
        data: finalBuffer,
        mimeType: 'image/png',
        size: finalBuffer.length,
      },
      { upsert: true, new: true }
    );
  } catch (err) {
    console.error('Failed to persist QR code to database:', err);
  }

  return {
    imagePath,
    updatedAt: new Date(),
  };
}
