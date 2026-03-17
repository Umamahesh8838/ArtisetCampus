# Artiset Campus System - Full Stack Architecture & Implementation Plan

## Project Scope

**Artiset Campus Recruitment System** - A complete full-stack platform for managing student placements, recruitment drives, sessions, applications, and assessments.

### Core Modules

1. **Authentication & Authorization**
   - OTP-based signup/login (existing)
   - Role-based access control (RBAC)
   - JWT token management

2. **Student Module**
   - Profile management (existing)
   - Application management
   - Interview schedule
   - Marks & results
   - Placement status

3. **Sessions Management**
   - Recruitment drives
   - Exam sessions (aptitude, technical)
   - Interview sessions (technical, HR)
   - Student registration for sessions

4. **Placements Module**
   - Company profiles & onboarding
   - Job descriptions & postings
   - Applications workflow
   - Offer management
   - Placement tracking

5. **Applications & Rounds**
   - Application status tracking
   - Round progression (multi-stage)
   - Round results & scoring
   - Offer letters

6. **Marks & Assessment**
   - Exam scoring
   - Question banks & responses
   - Interview evaluations
   - Performance analytics

7. **Notifications**
   - Email notifications
   - In-app notifications
   - SMS alerts (optional)

---

## Tech Stack

### Backend
- **Node.js + Express.js** (existing)
- **MySQL** (existing legacy schema)
- **Transactional integrity** (existing patterns)
- **JWT + bcrypt** (existing)
- **Structured logging** (existing)

### Frontend
- **React.js** (SPA)
- **Tailwind CSS** (styling)
- **React Router** (routing)
- **Axios** (HTTP client)
- **React Query / SWR** (data fetching & caching)
- **Context API / Redux** (state management)
- **Chart.js / Recharts** (analytics/dashboards)

---

## Database Schema Extensions

### New Tables to Add

#### Users & Roles
```sql
-- Extend users table with roles
ALTER TABLE users ADD COLUMN role ENUM('student', 'tpo', 'recruiter', 'admin') DEFAULT 'student';
ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT 1;

-- Role permissions mapping
CREATE TABLE tbl_cp_mroles (
  role_id INT PRIMARY KEY,
  role_name VARCHAR(50),
  permissions JSON,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tbl_cp_user_roles (
  user_id INT FK -> users.id,
  role_id INT FK -> tbl_cp_mroles.role_id,
  assigned_at DATETIME
);
```

#### Company & Recruitment
```sql
CREATE TABLE tbl_cp_mcompany (
  company_id INT PRIMARY KEY,
  company_name VARCHAR(255),
  headquarters VARCHAR(255),
  industry VARCHAR(100),
  website VARCHAR(255),
  logo_url VARCHAR(255),
  spoc_name VARCHAR(100),
  spoc_email VARCHAR(100),
  spoc_phone VARCHAR(20),
  is_active BOOLEAN,
  created_at DATETIME
);

CREATE TABLE tbl_cp_recruitment_drive (
  drive_id INT PRIMARY KEY,
  company_id INT FK,
  drive_name VARCHAR(255),
  drive_start_date DATE,
  drive_end_date DATE,
  description TEXT,
  status ENUM('upcoming', 'ongoing', 'completed'),
  created_at DATETIME
);

CREATE TABLE tbl_cp_job_description (
  jd_id INT PRIMARY KEY,
  drive_id INT FK,
  company_id INT FK,
  position VARCHAR(100),
  salary_min DECIMAL(10, 2),
  salary_max DECIMAL(10, 2),
  location VARCHAR(255),
  job_type ENUM('fulltime', 'intern'),
  skills_required JSON,
  description TEXT,
  created_at DATETIME
);
```

#### Sessions
```sql
CREATE TABLE tbl_cp_exam_session (
  session_id INT PRIMARY KEY,
  drive_id INT FK,
  session_name VARCHAR(100),
  session_type ENUM('aptitude', 'technical', 'coding'),
  scheduled_date DATETIME,
  duration_minutes INT,
  total_questions INT,
  total_marks INT,
  status ENUM('scheduled', 'active', 'completed'),
  created_at DATETIME
);

CREATE TABLE tbl_cp_interview_session (
  session_id INT PRIMARY KEY,
  drive_id INT FK,
  session_name VARCHAR(100),
  round_type ENUM('technical', 'hr', 'manager'),
  scheduled_date DATETIME,
  duration_minutes INT,
  max_strength INT,
  status ENUM('scheduled', 'active', 'completed'),
  created_at DATETIME
);
```

