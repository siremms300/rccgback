import mongoose, { Document, Schema, Model, Types } from 'mongoose';

export interface IDepartment extends Document {
  name: string;
  description: string;
  leader: Types.ObjectId;
  members: Types.ObjectId[];
  schedule: string;
  color: string;
  icon: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const departmentSchema = new Schema<IDepartment>(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    leader: { type: Schema.Types.ObjectId, ref: 'User' },
    members: [{ type: Schema.Types.ObjectId, ref: 'User', default: [] }],
    schedule: { type: String },
    color: { type: String, default: '#0EBC5F' },
    icon: { type: String, default: 'Users' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Department: Model<IDepartment> = mongoose.models.Department || mongoose.model<IDepartment>('Department', departmentSchema);