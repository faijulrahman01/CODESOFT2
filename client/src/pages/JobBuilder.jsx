import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import API from '../services/api';
import { useToast } from '../context/ToastContext';
import { 
  ArrowLeft, Briefcase, MapPin, DollarSign, Calendar, 
  Plus, Trash2, Loader2, Save, FileText, Settings 
} from 'lucide-react';
import { motion } from 'framer-motion';

const JobBuilder = () => {
  const { id } = useParams();
  const isEditMode = !!id;
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('full-time');
  const [remoteType, setRemoteType] = useState('onsite');
  const [location, setLocation] = useState('');
  const [salaryMin, setSalaryMin] = useState('');
  const [salaryMax, setSalaryMax] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('entry');
  const [deadline, setDeadline] = useState('');
  
  const [requirements, setRequirements] = useState([]);
  const [reqInput, setReqInput] = useState('');
  
  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isEditMode) {
      const fetchJobDetails = async () => {
        setIsLoading(true);
        try {
          const res = await API.get(`/jobs/${id}`);
          if (res.data.success && res.data.data) {
            const job = res.data.data;
            setTitle(job.title);
            setDescription(job.description);
            setType(job.type);
            setRemoteType(job.remoteType);
            setLocation(job.location);
            setSalaryMin(job.salaryMin || '');
            setSalaryMax(job.salaryMax || '');
            setExperienceLevel(job.experienceLevel);
            setRequirements(job.requirements || []);
            setSkills(job.skills || []);
            
            if (job.deadline) {
              setDeadline(new Date(job.deadline).toISOString().substring(0, 10));
            }
          }
        } catch (err) {
          addToast('Failed to load job listing details', 'error');
          navigate('/dashboard');
        } finally {
          setIsLoading(false);
        }
      };
      fetchJobDetails();
    }
  }, [id, isEditMode, navigate, addToast]);

  const handleAddRequirement = (e) => {
    e.preventDefault();
    if (reqInput.trim() && !requirements.includes(reqInput.trim())) {
      setRequirements([...requirements, reqInput.trim()]);
      setReqInput('');
    }
  };

  const handleRemoveRequirement = (req) => {
    setRequirements(requirements.filter(r => r !== req));
  };

  const handleAddSkill = (e) => {
    e.preventDefault();
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (sk) => {
    setSkills(skills.filter(s => s !== sk));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !location.trim()) {
      addToast('Job title, description, and location are required', 'warning');
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        title,
        description,
        type,
        remoteType,
        location,
        salaryMin: salaryMin ? Number(salaryMin) : 0,
        salaryMax: salaryMax ? Number(salaryMax) : 0,
        experienceLevel,
        deadline: deadline || null,
        requirements,
        skills,
      };

      let res;
      if (isEditMode) {
        res = await API.put(`/jobs/${id}`, payload);
      } else {
        res = await API.post('/jobs', payload);
      }

      if (res.data.success) {
        addToast(isEditMode ? 'Job listing updated successfully!' : 'Job listing created successfully!', 'success');
        navigate('/dashboard');
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to save job listing', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 relative">
      <div className="absolute top-10 left-10 w-48 h-48 bg-primary-500/5 rounded-full blur-2xl pointer-events-none"></div>

      <button
        onClick={() => navigate('/dashboard')}
        className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-350 transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Workspace
      </button>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-8 rounded-2xl border-slate-200/20 dark:border-slate-800/40"
      >
        <div className="border-b border-slate-200/10 pb-6 mb-8 flex items-center gap-3">
          <span className="p-3 bg-primary-500/10 text-primary-500 rounded-xl">
            <Briefcase className="w-6 h-6" />
          </span>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-850 dark:text-white">
              {isEditMode ? 'Edit Job Listing' : 'Post a New Job'}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Fill in the career details, description specifications, and requirements below.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Job Title */}
          <div className="flex flex-col">
            <label className="text-xs font-semibold text-slate-550 dark:text-slate-400 mb-1.5 ml-1">Job Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Senior React Developer"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="glass-input text-sm py-3 px-4"
            />
          </div>

          {/* Type & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex flex-col">
              <label className="text-xs font-semibold text-slate-550 dark:text-slate-400 mb-1.5 ml-1">Employment Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="glass-input text-sm py-3 px-4 bg-slate-900 text-slate-100 border border-slate-800 focus:ring-0 cursor-pointer"
              >
                <option value="full-time">Full-time</option>
                <option value="part-time">Part-time</option>
                <option value="contract">Contract</option>
                <option value="internship">Internship</option>
              </select>
            </div>

            <div className="flex flex-col">
              <label className="text-xs font-semibold text-slate-550 dark:text-slate-400 mb-1.5 ml-1">Workplace Model</label>
              <select
                value={remoteType}
                onChange={(e) => setRemoteType(e.target.value)}
                className="glass-input text-sm py-3 px-4 bg-slate-900 text-slate-100 border border-slate-800 focus:ring-0 cursor-pointer"
              >
                <option value="remote">Remote</option>
                <option value="hybrid">Hybrid</option>
                <option value="onsite">Onsite</option>
              </select>
            </div>

            <div className="flex flex-col">
              <label className="text-xs font-semibold text-slate-550 dark:text-slate-400 mb-1.5 ml-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-450" /> Location / Office
              </label>
              <input
                type="text"
                required
                placeholder="e.g. London, UK"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="glass-input text-sm py-3 px-4"
              />
            </div>
          </div>

          {/* Salary & Level */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex flex-col">
              <label className="text-xs font-semibold text-slate-550 dark:text-slate-400 mb-1.5 ml-1 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-slate-450" /> Salary Min (USD/yr)
              </label>
              <input
                type="number"
                placeholder="e.g. 70000"
                value={salaryMin}
                onChange={(e) => setSalaryMin(e.target.value)}
                className="glass-input text-sm py-3 px-4"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-xs font-semibold text-slate-550 dark:text-slate-400 mb-1.5 ml-1 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-slate-450" /> Salary Max (USD/yr)
              </label>
              <input
                type="number"
                placeholder="e.g. 110000"
                value={salaryMax}
                onChange={(e) => setSalaryMax(e.target.value)}
                className="glass-input text-sm py-3 px-4"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 ml-1">Experience Level</label>
              <select
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value)}
                className="glass-input text-sm py-3 px-4 bg-slate-900 text-slate-100 border border-slate-800 focus:ring-0 cursor-pointer"
              >
                <option value="entry">Entry Level</option>
                <option value="mid">Mid Level</option>
                <option value="senior">Senior Level</option>
                <option value="lead">Lead/Director</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Deadline */}
            <div className="flex flex-col">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 ml-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" /> Application Deadline
              </label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="glass-input text-sm py-3 px-4 cursor-pointer"
              />
            </div>
          </div>

          {/* Description */}
          <div className="flex flex-col">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 ml-1">Detailed Job Description</label>
            <textarea
              required
              placeholder="Detail the roles, responsibilities, culture, and projects..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="6"
              className="glass-input text-sm py-3 px-4 resize-none"
            />
          </div>

          {/* Requirements Tags */}
          <div className="flex flex-col">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 ml-1">Requirements List</label>
            <div className="flex flex-wrap gap-2 mb-3 border border-slate-200/10 dark:border-slate-800/40 p-3 rounded-xl bg-slate-900/10 dark:bg-slate-950/20 min-h-[3.25rem]">
              {requirements.map((req, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1.5 bg-sky-500/10 text-sky-500 dark:text-sky-400 px-3 py-1 rounded-full text-xs font-bold"
                >
                  {req}
                  <button type="button" onClick={() => handleRemoveRequirement(req)} className="hover:text-sky-600">×</button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add a requirement (e.g. 3+ years experience with React)"
                value={reqInput}
                onChange={(e) => setReqInput(e.target.value)}
                className="glass-input text-xs py-2 px-3 flex-grow"
              />
              <button type="button" onClick={handleAddRequirement} className="btn-secondary text-xs py-2 px-4 whitespace-nowrap">
                Add Row
              </button>
            </div>
          </div>

          {/* Skills Tags */}
          <div className="flex flex-col">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 ml-1">Preferred Technical Skills</label>
            <div className="flex flex-wrap gap-2 mb-3 border border-slate-200/10 dark:border-slate-800/40 p-3 rounded-xl bg-slate-900/10 dark:bg-slate-950/20 min-h-[3.25rem]">
              {skills.map((skill, index) => (
                <span
                  key={index}
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
                placeholder="Add a preferred skill tag (e.g. TailwindCSS)"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                className="glass-input text-xs py-2 px-3 flex-grow"
              />
              <button type="button" onClick={handleAddSkill} className="btn-secondary text-xs py-2 px-4 whitespace-nowrap">
                Add Tag
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end pt-4 border-t border-slate-200/10 gap-3">
            <Link to="/dashboard" className="btn-secondary py-3 px-8 text-sm">
              Cancel
            </Link>
            
            <button
              type="submit"
              disabled={isSaving}
              className="btn-primary py-3 px-8 text-sm flex items-center gap-2"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving Listing...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{isEditMode ? 'Update Listing' : 'Publish Listing'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default JobBuilder;
