import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../context/ToastContext';
import API from '../services/api';
import { 
  Building, Briefcase, Users, Plus, Upload, Save, Eye, Check, X, 
  Calendar, FileText, Loader2, ArrowRight, Star, HelpCircle 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

const EmployerDashboard = () => {
  const { user, setUser } = useAuth();
  const { addToast } = useToast();

  const [company, setCompany] = useState(user?.company || null);
  const [jobs, setJobs] = useState([]);
  const [selectedJobApplicants, setSelectedJobApplicants] = useState(null);
  const [isLoadingJobs, setIsLoadingJobs] = useState(true);
  
  // Company Form State
  const [compName, setCompName] = useState(company?.name || '');
  const [compWeb, setCompWeb] = useState(company?.website || '');
  const [compLoc, setCompLoc] = useState(company?.location || '');
  const [compSec, setCompSec] = useState(company?.sector || '');
  const [compSize, setCompSize] = useState(company?.employeesCount || 0);
  const [compDesc, setCompDesc] = useState(company?.description || '');
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [isSavingCompany, setIsSavingCompany] = useState(false);
  const fileInputRef = useRef(null);

  // Interview Scheduler State
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [interviewDate, setInterviewDate] = useState('');
  const [interviewDetails, setInterviewDetails] = useState('');
  const [isScheduling, setIsScheduling] = useState(false);

  const fetchJobs = async () => {
    try {
      const res = await API.get('/jobs/my-jobs');
      if (res.data.success) {
        setJobs(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingJobs(false);
    }
  };

  useEffect(() => {
    if (company) {
      fetchJobs();
    }
  }, [company]);

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleCompanySubmit = async (e) => {
    e.preventDefault();
    if (!compName.trim()) {
      addToast('Company name is required', 'warning');
      return;
    }

    setIsSavingCompany(true);
    try {
      const formData = new FormData();
      formData.append('name', compName);
      formData.append('website', compWeb);
      formData.append('location', compLoc);
      formData.append('sector', compSec);
      formData.append('employeesCount', compSize);
      formData.append('description', compDesc);
      
      if (logoFile) {
        formData.append('logo', logoFile);
      }

      let res;
      if (company) {
        // Update company
        res = await API.put(`/companies/${company._id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        // Create company
        res = await API.post('/companies', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      if (res.data.success) {
        addToast(company ? 'Company updated successfully!' : 'Company registered successfully!', 'success');
        setCompany(res.data.data);
        
        // Sync user context
        const updatedUser = { ...user, company: res.data.data };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to save company profile', 'error');
    } finally {
      setIsSavingCompany(false);
    }
  };

  const handleViewApplicants = async (jobId) => {
    try {
      const res = await API.get(`/applications/job/${jobId}`);
      if (res.data.success) {
        setSelectedJobApplicants({
          jobId,
          applicants: res.data.data,
        });
      }
    } catch (err) {
      addToast('Failed to fetch applicants list', 'error');
    }
  };

  const handleUpdateStatus = async (appId, status) => {
    try {
      const res = await API.put(`/applications/${appId}/status`, { status });
      if (res.data.success) {
        addToast(`Application marked as ${status}!`, 'success');
        // Refresh local applicants list
        if (selectedJobApplicants) {
          const updated = selectedJobApplicants.applicants.map((app) => 
            app._id === appId ? { ...app, status } : app
          );
          setSelectedJobApplicants({ ...selectedJobApplicants, applicants: updated });
        }
      }
    } catch (err) {
      addToast('Failed to update application status', 'error');
    }
  };

  const handleOpenScheduler = (applicant) => {
    setSelectedApplicant(applicant);
    setInterviewDate('');
    setInterviewDetails('');
  };

  const handleScheduleInterview = async (e) => {
    e.preventDefault();
    if (!interviewDate) {
      addToast('Please select an interview date', 'warning');
      return;
    }

    setIsScheduling(true);
    try {
      const res = await API.put(`/applications/${selectedApplicant._id}/schedule`, {
        interviewDate,
        interviewDetails,
      });

      if (res.data.success) {
        addToast('Interview scheduled and notification email queued!', 'success');
        // Update local status to interviewing
        if (selectedJobApplicants) {
          const updated = selectedJobApplicants.applicants.map((app) => 
            app._id === selectedApplicant._id ? { ...app, status: 'interviewing', interviewDate } : app
          );
          setSelectedJobApplicants({ ...selectedJobApplicants, applicants: updated });
        }
        setSelectedApplicant(null);
      }
    } catch (err) {
      addToast('Failed to schedule interview', 'error');
    } finally {
      setIsScheduling(false);
    }
  };

  const getLogoUrl = () => {
    if (logoPreview) return logoPreview;
    if (company?.logo) {
      return company.logo.startsWith('http') ? company.logo : `http://localhost:5000${company.logo}`;
    }
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(compName || 'Company')}&background=15803d&color=fff&bold=true&size=128`;
  };

  // Helper for resume urls
  const openResume = (url) => {
    if (url.startsWith('http')) {
      window.open(url, '_blank');
    } else {
      window.open(`http://localhost:5000${url}`, '_blank');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 relative">
      <div className="absolute top-10 left-10 w-48 h-48 bg-primary-500/5 rounded-full blur-2xl pointer-events-none"></div>

      {/* Profile Check: Prompt if no company profile setup yet */}
      {!company ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl mx-auto glass-card p-8 rounded-2xl border-slate-200/20 dark:border-slate-800/40"
        >
          <div className="text-center mb-8">
            <span className="inline-flex p-3.5 bg-primary-500/10 text-primary-500 rounded-2xl mb-4">
              <Building className="w-8 h-8" />
            </span>
            <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white">Register Your Company</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
              Before you can post jobs, please fill out your corporate profile so candidates know who you are.
            </p>
          </div>

          <form onSubmit={handleCompanySubmit} className="space-y-4">
            <div className="flex flex-col items-center justify-center mb-6">
              <div className="relative group cursor-pointer" onClick={() => fileInputRef.current.click()}>
                <img
                  src={getLogoUrl()}
                  alt="Company Logo"
                  className="w-24 h-24 rounded-2xl object-cover border border-slate-200/30 dark:border-slate-800 group-hover:opacity-75 transition-opacity"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity">
                  <Upload className="w-5 h-5 text-white" />
                </div>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleLogoChange}
                accept="image/*"
                className="hidden"
              />
              <p className="text-xs text-slate-550 dark:text-slate-400 mt-2">Upload corporate logo image</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-slate-550 dark:text-slate-400 mb-1">Company Name</label>
                <input
                  type="text"
                  required
                  value={compName}
                  onChange={(e) => setCompName(e.target.value)}
                  placeholder="e.g. Acme Corp"
                  className="glass-input text-sm py-2.5"
                />
              </div>

              <div className="flex flex-col">
                <label className="text-xs font-semibold text-slate-550 dark:text-slate-400 mb-1">Website URL</label>
                <input
                  type="url"
                  value={compWeb}
                  onChange={(e) => setCompWeb(e.target.value)}
                  placeholder="https://acme.com"
                  className="glass-input text-sm py-2.5"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-slate-550 dark:text-slate-400 mb-1">Location</label>
                <input
                  type="text"
                  value={compLoc}
                  onChange={(e) => setCompLoc(e.target.value)}
                  placeholder="e.g. Austin, TX"
                  className="glass-input text-sm py-2.5"
                />
              </div>

              <div className="flex flex-col">
                <label className="text-xs font-semibold text-slate-550 dark:text-slate-400 mb-1">Industry Sector</label>
                <input
                  type="text"
                  value={compSec}
                  onChange={(e) => setCompSec(e.target.value)}
                  placeholder="e.g. Technology"
                  className="glass-input text-sm py-2.5"
                />
              </div>

              <div className="flex flex-col">
                <label className="text-xs font-semibold text-slate-550 dark:text-slate-400 mb-1">Employees Count</label>
                <input
                  type="number"
                  value={compSize}
                  onChange={(e) => setCompSize(parseInt(e.target.value) || 0)}
                  placeholder="150"
                  className="glass-input text-sm py-2.5"
                />
              </div>
            </div>

            <div className="flex flex-col">
              <label className="text-xs font-semibold text-slate-550 dark:text-slate-400 mb-1">Description</label>
              <textarea
                value={compDesc}
                onChange={(e) => setCompDesc(e.target.value)}
                placeholder="About your company..."
                rows="4"
                className="glass-input text-sm py-2.5 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={isSavingCompany}
              className="w-full btn-primary py-3 flex items-center justify-center gap-2 mt-4"
            >
              {isSavingCompany ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Registering Company...</span>
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>Save Company Profile</span>
                </>
              )}
            </button>
          </form>
        </motion.div>
      ) : (
        /* Employer Dashboard Workspace */
        <div>
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/10 pb-6 mb-8">
            <div className="flex items-center gap-3">
              <img
                src={getLogoUrl()}
                alt={company.name}
                className="w-14 h-14 rounded-2xl object-cover border border-slate-250/20"
              />
              <div>
                <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white leading-tight">{company.name} Workspace</h1>
                <p className="text-xs text-slate-500 mt-0.5">{company.sector} • {company.location} • {company.employeesCount} Employees</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setCompany(null)} // Toggles to edit company view
                className="btn-secondary text-sm py-2 px-4"
              >
                Edit Company Profile
              </button>
              <Link
                to="/create-job"
                className="btn-primary text-sm py-2.5 px-4 flex items-center gap-1.5 shadow-md"
              >
                <Plus className="w-4 h-4" />
                Post Job
              </Link>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
            <div className="glass-card p-5 rounded-2xl border-slate-200/10 dark:border-slate-800/40">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-semibold uppercase tracking-wider">Active Jobs</span>
                <span className="p-2 rounded-xl bg-primary-500/10 text-primary-500"><Briefcase className="w-4 h-4" /></span>
              </div>
              <p className="text-3xl font-extrabold mt-2 text-slate-700 dark:text-white">{jobs.length}</p>
            </div>

            <div className="glass-card p-5 rounded-2xl border-slate-200/10 dark:border-slate-800/40">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-semibold uppercase tracking-wider">Total Applications</span>
                <span className="p-2 rounded-xl bg-sky-500/10 text-sky-500"><Users className="w-4 h-4" /></span>
              </div>
              <p className="text-3xl font-extrabold mt-2 text-slate-700 dark:text-white">
                {jobs.reduce((acc, curr) => acc + (curr.applicationsCount || 0), 0)}
              </p>
            </div>

            <div className="glass-card p-5 rounded-2xl border-slate-200/10 dark:border-slate-800/40">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-semibold uppercase tracking-wider">Hires Finalized</span>
                <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500"><Check className="w-4 h-4" /></span>
              </div>
              <p className="text-3xl font-extrabold mt-2 text-slate-700 dark:text-white">
                {/* Visual aggregate dummy */}
                {jobs.reduce((acc, curr) => acc + Math.round((curr.applicationsCount || 0) * 0.2), 0)}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left side: Job Listings */}
            <div className="lg:col-span-5 space-y-4">
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-4">
                <Briefcase className="w-5 h-5 text-primary-500" />
                Active Job Listings
              </h2>

              {isLoadingJobs ? (
                <div className="flex items-center justify-center py-10">
                  <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : jobs.length === 0 ? (
                <div className="text-center py-12 glass-card rounded-2xl p-6 border-slate-200/10">
                  <p className="text-sm text-slate-500">No active job listings.</p>
                  <Link to="/create-job" className="btn-primary text-xs py-1.5 px-4 mt-4 inline-flex items-center gap-1.5">
                    <Plus className="w-3.5 h-3.5" />
                    Post Job Now
                  </Link>
                </div>
              ) : (
                jobs.map((job) => (
                  <div
                    key={job._id}
                    className={`glass-card p-5 rounded-2xl border transition-all cursor-pointer ${
                      selectedJobApplicants?.jobId === job._id 
                        ? 'border-primary-500 dark:border-primary-400 bg-primary-500/5' 
                        : 'border-slate-200/10 dark:border-slate-850 hover:bg-white/5'
                    }`}
                    onClick={() => handleViewApplicants(job._id)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-bold text-sm text-slate-800 dark:text-white truncate max-w-[200px]" title={job.title}>
                          {job.title}
                        </h3>
                        <p className="text-[10px] text-slate-550 dark:text-slate-400 mt-1 uppercase font-semibold">
                          {job.type} • {job.remoteType}
                        </p>
                      </div>

                      <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-primary-500/10 text-primary-500 px-2 py-0.5 rounded-lg whitespace-nowrap">
                        {job.applicationsCount || 0} applicants
                      </span>
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800/40 mt-4 pt-3 text-[10px] text-slate-500 font-semibold">
                      <span>Salary: ${Math.round(job.salaryMin/1000)}k - ${Math.round(job.salaryMax/1000)}k</span>
                      <span className="text-primary-500 hover:underline inline-flex items-center gap-0.5">
                        View Applicants <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Right side: Applicants View Console */}
            <div className="lg:col-span-7">
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-primary-500" />
                Applications Console
              </h2>

              {!selectedJobApplicants ? (
                <div className="text-center py-20 glass-card rounded-2xl p-8 border-slate-200/10 dark:border-slate-800/30">
                  <Briefcase className="w-10 h-10 text-slate-500 mx-auto mb-4" />
                  <p className="text-sm font-semibold text-slate-655 dark:text-slate-300">Select a Job Listing</p>
                  <p className="text-xs text-slate-500 mt-1">Click on one of your active job listings on the left to manage candidate applications.</p>
                </div>
              ) : selectedJobApplicants.applicants.length === 0 ? (
                <div className="text-center py-20 glass-card rounded-2xl p-8 border-slate-200/10 dark:border-slate-800/30">
                  <Users className="w-10 h-10 text-slate-500 mx-auto mb-4" />
                  <p className="text-sm font-semibold text-slate-655 dark:text-slate-300">No applicants yet</p>
                  <p className="text-xs text-slate-550 mt-1">Nobody has applied to this listing yet. Candidates will show up here once they apply.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedJobApplicants.applicants.map((app) => (
                    <div
                      key={app._id}
                      className="glass-card p-6 rounded-2xl border border-slate-200/10 dark:border-slate-800/40"
                    >
                      <div className="flex items-start justify-between gap-4 border-b border-slate-100 dark:border-slate-800/40 pb-4 mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary-500/10 text-primary-500 font-extrabold text-sm flex items-center justify-center">
                            {app.candidate?.name?.[0] || 'C'}
                          </div>
                          <div>
                            <h4 className="font-bold text-sm text-slate-800 dark:text-white leading-tight">{app.candidate?.name}</h4>
                            <p className="text-xs text-slate-500 mt-0.5">{app.candidate?.title || 'Job Candidate'}</p>
                          </div>
                        </div>

                        <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-lg ${
                          app.status === 'accepted' ? 'bg-emerald-500/10 text-emerald-500' :
                          app.status === 'rejected' ? 'bg-rose-500/10 text-rose-500' :
                          app.status === 'interviewing' ? 'bg-indigo-500/10 text-indigo-500' :
                          'bg-sky-500/10 text-sky-500'
                        }`}>
                          {app.status}
                        </span>
                      </div>

                      {/* Bio / Cover Letter */}
                      {app.candidate?.bio && (
                        <div className="mb-4">
                          <h5 className="text-[10px] font-bold uppercase tracking-wider text-slate-450 dark:text-slate-500">Candidate Bio</h5>
                          <p className="text-xs text-slate-655 dark:text-slate-400 mt-1 leading-relaxed">{app.candidate.bio}</p>
                        </div>
                      )}

                      {app.coverLetter && (
                        <div className="mb-4">
                          <h5 className="text-[10px] font-bold uppercase tracking-wider text-slate-450 dark:text-slate-500">Cover Letter</h5>
                          <p className="text-xs text-slate-655 dark:text-slate-400 mt-1 leading-relaxed">{app.coverLetter}</p>
                        </div>
                      )}

                      {/* Footer Actions */}
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100 dark:border-slate-800/40 pt-4 mt-4">
                        <button
                          onClick={() => openResume(app.resumeUrl)}
                          className="text-xs font-bold text-primary-500 hover:text-primary-400 hover:underline flex items-center gap-1"
                        >
                          <FileText className="w-4 h-4" />
                          View Resume Document (PDF)
                        </button>

                        {app.status === 'applied' || app.status === 'reviewing' || app.status === 'interviewing' ? (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleUpdateStatus(app._id, 'rejected')}
                              className="p-2 text-rose-500 hover:bg-rose-500/5 border border-slate-200/5 dark:border-slate-800/40 rounded-xl"
                              title="Reject Application"
                            >
                              <X className="w-4 h-4" />
                            </button>
                            
                            <button
                              onClick={() => handleOpenScheduler(app)}
                              className="p-2 text-indigo-500 hover:bg-indigo-500/5 border border-slate-200/5 dark:border-slate-800/40 rounded-xl flex items-center gap-1 text-xs font-bold px-3.5"
                              title="Schedule Interview"
                            >
                              <Calendar className="w-4 h-4" />
                              Schedule
                            </button>

                            <button
                              onClick={() => handleUpdateStatus(app._id, 'accepted')}
                              className="p-2 text-emerald-500 hover:bg-emerald-500/5 border border-slate-200/5 dark:border-slate-800/40 rounded-xl"
                              title="Accept / Offer Job"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Interview Scheduler Modal */}
      {selectedApplicant && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md glass-card p-6 rounded-2xl border-slate-200/20"
          >
            <div className="flex items-center justify-between border-b border-slate-200/10 pb-4 mb-4">
              <h3 className="font-bold text-base text-slate-800 dark:text-white">Schedule Interview</h3>
              <button onClick={() => setSelectedApplicant(null)} className="text-slate-400 hover:text-slate-250">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleScheduleInterview} className="space-y-4">
              <p className="text-xs text-slate-500">
                Scheduling interview for **{selectedApplicant.candidate?.name}**. They will receive a notification email containing the invitation details.
              </p>

              <div className="flex flex-col">
                <label className="text-xs font-semibold text-slate-400 mb-1">Interview Date & Time</label>
                <input
                  type="datetime-local"
                  required
                  value={interviewDate}
                  onChange={(e) => setInterviewDate(e.target.value)}
                  className="glass-input text-xs py-2.5"
                />
              </div>

              <div className="flex flex-col">
                <label className="text-xs font-semibold text-slate-400 mb-1">Interview Details (e.g. Zoom link)</label>
                <textarea
                  value={interviewDetails}
                  onChange={(e) => setInterviewDetails(e.target.value)}
                  placeholder="https://zoom.us/j/meeting-id..."
                  rows="3"
                  className="glass-input text-xs py-2.5 resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedApplicant(null)}
                  className="btn-secondary text-xs py-2 px-4"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isScheduling}
                  className="btn-primary text-xs py-2 px-5 flex items-center gap-1.5"
                >
                  {isScheduling ? 'Scheduling...' : 'Confirm Schedule'}
                  <Calendar className="w-4 h-4" />
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default EmployerDashboard;
