import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  questionText: {
    type: String,
    required: [true, 'Question text is required'],
    trim: true,
  },
  options: {
    type: [String],
    validate: {
      validator: function (v) {
        return Array.isArray(v) && v.length === 4;
      },
      message: 'A question must have exactly 4 options',
    },
    required: [true, '4 options are required'],
  },
  correctAnswerIndex: {
    type: Number,
    required: [true, 'Correct answer index is required'],
    min: [0, 'Index must be between 0 and 3'],
    max: [3, 'Index must be between 0 and 3'],
  },
});

const quizSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Quiz title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Quiz description is required'],
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    questions: {
      type: [questionSchema],
      validate: {
        validator: function (v) {
          return Array.isArray(v) && v.length > 0;
        },
        message: 'Quiz must have at least 1 question',
      },
    },
    timer: {
      type: Number, // Quiz duration in seconds (0 means unlimited)
      default: 0,
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
    playsCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Quiz = mongoose.model('Quiz', quizSchema);
export default Quiz;
