import Application from '../models/Application.js';
import Job from '../models/Job.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import { uploadFile } from '../utils/uploader.js';
import { 
  sendEmail, 
  getAppSubmissionEmailBody, 
  getStatusUpdateEmailBody, 
  getInterviewEmailBody 
} from '../utils/sendEmail.js';

// @desc    Apply to a job
// @route   POST /api/applications
// @access  Private (Candidate)
export const applyToJob = async (req, res, next) => {
  try {
    const { jobId, coverLetter } = req.body;

    const job = await Job.findById(jobId).populate('company');
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job listing not found' });
    }

    if (job.isClosed) {
      return res.status(400).json({ success: false, message: 'This job listing is closed' });
    }

    // Check if candidate already applied
    const alreadyApplied = await Application.findOne({ job: jobId, candidate: req.user.id });
    if (alreadyApplied) {
      return res.status(400).json({ success: false, message: 'You have already applied to this job listing' });
    }

    // Handle resume resolving
    let resumeUrl = req.user.resumeUrl;
    let resumePublicId = req.user.resumePublicId;

    // Override if a new resume file is uploaded
    if (req.file) {
      const uploadRes = await uploadFile(req.file, 'career_connect/resumes');
      resumeUrl = uploadRes.url;
      resumePublicId = uploadRes.publicId;

      // Update candidate's default profile resume as well
      await User.findByIdAndUpdate(req.user.id, { resumeUrl, resumePublicId });
    }

    if (!resumeUrl) {
      return res.status(400).json({ 
        success: false, 
        message: 'No resume found. Please upload a resume file in the form or configure one in your profile.' 
      });
    }

    const application = new Application({
      job: jobId,
      candidate: req.user.id,
      resumeUrl,
      resumePublicId,
      coverLetter,
      status: 'applied',
    });

    const savedApp = await application.save();

    // Increment application count on the Job schema
    job.applicationsCount += 1;
    await job.save();

    // Send Real-time notification in database to job creator (employer)
    await Notification.create({
      recipient: job.creator,
      sender: req.user.id,
      message: `${req.user.name} applied for your opening: "${job.title}"`,
      type: 'general',
    });

    // Send confirmation email notification to candidate
    await sendEmail({
      to: req.user.email,
      subject: `Application Submitted: ${job.title} - CareerConnect`,
      htmlBody: getAppSubmissionEmailBody(req.user.name, job.title, job.company?.name || 'Company'),
    });

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully!',
      data: savedApp,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get candidate's job applications
// @route   GET /api/applications/my-applications
// @access  Private (Candidate)
export const getMyApplications = async (req, res, next) => {
  try {
    const apps = await Application.find({ candidate: req.user.id })
      .populate({
        path: 'job',
        select: 'title type remoteType location company salaryMin salaryMax',
        populate: {
          path: 'company',
          select: 'name logo sector',
        },
      })
      .sort({ appliedAt: -1 });

    res.json({ success: true, data: apps });
  } catch (error) {
    next(error);
  }
};

// @desc    Get applicants for a job listing
// @route   GET /api/applications/job/:jobId
// @access  Private (Employer/Admin)
export const getApplicationsForJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job listing not found' });
    }

    // Ownership check
    if (job.creator.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'User not authorized to access these applications' });
    }

    const apps = await Application.find({ job: req.params.jobId })
      .populate('candidate', 'name email title bio skills education experience avatar')
      .sort({ appliedAt: -1 });

    res.json({ success: true, data: apps });
  } catch (error) {
    next(error);
  }
};

// @desc    Update application status
// @route   PUT /api/applications/:id/status
// @access  Private (Employer/Admin)
export const updateApplicationStatus = async (req, res, next) => {
  try {
    const { status, feedback } = req.body;
    const application = await Application.findById(req.params.id).populate('job').populate('candidate');
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    // Ownership check (creator of the job)
    if (application.job.creator.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'User not authorized to update application' });
    }

    application.status = status || application.status;
    application.feedback = feedback !== undefined ? feedback : application.feedback;
    const updatedApp = await application.save();

    // Notify candidate
    await Notification.create({
      recipient: application.candidate._id,
      sender: req.user.id,
      message: `Your application status for "${application.job.title}" has been updated to: ${status}`,
      type: 'application_status',
    });

    // Send email alert to candidate
    await sendEmail({
      to: application.candidate.email,
      subject: `Application status update: ${application.job.title} - CareerConnect`,
      htmlBody: getStatusUpdateEmailBody(
        application.candidate.name, 
        application.job.title, 
        req.user.company?.name || 'Company', 
        status, 
        feedback
      ),
    });

    res.json({
      success: true,
      message: `Application status updated to ${status}!`,
      data: updatedApp,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Schedule interview
// @route   PUT /api/applications/:id/schedule
// @access  Private (Employer/Admin)
export const scheduleInterview = async (req, res, next) => {
  try {
    const { interviewDate, interviewDetails } = req.body;

    const application = await Application.findById(req.params.id).populate('job').populate('candidate');
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    // Ownership check
    if (application.job.creator.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'User not authorized to schedule interview' });
    }

    application.status = 'interviewing';
    application.interviewDate = new Date(interviewDate);
    application.interviewDetails = interviewDetails || '';
    const updatedApp = await application.save();

    // Send Database notification to candidate
    await Notification.create({
      recipient: application.candidate._id,
      sender: req.user.id,
      message: `An interview has been scheduled for your application to "${application.job.title}" on ${new Date(interviewDate).toLocaleString()}`,
      type: 'interview',
    });

    // Send email alert to candidate
    await sendEmail({
      to: application.candidate.email,
      subject: `Interview Scheduled: ${application.job.title} - CareerConnect`,
      htmlBody: getInterviewEmailBody(
        application.candidate.name, 
        application.job.title, 
        req.user.company?.name || 'Company', 
        interviewDate, 
        interviewDetails
      ),
    });

    res.json({
      success: true,
      message: 'Interview scheduled successfully!',
      data: updatedApp,
    });
  } catch (error) {
    next(error);
  }
};
