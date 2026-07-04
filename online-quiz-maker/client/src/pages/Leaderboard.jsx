import React, { useState, useEffect } from 'react';
import resultService from '../services/resultService';
import { useToast } from '../context/ToastContext';
import { Trophy, Calendar, Medal, HelpCircle, Star, Award } from 'lucide-react';
import { motion } from 'framer-motion';

const Leaderboard = () => {
  const { addToast } = useToast();
  const [leaderboard, setLeaderboard] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await resultService.getLeaderboard();
        if (res.success && res.data) {
          setLeaderboard(res.data);
        }
      } catch (err) {
        addToast('Error loading leaderboard data', 'error');
      } finally {
        setIsLoading(false);
      }
    };
    fetchLeaderboard();
  }, [addToast]);

  const getRankBadge = (rank) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-6 h-6 text-yellow-500 fill-current" />;
      case 2:
        return <Medal className="w-6 h-6 text-slate-350 fill-current" />;
      case 3:
        return <Medal className="w-6 h-6 text-amber-700 fill-current" />;
      default:
        return <span className="text-slate-450 dark:text-slate-500 text-sm font-bold w-6 text-center">{rank}</span>;
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Helper for current avatar
  const getAvatarUrl = (user) => {
    if (user?.avatar) {
      return user.avatar.startsWith('http') ? user.avatar : `http://localhost:5000${user.avatar}`;
    }
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=0ea5e9&color=fff&bold=true`;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 relative">
      <div className="absolute top-10 left-10 w-48 h-48 bg-yellow-500/5 rounded-full blur-2xl pointer-events-none"></div>

      <div className="text-center max-w-2xl mx-auto mb-10">
        <h1 className="text-4xl font-extrabold text-slate-850 dark:text-white flex items-center justify-center gap-2 mb-2">
          <Trophy className="w-8 h-8 text-yellow-500" />
          Global Leaderboard
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          Top performers and high scores across all public quizzes taken globally.
        </p>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-sm text-slate-500">Retrieving leaderboard...</p>
        </div>
      ) : leaderboard.length === 0 ? (
        <div className="text-center py-16 glass-panel rounded-2xl p-8 border-slate-200/10 dark:border-slate-800/30">
          <Award className="w-12 h-12 text-slate-500 mx-auto mb-4" />
          <p className="text-lg font-semibold text-slate-655 dark:text-slate-350">Leaderboard is empty</p>
          <p className="text-sm text-slate-500 mt-1">Be the first to submit a quiz and secure your rank!</p>
        </div>
      ) : (
        <div className="glass-panel rounded-2xl border-slate-200/20 dark:border-slate-800/40 overflow-hidden">
          {/* Top Rankings Header */}
          <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-slate-200/10 text-xs font-bold uppercase tracking-wider text-slate-450 dark:text-slate-500">
            <div className="col-span-2 sm:col-span-1">Rank</div>
            <div className="col-span-5 sm:col-span-5">User</div>
            <div className="col-span-5 sm:col-span-4">Quiz Title</div>
            <div className="hidden sm:block sm:col-span-2">Date</div>
            <div className="col-span-2 sm:col-span-1 text-right">Score</div>
          </div>

          {/* Rankings List */}
          <div className="divide-y divide-slate-200/10">
            {leaderboard.map((item, index) => (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-slate-100/5 dark:hover:bg-slate-800/20 transition-all ${
                  index < 3 ? 'bg-gradient-to-r from-yellow-500/5 to-transparent' : ''
                }`}
              >
                {/* Rank */}
                <div className="col-span-2 sm:col-span-1 flex items-center justify-start">
                  {getRankBadge(index + 1)}
                </div>

                {/* User */}
                <div className="col-span-5 sm:col-span-5 flex items-center gap-3">
                  <img
                    src={getAvatarUrl(item.user)}
                    alt={item.user?.name}
                    className="w-8 h-8 rounded-full object-cover border border-primary-500/20"
                  />
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate">
                    {item.user?.name || 'Deleted User'}
                  </span>
                </div>

                {/* Quiz Title */}
                <div className="col-span-5 sm:col-span-4 text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-350 truncate">
                  {item.quiz?.title || <span className="text-slate-500 italic">Deleted Quiz</span>}
                </div>

                {/* Date */}
                <div className="hidden sm:block sm:col-span-2 text-xs font-semibold text-slate-450 dark:text-slate-500 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {formatDate(item.completedAt)}
                </div>

                {/* Score */}
                <div className="col-span-2 sm:col-span-1 text-right text-sm font-extrabold text-slate-800 dark:text-white">
                  <span className={item.percentage >= 70 ? 'text-emerald-500' : 'text-primary-500'}>
                    {item.percentage}%
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
