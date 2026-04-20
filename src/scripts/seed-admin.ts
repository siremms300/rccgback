import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../models/User';

dotenv.config({ path: '.env' });

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);

    const adminEmail = process.env.ADMIN_EMAIL || 'siremms300@gmail.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Scoversedu1@';

    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      console.log('Admin user already exists');
      process.exit(0);
    }

    await User.create({
      name: 'Super Admin',
      email: adminEmail,
      password: adminPassword,
      role: 'super_admin',
      isActive: true,
    });

    console.log('Admin user created successfully');
    console.log(`Email: ${adminEmail}`);
    console.log(`Password: ${adminPassword}`);
    console.log('Please change the password after first login');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin:', error);
    process.exit(1);
  }
};

seedAdmin();