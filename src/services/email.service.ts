import nodemailer from 'nodemailer';

// Define EmailOptions interface
interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

class EmailService {
  private transporter: nodemailer.Transporter;
  private isConfigured: boolean;

  constructor() {
    // Check if email is configured
    const hasEmailConfig = process.env.SMTP_USER && process.env.SMTP_PASSWORD;
    
    if (hasEmailConfig) {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        },
      });
      this.isConfigured = true;
      console.log('✅ Email service configured');
    } else {
      console.warn('⚠️ Email service not configured. Set SMTP_USER and SMTP_PASSWORD to enable emails.');
      this.isConfigured = false;
    }
  }

  async sendEmail(options: EmailOptions): Promise<void> {
    if (!this.isConfigured) {
      console.log('📧 Email would be sent (simulated):', options.to);
      console.log('Subject:', options.subject);
      return;
    }

    try {
      const mailOptions = {
        from: options.from || `"RCCG Revelation Sanctuary" <${process.env.SMTP_USER}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`✅ Email sent to ${options.to}`);
    } catch (error) {
      console.error('❌ Email sending failed:', error);
      throw error;
    }
  }

  async sendBulkEventNotifications(event: any, users: any[], type: 'created' | 'reminder'): Promise<void> {
    if (!this.isConfigured) {
      console.log(`📧 SIMULATED: Would send ${type} notification for "${event.title}" to ${users.length} users`);
      return;
    }
    
    console.log(`📧 Sending ${type} notifications for "${event.title}" to ${users.length} users...`);
    const promises = users.map(user => this.sendEventNotification(event, user, type));
    await Promise.all(promises);
    console.log(`✅ Sent ${type} notifications for "${event.title}"`);
  }

  async sendEventNotification(event: any, user: any, type: 'created' | 'reminder'): Promise<void> {
    const eventDate = new Date(event.startDate);
    const formattedDate = eventDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const formattedTime = eventDate.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });

    let subject = '';
    let html = '';

    switch (type) {
      case 'created':
        subject = `📅 New Event: ${event.title}`;
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #0EBC5F 0%, #29156C 100%); padding: 30px; text-align: center;">
              <h1 style="color: white; margin: 0;">RCCG Revelation Sanctuary</h1>
              <p style="color: white; margin: 10px 0 0;">Oasis of Excellence</p>
            </div>
            
            <div style="padding: 30px; background: #ffffff;">
              <h2 style="color: #29156C; margin-top: 0;">New Event: ${event.title}</h2>
              
              <div style="margin: 20px 0; padding: 15px; background: #f5f5f5; border-radius: 8px;">
                <p><strong>📅 Date:</strong> ${formattedDate}</p>
                <p><strong>⏰ Time:</strong> ${formattedTime}</p>
                <p><strong>📍 Venue:</strong> ${event.venue}</p>
                ${event.speaker ? `<p><strong>🎤 Speaker:</strong> ${event.speaker}</p>` : ''}
              </div>
              
              <div style="margin: 20px 0;">
                <h3 style="color: #29156C;">About this event</h3>
                <p style="color: #666;">${event.description}</p>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/events/${event._id}" 
                   style="background: #0EBC5F; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                  View Event Details
                </a>
              </div>
              
              <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
              
              <p style="color: #999; font-size: 12px; text-align: center;">
                You're receiving this email because you subscribed to event notifications.<br>
                <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/profile/notifications" style="color: #0EBC5F;">Manage notifications</a>
              </p>
            </div>
          </div>
        `;
        break;

      case 'reminder':
        subject = `🔔 Reminder: ${event.title} is tomorrow!`;
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #0EBC5F 0%, #29156C 100%); padding: 30px; text-align: center;">
              <h1 style="color: white; margin: 0;">Event Reminder</h1>
            </div>
            
            <div style="padding: 30px; background: #ffffff;">
              <h2 style="color: #29156C;">Don't forget! ${event.title}</h2>
              <p style="color: #666;">This event is happening tomorrow. We can't wait to see you there!</p>
              
              <div style="margin: 20px 0; padding: 15px; background: #f5f5f5; border-radius: 8px;">
                <p><strong>📅 Date:</strong> ${formattedDate}</p>
                <p><strong>⏰ Time:</strong> ${formattedTime}</p>
                <p><strong>📍 Venue:</strong> ${event.venue}</p>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/events/${event._id}" 
                   style="background: #0EBC5F; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                  Event Details
                </a>
              </div>
            </div>
          </div>
        `;
        break;
    }

    await this.sendEmail({
      to: user.email,
      subject,
      html,
    });
  }
}

export default new EmailService();




































































// import nodemailer from 'nodemailer';
// import { Event } from '../models/Event';
// import { User } from '../models/User';

// class EmailService {
//   private transporter: nodemailer.Transporter;
//   private isConfigured: boolean;

//   constructor() {
//     // Check if email is configured
//     const hasEmailConfig = process.env.SMTP_USER && process.env.SMTP_PASSWORD;
    
//     if (hasEmailConfig) {
//       this.transporter = nodemailer.createTransport({
//         host: process.env.SMTP_HOST || 'smtp.gmail.com',
//         port: parseInt(process.env.SMTP_PORT || '587'),
//         secure: false,
//         auth: {
//           user: process.env.SMTP_USER,
//           pass: process.env.SMTP_PASSWORD,
//         },
//       });
//       this.isConfigured = true;
//       console.log('✅ Email service configured');
//     } else {
//       console.warn('⚠️ Email service not configured. Set SMTP_USER and SMTP_PASSWORD to enable emails.');
//       this.isConfigured = false;
//     }
//   }

//   async sendEmail(options: EmailOptions): Promise<void> {
//     if (!this.isConfigured) {
//       console.log('📧 Email would be sent (simulated):', options.to);
//       console.log('Subject:', options.subject);
//       return;
//     }

//     try {
//       const mailOptions = {
//         from: options.from || `"RCCG Revelation Sanctuary" <${process.env.SMTP_USER}>`,
//         to: options.to,
//         subject: options.subject,
//         html: options.html,
//       };

//       await this.transporter.sendMail(mailOptions);
//       console.log(`✅ Email sent to ${options.to}`);
//     } catch (error) {
//       console.error('❌ Email sending failed:', error);
//       throw error;
//     }
//   }

//   async sendBulkEventNotifications(event: any, users: any[], type: 'created' | 'reminder'): Promise<void> {
//     if (!this.isConfigured) {
//       console.log(`📧 SIMULATED: Would send ${type} notification for "${event.title}" to ${users.length} users`);
//       return;
//     }
    
//     console.log(`📧 Sending ${type} notifications for "${event.title}" to ${users.length} users...`);
//     const promises = users.map(user => this.sendEventNotification(event, user, type));
//     await Promise.all(promises);
//     console.log(`✅ Sent ${type} notifications for "${event.title}"`);
//   }

//   async sendEventNotification(event: any, user: any, type: 'created' | 'reminder'): Promise<void> {
//     const eventDate = new Date(event.startDate);
//     const formattedDate = eventDate.toLocaleDateString('en-US', {
//       weekday: 'long',
//       year: 'numeric',
//       month: 'long',
//       day: 'numeric',
//     });
//     const formattedTime = eventDate.toLocaleTimeString('en-US', {
//       hour: '2-digit',
//       minute: '2-digit',
//     });

//     let subject = '';
//     let html = '';

//     switch (type) {
//       case 'created':
//         subject = `📅 New Event: ${event.title}`;
//         html = `
//           <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
//             <div style="background: linear-gradient(135deg, #0EBC5F 0%, #29156C 100%); padding: 30px; text-align: center;">
//               <h1 style="color: white; margin: 0;">RCCG Revelation Sanctuary</h1>
//               <p style="color: white; margin: 10px 0 0;">Oasis of Excellence</p>
//             </div>
            
//             <div style="padding: 30px; background: #ffffff;">
//               <h2 style="color: #29156C; margin-top: 0;">New Event: ${event.title}</h2>
              
//               <div style="margin: 20px 0; padding: 15px; background: #f5f5f5; border-radius: 8px;">
//                 <p><strong>📅 Date:</strong> ${formattedDate}</p>
//                 <p><strong>⏰ Time:</strong> ${formattedTime}</p>
//                 <p><strong>📍 Venue:</strong> ${event.venue}</p>
//                 ${event.speaker ? `<p><strong>🎤 Speaker:</strong> ${event.speaker}</p>` : ''}
//               </div>
              
//               <div style="margin: 20px 0;">
//                 <h3 style="color: #29156C;">About this event</h3>
//                 <p style="color: #666;">${event.description}</p>
//               </div>
              
//               <div style="text-align: center; margin: 30px 0;">
//                 <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/events/${event._id}" 
//                    style="background: #0EBC5F; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
//                   View Event Details
//                 </a>
//               </div>
              
//               <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
              
//               <p style="color: #999; font-size: 12px; text-align: center;">
//                 You're receiving this email because you subscribed to event notifications.<br>
//                 <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/profile/notifications" style="color: #0EBC5F;">Manage notifications</a>
//               </p>
//             </div>
//           </div>
//         `;
//         break;

//       case 'reminder':
//         subject = `🔔 Reminder: ${event.title} is tomorrow!`;
//         html = `
//           <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
//             <div style="background: linear-gradient(135deg, #0EBC5F 0%, #29156C 100%); padding: 30px; text-align: center;">
//               <h1 style="color: white; margin: 0;">Event Reminder</h1>
//             </div>
            
//             <div style="padding: 30px; background: #ffffff;">
//               <h2 style="color: #29156C;">Don't forget! ${event.title}</h2>
//               <p style="color: #666;">This event is happening tomorrow. We can't wait to see you there!</p>
              
//               <div style="margin: 20px 0; padding: 15px; background: #f5f5f5; border-radius: 8px;">
//                 <p><strong>📅 Date:</strong> ${formattedDate}</p>
//                 <p><strong>⏰ Time:</strong> ${formattedTime}</p>
//                 <p><strong>📍 Venue:</strong> ${event.venue}</p>
//               </div>
              
//               <div style="text-align: center; margin: 30px 0;">
//                 <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/events/${event._id}" 
//                    style="background: #0EBC5F; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
//                   Event Details
//                 </a>
//               </div>
//             </div>
//           </div>
//         `;
//         break;
//     }

//     await this.sendEmail({
//       to: user.email,
//       subject,
//       html,
//     });
//   }
// }

// export default new EmailService();



































































// import nodemailer from 'nodemailer';
// import { Event } from '../models/Event';
// import { User } from '../models/User';

// interface EmailOptions {
//   to: string;
//   subject: string;
//   html: string;
//   from?: string;
// }

// class EmailService {
//   private transporter: nodemailer.Transporter;

//   constructor() {
//     this.transporter = nodemailer.createTransport({
//       host: process.env.SMTP_HOST || 'smtp.gmail.com',
//       port: parseInt(process.env.SMTP_PORT || '587'),
//       secure: false,
//       auth: {
//         user: process.env.SMTP_USER,
//         pass: process.env.SMTP_PASSWORD,
//       },
//     });
//   }

//   async sendEmail(options: EmailOptions): Promise<void> {
//     try {
//       const mailOptions = {
//         from: options.from || `"RCCG Revelation Sanctuary" <${process.env.SMTP_USER}>`,
//         to: options.to,
//         subject: options.subject,
//         html: options.html,
//       };

//       await this.transporter.sendMail(mailOptions);
//       console.log(`Email sent to ${options.to}`);
//     } catch (error) {
//       console.error('Email sending failed:', error);
//       throw error;
//     }
//   }

//   async sendEventNotification(event: any, user: any, type: 'created' | 'reminder' | 'updated'): Promise<void> {
//     const eventDate = new Date(event.startDate);
//     const formattedDate = eventDate.toLocaleDateString('en-US', {
//       weekday: 'long',
//       year: 'numeric',
//       month: 'long',
//       day: 'numeric',
//     });
//     const formattedTime = eventDate.toLocaleTimeString('en-US', {
//       hour: '2-digit',
//       minute: '2-digit',
//     });

//     let subject = '';
//     let html = '';

//     switch (type) {
//       case 'created':
//         subject = `📅 New Event: ${event.title}`;
//         html = `
//           <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
//             <div style="background: linear-gradient(135deg, #0EBC5F 0%, #29156C 100%); padding: 30px; text-align: center;">
//               <h1 style="color: white; margin: 0;">RCCG Revelation Sanctuary</h1>
//               <p style="color: white; margin: 10px 0 0;">Oasis of Excellence</p>
//             </div>
            
//             <div style="padding: 30px; background: #ffffff;">
//               <h2 style="color: #29156C; margin-top: 0;">New Event: ${event.title}</h2>
              
//               <div style="margin: 20px 0; padding: 15px; background: #f5f5f5; border-radius: 8px;">
//                 <p><strong>📅 Date:</strong> ${formattedDate}</p>
//                 <p><strong>⏰ Time:</strong> ${formattedTime}</p>
//                 <p><strong>📍 Venue:</strong> ${event.venue}</p>
//                 ${event.speaker ? `<p><strong>🎤 Speaker:</strong> ${event.speaker}</p>` : ''}
//               </div>
              
//               <div style="margin: 20px 0;">
//                 <h3 style="color: #29156C;">About this event</h3>
//                 <p style="color: #666;">${event.description}</p>
//               </div>
              
//               <div style="text-align: center; margin: 30px 0;">
//                 <a href="${process.env.FRONTEND_URL}/events/${event._id}" 
//                    style="background: #0EBC5F; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
//                   View Event Details
//                 </a>
//               </div>
              
//               <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
              
//               <p style="color: #999; font-size: 12px; text-align: center;">
//                 You're receiving this email because you subscribed to event notifications.<br>
//                 <a href="${process.env.FRONTEND_URL}/profile/notifications" style="color: #0EBC5F;">Manage notifications</a>
//               </p>
//             </div>
//           </div>
//         `;
//         break;

//       case 'reminder':
//         subject = `🔔 Reminder: ${event.title} is tomorrow!`;
//         html = `
//           <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
//             <div style="background: linear-gradient(135deg, #0EBC5F 0%, #29156C 100%); padding: 30px; text-align: center;">
//               <h1 style="color: white; margin: 0;">Event Reminder</h1>
//             </div>
            
//             <div style="padding: 30px; background: #ffffff;">
//               <h2 style="color: #29156C;">Don't forget! ${event.title}</h2>
//               <p style="color: #666;">This event is happening tomorrow. We can't wait to see you there!</p>
              
//               <div style="margin: 20px 0; padding: 15px; background: #f5f5f5; border-radius: 8px;">
//                 <p><strong>📅 Date:</strong> ${formattedDate}</p>
//                 <p><strong>⏰ Time:</strong> ${formattedTime}</p>
//                 <p><strong>📍 Venue:</strong> ${event.venue}</p>
//               </div>
              
//               <div style="text-align: center; margin: 30px 0;">
//                 <a href="${process.env.FRONTEND_URL}/events/${event._id}" 
//                    style="background: #0EBC5F; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
//                   Event Details
//                 </a>
//               </div>
//             </div>
//           </div>
//         `;
//         break;
//     }

//     await this.sendEmail({
//       to: user.email,
//       subject,
//       html,
//     });
//   }

//   async sendBulkEventNotifications(event: any, users: any[], type: 'created' | 'reminder'): Promise<void> {
//     const promises = users.map(user => this.sendEventNotification(event, user, type));
//     await Promise.all(promises);
//   }
// }

// export default new EmailService();