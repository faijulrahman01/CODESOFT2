import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import API from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../context/ToastContext';
import { 
  Briefcase, MapPin, DollarSign, Calendar, Clock, Award, 
  Building, Globe, FileText, ArrowLeft, Bookmark, CheckCircle2, 
  Loader2, ChevronRight, Upload, X 
} from 'lucide-react';
import { motion } from 'framer-motion';

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useToast();

  const [job, setJob] = useState(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarkId, setBookmarkId] = useState(null);
  const [hasApplied, setHasApplied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Application Modal States
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const [isSubmittingApp, setIsSubmittingApp] = useState(false);

  const fetchJobDetails = async () => {
    try {
      const res = await API.get(`/jobs/${id}`);
      if (res.data.success) {
        setJob(res.data.data);
      }

      if (user && user.role === 'candidate') {
        try {
          // Check application status
          const appRes = await API.get('/applications/my-applications');
          if (appRes.data.success) {
            const applied = appRes.data.data.some(app => app.job?._id === id);
            setHasApplied(applied);
          }

          // Check bookmark status
          const bookRes = await API.get('/bookmarks');
          if (bookRes.data.success) {
            const bookmarked = bookRes.data.data.find(b => b.job?._id === id);
            if (bookmarked) {
              setIsBookmarked(true);
              setBookmarkId(bookmarked._id);
            }
          }
        } catch (subErr) {
          console.error('Candidate stats load warning:', subErr);
        }
      }
    } catch (err) {
      console.error('Error loading job details:', err);
      addToast('Failed to load job details', 'error');
      navigate('/jobs');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobDetails();
  }, [id, user]);

  const handleBookmarkToggle = async () => {
    if (!user) {
      addToast('Please login to bookmark jobs', 'info');
      navigate('/login');
      return;
    }

    try {
      if (isBookmarked) {
        const res = await API.delete(`/bookmarks/${bookmarkId}`);
        if (res.data.success) {
          setIsBookmarked(false);
          setBookmarkId(null);
          addToast('Bookmark removed', 'success');
        }
      } else {
        const res = await API.post('/bookmarks', { jobId: id });
        if (res.data.success) {
          setIsBookmarked(true);
          setBookmarkId(res.data.data._id);
          addToast('Job saved to bookmarks!', 'success');
        }
      }
    } catch (err) {
      addToast('Failed to toggle bookmark', 'error');
    }
  };

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      addToast('Please login to apply for jobs', 'info');
      navigate('/login');
      return;
    }

    if (!user.resumeUrl && !resumeFile) {
      addToast('Please select a resume PDF file to upload', 'warning');
      return;
    }

    setIsSubmittingApp(true);
    try {
      const formData = new FormData();
      formData.append('jobId', id);
      formData.append('coverLetter', coverLetter);
      if (resumeFile) {
        formData.append('resume', resumeFile);
      }

      const res = await API.post('/applications', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success) {
        addToast('Application submitted successfully! Confirmation email queued.', 'success');
        setHasApplied(true);
        setShowApplyModal(false);
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to submit application', 'error');
    } finally {
      setIsSubmittingApp(false);
    }
  };

  const getCompanyLogo = () => {
    if (job?.company?.logo) {
      return job.company.logo.startsWith('http') ? job.company.logo : `http://localhost:5000${job.company.logo}`;
    }
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(job?.company?.name || 'Company')}&background=15803d&color=fff&bold=true&size=128`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!job) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 relative">
      <div className="absolute top-10 left-10 w-48 h-48 bg-primary-500/5 rounded-full blur-2xl pointer-events-none"></div>

      <Link
        to="/jobs"
        className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-350 transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Jobs Feed
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Columns: Job Details Description */}
        <div className="lg:col-span-8 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-8 rounded-2xl border-slate-200/20 dark:border-slate-800/40"
          >
            {/* Title & Header */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
              <div>
                <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white leading-tight">{job.title}</h1>
                <p className="text-sm font-semibold text-primary-500 mt-1.5">{job.company?.name}</p>
                <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-500 dark:text-slate-400 mt-4">
                  <span className="flex items-center gap-1"><MapPin className="w-4 h-4 text-slate-400" /> {job.location}</span>
                  <span className="flex items-center gap-1"><Clock className="w-4 h-4 text-slate-400" /> {job.type}</span>
                  <span className="flex items-center gap-1"><Briefcase className="w-4 h-4 text-slate-400" /> {job.remoteType}</span>
                </div>
              </div>

              {/* Bookmark Toggle */}
              {user?.role === 'candidate' && (
                <button
                  onClick={handleBookmarkToggle}
                  className={`p-3.5 rounded-xl border transition-all ${
                    isBookmarked
                      ? 'bg-primary-500/10 border-primary-500 text-primary-500 dark:text-primary-400'
                      : 'border-slate-200/10 dark:border-slate-800/40 text-slate-400 hover:bg-slate-500/5'
                  }`}
                  title={isBookmarked ? 'Saved' : 'Save Job'}
                >
                  <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
                </button>
              )}
            </div>

            {/* Salary & Deadline details banner */}
            <div className="grid grid-cols-2 gap-4 py-4 border-y border-slate-100 dark:border-slate-800 mb-8 text-xs font-bold text-slate-500 dark:text-slate-400">
              <div>
                <p className="uppercase tracking-wider text-[10px] text-slate-400 dark:text-slate-500">Estimated Salary</p>
                <p className="text-lg font-extrabold text-emerald-500 mt-1">
                  ${job.salaryMin.toLocaleString()} - ${job.salaryMax.toLocaleString()} /yr
                </p>
              </div>
              {job.deadline && (
                <div>
                  <p className="uppercase tracking-wider text-[10px] text-slate-400 dark:text-slate-500">Deadline</p>
                  <p className="text-sm font-extrabold text-slate-700 dark:text-slate-200 mt-1.5">
                    {new Date(job.deadline).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">Role Specifications</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-line">
                {job.description}
              </p>
            </div>
          </motion.div>

          {/* Requirements & Preferred Skills */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            
            {/* Requirements */}
            <div className="glass-card p-6 rounded-2xl border-slate-200/20 dark:border-slate-800/40">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-1.5">
                <FileText className="w-4.5 h-4.5 text-primary-500" /> Key Requirements
              </h3>
              {job.requirements?.length === 0 ? (
                <p className="text-xs text-slate-500 italic">No specific requirements listed.</p>
              ) : (
                <ul className="space-y-2">
                  {job.requirements.map((req, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-655 dark:text-slate-400 leading-relaxed">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary-500 mt-1.5 flex-shrink-0"></span>
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Preferred Skills */}
            <div className="glass-card p-6 rounded-2xl border-slate-200/20 dark:border-slate-800/40">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-1.5">
                <Award className="w-4.5 h-4.5 text-primary-500" /> Preferred Skills
              </h3>
              {job.skills?.length === 0 ? (
                <p className="text-xs text-slate-500 italic">No preferred skills tags configured.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="bg-primary-500/10 text-primary-500 dark:text-primary-400 px-3 py-1 rounded-full text-xs font-bold border border-primary-500/5"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Company info & Apply CTA */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Apply Card */}
          <div className="glass-card p-6 rounded-2xl border-slate-200/20 dark:border-slate-800/40 text-center">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Application</h3>
            <p className="text-xs text-slate-500 mb-6">Interested in this vacancy? Submit your resume to schedule an interview.</p>
            
            {hasApplied ? (
              <button
                disabled
                className="w-full py-3 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-4.5 h-4.5" />
                Application Submitted
              </button>
            ) : user?.role === 'employer' ? (
              <p className="text-xs text-rose-500 font-semibold p-3 border border-rose-500/10 bg-rose-500/5 rounded-xl">
                Employers cannot apply to job postings.
              </p>
            ) : user?.role === 'admin' ? (
              <p className="text-xs text-rose-500 font-semibold p-3 border border-rose-500/10 bg-rose-500/5 rounded-xl">
                Admins cannot apply to job postings.
              </p>
            ) : (
              <button
                onClick={() => setShowApplyModal(true)}
                className="w-full btn-primary py-3 text-xs flex items-center justify-center gap-1.5 shadow-md shadow-primary-500/10"
              >
                Apply for Job Listing
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Company Details */}
          <div className="glass-card p-6 rounded-2xl border-slate-200/20 dark:border-slate-800/40">
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
              <img
                src={getCompanyLogo()}
                alt={job.company?.name}
                className="w-12 h-12 rounded-xl object-cover border border-slate-200/20"
              />
              <div className="text-left">
                <h4 className="font-extrabold text-sm text-slate-800 dark:text-white">{job.company?.name}</h4>
                <span className="text-[10px] text-slate-500 font-semibold uppercase">{job.company?.sector}</span>
              </div>
            </div>

            <ul className="space-y-3.5 text-xs">
              <li className="flex justify-between items-center text-slate-500">
                <span className="font-semibold flex items-center gap-1"><Building className="w-4 h-4 text-slate-400" /> Size</span>
                <span className="font-bold text-slate-700 dark:text-slate-300">{job.company?.employeesCount} Employees</span>
              </li>
              <li className="flex justify-between items-center text-slate-500">
                <span className="font-semibold flex items-center gap-1"><MapPin className="w-4 h-4 text-slate-400" /> Head Office</span>
                <span className="font-bold text-slate-700 dark:text-slate-300 truncate max-w-[150px]">{job.company?.location}</span>
              </li>
              {job.company?.website && (
                <li className="flex justify-between items-center text-slate-500">
                  <span className="font-semibold flex items-center gap-1"><Globe className="w-4 h-4 text-slate-400" /> Website</span>
                  <a
                    href={job.company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-primary-500 hover:underline hover:text-primary-400 truncate max-w-[150px]"
                  >
                    {job.company.website.replace(/(^\w+:|^)\/\//, '')}
                  </a>
                </li>
              )}
            </ul>
            
            {job.company?.description && (
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800 pt-4 mt-4">
                {job.company.description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Slide-In / Center Apply Dialog Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg glass-card p-6 rounded-2xl border-slate-200/20"
          >
            <div className="flex items-center justify-between border-b border-slate-200/10 pb-4 mb-4">
              <h3 className="font-bold text-base text-slate-800 dark:text-white">Submit Job Application</h3>
              <button onClick={() => setShowApplyModal(false)} className="text-slate-400 hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleApplySubmit} className="space-y-4">
              <p className="text-xs text-slate-500">
                Applying for **{job.title}** at **{job.company?.name}**.
              </p>

              {/* Resume Override selection */}
              <div className="flex flex-col border border-slate-200/10 dark:border-slate-800/40 p-4 rounded-xl bg-slate-900/10 dark:bg-slate-950/20">
                <span className="text-xs font-semibold text-slate-400 mb-2">Select Resume Document (PDF)</span>
                {user.resumeUrl && (
                  <span className="text-[10px] text-primary-500 font-bold mb-2">✓ Verified Resume available in profile.</span>
                )}
                
                <input
                  type="file"
                  onChange={(e) => setResumeFile(e.target.files[0])}
                  accept=".pdf"
                  className="text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-none file:text-xs file:font-semibold file:bg-slate-100/10 file:text-slate-200 hover:file:bg-slate-100/20 file:cursor-pointer"
                />
                <span className="text-[9px] text-slate-500 mt-2">Only PDF documents allowed. Maximum 5MB size limit.</span>
              </div>

              {/* Cover Letter */}
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-slate-400 mb-1.5">Write a Short Cover Letter</label>
                <textarea
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  placeholder="Introduce yourself to the hiring team..."
                  rows="5"
                  className="glass-input text-xs py-2.5 resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  className="btn-secondary text-xs py-2 px-4"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingApp}
                  className="btn-primary text-xs py-2 px-6 flex items-center gap-1.5"
                >
                  {isSubmittingApp ? 'Submitting...' : 'Send Application'}
                  <CheckCircle2 className="w-4.5 h-4.5" />
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default JobDetails;
