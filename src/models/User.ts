import mongoose, { Document, Schema, Model, CallbackError } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'super_admin' | 'province_pastor' | 'zonal_pastor' | 'area_pastor' | 'parish_pastor' | 'department_lead' | 'member';
  province?: string;
  zone?: string;
  area?: string;
  parish?: string;
  department?: string;
  phone?: string;
  photo?: string;
  isActive: boolean;
  isApproved: boolean;
  approvedBy?: mongoose.Types.ObjectId;
  approvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ['super_admin', 'province_pastor', 'zonal_pastor', 'area_pastor', 'parish_pastor', 'department_lead', 'member'],
      default: 'member',
    },
    province: { type: String },
    zone: { type: String },
    area: { type: String },
    parish: { type: String },
    department: { type: String },
    phone: { type: String },
    photo: { type: String },
    isActive: { type: Boolean, default: true },
    isApproved: { type: Boolean, default: false },
    approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    approvedAt: { type: Date },
  },
  { timestamps: true }
);

// Hash password before saving - Async version with proper typing
// userSchema.pre('save', async function(next) {
//   const user = this as any;
  
//   // Only hash if password is modified
//   if (!user.isModified('password')) {
//     return next();
//   }
  
//   try {
//     const salt = await bcrypt.genSalt(10);
//     user.password = await bcrypt.hash(user.password, salt);
//     next();
//   } catch (error: any) {
//     next(error);
//   }
// });

