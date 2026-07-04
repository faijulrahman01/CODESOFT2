import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import QuizList from './pages/QuizList';
import QuizBuilder from './pages/QuizBuilder';
import TakeQuiz from './pages/TakeQuiz';
import QuizResult from './pages/QuizResult';
import Leaderboard from './pages/Leaderboard';

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <ToastProvider>
            <div className="min-h-screen flex flex-col transition-colors duration-300">
              {/* Navigation Header */}
              <Navbar />

              {/* Main Content Area */}
              <main className="flex-grow">
                <Routes>
                  {/* Public routes */}
                  <Route path="/" element={<Navigate to="/quizzes" replace />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/quizzes" element={<QuizList />} />
                  <Route path="/leaderboard" element={<Leaderboard />} />

                  {/* Protected routes */}
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <Profile />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/create-quiz"
                    element={
                      <ProtectedRoute>
                        <QuizBuilder />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/edit-quiz/:id"
                    element={
                      <ProtectedRoute>
                        <QuizBuilder />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/take-quiz/:id"
                    element={
                      <ProtectedRoute>
                        <TakeQuiz />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/quiz-result"
                    element={
                      <ProtectedRoute>
                        <QuizResult />
                      </ProtectedRoute>
                    }
                  />

                  {/* Fallback redirect */}
                  <Route path="*" element={<Navigate to="/quizzes" replace />} />
                </Routes>
              </main>

              {/* Glassmorphic Footer */}
              <footer className="border-t border-slate-200/10 dark:border-slate-800/40 py-6 text-center text-xs font-semibold text-slate-500 bg-white/30 dark:bg-slate-900/20 backdrop-blur-sm transition-colors">
                <div className="max-w-7xl mx-auto px-4">
                  <p>© {new Date().getFullYear()} Quizify. Built for CodSoft Web Development Internship.</p>
                </div>
              </footer>
            </div>
          </ToastProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
