import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/User';
import { AuthRequest } from '../middleware/auth';

// Generate JWT token
const generateToken = (id: string): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not defined');
  }
  
  const expiresIn = process.env.JWT_EXPIRE || '7d';
  
  return jwt.sign({ id }, secret, {
    expiresIn: expiresIn,
  } as jwt.SignOptions);
};

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role, province, zone, area, parish, department, phone } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Determine if approval is needed (non-member roles need approval)
    const needsApproval = role !== 'member' && role !== 'super_admin';
    
    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'member',
      province,
      zone,
      area,
      parish,
      department,
      phone,
      isActive: role === 'member' || role === 'super_admin' ? true : false,
      isApproved: !needsApproval,
    });

    // Generate token
    const token = generateToken(user._id.toString());

    res.status(201).json({
      message: needsApproval 
        ? 'Registration successful! Your account is pending admin approval.' 
        : 'User created successfully',
      token: !needsApproval ? token : undefined,
      needsApproval,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        province: user.province,
        zone: user.zone,
        area: user.area,
        parish: user.parish,
        isApproved: user.isApproved,
        isActive: user.isActive,
      },
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(500).json({ message: error.message || 'Registration failed' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(401).json({ message: 'Your account has been disabled. Please contact admin.' });
    }

    // Check if account needs approval
    if (!user.isApproved && user.role !== 'member' && user.role !== 'super_admin') {
      return res.status(403).json({ 
        message: 'Your account is pending admin approval. You will receive an email once approved.' 
      });
    }

    // Generate token
    const token = generateToken(user._id.toString());

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        province: user.province,
        zone: user.zone,
        area: user.area,
        parish: user.parish,
        department: user.department,
        phone: user.phone,
        photo: user.photo,
        isApproved: user.isApproved,
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ message: error.message || 'Login failed' });
  }
};

export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    const user = await User.findById(req.user._id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ 
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        province: user.province,
        zone: user.zone,
        area: user.area,
        parish: user.parish,
        department: user.department,
        phone: user.phone,
        photo: user.photo,
        isActive: user.isActive,
        isApproved: user.isApproved,
      }
    });
  } catch (error: any) {
    console.error('GetMe error:', error);
    res.status(500).json({ message: error.message || 'Failed to get user data' });
  }
};

















































// import { Request, Response } from 'express';
// import jwt from 'jsonwebtoken';
// import { User, IUser } from '../models/User';
// import { AuthRequest } from '../middleware/auth';

// // Generate JWT token
// const generateToken = (id: string): string => {
//   const secret = process.env.JWT_SECRET;
//   if (!secret) {
//     throw new Error('JWT_SECRET is not defined');
//   }
  
//   const expiresIn = process.env.JWT_EXPIRE || '7d';
  
//   return jwt.sign({ id }, secret, {
//     expiresIn: expiresIn,
//   } as jwt.SignOptions);
// };

// export const register = async (req: Request, res: Response) => {
//   try {
//     const { name, email, password, role, province, zone, area, parish, department } = req.body;

//     // Check if user exists
//     const userExists = await User.findOne({ email });
//     if (userExists) {
//       return res.status(400).json({ message: 'User already exists' });
//     }

//     // Create user
//     const user = await User.create({
//       name,
//       email,
//       password,
//       role: role || 'member',
//       province,
//       zone,
//       area,
//       parish,
//       department,
//     });

//     // Generate token - convert ObjectId to string
//     const token = generateToken(user._id.toString());

//     res.status(201).json({
//       message: 'User created successfully',
//       token,
//       user: {
//         id: user._id.toString(),
//         name: user.name,
//         email: user.email,
//         role: user.role,
//         province: user.province,
//         zone: user.zone,
//         area: user.area,
//         parish: user.parish,
//       },
//     });
//   } catch (error: any) {
//     console.error('Registration error:', error);
//     res.status(500).json({ message: error.message || 'Registration failed' });
//   }
// };

// export const login = async (req: Request, res: Response) => {
//   try {
//     const { email, password } = req.body;

//     // Find user
//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(401).json({ message: 'Invalid credentials' });
//     }

//     // Check password
//     const isPasswordMatch = await user.comparePassword(password);
//     if (!isPasswordMatch) {
//       return res.status(401).json({ message: 'Invalid credentials' });
//     }

//     // Check if account is active
//     if (!user.isActive) {
//       return res.status(401).json({ message: 'Account is disabled' });
//     }

//     // Generate token - convert ObjectId to string
//     const token = generateToken(user._id.toString());

//     res.json({
//       message: 'Login successful',
//       token,
//       user: {
//         id: user._id.toString(),
//         name: user.name,
//         email: user.email,
//         role: user.role,
//         province: user.province,
//         zone: user.zone,
//         area: user.area,
//         parish: user.parish,
//         department: user.department,
//         photo: user.photo,
//       },
//     });
//   } catch (error: any) {
//     console.error('Login error:', error);
//     res.status(500).json({ message: error.message || 'Login failed' });
//   }
// };

// export const getMe = async (req: AuthRequest, res: Response) => {
//   try {
//     if (!req.user) {
//       return res.status(401).json({ message: 'Not authenticated' });
//     }
    
//     const user = await User.findById(req.user._id).select('-password');
    
//     if (!user) {
//       return res.status(404).json({ message: 'User not found' });
//     }
    
//     res.json({ 
//       user: {
//         id: user._id.toString(),
//         name: user.name,
//         email: user.email,
//         role: user.role,
//         province: user.province,
//         zone: user.zone,
//         area: user.area,
//         parish: user.parish,
//         department: user.department,
//         phone: user.phone,
//         photo: user.photo,
//         isActive: user.isActive,
//       }
//     });
//   } catch (error: any) {
//     console.error('GetMe error:', error);
//     res.status(500).json({ message: error.message || 'Failed to get user data' });
//   }
// };