#### Applications
```sql
CREATE TABLE tbl_cp_application (
  application_id INT PRIMARY KEY,
  student_id INT FK,
  jd_id INT FK,
  company_id INT FK,
  drive_id INT FK,
  applied_date DATETIME,
  status ENUM('applied', 'shortlisted', 'rejected', 'offered', 'placed'),
  current_round VARCHAR(50),
  created_at DATETIME
);

CREATE TABLE tbl_cp_application_status_history (
  history_id INT PRIMARY KEY,
  application_id INT FK,
  from_status VARCHAR(50),
  to_status VARCHAR(50),
  round_name VARCHAR(50),
  changed_at DATETIME,
  changed_by INT FK -> users.id
);
```

#### Rounds & Results
```sql
CREATE TABLE tbl_cp_jd_round_config (
  config_id INT PRIMARY KEY,
  jd_id INT FK,
  round_number INT,
  round_type ENUM('exam', 'interview'),
  round_name VARCHAR(100),
  is_mandatory BOOLEAN,
  pass_percentage DECIMAL(5, 2),
  total_marks INT,
  created_at DATETIME
);

CREATE TABLE tbl_cp_m2m_jd_round_module (
  m2m_id INT PRIMARY KEY,
  config_id INT FK,
  session_id INT,
  session_type ENUM('exam', 'interview'),
  created_at DATETIME
);
```

#### Marks & Scoring
```sql
CREATE TABLE tbl_cp_msubjects (
  subject_id INT PRIMARY KEY,
  subject_name VARCHAR(100),
  description TEXT
);

CREATE TABLE tbl_cp_mquestions (
  question_id INT PRIMARY KEY,
  subject_id INT FK,
  session_id INT FK,
  question_text TEXT,
  question_type ENUM('mcq', 'coding', 'subjective'),
  difficulty ENUM('easy', 'medium', 'hard'),
  marks INT,
  created_at DATETIME
);

CREATE TABLE tbl_cp_m2m_question_options (
  option_id INT PRIMARY KEY,
  question_id INT FK,
  option_text TEXT,
  is_correct BOOLEAN,
  order_index INT
);

CREATE TABLE tbl_cp_m2m_exam_question_response (
  response_id INT PRIMARY KEY,
  student_id INT FK,
  session_id INT FK,
  question_id INT FK,
  selected_option_id INT,
  submitted_answer TEXT,
  is_correct BOOLEAN,
  marks_obtained INT,
  created_at DATETIME
);

CREATE TABLE tbl_cp_m2m_session_question_response (
  score_id INT PRIMARY KEY,
  student_id INT FK,
  session_id INT FK,
  total_questions INT,
  attempted_questions INT,
  correct_answers INT,
  marks_obtained INT,
  total_marks INT,
  percentage DECIMAL(5, 2),
  status ENUM('pass', 'fail'),
  created_at DATETIME
);
```

#### Offers & Placements
```sql
CREATE TABLE tbl_cp_mround_result (
  result_id INT PRIMARY KEY,
  application_id INT FK,
  round_name VARCHAR(50),
  round_score INT,
  round_total INT,
  evaluator_id INT FK -> users.id,
  evaluation_date DATETIME,
  result ENUM('pass', 'fail', 'hold'),
  comments TEXT,
  created_at DATETIME
);

CREATE TABLE tbl_cp_offers (
  offer_id INT PRIMARY KEY,
  application_id INT FK,
  student_id INT FK,
  company_id INT FK,
  jd_id INT FK,
  offer_salary DECIMAL(10, 2),
  offer_date DATETIME,
  acceptance_date DATETIME,
  status ENUM('sent', 'accepted', 'rejected', 'expired'),
  created_at DATETIME
);

CREATE TABLE tbl_cp_placements (
  placement_id INT PRIMARY KEY,
  student_id INT FK,
  company_id INT FK,
  offer_id INT FK,
  offer_salary DECIMAL(10, 2),
  ctc DECIMAL(10, 2),
  job_title VARCHAR(100),
  placement_date DATETIME,
  joining_date DATE,
  created_at DATETIME
);
```

#### Notifications
```sql
CREATE TABLE tbl_cp_notifications (
  notification_id INT PRIMARY KEY,
  recipient_id INT FK -> users.id,
  notification_type ENUM('placement_update', 'round_schedule', 'result', 'offer'),
  title VARCHAR(255),
  message TEXT,
  is_read BOOLEAN DEFAULT 0,
  created_at DATETIME,
  read_at DATETIME
);
```

---

## API Endpoints by Module

