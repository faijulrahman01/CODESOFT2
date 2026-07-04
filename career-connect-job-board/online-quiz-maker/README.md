# Quizify - Full Stack Online Quiz Maker

Quizify is a production-quality, responsive Online Quiz Maker application developed using the MERN stack (MongoDB, Express, React, Node.js) with Tailwind CSS. It is built as a portfolio-grade project for the CodSoft Web Development Internship.

The app features a modern SaaS-style glassmorphism interface, custom dark mode, countdown timers, progress bars, interactive question-by-question navigation, instant score grading, and user dashboards with plays/score stats.

---

## Technical Stack & Libraries

- **Frontend**: React.js (Vite), React Router v6, Axios, Tailwind CSS v3, Framer Motion (Transitions), Lucide React (Icons), Canvas-Confetti (Success Animations)
- **Backend**: Node.js, Express.js REST API
- **Database**: MongoDB & Mongoose (Schemas, references, validation)
- **Security**: JWT Authentication, Password Hashing (`bcryptjs`), Input Sanitization & Validation (`express-validator`), CORS protection.

---

## Directory Structure

```text
online-quiz-maker/
├── server/
│   ├── config/             # DB configuration (db.js)
│   ├── controllers/        # Express handlers (auth, quiz, results)
│   ├── middleware/         # Custom middlewares (auth protection, multer upload, error handler)
│   ├── models/             # Mongoose schemas (User, Quiz, Result)
│   ├── routes/             # Express API endpoints
│   ├── utils/              # Token generators and seeder logic
│   ├── uploads/            # Local directory for user profile avatars
│   ├── .env                # Server environment variables
│   ├── server.js           # Express app entry point
│   └── seeder.js           # Preloads demo data for internship evaluation
├── client/
│   ├── src/
│   │   ├── assets/         # App logo and visuals
│   │   ├── components/     # Reusable layout and routing components (Navbar, ProtectedRoute)
│   │   ├── context/        # React contexts (AuthContext, ThemeContext, ToastContext)
│   │   ├── hooks/          # useAuth helper hooks
│   │   ├── pages/          # Layout pages (Login, Register, Dashboard, TakeQuiz, QuizResult, etc.)
│   │   ├── services/       # Axios wrappers (api.js, authService, quizService, resultService)
│   │   ├── App.jsx         # App router and layout definitions
│   │   ├── index.css       # Tailwind directives & glassmorphic utility classes
│   │   └── main.jsx        # Client entry point
│   ├── tailwind.config.js  # Tailwind theme layout settings
│   ├── postcss.config.js   # Autoprefixer settings
│   ├── index.html          # Base DOM file
│   └── package.json        # Client dependencies
├── README.md               # Setup and architecture handbook
└── .gitignore              # Files ignored by Git
```

---

## Database Schema & Models

### 1. User (`/server/models/User.js`)
- `name`: String, required, trims.
- `email`: String, required, unique, lowercase.
- `password`: String, required, hidden by default (`select: false`), hashed.
- `avatar`: String (URL path), default `""`.
- `bio`: String, default `""`.
- Timestamps enabled (`createdAt`, `updatedAt`).

### 2. Quiz (`/server/models/Quiz.js`)
- `title`: String, required.
- `description`: String, required.
- `creator`: Reference `ObjectId -> User`.
- `questions`: Array of Question Subschema:
  - `questionText`: String, required.
  - `options`: Array of exactly 4 strings.
  - `correctAnswerIndex`: Number (0-3).
- `timer`: Number (time limit in seconds, 0 = unlimited).
- `isPublic`: Boolean, default `true`.
- `playsCount`: Number, default `0`.

### 3. Result (`/server/models/Result.js`)
- `user`: Reference `ObjectId -> User`.
- `quiz`: Reference `ObjectId -> Quiz`.
- `score`: Number (correct answers count).
- `percentage`: Number (percentage grade).
- `totalQuestions`: Number.
- `correctAnswersCount`: Number.
- `incorrectAnswersCount`: Number.
- `answers`: Array of option indices chosen by user.
- Timestamps enabled (stores completion date as `completedAt`).

---

## API Endpoints List

### Authentication (`/api/auth`)
- `POST /register`: Registers a new user account.
- `POST /login`: Securely verifies passwords and issues JWTs.
- `GET /profile`: Retrieves the logged-in user profile. (Protected)
- `PUT /profile`: Updates name, bio, and uploads user avatar picture (via Multer). (Protected)

### Quizzes (`/api/quizzes`)
- `GET /`: Lists all public quizzes (supports `?search=` filter and pagination).
- `GET /my`: Lists all quizzes created by the current user. (Protected)
- `GET /:id`: Retrieves single quiz layout.
- `POST /`: Creates a new quiz with custom questions and timers. (Protected)
- `PUT /:id`: Modifies an existing quiz (creator-locked). (Protected)
- `DELETE /:id`: Deletes a quiz and cascade-deletes results (creator-locked). (Protected)

### Results & Statistics (`/api/results`)
- `POST /`: Evaluates and grades selected options, creates a `Result`, and increments plays counters. (Protected)
- `GET /my`: Retrieves all quiz attempt history for the logged-in user. (Protected)
- `GET /leaderboard`: Lists top 15 results globally by grade.
- `GET /dashboard/stats`: Returns aggregated stats (plays got, average scores, attempts) for dashboard views. (Protected)

---

## Local Setup & Installation

### Prerequisites
1. **Node.js** (v16+ recommended)
2. **MongoDB** (local database or MongoDB Atlas cloud connection URI)

### Step 1: Install Dependencies
Run in server:
```bash
cd server
npm install
```

Run in client:
```bash
cd client
npm install
```

### Step 2: Configure Environment Variables
Create a `.env` file under `/server/`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/quizify
JWT_SECRET=yoursecretkey123
NODE_ENV=development
```

### Step 3: Run Database Seeder (Highly Recommended)
To quickly pre-populate the database with a pre-configured user profile and three complete quizzes for quick grading:
```bash
cd server
npm run seed
```
**Demo Account pre-loaded by seeder:**
- **Email**: `demo@quizify.com`
- **Password**: `password123`

### Step 4: Run Applications
Start Express backend:
```bash
cd server
npm run dev
```

Start React (Vite) client:
```bash
cd client
npm run dev
```
Open client in browser (usually `http://localhost:5173`).

---

## Deployment Ready Notes

### Frontend (Vercel)
- Set build command: `npm run build`
- Set output directory: `dist`
- Configure `client/.env.production` (or dashboard variables) with `VITE_API_URL` pointing to your deployed backend API url (e.g. `https://your-backend.render.com/api`).

### Backend (Render)
- Deploy the `/server` subfolder directory.
- Configure Environment variables: `MONGODB_URI` (MongoDB Atlas link), `JWT_SECRET`, `NODE_ENV=production`.
- Add CORS config (origin URLs) to whitelist your Vercel frontend URL.
