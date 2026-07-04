import React, { useContext, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ThemeContext } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { 
  Sun, Moon, LogOut, User as UserIcon, Briefcase, 
  Building2, LayoutDashboard, Menu, X, ArrowRight 
} from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();
  const location = useLocation();
  const { addToast } = useToast();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    addToast('Logged out successfully', 'success');
    navigate('/login');
    setProfileOpen(false);
    setMobileOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  // Determine dashboard link based on role
  const getDashboardLink = () => {
    if (!user) return '/login';
    if (user.role === 'admin') return '/admin';
    return '/dashboard'; // Dynamic loader redirects candidate vs employer
  };

  const navLinks = [
    { name: 'Find Jobs', path: '/jobs', icon: Briefcase },
  ];

  if (user) {
    navLinks.unshift({ name: 'Dashboard', path: getDashboardLink(), icon: LayoutDashboard });
  }

  const getAvatarUrl = () => {
    if (user?.avatar) {
      return user.avatar.startsWith('http') ? user.avatar : `http://localhost:5000${user.avatar}`;
    }
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=22c55e&color=fff&bold=true`;
  };

  return (
    <nav className="sticky top-0 z-[1000] w-full border-b border-white/10 dark:border-slate-800/40 bg-white/75 dark:bg-slate-950/60 backdrop-blur-md transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 font-extrabold text-2xl bg-gradient-to-r from-primary-500 to-emerald-400 bg-clip-text text-transparent hover:opacity-90 transition-opacity">
            <img src="/src/assets/logo.svg" alt="CareerConnect Logo" className="w-7 h-7" />
            <span>CareerConnect</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    isActive(link.path)
                      ? 'bg-primary-500/10 text-primary-500 dark:text-primary-400'
                      : 'text-slate-600 dark:text-slate-350 hover:bg-slate-100/50 dark:hover:bg-slate-800/30 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Right Area Actions */}
          <div className="hidden md:flex items-center gap-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 p-1.5 pr-3 rounded-full hover:bg-slate-150 dark:hover:bg-slate-900 border border-slate-200/50 dark:border-slate-800/40 transition-colors"
                >
                  <img
                    src={getAvatarUrl()}
                    alt={user.name}
                    className="w-7.5 h-7.5 rounded-full object-cover border border-primary-500/20"
                  />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200 max-w-[100px] truncate">
                    {user.name.split(' ')[0]}
                  </span>
                  <span className="text-[9px] uppercase font-extrabold px-1.5 py-0.5 bg-primary-500/10 text-primary-500 rounded-md">
                    {user.role}
                  </span>
                </button>

                {profileOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setProfileOpen(false)}></div>
                    <div className="absolute right-0 mt-2 w-48 rounded-xl border border-white/10 dark:border-slate-850 bg-white dark:bg-slate-900 shadow-xl py-1.5 z-20">
                      <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800/40">
                        <p className="text-[10px] text-slate-400 font-semibold">Welcome back</p>
                        <p className="text-xs font-bold text-slate-750 dark:text-slate-250 truncate">{user.name}</p>
                      </div>
                      
                      <Link
                        to="/profile"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-250 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors"
                      >
                        <UserIcon className="w-4 h-4 text-slate-450" />
                        <span>Profile Settings</span>
                      </Link>

                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2.5 w-full text-left px-4 py-2.5 text-xs font-bold text-rose-500 hover:bg-rose-500/5 dark:hover:bg-rose-950/20 border-t border-slate-100 dark:border-slate-800/40"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Log Out</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-355 hover:bg-slate-100/50 dark:hover:bg-slate-800/30 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="btn-primary py-2 px-5 text-sm flex items-center gap-1.5 shadow-md shadow-primary-500/10"
                >
                  Get Started
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Drawer Trigger */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors"
            >
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 rounded-xl text-slate-655 dark:text-slate-400 hover:bg-slate-150 dark:hover:bg-slate-850"
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-slate-200/50 dark:border-slate-800/40 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md py-4 px-4 space-y-2 shadow-lg">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                  isActive(link.path)
                    ? 'bg-primary-500/10 text-primary-500 dark:text-primary-400'
                    : 'text-slate-600 dark:text-slate-350 hover:bg-slate-100/50 dark:hover:bg-slate-800/40'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{link.name}</span>
              </Link>
            );
          })}

          {user ? (
            <div className="border-t border-slate-100 dark:border-slate-800/40 pt-3 mt-3 space-y-2">
              <div className="flex items-center gap-3 px-4 py-1.5">
                <img
                  src={getAvatarUrl()}
                  alt={user.name}
                  className="w-9 h-9 rounded-full object-cover border border-primary-500/20"
                />
                <div>
                  <p className="text-xs font-bold text-slate-750 dark:text-slate-200 leading-tight">{user.name}</p>
                  <p className="text-[10px] text-slate-450 truncate">{user.email}</p>
                </div>
              </div>
              <Link
                to="/profile"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100/50 dark:hover:bg-slate-800/40"
              >
                <UserIcon className="w-5 h-5 text-slate-400" />
                <span>Profile Settings</span>
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 w-full text-left px-4 py-3 rounded-xl text-sm font-bold text-rose-500 hover:bg-rose-500/5 dark:hover:bg-rose-950/15"
              >
                <LogOut className="w-5 h-5" />
                <span>Log Out</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 pt-3 mt-3 border-t border-slate-100 dark:border-slate-800/40">
              <Link
                to="/login"
                onClick={() => setMobileOpen(false)}
                className="flex justify-center items-center px-4 py-3 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-850 hover:bg-slate-100/50 dark:hover:bg-slate-800/30 transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileOpen(false)}
                className="flex justify-center items-center px-4 py-3 rounded-xl text-xs font-bold bg-primary-600 text-white shadow-md shadow-primary-500/10"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
