import QRCode from 'qrcode';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
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

  // Resolve logo path according to priority
  let chosenLogoPath: string | null = null;

  if (tenantLogoPath && tenantLogoPath.trim()) {
    const clean = tenantLogoPath.replace(/^\//, '').split('?')[0];
    const full = path.join(process.cwd(), 'public', clean);
    if (fs.existsSync(full)) {
      chosenLogoPath = full;
    }
  }

  if (!chosenLogoPath && defaultLogoPath && defaultLogoPath.trim()) {
    const clean = defaultLogoPath.replace(/^\//, '').split('?')[0];
    const full = path.join(process.cwd(), 'public', clean);
    if (fs.existsSync(full)) {
      chosenLogoPath = full;
    }
  }

  let finalBuffer: Buffer = qrBuffer;

  if (chosenLogoPath) {
    try {
      const qrDimension = 1024;
      const backingSize = 250; // ~24% of QR dimension
      const logoMaxSize = 190; // ~18.5% of QR dimension (well within 22% limit)

      // 1. Create a white rounded-square backing with slight shadow / rounded corners
      const backingSvg = Buffer.from(
        `<svg width="${backingSize}" height="${backingSize}">
          <rect x="0" y="0" width="${backingSize}" height="${backingSize}" rx="48" ry="48" fill="#ffffff" />
        </svg>`
      );

      // 2. Read and resize the logo maintaining aspect ratio
      const resizedLogo = await sharp(chosenLogoPath)
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
  const qrOutputDir = path.join(UPLOADS_BASE_DIR, 'qr');
  const qrOutputPath = path.join(qrOutputDir, qrFilename);

  await fs.promises.writeFile(qrOutputPath, finalBuffer);

  const imagePath = `/uploads/qr/${qrFilename}`;
  return {
    imagePath,
    updatedAt: new Date(),
  };
}
