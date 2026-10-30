import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISettings extends Document {
  defaultQrLogoPath?: string;
  siteName: string;
  updatedAt: Date;
}

const SettingsSchema = new Schema<ISettings>(
  {
    defaultQrLogoPath: {
      type: String,
      default: '',
    },
    siteName: {
      type: String,
      default: 'LinkMount',
    },
  },
  {
    timestamps: true,
  }
);

export const Settings: Model<ISettings> =
  mongoose.models.Settings || mongoose.model<ISettings>('Settings', SettingsSchema);

export default Settings;
