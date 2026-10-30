import { z } from 'zod';

export const allowedUrlRegex = /^(https?:\/\/|mailto:|tel:)/i;

/**
 * Intelligently normalizes raw user inputs into valid web/protocol links:
 * - Phone numbers (e.g. "+91 9876543210" or "9876543210") -> "tel:+919876543210"
 * - Emails (e.g. "contact@example.com") -> "mailto:contact@example.com"
 * - WhatsApp numbers or handles -> "https://wa.me/..."
 * - Social handles (e.g. "@username" or "username") -> proper platform URL
 * - Plain domains (e.g. "mywebsite.com") -> "https://mywebsite.com"
 */
export function normalizeLinkUrl(rawUrl: string, icon: string = 'link'): string {
  const trimmed = (rawUrl || '').trim();
  if (!trimmed) return '';

  const lowerIcon = (icon || '').toLowerCase();

  // 1. Phone numbers: strip tel: prefix and re-format digits cleanly
  if (lowerIcon === 'phone') {
    const withoutPrefix = trimmed.replace(/^tel:\s*/i, '');
    const cleanDigits = withoutPrefix.replace(/[\s-()]/g, '');
    return `tel:${cleanDigits}`;
  }

  // 2. Emails: strip mailto: prefix and format as mailto:
  if (lowerIcon === 'mail' || (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed) && !trimmed.startsWith('http'))) {
    const withoutPrefix = trimmed.replace(/^mailto:\s*/i, '');
    return `mailto:${withoutPrefix}`;
  }

  // 3. WhatsApp
  if (lowerIcon === 'whatsapp') {
    if (trimmed.startsWith('https://wa.me/') || trimmed.startsWith('http://wa.me/')) {
      return trimmed;
    }
    if (trimmed.startsWith('wa.me/')) {
      return `https://${trimmed}`;
    }
    if (trimmed.startsWith('https://api.whatsapp.com') || trimmed.startsWith('https://chat.whatsapp.com')) {
      return trimmed;
    }
    const digitsOnly = trimmed.replace(/[^0-9]/g, '');
    if (digitsOnly.length >= 7) {
      return `https://wa.me/${digitsOnly}`;
    }
    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
      return `https://${trimmed}`;
    }
    return trimmed;
  }

  // 4. Social media usernames / handles (@handle or bare username or partial domain)
  if (lowerIcon === 'instagram') {
    if (trimmed.startsWith('https://') || trimmed.startsWith('http://')) {
      return trimmed;
    }
    if (trimmed.startsWith('instagram.com/')) {
      return `https://${trimmed}`;
    }
    const handle = trimmed.replace(/^@/, '');
    return `https://instagram.com/${handle}`;
  }

  if (lowerIcon === 'twitter') {
    if (trimmed.startsWith('https://') || trimmed.startsWith('http://')) {
      return trimmed;
    }
    if (trimmed.startsWith('x.com/') || trimmed.startsWith('twitter.com/')) {
      return `https://${trimmed}`;
    }
    const handle = trimmed.replace(/^@/, '');
    return `https://x.com/${handle}`;
  }

  if (lowerIcon === 'github') {
    if (trimmed.startsWith('https://') || trimmed.startsWith('http://')) {
      return trimmed;
    }
    if (trimmed.startsWith('github.com/')) {
      return `https://${trimmed}`;
    }
    const handle = trimmed.replace(/^@/, '');
    return `https://github.com/${handle}`;
  }

  if (lowerIcon === 'youtube') {
    if (trimmed.startsWith('https://') || trimmed.startsWith('http://')) {
      return trimmed;
    }
    if (trimmed.startsWith('youtube.com/') || trimmed.startsWith('youtu.be/')) {
      return `https://${trimmed}`;
    }
    const handle = trimmed.startsWith('@') ? trimmed : `@${trimmed}`;
    return `https://youtube.com/${handle}`;
  }

  if (lowerIcon === 'facebook') {
    if (trimmed.startsWith('https://') || trimmed.startsWith('http://')) {
      return trimmed;
    }
    if (trimmed.startsWith('facebook.com/') || trimmed.startsWith('fb.com/')) {
      return `https://${trimmed}`;
    }
    return `https://facebook.com/${trimmed}`;
  }

  if (lowerIcon === 'linkedin') {
    if (trimmed.startsWith('https://') || trimmed.startsWith('http://')) {
      return trimmed;
    }
    if (trimmed.startsWith('linkedin.com/')) {
      return `https://${trimmed}`;
    }
    const handle = trimmed.replace(/^in\//i, '');
    return `https://linkedin.com/in/${handle}`;
  }

  if (lowerIcon === 'telegram') {
    if (trimmed.startsWith('https://') || trimmed.startsWith('http://')) {
      return trimmed;
    }
    if (trimmed.startsWith('t.me/')) {
      return `https://${trimmed}`;
    }
    const handle = trimmed.replace(/^@/, '');
    return `https://t.me/${handle}`;
  }

  if (lowerIcon === 'tiktok') {
    if (trimmed.startsWith('https://') || trimmed.startsWith('http://')) {
      return trimmed;
    }
    if (trimmed.startsWith('tiktok.com/')) {
      return `https://${trimmed}`;
    }
    const handle = trimmed.startsWith('@') ? trimmed : `@${trimmed}`;
    return `https://tiktok.com/${handle}`;
  }

  // 5. Already has valid protocol
  if (/^(https?:\/\/|mailto:|tel:)/i.test(trimmed)) {
    return trimmed;
  }

  // 6. Generic web URL without protocol -> prepend https://
  return `https://${trimmed}`;
}

