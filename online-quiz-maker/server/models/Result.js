import mongoose from 'mongoose';

const resultSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    quiz: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quiz',
      required: true,
    },
    score: {
      type: Number,
      required: true,
    },
    percentage: {
      type: Number,
      required: true,
    },
    totalQuestions: {
      type: Number,
      required: true,
    },
    correctAnswersCount: {
      type: Number,
      required: true,
    },
    incorrectAnswersCount: {
      type: Number,
      required: true,
    },
    answers: {
      type: [Number], // Indicated answer index selected by user (0-3 or -1 if skipped)
      required: true,
    },
  },
  {
    timestamps: { createdAt: 'completedAt', updatedAt: false }, // Use completedAt instead of default createdAt
  }
);

const Result = mongoose.model('Result', resultSchema);
export default Result;