userSchema.pre('save', async function () {
  const user = this as IUser;

  // Only hash if password is modified
  if (!user.isModified('password')) return;

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', userSchema);












































// import mongoose, { Document, Schema, Model, CallbackError } from 'mongoose';
// import bcrypt from 'bcryptjs';

// export interface IUser extends Document {
//   name: string;
//   email: string;
//   password: string;
//   role: 'super_admin' | 'province_pastor' | 'zonal_pastor' | 'area_pastor' | 'parish_pastor' | 'department_lead' | 'member';
//   province?: string;
//   zone?: string;
//   area?: string;
//   parish?: string;
//   department?: string;
//   phone?: string;
//   photo?: string;
//   isActive: boolean;
//   isApproved: boolean;
//   approvedBy?: mongoose.Types.ObjectId;
//   approvedAt?: Date;
//   createdAt: Date;
//   updatedAt: Date;
//   comparePassword(candidatePassword: string): Promise<boolean>;
// }

// const userSchema = new Schema<IUser>(
//   {
//     name: { type: String, required: true },
//     email: { type: String, required: true, unique: true, lowercase: true },
//     password: { type: String, required: true },
//     role: {
//       type: String,
//       enum: ['super_admin', 'province_pastor', 'zonal_pastor', 'area_pastor', 'parish_pastor', 'department_lead', 'member'],
//       default: 'member',
//     },
//     province: { type: String },
//     zone: { type: String },
//     area: { type: String },
//     parish: { type: String },
//     department: { type: String },
//     phone: { type: String },
//     photo: { type: String },
//     isActive: { type: Boolean, default: true },
//     isApproved: { type: Boolean, default: false },
//     approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
//     approvedAt: { type: Date },
//   },
//   { timestamps: true }
// );

// // Hash password before saving - FIXED with proper typing
// userSchema.pre('save', function(next) {
//   const user = this as any;
  
//   // Only hash if password is modified
//   if (!user.isModified('password')) {
//     return next();
//   }
  
//   bcrypt.genSalt(10, (err: Error | undefined, salt: string) => {
//     if (err) return next(err);
    
//     bcrypt.hash(user.password, salt, (err: Error | undefined, hash: string) => {
//       if (err) return next(err);
//       user.password = hash;
//       next();
//     });
//   });
// });

// // Compare password method
// userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
//   return bcrypt.compare(candidatePassword, this.password);
// };

// export const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', userSchema);































































// import mongoose, { Document, Schema, Model } from 'mongoose';
// import bcrypt from 'bcryptjs';

// export interface IUser extends Document {
//   name: string;
//   email: string;
//   password: string;
//   role: 'super_admin' | 'province_pastor' | 'zonal_pastor' | 'area_pastor' | 'parish_pastor' | 'department_lead' | 'member';
//   province?: string;
//   zone?: string;
//   area?: string;
//   parish?: string;
//   department?: string;
//   phone?: string;
//   photo?: string;
//   isActive: boolean;
//   isApproved: boolean; // For pastors who need admin approval
//   approvedBy?: mongoose.Types.ObjectId;
//   approvedAt?: Date;
//   createdAt: Date;
//   updatedAt: Date;
//   comparePassword(candidatePassword: string): Promise<boolean>;
// }

// const userSchema = new Schema<IUser>(
//   {
//     name: { type: String, required: true },
//     email: { type: String, required: true, unique: true, lowercase: true },
//     password: { type: String, required: true },
//     role: {
//       type: String,
//       enum: ['super_admin', 'province_pastor', 'zonal_pastor', 'area_pastor', 'parish_pastor', 'department_lead', 'member'],
//       default: 'member',
//     },
//     province: { type: String },
//     zone: { type: String },
//     area: { type: String },
//     parish: { type: String },
//     department: { type: String },
//     phone: { type: String },
//     photo: { type: String },
//     isActive: { type: Boolean, default: true },
//     isApproved: { type: Boolean, default: false }, // Default false for non-member roles
//     approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
//     approvedAt: { type: Date },
//   },
//   { timestamps: true }
// );

// // Hash password before saving - FIXED
// userSchema.pre('save', async function(next) {
//   const user = this;
  
//   // Only hash if password is modified
//   if (!user.isModified('password')) {
//     return next();
//   }
  
//   try {
//     const salt = await bcrypt.genSalt(10);
//     user.password = await bcrypt.hash(user.password, salt);
//     next();
//   } catch (error: any) {
//     next(error);
//   }
// });

// // Compare password method
// userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
//   return bcrypt.compare(candidatePassword, this.password);
// };

// export const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', userSchema);































































// import mongoose, { Document, Schema, Model } from 'mongoose';
// import { hashPassword, comparePassword } from '../utils/password';

// export interface IUser extends Document {
//   name: string;
//   email: string;
//   password: string;
//   role: 'super_admin' | 'province_pastor' | 'zonal_pastor' | 'area_pastor' | 'parish_pastor' | 'department_lead' | 'member';
//   province?: string;
//   zone?: string;
//   area?: string;
//   parish?: string;
//   department?: string;
//   phone?: string;
//   photo?: string;
//   isActive: boolean;
//   createdAt: Date;
//   updatedAt: Date;
//   comparePassword(candidatePassword: string): Promise<boolean>;
// }

// const userSchema = new Schema<IUser>(
//   {
//     name: { type: String, required: true },
//     email: { type: String, required: true, unique: true, lowercase: true },
//     password: { type: String, required: true },
//     role: {
//       type: String,
//       enum: ['super_admin', 'province_pastor', 'zonal_pastor', 'area_pastor', 'parish_pastor', 'department_lead', 'member'],
//       default: 'member',
//     },
//     province: { type: String },
//     zone: { type: String },
//     area: { type: String },
//     parish: { type: String },
//     department: { type: String },
//     phone: { type: String },
//     photo: { type: String },
//     isActive: { type: Boolean, default: true },
//   },
//   { timestamps: true }
// );

// // Hash password before saving - Using regular function with any type
// userSchema.pre('save', function(this: any, next: any) {
//   const user = this;
  
//   // Only hash if password is modified
//   if (!user.isModified('password')) {
//     return next();
//   }
  
//   // Use the password utility with promise
//   hashPassword(user.password)
//     .then((hashedPassword: string) => {
//       user.password = hashedPassword;
//       next();
//     })
//     .catch((error: Error) => {
//       next(error);
//     });
// });

// // Compare password method
// userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
//   return comparePassword(candidatePassword, this.password);
// };

// export const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', userSchema);