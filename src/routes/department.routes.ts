import express from 'express';
import {
  getDepartments,
  getDepartment,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  addMember,
  removeMember,
} from '../controllers/department.controller';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();

// Public routes
router.get('/', getDepartments);
router.get('/:id', getDepartment);

// Protected routes
router.use(protect);

router.post('/', authorize('super_admin'), createDepartment);
router.put('/:id', authorize('super_admin'), updateDepartment);
router.delete('/:id', authorize('super_admin'), deleteDepartment);
router.post('/:id/members', authorize('super_admin', 'department_lead'), addMember);
router.delete('/:id/members/:userId', authorize('super_admin', 'department_lead'), removeMember);

export default router;