import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../context/ToastContext';
import API from '../services/api';
import { 
  User, Briefcase, FileText, Trash2, Plus, Calendar, Save, 
  Upload, Loader2, Award, BookOpen, Clock, AlertCircle, ArrowRight 
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const CandidateDashboard = () => {
  const { user, setUser } = useAuth();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState('applications'); // 'applications', 'saved', 'profile'
  const [applications, setApplications] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [isLoadingList, setIsLoadingList] = useState(true);

  // Profile Form States
  const [title, setTitle] = useState(user?.title || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [skills, setSkills] = useState(user?.skills || []);
  const [skillInput, setSkillInput] = useState('');
  
  const [education, setEducation] = useState(user?.education || []);
  const [experience, setExperience] = useState(user?.experience || []);
  
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [resumeFile, setResumeFile] = useState(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const fileInputRef = useRef(null);
  const resumeInputRef = useRef(null);

  // Temporary Education Form
  const [newEdu, setNewEdu] = useState({ school: '', degree: '', fieldOfStudy: '', from: '', to: '', current: false, description: '' });
  const [showEduForm, setShowEduForm] = useState(false);

  // Temporary Experience Form
  const [newExp, setNewExp] = useState({ title: '', company: '', location: '', from: '', to: '', current: false, description: '' });
  const [showExpForm, setShowExpForm] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const appRes = await API.get('/applications/my-applications');
      const bookRes = await API.get('/bookmarks');
      
      if (appRes.data.success) {
        setApplications(appRes.data.data);
      }
      if (bookRes.data.success) {
        setSavedJobs(bookRes.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingList(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleAddSkill = (e) => {
    e.preventDefault();
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  const handleAddEducation = (e) => {
    e.preventDefault();
    if (!newEdu.school || !newEdu.degree || !newEdu.fieldOfStudy || !newEdu.from) {
      addToast('Please fill in school, degree, field of study, and start date', 'warning');
      return;
    }
    setEducation([...education, newEdu]);
    setNewEdu({ school: '', degree: '', fieldOfStudy: '', from: '', to: '', current: false, description: '' });
    setShowEduForm(false);
  };

  const handleRemoveEducation = (index) => {
    setEducation(education.filter((_, i) => i !== index));
  };

  const handleAddExperience = (e) => {
    e.preventDefault();
    if (!newExp.title || !newExp.company || !newExp.from) {
      addToast('Please fill in job title, company, and start date', 'warning');
      return;
    }
    setExperience([...experience, newExp]);
    setNewExp({ title: '', company: '', location: '', from: '', to: '', current: false, description: '' });
    setShowExpForm(false);
  };

  const handleRemoveExperience = (index) => {
    setExperience(experience.filter((_, i) => i !== index));
  };

  const handleRemoveBookmark = async (bookmarkId) => {
    try {
      const res = await API.delete(`/bookmarks/${bookmarkId}`);
      if (res.data.success) {
        addToast('Job removed from bookmarks', 'success');
        setSavedJobs(savedJobs.filter(b => b._id !== bookmarkId));
      }
    } catch (err) {
      addToast('Failed to remove bookmark', 'error');
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setIsSavingProfile(true);

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('bio', bio);
      formData.append('skills', JSON.stringify(skills));
      formData.append('education', JSON.stringify(education));
      formData.append('experience', JSON.stringify(experience));

      if (avatarFile) {
        formData.append('avatar', avatarFile);
      }
      if (resumeFile) {
        formData.append('resume', resumeFile);
      }

      const res = await API.put('/auth/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success) {
        addToast('Profile updated successfully!', 'success');
        
        // Sync context
        const updatedUser = { ...res.data.data, token: user.token };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setAvatarFile(null);
        setResumeFile(null);
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update profile settings', 'error');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const getAvatarUrl = () => {
    if (avatarPreview) return avatarPreview;
    if (user?.avatar) {
      return user.avatar.startsWith('http') ? user.avatar : `http://localhost:5000${user.avatar}`;
    }
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=22c55e&color=fff&bold=true&size=128`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Present';
    const options = { year: 'numeric', month: 'short' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 relative">
      <div className="absolute top-10 left-10 w-48 h-48 bg-primary-500/5 rounded-full blur-2xl pointer-events-none"></div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/10 pb-6 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white">Candidate Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">
            Track your applied jobs, view bookmark vacancies, and compile your professional portfolio profile.
          </p>
        </div>

        <Link to="/jobs" className="btn-primary text-sm py-2.5 px-5 flex items-center gap-1.5 shadow-md">
          <Briefcase className="w-4 h-4" />
          Browse Active Jobs
        </Link>
      </div>

      {/* Grid Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
        <div className="glass-card p-5 rounded-2xl border-slate-200/10 dark:border-slate-800/40">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Jobs Applied</span>
            <span className="p-2 rounded-xl bg-primary-500/10 text-primary-500"><Briefcase className="w-4 h-4" /></span>
          </div>
          <p className="text-3xl font-extrabold mt-2 text-slate-700 dark:text-white">{applications.length}</p>
        </div>

        <div className="glass-card p-5 rounded-2xl border-slate-200/10 dark:border-slate-800/40">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Bookmarked Jobs</span>
            <span className="p-2 rounded-xl bg-sky-500/10 text-sky-500"><BookOpen className="w-4 h-4" /></span>
          </div>
          <p className="text-3xl font-extrabold mt-2 text-slate-700 dark:text-white">{savedJobs.length}</p>
        </div>

        <div className="glass-card p-5 rounded-2xl border-slate-200/10 dark:border-slate-800/40">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Interview Invitations</span>
            <span className="p-2 rounded-xl bg-purple-500/10 text-purple-500"><Calendar className="w-4 h-4" /></span>
          </div>
          <p className="text-3xl font-extrabold mt-2 text-slate-700 dark:text-white">
            {applications.filter(app => app.status === 'interviewing').length}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-250/20 dark:border-slate-800/40 mb-6">
        <button
          onClick={() => setActiveTab('applications')}
          className={`py-3 px-6 text-sm font-bold border-b-2 transition-colors ${
            activeTab === 'applications'
              ? 'border-primary-500 text-primary-500 dark:text-primary-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-350'
          }`}
        >
          My Applications ({applications.length})
        </button>
        <button
          onClick={() => setActiveTab('saved')}
          className={`py-3 px-6 text-sm font-bold border-b-2 transition-colors ${
            activeTab === 'saved'
              ? 'border-primary-500 text-primary-500 dark:text-primary-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-350'
          }`}
        >
          Saved Jobs ({savedJobs.length})
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          className={`py-3 px-6 text-sm font-bold border-b-2 transition-colors ${
            activeTab === 'profile'
              ? 'border-primary-500 text-primary-500 dark:text-primary-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-355'
          }`}
        >
          Build Profile Settings
        </button>
      </div>

      {/* Tab Contents */}
      <div>
        {activeTab === 'applications' ? (
          /* Applications Pager */
          isLoadingList ? (
            <div className="flex justify-center items-center py-20">
              <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : applications.length === 0 ? (
            <div className="text-center py-16 glass-card rounded-2xl p-8 border-slate-200/10">
              <Briefcase className="w-12 h-12 text-slate-550 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-250">No applications yet</h3>
              <p className="text-xs text-slate-500 mt-1">Submit your details to active job listings to view them here.</p>
              <Link to="/jobs" className="btn-primary py-2 px-6 text-xs inline-flex items-center gap-1 mt-4 shadow-md">
                <span>Find Jobs</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {applications.map((app) => (
                <div
                  key={app._id}
                  className="glass-card p-6 rounded-2xl border border-slate-200/10 dark:border-slate-850 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex-grow">
                    <h3 className="font-bold text-lg text-slate-800 dark:text-white leading-tight">
                      {app.job?.title || <span className="text-slate-500 italic">Deleted Job Posting</span>}
                    </h3>
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
                      {app.job?.company?.name || 'Unknown Company'} • {app.job?.location}
                    </p>
                    <div className="flex items-center gap-4 text-[10px] text-slate-500 font-semibold mt-3">
                      <span>Applied: {new Date(app.appliedAt).toLocaleDateString()}</span>
                      {app.status === 'interviewing' && app.interviewDate && (
                        <span className="text-indigo-500 bg-indigo-500/10 px-2 py-0.5 rounded-lg border border-indigo-500/20">
                          Interview Scheduled: {new Date(app.interviewDate).toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-6 justify-between sm:justify-end flex-shrink-0">
                    <span className={`text-[10px] font-extrabold uppercase px-2 py-1 rounded-lg ${
                      app.status === 'accepted' ? 'bg-emerald-500/15 text-emerald-500' :
                      app.status === 'rejected' ? 'bg-rose-500/15 text-rose-500' :
                      app.status === 'interviewing' ? 'bg-indigo-500/15 text-indigo-500' :
                      'bg-sky-500/15 text-sky-500'
                    }`}>
                      {app.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : activeTab === 'saved' ? (
          /* Bookmarked Jobs Pager */
          isLoadingList ? (
            <div className="flex justify-center items-center py-20">
              <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : savedJobs.length === 0 ? (
            <div className="text-center py-16 glass-card rounded-2xl p-8 border-slate-200/10">
              <BookOpen className="w-12 h-12 text-slate-550 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-250">No saved jobs</h3>
              <p className="text-xs text-slate-550 mt-1">Bookmark interesting listings to review them here later.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {savedJobs.map((bookmark) => (
                <div
                  key={bookmark._id}
                  className="glass-card p-6 rounded-2xl border border-slate-200/10 dark:border-slate-850 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex-grow">
                    <h3 className="font-bold text-lg text-slate-800 dark:text-white leading-tight">
                      {bookmark.job?.title || <span className="text-slate-500 italic">Deleted Job</span>}
                    </h3>
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
                      {bookmark.job?.company?.name} • {bookmark.job?.location}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleRemoveBookmark(bookmark._id)}
                      className="p-2 text-rose-500 hover:bg-rose-500/5 rounded-xl"
                      title="Remove Bookmark"
                    >
                      <Trash2 className="w-4.5 h-4.5" />
                    </button>
                    {bookmark.job && (
                      <Link
                        to="/jobs"
                        className="btn-primary text-xs py-1.5 px-4 font-bold flex items-center gap-1"
                      >
                        <span>Details</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          /* Profile Builder Form */
          <form onSubmit={handleProfileSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Avatar & Resume uploader sidebar */}
            <div className="flex flex-col gap-6">
              <div className="glass-card p-6 rounded-2xl border-slate-200/10 dark:border-slate-800/40 text-center flex flex-col items-center">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-4">Profile Avatar</h3>
                <div className="relative group cursor-pointer" onClick={() => fileInputRef.current.click()}>
                  <img
                    src={getAvatarUrl()}
                    alt={user.name}
                    className="w-24 h-24 rounded-full object-cover border border-slate-200/30 dark:border-slate-800/40 group-hover:opacity-75 transition-opacity"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    <Upload className="w-5 h-5 text-white" />
                  </div>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => {
                    const f = e.target.files[0];
                    if (f) {
                      setAvatarFile(f);
                      setAvatarPreview(URL.createObjectURL(f));
                    }
                  }}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current.click()}
                  className="btn-secondary text-[10px] py-1 px-3 mt-3 flex items-center gap-1.5"
                >
                  <Upload className="w-3 h-3" /> Upload Photo
                </button>
              </div>

              {/* Resume File */}
              <div className="glass-card p-6 rounded-2xl border-slate-200/10 dark:border-slate-800/40 text-center flex flex-col items-center">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-4">Resume Document</h3>
                <FileText className="w-12 h-12 text-slate-450 dark:text-slate-500 mb-2" />
                
                {user.resumeUrl ? (
                  <a
                    href={user.resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary-500 font-bold hover:underline mb-3 block truncate max-w-full px-2"
                  >
                    View Current Resume PDF
                  </a>
                ) : (
                  <p className="text-[10px] text-slate-500 mb-3">No resume uploaded yet.</p>
                )}

                <input
                  type="file"
                  ref={resumeInputRef}
                  onChange={(e) => setResumeFile(e.target.files[0])}
                  accept=".pdf"
                  className="hidden"
                />
                
                <button
                  type="button"
                  onClick={() => resumeInputRef.current.click()}
                  className="btn-secondary text-[10px] py-1 px-3 flex items-center gap-1.5"
                >
                  <Upload className="w-3 h-3" /> 
                  {resumeFile ? 'Change Selected PDF' : 'Upload Resume PDF'}
                </button>
                {resumeFile && <span className="text-[10px] text-emerald-500 mt-2 font-semibold">Selected: {resumeFile.name}</span>}
              </div>
            </div>

            {/* Profile fields */}
            <div className="md:col-span-2 space-y-6">
              <div className="glass-card p-6 rounded-2xl border-slate-200/10 dark:border-slate-800/40 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <label className="text-xs font-semibold text-slate-550 dark:text-slate-400 mb-1">Headline Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Senior Software Engineer"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="glass-input text-xs py-2.5"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-xs font-semibold text-slate-550 dark:text-slate-400 mb-1">Biography</label>
                    <textarea
                      placeholder="Short professional summary..."
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      rows="1"
                      className="glass-input text-xs py-2.5 resize-none animate-none"
                    />
                  </div>
                </div>

                {/* Skills tags builder */}
                <div className="flex flex-col pt-3">
                  <label className="text-xs font-semibold text-slate-550 dark:text-slate-400 mb-2">Skills (Built Tags)</label>
                  <div className="flex flex-wrap gap-2 mb-3 border border-slate-200/10 dark:border-slate-800/40 p-3 rounded-xl bg-slate-900/10 dark:bg-slate-950/20 min-h-[3.25rem]">
                    {skills.map((skill, sIdx) => (
                      <span
                        key={sIdx}
                        className="inline-flex items-center gap-1.5 bg-primary-500/10 text-primary-500 dark:text-primary-400 px-3 py-1 rounded-full text-xs font-bold"
                      >
                        {skill}
                        <button type="button" onClick={() => handleRemoveSkill(skill)} className="hover:text-primary-600">×</button>
                      </span>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add a skill (e.g. Node.js)"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      className="glass-input text-xs py-2 px-3 flex-grow"
                    />
                    <button type="button" onClick={handleAddSkill} className="btn-secondary text-xs py-2 px-4 whitespace-nowrap">
                      Add Tag
                    </button>
                  </div>
                </div>
              </div>

              {/* Education section */}
              <div className="glass-card p-6 rounded-2xl border-slate-200/10 dark:border-slate-800/40">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-primary-500" /> Education History
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowEduForm(!showEduForm)}
                    className="text-xs font-bold text-primary-500 hover:text-primary-400 flex items-center gap-0.5"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add School
                  </button>
                </div>

                {/* New Education Inline Form */}
                {showEduForm && (
                  <div className="border border-primary-500/35 bg-primary-500/5 p-4 rounded-xl mb-4 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <input
                        type="text"
                        placeholder="School Name"
                        value={newEdu.school}
                        onChange={(e) => setNewEdu({ ...newEdu, school: e.target.value })}
                        className="glass-input text-xs py-2 px-3"
                      />
                      <input
                        type="text"
                        placeholder="Degree (e.g. B.S.)"
                        value={newEdu.degree}
                        onChange={(e) => setNewEdu({ ...newEdu, degree: e.target.value })}
                        className="glass-input text-xs py-2 px-3"
                      />
                      <input
                        type="text"
                        placeholder="Field of Study"
                        value={newEdu.fieldOfStudy}
                        onChange={(e) => setNewEdu({ ...newEdu, fieldOfStudy: e.target.value })}
                        className="glass-input text-xs py-2 px-3"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="date"
                        value={newEdu.from}
                        onChange={(e) => setNewEdu({ ...newEdu, from: e.target.value })}
                        className="glass-input text-xs py-2 px-3"
                      />
                      <input
                        type="date"
                        value={newEdu.to}
                        onChange={(e) => setNewEdu({ ...newEdu, to: e.target.value })}
                        className="glass-input text-xs py-2 px-3"
                        disabled={newEdu.current}
                      />
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={newEdu.current}
                        onChange={(e) => setNewEdu({ ...newEdu, current: e.target.checked, to: '' })}
                        className="w-4 h-4 bg-transparent border-slate-700 text-primary-500 focus:ring-0"
                      />
                      <label className="text-[10px] font-bold text-slate-550">Currently studying here</label>
                    </div>

                    <div className="flex justify-end gap-2 mt-2 pt-2 border-t border-slate-200/10">
                      <button type="button" onClick={() => setShowEduForm(false)} className="btn-secondary text-[10px] py-1 px-3">Cancel</button>
                      <button type="button" onClick={handleAddEducation} className="btn-primary text-[10px] py-1 px-4">Save School</button>
                    </div>
                  </div>
                )}

                {/* Education list */}
                <div className="space-y-3">
                  {education.length === 0 ? (
                    <p className="text-xs text-slate-500 italic">No education history details listed.</p>
                  ) : (
                    education.map((edu, idx) => (
                      <div key={idx} className="flex justify-between items-start gap-4 p-3 rounded-xl bg-slate-900/10 dark:bg-slate-950/20 border border-slate-200/5">
                        <div>
                          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">{edu.school}</h4>
                          <p className="text-[10px] text-slate-450 dark:text-slate-400 mt-0.5">{edu.degree} in {edu.fieldOfStudy}</p>
                          <p className="text-[9px] text-slate-500 mt-1">{formatDate(edu.from)} - {edu.current ? 'Present' : formatDate(edu.to)}</p>
                        </div>
                        <button type="button" onClick={() => handleRemoveEducation(idx)} className="text-rose-500 hover:bg-rose-500/5 p-1 rounded-lg">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Experience section */}
              <div className="glass-card p-6 rounded-2xl border-slate-200/10 dark:border-slate-800/40">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Briefcase className="w-4 h-4 text-primary-500" /> Work Experience
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowExpForm(!showExpForm)}
                    className="text-xs font-bold text-primary-500 hover:text-primary-400 flex items-center gap-0.5"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Experience
                  </button>
                </div>

                {/* New Experience Inline Form */}
                {showExpForm && (
                  <div className="border border-primary-500/35 bg-primary-500/5 p-4 rounded-xl mb-4 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <input
                        type="text"
                        placeholder="Job Title"
                        value={newExp.title}
                        onChange={(e) => setNewExp({ ...newExp, title: e.target.value })}
                        className="glass-input text-xs py-2 px-3"
                      />
                      <input
                        type="text"
                        placeholder="Company"
                        value={newExp.company}
                        onChange={(e) => setNewExp({ ...newExp, company: e.target.value })}
                        className="glass-input text-xs py-2 px-3"
                      />
                      <input
                        type="text"
                        placeholder="Location (optional)"
                        value={newExp.location}
                        onChange={(e) => setNewExp({ ...newExp, location: e.target.value })}
                        className="glass-input text-xs py-2 px-3"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="date"
                        value={newExp.from}
                        onChange={(e) => setNewExp({ ...newExp, from: e.target.value })}
                        className="glass-input text-xs py-2 px-3"
                      />
                      <input
                        type="date"
                        value={newExp.to}
                        onChange={(e) => setNewExp({ ...newExp, to: e.target.value })}
                        className="glass-input text-xs py-2 px-3"
                        disabled={newExp.current}
                      />
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={newExp.current}
                        onChange={(e) => setNewExp({ ...newExp, current: e.target.checked, to: '' })}
                        className="w-4 h-4 bg-transparent border-slate-700 text-primary-500 focus:ring-0"
                      />
                      <label className="text-[10px] font-bold text-slate-550">Currently working here</label>
                    </div>

                    <div className="flex justify-end gap-2 mt-2 pt-2 border-t border-slate-200/10">
                      <button type="button" onClick={() => setShowExpForm(false)} className="btn-secondary text-[10px] py-1 px-3">Cancel</button>
                      <button type="button" onClick={handleAddExperience} className="btn-primary text-[10px] py-1 px-4">Save Experience</button>
                    </div>
                  </div>
                )}

                {/* Experience list */}
                <div className="space-y-3">
                  {experience.length === 0 ? (
                    <p className="text-xs text-slate-500 italic">No professional experience listed.</p>
                  ) : (
                    experience.map((exp, idx) => (
                      <div key={idx} className="flex justify-between items-start gap-4 p-3 rounded-xl bg-slate-900/10 dark:bg-slate-950/20 border border-slate-200/5">
                        <div>
                          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">{exp.title}</h4>
                          <p className="text-[10px] text-slate-450 dark:text-slate-400 mt-0.5">{exp.company} • {exp.location}</p>
                          <p className="text-[9px] text-slate-550 mt-1">{formatDate(exp.from)} - {exp.current ? 'Present' : formatDate(exp.to)}</p>
                        </div>
                        <button type="button" onClick={() => handleRemoveExperience(idx)} className="text-rose-500 hover:bg-rose-500/5 p-1 rounded-lg">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Submit Profiles btn */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="btn-primary py-3 px-8 text-xs flex items-center gap-1.5 shadow-md shadow-primary-500/10"
                >
                  {isSavingProfile ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving Changes...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save Profile Settings</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default CandidateDashboard;
