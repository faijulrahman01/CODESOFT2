import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import quizService from '../services/quizService';
import resultService from '../services/resultService';
import { useToast } from '../context/ToastContext';
import { Clock, AlertTriangle, Play, ChevronLeft, ChevronRight, CheckCircle2, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const TakeQuiz = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [quiz, setQuiz] = useState(null);
  const [started, setStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState([]);
  
  const [timeLeft, setTimeLeft] = useState(0); // in seconds
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const timerIntervalRef = useRef(null);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const res = await quizService.getQuizById(id);
        if (res.success && res.data) {
          setQuiz(res.data);
          setSelectedAnswers(new Array(res.data.questions.length).fill(-1));
          setTimeLeft(res.data.timer || 0);
        }
      } catch (err) {
        addToast('Error loading quiz', 'error');
        navigate('/quizzes');
      } finally {
        setIsLoading(false);
      }
    };
    fetchQuiz();
    
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [id, navigate, addToast]);

  // Start Quiz
  const handleStartQuiz = () => {
    setStarted(true);
    // If timer is set, start the countdown
    if (quiz.timer > 0) {
      timerIntervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerIntervalRef.current);
            // Time is up, trigger submit
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  };

  const handleSelectOption = (optionIndex) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestionIndex] = optionIndex;
    setSelectedAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleAutoSubmit = async () => {
    addToast("Time's up! Submitting your answers...", 'warning');
    // Ensure all unanswered questions are recorded as -1
    await submitQuiz(true);
  };

  const handleSubmitClick = () => {
    // Check if any unanswered question
    const unanswered = selectedAnswers.filter(ans => ans === -1).length;
    if (unanswered > 0) {
      if (confirm(`You have ${unanswered} unanswered question(s). Are you sure you want to submit?`)) {
        submitQuiz();
      }
    } else {
      if (confirm('Are you sure you want to submit your quiz?')) {
        submitQuiz();
      }
    }
  };

  const submitQuiz = async (force = false) => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    
    setIsSubmitting(true);
    try {
      // Send to api
      const res = await resultService.submitQuizResult(quiz._id, selectedAnswers);
      if (res.success && res.data) {
        addToast('Quiz submitted successfully!', 'success');
        
        // Pass result and quiz metadata to the review page
        navigate('/quiz-result', { 
          state: { 
            result: res.data,
            correctAnswers: res.correctAnswers,
            quiz
          },
          replace: true
        });
      }
    } catch (err) {
      addToast(err || 'Failed to submit quiz result', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format MM:SS
  const formatTime = (seconds) => {
    const mm = Math.floor(seconds / 60).toString().padStart(2, '0');
    const ss = (seconds % 60).toString().padStart(2, '0');
    return `${mm}:${ss}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!quiz) return null;

  // Start Screen
  if (!started) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 relative">
        <div className="absolute top-1/4 left-1/4 w-48 h-48 bg-primary-500/10 rounded-full blur-3xl animate-pulse-slow"></div>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-panel p-8 rounded-2xl border-slate-200/20 dark:border-slate-800/40 text-center relative z-10"
        >
          <span className="inline-flex p-3 bg-primary-500/10 text-primary-500 rounded-xl mb-4">
            <CheckCircle2 className="w-8 h-8" />
          </span>
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white mb-3">{quiz.title}</h1>
          <p className="text-slate-500 dark:text-slate-400 mb-6">{quiz.description}</p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 py-4 border-y border-slate-100 dark:border-slate-800/50 mb-8 text-sm font-semibold text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              {quiz.questions.length} Questions
            </span>
            {quiz.timer > 0 && (
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-500" />
                {Math.round(quiz.timer / 60)} minutes limit
              </span>
            )}
          </div>

          <button
            onClick={handleStartQuiz}
            className="btn-primary flex items-center justify-center gap-2 w-full sm:w-auto px-8 mx-auto"
          >
            <Play className="w-4 h-4 fill-current" />
            Start Quiz
          </button>
        </motion.div>
      </div>
    );
  }

  // Active Quiz Taker Screen
  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 relative">
      {/* Top Details & Timer */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            {quiz.title}
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Question {currentQuestionIndex + 1} of {quiz.questions.length}
          </p>
        </div>

        {quiz.timer > 0 && (
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-sm font-bold ${
            timeLeft < 30 
              ? 'bg-rose-500/10 border-rose-500/30 text-rose-500 animate-pulse' 
              : 'glass-panel border-slate-200/10 dark:border-slate-800/40 text-slate-650 dark:text-slate-300'
          }`}>
            <Clock className="w-4 h-4" />
            <span>{formatTime(timeLeft)}</span>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-100 dark:bg-slate-800/40 h-2.5 rounded-full overflow-hidden mb-8 border border-slate-200/10 dark:border-slate-800/30">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
          className="h-full bg-gradient-to-r from-primary-500 to-accent-500"
        />
      </div>

      {/* Question Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestionIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
          className="glass-panel p-8 rounded-2xl border-slate-200/20 dark:border-slate-800/40 mb-8"
        >
          {/* Question Text */}
          <h3 className="text-xl font-bold text-slate-800 dark:text-white leading-relaxed mb-6">
            {currentQuestion.questionText}
          </h3>

          {/* Options List */}
          <div className="space-y-3.5">
            {currentQuestion.options.map((option, idx) => {
              const letters = ['A', 'B', 'C', 'D'];
              const isSelected = selectedAnswers[currentQuestionIndex] === idx;
              
              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(idx)}
                  className={`w-full flex items-center text-left gap-4 p-4 rounded-xl border transition-all duration-200 active:scale-[0.99] ${
                    isSelected
                      ? 'bg-gradient-to-r from-primary-500/15 to-primary-600/5 border-primary-500 dark:border-primary-400 shadow-md shadow-primary-500/5'
                      : 'border-slate-200/15 dark:border-slate-800/40 hover:bg-slate-500/5'
                  }`}
                >
                  <span className={`flex-shrink-0 inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-extrabold border transition-colors ${
                    isSelected
                      ? 'bg-primary-500 text-white border-primary-500'
                      : 'bg-slate-900/10 dark:bg-slate-900/30 border-slate-200/10 dark:border-slate-800/60 text-slate-500'
                  }`}>
                    {letters[idx]}
                  </span>
                  <span className={`text-sm font-semibold ${
                    isSelected ? 'text-primary-500 dark:text-primary-400 font-bold' : 'text-slate-700 dark:text-slate-200'
                  }`}>
                    {option}
                  </span>
                </button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Footer */}
      <div className="flex items-center justify-between">
        <button
          onClick={handlePrev}
          disabled={currentQuestionIndex === 0}
          className="btn-secondary py-2 px-4 text-sm flex items-center gap-1.5 hover:shadow disabled:opacity-40 disabled:pointer-events-none"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </button>

        {currentQuestionIndex === quiz.questions.length - 1 ? (
          <button
            onClick={handleSubmitClick}
            disabled={isSubmitting}
            className="btn-primary py-2.5 px-6 text-sm flex items-center gap-1.5 hover:shadow-lg"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
            <CheckCircle2 className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="btn-secondary py-2 px-4 text-sm flex items-center gap-1.5 hover:shadow"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default TakeQuiz;
