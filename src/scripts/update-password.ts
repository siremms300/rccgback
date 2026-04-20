import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { User } from '../models/User';

dotenv.config({ path: '.env' });

const updatePassword = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log('Connected to MongoDB\n');

    const email = 'siremms300@gmail.com';
    const plainPassword = 'Scoversedu1@';

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      console.log('❌ User not found!');
      process.exit(1);
    }

    console.log('User found:', user.email);
    console.log('Current password (plain text):', user.password);
    console.log('\n--- Hashing Password ---\n');

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(plainPassword, salt);
    
    console.log('Generated hash:', hashedPassword);
    console.log('Hash length:', hashedPassword.length);
    
    // Update user with hashed password
    user.password = hashedPassword;
    await user.save();
    
    console.log('\n✅ Password has been updated successfully!');
    
    // Verify the new hash works
    const verifyMatch = await bcrypt.compare(plainPassword, user.password);
    console.log(`\nVerification test: ${verifyMatch ? '✅ PASSED' : '❌ FAILED'}`);
    
    if (verifyMatch) {
      console.log('\n🎉 SUCCESS! Login will now work with:');
      console.log(`   Email: ${email}`);
      console.log(`   Password: ${plainPassword}`);
      console.log('\nThe password has been properly hashed in the database.');
    } else {
      console.log('\n❌ Something went wrong with the hashing.');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

updatePassword();