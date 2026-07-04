import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../context/ToastContext';
import API from '../services/api';
import { 
  ShieldAlert, Users, Briefcase, FileText, Trash2, Building, 
  Check, X, Loader2, Award, Clock, HelpCircle 
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [jobsList, setJobsList] = useState([]);
  const [activeTab, setActiveTab] = useState('users'); // 'users', 'jobs'
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchAdminData = async () => {
    setIsLoading(true);
    try {
      const statsRes = await API.get('/admin/stats');
      const usersRes = await API.get('/admin/users');
      const jobsRes = await API.get('/admin/jobs');

      if (statsRes.data.success) setStats(statsRes.data.data);
      if (usersRes.data.success) setUsersList(usersRes.data.data);
      if (jobsRes.data.success) setJobsList(jobsRes.data.data);
    } catch (err) {
      addToast('Failed to load admin controls', 'error');
      navigate('/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role !== 'admin') {
      addToast('Unauthorized access blocked', 'warning');
      navigate('/');
      return;
    }
    fetchAdminData();
  }, [user]);

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to permanently delete this user account? This will cascade delete their postings and applications.')) {
      return;
    }

    setIsDeleting(true);
    try {
      const res = await API.delete(`/admin/users/${userId}`);
      if (res.data.success) {
        addToast('User account successfully removed', 'success');
        setUsersList(usersList.filter(u => u._id !== userId));
        // Refresh metrics
        const statsRes = await API.get('/admin/stats');
        if (statsRes.data.success) setStats(statsRes.data.data);
      }
    } catch (err) {
      addToast('Failed to delete user account', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job listing?')) {
      return;
    }

    setIsDeleting(true);
    try {
      const res = await API.delete(`/admin/jobs/${jobId}`);
      if (res.data.success) {
        addToast('Job listing removed successfully', 'success');
        setJobsList(jobsList.filter(j => j._id !== jobId));
        
        // Refresh metrics
        const statsRes = await API.get('/admin/stats');
        if (statsRes.data.success) setStats(statsRes.data.data);
      }
    } catch (err) {
      addToast('Failed to delete job listing', 'error');
    } finally {
      setIsDeleting(false);
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
    <div className="max-w-7xl mx-auto px-4 py-8 relative">
      <div className="absolute top-10 left-10 w-48 h-48 bg-rose-500/5 rounded-full blur-2xl pointer-events-none"></div>

      {/* Header */}
      <div className="border-b border-slate-200/10 pb-6 mb-8 flex items-center gap-3">
        <span className="p-3 bg-rose-500/10 text-rose-500 rounded-xl">
          <ShieldAlert className="w-7 h-7" />
        </span>
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white leading-tight">Admin Moderation Console</h1>
          <p className="text-sm text-slate-500 mt-1">Platform-wide content moderation, metrics analytics, and profile evaluations.</p>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 mb-10">
          <div className="glass-card p-5 rounded-2xl border-slate-200/10">
            <div className="flex items-center justify-between text-slate-450">
              <span className="text-[10px] font-bold uppercase tracking-wider">Total Users</span>
              <span className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900/50 text-slate-500"><Users className="w-4 h-4" /></span>
            </div>
            <p className="text-2xl font-extrabold mt-2 text-slate-700 dark:text-white">{stats.users.total}</p>
            <div className="flex items-center gap-2 mt-2 text-[9px] font-bold text-slate-500 uppercase tracking-wide">
              <span className="text-emerald-500">{stats.users.candidates} candidates</span>
              <span>•</span>
              <span className="text-sky-500">{stats.users.employers} employers</span>
            </div>
          </div>

          <div className="glass-card p-5 rounded-2xl border-slate-200/10">
            <div className="flex items-center justify-between text-slate-455">
              <span className="text-[10px] font-bold uppercase tracking-wider">Job Listings</span>
              <span className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900/50 text-slate-500"><Briefcase className="w-4 h-4" /></span>
            </div>
            <p className="text-2xl font-extrabold mt-2 text-slate-700 dark:text-white">{stats.jobs.total}</p>
            <p className="text-[9px] font-bold text-slate-500 mt-2 uppercase tracking-wide">
              <span className="text-emerald-500">{stats.jobs.active} active listings</span>
            </p>
          </div>

          <div className="glass-card p-5 rounded-2xl border-slate-200/10">
            <div className="flex items-center justify-between text-slate-455">
              <span className="text-[10px] font-bold uppercase tracking-wider">Registered Companies</span>
              <span className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900/50 text-slate-500"><Building className="w-4 h-4" /></span>
            </div>
            <p className="text-2xl font-extrabold mt-2 text-slate-700 dark:text-white">{stats.totalCompanies}</p>
            <p className="text-[9px] font-bold text-slate-500 mt-2 uppercase">Business profiles</p>
          </div>

          <div className="glass-card p-5 rounded-2xl border-slate-200/10">
            <div className="flex items-center justify-between text-slate-455">
              <span className="text-[10px] font-bold uppercase tracking-wider">Applications Submitted</span>
              <span className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900/50 text-slate-500"><FileText className="w-4 h-4" /></span>
            </div>
            <p className="text-2xl font-extrabold mt-2 text-slate-700 dark:text-white">{stats.totalApplications}</p>
            <p className="text-[9px] font-bold text-slate-500 mt-2 uppercase">Submissions matching</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-250/20 dark:border-slate-800/40 mb-6">
        <button
          onClick={() => setActiveTab('users')}
          className={`py-3 px-6 text-sm font-bold border-b-2 transition-colors ${
            activeTab === 'users'
              ? 'border-rose-500 text-rose-500'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-350'
          }`}
        >
          Manage Users ({usersList.length})
        </button>
        <button
          onClick={() => setActiveTab('jobs')}
          className={`py-3 px-6 text-sm font-bold border-b-2 transition-colors ${
            activeTab === 'jobs'
              ? 'border-rose-500 text-rose-500'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-350'
          }`}
        >
          Manage Job Listings ({jobsList.length})
        </button>
      </div>

      {/* Lists */}
      <div>
        {activeTab === 'users' ? (
          <div className="glass-card rounded-2xl border-slate-200/10 dark:border-slate-800/40 overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200/10 bg-slate-100/5 dark:bg-slate-900/50 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="p-4">Name</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Role</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Registered Date</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {usersList.map((usr) => (
                    <tr key={usr._id} className="border-b border-slate-100 dark:border-slate-850 hover:bg-slate-100/5 dark:hover:bg-slate-900/10">
                      <td className="p-4 font-bold text-slate-800 dark:text-slate-200">{usr.name}</td>
                      <td className="p-4 text-slate-550 dark:text-slate-400">{usr.email}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded-md font-bold uppercase text-[9px] ${
                          usr.role === 'admin' ? 'bg-rose-500/10 text-rose-500' :
                          usr.role === 'employer' ? 'bg-sky-500/10 text-sky-500' :
                          'bg-emerald-500/10 text-emerald-500'
                        }`}>
                          {usr.role}
                        </span>
                      </td>
                      <td className="p-4">
                        {usr.isVerified ? (
                          <span className="text-[10px] text-emerald-500 font-semibold flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" /> Verified
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-450 font-semibold flex items-center gap-1">
                            <X className="w-3.5 h-3.5" /> Unverified
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-slate-500">{new Date(usr.createdAt).toLocaleDateString()}</td>
                      <td className="p-4 text-right">
                        {usr.role !== 'admin' && (
                          <button
                            onClick={() => handleDeleteUser(usr._id)}
                            disabled={isDeleting}
                            className="p-1.5 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors inline-flex items-center"
                            title="Delete User Account"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="glass-card rounded-2xl border-slate-200/10 dark:border-slate-800/40 overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200/10 bg-slate-100/5 dark:bg-slate-900/50 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="p-4">Job Title</th>
                    <th className="p-4">Company</th>
                    <th className="p-4">Publisher</th>
                    <th className="p-4">Arrangement</th>
                    <th className="p-4">Created Date</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {jobsList.map((job) => (
                    <tr key={job._id} className="border-b border-slate-100 dark:border-slate-850 hover:bg-slate-100/5 dark:hover:bg-slate-900/10">
                      <td className="p-4 font-bold text-slate-800 dark:text-slate-200">
                        <Link to={`/job/${job._id}`} className="hover:text-primary-500 dark:hover:text-primary-400 transition-colors">
                          {job.title}
                        </Link>
                      </td>
                      <td className="p-4 text-slate-550 dark:text-slate-400">{job.company?.name || 'Deleted Company'}</td>
                      <td className="p-4">
                        <div className="leading-tight">
                          <p className="font-semibold text-slate-800 dark:text-slate-350">{job.creator?.name || 'Recruiter'}</p>
                          <p className="text-[10px] text-slate-500">{job.creator?.email || 'N/A'}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-[10px] uppercase font-bold text-slate-500">
                          {job.type} • {job.remoteType}
                        </span>
                      </td>
                      <td className="p-4 text-slate-500">{new Date(job.createdAt).toLocaleDateString()}</td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleDeleteJob(job._id)}
                          disabled={isDeleting}
                          className="p-1.5 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors inline-flex items-center"
                          title="Delete Listing"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
