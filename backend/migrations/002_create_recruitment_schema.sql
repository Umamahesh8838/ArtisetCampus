-- Migration 002: Create recruitment, placements, marks, and RBAC schema
-- This migration extends the core OTP auth schema with full campus platform tables

-- ============================================================================
-- 1. RBAC (Role-Based Access Control)
-- ============================================================================

ALTER TABLE users ADD COLUMN role ENUM('student', 'tpo', 'recruiter', 'admin') DEFAULT 'student' AFTER is_registration_complete;
ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT 1 AFTER role;
ALTER TABLE users ADD KEY idx_role (role);
ALTER TABLE users ADD KEY idx_is_active (is_active);

-- Role definitions and permissions
CREATE TABLE IF NOT EXISTS tbl_cp_mroles (
  role_id INT PRIMARY KEY,
  role_name VARCHAR(50) NOT NULL UNIQUE,
  description VARCHAR(255),
  permissions JSON,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_role_name (role_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO tbl_cp_mroles (role_id, role_name, description, permissions) VALUES
(1, 'student', 'Student user - can apply for jobs, take exams, view placements', 
 JSON_OBJECT(
   'applications', JSON_ARRAY('create', 'read', 'list'),
   'exams', JSON_ARRAY('read', 'list', 'submit'),
   'placements', JSON_ARRAY('read', 'list'),
   'profile', JSON_ARRAY('read', 'update')
 )),
(2, 'tpo', 'Training & Placement Officer - manage drives, sessions, placements',
 JSON_OBJECT(
   'drives', JSON_ARRAY('create', 'read', 'update', 'list'),
   'sessions', JSON_ARRAY('create', 'read', 'update', 'list'),
   'students', JSON_ARRAY('read', 'list'),
   'placements', JSON_ARRAY('read', 'list'),
   'companies', JSON_ARRAY('read', 'list')
 )),
(3, 'recruiter', 'Recruiter - post jobs, review applications, conduct interviews',
 JSON_OBJECT(
   'jobs', JSON_ARRAY('create', 'read', 'update', 'list'),
   'applications', JSON_ARRAY('read', 'list', 'update'),
   'interviews', JSON_ARRAY('create', 'read', 'update', 'list'),
   'offers', JSON_ARRAY('create', 'read', 'update', 'list')
 )),
(4, 'admin', 'Admin - manage users, roles, system settings, all data',
 JSON_OBJECT(
   'users', JSON_ARRAY('create', 'read', 'update', 'delete', 'list'),
   'roles', JSON_ARRAY('read', 'list'),
   'system', JSON_ARRAY('read', 'update'),
   'all', JSON_ARRAY('*')
 ));

-- ============================================================================
-- 2. COMPANY & RECRUITMENT DRIVE MANAGEMENT
-- ============================================================================

CREATE TABLE IF NOT EXISTS tbl_cp_mcompany (
  company_id INT PRIMARY KEY AUTO_INCREMENT,
  company_name VARCHAR(255) NOT NULL,
  headquarters VARCHAR(255),
  industry VARCHAR(100),
  company_size INT COMMENT 'Employee count',
  website VARCHAR(255),
  logo_url VARCHAR(500),
  description TEXT,
  spoc_name VARCHAR(100),
  spoc_email VARCHAR(100),
  spoc_phone VARCHAR(20),
  spoc_user_id INT,
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (spoc_user_id) REFERENCES users(id),
  KEY idx_company_name (company_name),
  KEY idx_is_active (is_active),
  KEY idx_spoc_user_id (spoc_user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS tbl_cp_recruitment_drive (
  drive_id INT PRIMARY KEY AUTO_INCREMENT,
  company_id INT NOT NULL,
  drive_name VARCHAR(255) NOT NULL,
  drive_start_date DATE NOT NULL,
  drive_end_date DATE NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT 1,
  status ENUM('upcoming', 'ongoing', 'completed', 'cancelled') DEFAULT 'upcoming',
  created_by INT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES tbl_cp_mcompany(company_id),
  FOREIGN KEY (created_by) REFERENCES users(id),
  KEY idx_company_id (company_id),
  KEY idx_status (status),
  KEY idx_start_date (drive_start_date),
  KEY idx_end_date (drive_end_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS tbl_cp_job_description (
  jd_id INT PRIMARY KEY AUTO_INCREMENT,
  drive_id INT NOT NULL,
  company_id INT NOT NULL,
  position_title VARCHAR(100) NOT NULL,
  salary_min DECIMAL(12, 2),
  salary_max DECIMAL(12, 2),
  currency VARCHAR(10) DEFAULT 'INR',
  location VARCHAR(255),
  job_type ENUM('full-time', 'internship', 'contract') DEFAULT 'full-time',
  description TEXT,
  skills_required JSON,
  qualification_min VARCHAR(100),
  experience_min INT DEFAULT 0,
  ctc_breakup JSON COMMENT 'Base salary, bonus, perks breakdown',
  is_active BOOLEAN DEFAULT 1,
  created_by INT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (drive_id) REFERENCES tbl_cp_recruitment_drive(drive_id),
  FOREIGN KEY (company_id) REFERENCES tbl_cp_mcompany(company_id),
  FOREIGN KEY (created_by) REFERENCES users(id),
  KEY idx_drive_id (drive_id),
  KEY idx_company_id (company_id),
  KEY idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 3. SESSIONS (Exams & Interviews)
-- ============================================================================

CREATE TABLE IF NOT EXISTS tbl_cp_exam_session (
  session_id INT PRIMARY KEY AUTO_INCREMENT,
  drive_id INT,
  session_name VARCHAR(100) NOT NULL,
  session_type ENUM('aptitude', 'technical', 'coding', 'general-knowledge') DEFAULT 'technical',
  scheduled_date DATETIME NOT NULL,
  duration_minutes INT NOT NULL COMMENT 'Exam duration in minutes',
  total_questions INT,
  total_marks INT,
  passing_percentage DECIMAL(5, 2) DEFAULT 40.00,
  is_negative_marking BOOLEAN DEFAULT 0,
  negative_marking_percentage DECIMAL(5, 2),
  status ENUM('scheduled', 'active', 'completed', 'cancelled') DEFAULT 'scheduled',
  created_by INT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (drive_id) REFERENCES tbl_cp_recruitment_drive(drive_id),
  FOREIGN KEY (created_by) REFERENCES users(id),
  KEY idx_drive_id (drive_id),
  KEY idx_session_type (session_type),
  KEY idx_scheduled_date (scheduled_date),
  KEY idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS tbl_cp_interview_session (
  session_id INT PRIMARY KEY AUTO_INCREMENT,
  drive_id INT,
  session_name VARCHAR(100) NOT NULL,
  round_type ENUM('technical', 'hr', 'manager-round', 'group-discussion') DEFAULT 'technical',
  round_number INT DEFAULT 1,
  scheduled_date DATETIME NOT NULL,
  duration_minutes INT NOT NULL,
  max_strength INT COMMENT 'Max students per session slot',
  location VARCHAR(255),
  interviewer_id INT,
  status ENUM('scheduled', 'active', 'completed', 'cancelled') DEFAULT 'scheduled',
  created_by INT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (drive_id) REFERENCES tbl_cp_recruitment_drive(drive_id),
  FOREIGN KEY (interviewer_id) REFERENCES users(id),
  FOREIGN KEY (created_by) REFERENCES users(id),
  KEY idx_drive_id (drive_id),
  KEY idx_round_type (round_type),
  KEY idx_scheduled_date (scheduled_date),
  KEY idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Student registration for sessions
CREATE TABLE IF NOT EXISTS tbl_cp_m2m_student_exam_session (
  m2m_id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  session_id INT NOT NULL,
  registration_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  status ENUM('registered', 'participated', 'absent', 'disqualified') DEFAULT 'registered',
  FOREIGN KEY (student_id) REFERENCES tbl_cp_student(student_id),
  FOREIGN KEY (session_id) REFERENCES tbl_cp_exam_session(session_id),
  UNIQUE KEY unique_student_session (student_id, session_id),
  KEY idx_student_id (student_id),
  KEY idx_session_id (session_id),
  KEY idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS tbl_cp_m2m_student_interview_session (
  m2m_id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  session_id INT NOT NULL,
  registration_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  scheduled_time DATETIME,
  status ENUM('registered', 'invited', 'participated', 'no-show', 'hold') DEFAULT 'registered',
  FOREIGN KEY (student_id) REFERENCES tbl_cp_student(student_id),
  FOREIGN KEY (session_id) REFERENCES tbl_cp_interview_session(session_id),
  UNIQUE KEY unique_student_interview (student_id, session_id),
  KEY idx_student_id (student_id),
  KEY idx_session_id (session_id),
  KEY idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 4. APPLICATIONS & JOB TRACKING
-- ============================================================================

CREATE TABLE IF NOT EXISTS tbl_cp_application (
  application_id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  jd_id INT NOT NULL,
  company_id INT NOT NULL,
  drive_id INT NOT NULL,
  applied_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  status ENUM('applied', 'shortlisted', 'rejected', 'selected', 'offer-extended', 'offer-accepted', 'offer-rejected', 'placed') DEFAULT 'applied',
  current_round_number INT DEFAULT 0,
  total_rounds INT DEFAULT 0,
  last_round_date DATETIME,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES tbl_cp_student(student_id),
  FOREIGN KEY (jd_id) REFERENCES tbl_cp_job_description(jd_id),
  FOREIGN KEY (company_id) REFERENCES tbl_cp_mcompany(company_id),
  FOREIGN KEY (drive_id) REFERENCES tbl_cp_recruitment_drive(drive_id),
  UNIQUE KEY unique_student_jd (student_id, jd_id),
  KEY idx_student_id (student_id),
  KEY idx_jd_id (jd_id),
  KEY idx_company_id (company_id),
  KEY idx_status (status),
  KEY idx_applied_date (applied_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS tbl_cp_application_status_history (
  history_id INT PRIMARY KEY AUTO_INCREMENT,
  application_id INT NOT NULL,
  from_status VARCHAR(50),
  to_status VARCHAR(50) NOT NULL,
  round_name VARCHAR(100),
  round_score DECIMAL(5, 2),
  round_total DECIMAL(5, 2),
  evaluation_notes TEXT,
  changed_by INT,
  changed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (application_id) REFERENCES tbl_cp_application(application_id),
  FOREIGN KEY (changed_by) REFERENCES users(id),
  KEY idx_application_id (application_id),
  KEY idx_to_status (to_status),
  KEY idx_changed_at (changed_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 5. MARKS & ASSESSMENT (Exams & Interviews)
-- ============================================================================

CREATE TABLE IF NOT EXISTS tbl_cp_msubjects (
  subject_id INT PRIMARY KEY AUTO_INCREMENT,
  subject_name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  KEY idx_subject_name (subject_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS tbl_cp_mquestions (
  question_id INT PRIMARY KEY AUTO_INCREMENT,
  subject_id INT,
  session_id INT,
  question_text TEXT NOT NULL,
  question_type ENUM('mcq', 'coding', 'subjective', 'true-false', 'fill-blank') DEFAULT 'mcq',
  difficulty ENUM('easy', 'medium', 'hard', 'expert') DEFAULT 'medium',
  marks INT DEFAULT 1,
  negative_marks INT DEFAULT 0,
  explanation TEXT,
  created_by INT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (subject_id) REFERENCES tbl_cp_msubjects(subject_id),
  FOREIGN KEY (session_id) REFERENCES tbl_cp_exam_session(session_id),
  FOREIGN KEY (created_by) REFERENCES users(id),
  KEY idx_subject_id (subject_id),
  KEY idx_session_id (session_id),
  KEY idx_question_type (question_type),
  KEY idx_difficulty (difficulty)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS tbl_cp_m2m_question_options (
  option_id INT PRIMARY KEY AUTO_INCREMENT,
  question_id INT NOT NULL,
  option_text TEXT NOT NULL,
  is_correct BOOLEAN DEFAULT 0,
  order_index INT DEFAULT 0,
  FOREIGN KEY (question_id) REFERENCES tbl_cp_mquestions(question_id) ON DELETE CASCADE,
  KEY idx_question_id (question_id),
  KEY idx_is_correct (is_correct)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS tbl_cp_m2m_exam_question_response (
  response_id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  session_id INT NOT NULL,
  question_id INT NOT NULL,
  selected_option_id INT,
  submitted_answer TEXT,
  time_spent_seconds INT,
  is_correct BOOLEAN,
  marks_obtained DECIMAL(5, 2),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES tbl_cp_student(student_id),
  FOREIGN KEY (session_id) REFERENCES tbl_cp_exam_session(session_id),
  FOREIGN KEY (question_id) REFERENCES tbl_cp_mquestions(question_id),
  FOREIGN KEY (selected_option_id) REFERENCES tbl_cp_m2m_question_options(option_id),
  UNIQUE KEY unique_response (student_id, session_id, question_id),
  KEY idx_student_id (student_id),
  KEY idx_session_id (session_id),
  KEY idx_is_correct (is_correct)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS tbl_cp_exam_result (
  result_id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  session_id INT NOT NULL,
  application_id INT,
  total_questions INT,
  attempted_questions INT,
  correct_answers INT,
  marks_obtained DECIMAL(5, 2),
  total_marks INT,
  percentage DECIMAL(5, 2),
  status ENUM('pass', 'fail', 'pending-review') DEFAULT 'pending-review',
  rank INT COMMENT 'Rank among all takers of this session',
  evaluated_by INT,
  evaluation_date DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES tbl_cp_student(student_id),
  FOREIGN KEY (session_id) REFERENCES tbl_cp_exam_session(exam_session_id),
  FOREIGN KEY (application_id) REFERENCES tbl_cp_application(application_id),
  FOREIGN KEY (evaluated_by) REFERENCES users(id),
  UNIQUE KEY unique_exam_result (student_id, session_id),
  KEY idx_student_id (student_id),
  KEY idx_session_id (session_id),
  KEY idx_status (status),
  KEY idx_rank (rank)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Interview evaluations
CREATE TABLE IF NOT EXISTS tbl_cp_interview_evaluation (
  evaluation_id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  session_id INT NOT NULL,
  application_id INT,
  interviewer_id INT NOT NULL,
  technical_score DECIMAL(5, 2),
  communication_score DECIMAL(5, 2),
  attitude_score DECIMAL(5, 2),
  overall_score DECIMAL(5, 2),
  total_score INT DEFAULT 100,
  result ENUM('pass', 'fail', 'hold', 'pending') DEFAULT 'pending',
  feedback TEXT,
  evaluation_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES tbl_cp_student(student_id),
  FOREIGN KEY (session_id) REFERENCES tbl_cp_interview_session(session_id),
  FOREIGN KEY (application_id) REFERENCES tbl_cp_application(application_id),
  FOREIGN KEY (interviewer_id) REFERENCES users(id),
  UNIQUE KEY unique_interview_eval (student_id, session_id),
  KEY idx_student_id (student_id),
  KEY idx_session_id (session_id),
  KEY idx_result (result)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 6. PLACEMENTS & OFFERS
-- ============================================================================

CREATE TABLE IF NOT EXISTS tbl_cp_round_result (
  result_id INT PRIMARY KEY AUTO_INCREMENT,
  application_id INT NOT NULL,
  round_name VARCHAR(100),
  round_number INT,
  round_type ENUM('exam', 'interview', 'group-discussion') DEFAULT 'exam',
  round_score DECIMAL(5, 2),
  round_total DECIMAL(5, 2),
  evaluator_id INT,
  result ENUM('pass', 'fail', 'hold', 'pending') DEFAULT 'pending',
  comments TEXT,
  evaluation_date DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (application_id) REFERENCES tbl_cp_application(application_id),
  FOREIGN KEY (evaluator_id) REFERENCES users(id),
  KEY idx_application_id (application_id),
  KEY idx_result (result)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS tbl_cp_offers (
  offer_id INT PRIMARY KEY AUTO_INCREMENT,
  application_id INT NOT NULL,
  student_id INT NOT NULL,
  company_id INT NOT NULL,
  jd_id INT,
  offered_salary DECIMAL(12, 2),
  currency VARCHAR(10) DEFAULT 'INR',
  offer_ctc DECIMAL(12, 2) COMMENT 'Cost to Company',
  offer_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  acceptance_date DATETIME,
  rejection_date DATETIME,
  status ENUM('sent', 'accepted', 'rejected', 'expired', 'revoked') DEFAULT 'sent',
  offer_letter_url VARCHAR(500),
  acceptance_letter_url VARCHAR(500),
  expiry_date DATE,
  created_by INT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (application_id) REFERENCES tbl_cp_application(application_id),
  FOREIGN KEY (student_id) REFERENCES tbl_cp_student(student_id),
  FOREIGN KEY (company_id) REFERENCES tbl_cp_mcompany(company_id),
  FOREIGN KEY (jd_id) REFERENCES tbl_cp_job_description(jd_id),
  FOREIGN KEY (created_by) REFERENCES users(id),
  UNIQUE KEY unique_offer (application_id),
  KEY idx_student_id (student_id),
  KEY idx_company_id (company_id),
  KEY idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS tbl_cp_placements (
  placement_id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  company_id INT NOT NULL,
  offer_id INT NOT NULL,
  application_id INT NOT NULL,
  offered_salary DECIMAL(12, 2),
  ctc DECIMAL(12, 2),
  job_title VARCHAR(100),
  location VARCHAR(255),
  placement_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  joining_date DATE,
  status ENUM('offer-letter-sent', 'accepted', 'joined', 'completed') DEFAULT 'offer-letter-sent',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES tbl_cp_student(student_id),
  FOREIGN KEY (company_id) REFERENCES tbl_cp_mcompany(company_id),
  FOREIGN KEY (offer_id) REFERENCES tbl_cp_offers(offer_id),
  FOREIGN KEY (application_id) REFERENCES tbl_cp_application(application_id),
  UNIQUE KEY unique_student_placement (student_id, company_id),
  KEY idx_student_id (student_id),
  KEY idx_company_id (company_id),
  KEY idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 7. NOTIFICATIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS tbl_cp_notifications (
  notification_id INT PRIMARY KEY AUTO_INCREMENT,
  recipient_id INT NOT NULL,
  notification_type ENUM('application-status', 'interview-schedule', 'exam-result', 'offer-received', 'placement-update', 'general') DEFAULT 'general',
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  related_entity_type VARCHAR(50) COMMENT 'application, interview, offer, etc.',
  related_entity_id INT,
  is_read BOOLEAN DEFAULT 0,
  read_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (recipient_id) REFERENCES users(id),
  KEY idx_recipient_id (recipient_id),
  KEY idx_is_read (is_read),
  KEY idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 8. AUDIT LOG
-- ============================================================================

CREATE TABLE IF NOT EXISTS tbl_cp_audit_log (
  log_id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  action VARCHAR(100),
  entity_type VARCHAR(50),
  entity_id INT,
  old_values JSON,
  new_values JSON,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  KEY idx_user_id (user_id),
  KEY idx_entity_type (entity_type),
  KEY idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX idx_application_company_status ON tbl_cp_application(company_id, status);
CREATE INDEX idx_application_drive_status ON tbl_cp_application(drive_id, status);
CREATE INDEX idx_exam_result_percentage ON tbl_cp_exam_result(percentage, session_id);
CREATE INDEX idx_placement_status_date ON tbl_cp_placements(status, placement_date);
CREATE INDEX idx_offer_status_date ON tbl_cp_offers(status, offer_date);

COMMIT;
