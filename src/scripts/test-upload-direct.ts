import dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';

dotenv.config({ path: '.env' });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Create a simple test image (1x1 pixel PNG)
const testImageBuffer = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64'
);

const uploadToCloudinary = async () => {
  console.log('Uploading test image...');
  
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'rccg-revelation/test',
        resource_type: 'image',
      },
      (error, result) => {
        if (error) {
          console.error('Upload error:', error);
          reject(error);
        } else {
          console.log('Upload success!');
          console.log('URL:', result?.secure_url);
          resolve(result);
        }
      }
    );
    
    uploadStream.end(testImageBuffer);
  });
};

uploadToCloudinary()
  .then(() => console.log('✅ Test complete'))
  .catch((error) => console.error('❌ Test failed:', error));