### Authentication (existing, enhanced with RBAC)
```
POST   /auth/send-email-otp
POST   /auth/verify-email-otp
POST   /auth/send-phone-otp
POST   /auth/verify-phone-otp
POST   /auth/signup
POST   /auth/login
POST   /auth/logout
POST   /auth/refresh-token
POST   /auth/reset-password
```

### User & Roles (NEW)
```
GET    /users/me
PUT    /users/me
GET    /users/:id/profile
POST   /admin/users
GET    /admin/users
PUT    /admin/users/:id
DELETE /admin/users/:id
GET    /admin/roles
POST   /admin/roles
```

### Companies (NEW)
```
GET    /companies
GET    /companies/:id
POST   /admin/companies
PUT    /admin/companies/:id
DELETE /admin/companies/:id
GET    /companies/:id/recruitment-drives
```

### Recruitment Drives (NEW)
```
GET    /recruitment-drives
GET    /recruitment-drives/:id
POST   /admin/recruitment-drives
PUT    /admin/recruitment-drives/:id
GET    /recruitment-drives/:id/job-descriptions
GET    /recruitment-drives/:id/sessions
POST   /student/recruitment-drives/:id/register
GET    /student/recruitment-drives
```

### Job Descriptions (NEW)
```
GET    /job-descriptions
GET    /job-descriptions/:id
POST   /admin/job-descriptions
PUT    /admin/job-descriptions/:id
GET    /job-descriptions/:id/applications
```

### Applications (NEW)
```
POST   /applications
GET    /student/applications
GET    /applications/:id
GET    /applications/:id/status-history
PUT    /applications/:id/status
```

### Sessions (NEW)
```
GET    /exam-sessions
GET    /exam-sessions/:id
POST   /admin/exam-sessions
GET    /interview-sessions
GET    /interview-sessions/:id
POST   /admin/interview-sessions
POST   /student/sessions/:id/register
GET    /student/sessions
```

### Marks & Scoring (NEW)
```
GET    /exam-sessions/:id/questions
POST   /exam-sessions/:id/submit-responses
GET    /student/exam-results
GET    /student/marks
GET    /admin/exam-results
```

### Placements (NEW)
```
GET    /student/placements
GET    /student/offers
PUT    /student/offers/:id/accept
PUT    /student/offers/:id/reject
GET    /admin/placements
GET    /admin/placements/statistics
```

### Notifications (NEW)
```
GET    /notifications
GET    /notifications/:id
PUT    /notifications/:id/read
DELETE /notifications/:id
```

---

## Frontend Pages by Role

### Student
1. **Auth Pages**
   - Login
   - Signup (with OTP verification)
   - Password Reset
   - Profile Completion

2. **Dashboard**
   - Overview (placement status, upcoming sessions)
   - Applications (list, status, timeline)
   - Interview Schedule
   - Marks & Results
   - Offers
   - Placement Status

3. **Recruitment Drives**
   - Browse available drives
   - Register for drives
   - View companies
   - Job postings

4. **Exams**
   - Upcoming exams
   - Exam instructions
   - Exam interface (questions, timer, submit)
   - Results

5. **Profile**
   - View/Edit profile
   - Resume upload
   - Skills, projects, certifications

### TPO (Training & Placement Officer)
1. **Dashboard**
   - Overview (drives, placements, statistics)
   - Key metrics

2. **Recruitment Drives**
   - Create/manage drives
   - Onboard companies
   - Track drive progress

3. **Students**
   - List all students
   - Filter/search
   - View profiles
   - Placement status tracking

4. **Placements**
   - View all placements
   - Statistics & analytics
   - Reports

5. **Sessions**
   - Create exam sessions
   - Create interview sessions
   - Schedule sessions
   - View results

### Recruiter
1. **Dashboard**
   - Overview (postings, applications, placements)

2. **Job Postings**
   - Create/manage job descriptions
   - View applications
   - Manage application status

3. **Interviews**
   - Schedule interviews
   - Conduct interviews
   - Evaluate candidates
   - Send offers

4. **Applications**
   - Review applications
   - Move through rounds
   - Send rejections/offers

### Admin
1. **Dashboard**
   - System overview
   - User management
   - Analytics

2. **User Management**
   - Create/manage users
   - Assign roles
   - Manage permissions

3. **System Settings**
   - Configure system parameters
   - Manage master data

---

## Implementation Timeline (3 weeks)

### Week 1: Foundation & Core Modules
- Day 1-2: Database schema extensions + migrations
- Day 3-4: RBAC middleware + user roles system
- Day 5: Authentication enhancements
- Day 6-7: Companies + recruitment drives API

