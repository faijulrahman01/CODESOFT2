import express from 'express';
import {
  getBookmarks,
  addBookmark,
  deleteBookmark,
} from '../controllers/bookmarkController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Enforce candidate access on bookmarks
router.use(protect, authorize('candidate'));

router.route('/')
  .get(getBookmarks)
  .post(addBookmark);

router.delete('/:id', deleteBookmark);

export default router;
