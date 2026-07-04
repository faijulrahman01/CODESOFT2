import express from 'express';
import { body } from 'express-validator';
import {
  getJobs,
  getMyJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
} from '../controllers/jobController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

const jobValidation = [
  body('title', 'Job title is required').notEmpty(),
  body('description', 'Job description is required').notEmpty(),
  body('location', 'Location description is required').notEmpty(),
];

// Public search/read routes
router.route('/')
  .get(getJobs)
  .post(protect, authorize('employer', 'admin'), jobValidation, createJob);

// Employer listings route
router.get('/my-jobs', protect, authorize('employer', 'admin'), getMyJobs);

// Single item routes
router.route('/:id')
  .get(getJobById)
  .put(protect, authorize('employer', 'admin'), updateJob)
  .delete(protect, authorize('employer', 'admin'), deleteJob);

export default router;