### Week 2: Applications & Sessions
- Day 1-2: Job descriptions + applications API
- Day 3-4: Exam & interview sessions API
- Day 5-6: Marks & scoring API
- Day 7: Integration testing

### Week 3: Frontend + Polish
- Day 1-3: Auth pages + login/signup flow
- Day 4-5: Student dashboard + application list
- Day 6-7: TPO/Recruiter dashboards + E2E testing

---

## File Structure

```
backend/
├── config/
│   ├── db.js (existing, extended)
│   └── rbac.js (NEW)
├── controllers/
│   ├── authController.js (existing, extended)
│   ├── userController.js (NEW)
│   ├── companyController.js (NEW)
│   ├── recruitmentDriveController.js (NEW)
│   ├── jobDescriptionController.js (NEW)
│   ├── applicationController.js (NEW)
│   ├── sessionController.js (NEW)
│   ├── marksController.js (NEW)
│   ├── placementController.js (NEW)
│   └── notificationController.js (NEW)
├── middleware/
│   ├── auth.js (existing, extended)
│   ├── rbac.js (NEW)
│   └── validation.js (existing, extended)
├── routes/
│   ├── authRoutes.js (existing)
│   ├── userRoutes.js (NEW)
│   ├── companyRoutes.js (NEW)
│   ├── recruitmentDriveRoutes.js (NEW)
│   ├── jobDescriptionRoutes.js (NEW)
│   ├── applicationRoutes.js (NEW)
│   ├── sessionRoutes.js (NEW)
│   ├── marksRoutes.js (NEW)
│   ├── placementRoutes.js (NEW)
│   └── notificationRoutes.js (NEW)
├── utils/
│   ├── generateOtp.js (existing)
│   ├── validation.js (existing)
│   ├── logger.js (existing)
│   ├── masterHelpers2.js (existing)
│   └── permissions.js (NEW)
└── server.js (existing, updated routes)

frontend/
├── src/
│   ├── components/
│   │   ├── Auth/
│   │   │   ├── Login.jsx
│   │   │   ├── Signup.jsx
│   │   │   ├── OTPVerification.jsx
│   │   │   └── PasswordReset.jsx
│   │   ├── Student/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── ApplicationsList.jsx
│   │   │   ├── ExamInterface.jsx
│   │   │   ├── InterviewSchedule.jsx
│   │   │   └── PlacementStatus.jsx
│   │   ├── TPO/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── RecruitmentDrives.jsx
│   │   │   ├── Sessions.jsx
│   │   │   └── Analytics.jsx
│   │   ├── Recruiter/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── JobPostings.jsx
│   │   │   ├── ApplicationReview.jsx
│   │   │   └── OfferManagement.jsx
│   │   └── Common/
│   │       ├── Navbar.jsx
│   │       ├── Sidebar.jsx
│   │       ├── Modal.jsx
│   │       └── Table.jsx
│   ├── pages/
│   │   ├── HomePage.jsx
│   │   ├── DashboardPage.jsx
│   │   ├── ProfilePage.jsx
│   │   └── NotFoundPage.jsx
│   ├── context/
│   │   ├── AuthContext.jsx
│   │   └── NotificationContext.jsx
│   ├── hooks/
│   │   ├── useAuth.js
│   │   ├── useFetch.js
│   │   └── useNotification.js
│   ├── services/
│   │   ├── api.js
│   │   ├── authService.js
│   │   ├── applicationService.js
│   │   ├── placementService.js
│   │   └── notificationService.js
│   ├── styles/
│   │   ├── globals.css
│   │   ├── tailwind.css
│   │   └── components.css
│   ├── App.jsx
│   └── index.jsx
├── public/
├── .env.example
├── tailwind.config.js
├── package.json
└── vite.config.js
```

---

## Next Steps

1. **Database Migration** - Create new tables with proper indexes
2. **Backend API Implementation** - Start with RBAC middleware, then each module
3. **Frontend Setup** - React + Tailwind CSS scaffolding
4. **Integration Testing** - E2E tests for critical workflows
5. **Deployment** - Docker containers, CI/CD pipeline

---

**Estimated LOC (Lines of Code):**
- Backend: 8,000-10,000 lines
- Frontend: 6,000-8,000 lines
- Tests: 2,000-3,000 lines
- **Total: ~17,000-21,000 lines**

**Effort: 3 weeks (1 senior dev + 1 mid-level dev) or 6-8 weeks (1 single developer)**
