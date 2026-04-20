import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary';

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req: any, file: any) => {
    let folder = 'rccg-revelation/general';
    
    if (req.body.folder === 'teachings') {
      folder = 'rccg-revelation/teachings';
    } else if (req.body.folder === 'gallery') {
      folder = 'rccg-revelation/gallery';
    } else if (req.body.folder === 'events') {
      folder = 'rccg-revelation/events';
    }
    
    return {
      folder: folder,
      allowed_formats: ['jpg', 'jpeg', 'png', 'mp4', 'mp3', 'pdf'],
      resource_type: 'auto',
    };
  },
});

export const upload = multer({ storage: storage });