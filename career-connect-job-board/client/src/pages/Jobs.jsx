import React, { useState, useEffect, useRef } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import API from '../services/api';
import { useToast } from '../context/ToastContext';
import { 
  Search, MapPin, DollarSign, Clock, Briefcase, Filter, 
  ChevronRight, ArrowLeft, ArrowRight, HelpCircle, Building 
} from 'lucide-react';
import { motion } from 'framer-motion';

const Jobs = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const routerLocation = useLocation();

  // Search URL Syncing helpers
  const getQueryParam = (param) => {
    return new URLSearchParams(routerLocation.search).get(param) || '';
  };

  const [jobs, setJobs] = useState([]);
  const [search, setSearch] = useState(getQueryParam('search'));
  const [location, setLocation] = useState(getQueryParam('location'));
  
  // Filter states
  const [type, setType] = useState('');
  const [remoteType, setRemoteType] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('');
  const [salaryMin, setSalaryMin] = useState('');
  
  // Pager settings
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const searchTimeoutRef = useRef(null);

  const fetchJobs = async (keyword = '', loc = '', filters = {}, pageNum = 1) => {
    setIsLoading(true);
    try {
      const query = new URLSearchParams({
        search: keyword,
        location: loc,
        type: filters.type || '',
        remoteType: filters.remoteType || '',
        experienceLevel: filters.experienceLevel || '',
        salaryMin: filters.salaryMin || '',
        page: pageNum,
        limit: 5, // 5 per page
      });

      const res = await API.get(`/jobs?${query.toString()}`);
      if (res.data.success) {
        setJobs(res.data.data);
        setTotalPages(res.data.totalPages || 1);
        setPage(res.data.currentPage || 1);
      }
    } catch (err) {
      addToast('Failed to fetch job listings', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Run on load and router change
  useEffect(() => {
    const filters = { type, remoteType, experienceLevel, salaryMin };
    fetchJobs(search, location, filters, 1);
  }, [routerLocation.search, type, remoteType, experienceLevel, salaryMin]);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearch(val);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      const filters = { type, remoteType, experienceLevel, salaryMin };
      fetchJobs(val, location, filters, 1);
    }, 450);
  };

  const handleLocationChange = (e) => {
    const val = e.target.value;
    setLocation(val);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      const filters = { type, remoteType, experienceLevel, salaryMin };
      fetchJobs(search, val, filters, 1);
    }, 450);
  };

  const handleClearFilters = () => {
    setSearch('');
    setLocation('');
    setType('');
    setRemoteType('');
    setExperienceLevel('');
    setSalaryMin('');
    fetchJobs('', '', {}, 1);
  };

  const getCompanyLogo = (company) => {
    if (company?.logo) {
      return company.logo.startsWith('http') ? company.logo : `http://localhost:5000${company.logo}`;
    }
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(company?.name || 'Company')}&background=15803d&color=fff&bold=true&size=64`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 relative">
      <div className="absolute top-10 left-10 w-48 h-48 bg-primary-500/5 rounded-full blur-2xl pointer-events-none"></div>

      <div className="text-center max-w-2xl mx-auto mb-10">
        <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white flex items-center justify-center gap-2 mb-2">
          <Briefcase className="w-8 h-8 text-primary-500" />
          Explore Job Openings
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          Browse through corporate openings, filter remote vacancies, and submit applications.
        </p>
      </div>

      {/* Search Header Form */}
      <div className="glass-card p-4 rounded-2xl border-slate-200/20 dark:border-slate-800/40 shadow-lg flex flex-col md:flex-row items-center gap-4 mb-8">
        <div className="w-full relative flex items-center">
          <Search className="absolute left-3.5 w-4.5 h-4.5 text-slate-450" />
          <input
            type="text"
            placeholder="Search titles, roles, keywords..."
            value={search}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-4 py-2.5 glass-input text-xs border-slate-200/50 dark:border-slate-800/40 focus:ring-1"
          />
        </div>

        <div className="w-full relative flex items-center">
          <MapPin className="absolute left-3.5 w-4.5 h-4.5 text-slate-455" />
          <input
            type="text"
            placeholder="Filter by city, state, country..."
            value={location}
            onChange={handleLocationChange}
            className="w-full pl-10 pr-4 py-2.5 glass-input text-xs border-slate-200/50 dark:border-slate-800/40 focus:ring-1"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Filters Sidebar Drawer */}
        <div className="lg:col-span-3">
          <div className="glass-card p-6 rounded-2xl border-slate-200/20 dark:border-slate-800/40 sticky top-24">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                <Filter className="w-4.5 h-4.5 text-primary-500" />
                Refine Search
              </h2>
              <button
                onClick={handleClearFilters}
                className="text-[10px] font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:underline"
              >
                Clear Filters
              </button>
            </div>

            <div className="space-y-4">
              
              {/* Type */}
              <div className="flex flex-col">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Employment Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="glass-input text-xs py-2 px-3 bg-slate-900 border border-slate-800 text-slate-100 cursor-pointer focus:ring-0"
                >
                  <option value="">All Types</option>
                  <option value="full-time">Full-time</option>
                  <option value="part-time">Part-time</option>
                  <option value="contract">Contract</option>
                  <option value="internship">Internship</option>
                </select>
              </div>

              {/* Remote */}
              <div className="flex flex-col">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Workplace Model</label>
                <select
                  value={remoteType}
                  onChange={(e) => setRemoteType(e.target.value)}
                  className="glass-input text-xs py-2 px-3 bg-slate-900 border border-slate-800 text-slate-100 cursor-pointer focus:ring-0"
                >
                  <option value="">All Workplace Models</option>
                  <option value="remote">Remote</option>
                  <option value="hybrid">Hybrid</option>
                  <option value="onsite">Onsite</option>
                </select>
              </div>

              {/* Level */}
              <div className="flex flex-col">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Experience Level</label>
                <select
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value)}
                  className="glass-input text-xs py-2 px-3 bg-slate-900 border border-slate-800 text-slate-100 cursor-pointer focus:ring-0"
                >
                  <option value="">All Levels</option>
                  <option value="entry">Entry Level</option>
                  <option value="mid">Mid Level</option>
                  <option value="senior">Senior Level</option>
                  <option value="lead">Lead/Director</option>
                </select>
              </div>

              {/* Salary Min */}
              <div className="flex flex-col">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5" /> Min Salary (USD/yr)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 50000"
                  value={salaryMin}
                  onChange={(e) => setSalaryMin(e.target.value)}
                  className="glass-input text-xs py-2 px-3"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right side: Results listings feed */}
        <div className="lg:col-span-9 space-y-5">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-xs text-slate-500">Searching listings...</p>
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-20 glass-card rounded-2xl p-8 border-slate-200/10 dark:border-slate-800">
              <HelpCircle className="w-12 h-12 text-slate-500 mx-auto mb-4" />
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">No job openings found</p>
              <p className="text-xs text-slate-500 mt-1">Try adapting your search titles or refine filters selection.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {jobs.map((job, idx) => (
                <motion.div
                  key={job._id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="glass-card glass-card-hover p-6 rounded-2xl flex flex-col justify-between border-slate-200/20 dark:border-slate-800/40 relative group"
                >
                  <div className="flex items-start gap-4">
                    <img
                      src={getCompanyLogo(job.company)}
                      alt={job.company?.name || 'Company Logo'}
                      className="w-12 h-12 rounded-xl object-cover border border-slate-200/20"
                    />
                    <div className="flex-grow text-left">
                      <h3 className="font-bold text-lg text-slate-800 dark:text-white group-hover:text-primary-500 dark:group-hover:text-primary-400 transition-colors">
                        {job.title}
                      </h3>
                      <p className="text-xs text-slate-500 font-semibold mt-0.5">{job.company?.name || 'Unknown Company'}</p>
                      
                      <div className="flex flex-wrap items-center gap-4 text-[10px] text-slate-500 font-semibold mt-3">
                        <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-slate-400" /> {job.location}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-slate-400" /> {job.type}</span>
                        <span className="flex items-center gap-1"><Briefcase className="w-3.5 h-3.5 text-slate-400" /> {job.remoteType}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-sm font-extrabold text-emerald-500">
                      ${job.salaryMin.toLocaleString()} - ${job.salaryMax.toLocaleString()} /yr
                    </span>
                    
                    <Link
                      to={`/job/${job._id}`}
                      className="inline-flex items-center gap-1 bg-primary-500/10 hover:bg-primary-500 text-primary-500 hover:text-white px-4 py-2 rounded-xl text-xs font-bold transition-all"
                    >
                      <span>View Details</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </motion.div>
              ))}

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-8 pt-4">
                  <button
                    disabled={page === 1}
                    onClick={() => {
                      const filters = { type, remoteType, experienceLevel, salaryMin };
                      fetchJobs(search, location, filters, page - 1);
                    }}
                    className="p-2 rounded-xl border border-slate-200/10 dark:border-slate-800/40 hover:bg-slate-100/10 text-slate-500 hover:text-slate-300 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  
                  <span className="text-xs font-bold text-slate-500">
                    Page {page} of {totalPages}
                  </span>

                  <button
                    disabled={page === totalPages}
                    onClick={() => {
                      const filters = { type, remoteType, experienceLevel, salaryMin };
                      fetchJobs(search, location, filters, page + 1);
                    }}
                    className="p-2 rounded-xl border border-slate-200/10 dark:border-slate-800/40 hover:bg-slate-100/10 text-slate-500 hover:text-slate-300 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Jobs;
