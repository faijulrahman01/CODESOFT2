import React, { useState, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../context/ToastContext';
import { User, Mail, FileText, Lock, Upload, Loader2, Save } from 'lucide-react';
import { motion } from 'framer-motion';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const { addToast } = useToast();

  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2000000) {
        addToast('File size must be less than 2MB', 'error');
        return;
      }
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleTriggerUpload = () => {
    fileInputRef.current.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      addToast('Name is required', 'warning');
      return;
    }

    if (password && password.length < 6) {
      addToast('New password must be at least 6 characters', 'warning');
      return;
    }

    if (password !== confirmPassword) {
      addToast('Passwords do not match', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('bio', bio);
      
      if (avatarFile) {
        formData.append('avatar', avatarFile);
      }
      
      if (password) {
        formData.append('password', password);
      }

      await updateProfile(formData);
      addToast('Profile updated successfully!', 'success');
      setPassword('');
      setConfirmPassword('');
      setAvatarFile(null);
    } catch (err) {
      addToast(err || 'Failed to update profile', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper for current avatar
  const getAvatarUrl = () => {
    if (avatarPreview) return avatarPreview;
    if (user?.avatar) {
      return user.avatar.startsWith('http') ? user.avatar : `http://localhost:5000${user.avatar}`;
    }
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=0ea5e9&color=fff&bold=true&size=128`;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 relative">
      <div className="absolute top-10 left-10 w-48 h-48 bg-primary-500/5 rounded-full blur-2xl pointer-events-none"></div>
      
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel p-8 rounded-2xl border-slate-200/20 dark:border-slate-800/40"
      >
        <div className="border-b border-slate-200/10 pb-6 mb-8">
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white">Profile Settings</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Update your personal details, biography, and profile avatar.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Column: Avatar Upload */}
          <div className="flex flex-col items-center justify-start text-center p-4 border border-slate-200/10 dark:border-slate-850 bg-slate-900/10 dark:bg-slate-950/20 rounded-2xl">
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-4">Profile Picture</h2>
            <div className="relative group cursor-pointer" onClick={handleTriggerUpload}>
              <img
                src={getAvatarUrl()}
                alt={user?.name}
                className="w-32 h-32 rounded-full object-cover border-2 border-primary-500/30 group-hover:opacity-75 transition-opacity"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                <Upload className="w-6 h-6 text-white" />
              </div>
            </div>
            
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
            
            <button
              type="button"
              onClick={handleTriggerUpload}
              className="btn-secondary py-1.5 px-4 text-xs mt-4 flex items-center gap-1.5"
            >
              <Upload className="w-3.5 h-3.5" />
              Upload Image
            </button>
            <p className="text-[10px] text-slate-500 mt-2">JPG, PNG, GIF or WEBP. Max 2MB.</p>
          </div>

          {/* Right Columns: Forms */}
          <div className="md:col-span-2 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Name */}
              <div className="flex flex-col">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-350 mb-1 ml-1">Full Name</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 dark:text-slate-500">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 glass-input text-sm border-slate-200/50 dark:border-slate-800/40"
                  />
                </div>
              </div>

              {/* Email (Read Only) */}
              <div className="flex flex-col">
                <label className="text-sm font-semibold text-slate-550 dark:text-slate-400 mb-1 ml-1">Email (Immutable)</label>
                <div className="relative opacity-60">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 dark:text-slate-500">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    type="email"
                    disabled
                    value={user?.email || ''}
                    className="w-full pl-10 pr-4 py-2.5 glass-input text-sm border-slate-200/50 dark:border-slate-800/40 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            {/* Bio */}
            <div className="flex flex-col">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-355 mb-1 ml-1">Biography / About Me</label>
              <div className="relative">
                <span className="absolute top-3 left-3.5 text-slate-400 dark:text-slate-500">
                  <FileText className="w-4 h-4" />
                </span>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell others about yourself..."
                  rows="3"
                  className="w-full pl-10 pr-4 py-2.5 glass-input text-sm border-slate-200/50 dark:border-slate-800/40 resize-none"
                />
              </div>
            </div>

            {/* Password Updates */}
            <div className="border-t border-slate-200/10 pt-4 mt-6">
              <h3 className="text-base font-bold text-slate-850 dark:text-slate-200 mb-3">Change Password (Optional)</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-355 mb-1 ml-1">New Password</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 dark:text-slate-500">
                      <Lock className="w-4 h-4" />
                    </span>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-2.5 glass-input text-sm border-slate-200/50 dark:border-slate-800/40"
                    />
                  </div>
                </div>

                <div className="flex flex-col">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-355 mb-1 ml-1">Confirm New Password</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 dark:text-slate-500">
                      <Lock className="w-4 h-4" />
                    </span>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-2.5 glass-input text-sm border-slate-200/50 dark:border-slate-800/40"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Submit btn */}
            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary py-2.5 px-6 flex items-center gap-2 text-sm"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default Profile;
