import { Request, Response } from 'express';
import { Teaching } from '../models/Teaching';
import { AuthRequest } from '../middleware/auth';

export const getTeachings = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12;
    const skip = (page - 1) * limit;
    const topic = req.query.topic as string;
    const speaker = req.query.speaker as string;
    const type = req.query.type as string;
    const search = req.query.search as string;

    let query: any = { isActive: true };

    if (topic) query.topics = { $in: [topic] };
    if (speaker) query.speaker = { $regex: speaker, $options: 'i' };
    if (type) query.type = type;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { speaker: { $regex: search, $options: 'i' } },
      ];
    }

    const teachings = await Teaching.find(query)
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit)
      .populate('createdBy', 'name');

    const total = await Teaching.countDocuments(query);

    res.json({
      teachings,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('Error fetching teachings:', error);
    res.status(500).json({ message: error.message });
  }
};

export const getTeaching = async (req: Request, res: Response) => {
  try {
    const teaching = await Teaching.findById(req.params.id).populate('createdBy', 'name');
    
    if (!teaching) {
      return res.status(404).json({ message: 'Teaching not found' });
    }

    // Increment views
    teaching.views += 1;
    await teaching.save();

    res.json({ teaching });
  } catch (error: any) {
    console.error('Error fetching teaching:', error);
    res.status(500).json({ message: error.message });
  }
};

export const createTeaching = async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, speaker, type, url, thumbnail, duration, topics, scriptureReferences, date } = req.body;
    
    const teaching = await Teaching.create({
      title,
      description,
      speaker,
      type,
      url,
      thumbnail,
      duration: duration ? parseInt(duration) : undefined,
      topics: topics || [],
      scriptureReferences: scriptureReferences || [],
      date: date || new Date(),
      createdBy: req.user?._id,
    });

    res.status(201).json({
      message: 'Teaching created successfully',
      teaching,
    });
  } catch (error: any) {
    console.error('Error creating teaching:', error);
    res.status(500).json({ message: error.message });
  }
};

export const updateTeaching = async (req: AuthRequest, res: Response) => {
  try {
    const teaching = await Teaching.findById(req.params.id);
    
    if (!teaching) {
      return res.status(404).json({ message: 'Teaching not found' });
    }

    // Check authorization
    if (teaching.createdBy.toString() !== req.user?._id.toString() && req.user?.role !== 'super_admin') {
      return res.status(403).json({ message: 'Not authorized to update this teaching' });
    }

    const updatedTeaching = await Teaching.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true, runValidators: true }
    );

    res.json({
      message: 'Teaching updated successfully',
      teaching: updatedTeaching,
    });
  } catch (error: any) {
    console.error('Error updating teaching:', error);
    res.status(500).json({ message: error.message });
  }
};

export const deleteTeaching = async (req: AuthRequest, res: Response) => {
  try {
    const teaching = await Teaching.findById(req.params.id);
    
    if (!teaching) {
      return res.status(404).json({ message: 'Teaching not found' });
    }

    // Check authorization
    if (teaching.createdBy.toString() !== req.user?._id.toString() && req.user?.role !== 'super_admin') {
      return res.status(403).json({ message: 'Not authorized to delete this teaching' });
    }

    teaching.isActive = false;
    await teaching.save();

    res.json({ message: 'Teaching deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting teaching:', error);
    res.status(500).json({ message: error.message });
  }
};

export const incrementDownload = async (req: Request, res: Response) => {
  try {
    const teaching = await Teaching.findById(req.params.id);
    
    if (!teaching) {
      return res.status(404).json({ message: 'Teaching not found' });
    }

    teaching.downloads += 1;
    await teaching.save();

    res.json({ message: 'Download count incremented' });
  } catch (error: any) {
    console.error('Error incrementing download:', error);
    res.status(500).json({ message: error.message });
  }
};