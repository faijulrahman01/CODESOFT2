import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import resultService from '../services/resultService';
import quizService from '../services/quizService';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../hooks/useAuth';
import { 
  Trophy, BookOpen, Plus, Calendar, HelpCircle, Eye, 
  Trash2, Edit, Award, Play, CheckCircle2, AlertTriangle, ArrowRight 
} from 'lucide-react';
import { motion } from 'framer-motion';

const Dashboard = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalQuizzesTaken: 0,
    totalQuizzesCreated: 0,
    avgScore: 0,
    totalPlaysReceived: 0,
    recentAttempts: []
  });
  const [myQuizzes, setMyQuizzes] = useState([]);
  const [activeTab, setActiveTab] = useState('attempts'); // 'attempts' or 'created'
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const statsRes = await resultService.getDashboardStats();
      const quizzesRes = await quizService.getMyQuizzes();
      
      if (statsRes.success && statsRes.data) {
        setStats(statsRes.data);
      }
      if (quizzesRes.success && quizzesRes.data) {
        setMyQuizzes(quizzesRes.data);
      }
    } catch (err) {
      addToast('Error loading dashboard statistics', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleDeleteQuiz = async (quizId) => {
    if (confirm('Are you sure you want to delete this quiz? This action is permanent and will delete all user attempts.')) {
      try {
        const res = await quizService.deleteQuiz(quizId);
        if (res.success) {
          addToast('Quiz removed successfully', 'success');
          // Refresh data
          setMyQuizzes(myQuizzes.filter(q => q._id !== quizId));
          // Recalculate stats counts locally
          setStats(prev => ({
            ...prev,
            totalQuizzesCreated: prev.totalQuizzesCreated - 1
          }));
        }
      } catch (err) {
        addToast(err || 'Failed to delete quiz', 'error');
      }
    }
  };

  const handleReviewAttempt = (attempt) => {
    // Reconstruct required review params
    const quizPayload = {
      _id: attempt.quiz?._id,
      title: attempt.quiz?.title,
      questions: attempt.answers.map((ans, qIdx) => ({
        // Mock question details if quiz was deleted or partial,
        // but typically result populates quiz details.
        // We'll pass the exact payload.
        questionText: `Question ${qIdx + 1}`,
        options: ['Option 1', 'Option 2', 'Option 3', 'Option 4'], // fallback options list
        correctAnswerIndex: ans // mock correct answers index
      }))
    };
    
    // In our submit response we provide detailed answers.
    // If reviewing historical results, we might only have correct answers count.
    // Let's redirect to `/quizzes` to retake if they want,
    // or let them review details if possible. Let's alert if quiz is deleted.
    if (!attempt.quiz) {
      addToast('The source quiz for this attempt has been deleted', 'warning');
      return;
    }
    
    // Typically, user wants to see their score. If the quiz still exists,
    // we can retrieve it or navigate directly. Let's fetch the quiz details first!
    navigate(`/take-quiz/${attempt.quiz._id}`);
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 relative">
      <div className="absolute top-10 right-10 w-48 h-48 bg-accent-500/5 rounded-full blur-2xl pointer-events-none"></div>

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 border-b border-slate-200/10 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white">
            Welcome, {user?.name || 'Explorer'}!
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track your performance, practice your skills, and author interactive quizzes.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <Link to="/quizzes" className="btn-secondary py-2 px-5 text-sm flex items-center gap-1.5">
            <BookOpen className="w-4 h-4" />
            Find Quizzes
          </Link>
          <Link to="/create-quiz" className="btn-primary py-2.5 px-5 text-sm flex items-center gap-1.5 shadow-md">
            <Plus className="w-4 h-4" />
            Create Quiz
          </Link>
        </div>
      </div>

      {/* Grid of Statistics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {/* Taken Count */}
        <motion.div
          whileHover={{ y: -3 }}
          className="glass-panel p-5 rounded-2xl border-slate-200/20 dark:border-slate-800/40"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Quizzes Taken</span>
            <span className="p-2 rounded-xl bg-primary-500/10 text-primary-500"><Play className="w-4 h-4" /></span>
          </div>
          <p className="text-3xl font-extrabold text-slate-700 dark:text-white mt-2">{stats.totalQuizzesTaken}</p>
        </motion.div>

        {/* Avg Score */}
        <motion.div
          whileHover={{ y: -3 }}
          className="glass-panel p-5 rounded-2xl border-slate-200/20 dark:border-slate-800/40"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Average Score</span>
            <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500"><Award className="w-4 h-4" /></span>
          </div>
          <p className="text-3xl font-extrabold text-emerald-500 mt-2">{stats.avgScore}%</p>
        </motion.div>

        {/* Created Count */}
        <motion.div
          whileHover={{ y: -3 }}
          className="glass-panel p-5 rounded-2xl border-slate-200/20 dark:border-slate-800/40"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Quizzes Created</span>
            <span className="p-2 rounded-xl bg-accent-500/10 text-accent-500"><CheckCircle2 className="w-4 h-4" /></span>
          </div>
          <p className="text-3xl font-extrabold text-slate-700 dark:text-white mt-2">{stats.totalQuizzesCreated}</p>
        </motion.div>

        {/* Plays count received */}
        <motion.div
          whileHover={{ y: -3 }}
          className="glass-panel p-5 rounded-2xl border-slate-200/20 dark:border-slate-800/40"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Total Plays Got</span>
            <span className="p-2 rounded-xl bg-yellow-500/10 text-yellow-500"><Trophy className="w-4 h-4" /></span>
          </div>
          <p className="text-3xl font-extrabold text-slate-700 dark:text-white mt-2">{stats.totalPlaysReceived}</p>
        </motion.div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-250/20 dark:border-slate-800/40 mb-6">
        <button
          onClick={() => setActiveTab('attempts')}
          className={`py-3 px-6 text-sm font-bold border-b-2 transition-colors ${
            activeTab === 'attempts'
              ? 'border-primary-500 text-primary-500 dark:text-primary-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          Recent Attempts ({stats.recentAttempts?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('created')}
          className={`py-3 px-6 text-sm font-bold border-b-2 transition-colors ${
            activeTab === 'created'
              ? 'border-primary-500 text-primary-500 dark:text-primary-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          My Created Quizzes ({myQuizzes.length})
        </button>
      </div>

      {/* Tab Contents */}
      <div>
        {activeTab === 'attempts' ? (
          /* Recent Attempts List */
          stats.recentAttempts && stats.recentAttempts.length === 0 ? (
            <div className="text-center py-16 glass-panel rounded-2xl p-8 border-slate-200/10 dark:border-slate-800/30">
              <Award className="w-12 h-12 text-slate-500 mx-auto mb-4" />
              <p className="text-lg font-semibold text-slate-655 dark:text-slate-300">No attempts yet</p>
              <p className="text-sm text-slate-500 mt-1">Explore quizzes and test your skills.</p>
              <Link to="/quizzes" className="btn-primary inline-flex items-center gap-1.5 py-2 px-6 mt-4">
                <span>Start Practice</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {stats.recentAttempts.map((attempt) => (
                <div
                  key={attempt._id}
                  className="glass-panel p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-slate-200/10 dark:border-slate-800/40"
                >
                  <div className="flex-grow">
                    <h3 className="font-bold text-lg text-slate-800 dark:text-white truncate">
                      {attempt.quiz?.title || <span className="text-slate-500 italic">Deleted Quiz</span>}
                    </h3>
                    <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1.5">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {formatDate(attempt.completedAt)}
                      </span>
                      <span className="flex items-center gap-1">
                        <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                        {attempt.correctAnswersCount} / {attempt.totalQuestions} Correct
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6 flex-shrink-0">
                    <div>
                      <p className="text-xs text-slate-450 leading-none text-right">Percentage</p>
                      <p className={`text-xl font-extrabold mt-1 text-right ${
                        attempt.percentage >= 70 
                          ? 'text-emerald-500' 
                          : attempt.percentage >= 50 
                          ? 'text-amber-500' 
                          : 'text-rose-500'
                      }`}>
                        {attempt.percentage}%
                      </p>
                    </div>

                    <button
                      onClick={() => handleReviewAttempt(attempt)}
                      className="btn-secondary py-1.5 px-4 text-xs flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Review
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          /* Created Quizzes List */
          myQuizzes.length === 0 ? (
            <div className="text-center py-16 glass-panel rounded-2xl p-8 border-slate-200/10 dark:border-slate-800/30">
              <Plus className="w-12 h-12 text-slate-500 mx-auto mb-4" />
              <p className="text-lg font-semibold text-slate-655 dark:text-slate-300">Create your first quiz</p>
              <p className="text-sm text-slate-500 mt-1">Author quizzes with custom options and timers.</p>
              <Link to="/create-quiz" className="btn-primary inline-flex items-center gap-1.5 py-2 px-6 mt-4 shadow-md">
                <Plus className="w-4 h-4" />
                <span>Build a Quiz</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {myQuizzes.map((quiz) => (
                <div
                  key={quiz._id}
                  className="glass-panel p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-slate-200/10 dark:border-slate-800/40"
                >
                  <div className="flex-grow">
                    <h3 className="font-bold text-lg text-slate-800 dark:text-white truncate">
                      {quiz.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1.5">
                      <span className="flex items-center gap-1 bg-slate-900/10 dark:bg-slate-900/30 border border-slate-200/5 dark:border-slate-800/50 px-2 py-0.5 rounded-lg">
                        {quiz.isPublic ? 'Public' : 'Private'}
                      </span>
                      <span className="flex items-center gap-1">
                        <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                        {quiz.questions?.length || 0} Questions
                      </span>
                      <span className="flex items-center gap-1">
                        <Play className="w-3.5 h-3.5 text-slate-400" />
                        {quiz.playsCount || 0} plays
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Link
                      to={`/edit-quiz/${quiz._id}`}
                      className="p-2 text-primary-500 hover:bg-primary-500/5 rounded-xl border border-transparent hover:border-primary-500/10 transition-colors"
                      title="Edit quiz"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => handleDeleteQuiz(quiz._id)}
                      className="p-2 text-rose-500 hover:bg-rose-500/5 rounded-xl border border-transparent hover:border-rose-500/10 transition-colors"
                      title="Delete quiz"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default Dashboard;
