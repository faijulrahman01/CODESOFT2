import React, { useState, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../context/ToastContext';
import API from '../services/api';
import { 
  User, Mail, Lock, Upload, Save, Loader2, ArrowLeft 
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const { user, setUser } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef(null);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      addToast('Name and email are required', 'warning');
      return;
    }

    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('email', email);
      
      if (newPassword) {
        if (!currentPassword) {
          addToast('Please enter your current password to set a new password', 'warning');
          setIsSaving(false);
          return;
        }
        formData.append('currentPassword', currentPassword);
        formData.append('newPassword', newPassword);
      }

      if (avatarFile) {
        formData.append('avatar', avatarFile);
      }

      const res = await API.put('/auth/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success) {
        addToast('Profile updated successfully!', 'success');
        
        // Sync context
        const updatedUser = {
          ...res.data.data,
          token: user.token, // preserve token
        };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        setCurrentPassword('');
        setNewPassword('');
        setAvatarFile(null);
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update profile settings', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const getAvatarUrl = () => {
    if (avatarPreview) return avatarPreview;
    if (user?.avatar) {
      return user.avatar.startsWith('http') ? user.avatar : `http://localhost:5000${user.avatar}`;
    }
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'User')}&background=22c55e&color=fff&bold=true&size=128`;
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 relative">
      <div className="absolute top-10 left-10 w-48 h-48 bg-primary-500/5 rounded-full blur-2xl pointer-events-none"></div>

      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-350 transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-8 rounded-2xl border-slate-200/20 dark:border-slate-800/40"
      >
        <div className="border-b border-slate-200/10 pb-6 mb-8 flex items-center gap-3">
          <span className="p-3 bg-primary-500/10 text-primary-500 rounded-xl">
            <User className="w-6 h-6" />
          </span>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white">Account Settings</h1>
            <p className="text-xs text-slate-500 mt-0.5">Manage your user profile details, email credentials, and login passwords.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar Photo */}
          <div className="flex flex-col items-center justify-center mb-6">
            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current.click()}>
              <img
                src={getAvatarUrl()}
                alt={name}
                className="w-24 h-24 rounded-full object-cover border border-slate-200/30 dark:border-slate-800/40 group-hover:opacity-75 transition-opacity"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                <Upload className="w-5 h-5 text-white" />
              </div>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleAvatarChange}
              accept="image/*"
              className="hidden"
            />
            <p className="text-xs text-slate-500 mt-2">Click photo to upload avatar</p>
          </div>

          {/* Name & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 ml-1">Display Name</label>
              <div className="relative flex items-center">
                <User className="absolute left-4 w-4.5 h-4.5 text-slate-400" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 glass-input text-xs"
                />
              </div>
            </div>

            <div className="flex flex-col">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 ml-1">Email Address</label>
              <div className="relative flex items-center">
                <Mail className="absolute left-4 w-4.5 h-4.5 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 glass-input text-xs"
                />
              </div>
            </div>
          </div>

          {/* Password update segment */}
          <div className="border-t border-slate-200/10 pt-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Change Password</h3>
            <p className="text-[11px] text-slate-500 leading-tight">Leave these inputs blank if you do not wish to update your login password.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 ml-1">Current Password</label>
                <div className="relative flex items-center">
                  <Lock className="absolute left-4 w-4.5 h-4.5 text-slate-400" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 glass-input text-xs"
                  />
                </div>
              </div>

              <div className="flex flex-col">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 ml-1">New Password</label>
                <div className="relative flex items-center">
                  <Lock className="absolute left-4 w-4.5 h-4.5 text-slate-400" />
                  <input
                    type="password"
                    placeholder="Min 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 glass-input text-xs"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-200/10">
            <button
              type="submit"
              disabled={isSaving}
              className="btn-primary py-3 px-8 text-xs flex items-center gap-1.5 shadow-md shadow-primary-500/10"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving Settings...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Account Details</span>
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default Profile;
