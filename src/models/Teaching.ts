import mongoose, { Document, Schema, Model } from 'mongoose';

export interface ITeaching extends Document {
  title: string;
  description: string;
  speaker: string;
  type: 'audio' | 'video' | 'document';
  url: string;
  thumbnail?: string;
  duration?: number;
  topics: string[];
  scriptureReferences: string[];
  date: Date;
  downloads: number;
  views: number;
  createdBy: mongoose.Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const teachingSchema = new Schema<ITeaching>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    speaker: { type: String, required: true, trim: true },
    type: { 
      type: String, 
      enum: ['audio', 'video', 'document'], 
      required: true 
    },
    url: { type: String, required: true },
    thumbnail: { type: String },
    duration: { type: Number },
    topics: [{ type: String }],
    scriptureReferences: [{ type: String }],
    date: { type: Date, required: true, default: Date.now },
    downloads: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Teaching: Model<ITeaching> = mongoose.models.Teaching || mongoose.model<ITeaching>('Teaching', teachingSchema);