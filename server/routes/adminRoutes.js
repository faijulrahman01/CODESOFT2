import express from 'express';
import {
  getAdminStats,
  getAllUsers,
  getAllJobs,
  deleteUser,
  deleteJob,
} from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Enforce admin privileges globally on this router
router.use(protect, authorize('admin'));

router.get('/stats', getAdminStats);
router.get('/users', getAllUsers);
router.get('/jobs', getAllJobs);

router.delete('/users/:id', deleteUser);
router.delete('/jobs/:id', deleteJob);

export default router;
