import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { protect } from '../middleware/auth';

const router = express.Router();

// Configure Cloudinary - This will run AFTER dotenv has loaded
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  }
});

// All upload routes require authentication
router.use(protect);

// Single file upload
router.post('/single', upload.single('file'), async (req: any, res: any) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const folder = req.body.folder || 'general';
    
    // Determine resource type
    let resourceType = 'auto';
    if (req.file.mimetype.startsWith('image/')) {
      resourceType = 'image';
    } else if (req.file.mimetype.startsWith('video/')) {
      resourceType = 'video';
    } else if (req.file.mimetype.startsWith('audio/')) {
      resourceType = 'video';
    }
    
    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `rccg-revelation/${folder}`,
          resource_type: resourceType,
        } as any,
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      );
      
      uploadStream.end(req.file.buffer);
    });

    res.json({
      message: 'File uploaded successfully',
      url: (result as any).secure_url,
      publicId: (result as any).public_id,
      format: (result as any).format,
    });
    
  } catch (error: any) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      message: error.message || 'Upload failed',
    });
  }
});

// Multiple files upload
router.post('/multiple', upload.array('files', 10), async (req: any, res: any) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const folder = req.body.folder || 'general';
    
    const uploadPromises = req.files.map(async (file: any) => {
      let resourceType = 'auto';
      if (file.mimetype.startsWith('image/')) {
        resourceType = 'image';
      } else if (file.mimetype.startsWith('video/')) {
        resourceType = 'video';
      } else if (file.mimetype.startsWith('audio/')) {
        resourceType = 'video';
      }
      
      return new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          {
            folder: `rccg-revelation/${folder}`,
            resource_type: resourceType,
          } as any,
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        ).end(file.buffer);
      });
    });
    
    const results = await Promise.all(uploadPromises);
    
    const files = results.map((result: any) => ({
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format,
    }));

    res.json({
      message: 'Files uploaded successfully',
      files,
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    res.status(500).json({ message: error.message || 'Upload failed' });
  }
});

export default router;