import React from 'react';
import { useAuth } from '../hooks/useAuth';
import CandidateDashboard from './CandidateDashboard';
import EmployerDashboard from './EmployerDashboard';
import AdminDashboard from './AdminDashboard';

const DashboardRedirect = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (user?.role === 'admin') {
    return <AdminDashboard />;
  }

  if (user?.role === 'employer') {
    return <EmployerDashboard />;
  }

  // Default fallback for candidate
  return <CandidateDashboard />;
};

export default DashboardRedirect;
