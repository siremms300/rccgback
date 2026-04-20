import { Request, Response } from 'express';
import { PrayerRequest } from '../models/PrayerRequest';
import { AuthRequest } from '../middleware/auth';

export const getPrayerRequests = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;
    const status = req.query.status as string;
    const isPublic = req.query.public === 'true';

    let query: any = {};
    
    if (status) query.status = status;
    if (isPublic) query.isPublic = true;

    const prayerRequests = await PrayerRequest.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('assignedTo', 'name email');

    const total = await PrayerRequest.countDocuments(query);

    res.json({
      prayerRequests,
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

export const getPrayerRequest = async (req: AuthRequest, res: Response) => {
  try {
    const prayerRequest = await PrayerRequest.findById(req.params.id)
      .populate('assignedTo', 'name email');

    if (!prayerRequest) {
      return res.status(404).json({ message: 'Prayer request not found' });
    }

    // Hide personal info for non-admins if not public
    if (!prayerRequest.isPublic && (!req.user || req.user.role === 'member')) {
      const sanitized = {
        _id: prayerRequest._id,
        request: prayerRequest.request,
        status: prayerRequest.status,
        isAnonymous: prayerRequest.isAnonymous,
        createdAt: prayerRequest.createdAt,
      };
      return res.json({ prayerRequest: sanitized });
    }

    res.json({ prayerRequest });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createPrayerRequest = async (req: Request, res: Response) => {
  try {
    const prayerRequest = await PrayerRequest.create(req.body);

    res.status(201).json({
      message: 'Prayer request submitted successfully',
      prayerRequest,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updatePrayerRequest = async (req: AuthRequest, res: Response) => {
  try {
    const prayerRequest = await PrayerRequest.findById(req.params.id);
    
    if (!prayerRequest) {
      return res.status(404).json({ message: 'Prayer request not found' });
    }

    if (req.user?.role !== 'super_admin' && req.user?.role !== 'province_pastor') {
      return res.status(403).json({ message: 'Not authorized to update prayer requests' });
    }

    const updatedPrayerRequest = await PrayerRequest.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true, runValidators: true }
    );

    res.json({
      message: 'Prayer request updated successfully',
      prayerRequest: updatedPrayerRequest,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deletePrayerRequest = async (req: AuthRequest, res: Response) => {
  try {
    const prayerRequest = await PrayerRequest.findById(req.params.id);
    
    if (!prayerRequest) {
      return res.status(404).json({ message: 'Prayer request not found' });
    }

    if (req.user?.role !== 'super_admin' && req.user?.role !== 'province_pastor') {
      return res.status(403).json({ message: 'Not authorized to delete prayer requests' });
    }

    await prayerRequest.deleteOne();

    res.json({ message: 'Prayer request deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const assignPrayerRequest = async (req: AuthRequest, res: Response) => {
  try {
    const { assignedTo } = req.body;
    
    const prayerRequest = await PrayerRequest.findByIdAndUpdate(
      req.params.id,
      { assignedTo, status: 'praying' },
      { new: true }
    ).populate('assignedTo', 'name email');

    if (!prayerRequest) {
      return res.status(404).json({ message: 'Prayer request not found' });
    }

    res.json({
      message: 'Prayer request assigned successfully',
      prayerRequest,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updatePrayerStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { status, testimony } = req.body;
    
    const prayerRequest = await PrayerRequest.findByIdAndUpdate(
      req.params.id,
      { status, testimony },
      { new: true }
    );

    if (!prayerRequest) {
      return res.status(404).json({ message: 'Prayer request not found' });
    }

    res.json({
      message: 'Prayer request status updated successfully',
      prayerRequest,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};