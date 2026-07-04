import Bookmark from '../models/Bookmark.js';
import Job from '../models/Job.js';

// @desc    Get all bookmarked jobs for candidate
// @route   GET /api/bookmarks
// @access  Private (Candidate)
export const getBookmarks = async (req, res, next) => {
  try {
    const bookmarks = await Bookmark.find({ candidate: req.user.id })
      .populate({
        path: 'job',
        populate: {
          path: 'company',
          select: 'name logo location sector',
        },
      })
      .sort({ bookmarkedAt: -1 });

    res.json({ success: true, count: bookmarks.length, data: bookmarks });
  } catch (error) {
    next(error);
  }
};

// @desc    Add a job listing to bookmarks
// @route   POST /api/bookmarks
// @access  Private (Candidate)
export const addBookmark = async (req, res, next) => {
  try {
    const { jobId } = req.body;

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job listing not found' });
    }

    // Check if already bookmarked
    const alreadyBookmarked = await Bookmark.findOne({ job: jobId, candidate: req.user.id });
    if (alreadyBookmarked) {
      return res.status(400).json({ success: false, message: 'Job is already bookmarked' });
    }

    const bookmark = new Bookmark({
      job: jobId,
      candidate: req.user.id,
    });

    const savedBookmark = await bookmark.save();

    res.status(201).json({
      success: true,
      message: 'Job bookmarked successfully!',
      data: savedBookmark,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a bookmark
// @route   DELETE /api/bookmarks/:id
// @access  Private (Candidate)
export const deleteBookmark = async (req, res, next) => {
  try {
    const bookmark = await Bookmark.findById(req.params.id);
    if (!bookmark) {
      return res.status(404).json({ success: false, message: 'Bookmark not found' });
    }

    // Ownership check
    if (bookmark.candidate.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'User not authorized' });
    }

    await bookmark.deleteOne();

    res.json({
      success: true,
      message: 'Bookmark removed successfully!',
    });
  } catch (error) {
    next(error);
  }
};
