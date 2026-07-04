import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import Quiz from './models/Quiz.js';
import Result from './models/Result.js';

// Load env vars
dotenv.config();

const quizzesData = [
  {
    title: 'JavaScript Basics',
    description: 'Test your foundational knowledge of JavaScript scope, closures, variables, and data structures.',
    timer: 300, // 5 minutes
    isPublic: true,
    questions: [
      {
        questionText: 'Which keyword is used to declare a block-scoped local variable in JavaScript?',
        options: ['var', 'let', 'const', 'both let and const'],
        correctAnswerIndex: 3,
      },
      {
        questionText: 'What is the output of console.log(typeof NaN)?',
        options: ['number', 'NaN', 'undefined', 'object'],
        correctAnswerIndex: 0,
      },
      {
        questionText: 'Which method returns the index of the first occurrence of a specified value in a string?',
        options: ['search()', 'indexOf()', 'findIndex()', 'locate()'],
        correctAnswerIndex: 1,
      },
      {
        questionText: 'How do you write "Hello World" in an alert box?',
        options: ['msgBox("Hello World");', 'alertBox("Hello World");', 'alert("Hello World");', 'msg("Hello World");'],
        correctAnswerIndex: 2,
      },
    ],
  },
  {
    title: 'Web Design & HTML/CSS Quiz',
    description: 'Test your understanding of semantic HTML tags, CSS box model, and layout frameworks.',
    timer: 240, // 4 minutes
    isPublic: true,
    questions: [
      {
        questionText: 'What does CSS stand for?',
        options: ['Creative Style Sheets', 'Cascading Style Sheets', 'Computer Style Sheets', 'Colorful Style Sheets'],
        correctAnswerIndex: 1,
      },
      {
        questionText: 'Which HTML5 element is used to specify a footer for a document or section?',
        options: ['<bottom>', '<footer-section>', '<footer>', '<section-footer>'],
        correctAnswerIndex: 2,
      },
      {
        questionText: 'In the CSS box model, which property represents the space inside the border and outside the content?',
        options: ['margin', 'padding', 'spacing', 'outline'],
        correctAnswerIndex: 1,
      },
      {
        questionText: 'Which HTML tag is used to define an internal style sheet?',
        options: ['<css>', '<script>', '<style>', '<link>'],
        correctAnswerIndex: 2,
      },
    ],
  },
  {
    title: 'General Trivia Quiz',
    description: 'A collection of fun trivia questions across science, space, history, and pop culture.',
    timer: 180, // 3 minutes
    isPublic: true,
    questions: [
      {
        questionText: 'Which planet is known as the Red Planet?',
        options: ['Venus', 'Saturn', 'Mars', 'Jupiter'],
        correctAnswerIndex: 2,
      },
      {
        questionText: 'Who painted the Mona Lisa?',
        options: ['Vincent van Gogh', 'Leonardo da Vinci', 'Pablo Picasso', 'Michelangelo'],
        correctAnswerIndex: 1,
      },
      {
        questionText: 'What is the chemical symbol for gold?',
        options: ['Au', 'Ag', 'Gd', 'Go'],
        correctAnswerIndex: 0,
      },
      {
        questionText: 'How many bones are there in an adult human body?',
        options: ['206', '300', '216', '196'],
        correctAnswerIndex: 0,
      },
    ],
  },
];

const seedData = async () => {
  try {
    const connStr = process.env.MONGODB_URI || 'mongodb://localhost:27017/quizify';
    console.log(`Connecting to MongoDB at ${connStr}...`);
    await mongoose.connect(connStr);

    console.log('Clearing existing database collections...');
    await User.deleteMany();
    await Quiz.deleteMany();
    await Result.deleteMany();

    console.log('Seeding user collections...');
    // Create demo user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    const demoUser = await User.create({
      name: 'Demo Intern',
      email: 'demo@quizify.com',
      password: hashedPassword,
      avatar: '',
      bio: 'CodSoft Web Development Internship demo evaluator account.',
    });

    console.log(`Demo User Created: ${demoUser.email} (password: password123)`);

    console.log('Seeding quiz collections...');
    const createdQuizzes = [];
    for (const quiz of quizzesData) {
      const newQuiz = await Quiz.create({
        ...quiz,
        creator: demoUser._id,
      });
      createdQuizzes.push(newQuiz);
      console.log(`Quiz Seeding Complete: "${newQuiz.title}"`);
    }

    console.log('Database successfully seeded with demo content.');
    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error(`Database seeding failed: ${error.message}`);
    process.exit(1);
  }
};

seedData();
