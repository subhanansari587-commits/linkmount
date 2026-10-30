import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ILink {
  _id?: string;
  label: string;
  url: string;
  icon: string;
  enabled: boolean;
  order: number;
  clicks: number;
}

export interface ITheme {
  bgType: 'solid' | 'gradient' | 'image';
  bgColor: string;
  bgColor2: string;
  textColor: string;
  buttonColor: string;
  buttonTextColor: string;
  buttonStyle: 'filled' | 'outline' | 'soft';
  radius: 'sm' | 'md' | 'full';
  bgDesktopImage?: string;
  bgMobileImage?: string;
}

export interface IQr {
  logoPath?: string;
  color: string;
  imagePath: string;
  updatedAt: Date;
}

export interface ITenant extends Document {
  name: string;
  displayName?: string;
  bio?: string;
  avatarPath?: string;
  token: string;
  links: ILink[];
  theme: ITheme;
  qr: IQr;
  isActive: boolean;
  expiresAt: Date | null;
  views: number;
  createdAt: Date;
  updatedAt: Date;
}

const LinkSchema = new Schema<ILink>(
  {
    label: { type: String, required: true, trim: true },
    url: { type: String, required: true, trim: true },
    icon: { type: String, default: 'link' },
    enabled: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 },
  },
  { _id: true }
);

const ThemeSchema = new Schema<ITheme>(
  {
    bgType: { type: String, enum: ['solid', 'gradient', 'image'], default: 'solid' },
    bgColor: { type: String, default: '#0f172a' },
    bgColor2: { type: String, default: '#1e293b' },
    textColor: { type: String, default: '#ffffff' },
    buttonColor: { type: String, default: '#ffffff' },
    buttonTextColor: { type: String, default: '#0f172a' },
    buttonStyle: { type: String, enum: ['filled', 'outline', 'soft'], default: 'filled' },
    radius: { type: String, enum: ['sm', 'md', 'full'], default: 'full' },
    bgDesktopImage: { type: String, default: '' },
    bgMobileImage: { type: String, default: '' },
  },
  { _id: false }
);

const QrSchema = new Schema<IQr>(
  {
    logoPath: { type: String, default: '' },
    color: { type: String, default: '#000000' },
    imagePath: { type: String, default: '' },
    updatedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const TenantSchema = new Schema<ITenant>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    displayName: {
      type: String,
      default: '',
      trim: true,
    },
    bio: {
      type: String,
      maxlength: 200,
      default: '',
      trim: true,
    },
    avatarPath: {
      type: String,
      default: '',
    },
    token: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    links: {
      type: [LinkSchema],
      default: [],
    },
    theme: {
      type: ThemeSchema,
      default: () => ({}),
    },
    qr: {
      type: QrSchema,
      default: () => ({}),
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    expiresAt: {
      type: Date,
      default: null,
    },
    views: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export const Tenant: Model<ITenant> =
  mongoose.models.Tenant || mongoose.model<ITenant>('Tenant', TenantSchema);

export default Tenant;
