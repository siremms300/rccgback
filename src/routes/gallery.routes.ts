import express from 'express';
import {
  getGalleryItems,
  getGalleryItem,
  createGalleryItem,
  updateGalleryItem,
  deleteGalleryItem,
  getAlbums,
} from '../controllers/gallery.controller';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();

// Public routes
router.get('/', getGalleryItems);
router.get('/albums', getAlbums);
router.get('/:id', getGalleryItem);

// Protected routes
router.use(protect);

router.post('/', authorize('super_admin', 'province_pastor', 'media'), createGalleryItem);
router.put('/:id', authorize('super_admin', 'province_pastor', 'media'), updateGalleryItem);
router.delete('/:id', authorize('super_admin', 'province_pastor', 'media'), deleteGalleryItem);

export default router;