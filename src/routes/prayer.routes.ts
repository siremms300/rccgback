import express from 'express';
import {
  getPrayerRequests,
  getPrayerRequest,
  createPrayerRequest,
  updatePrayerRequest,
  deletePrayerRequest,
  assignPrayerRequest,
  updatePrayerStatus,
} from '../controllers/prayer.controller';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();

// Public routes
router.post('/', createPrayerRequest);
router.get('/public', getPrayerRequests);

// Protected routes
router.get('/', protect, authorize('super_admin', 'province_pastor'), getPrayerRequests);
router.get('/:id', protect, getPrayerRequest);
router.put('/:id', protect, authorize('super_admin', 'province_pastor'), updatePrayerRequest);
router.delete('/:id', protect, authorize('super_admin', 'province_pastor'), deletePrayerRequest);
router.post('/:id/assign', protect, authorize('super_admin', 'province_pastor'), assignPrayerRequest);
router.patch('/:id/status', protect, authorize('super_admin', 'province_pastor'), updatePrayerStatus);

export default router;