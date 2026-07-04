import { validationResult } from 'express-validator';
import Job from '../models/Job.js';
import Company from '../models/Company.js';

// @desc    Get all jobs (public, with filter support)
// @route   GET /api/jobs
// @access  Public
export const getJobs = async (req, res, next) => {
  try {
    const { search, location, category, type, remoteType, experienceLevel, salaryMin, page = 1, limit = 10 } = req.query;

    const query = { isClosed: false };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    if (type) {
      query.type = type;
    }

    if (remoteType) {
      query.remoteType = remoteType;
    }

    if (experienceLevel) {
      query.experienceLevel = experienceLevel;
    }

    if (salaryMin) {
      query.salaryMax = { $gte: Number(salaryMin) };
    }

    const skipIndex = (page - 1) * limit;

    const jobs = await Job.find(query)
      .populate('company', 'name logo location website sector')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip(Number(skipIndex));

    const total = await Job.countDocuments(query);

    res.json({
      success: true,
      count: jobs.length,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      data: jobs,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current employer's jobs
// @route   GET /api/jobs/my-jobs
// @access  Private (Employer/Admin)
export const getMyJobs = async (req, res, next) => {
  try {
    const jobs = await Job.find({ creator: req.user.id })
      .populate('company', 'name logo sector')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: jobs });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single job by ID
// @route   GET /api/jobs/:id
// @access  Public
export const getJobById = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('company', 'name logo website location sector employeesCount description')
      .populate('creator', 'name email');

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job listing not found' });
    }

    res.json({ success: true, data: job });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a job listing
// @route   POST /api/jobs
// @access  Private (Employer/Admin)
export const createJob = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { 
      title, description, requirements, skills, type, 
      remoteType, location, salaryMin, salaryMax, experienceLevel, deadline 
    } = req.body;

    // Fetch the employer's company profile
    const companyProfile = await Company.findOne({ creator: req.user.id });
    if (!companyProfile) {
      return res.status(400).json({ 
        success: false, 
        message: 'No company profile found. Please register your company first before posting jobs.' 
      });
    }

    const job = new Job({
      title,
      description,
      requirements: Array.isArray(requirements) ? requirements : JSON.parse(requirements || '[]'),
      skills: Array.isArray(skills) ? skills : JSON.parse(skills || '[]'),
      company: companyProfile._id,
      creator: req.user.id,
      type,
      remoteType,
      location,
      salaryMin: Number(salaryMin) || 0,
      salaryMax: Number(salaryMax) || 0,
      experienceLevel,
      deadline: deadline ? new Date(deadline) : null,
    });

    const savedJob = await job.save();

    res.status(201).json({
      success: true,
      message: 'Job listing posted successfully!',
      data: savedJob,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a job listing
// @route   PUT /api/jobs/:id
// @access  Private (Creator/Admin)
export const updateJob = async (req, res, next) => {
  try {
    let job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job listing not found' });
    }

    // Enforce ownership check
    if (job.creator.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'User not authorized to update this listing' });
    }

    const { 
      title, description, requirements, skills, type, 
      remoteType, location, salaryMin, salaryMax, experienceLevel, deadline, isClosed 
    } = req.body;

    job.title = title || job.title;
    job.description = description || job.description;
    job.type = type || job.type;
    job.remoteType = remoteType || job.remoteType;
    job.location = location || job.location;
    job.salaryMin = salaryMin !== undefined ? Number(salaryMin) : job.salaryMin;
    job.salaryMax = salaryMax !== undefined ? Number(salaryMax) : job.salaryMax;
    job.experienceLevel = experienceLevel || job.experienceLevel;
    job.isClosed = isClosed !== undefined ? isClosed : job.isClosed;
    
    if (deadline) job.deadline = new Date(deadline);
    if (requirements) job.requirements = Array.isArray(requirements) ? requirements : JSON.parse(requirements);
    if (skills) job.skills = Array.isArray(skills) ? skills : JSON.parse(skills);

    const updatedJob = await job.save();

    res.json({
      success: true,
      message: 'Job listing updated successfully!',
      data: updatedJob,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a job listing
// @route   DELETE /api/jobs/:id
// @access  Private (Creator/Admin)
export const deleteJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job listing not found' });
    }

    // Ownership check
    if (job.creator.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'User not authorized to delete this listing' });
    }

    await job.deleteOne();

    res.json({
      success: true,
      message: 'Job listing deleted successfully!',
    });
  } catch (error) {
    next(error);
  }
};
