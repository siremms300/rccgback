import { Request, Response } from 'express';
import { NaturalGroup } from '../models/NaturalGroup';
import { AuthRequest } from '../middleware/auth';
import mongoose from 'mongoose';

export const getGroups = async (req: Request, res: Response) => {
  try {
    const groups = await NaturalGroup.find({ isActive: true })
      .populate('leader', 'name email')
      .populate('members', 'name email')
      .sort({ name: 1 });

    res.json({ groups });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getGroup = async (req: Request, res: Response) => {
  try {
    const group = await NaturalGroup.findById(req.params.id)
      .populate('leader', 'name email phone')
      .populate('members', 'name email phone');

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    res.json({ group });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createGroup = async (req: AuthRequest, res: Response) => {
  try {
    const group = await NaturalGroup.create(req.body);

    res.status(201).json({
      message: 'Group created successfully',
      group,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateGroup = async (req: Request, res: Response) => {
  try {
    const group = await NaturalGroup.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true, runValidators: true }
    );

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    res.json({
      message: 'Group updated successfully',
      group,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteGroup = async (req: Request, res: Response) => {
  try {
    const group = await NaturalGroup.findById(req.params.id);
    
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    group.isActive = false;
    await group.save();

    res.json({ message: 'Group deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const joinGroup = async (req: AuthRequest, res: Response) => {
  try {
    const group = await NaturalGroup.findById(req.params.id);
    
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    const userId = req.user?._id;
    
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    const isMember = group.members.some(
      (memberId: mongoose.Types.ObjectId) => memberId.toString() === userId.toString()
    );
    
    if (isMember) {
      return res.status(400).json({ message: 'Already a member of this group' });
    }

    group.members.push(userId);
    await group.save();

    const updatedGroup = await NaturalGroup.findById(group._id)
      .populate('leader', 'name email')
      .populate('members', 'name email');

    res.json({
      message: 'Successfully joined the group',
      group: updatedGroup,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const leaveGroup = async (req: AuthRequest, res: Response) => {
  try {
    const group = await NaturalGroup.findById(req.params.id);
    
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    const userId = req.user?._id;
    
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    group.members = group.members.filter(
      (memberId: mongoose.Types.ObjectId) => memberId.toString() !== userId.toString()
    );
    await group.save();

    const updatedGroup = await NaturalGroup.findById(group._id)
      .populate('leader', 'name email')
      .populate('members', 'name email');

    res.json({
      message: 'Successfully left the group',
      group: updatedGroup,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};