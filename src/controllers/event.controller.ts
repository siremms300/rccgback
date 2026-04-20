import { Request, Response } from 'express';
import { Event } from '../models/Event';
import { User } from '../models/User';
import { UserNotification } from '../models/UserNotification';
import { AuthRequest } from '../middleware/auth';
import emailService from '../services/email.service';

export const getEvents = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;
    const type = req.query.type as string;
    const level = req.query.level as string;
    const upcoming = req.query.upcoming === 'true';

    let query: any = { isActive: true };
    
    if (type) query.type = type;
    if (level) query.level = level;
    if (upcoming) {
      query.startDate = { $gte: new Date() };
    }

    const events = await Event.find(query)
      .sort({ startDate: 1 })
      .skip(skip)
      .limit(limit)
      .populate('createdBy', 'name')
      .populate('attendees', 'name email');

    const total = await Event.countDocuments(query);

    res.json({
      events,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getEvent = async (req: Request, res: Response) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('createdBy', 'name')
      .populate('attendees', 'name email phone');

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json({ event });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createEvent = async (req: AuthRequest, res: Response) => {
  try {
    const eventData = {
      ...req.body,
      createdBy: req.user?._id,
    };

    const event = await Event.create(eventData);

    // Send email notifications to selected recipients
    if (event.notificationSettings.sendEmail) {
      let recipients: any[] = [];

      if (event.notificationSettings.emailRecipients === 'all') {
        recipients = await User.find({ isActive: true, role: { $ne: 'super_admin' } });
      } else if (event.notificationSettings.emailRecipients === 'role') {
        recipients = await User.find({ 
          isActive: true, 
          role: { $in: event.notificationSettings.recipientRoles || [] } 
        });
      } else if (event.notificationSettings.emailRecipients === 'specific') {
        recipients = await User.find({ 
          _id: { $in: event.notificationSettings.specificRecipients || [] } 
        });
      }

      // Filter users who opted in for email notifications
      const usersWithNotifications = await Promise.all(
        recipients.map(async (user) => {
          const prefs = await UserNotification.findOne({ userId: user._id });
          if (!prefs || prefs.emailNotifications.events) {
            return user;
          }
          return null;
        })
      );

      const finalRecipients = usersWithNotifications.filter(u => u !== null);
      
      // Send emails asynchronously (don't wait for completion)
      emailService.sendBulkEventNotifications(event, finalRecipients, 'created')
        .catch(error => console.error('Error sending bulk emails:', error));
    }

    res.status(201).json({
      message: 'Event created successfully',
      event,
    });
  } catch (error: any) {
    console.error('Create event error:', error);
    res.status(500).json({ message: error.message });
  }
};

export const updateEvent = async (req: AuthRequest, res: Response) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check authorization
    if (event.createdBy.toString() !== req.user?._id.toString() && req.user?.role !== 'super_admin') {
      return res.status(403).json({ message: 'Not authorized to update this event' });
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true, runValidators: true }
    );

    res.json({
      message: 'Event updated successfully',
      event: updatedEvent,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteEvent = async (req: AuthRequest, res: Response) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check authorization
    if (event.createdBy.toString() !== req.user?._id.toString() && req.user?.role !== 'super_admin') {
      return res.status(403).json({ message: 'Not authorized to delete this event' });
    }

    event.isActive = false;
    await event.save();

    res.json({ message: 'Event deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const registerForEvent = async (req: AuthRequest, res: Response) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const userId = req.user?._id;
    
    if (event.attendees.includes(userId)) {
      return res.status(400).json({ message: 'Already registered for this event' });
    }

    if (event.capacity && event.attendees.length >= event.capacity) {
      return res.status(400).json({ message: 'Event is full' });
    }

    event.attendees.push(userId);
    await event.save();

    res.json({
      message: 'Successfully registered for event',
      event,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getEventAttendees = async (req: Request, res: Response) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('attendees', 'name email phone');

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json({ attendees: event.attendees });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};