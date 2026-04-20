import express from 'express';
import { protect, authorize } from '../middleware/auth';
import { getPendingApprovals, approveUser, rejectUser } from '../controllers/admin.controller';

const router = express.Router();

// All routes require super admin
router.use(protect);
router.use(authorize('super_admin'));

router.get('/pending-approvals', getPendingApprovals);
router.post('/approve/:id', approveUser);
router.delete('/reject/:id', rejectUser);

export default router;