import express from 'express';
import {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  updateUserStatus,
  getPendingUsers,
  approveUser,
  getUsersByRole,
} from '../controllers/user.controller';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();

// All user routes require authentication
router.use(protect);
router.use(authorize('super_admin')); // Only super admin can manage users

router.get('/', getUsers);
router.get('/pending', getPendingUsers);
router.post('/', createUser);
router.get('/:id', getUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);
router.patch('/:id/status', updateUserStatus);
router.post('/:id/approve', approveUser);
router.get('/role/:role', getUsersByRole)



export default router;










































// import express from 'express';
// import {
//   getUsers,
//   getUser,
//   createUser,
//   updateUser,
//   deleteUser,
//   updateUserStatus,
// } from '../controllers/user.controller';
// import { protect, authorize } from '../middleware/auth';

// const router = express.Router();

// // All user routes require authentication
// router.use(protect);
// router.use(authorize('super_admin')); // Only super admin can manage users

// router.get('/', getUsers);
// router.post('/', createUser);
// router.get('/:id', getUser);
// router.put('/:id', updateUser);
// router.delete('/:id', deleteUser);
// router.patch('/:id/status', updateUserStatus);

// export default router;