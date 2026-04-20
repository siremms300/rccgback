import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IUserNotification extends Document {
  userId: mongoose.Types.ObjectId;
  emailNotifications: {
    events: boolean;
    announcements: boolean;
    teachings: boolean;
  };
  eventReminders: {
    enabled: boolean;
    timing: number; // hours before
  };
  createdAt: Date;
  updatedAt: Date;
}

const userNotificationSchema = new Schema<IUserNotification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    emailNotifications: {
      events: { type: Boolean, default: true },
      announcements: { type: Boolean, default: true },
      teachings: { type: Boolean, default: false },
    },
    eventReminders: {
      enabled: { type: Boolean, default: true },
      timing: { type: Number, default: 24 },
    },
  },
  { timestamps: true }
);

export const UserNotification: Model<IUserNotification> = mongoose.models.UserNotification || 
  mongoose.model<IUserNotification>('UserNotification', userNotificationSchema);