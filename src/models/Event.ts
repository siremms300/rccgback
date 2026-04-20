import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IEvent extends Document {
  title: string;
  description: string;
  type: 'service' | 'conference' | 'program' | 'meeting' | 'outreach';
  level: 'region' | 'province' | 'zone' | 'area' | 'parish';
  province?: string;
  zone?: string;
  area?: string;
  parish?: string;
  startDate: Date;
  endDate: Date;
  venue: string;
  speaker?: string;
  image?: string;
  registrationLink?: string;
  liveStreamLink?: string;
  capacity?: number;
  attendees: mongoose.Types.ObjectId[];
  createdBy: mongoose.Types.ObjectId;
  notificationSettings: {
    sendEmail: boolean;
    emailRecipients: 'all' | 'role' | 'specific';
    recipientRoles?: string[];
    specificRecipients?: mongoose.Types.ObjectId[];
    reminderTiming: number; // hours before event
    sendReminder: boolean;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const eventSchema = new Schema<IEvent>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    type: { type: String, enum: ['service', 'conference', 'program', 'meeting', 'outreach'], required: true },
    level: { type: String, enum: ['region', 'province', 'zone', 'area', 'parish'], required: true },
    province: { type: String },
    zone: { type: String },
    area: { type: String },
    parish: { type: String },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    venue: { type: String, required: true },
    speaker: { type: String },
    image: { type: String },
    registrationLink: { type: String },
    liveStreamLink: { type: String },
    capacity: { type: Number },
    attendees: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    notificationSettings: {
      sendEmail: { type: Boolean, default: true },
      emailRecipients: { 
        type: String, 
        enum: ['all', 'role', 'specific'], 
        default: 'all' 
      },
      recipientRoles: [{ type: String }],
      specificRecipients: [{ type: Schema.Types.ObjectId, ref: 'User' }],
      reminderTiming: { type: Number, default: 24 }, // hours before event
      sendReminder: { type: Boolean, default: true },
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Event: Model<IEvent> = mongoose.models.Event || mongoose.model<IEvent>('Event', eventSchema);



























//import mongoose, { Document, Schema } from 'mongoose';

// export interface IEvent extends Document {
//   title: string;
//   description: string;
//   type: 'service' | 'conference' | 'program' | 'meeting' | 'outreach';
//   level: 'region' | 'province' | 'zone' | 'area' | 'parish';
//   province?: string;
//   zone?: string;
//   area?: string;
//   parish?: string;
//   startDate: Date;
//   endDate: Date;
//   venue: string;
//   speaker?: string;
//   image?: string;
//   registrationLink?: string;
//   liveStreamLink?: string;
//   capacity?: number;
//   attendees: mongoose.Types.ObjectId[];
//   createdBy: mongoose.Types.ObjectId;
//   isActive: boolean;
//   createdAt: Date;
//   updatedAt: Date;
// }

// const eventSchema = new Schema<IEvent>(
//   {
//     title: { type: String, required: true },
//     description: { type: String, required: true },
//     type: { type: String, enum: ['service', 'conference', 'program', 'meeting', 'outreach'], required: true },
//     level: { type: String, enum: ['region', 'province', 'zone', 'area', 'parish'], required: true },
//     province: { type: String },
//     zone: { type: String },
//     area: { type: String },
//     parish: { type: String },
//     startDate: { type: Date, required: true },
//     endDate: { type: Date, required: true },
//     venue: { type: String, required: true },
//     speaker: { type: String },
//     image: { type: String },
//     registrationLink: { type: String },
//     liveStreamLink: { type: String },
//     capacity: { type: Number },
//     attendees: [{ type: Schema.Types.ObjectId, ref: 'User' }],
//     createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
//     isActive: { type: Boolean, default: true },
//   },
//   { timestamps: true }
// );

// export const Event = mongoose.models.Event || mongoose.model<IEvent>('Event', eventSchema);