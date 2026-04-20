import express from 'express';
import {
  getTeachings,
  getTeaching,
  createTeaching,
  updateTeaching,
  deleteTeaching,
  incrementDownload,
} from '../controllers/teaching.controller';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();

router.get('/', getTeachings);
router.get('/:id', getTeaching);
router.post('/:id/download', incrementDownload);

// Protected routes
router.use(protect);
router.post(
  '/',
  authorize('super_admin', 'province_pastor', 'zonal_pastor', 'area_pastor', 'parish_pastor'),
  createTeaching
);
router.put('/:id', updateTeaching);
router.delete('/:id', deleteTeaching);

export default router;