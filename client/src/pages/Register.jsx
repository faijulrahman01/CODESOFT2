import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../context/ToastContext';
import { User, Mail, Lock, Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const Register = () => {
  const { register } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // Pick default role from redirect state if available (e.g. from CTA click)
  const defaultRole = location.state?.role || 'candidate';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState(defaultRole);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password) {
      addToast('Please fill in all inputs', 'warning');
      return;
    }

    if (password.length < 6) {
      addToast('Password must be at least 6 characters', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await register(name, email, password, role);
      if (res.success) {
        addToast('Registration successful! Please login.', 'success');
        navigate('/login');
      }
    } catch (err) {
      addToast(err || 'Registration failed', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-8 relative">
      <div className="absolute top-20 left-10 w-48 h-48 bg-primary-500/5 rounded-full blur-2xl pointer-events-none"></div>

      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md glass-card p-8 rounded-2xl border-slate-200/20 dark:border-slate-800/40 shadow-xl"
      >
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 font-extrabold text-2xl bg-gradient-to-r from-primary-500 to-emerald-400 bg-clip-text text-transparent mb-4">
            <img src="/src/assets/logo.svg" alt="Logo" className="w-6 h-6" />
            <span>CareerConnect</span>
          </Link>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">Create Your Account</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">Join CareerConnect today to discover active listings or recruit talent.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Role selector buttons */}
          <div className="grid grid-cols-2 gap-3 mb-2 p-1.5 rounded-xl border border-slate-200/10 dark:border-slate-800 bg-slate-900/5 dark:bg-slate-950/20">
            <button
              type="button"
              onClick={() => setRole('candidate')}
              className={`py-2 text-xs font-bold rounded-lg transition-all ${
                role === 'candidate'
                  ? 'bg-primary-500 text-white shadow-md'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-350'
              }`}
            >
              Candidate
            </button>
            <button
              type="button"
              onClick={() => setRole('employer')}
              className={`py-2 text-xs font-bold rounded-lg transition-all ${
                role === 'employer'
                  ? 'bg-primary-500 text-white shadow-md'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-350'
              }`}
            >
              Employer
            </button>
          </div>

          {/* Full Name */}
          <div className="flex flex-col">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 ml-1">Full Name</label>
            <div className="relative flex items-center">
              <User className="absolute left-4 w-4.5 h-4.5 text-slate-400" />
              <input
                type="text"
                required
                placeholder="e.g. John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-11 pr-4 py-3 glass-input text-xs"
              />
            </div>
          </div>

          {/* Email Address */}
          <div className="flex flex-col">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 ml-1">Email Address</label>
            <div className="relative flex items-center">
              <Mail className="absolute left-4 w-4.5 h-4.5 text-slate-400" />
              <input
                type="email"
                required
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3 glass-input text-xs"
              />
            </div>
          </div>

          {/* Password */}
          <div className="flex flex-col">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 ml-1">Create Password</label>
            <div className="relative flex items-center">
              <Lock className="absolute left-4 w-4.5 h-4.5 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Min 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-11 py-3 glass-input text-xs"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 text-slate-400 hover:text-slate-200 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full btn-primary py-3 flex items-center justify-center gap-1.5 mt-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Creating Account...</span>
              </>
            ) : (
              <>
                <span>Create Account</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <p className="text-xs text-slate-500 text-center mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-500 font-bold hover:underline hover:text-primary-400">
            Sign In
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Register;
