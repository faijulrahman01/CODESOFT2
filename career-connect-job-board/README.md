# CareerConnect | Modern MERN Job Board Platform

CareerConnect is a production-quality, responsive Job Board Web Application built as a portfolio milestone for the CodSoft Web Development Internship. The platform serves as a modern marketplace bridging candidates looking for engineering vacancies and commercial recruitment teams posting opportunities.

---

## 🚀 Key Features

### 🔐 1. Authentication & Role Management
* **Secure Sessions**: Utilizes JSON Web Token (JWT) authorizations stored in client headers.
* **Email Verification**: Multi-step register routing requiring verification tokens.
* **Role Redirection**: Dynamic routing serving custom Candidate, Employer, or Admin consoles automatically.

### 💼 2. Employer Dashboard & Job CRUD
* **Workspace Metrics**: Analytical cards detailing active posts, applications count, and hires.
* **Company Profiles**: Forms to publish logo image files, website URLs, industry sector, and size.
* **Complete CRUD**: Controls to publish, edit, deactivate, or delete vacancies with salary ranges and technical tags.
* **Applicants Console**: Progression board to review details, read cover letters, open PDF resumes, and update application statuses.

### 🎓 3. Candidate Dashboard & Resume Uploads
* **Applied Feed**: Applications list showing progression statuses ("applied", "interviewing", "accepted", "rejected").
* **Bookmarks**: Saves listings to evaluate later.
* **Portfolio Builder**: Dynamic skill tag generator, education history, and experience lists.
* **Resume Uploads**: PDF uploader utilizing Cloudinary storage or static server folder backup storage when offline.

### 📅 4. Interview Scheduler & Emails
* **Automatic Scheduler**: Dynamic modal letting employers select datetime marks and insert conference meeting URLs.
* **Automated SMTP Notifications**: Styled HTML layout updates dispatched to candidate inboxes.

### 🛡️ 5. Content Moderation Admin Panel
* **Platform Insights**: Aggregated ratios of roles and jobs.
* **Moderation Panels**: Capabilities to delete spam user profiles or remove malicious listings.

---

## 🛠️ Tech Stack
* **Frontend**: React.js (Vite), Tailwind CSS v3, Framer Motion, Lucide React icons, Axios.
* **Backend**: Node.js, Express.js, MongoDB (Mongoose schemas), Multer file validate middleware.
* **Services**: Cloudinary API, Nodemailer SMTP.

---

## 📁 Directory Structure
```
career-connect/
├── client/                     # Vite React Frontend
│   ├── src/
│   │   ├── assets/             # SVG logo files
│   │   ├── components/         # Protected routes, Navbar
│   │   ├── context/            # Auth, Theme, Toast notifications
│   │   ├── hooks/              # Custom React hooks
│   │   ├── pages/              # Home, Jobs, JobDetails, Dashboards, Auth
│   │   ├── services/           # Axios helper wrappers
│   │   ├── index.css           # Global theme, glassmorphism panel configs
│   │   └── App.jsx             # Main Router
├── server/                     # Express Node Backend
│   ├── config/                 # Mongoose DB connect
│   ├── controllers/            # Auth, Job, Application, Admin controllers
│   ├── middleware/             # Role authorization filters, Multer validations
│   ├── models/                 # Database schemas (User, Job, Company, Application, Notification)
│   ├── routes/                 # Express API routes
│   └── utils/                  # Cloudinary upload, Nodemailer email dispatcher
└── package.json                # Concurrently developer script
```

---

## ⚙️ Installation & Running

### 1. Prerequisite Setup
* Ensure Node.js (v16+) and MongoDB are installed and running locally.

### 2. Configure Environment variables
Navigate to `/server` directory and write configurations inside `.env`:
```env
MONGO_URI=mongodb://localhost:27017/career_connect
JWT_SECRET=super_secret_jwt_hash_key_123456
JWT_EXPIRE=30d
```
*(Note: If Cloudinary or SMTP credentials are not configured, files will fallback to local folder storage, and email logs will print to the terminal console safely).*

### 3. Quick Start (Concurrently)
From the project root directory, run:
```bash
# Install root, backend, and client dependencies
npm run install-all

# Launch both local portals together
npm run dev
```
* The React app will run at `http://localhost:5173`.
* The Express server will boot at `http://localhost:5000`.
