import cron from 'node-cron';
import { Event } from '../models/Event';
import { User } from '../models/User';
import { UserNotification } from '../models/UserNotification';
import emailService from '../services/email.service';

export const startEventReminderJob = () => {
  // Run every hour
  cron.schedule('0 * * * *', async () => {
    console.log('Running event reminder job...');
    
    try {
      const now = new Date();
      const oneDayFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      
      // Find events happening in the next 24-25 hours
      const events = await Event.find({
        startDate: { $gte: now, $lte: oneDayFromNow },
        isActive: true,
        'notificationSettings.sendReminder': true,
      }).populate('attendees');
      
      for (const event of events) {
        const reminderTiming = event.notificationSettings.reminderTiming || 24;
        const hoursUntilEvent = (event.startDate.getTime() - now.getTime()) / (1000 * 60 * 60);
        
        // Send reminder if within timing window
        if (hoursUntilEvent <= reminderTiming && hoursUntilEvent > reminderTiming - 1) {
          // Get attendees who opted in for reminders
          const attendeesWithReminders = await Promise.all(
            event.attendees.map(async (attendee: any) => {
              const prefs = await UserNotification.findOne({ userId: attendee._id });
              if (prefs?.eventReminders.enabled) {
                return attendee;
              }
              return null;
            })
          );
          
          const recipients = attendeesWithReminders.filter(a => a !== null);
          
          if (recipients.length > 0) {
            await emailService.sendBulkEventNotifications(event, recipients, 'reminder');
            console.log(`Sent reminders for event: ${event.title} to ${recipients.length} recipients`);
          }
        }
      }
    } catch (error) {
      console.error('Event reminder job failed:', error);
    }
  });
  
  console.log('Event reminder job scheduled');
};