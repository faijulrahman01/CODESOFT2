import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../services/api';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const VerifyEmail = () => {
  const { token } = useParams();
  const [status, setStatus] = useState('loading'); // 'loading', 'success', 'error'
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const res = await API.get(`/auth/verify/${token}`);
        if (res.data.success) {
          setStatus('success');
          setMessage(res.data.message || 'Email verified successfully!');
        }
      } catch (err) {
        setStatus('error');
        setMessage(err.response?.data?.message || 'Verification token is invalid or expired.');
      }
    };
    verifyToken();
  }, [token]);

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 relative">
      <div className="absolute top-10 left-10 w-48 h-48 bg-primary-500/5 rounded-full blur-2xl pointer-events-none"></div>

      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md glass-card p-8 rounded-2xl border-slate-200/20 dark:border-slate-800/40 text-center shadow-xl"
      >
        {status === 'loading' && (
          <div className="space-y-4 py-6">
            <Loader2 className="w-12 h-12 text-primary-500 animate-spin mx-auto" />
            <h2 className="text-lg font-bold text-slate-800 dark:text-white">Verifying Email Address</h2>
            <p className="text-xs text-slate-500">Connecting to server to evaluate authentication token...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-6 py-4">
            <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto animate-bounce" />
            <div>
              <h2 className="text-xl font-extrabold text-slate-800 dark:text-white">Verification Complete!</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">{message}</p>
            </div>
            <Link to="/login" className="btn-primary py-2.5 px-6 text-xs inline-block">
              Proceed to Sign In
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-6 py-4">
            <AlertCircle className="w-16 h-16 text-rose-500 mx-auto" />
            <div>
              <h2 className="text-xl font-extrabold text-slate-800 dark:text-white">Verification Failed</h2>
              <p className="text-xs text-rose-500 mt-2 font-semibold">{message}</p>
            </div>
            <Link to="/register" className="btn-secondary py-2 px-6 text-xs inline-block">
              Back to Sign Up
            </Link>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default VerifyEmail;
