import { Request, Response } from 'express';
import { User } from '../models/User';
import { AuthRequest } from '../middleware/auth';

// Get pending approvals
export const getPendingApprovals = async (req: AuthRequest, res: Response) => {
  try {
    const pendingUsers = await User.find({
      isApproved: false,
      role: { $nin: ['member', 'super_admin'] }
    }).select('-password').sort({ createdAt: -1 });

    res.json({ pendingUsers });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Approve a user
export const approveUser = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isApproved = true;
    user.isActive = true;
    user.approvedBy = req.user?._id;
    user.approvedAt = new Date();
    await user.save();

    res.json({
      message: 'User approved successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      }
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Reject a user
export const rejectUser = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await user.deleteOne();

    res.json({ message: 'User rejected and removed' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};