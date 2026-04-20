import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { User } from '../models/User';

dotenv.config({ path: '.env' });

const testLogin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log('Connected to MongoDB\n');

    // Your credentials from the database
    const email = 'siremms300@gmail.com';
    const password = 'Scoversedu1@'; // The password from your database

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      console.log('❌ User not found!');
      process.exit(1);
    }

    console.log('✅ User found!');
    console.log('Email:', user.email);
    console.log('Name:', user.name);
    console.log('Role:', user.role);
    console.log('Active:', user.isActive);
    console.log('Stored password hash:', user.password);
    console.log('Password hash length:', user.password.length);
    console.log('\n--- Testing Password ---\n');
    
    // Test with bcrypt directly
    const isMatch = await bcrypt.compare(password, user.password);
    console.log(`Direct bcrypt compare: ${isMatch ? '✅ PASSED' : '❌ FAILED'}`);
    
    if (isMatch) {
      console.log('\n🎉 Password is correct! Login will work!');
      
      // Test with model method
      const modelMatch = await user.comparePassword(password);
      console.log(`Model comparePassword: ${modelMatch ? '✅ PASSED' : '❌ FAILED'}`);
      
      // Generate a test token
      const jwt = await import('jsonwebtoken');
      const token = jwt.default.sign(
        { id: user._id.toString(), email: user.email, role: user.role },
        process.env.JWT_SECRET!,
        { expiresIn: '7d' }
      );
      console.log('\n📝 Test token generated:', token.substring(0, 50) + '...');
    } else {
      console.log('\n❌ Password mismatch!');
      console.log('The password stored in the database does not match the password you entered.');
      console.log('This could be due to:');
      console.log('1. Password was hashed with a different method');
      console.log('2. Password was entered incorrectly in the database');
      console.log('3. There might be hidden characters in the password');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

testLogin(); 