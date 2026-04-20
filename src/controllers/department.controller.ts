import { Request, Response } from 'express';
import { Department } from '../models/Department';
import { AuthRequest } from '../middleware/auth';
import mongoose from 'mongoose';

export const getDepartments = async (req: Request, res: Response) => {
  try {
    const departments = await Department.find({ isActive: true })
      .populate('leader', 'name email')
      .populate('members', 'name email')
      .sort({ name: 1 });

    res.json({ departments });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getDepartment = async (req: Request, res: Response) => {
  try {
    const department = await Department.findById(req.params.id)
      .populate('leader', 'name email phone')
      .populate('members', 'name email phone');

    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }

    res.json({ department });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createDepartment = async (req: AuthRequest, res: Response) => {
  try {
    const department = await Department.create(req.body);

    res.status(201).json({
      message: 'Department created successfully',
      department,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateDepartment = async (req: Request, res: Response) => {
  try {
    const department = await Department.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true, runValidators: true }
    );

    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }

    res.json({
      message: 'Department updated successfully',
      department,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteDepartment = async (req: Request, res: Response) => {
  try {
    const department = await Department.findById(req.params.id);
    
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }

    department.isActive = false;
    await department.save();

    res.json({ message: 'Department deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const addMember = async (req: AuthRequest, res: Response) => {
  try {
    const department = await Department.findById(req.params.id);
    
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }

    const { userId } = req.body;
    
    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }
    
    const isMember = department.members.some(
      (memberId) => memberId.toString() === userId
    );
    
    if (isMember) {
      return res.status(400).json({ message: 'User already in department' });
    }

    department.members.push(new mongoose.Types.ObjectId(userId));
    await department.save();

    const updatedDepartment = await Department.findById(department._id)
      .populate('leader', 'name email')
      .populate('members', 'name email');

    res.json({
      message: 'Member added successfully',
      department: updatedDepartment,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const removeMember = async (req: Request, res: Response) => {
  try {
    const department = await Department.findById(req.params.id);
    
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }

    let userId: string;
    if (typeof req.params.userId === 'string') {
      userId = req.params.userId;
    } else if (Array.isArray(req.params.userId)) {
      userId = req.params.userId[0];
    } else {
      return res.status(400).json({ message: 'Invalid user ID parameter' });
    }
    
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }
    
    department.members = department.members.filter(
      (memberId: mongoose.Types.ObjectId) => memberId.toString() !== userId
    );
    await department.save();

    const updatedDepartment = await Department.findById(department._id)
      .populate('leader', 'name email')
      .populate('members', 'name email');

    res.json({
      message: 'Member removed successfully',
      department: updatedDepartment,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};