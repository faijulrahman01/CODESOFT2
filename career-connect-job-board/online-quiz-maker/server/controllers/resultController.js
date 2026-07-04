import Result from '../models/Result.js';
import Quiz from '../models/Quiz.js';
import User from '../models/User.js';

// @desc    Submit answers & calculate score
// @route   POST /api/results
// @access  Private
export const submitQuizResult = async (req, res, next) => {
  try {
    const { quizId, answers } = req.body; // answers is an array of selected option indices (0-3 or -1)

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    const totalQuestions = quiz.questions.length;
    if (answers.length !== totalQuestions) {
      return res.status(400).json({ 
        success: false, 
        message: `Answer count (${answers.length}) does not match question count (${totalQuestions})` 
      });
    }

    let correctAnswersCount = 0;
    let incorrectAnswersCount = 0;

    // Check answers
    for (let i = 0; i < totalQuestions; i++) {
      const question = quiz.questions[i];
      const userAnswer = answers[i];

      if (userAnswer === question.correctAnswerIndex) {
        correctAnswersCount++;
      } else {
        incorrectAnswersCount++;
      }
    }

    const score = correctAnswersCount;
    const percentage = Number(((correctAnswersCount / totalQuestions) * 100).toFixed(2));

    // Save result
    const result = new Result({
      user: req.user._id,
      quiz: quizId,
      score,
      percentage,
      totalQuestions,
      correctAnswersCount,
      incorrectAnswersCount,
      answers,
    });

    const savedResult = await result.save();

    // Increment quiz play count
    quiz.playsCount += 1;
    await quiz.save();

    // Return the result with correct answer mapping so client can review
    res.status(201).json({
      success: true,
      data: savedResult,
      // Provide correct answers for review
      correctAnswers: quiz.questions.map(q => q.correctAnswerIndex)
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user's quiz attempt history
// @route   GET /api/results/my
// @access  Private
export const getMyResults = async (req, res, next) => {
  try {
    const results = await Result.find({ user: req.user._id })
      .populate({
        path: 'quiz',
        select: 'title description creator timer',
        populate: {
          path: 'creator',
          select: 'name'
        }
      })
      .sort({ completedAt: -1 });

    res.json({
      success: true,
      count: results.length,
      data: results,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get global leaderboard
// @route   GET /api/results/leaderboard
// @access  Public
export const getLeaderboard = async (req, res, next) => {
  try {
    // Return top 15 quiz results sorted by percentage and score
    const results = await Result.find()
      .populate('user', 'name avatar')
      .populate('quiz', 'title')
      .sort({ percentage: -1, completedAt: 1 })
      .limit(15);

    // Filter out results where user or quiz might have been deleted
    const filteredResults = results.filter(r => r.user && r.quiz);

    res.json({
      success: true,
      data: filteredResults,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get dashboard statistics for current user
// @route   GET /api/results/dashboard/stats
// @access  Private
export const getDashboardStats = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // 1. Quizzes taken by the user
    const userAttempts = await Result.find({ user: userId }).populate('quiz', 'title');
    const totalQuizzesTaken = userAttempts.length;

    // 2. Average score of quizzes taken
    const avgScore = totalQuizzesTaken > 0
      ? Number((userAttempts.reduce((acc, curr) => acc + curr.percentage, 0) / totalQuizzesTaken).toFixed(2))
      : 0;

    // 3. Quizzes created by the user
    const myQuizzes = await Quiz.find({ creator: userId });
    const totalQuizzesCreated = myQuizzes.length;

    // 4. Total plays of quizzes created by user
    const totalPlaysReceived = myQuizzes.reduce((acc, curr) => acc + (curr.playsCount || 0), 0);

    // 5. Recent attempts (last 5)
    const recentAttempts = await Result.find({ user: userId })
      .populate('quiz', 'title timer')
      .sort({ completedAt: -1 })
      .limit(5);

    res.json({
      success: true,
      data: {
        totalQuizzesTaken,
        totalQuizzesCreated,
        avgScore,
        totalPlaysReceived,
        recentAttempts,
      },
    });
  } catch (error) {
    next(error);
  }
};
