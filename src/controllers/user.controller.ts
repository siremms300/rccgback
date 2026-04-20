import { Request, Response } from 'express';
import { User } from '../models/User';

export const getUsers = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;
    const role = req.query.role as string;
    const search = req.query.search as string;

    let query: any = {};
    
    if (role) query.role = role;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(query);

    res.json({
      users,
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

export const getUser = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create(req.body);
    
    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'User updated successfully',
      user,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Soft delete
    user.isActive = false;
    await user.save();

    res.json({ message: 'User deactivated successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateUserStatus = async (req: Request, res: Response) => {
  try {
    const { isActive } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      user,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};


// Get users pending approval
export const getPendingUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find({
      isApproved: false,
      role: { $nin: ['member', 'super_admin'] }
    }).select('-password').sort({ createdAt: -1 });

    res.json({ users });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Approve user
export const approveUser = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isApproved = true;
    user.isActive = true;
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




// Get pending users for approval
// export const getPendingUsers = async (req: Request, res: Response) => {
//   try {
//     const users = await User.find({
//       isApproved: false,
//       role: { $nin: ['member', 'super_admin'] }
//     }).select('-password').sort({ createdAt: -1 });

//     res.json({ users });
//   } catch (error: any) {
//     res.status(500).json({ message: error.message });
//   }
// };

// // Approve user
// export const approveUser = async (req: Request, res: Response) => {
//   try {
//     const user = await User.findById(req.params.id);
    
//     if (!user) {
//       return res.status(404).json({ message: 'User not found' });
//     }

//     user.isApproved = true;
//     user.isActive = true;
//     user.approvedBy = new mongoose.Types.ObjectId(req.user?._id);
//     user.approvedAt = new Date();
//     await user.save();

//     res.json({
//       message: 'User approved successfully',
//       user: {
//         id: user._id,
//         name: user.name,
//         email: user.email,
//         role: user.role,
//       }
//     });
//   } catch (error: any) {
//     res.status(500).json({ message: error.message });
//   }
// };

// Get users by role
export const getUsersByRole = async (req: Request, res: Response) => {
  try {
    const { role } = req.params;
    const users = await User.find({ role, isActive: true })
      .select('name email')
      .sort({ name: 1 });

    res.json({ users });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};