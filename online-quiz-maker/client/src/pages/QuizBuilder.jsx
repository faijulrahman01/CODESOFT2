import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import quizService from '../services/quizService';
import { useToast } from '../context/ToastContext';
import { Plus, Trash2, Save, FileQuestion, Clock, Globe, Lock, ArrowLeft, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const QuizBuilder = () => {
  const { id } = useParams(); // If present, we are editing
  const isEditMode = !!id;
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [timer, setTimer] = useState(0); // in minutes for builder display
  const [isPublic, setIsPublic] = useState(true);
  const [questions, setQuestions] = useState([
    { questionText: '', options: ['', '', '', ''], correctAnswerIndex: 0 }
  ]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isEditMode) {
      const fetchQuiz = async () => {
        setIsLoading(true);
        try {
          const res = await quizService.getQuizById(id);
          if (res.success && res.data) {
            const quiz = res.data;
            setTitle(quiz.title);
            setDescription(quiz.description);
            setTimer(Math.round(quiz.timer / 60)); // convert seconds to minutes for form
            setIsPublic(quiz.isPublic);
            setQuestions(quiz.questions);
          }
        } catch (err) {
          addToast('Error loading quiz details', 'error');
          navigate('/dashboard');
        } finally {
          setIsLoading(false);
        }
      };
      fetchQuiz();
    }
  }, [id, isEditMode, navigate, addToast]);

  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      { questionText: '', options: ['', '', '', ''], correctAnswerIndex: 0 }
    ]);
  };

  const handleRemoveQuestion = (qIndex) => {
    if (questions.length === 1) {
      addToast('A quiz must have at least one question', 'warning');
      return;
    }
    setQuestions(questions.filter((_, idx) => idx !== qIndex));
  };

  const handleQuestionTextChange = (qIndex, text) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].questionText = text;
    setQuestions(newQuestions);
  };

  const handleOptionChange = (qIndex, oIndex, val) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].options[oIndex] = val;
    setQuestions(newQuestions);
  };

  const handleCorrectAnswerChange = (qIndex, oIndex) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].correctAnswerIndex = oIndex;
    setQuestions(newQuestions);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validations
    if (!title.trim()) {
      addToast('Quiz title is required', 'warning');
      return;
    }
    if (!description.trim()) {
      addToast('Quiz description is required', 'warning');
      return;
    }

    // Verify all questions have text and options
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.questionText.trim()) {
        addToast(`Question ${i + 1} has no text`, 'warning');
        return;
      }
      for (let j = 0; j < q.options.length; j++) {
        if (!q.options[j].trim()) {
          addToast(`Option ${j + 1} in Question ${i + 1} is empty`, 'warning');
          return;
        }
      }
    }

    setIsSaving(true);
    try {
      const payload = {
        title,
        description,
        questions,
        timer: timer * 60, // convert minutes to seconds for backend
        isPublic,
      };

      if (isEditMode) {
        await quizService.updateQuiz(id, payload);
        addToast('Quiz updated successfully!', 'success');
      } else {
        await quizService.createQuiz(payload);
        addToast('Quiz created successfully!', 'success');
      }
      navigate('/dashboard');
    } catch (err) {
      addToast(err || 'Failed to save quiz', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 relative">
      {/* Back to dashboard */}
      <button
        onClick={() => navigate('/dashboard')}
        className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </button>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Settings Panel */}
        <div className="w-full lg:w-1/3">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel p-6 rounded-2xl border-slate-200/20 dark:border-slate-800/40 sticky top-24"
          >
            <h2 className="text-xl font-bold text-slate-850 dark:text-slate-100 mb-6 flex items-center gap-2">
              <FileQuestion className="w-5 h-5 text-primary-500" />
              Quiz Settings
            </h2>

            <div className="space-y-4">
              {/* Title */}
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-slate-550 dark:text-slate-400 mb-1 ml-1">Title</label>
                <input
                  type="text"
                  placeholder="e.g. JavaScript Fundamentals"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={100}
                  className="glass-input text-sm px-3.5 py-2.5"
                />
              </div>

              {/* Description */}
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-slate-550 dark:text-slate-400 mb-1 ml-1">Description</label>
                <textarea
                  placeholder="Describe your quiz..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={500}
                  rows={4}
                  className="glass-input text-sm px-3.5 py-2.5 resize-none"
                />
              </div>

              {/* Timer Limit */}
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-slate-550 dark:text-slate-400 mb-1 ml-1 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  Time Limit (Minutes)
                </label>
                <input
                  type="number"
                  placeholder="0 (Unlimited)"
                  value={timer === 0 ? '' : timer}
                  onChange={(e) => setTimer(Math.max(0, parseInt(e.target.value) || 0))}
                  min={0}
                  className="glass-input text-sm px-3.5 py-2.5"
                />
                <span className="text-[10px] text-slate-500 mt-1">Set to 0 if you don't want a time limit.</span>
              </div>

              {/* Public/Private Access */}
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-slate-550 dark:text-slate-400 mb-1.5 ml-1">Visibility</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setIsPublic(true)}
                    className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold border transition-all ${
                      isPublic 
                        ? 'bg-primary-500/10 border-primary-500/50 text-primary-500 dark:text-primary-400' 
                        : 'border-slate-200/10 dark:border-slate-800/40 text-slate-500'
                    }`}
                  >
                    <Globe className="w-3.5 h-3.5" />
                    Public
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsPublic(false)}
                    className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold border transition-all ${
                      !isPublic 
                        ? 'bg-accent-500/10 border-accent-500/50 text-accent-500 dark:text-accent-400' 
                        : 'border-slate-200/10 dark:border-slate-800/40 text-slate-500'
                    }`}
                  >
                    <Lock className="w-3.5 h-3.5" />
                    Private
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Questions Builder */}
        <div className="w-full lg:w-2/3 flex-grow">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
              <HelpCircle className="w-6 h-6 text-primary-500" />
              Quiz Questions ({questions.length})
            </h2>
            <button
              onClick={handleAddQuestion}
              className="btn-secondary py-2 px-4 text-sm flex items-center gap-1.5 hover:shadow-md"
            >
              <Plus className="w-4 h-4" />
              Add Question
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <AnimatePresence initial={false}>
              {questions.map((question, qIndex) => (
                <motion.div
                  key={qIndex}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.2 }}
                  className="glass-panel p-6 rounded-2xl border-slate-200/20 dark:border-slate-800/40"
                >
                  <div className="flex items-start justify-between border-b border-slate-200/10 pb-4 mb-4 gap-4">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-primary-500/10 text-primary-500 dark:text-primary-400 text-sm font-bold">
                      {qIndex + 1}
                    </span>
                    
                    <input
                      type="text"
                      placeholder="Enter question text here..."
                      value={question.questionText}
                      onChange={(e) => handleQuestionTextChange(qIndex, e.target.value)}
                      className="flex-grow glass-input text-sm py-2 px-3 focus:ring-1"
                    />

                    <button
                      type="button"
                      onClick={() => handleRemoveQuestion(qIndex)}
                      className="p-2 text-rose-500 hover:bg-rose-500/5 rounded-xl border border-transparent hover:border-rose-500/10 transition-colors"
                      title="Remove question"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Options (4 options) */}
                  <div className="space-y-3">
                    <p className="text-xs font-bold text-slate-550 dark:text-slate-400 mb-1 ml-1">
                      Options & Correct Answer Select
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {question.options.map((option, oIndex) => (
                        <div
                          key={oIndex}
                          className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                            question.correctAnswerIndex === oIndex
                              ? 'bg-emerald-500/10 border-emerald-500/50 dark:border-emerald-500/40'
                              : 'border-slate-200/10 dark:border-slate-800/40'
                          }`}
                        >
                          {/* Radio index select correct answer */}
                          <input
                            type="radio"
                            name={`correct-answer-${qIndex}`}
                            checked={question.correctAnswerIndex === oIndex}
                            onChange={() => handleCorrectAnswerChange(qIndex, oIndex)}
                            className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-slate-350 dark:border-slate-700 bg-transparent"
                          />
                          
                          <input
                            type="text"
                            placeholder={`Option ${oIndex + 1}`}
                            value={option}
                            onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                            className="w-full bg-transparent border-none p-0 text-sm focus:ring-0 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Bottom Actions */}
            <div className="flex justify-between items-center pt-6 border-t border-slate-200/10">
              <button
                type="button"
                onClick={handleAddQuestion}
                className="btn-secondary py-2.5 px-6 flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                Add Question
              </button>

              <button
                type="submit"
                disabled={isSaving}
                className="btn-primary py-2.5 px-8 flex items-center gap-2"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>{isEditMode ? 'Update Quiz' : 'Save Quiz'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default QuizBuilder;
