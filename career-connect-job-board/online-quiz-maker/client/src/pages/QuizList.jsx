import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import quizService from '../services/quizService';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../context/ToastContext';
import { Search, Play, Clock, HelpCircle, User, ArrowLeft, ArrowRight, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';

const QuizList = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [quizzes, setQuizzes] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const [isLoading, setIsLoading] = useState(false);
  const searchTimeoutRef = useRef(null);

  const fetchQuizzes = async (keyword = '', pageNum = 1) => {
    setIsLoading(true);
    try {
      const res = await quizService.getQuizzes(keyword, pageNum, 6); // 6 per page
      if (res.success && res.data) {
        setQuizzes(res.data);
        setTotalPages(res.totalPages || 1);
        setPage(res.currentPage || 1);
      }
    } catch (err) {
      addToast('Error fetching quizzes', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzes('', 1);
  }, []);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearch(val);

    // Debounce search
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      fetchQuizzes(val, 1);
    }, 400);
  };

  const handleTakeQuiz = (quizId) => {
    if (!user) {
      addToast('Please login to start taking quizzes', 'info');
      navigate('/login', { state: { from: { pathname: `/take-quiz/${quizId}` } } });
      return;
    }
    navigate(`/take-quiz/${quizId}`);
  };

  const formatTimer = (seconds) => {
    if (!seconds) return 'Unlimited';
    const minutes = Math.floor(seconds / 60);
    return `${minutes} min`;
  };

  // Helper for current avatar
  const getAvatarUrl = (creator) => {
    if (creator?.avatar) {
      return creator.avatar.startsWith('http') ? creator.avatar : `http://localhost:5000${creator.avatar}`;
    }
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(creator?.name || 'User')}&background=0ea5e9&color=fff&bold=true`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 relative">
      <div className="absolute top-10 left-10 w-48 h-48 bg-primary-500/5 rounded-full blur-2xl pointer-events-none"></div>

      <div className="text-center max-w-2xl mx-auto mb-10">
        <h1 className="text-4xl font-extrabold text-slate-800 dark:text-white flex items-center justify-center gap-2 mb-2">
          <BookOpen className="w-8 h-8 text-primary-500" />
          Explore Quizzes
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          Search and take quizzes created by our community, or practice your skills on a wide variety of topics.
        </p>
      </div>

      {/* Search Bar */}
      <div className="max-w-xl mx-auto mb-12">
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 dark:text-slate-500">
            <Search className="w-5 h-5" />
          </span>
          <input
            type="text"
            placeholder="Search quizzes by title or keyword..."
            value={search}
            onChange={handleSearchChange}
            className="w-full pl-11 pr-4 py-3.5 glass-input border-slate-200/50 dark:border-slate-800/40 focus:ring-2 focus:ring-primary-500/50 text-base"
          />
        </div>
      </div>

      {/* Quizzes Grid */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-sm text-slate-500">Searching quizzes...</p>
        </div>
      ) : quizzes.length === 0 ? (
        <div className="text-center py-20 glass-panel rounded-2xl p-8 border-slate-200/10 dark:border-slate-800/30">
          <HelpCircle className="w-12 h-12 text-slate-450 mx-auto mb-4" />
          <p className="text-lg font-semibold text-slate-655 dark:text-slate-300">No quizzes found</p>
          <p className="text-sm text-slate-500 mt-1">Try another search keyword or check back later.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map((quiz, index) => (
            <motion.div
              key={quiz._id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="glass-panel glass-panel-hover p-6 rounded-2xl flex flex-col justify-between border-slate-200/20 dark:border-slate-800/40 relative group"
            >
              <div>
                {/* Title */}
                <h3 className="text-xl font-bold text-slate-800 dark:text-white group-hover:text-primary-500 dark:group-hover:text-primary-400 transition-colors line-clamp-1">
                  {quiz.title}
                </h3>
                {/* Description */}
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 line-clamp-3 min-h-[3.75rem]">
                  {quiz.description}
                </p>

                {/* Meta details */}
                <div className="flex items-center gap-4 mt-4 py-3 border-y border-slate-100 dark:border-slate-800/50 text-xs font-semibold text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1">
                    <HelpCircle className="w-4 h-4 text-slate-400" />
                    {quiz.questions?.length || 0} Qs
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4 text-slate-400" />
                    {formatTimer(quiz.timer)}
                  </span>
                  <span className="flex items-center gap-1 bg-primary-500/10 text-primary-500 px-2 py-0.5 rounded-lg text-[10px]">
                    {quiz.playsCount || 0} plays
                  </span>
                </div>
              </div>

              {/* Creator & CTA */}
              <div className="flex items-center justify-between mt-6">
                <div className="flex items-center gap-2">
                  <img
                    src={getAvatarUrl(quiz.creator)}
                    alt={quiz.creator?.name}
                    className="w-8 h-8 rounded-full object-cover border border-primary-500/20"
                  />
                  <div className="text-left">
                    <p className="text-[10px] text-slate-400 leading-none">Created by</p>
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate max-w-[100px] leading-tight mt-0.5">
                      {quiz.creator?.name || 'Anonymous'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleTakeQuiz(quiz._id)}
                  className="inline-flex items-center gap-1 bg-primary-500/10 hover:bg-primary-500 text-primary-500 hover:text-white px-3 py-2 rounded-xl text-xs font-bold transition-all"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  Take Quiz
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-12">
          <button
            disabled={page === 1}
            onClick={() => fetchQuizzes(search, page - 1)}
            className="p-2 rounded-xl border border-slate-200/10 dark:border-slate-800/40 hover:bg-slate-100/10 text-slate-500 hover:text-slate-700 dark:hover:text-slate-350 disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          
          <span className="text-sm font-semibold text-slate-500">
            Page {page} of {totalPages}
          </span>

          <button
            disabled={page === totalPages}
            onClick={() => fetchQuizzes(search, page + 1)}
            className="p-2 rounded-xl border border-slate-200/10 dark:border-slate-800/40 hover:bg-slate-100/10 text-slate-500 hover:text-slate-700 dark:hover:text-slate-350 disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default QuizList;
