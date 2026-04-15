-- ============================================================================
-- ARTISET CAMPUS PLATFORM - COMPLETE DATABASE SCHEMA
-- ============================================================================
-- Order: Core Auth -> RBAC -> Student Profile -> Recruitment -> Exam -> Placements
-- ============================================================================

SET FOREIGN_KEY_CHECKS = 0;

-- 1. CORE AUTHENTICATION TABLES
-- ============================================================================

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE,
  phone VARCHAR(20) UNIQUE,
  password VARCHAR(255),
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  registration_draft JSON NULL,
  registration_step VARCHAR(50) DEFAULT 'basic',
  is_registration_complete BOOLEAN DEFAULT FALSE,
  role ENUM('student', 'tpo', 'recruiter', 'admin') DEFAULT 'student',
  is_email_verified BOOLEAN DEFAULT FALSE,
  is_phone_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS otp_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  identifier VARCHAR(255),
  type ENUM('email','phone'),
  otp_code VARCHAR(255),
  expires_at DATETIME,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. RBAC (Role-Based Access Control)
-- ============================================================================

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
(1, 'student', 'Student user - can apply for jobs, take exams, view placements', JSON_OBJECT('applications', JSON_ARRAY('create', 'read', 'list'), 'exams', JSON_ARRAY('read', 'list', 'submit'), 'placements', JSON_ARRAY('read', 'list'), 'profile', JSON_ARRAY('read', 'update'))),
(2, 'tpo', 'Training & Placement Officer - manage drives, sessions, placements', JSON_OBJECT('drives', JSON_ARRAY('create', 'read', 'update', 'list'), 'sessions', JSON_ARRAY('create', 'read', 'update', 'list'), 'students', JSON_ARRAY('read', 'list'), 'placements', JSON_ARRAY('read', 'list'), 'companies', JSON_ARRAY('read', 'list'))),
(3, 'recruiter', 'Recruiter - post jobs, review applications, conduct interviews', JSON_OBJECT('jobs', JSON_ARRAY('create', 'read', 'update', 'list'), 'applications', JSON_ARRAY('read', 'list', 'update'), 'interviews', JSON_ARRAY('create', 'read', 'update', 'list'), 'offers', JSON_ARRAY('create', 'read', 'update', 'list'))),
(4, 'admin', 'Admin - manage users, roles, system settings, all data', JSON_OBJECT('users', JSON_ARRAY('create', 'read', 'update', 'delete', 'list'), 'roles', JSON_ARRAY('read', 'list'), 'system', JSON_ARRAY('read', 'update'), 'all', JSON_ARRAY('*')));

-- 3. STUDENT PROFILE SYSTEM
-- ============================================================================

