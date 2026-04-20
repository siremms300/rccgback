import dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';

dotenv.config({ path: '.env' });

const testCloudinary = async () => {
  console.log('Testing Cloudinary Configuration...\n');
  
  console.log('Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME);
  console.log('API Key:', process.env.CLOUDINARY_API_KEY ? '✓ Set' : '✗ Missing');
  console.log('API Secret:', process.env.CLOUDINARY_API_SECRET ? '✓ Set' : '✗ Missing');
  
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    console.error('\n❌ Missing Cloudinary credentials in .env file');
    process.exit(1);
  }
  
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  
  try {
    // Test the connection by getting account usage
    const result = await cloudinary.api.ping();
    console.log('\n✅ Cloudinary connection successful!');
    console.log('Response:', result);
  } catch (error: any) {
    console.error('\n❌ Cloudinary connection failed:', error.message);
    process.exit(1);
  }
};

testCloudinary();