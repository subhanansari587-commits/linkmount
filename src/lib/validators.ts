import { z } from 'zod';

export const allowedUrlRegex = /^(https?:\/\/|mailto:|tel:)/i;

export const linkSchema = z.object({
  _id: z.string().optional(),
  label: z.string().min(1, 'Link label is required').max(100),
  url: z
    .string()
    .min(1, 'URL is required')
    .refine((val) => allowedUrlRegex.test(val.trim()), {
      message: 'URL must start with http://, https://, mailto:, or tel:',
    }),
  icon: z.string().default('link'),
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
