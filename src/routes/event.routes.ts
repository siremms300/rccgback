import express from 'express';
import {
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  registerForEvent,
  getEventAttendees,
} from '../controllers/event.controller';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();

// Public routes
router.get('/', getEvents);
router.get('/:id', getEvent);

// Protected routes
router.use(protect);

router.post('/', authorize('super_admin', 'province_pastor', 'zonal_pastor', 'area_pastor', 'parish_pastor'), createEvent);
router.put('/:id', authorize('super_admin', 'province_pastor', 'zonal_pastor', 'area_pastor', 'parish_pastor'), updateEvent);
router.delete('/:id', authorize('super_admin', 'province_pastor', 'zonal_pastor', 'area_pastor', 'parish_pastor'), deleteEvent);
router.post('/:id/register', registerForEvent);
router.get('/:id/attendees', authorize('super_admin', 'province_pastor'), getEventAttendees);

export default router;