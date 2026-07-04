import express from 'express';
import {
  submitQuizResult,
  getMyResults,
  getLeaderboard,
  getDashboardStats,
} from '../controllers/resultController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .post(protect, submitQuizResult);

router.route('/my')
  .get(protect, getMyResults);

router.route('/leaderboard')
  .get(getLeaderboard);

router.route('/dashboard/stats')
  .get(protect, getDashboardStats);

export default router;
