import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Search, MapPin, Briefcase, ChevronRight, TrendingUp, 
  Users, Building, DollarSign, Star, Award, ShieldCheck 
} from 'lucide-react';
import { motion } from 'framer-motion';

const Home = () => {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const query = new URLSearchParams();
    if (keyword) query.append('search', keyword);
    if (location) query.append('location', location);
    navigate(`/jobs?${query.toString()}`);
  };

  const categories = [
    { name: 'Technology & IT', count: '1,420+ open jobs', icon: Briefcase, color: 'from-green-500/20 to-emerald-500/20' },
    { name: 'Finance & Banking', count: '640+ open jobs', icon: DollarSign, color: 'from-blue-500/20 to-indigo-500/20' },
    { name: 'Marketing & Design', count: '890+ open jobs', icon: Star, color: 'from-purple-500/20 to-pink-500/20' },
    { name: 'Healthcare & Life', count: '310+ open jobs', icon: Award, color: 'from-rose-500/20 to-orange-500/20' },
  ];

  const featuredJobs = [
    { id: '1', title: 'Senior Full Stack MERN Developer', company: 'TechVibe Solutions', location: 'San Francisco, CA', type: 'Full-time', salary: '$120k - $150k', tags: ['React', 'Node.js', 'MongoDB'] },
    { id: '2', title: 'Lead UI/UX Product Designer', company: 'Invision Labs', location: 'Remote', type: 'Full-time', salary: '$100k - $130k', tags: ['Framer', 'Figma', 'SaaS'] },
    { id: '3', title: 'Data Science Internship', company: 'Analytics Corp', location: 'New York, NY', type: 'Internship', salary: '$35/hr - $45/hr', tags: ['Python', 'SQL', 'Pandas'] },
  ];

  const testimonials = [
    { text: "CareerConnect changed my life. I uploaded my resume, and within a week, I was interviewed and hired by a top Silicon Valley startup.", author: "Sarah Jenkins", role: "Software Engineer at Stripe" },
    { text: "Recruiting has never been this simple. We posted our developer vacancies and immediately matched with verified, highly skilled candidates.", author: "Marcus Thorne", role: "HR Director at TechVibe" },
  ];

  return (
    <div className="relative overflow-hidden">
      {/* Decorative Blur Spheres */}
      <div className="absolute top-20 left-10 w-96 h-96 bg-primary-500/5 dark:bg-primary-500/10 rounded-full blur-3xl pointer-events-none animate-pulse-slow"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-3xl pointer-events-none animate-pulse-slow" style={{ animationDelay: '2s' }}></div>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-flex items-center gap-1.5 px-3 py-1 border border-primary-500/35 bg-primary-500/5 text-primary-500 dark:text-primary-400 rounded-full text-xs font-semibold mb-6">
            <ShieldCheck className="w-3.5 h-3.5" />
            Verified Job Board Platform
          </span>
          
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-800 dark:text-white leading-tight">
            Discover Your Next <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-primary-500 to-emerald-400 bg-clip-text text-transparent">Career Milestone</span>
          </h1>
          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-500 dark:text-slate-400 mt-4 sm:mt-6 leading-relaxed">
            CareerConnect bridges the gap between top talent and commercial teams. Create a profile, upload your resume, and discover full-time or remote vacancies.
          </p>
        </motion.div>

        {/* Floating Search Controls */}
        <motion.form
          onSubmit={handleSearchSubmit}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-4xl mx-auto mt-12 p-3 rounded-2xl glass-card border-slate-200/50 dark:border-slate-800/40 shadow-xl flex flex-col sm:flex-row items-center gap-3"
        >
          {/* Keyword Search */}
          <div className="w-full relative flex items-center">
            <Search className="absolute left-4.5 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Job title, keywords, or company..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-transparent border-none focus:outline-none focus:ring-0 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600"
            />
          </div>

          {/* Separator */}
          <div className="hidden sm:block h-8 w-px bg-slate-200 dark:bg-slate-850"></div>

          {/* Location Search */}
          <div className="w-full relative flex items-center">
            <MapPin className="absolute left-4.5 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="City, state, or remote..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-transparent border-none focus:outline-none focus:ring-0 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600"
            />
          </div>

          {/* Search CTA */}
          <button
            type="submit"
            className="w-full sm:w-auto btn-primary py-3 px-8 text-sm flex items-center justify-center gap-1.5 whitespace-nowrap"
          >
            <span>Search Jobs</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </motion.form>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mt-20">
          {[
            { label: 'Live Vacancies', val: '12,500+', icon: Briefcase, text: 'text-primary-500' },
            { label: 'Active Employers', val: '1,800+', icon: Building, text: 'text-sky-500' },
            { label: 'Resumes Submitted', val: '95,000+', icon: Users, text: 'text-purple-500' },
            { label: 'Matched Candidates', val: '43,000+', icon: TrendingUp, text: 'text-emerald-500' },
          ].map((stat, idx) => (
            <div key={idx} className="glass-card p-5 rounded-2xl border-slate-200/20 dark:border-slate-800/40 text-left">
              <span className={`inline-block p-2 rounded-xl bg-slate-100 dark:bg-slate-900/50 mb-3 ${stat.text}`}>
                <stat.icon className="w-4.5 h-4.5" />
              </span>
              <p className="text-2xl font-extrabold text-slate-800 dark:text-white leading-none">{stat.val}</p>
              <p className="text-[10px] text-slate-450 dark:text-slate-500 font-bold uppercase tracking-wider mt-1.5">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Categories Grid */}
      <section className="bg-slate-100/30 dark:bg-slate-900/10 border-y border-slate-200/20 dark:border-slate-850 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-extrabold text-slate-800 dark:text-white">Explore Categories</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
              Browse job openings grouped by professional sectors. Find specialized opportunities.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((cat, idx) => (
              <div
                key={idx}
                className="glass-card glass-card-hover p-6 rounded-2xl flex flex-col justify-between border-slate-200/20 dark:border-slate-800/40"
              >
                <div>
                  <span className={`inline-flex p-3.5 rounded-2xl bg-gradient-to-tr ${cat.color} text-slate-800 dark:text-white mb-4`}>
                    <cat.icon className="w-6 h-6 text-primary-500 dark:text-primary-400" />
                  </span>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white">{cat.name}</h3>
                </div>
                <p className="text-xs font-bold text-slate-450 dark:text-slate-500 mt-4 flex items-center gap-1">
                  <span>{cat.count}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Jobs Preview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-800 dark:text-white">Featured Openings</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
              Review highlighted, high-paying vacancies active in our network today.
            </p>
          </div>
          <Link
            to="/jobs"
            className="text-sm font-bold text-primary-500 hover:text-primary-400 hover:underline flex items-center gap-1"
          >
            <span>Explore All Jobs</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredJobs.map((job) => (
            <div
              key={job.id}
              className="glass-card glass-card-hover p-6 rounded-2xl flex flex-col justify-between border-slate-200/20 dark:border-slate-800/40 relative group"
            >
              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white group-hover:text-primary-500 dark:group-hover:text-primary-400 transition-colors">
                  {job.title}
                </h3>
                <p className="text-xs text-slate-400 font-semibold mt-1">{job.company}</p>
                <div className="flex items-center gap-3 mt-4 text-[10px] text-slate-500">
                  <span className="bg-slate-100 dark:bg-slate-900/50 px-2 py-0.5 rounded-md font-bold uppercase">{job.type}</span>
                  <span>{job.location}</span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-850 flex items-center justify-between">
                <span className="text-sm font-extrabold text-emerald-500">{job.salary}</span>
                <Link
                  to="/jobs"
                  className="p-2 text-slate-400 hover:text-primary-500 hover:bg-slate-100/50 dark:hover:bg-slate-800/40 rounded-xl transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-slate-100/30 dark:bg-slate-900/10 border-y border-slate-200/20 dark:border-slate-850 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-extrabold text-slate-800 dark:text-white leading-tight">
                Empowering Teams & Talent Globally
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-4 leading-relaxed">
                Read feedback from engineers, designers, and hiring managers who landed career opportunities and built engineering teams via CareerConnect.
              </p>
              
              <div className="flex items-center gap-3 mt-8">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="w-5 h-5 fill-current text-yellow-500" />
                ))}
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 ml-2">5/5 Average Review Rate</span>
              </div>
            </div>

            <div className="space-y-6">
              {testimonials.map((test, index) => (
                <div
                  key={index}
                  className="glass-card p-6 rounded-2xl border-slate-200/10 dark:border-slate-800/40"
                >
                  <p className="text-sm text-slate-500 dark:text-slate-350 italic">"{test.text}"</p>
                  <div className="mt-4 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary-500 text-white font-bold text-xs flex items-center justify-center">
                      {test.author[0]}
                    </div>
                    <div>
                      <p className="text-xs font-extrabold text-slate-800 dark:text-slate-200">{test.author}</p>
                      <p className="text-[10px] text-slate-450 dark:text-slate-500">{test.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Footer Action */}
      <section className="max-w-5xl mx-auto px-4 py-20 text-center relative z-10">
        <div className="glass-card p-10 rounded-3xl border-slate-200/20 dark:border-slate-800/40 relative overflow-hidden bg-gradient-to-tr dark:from-slate-905 dark:to-slate-950">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-855 dark:text-white leading-tight">
            Ready to Build Your Engineering Career?
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-450 max-w-xl mx-auto mt-4 leading-relaxed">
            Create an account today, build your professional resume, list your education and experience skills, and match with verified employers.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
            <Link
              to="/register"
              className="btn-primary w-full sm:w-auto px-8 py-3 text-sm flex items-center justify-center gap-1.5"
            >
              <span>Join as Candidate</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
            
            <Link
              to="/register"
              state={{ role: 'employer' }}
              className="btn-secondary w-full sm:w-auto px-8 py-3 text-sm flex items-center justify-center gap-1.5"
            >
              <span>Hire on CareerConnect</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