CREATE TABLE IF NOT EXISTS tbl_cp_msalutation (
  salutation_id INT PRIMARY KEY AUTO_INCREMENT,
  salutation_name VARCHAR(10) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT IGNORE INTO tbl_cp_msalutation (salutation_name) VALUES ('Mr.'), ('Ms.'), ('Mrs.'), ('Dr.');

CREATE TABLE IF NOT EXISTS tbl_cp_student (
  row_id INT NOT NULL AUTO_INCREMENT,
  student_id INT DEFAULT NULL,
  salutation_id INT DEFAULT NULL,
  first_name VARCHAR(100) DEFAULT NULL,
  middle_name VARCHAR(100) DEFAULT '',
  last_name VARCHAR(100) DEFAULT NULL,
  email VARCHAR(255) DEFAULT NULL,
  contact_number VARCHAR(20) DEFAULT NULL,
  date_of_birth DATE DEFAULT NULL,
  is_active TINYINT(1) DEFAULT '1',
  status VARCHAR(20) DEFAULT 'Active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (row_id),
  UNIQUE KEY (student_id),
  UNIQUE KEY (email),
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (salutation_id) REFERENCES tbl_cp_msalutation(salutation_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. COMPANY & RECRUITMENT DRIVE
-- ============================================================================

CREATE TABLE IF NOT EXISTS tbl_cp_mcompany (
  company_id INT PRIMARY KEY AUTO_INCREMENT,
  company_name VARCHAR(255) NOT NULL,
  headquarters VARCHAR(255),
  industry VARCHAR(100),
  website VARCHAR(255),
  description TEXT,
  spoc_name VARCHAR(100),
  spoc_email VARCHAR(100),
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS tbl_cp_recruitment_drive (
  drive_id INT PRIMARY KEY AUTO_INCREMENT,
  company_id INT NOT NULL,
  drive_name VARCHAR(255) NOT NULL,
  drive_start_date DATE NOT NULL,
  drive_end_date DATE NOT NULL,
  status ENUM('upcoming', 'ongoing', 'completed', 'cancelled') DEFAULT 'upcoming',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES tbl_cp_mcompany(company_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS tbl_cp_job_description (
  jd_id INT PRIMARY KEY AUTO_INCREMENT,
  drive_id INT NOT NULL,
  company_id INT NOT NULL,
  position_title VARCHAR(100) NOT NULL,
  salary_min DECIMAL(12, 2),
  salary_max DECIMAL(12, 2),
  job_type ENUM('full-time', 'internship', 'contract') DEFAULT 'full-time',
  skills_required JSON,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (drive_id) REFERENCES tbl_cp_recruitment_drive(drive_id),
  FOREIGN KEY (company_id) REFERENCES tbl_cp_mcompany(company_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS tbl_cp_recruitment_drive_round (
  round_id INT PRIMARY KEY AUTO_INCREMENT,
  drive_id INT NOT NULL,
  round_number INT NOT NULL,
  round_name VARCHAR(255) NOT NULL,
  round_type ENUM('aptitude', 'technical_quiz', 'coding_test', 'technical_interview', 'hr_interview') NOT NULL,
  config_json JSON,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (drive_id) REFERENCES tbl_cp_recruitment_drive(drive_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. ASSESSMENT SYSTEM (Subjects & Questions)
-- ============================================================================

CREATE TABLE IF NOT EXISTS tbl_cp_msubjects (
  subject_id INT PRIMARY KEY AUTO_INCREMENT,
  subject_name VARCHAR(100) NOT NULL UNIQUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO tbl_cp_msubjects (subject_name) VALUES ('DSA'), ('DBMS'), ('OOP'), ('Networking'), ('OS'), ('Programming');

CREATE TABLE IF NOT EXISTS tbl_cp_mquestions (
  question_id INT PRIMARY KEY AUTO_INCREMENT,
  subject_id INT,
  question_text TEXT NOT NULL,
  question_type ENUM('mcq', 'coding', 'subjective') DEFAULT 'mcq',
  difficulty ENUM('easy', 'medium', 'hard') DEFAULT 'medium',
  marks INT DEFAULT 1,
  FOREIGN KEY (subject_id) REFERENCES tbl_cp_msubjects(subject_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS tbl_cp_m2m_question_options (
  option_id INT PRIMARY KEY AUTO_INCREMENT,
  question_id INT NOT NULL,
  option_text TEXT NOT NULL,
  is_correct BOOLEAN DEFAULT 0,
  FOREIGN KEY (question_id) REFERENCES tbl_cp_mquestions(question_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. APPLICATIONS & RESULTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS tbl_cp_application (
  application_id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  jd_id INT NOT NULL,
  company_id INT NOT NULL,
  drive_id INT NOT NULL,
  applied_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  status ENUM('applied', 'shortlisted', 'rejected', 'selected', 'offer-extended', 'offer-accepted', 'offer-rejected', 'placed') DEFAULT 'applied',
  FOREIGN KEY (student_id) REFERENCES tbl_cp_student(student_id),
  FOREIGN KEY (jd_id) REFERENCES tbl_cp_job_description(jd_id),
  FOREIGN KEY (company_id) REFERENCES tbl_cp_mcompany(company_id),
  FOREIGN KEY (drive_id) REFERENCES tbl_cp_recruitment_drive(drive_id),
  UNIQUE KEY unique_student_jd (student_id, jd_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS tbl_cp_exam_session (
  session_id INT PRIMARY KEY AUTO_INCREMENT,
  drive_id INT,
  session_name VARCHAR(100) NOT NULL,
  scheduled_date DATETIME NOT NULL,
  status ENUM('scheduled', 'active', 'completed', 'cancelled') DEFAULT 'scheduled',
  FOREIGN KEY (drive_id) REFERENCES tbl_cp_recruitment_drive(drive_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS tbl_cp_exam_result (
  result_id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  session_id INT NOT NULL,
  marks_obtained DECIMAL(5, 2),
  total_marks INT,
  status ENUM('pass', 'fail', 'pending-review') DEFAULT 'pending-review',
  FOREIGN KEY (student_id) REFERENCES tbl_cp_student(student_id),
  FOREIGN KEY (session_id) REFERENCES tbl_cp_exam_session(session_id),
  UNIQUE KEY (student_id, session_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. PLACEMENTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS tbl_cp_placements (
  placement_id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  company_id INT NOT NULL,
  application_id INT NOT NULL,
  job_title VARCHAR(100),
  salary DECIMAL(12, 2),
  placement_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES tbl_cp_student(student_id),
  FOREIGN KEY (company_id) REFERENCES tbl_cp_mcompany(company_id),
  FOREIGN KEY (application_id) REFERENCES tbl_cp_application(application_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
