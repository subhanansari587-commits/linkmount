import mongoose, { Schema, Document } from 'mongoose';

export interface IUploadedFile extends Document {
  path: string;
  data: Buffer;
  mimeType: string;
  size: number;
  createdAt: Date;
  updatedAt: Date;
}

const UploadedFileSchema = new Schema<IUploadedFile>(
  {
    path: { type: String, required: true, unique: true, index: true },
    data: { type: Buffer, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.UploadedFile ||
  mongoose.model<IUploadedFile>('UploadedFile', UploadedFileSchema);
