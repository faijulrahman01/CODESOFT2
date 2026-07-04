import User from '../models/User.js';
import Job from '../models/Job.js';
import Company from '../models/Company.js';
import Application from '../models/Application.js';

// @desc    Get admin statistics
// @route   GET /api/admin/stats
// @access  Private (Admin)
export const getAdminStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const candidatesCount = await User.countDocuments({ role: 'candidate' });
    const employersCount = await User.countDocuments({ role: 'employer' });
    const adminsCount = await User.countDocuments({ role: 'admin' });

    const totalJobs = await Job.countDocuments();
    const activeJobs = await Job.countDocuments({ isClosed: false });
    const totalCompanies = await Company.countDocuments();
    const totalApplications = await Application.countDocuments();

    res.json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          candidates: candidatesCount,
          employers: employersCount,
          admins: adminsCount,
        },
        jobs: {
          total: totalJobs,
          active: activeJobs,
        },
        totalCompanies,
        totalApplications,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Admin)
export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find()
      .populate('company', 'name website')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all jobs
// @route   GET /api/admin/jobs
// @access  Private (Admin)
export const getAllJobs = async (req, res, next) => {
  try {
    const jobs = await Job.find()
      .populate('company', 'name')
      .populate('creator', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: jobs });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin)
export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ success: false, message: 'Administrator accounts cannot be deleted' });
    }

    // If employer, delete their company
    if (user.role === 'employer') {
      await Company.deleteMany({ creator: user._id });
    }

    // Delete related jobs and applications
    await Job.deleteMany({ creator: user._id });
    await Application.deleteMany({ candidate: user._id });

    await user.deleteOne();

    res.json({ success: true, message: 'User profile and related documents removed successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a job
// @route   DELETE /api/admin/jobs/:id
// @access  Private (Admin)
export const deleteJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job listing not found' });
    }

    // Cascade delete related applications
    await Application.deleteMany({ job: job._id });

    await job.deleteOne();

    res.json({ success: true, message: 'Job listing removed successfully' });
  } catch (error) {
    next(error);
  }
};
