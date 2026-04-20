import mongoose, { Document, Schema, Model, Types } from 'mongoose';

export interface IPrayerRequest extends Document {
  name: string;
  email: string;
  request: string;
  isAnonymous: boolean;
  isPublic: boolean;
  status: 'pending' | 'praying' | 'answered';
  assignedTo?: Types.ObjectId;
  testimony?: string;
  createdAt: Date;
  updatedAt: Date;
}

const prayerRequestSchema = new Schema<IPrayerRequest>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    request: { type: String, required: true },
    isAnonymous: { type: Boolean, default: false },
    isPublic: { type: Boolean, default: false },
    status: { type: String, enum: ['pending', 'praying', 'answered'], default: 'pending' },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
    testimony: { type: String },
  },
  { timestamps: true }
);

export const PrayerRequest: Model<IPrayerRequest> = mongoose.models.PrayerRequest || mongoose.model<IPrayerRequest>('PrayerRequest', prayerRequestSchema);