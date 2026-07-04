import React, { useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { CheckCircle2, XCircle, ArrowLeft, RefreshCw, Trophy, AlertCircle, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';

const QuizResult = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const { result, correctAnswers, quiz } = location.state || {};

  useEffect(() => {
    // If we have a high score, fire confetti
    if (result && result.percentage >= 70) {
      const duration = 2.5 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 1000 };

      const randomInRange = (min, max) => Math.random() * (max - min) + min;

      const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        // since random supports range, fire from left and right edges
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
      }, 250);

      return () => clearInterval(interval);
    }
  }, [result]);

  if (!result || !quiz) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="glass-panel p-8 rounded-2xl border-slate-200/10 dark:border-slate-800/40">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">No Result Data</h2>
          <p className="text-sm text-slate-500 mb-6">No quiz result could be found. Please head back to your dashboard.</p>
          <Link to="/dashboard" className="btn-primary inline-flex items-center gap-1.5 py-2 px-6">
            <ArrowLeft className="w-4 h-4" />
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const getStatusText = (percentage) => {
    if (percentage >= 90) return { title: 'Outstanding!', desc: 'You nailed it! Absolute perfection.', color: 'text-emerald-500' };
    if (percentage >= 70) return { title: 'Great Job!', desc: 'Well done! You have a solid understanding.', color: 'text-sky-500' };
    if (percentage >= 50) return { title: 'Passed!', desc: 'Good effort, but there is room to improve.', color: 'text-amber-500' };
    return { title: 'Keep Practicing!', desc: 'Don\'t give up. Review your mistakes and try again.', color: 'text-rose-500' };
  };

  const status = getStatusText(result.percentage);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 relative">
      <div className="absolute top-1/4 left-1/4 w-48 h-48 bg-primary-500/5 rounded-full blur-3xl pointer-events-none"></div>

      {/* Scored Metrics Banner */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel p-8 rounded-2xl border-slate-200/20 dark:border-slate-800/40 text-center mb-8"
      >
        <span className="inline-flex p-3 bg-gradient-to-tr from-yellow-500/20 to-amber-500/20 text-yellow-500 rounded-2xl mb-4 border border-yellow-500/10">
          <Trophy className="w-8 h-8" />
        </span>
        
        <h1 className="text-4xl font-extrabold text-slate-850 dark:text-white">{status.title}</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 mb-6">{status.desc}</p>

        {/* Score Circles */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto text-left">
          {/* Percentage */}
          <div className="p-4 rounded-xl border border-slate-200/10 dark:border-slate-800/40 bg-slate-900/10 dark:bg-slate-950/20">
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Score</p>
            <p className={`text-3xl font-extrabold mt-1 ${status.color}`}>{result.percentage}%</p>
          </div>
          {/* Score Count */}
          <div className="p-4 rounded-xl border border-slate-200/10 dark:border-slate-800/40 bg-slate-900/10 dark:bg-slate-950/20">
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Correct</p>
            <p className="text-3xl font-extrabold text-slate-700 dark:text-white mt-1">
              {result.correctAnswersCount} / {result.totalQuestions}
            </p>
          </div>
          {/* Incorrect */}
          <div className="p-4 rounded-xl border border-slate-200/10 dark:border-slate-800/40 bg-slate-900/10 dark:bg-slate-950/20">
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Incorrect</p>
            <p className="text-3xl font-extrabold text-rose-500 mt-1">{result.incorrectAnswersCount}</p>
          </div>
          {/* Performance Rate */}
          <div className="p-4 rounded-xl border border-slate-200/10 dark:border-slate-800/40 bg-slate-900/10 dark:bg-slate-950/20">
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Quiz Title</p>
            <p className="text-sm font-extrabold text-slate-700 dark:text-white mt-2 truncate" title={quiz.title}>
              {quiz.title}
            </p>
          </div>
        </div>

        {/* Navigation CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-4 mt-8 pt-6 border-t border-slate-200/10">
          <Link to="/quizzes" className="btn-secondary py-2 px-6 text-sm flex items-center gap-1.5">
            <BookOpen className="w-4 h-4" />
            Try Other Quizzes
          </Link>
          <button
            onClick={() => navigate(`/take-quiz/${quiz._id}`)}
            className="btn-primary py-2.5 px-6 text-sm flex items-center gap-1.5"
          >
            <RefreshCw className="w-4 h-4" />
            Retake Quiz
          </button>
        </div>
      </motion.div>

      {/* Answers Audit Review Sheet */}
      <h2 className="text-2xl font-extrabold text-slate-800 dark:text-white mb-6">
        Detailed Review & Answers
      </h2>

      <div className="space-y-6">
        {quiz.questions.map((question, qIdx) => {
          const userAnswerIdx = result.answers[qIdx];
          const correctAnsIdx = correctAnswers ? correctAnswers[qIdx] : question.correctAnswerIndex;
          const isCorrect = userAnswerIdx === correctAnsIdx;

          return (
            <div
              key={qIdx}
              className={`glass-panel p-6 rounded-2xl border transition-all ${
                isCorrect 
                  ? 'border-emerald-500/20 dark:border-emerald-500/20' 
                  : 'border-rose-500/20 dark:border-rose-500/20'
              }`}
            >
              <div className="flex items-start gap-3.5 mb-4">
                <span className={`inline-flex items-center justify-center w-7 h-7 rounded-xl text-white text-xs font-bold ${
                  isCorrect ? 'bg-emerald-500' : 'bg-rose-500'
                }`}>
                  {qIdx + 1}
                </span>
                
                <div className="flex-grow">
                  <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 leading-relaxed">
                    {question.questionText}
                  </h3>
                  
                  {!isCorrect && userAnswerIdx === -1 && (
                    <span className="inline-block mt-1.5 text-xs text-amber-500 font-bold bg-amber-500/10 px-2 py-0.5 rounded-lg">
                      Skipped / Unanswered
                    </span>
                  )}
                </div>

                <span className="flex-shrink-0">
                  {isCorrect ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                  ) : (
                    <XCircle className="w-6 h-6 text-rose-500" />
                  )}
                </span>
              </div>

              {/* Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-10">
                {question.options.map((option, oIdx) => {
                  const letters = ['A', 'B', 'C', 'D'];
                  const isUserSelection = userAnswerIdx === oIdx;
                  const isCorrectAnswer = correctAnsIdx === oIdx;

                  let styleClass = 'border-slate-200/10 dark:border-slate-800/40 text-slate-655 dark:text-slate-350';
                  
                  if (isCorrectAnswer) {
                    styleClass = 'bg-emerald-500/10 border-emerald-500/40 text-emerald-600 dark:text-emerald-400 font-bold';
                  } else if (isUserSelection && !isCorrect) {
                    styleClass = 'bg-rose-500/10 border-rose-500/40 text-rose-600 dark:text-rose-450 font-bold';
                  }

                  return (
                    <div
                      key={oIdx}
                      className={`flex items-center gap-3 p-3 rounded-xl border text-sm ${styleClass}`}
                    >
                      <span className={`inline-flex items-center justify-center w-6 h-6 rounded-lg text-xs font-extrabold border ${
                        isCorrectAnswer
                          ? 'bg-emerald-500 text-white border-emerald-500'
                          : isUserSelection
                          ? 'bg-rose-500 text-white border-rose-500'
                          : 'bg-slate-900/10 dark:bg-slate-900/30 border-slate-200/10 dark:border-slate-800/60 text-slate-500'
                      }`}>
                        {letters[oIdx]}
                      </span>
                      <span>{option}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-start mt-8">
        <Link
          to="/dashboard"
          className="btn-secondary py-2 px-6 flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default QuizResult;
