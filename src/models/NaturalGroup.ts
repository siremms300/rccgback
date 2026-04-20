import mongoose, { Document, Schema, Model, Types } from 'mongoose';

export interface INaturalGroup extends Document {
  name: string;
  description: string;
  type: 'excellent_men' | 'good_women' | 'yaya' | 'elders_forum' | 'junior_church';
  leader: Types.ObjectId;
  members: Types.ObjectId[];
  meetingSchedule: string;
  meetingDay: string;
  meetingTime: string;
  location: string;
  color: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const naturalGroupSchema = new Schema<INaturalGroup>(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    type: {
      type: String,
      enum: ['excellent_men', 'good_women', 'yaya', 'elders_forum', 'junior_church'],
      required: true,
    },
    leader: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    members: [{ type: Schema.Types.ObjectId, ref: 'User', default: [] }],
    meetingSchedule: { type: String },
    meetingDay: { type: String },
    meetingTime: { type: String },
    location: { type: String },
    color: { type: String, default: '#0EBC5F' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const NaturalGroup: Model<INaturalGroup> = mongoose.models.NaturalGroup || mongoose.model<INaturalGroup>('NaturalGroup', naturalGroupSchema);