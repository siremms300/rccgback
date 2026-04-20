import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IEmailPreference extends Document {
  userId: mongoose.Types.ObjectId;
  receiveEventNotifications: boolean;
  receiveNewsletter: boolean;
  receivePrayerUpdates: boolean;
  eventNotificationTypes: {
    created: boolean;
    updated: boolean;
    reminders: boolean;
    cancelled: boolean;
  };
  reminderFrequency: 'immediate' | 'daily' | 'weekly' | 'custom';
  reminderDaysBefore: number; // Days before event to send reminder
  customReminderTimes?: Date[];
  createdAt: Date;
  updatedAt: Date;
}

const emailPreferenceSchema = new Schema<IEmailPreference>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    receiveEventNotifications: { type: Boolean, default: true },
    receiveNewsletter: { type: Boolean, default: true },
    receivePrayerUpdates: { type: Boolean, default: true },
    eventNotificationTypes: {
      created: { type: Boolean, default: true },
      updated: { type: Boolean, default: true },
      reminders: { type: Boolean, default: true },
      cancelled: { type: Boolean, default: true },
    },
    reminderFrequency: { 
      type: String, 
      enum: ['immediate', 'daily', 'weekly', 'custom'],
      default: 'daily'
    },
    reminderDaysBefore: { type: Number, default: 1 }, // 1 day before
    customReminderTimes: [{ type: Date }],
  },
  { timestamps: true }
);

export const EmailPreference: Model<IEmailPreference> = mongoose.models.EmailPreference || 
  mongoose.model<IEmailPreference>('EmailPreference', emailPreferenceSchema);