export const linkSchema = z.object({
  _id: z.string().optional(),
  label: z.string().min(1, 'Link label is required').max(100),
  icon: z.string().default('link'),
  url: z
    .string()
    .min(1, 'Destination is required')
    .transform((val) => val.trim()),
  enabled: z.boolean().default(true),
  order: z.number().int().default(0),
  clicks: z.number().int().nonnegative().default(0),
});

export const defaultThemeValues = {
  bgType: 'solid' as const,
  bgColor: '#0f172a',
  bgColor2: '#1e293b',
  bgDesktopImage: '',
  bgMobileImage: '',
  textColor: '#ffffff',
  buttonColor: '#ffffff',
  buttonTextColor: '#0f172a',
  buttonStyle: 'filled' as const,
  radius: 'full' as const,
};

export const themeSchema = z.object({
  bgType: z.enum(['solid', 'gradient', 'image']).default('solid'),
  bgColor: z.string().min(1).default('#0f172a'),
  bgColor2: z.string().default('#1e293b'),
  bgDesktopImage: z.string().optional().default(''),
  bgMobileImage: z.string().optional().default(''),
  textColor: z.string().min(1).default('#ffffff'),
  buttonColor: z.string().min(1).default('#ffffff'),
  buttonTextColor: z.string().min(1).default('#0f172a'),
  buttonStyle: z.enum(['filled', 'outline', 'soft']).default('filled'),
  radius: z.enum(['sm', 'md', 'full']).default('full'),
});

export const tenantCreateSchema = z.object({
  name: z.string().min(1, 'Internal name is required').max(100),
  displayName: z.string().max(100).optional().default(''),
  bio: z.string().max(200, 'Bio must be at most 200 characters').optional().default(''),
  avatarPath: z.string().optional().default(''),
  links: z.array(linkSchema).optional().default([]),
  theme: themeSchema.optional().default(defaultThemeValues),
  qrColor: z.string().optional().default('#000000'),
  qrLogoPath: z.string().optional().default(''),
  isActive: z.boolean().optional().default(true),
  expiresAt: z.string().nullable().optional(),
});

export const tenantUpdateSchema = z.object({
  name: z.string().min(1, 'Internal name is required').max(100),
  displayName: z.string().max(100).optional().default(''),
  bio: z.string().max(200, 'Bio must be at most 200 characters').optional().default(''),
  avatarPath: z.string().optional().default(''),
  links: z.array(linkSchema).optional().default([]),
  theme: themeSchema.optional().default(defaultThemeValues),
  qrColor: z.string().optional().default('#000000'),
  qrLogoPath: z.string().optional().default(''),
  isActive: z.boolean().optional().default(true),
  expiresAt: z.string().nullable().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters long'),
});

export const settingsSchema = z.object({
  siteName: z.string().min(1, 'Site name is required').max(100),
  defaultQrLogoPath: z.string().optional().default(''),
});

export function sanitizeText(text: string): string {
  if (!text) return '';
  return text.replace(/[<>]/g, '').trim();
}
