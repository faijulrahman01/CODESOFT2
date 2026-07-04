import Quiz from '../models/Quiz.js';

// @desc    Get all public quizzes with optional search/filter
// @route   GET /api/quizzes
// @access  Public
export const getQuizzes = async (req, res, next) => {
  try {
    const { search, limit = 10, page = 1 } = req.query;
    
    // Create query
    const query = { isPublic: true };
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const skipIndex = (page - 1) * limit;

    const quizzes = await Quiz.find(query)
      .populate('creator', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip(Number(skipIndex));

    const total = await Quiz.countDocuments(query);

    res.json({
      success: true,
      count: quizzes.length,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      data: quizzes,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user's quizzes
// @route   GET /api/quizzes/my
// @access  Private
export const getMyQuizzes = async (req, res, next) => {
  try {
    const quizzes = await Quiz.find({ creator: req.user._id })
      .sort({ createdAt: -1 });
      
    res.json({
      success: true,
      count: quizzes.length,
      data: quizzes,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single quiz details
// @route   GET /api/quizzes/:id
// @access  Public
export const getQuizById = async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.id).populate('creator', 'name avatar');

    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    res.json({
      success: true,
      data: quiz,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new quiz
// @route   POST /api/quizzes
// @access  Private
export const createQuiz = async (req, res, next) => {
  try {
    const { title, description, questions, timer, isPublic } = req.body;

    if (!questions || questions.length === 0) {
      return res.status(400).json({ success: false, message: 'At least one question is required' });
    }

    // Verify format of each question
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.questionText || !q.options || q.options.length !== 4 || q.correctAnswerIndex === undefined) {
        return res.status(400).json({
          success: false,
          message: `Question ${i + 1} is invalid. Make sure it contains text, exactly 4 options, and a correct answer index.`,
        });
      }
    }

    const quiz = new Quiz({
      title,
      description,
      creator: req.user._id,
      questions,
      timer: timer || 0,
      isPublic: isPublic !== undefined ? isPublic : true,
    });

    const savedQuiz = await quiz.save();

    res.status(201).json({
      success: true,
      data: savedQuiz,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a quiz
// @route   PUT /api/quizzes/:id
// @access  Private
export const updateQuiz = async (req, res, next) => {
  try {
    let quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    // Ensure user is creator
    if (quiz.creator.toString() !== req.user._id.toString()) {
      return res.status(401).json({ success: false, message: 'User not authorized to update this quiz' });
    }

    const { title, description, questions, timer, isPublic } = req.body;

    // Verify format of questions if updating them
    if (questions) {
      if (questions.length === 0) {
        return res.status(400).json({ success: false, message: 'At least one question is required' });
      }
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        if (!q.questionText || !q.options || q.options.length !== 4 || q.correctAnswerIndex === undefined) {
          return res.status(400).json({
            success: false,
            message: `Question ${i + 1} is invalid.`,
          });
        }
      }
      quiz.questions = questions;
    }

    quiz.title = title || quiz.title;
    quiz.description = description || quiz.description;
    quiz.timer = timer !== undefined ? timer : quiz.timer;
    quiz.isPublic = isPublic !== undefined ? isPublic : quiz.isPublic;

    const updatedQuiz = await quiz.save();

    res.json({
      success: true,
      data: updatedQuiz,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a quiz
// @route   DELETE /api/quizzes/:id
// @access  Private
export const deleteQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    // Ensure user is creator
    if (quiz.creator.toString() !== req.user._id.toString()) {
      return res.status(401).json({ success: false, message: 'User not authorized to delete this quiz' });
    }

    await quiz.deleteOne();

    res.json({
      success: true,
      message: 'Quiz removed successfully',
    });
  } catch (error) {
    next(error);
  }
};
