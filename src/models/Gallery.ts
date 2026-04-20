import mongoose, { Document, Schema, Model, Types } from 'mongoose';

export interface IGalleryImage {
  url: string;
  publicId: string;
  caption?: string;
  uploadedBy: Types.ObjectId;
}

export interface IGallery extends Document {
  title: string;
  description: string;
  album: string;
  images: IGalleryImage[];
  event?: string;
  date: Date;
  createdBy: Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const gallerySchema = new Schema<IGallery>(
  {
    title: { type: String, required: true },
    description: { type: String },
    album: { type: String, required: true },
    images: [
      {
        url: { type: String, required: true },
        publicId: { type: String, required: true },
        caption: { type: String },
        uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
      },
    ],
    event: { type: String },
    date: { type: Date, default: Date.now },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Gallery: Model<IGallery> = mongoose.models.Gallery || mongoose.model<IGallery>('Gallery', gallerySchema);