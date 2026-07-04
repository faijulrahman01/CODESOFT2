import express from 'express';
import {
  applyToJob,
  getMyApplications,
  getApplicationsForJob,
  updateApplicationStatus,
  scheduleInterview,
} from '../controllers/applicationController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/multerMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, authorize('candidate'), upload.single('resume'), applyToJob);

router.get('/my-applications', protect, authorize('candidate'), getMyApplications);
router.get('/job/:jobId', protect, authorize('employer', 'admin'), getApplicationsForJob);

router.put('/:id/status', protect, authorize('employer', 'admin'), updateApplicationStatus);
router.put('/:id/schedule', protect, authorize('employer', 'admin'), scheduleInterview);

export default router;
