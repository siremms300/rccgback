import express from 'express';
import {
  getGroups,
  getGroup,
  createGroup,
  updateGroup,
  deleteGroup,
  joinGroup,
  leaveGroup,
} from '../controllers/group.controller';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();

// Public routes
router.get('/', getGroups);
router.get('/:id', getGroup);

// Protected routes
router.use(protect);

router.post('/', authorize('super_admin', 'province_pastor'), createGroup);
router.put('/:id', authorize('super_admin', 'province_pastor'), updateGroup);
router.delete('/:id', authorize('super_admin', 'province_pastor'), deleteGroup);
router.post('/:id/join', joinGroup);
router.post('/:id/leave', leaveGroup);

export default router;