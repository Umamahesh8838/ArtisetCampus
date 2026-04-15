-- ============================================================================
-- ARTISET CAMPUS PLATFORM - FINAL COMPLETE DATABASE SCHEMA
-- ============================================================================
-- Merged from: Schema 1 (Ultimate Master) + Schema 2 (db.sql)
-- Total tables: 52
-- All columns, constraints, indexes from both schemas included.
-- Tables are ordered so every FK reference is defined before it is used.
-- ============================================================================

CREATE DATABASE IF NOT EXISTS campus6;
USE campus6;

SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================================
-- SECTION 1 : CORE AUTH & RBAC
-- Tables: users, otp_requests, tbl_cp_mroles
-- ============================================================================

CREATE TABLE IF NOT EXISTS users (
  id                      INT          AUTO_INCREMENT PRIMARY KEY,
  email                   VARCHAR(255) UNIQUE,
  phone                   VARCHAR(20)  UNIQUE,
  password                VARCHAR(255),
  first_name              VARCHAR(100),
  last_name               VARCHAR(100),
  registration_draft      JSON         NULL,
  registration_step       VARCHAR(50)  DEFAULT 'basic',
  is_registration_complete BOOLEAN     DEFAULT FALSE,
  role                    ENUM('student','tpo','recruiter','admin') DEFAULT 'student',
  is_email_verified       BOOLEAN      DEFAULT FALSE,
  is_phone_verified       BOOLEAN      DEFAULT FALSE,
  is_active               BOOLEAN      DEFAULT TRUE,
  created_at              DATETIME     DEFAULT CURRENT_TIMESTAMP,
  updated_at              DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS otp_requests (
  id          INT          AUTO_INCREMENT PRIMARY KEY,
  identifier  VARCHAR(255),
  type        ENUM('email','phone'),
  otp_code    VARCHAR(255),
  expires_at  DATETIME,
  is_verified BOOLEAN      DEFAULT FALSE,
  created_at  DATETIME     DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS tbl_cp_mroles (
  role_id     INT          PRIMARY KEY,
  role_name   VARCHAR(50)  NOT NULL UNIQUE,
  description VARCHAR(255),
  permissions JSON,
  created_at  DATETIME     DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO tbl_cp_mroles (role_id, role_name, description, permissions) VALUES
(1, 'student',   'Student user',       JSON_OBJECT('all', JSON_ARRAY('read'))),
(2, 'tpo',       'Placement Officer',  JSON_OBJECT('all', JSON_ARRAY('manage'))),
(3, 'recruiter', 'Company Recruiter',  JSON_OBJECT('all', JSON_ARRAY('manage'))),
(4, 'admin',     'System Admin',       JSON_OBJECT('all', JSON_ARRAY('*')));

-- ============================================================================
-- SECTION 2 : MASTER / LOOKUP TABLES
-- Tables: tbl_cp_msalutation, tbl_cp_mlanguages, tbl_cp_minterests,
--         tbl_cp_mcourses, tbl_cp_mcolleges, tbl_cp_mcertifications,
--         tbl_cp_mskills, tbl_cp_mmodule, tbl_cp_mdifficulty,
--         tbl_cp_mround_result, tbl_cp_mattendance, tbl_cp_minterviewer
-- ============================================================================

CREATE TABLE IF NOT EXISTS tbl_cp_msalutation (
  row_id        INT          AUTO_INCREMENT PRIMARY KEY,
  salutation_id INT          NOT NULL UNIQUE,
  value         VARCHAR(50)  NOT NULL UNIQUE,
  description   VARCHAR(255) DEFAULT 'No description',
  created_at    DATETIME     DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO tbl_cp_msalutation (salutation_id, value) VALUES
(1,'Mr.'),(2,'Ms.'),(3,'Mrs.'),(4,'Dr.');

-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS tbl_cp_mlanguages (
  row_id        INT          AUTO_INCREMENT PRIMARY KEY,
  language_id   INT          NOT NULL UNIQUE,
  language_code VARCHAR(20)  NOT NULL UNIQUE,
  language_name VARCHAR(100) NOT NULL UNIQUE,
  created_at    DATETIME     DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS tbl_cp_minterests (
  row_id      INT          AUTO_INCREMENT PRIMARY KEY,
  interest_id INT          NOT NULL UNIQUE,
  name        VARCHAR(150) NOT NULL UNIQUE,
  created_at  DATETIME     DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS tbl_cp_mcourses (
  row_id              INT          AUTO_INCREMENT PRIMARY KEY,
  course_id           INT          NOT NULL UNIQUE,
  course_name         VARCHAR(150) NOT NULL,
  course_code         VARCHAR(50)  NOT NULL DEFAULT 'UNKNOWN',
  specialization_name VARCHAR(150) NOT NULL DEFAULT 'General',
  specialization_code VARCHAR(50)  NOT NULL DEFAULT 'GEN',
  created_at          DATETIME     DEFAULT CURRENT_TIMESTAMP,
  updated_at          DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE (course_code, specialization_code),
  UNIQUE (course_name, specialization_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS tbl_cp_mcolleges (
  row_id                    INT          AUTO_INCREMENT PRIMARY KEY,
  college_id                INT          NOT NULL UNIQUE,
  college_name              VARCHAR(255) NOT NULL UNIQUE,
  spoc_name                 VARCHAR(150) DEFAULT 'Not Assigned',
  spoc_phone                VARCHAR(20)  DEFAULT '0000000000',
  spoc_email                VARCHAR(255) DEFAULT 'noreply@college.com',
  tpo_name                  VARCHAR(150) DEFAULT 'Not Assigned',
  tpo_phone                 VARCHAR(20)  DEFAULT '0000000000',
  tpo_email                 VARCHAR(255) DEFAULT 'noreply@college.com',
  student_coordinator_name  VARCHAR(150) DEFAULT 'Not Assigned',
  student_coordinator_phone VARCHAR(20)  DEFAULT '0000000000',
  student_coordinator_email VARCHAR(255) DEFAULT 'noreply@college.com',
  reference_details         TEXT,
  priority                  INT          NOT NULL DEFAULT 5,
  CONSTRAINT chk_college_priority CHECK (priority BETWEEN 1 AND 10),
  created_at                DATETIME     DEFAULT CURRENT_TIMESTAMP,
  updated_at                DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS tbl_cp_mcertifications (
  row_id               INT          AUTO_INCREMENT PRIMARY KEY,
  certification_id     INT          NOT NULL UNIQUE,
  certification_name   VARCHAR(255) NOT NULL,
  certification_code   VARCHAR(100) NOT NULL UNIQUE,
  issuing_organization VARCHAR(255) NOT NULL,
  certification_type   VARCHAR(100) DEFAULT 'General',
  mode                 VARCHAR(50)  DEFAULT 'Online',
  validity_period_value INT         DEFAULT 0,
  validity_period_unit VARCHAR(20)  DEFAULT 'Years',
  is_lifetime          BOOLEAN      NULL,
  created_at           DATETIME     DEFAULT CURRENT_TIMESTAMP,
  updated_at           DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE (certification_name, issuing_organization)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- tbl_cp_mskills depends on tbl_cp_mlanguages

CREATE TABLE IF NOT EXISTS tbl_cp_mskills (
  row_id      INT          AUTO_INCREMENT PRIMARY KEY,
  skill_id    INT          NOT NULL UNIQUE,
  name        VARCHAR(100) NOT NULL UNIQUE,
  description VARCHAR(255) DEFAULT 'No description',
  language_id INT          NOT NULL,
  version     VARCHAR(50)  DEFAULT 'N/A',
  complexity  VARCHAR(50)  DEFAULT 'Beginner',
  status      VARCHAR(30)  DEFAULT 'Active',
  created_at  DATETIME     DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (language_id) REFERENCES tbl_cp_mlanguages(language_id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

-- has_questions = FALSE for modules scored manually (e.g. Communication, Stability)
CREATE TABLE IF NOT EXISTS tbl_cp_mmodule (
  row_id        INT          AUTO_INCREMENT PRIMARY KEY,
  module_id     INT          NOT NULL UNIQUE,
  module_name   VARCHAR(150) NOT NULL UNIQUE,
  module_code   VARCHAR(50)  NOT NULL UNIQUE,
  description   VARCHAR(255) DEFAULT 'No description',
  has_questions BOOLEAN      NULL,
  created_at    DATETIME     DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS tbl_cp_mdifficulty (
  row_id        INT          AUTO_INCREMENT PRIMARY KEY,
  difficulty_id INT          NOT NULL UNIQUE,
  level_code    VARCHAR(20)  NOT NULL UNIQUE,
  level_label   VARCHAR(50)  NOT NULL,
  score_weight  DECIMAL(4,2) NOT NULL DEFAULT 1.00,
  created_at    DATETIME     DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

-- Possible values: Pass, Fail, Selected, Not Selected, Absent, Cheating
CREATE TABLE IF NOT EXISTS tbl_cp_mround_result (
  row_id     INT          AUTO_INCREMENT PRIMARY KEY,
  result_id  INT          NOT NULL UNIQUE,
  label      VARCHAR(100) NOT NULL UNIQUE,
  created_at DATETIME     DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

-- Possible codes: P=Present, A=Absent, R=Rejected, C=Cheating
CREATE TABLE IF NOT EXISTS tbl_cp_mattendance (
  row_id        INT         AUTO_INCREMENT PRIMARY KEY,
  attendance_id INT         NOT NULL UNIQUE,
  code          VARCHAR(5)  NOT NULL UNIQUE,
  label         VARCHAR(50) NOT NULL,
  created_at    DATETIME    DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

-- Covers both internal mentors and external/client interviewers
CREATE TABLE IF NOT EXISTS tbl_cp_minterviewer (
  row_id         INT          AUTO_INCREMENT PRIMARY KEY,
  interviewer_id INT          NOT NULL UNIQUE,
  name           VARCHAR(150) NOT NULL,
  email          VARCHAR(255) DEFAULT 'noreply@interviewer.com',
  phone          VARCHAR(20)  DEFAULT '0000000000',
  is_internal    BOOLEAN      NULL,
  company        VARCHAR(255) DEFAULT 'Campus4',
  designation    VARCHAR(150) DEFAULT 'Interviewer',
  is_active      BOOLEAN      NULL,
  created_at     DATETIME     DEFAULT CURRENT_TIMESTAMP,
  updated_at     DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- SECTION 3 : GEOGRAPHY MASTER
-- Tables: tbl_cp_mcountries, tbl_cp_mstates, tbl_cp_mcities, tbl_cp_mpincodes
-- ============================================================================

CREATE TABLE IF NOT EXISTS tbl_cp_mcountries (
  row_id       INT          AUTO_INCREMENT PRIMARY KEY,
  country_id   INT          NOT NULL UNIQUE,
  country_name VARCHAR(100) NOT NULL UNIQUE,
  country_code VARCHAR(5)   NULL DEFAULT NULL,
  created_at   DATETIME     DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS tbl_cp_mstates (
  row_id     INT          AUTO_INCREMENT PRIMARY KEY,
  state_id   INT          NOT NULL UNIQUE,
  state_name VARCHAR(100) NOT NULL,
  state_code VARCHAR(10)  DEFAULT 'XX',
  country_id INT          NOT NULL,
  created_at DATETIME     DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE (state_name, country_id),
  FOREIGN KEY (country_id) REFERENCES tbl_cp_mcountries(country_id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS tbl_cp_mcities (
  row_id     INT          AUTO_INCREMENT PRIMARY KEY,
  city_id    INT          NOT NULL UNIQUE,
  city_name  VARCHAR(100) NOT NULL,
  state_id   INT          NOT NULL,
  created_at DATETIME     DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE (city_name, state_id),
  FOREIGN KEY (state_id) REFERENCES tbl_cp_mstates(state_id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS tbl_cp_mpincodes (
  row_id     INT          AUTO_INCREMENT PRIMARY KEY,
  pincode_id INT          NOT NULL UNIQUE,
  pincode    VARCHAR(20)  NOT NULL UNIQUE,
  city_id    INT          NOT NULL,
  area_name  VARCHAR(150) DEFAULT 'Unknown Area',
  created_at DATETIME     DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (city_id) REFERENCES tbl_cp_mcities(city_id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- SECTION 4 : STUDENT CORE
-- Tables: tbl_cp_student
-- ============================================================================

CREATE TABLE IF NOT EXISTS tbl_cp_student (
  row_id             INT          AUTO_INCREMENT PRIMARY KEY,
  student_id         INT          NOT NULL UNIQUE,
  salutation_id      INT,
  first_name         VARCHAR(100) NOT NULL,
  middle_name        VARCHAR(100) DEFAULT '',
  last_name          VARCHAR(100) DEFAULT '',
  email              VARCHAR(255) NOT NULL UNIQUE,
  alt_email          VARCHAR(255) DEFAULT '',
  contact_number     VARCHAR(20)  UNIQUE,
  alt_contact_number VARCHAR(20)  DEFAULT '0000000000',
  linkedin_url       VARCHAR(255) DEFAULT '',
  github_url         VARCHAR(255) DEFAULT '',
  portfolio_url      VARCHAR(255) DEFAULT '',
  resume_url         VARCHAR(500) DEFAULT '',
  profile_photo_url  VARCHAR(500) NOT NULL DEFAULT 'default_profile.png',
  date_of_birth      DATE         NOT NULL DEFAULT '1900-01-01',
  current_city       VARCHAR(100) DEFAULT 'Not Specified',
  gender             VARCHAR(20)  DEFAULT 'Not Specified',
  user_type          VARCHAR(100) DEFAULT 'Student',
  is_active          BOOLEAN      NULL,
  status             VARCHAR(30)  NOT NULL DEFAULT 'Active',
  created_at         DATETIME     DEFAULT CURRENT_TIMESTAMP,
  updated_at         DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id)    REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (salutation_id) REFERENCES tbl_cp_msalutation(salutation_id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- SECTION 5 : STUDENT EDUCATION
-- Tables: tbl_cp_student_school, tbl_cp_student_education,
--         tbl_cp_msemester, tbl_cp_msubjects,
--         tbl_cp_college_sem_subject, tbl_cp_student_subject_marks
-- ============================================================================

CREATE TABLE IF NOT EXISTS tbl_cp_student_school (
  row_id       INT          AUTO_INCREMENT PRIMARY KEY,
  school_id    INT          NOT NULL UNIQUE,
  student_id   INT          NOT NULL,
  standard     VARCHAR(50)  NOT NULL,
  board        VARCHAR(100) DEFAULT 'Not Specified',
  school_name  VARCHAR(255) DEFAULT 'Not Specified',
  percentage   DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  passing_year INT          DEFAULT 0,
  created_at   DATETIME     DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES tbl_cp_student(student_id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS tbl_cp_student_education (
  row_id     INT          AUTO_INCREMENT PRIMARY KEY,
  edu_id     INT          NOT NULL UNIQUE,
  student_id INT          NOT NULL,
  college_id INT          NOT NULL,
  course_id  INT          NOT NULL,
  start_year INT          DEFAULT 0,
  end_year   INT          DEFAULT 0,
  cgpa       DECIMAL(4,2) DEFAULT 0.00,
  percentage DECIMAL(5,2) DEFAULT 0.00,
  created_at DATETIME     DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES tbl_cp_student(student_id)  ON DELETE RESTRICT,
  FOREIGN KEY (college_id) REFERENCES tbl_cp_mcolleges(college_id) ON DELETE RESTRICT,
  FOREIGN KEY (course_id)  REFERENCES tbl_cp_mcourses(course_id)   ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS tbl_cp_msemester (
  row_id          INT         AUTO_INCREMENT PRIMARY KEY,
  semester_id     INT         NOT NULL UNIQUE,
  course_id       INT         NOT NULL,
  semester_number INT         NOT NULL,
  semester_name   VARCHAR(50) DEFAULT 'Semester',
  created_at      DATETIME    DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE (course_id, semester_number),
  FOREIGN KEY (course_id) REFERENCES tbl_cp_mcourses(course_id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS tbl_cp_msubjects (
  row_id       INT          AUTO_INCREMENT PRIMARY KEY,
  subject_id   INT          NOT NULL UNIQUE,
  subject_code VARCHAR(50)  NOT NULL UNIQUE,
  subject_name VARCHAR(255) NOT NULL,
  created_at   DATETIME     DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS tbl_cp_college_sem_subject (
  row_id                 INT          AUTO_INCREMENT PRIMARY KEY,
  college_sem_subject_id INT          NOT NULL UNIQUE,
  college_id             INT          NOT NULL,
  semester_id            INT          NOT NULL,
  subject_id             INT          NOT NULL,
  credits                DECIMAL(3,1) NOT NULL DEFAULT 3.0,
  created_at             DATETIME     DEFAULT CURRENT_TIMESTAMP,
  updated_at             DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE (college_id, semester_id, subject_id),
  FOREIGN KEY (college_id)  REFERENCES tbl_cp_mcolleges(college_id)  ON DELETE RESTRICT,
  FOREIGN KEY (semester_id) REFERENCES tbl_cp_msemester(semester_id) ON DELETE RESTRICT,
  FOREIGN KEY (subject_id)  REFERENCES tbl_cp_msubjects(subject_id)  ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

-- evaluation_type: 'internal' or 'external'
CREATE TABLE IF NOT EXISTS tbl_cp_student_subject_marks (
  row_id                 INT          AUTO_INCREMENT PRIMARY KEY,
  student_id             INT          NOT NULL,
  college_sem_subject_id INT          NOT NULL,
  evaluation_type        VARCHAR(20)  NOT NULL DEFAULT 'internal',
  marks_obtained         DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  created_at             DATETIME     DEFAULT CURRENT_TIMESTAMP,
  updated_at             DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE (student_id, college_sem_subject_id, evaluation_type),
  FOREIGN KEY (student_id)             REFERENCES tbl_cp_student(student_id)                          ON DELETE RESTRICT,
  FOREIGN KEY (college_sem_subject_id) REFERENCES tbl_cp_college_sem_subject(college_sem_subject_id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- SECTION 6 : STUDENT WORK EXPERIENCE & PROJECTS
-- Tables: tbl_cp_student_workexp, tbl_cp_studentprojects
-- ============================================================================

CREATE TABLE IF NOT EXISTS tbl_cp_student_workexp (
  row_id           INT          AUTO_INCREMENT PRIMARY KEY,
  workexp_id       INT          NOT NULL UNIQUE,
  student_id       INT          NOT NULL,
  company_name     VARCHAR(255) NOT NULL,
  company_location VARCHAR(150) DEFAULT 'Not Specified',
  designation      VARCHAR(150) DEFAULT 'Not Specified',
  employment_type  VARCHAR(50)  DEFAULT 'Full-Time',
  start_date       DATE         NOT NULL DEFAULT '1900-01-01',
  end_date         DATE         DEFAULT '1900-01-01',
  is_current       BOOLEAN      NULL,
  CONSTRAINT chk_workexp_dates CHECK (end_date = '1900-01-01' OR start_date <= end_date),
  created_at       DATETIME     DEFAULT CURRENT_TIMESTAMP,
  updated_at       DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES tbl_cp_student(student_id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS tbl_cp_studentprojects (
  row_id              INT          AUTO_INCREMENT PRIMARY KEY,
  project_id          INT          NOT NULL UNIQUE,
  student_id          INT          NOT NULL,
  workexp_id          INT          NULL,
  project_title       VARCHAR(255) NOT NULL,
  project_description TEXT,
  achievements        TEXT,
  project_start_date  DATE         DEFAULT '1900-01-01',
  project_end_date    DATE         DEFAULT '1900-01-01',
  CONSTRAINT chk_project_dates CHECK (
    project_start_date = '1900-01-01' OR project_end_date = '1900-01-01'
    OR project_start_date <= project_end_date
  ),
  created_at          DATETIME     DEFAULT CURRENT_TIMESTAMP,
  updated_at          DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES tbl_cp_student(student_id)         ON DELETE RESTRICT,
  FOREIGN KEY (workexp_id) REFERENCES tbl_cp_student_workexp(workexp_id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- SECTION 7 : STUDENT MANY-TO-MANY RELATIONS
-- Tables: tbl_cp_m2m_std_skill, tbl_cp_m2m_std_lng, tbl_cp_m2m_std_interest,
--         tbl_cp_m2m_student_certification, tbl_cp_m2m_studentproject_skill
-- ============================================================================

CREATE TABLE IF NOT EXISTS tbl_cp_m2m_std_skill (
  row_id     INT      AUTO_INCREMENT PRIMARY KEY,
  student_id INT      NOT NULL,
  skill_id   INT      NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE (student_id, skill_id),
  FOREIGN KEY (student_id) REFERENCES tbl_cp_student(student_id) ON DELETE RESTRICT,
  FOREIGN KEY (skill_id)   REFERENCES tbl_cp_mskills(skill_id)   ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS tbl_cp_m2m_std_lng (
  row_id      INT      AUTO_INCREMENT PRIMARY KEY,
  student_id  INT      NOT NULL,
  language_id INT      NOT NULL,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE (student_id, language_id),
  FOREIGN KEY (student_id)  REFERENCES tbl_cp_student(student_id)      ON DELETE RESTRICT,
  FOREIGN KEY (language_id) REFERENCES tbl_cp_mlanguages(language_id)  ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS tbl_cp_m2m_std_interest (
  row_id      INT      AUTO_INCREMENT PRIMARY KEY,
  student_id  INT      NOT NULL,
  interest_id INT      NOT NULL,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE (student_id, interest_id),
  FOREIGN KEY (student_id)  REFERENCES tbl_cp_student(student_id)       ON DELETE RESTRICT,
  FOREIGN KEY (interest_id) REFERENCES tbl_cp_minterests(interest_id)   ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

-- expiry_date '9999-12-31' means no expiry / lifetime certification
CREATE TABLE IF NOT EXISTS tbl_cp_m2m_student_certification (
  row_id           INT          AUTO_INCREMENT PRIMARY KEY,
  student_id       INT          NOT NULL,
  certification_id INT          NOT NULL,
  issue_date       DATE         DEFAULT '1900-01-01',
  expiry_date      DATE         DEFAULT '9999-12-31',
  certificate_url  VARCHAR(500) DEFAULT '',
  credential_id    VARCHAR(150) DEFAULT '',
  is_verified      BOOLEAN      NULL,
  created_at       DATETIME     DEFAULT CURRENT_TIMESTAMP,
  updated_at       DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE (student_id, certification_id),
  FOREIGN KEY (student_id)       REFERENCES tbl_cp_student(student_id)                  ON DELETE RESTRICT,
  FOREIGN KEY (certification_id) REFERENCES tbl_cp_mcertifications(certification_id)    ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS tbl_cp_m2m_studentproject_skill (
  row_id     INT      AUTO_INCREMENT PRIMARY KEY,
  project_id INT      NOT NULL,
  skill_id   INT      NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE (project_id, skill_id),
  FOREIGN KEY (project_id) REFERENCES tbl_cp_studentprojects(project_id) ON DELETE RESTRICT,
  FOREIGN KEY (skill_id)   REFERENCES tbl_cp_mskills(skill_id)           ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- SECTION 8 : ADDRESSES
-- Tables: tbl_cp_student_address, tbl_cp_college_address, tbl_cp_company_address
-- Note: tbl_cp_company_address FK to tbl_cp_mcompany is defined later;
--       FOREIGN_KEY_CHECKS=0 at top allows forward references safely.
-- ============================================================================

-- address_type: 'permanent' or 'current'
CREATE TABLE IF NOT EXISTS tbl_cp_student_address (
  row_id         INT           AUTO_INCREMENT PRIMARY KEY,
  address_id     INT           NOT NULL UNIQUE,
  student_id     INT           NOT NULL,
  address_line_1 VARCHAR(255)  NOT NULL,
  address_line_2 VARCHAR(255)  DEFAULT '',
  care_of        VARCHAR(255)  DEFAULT '',
  landmark       VARCHAR(255)  DEFAULT 'No Landmark',
  pincode_id     INT           NOT NULL,
  latitude       DECIMAL(10,8) DEFAULT 0.00000000,
  longitude      DECIMAL(11,8) DEFAULT 0.00000000,
  address_type   VARCHAR(50)   NOT NULL DEFAULT 'current',
  address_expiry DATE          DEFAULT '9999-12-31',
  created_at     DATETIME      DEFAULT CURRENT_TIMESTAMP,
  updated_at     DATETIME      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES tbl_cp_student(student_id)    ON DELETE RESTRICT,
  FOREIGN KEY (pincode_id) REFERENCES tbl_cp_mpincodes(pincode_id)  ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

-- address_type: 'campus' or 'administrative'
CREATE TABLE IF NOT EXISTS tbl_cp_college_address (
  row_id         INT           AUTO_INCREMENT PRIMARY KEY,
  address_id     INT           NOT NULL UNIQUE,
  college_id     INT           NOT NULL,
  address_line_1 VARCHAR(255)  NOT NULL,
  address_line_2 VARCHAR(255)  DEFAULT '',
  landmark       VARCHAR(255)  DEFAULT 'No Landmark',
  pincode_id     INT           NOT NULL,
  latitude       DECIMAL(10,8) DEFAULT 0.00000000,
  longitude      DECIMAL(11,8) DEFAULT 0.00000000,
  address_type   VARCHAR(50)   NOT NULL DEFAULT 'campus',
  created_at     DATETIME      DEFAULT CURRENT_TIMESTAMP,
  updated_at     DATETIME      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (college_id) REFERENCES tbl_cp_mcolleges(college_id) ON DELETE RESTRICT,
  FOREIGN KEY (pincode_id) REFERENCES tbl_cp_mpincodes(pincode_id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- SECTION 9 : COMPANY & JOB DESCRIPTION
-- Tables: tbl_cp_mcompany, tbl_cp_company_address, tbl_cp_job_description
-- ============================================================================

CREATE TABLE IF NOT EXISTS tbl_cp_mcompany (
  row_id     INT          AUTO_INCREMENT PRIMARY KEY,
  company_id INT          NOT NULL UNIQUE,
  name       VARCHAR(255) NOT NULL UNIQUE,
  industry   VARCHAR(150) DEFAULT 'Not Specified',
  website    VARCHAR(255) DEFAULT '',
  city       VARCHAR(100) DEFAULT 'Not Specified',
  is_active  BOOLEAN      NULL,
  created_at DATETIME     DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

-- address_type: 'registered' or 'branch'
CREATE TABLE IF NOT EXISTS tbl_cp_company_address (
  row_id         INT           AUTO_INCREMENT PRIMARY KEY,
  address_id     INT           NOT NULL UNIQUE,
  company_id     INT           NOT NULL,
  address_line_1 VARCHAR(255)  NOT NULL,
  address_line_2 VARCHAR(255)  DEFAULT '',
  landmark       VARCHAR(255)  DEFAULT 'No Landmark',
  pincode_id     INT           NOT NULL,
  latitude       DECIMAL(10,8) DEFAULT 0.00000000,
  longitude      DECIMAL(11,8) DEFAULT 0.00000000,
  address_type   VARCHAR(50)   NOT NULL DEFAULT 'registered',
  created_at     DATETIME      DEFAULT CURRENT_TIMESTAMP,
  updated_at     DATETIME      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES tbl_cp_mcompany(company_id)  ON DELETE RESTRICT,
  FOREIGN KEY (pincode_id) REFERENCES tbl_cp_mpincodes(pincode_id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS tbl_cp_job_description (
  row_id               INT           AUTO_INCREMENT PRIMARY KEY,
  jd_id                INT           NOT NULL UNIQUE,
  company_id           INT           NOT NULL,
  job_role             VARCHAR(150)  NOT NULL DEFAULT 'Not Specified',
  title                VARCHAR(255)  NOT NULL,
  description          TEXT,
  experience_min_yrs   DECIMAL(4,1)  DEFAULT 0.0,
  experience_max_yrs   DECIMAL(4,1)  DEFAULT 0.0,
  salary_min           DECIMAL(12,2) DEFAULT 0.00,
  salary_max           DECIMAL(12,2) DEFAULT 0.00,
  bond_months          INT           DEFAULT 0,
  location             VARCHAR(150)  DEFAULT 'Remote',
  employment_type      VARCHAR(50)   DEFAULT 'Full-Time',
  openings             INT           DEFAULT 1,
  hiring_manager_name  VARCHAR(150)  DEFAULT 'Not Assigned',
  hiring_manager_email VARCHAR(255)  DEFAULT 'noreply@company.com',
  status               VARCHAR(30)   NOT NULL DEFAULT 'Open',
  CONSTRAINT chk_salary     CHECK (salary_min <= salary_max),
  CONSTRAINT chk_experience CHECK (experience_min_yrs <= experience_max_yrs),
  created_at           DATETIME      DEFAULT CURRENT_TIMESTAMP,
  updated_at           DATETIME      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES tbl_cp_mcompany(company_id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- SECTION 10 : QUESTION BANK
-- Tables: tbl_cp_mquestions, tbl_cp_m2m_question_options
-- ============================================================================

-- question_type: 'mcq', 'subjective', 'coding', 'case_study'
CREATE TABLE IF NOT EXISTS tbl_cp_mquestions (
  row_id        INT          AUTO_INCREMENT PRIMARY KEY,
  question_id   INT          NOT NULL UNIQUE,
  module_id     INT          NOT NULL,
  difficulty_id INT          NOT NULL,
  question_text TEXT         NOT NULL,
  question_type VARCHAR(50)  NOT NULL DEFAULT 'mcq',
  correct_answer TEXT,
  max_marks     DECIMAL(6,2) NOT NULL DEFAULT 1.0,
  is_active     BOOLEAN      NULL,
  created_at    DATETIME     DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (module_id)     REFERENCES tbl_cp_mmodule(module_id)       ON DELETE RESTRICT,
  FOREIGN KEY (difficulty_id) REFERENCES tbl_cp_mdifficulty(difficulty_id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS tbl_cp_m2m_question_options (
  row_id        INT      AUTO_INCREMENT PRIMARY KEY,
  option_id     INT      NOT NULL UNIQUE,
  question_id   INT      NOT NULL,
  option_text   TEXT     NOT NULL,
  is_correct    BOOLEAN  NULL,
  display_order INT      NOT NULL DEFAULT 1,
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (question_id) REFERENCES tbl_cp_mquestions(question_id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- SECTION 11 : ROUND CONFIGURATION PER JD
-- Tables: tbl_cp_jd_round_config, tbl_cp_m2m_jd_round_module
-- ============================================================================

CREATE TABLE IF NOT EXISTS tbl_cp_jd_round_config (
  row_id          INT          AUTO_INCREMENT PRIMARY KEY,
  round_config_id INT          NOT NULL UNIQUE,
  jd_id           INT          NOT NULL,
  round_number    TINYINT      NOT NULL,
  round_label     VARCHAR(100) NOT NULL DEFAULT 'Round',
  is_exam         BOOLEAN      NULL,
  created_at      DATETIME     DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE (jd_id, round_number),
  UNIQUE (jd_id, round_label),
  FOREIGN KEY (jd_id) REFERENCES tbl_cp_job_description(jd_id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS tbl_cp_m2m_jd_round_module (
  row_id          INT          AUTO_INCREMENT PRIMARY KEY,
  jd_round_mod_id INT          NOT NULL UNIQUE,
  round_config_id INT          NOT NULL,
  module_id       INT          NOT NULL,
  weightage       DECIMAL(5,4) NOT NULL DEFAULT 0.1,
  difficulty_id   INT          DEFAULT NULL,
  is_mandatory    BOOLEAN      NULL,
  created_at      DATETIME     DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE (round_config_id, module_id),
  FOREIGN KEY (round_config_id) REFERENCES tbl_cp_jd_round_config(round_config_id) ON DELETE RESTRICT,
  FOREIGN KEY (module_id)       REFERENCES tbl_cp_mmodule(module_id)               ON DELETE RESTRICT,
  FOREIGN KEY (difficulty_id)   REFERENCES tbl_cp_mdifficulty(difficulty_id)       ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- SECTION 12 : RECRUITMENT DRIVE
-- Tables: tbl_cp_recruitment_drive, tbl_cp_recruitment_drive_round
-- ============================================================================

CREATE TABLE IF NOT EXISTS tbl_cp_recruitment_drive (
  row_id      INT          AUTO_INCREMENT PRIMARY KEY,
  drive_id    INT          NOT NULL UNIQUE,
  drive_name  VARCHAR(255) NOT NULL,
  jd_id       INT          NOT NULL,
  start_date  DATE         DEFAULT '1900-01-01',
  end_date    DATE         DEFAULT '9999-12-31',
  description TEXT,
  status      VARCHAR(30)  NOT NULL DEFAULT 'Active',
  CONSTRAINT chk_drive_dates CHECK (start_date <= end_date),
  created_at  DATETIME     DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (jd_id) REFERENCES tbl_cp_job_description(jd_id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS tbl_cp_recruitment_drive_round (
  round_id     INT          AUTO_INCREMENT PRIMARY KEY,
  drive_id     INT          NOT NULL,
  round_number INT          NOT NULL,
  round_name   VARCHAR(255) NOT NULL,
  round_type   ENUM('aptitude','technical_quiz','coding_test','technical_interview','hr_interview') NOT NULL,
  config_json  JSON,
  created_at   DATETIME     DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (drive_id) REFERENCES tbl_cp_recruitment_drive(drive_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- SECTION 13 : APPLICATION & STATUS HISTORY
-- Tables: tbl_cp_application, tbl_cp_application_status_history
-- ============================================================================

CREATE TABLE IF NOT EXISTS tbl_cp_application (
  row_id           INT         AUTO_INCREMENT PRIMARY KEY,
  application_id   INT         NOT NULL UNIQUE,
  student_id       INT         NOT NULL,
  drive_id         INT         NOT NULL,
  serial_no        INT         NOT NULL,
  application_date DATE        NOT NULL DEFAULT (CURRENT_DATE),
  status           VARCHAR(50) NOT NULL DEFAULT 'Applied',
  created_at       DATETIME    DEFAULT CURRENT_TIMESTAMP,
  updated_at       DATETIME    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE (student_id, drive_id),
  UNIQUE (drive_id, serial_no),
  FOREIGN KEY (student_id) REFERENCES tbl_cp_student(student_id)                 ON DELETE RESTRICT,
  FOREIGN KEY (drive_id)   REFERENCES tbl_cp_recruitment_drive(drive_id)         ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

-- Tracks every status change for an application (full audit trail)
CREATE TABLE IF NOT EXISTS tbl_cp_application_status_history (
  row_id         INT         AUTO_INCREMENT PRIMARY KEY,
  history_id     INT         NOT NULL UNIQUE,
  application_id INT         NOT NULL,
  status         VARCHAR(50) NOT NULL DEFAULT 'Applied',
  changed_date   DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at     DATETIME    DEFAULT CURRENT_TIMESTAMP,
  updated_at     DATETIME    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (application_id) REFERENCES tbl_cp_application(application_id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- SECTION 14 : EXAM SESSION & RESPONSES
-- Tables: tbl_cp_exam_session, tbl_cp_m2m_exam_question_response
-- ============================================================================

CREATE TABLE IF NOT EXISTS tbl_cp_exam_session (
  row_id          INT          AUTO_INCREMENT PRIMARY KEY,
  exam_session_id INT          NOT NULL UNIQUE,
  application_id  INT          NOT NULL,
  round_config_id INT          NOT NULL,
  attendance_id   INT          NOT NULL,
  exam_date       DATE         DEFAULT '1900-01-01',
  exam_time       TIME         DEFAULT '00:00:00',
  cutoff_pct      DECIMAL(5,4) DEFAULT 0.4000,
  correct_count   INT          DEFAULT 0,
  incorrect_count INT          DEFAULT 0,
  total_questions INT          DEFAULT 0,
  score_pct       DECIMAL(5,4) DEFAULT 0.0000,
  CONSTRAINT chk_score_pct CHECK (score_pct >= 0 AND score_pct <= 1),
  result_id       INT,
  feedback        TEXT,
  created_at      DATETIME     DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE (application_id, round_config_id),
  FOREIGN KEY (application_id)  REFERENCES tbl_cp_application(application_id)        ON DELETE RESTRICT,
  FOREIGN KEY (round_config_id) REFERENCES tbl_cp_jd_round_config(round_config_id)  ON DELETE RESTRICT,
  FOREIGN KEY (attendance_id)   REFERENCES tbl_cp_mattendance(attendance_id)         ON DELETE RESTRICT,
  FOREIGN KEY (result_id)       REFERENCES tbl_cp_mround_result(result_id)           ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS tbl_cp_m2m_exam_question_response (
  row_id          INT          AUTO_INCREMENT PRIMARY KEY,
  response_id     INT          NOT NULL UNIQUE,
  exam_session_id INT          NOT NULL,
  question_id     INT          NOT NULL,
  option_id       INT          NULL,
  is_correct      BOOLEAN      NULL,
  marks_awarded   DECIMAL(5,2) DEFAULT 0.00,
  created_at      DATETIME     DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE (exam_session_id, question_id),
  FOREIGN KEY (exam_session_id) REFERENCES tbl_cp_exam_session(exam_session_id)          ON DELETE RESTRICT,
  FOREIGN KEY (question_id)     REFERENCES tbl_cp_mquestions(question_id)                ON DELETE RESTRICT,
  FOREIGN KEY (option_id)       REFERENCES tbl_cp_m2m_question_options(option_id)        ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- SECTION 15 : INTERVIEW SESSION & RESPONSES
-- Tables: tbl_cp_interview_session, tbl_cp_m2m_session_module_score,
--         tbl_cp_m2m_session_question_response
-- ============================================================================

-- internal_feedback: written by mentor, not shared with client
-- external_feedback: formal document shared after final rounds
CREATE TABLE IF NOT EXISTS tbl_cp_interview_session (
  row_id            INT          AUTO_INCREMENT PRIMARY KEY,
  session_id        INT          NOT NULL UNIQUE,
  application_id    INT          NOT NULL,
  round_config_id   INT          NOT NULL,
  interviewer_id    INT          NULL,
  attendance_id     INT          NOT NULL,
  session_date      DATE         DEFAULT '1900-01-01',
  session_time      TIME         DEFAULT '00:00:00',
  bonus_marks       DECIMAL(5,2) DEFAULT 0.00,
  total_score       DECIMAL(6,2) DEFAULT 0.00,
  result_id         INT          NULL,
  comments          TEXT,
  internal_feedback TEXT,
  external_feedback TEXT,
  created_at        DATETIME     DEFAULT CURRENT_TIMESTAMP,
  updated_at        DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE (application_id, round_config_id),
  FOREIGN KEY (application_id)  REFERENCES tbl_cp_application(application_id)        ON DELETE RESTRICT,
  FOREIGN KEY (round_config_id) REFERENCES tbl_cp_jd_round_config(round_config_id)  ON DELETE RESTRICT,
  FOREIGN KEY (interviewer_id)  REFERENCES tbl_cp_minterviewer(interviewer_id)       ON DELETE RESTRICT,
  FOREIGN KEY (attendance_id)   REFERENCES tbl_cp_mattendance(attendance_id)         ON DELETE RESTRICT,
  FOREIGN KEY (result_id)       REFERENCES tbl_cp_mround_result(result_id)           ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

-- For modules with has_questions=FALSE, score_sum is entered manually by the interviewer
CREATE TABLE IF NOT EXISTS tbl_cp_m2m_session_module_score (
  row_id          INT          AUTO_INCREMENT PRIMARY KEY,
  score_id        INT          NOT NULL UNIQUE,
  session_id      INT          NOT NULL,
  module_id       INT          NOT NULL,
  correct_count   INT          DEFAULT 0,
  incorrect_count INT          DEFAULT 0,
  total_questions INT          DEFAULT 0,
  score_sum       DECIMAL(6,2) NOT NULL DEFAULT 0.00,
  created_at      DATETIME     DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE (session_id, module_id),
  FOREIGN KEY (session_id) REFERENCES tbl_cp_interview_session(session_id) ON DELETE RESTRICT,
  FOREIGN KEY (module_id)  REFERENCES tbl_cp_mmodule(module_id)            ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS tbl_cp_m2m_session_question_response (
  row_id        INT          AUTO_INCREMENT PRIMARY KEY,
  response_id   INT          NOT NULL UNIQUE,
  session_id    INT          NOT NULL,
  question_id   INT          NOT NULL,
  is_correct    BOOLEAN      NULL,
  marks_awarded DECIMAL(5,2) DEFAULT 0.00,
  created_at    DATETIME     DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE (session_id, question_id),
  FOREIGN KEY (session_id)  REFERENCES tbl_cp_interview_session(session_id) ON DELETE RESTRICT,
  FOREIGN KEY (question_id) REFERENCES tbl_cp_mquestions(question_id)       ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- SECTION 16 : PLACEMENTS
-- Tables: tbl_cp_placements
-- ============================================================================

CREATE TABLE IF NOT EXISTS tbl_cp_placements (
  placement_id    INT           AUTO_INCREMENT PRIMARY KEY,
  student_id      INT           NOT NULL,
  company_id      INT           NOT NULL,
  application_id  INT           NOT NULL,
  job_title       VARCHAR(100),
  salary          DECIMAL(12,2),
  placement_date  DATETIME      DEFAULT CURRENT_TIMESTAMP,
  created_at      DATETIME      DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id)     REFERENCES tbl_cp_student(student_id)         ON DELETE RESTRICT,
  FOREIGN KEY (company_id)     REFERENCES tbl_cp_mcompany(company_id)        ON DELETE RESTRICT,
  FOREIGN KEY (application_id) REFERENCES tbl_cp_application(application_id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- SECTION 17 : INDEXES
-- ============================================================================

-- Student
CREATE INDEX idx_student_email          ON tbl_cp_student(email);
CREATE INDEX idx_student_status         ON tbl_cp_student(status);

-- Job Description
CREATE INDEX idx_jd_company             ON tbl_cp_job_description(company_id);
CREATE INDEX idx_jd_job_role            ON tbl_cp_job_description(job_role);
CREATE INDEX idx_jd_status              ON tbl_cp_job_description(status);

-- Round config
CREATE INDEX idx_round_config_jd        ON tbl_cp_jd_round_config(jd_id);

-- JD Round Module
CREATE INDEX idx_jrm_round_config       ON tbl_cp_m2m_jd_round_module(round_config_id);
CREATE INDEX idx_jrm_module             ON tbl_cp_m2m_jd_round_module(module_id);

-- Recruitment Drive
CREATE INDEX idx_drive_jd               ON tbl_cp_recruitment_drive(jd_id);
CREATE INDEX idx_drive_status           ON tbl_cp_recruitment_drive(status);

-- Application
CREATE INDEX idx_application_student    ON tbl_cp_application(student_id);
CREATE INDEX idx_application_drive      ON tbl_cp_application(drive_id);
CREATE INDEX idx_application_status     ON tbl_cp_application(status);

-- Application status history
CREATE INDEX idx_status_history_app     ON tbl_cp_application_status_history(application_id);

-- Exam session
CREATE INDEX idx_exam_result            ON tbl_cp_exam_session(result_id);
CREATE INDEX idx_exam_qr_question       ON tbl_cp_m2m_exam_question_response(question_id);

-- Interview session
CREATE INDEX idx_session_application    ON tbl_cp_interview_session(application_id);
CREATE INDEX idx_session_round_config   ON tbl_cp_interview_session(round_config_id);
CREATE INDEX idx_session_interviewer    ON tbl_cp_interview_session(interviewer_id);
CREATE INDEX idx_session_result         ON tbl_cp_interview_session(result_id);
CREATE INDEX idx_session_date           ON tbl_cp_interview_session(session_date);

-- Session module score
CREATE INDEX idx_sms_module             ON tbl_cp_m2m_session_module_score(module_id);

-- Session question response
CREATE INDEX idx_sqr_question           ON tbl_cp_m2m_session_question_response(question_id);

-- Questions
CREATE INDEX idx_question_module        ON tbl_cp_mquestions(module_id);
CREATE INDEX idx_question_difficulty    ON tbl_cp_mquestions(difficulty_id);
CREATE INDEX idx_question_type          ON tbl_cp_mquestions(question_type);

-- ============================================================================

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================================
-- TABLE SUMMARY (52 total)
-- ============================================================================
-- SECTION  1 – Auth & RBAC           : users, otp_requests, tbl_cp_mroles
-- SECTION  2 – Master / Lookup       : tbl_cp_msalutation, tbl_cp_mlanguages,
--                                      tbl_cp_minterests, tbl_cp_mcourses,
--                                      tbl_cp_mcolleges, tbl_cp_mcertifications,
--                                      tbl_cp_mskills, tbl_cp_mmodule,
--                                      tbl_cp_mdifficulty, tbl_cp_mround_result,
--                                      tbl_cp_mattendance, tbl_cp_minterviewer
-- SECTION  3 – Geography             : tbl_cp_mcountries, tbl_cp_mstates,
--                                      tbl_cp_mcities, tbl_cp_mpincodes
-- SECTION  4 – Student Core          : tbl_cp_student
-- SECTION  5 – Student Education     : tbl_cp_student_school,
--                                      tbl_cp_student_education,
--                                      tbl_cp_msemester, tbl_cp_msubjects,
--                                      tbl_cp_college_sem_subject,
--                                      tbl_cp_student_subject_marks
-- SECTION  6 – Work & Projects       : tbl_cp_student_workexp,
--                                      tbl_cp_studentprojects
-- SECTION  7 – Student M2M           : tbl_cp_m2m_std_skill,
--                                      tbl_cp_m2m_std_lng,
--                                      tbl_cp_m2m_std_interest,
--                                      tbl_cp_m2m_student_certification,
--                                      tbl_cp_m2m_studentproject_skill
-- SECTION  8 – Addresses             : tbl_cp_student_address,
--                                      tbl_cp_college_address
-- SECTION  9 – Company & JD          : tbl_cp_mcompany, tbl_cp_company_address,
--                                      tbl_cp_job_description
-- SECTION 10 – Question Bank         : tbl_cp_mquestions,
--                                      tbl_cp_m2m_question_options
-- SECTION 11 – Round Config          : tbl_cp_jd_round_config,
--                                      tbl_cp_m2m_jd_round_module
-- SECTION 12 – Recruitment Drive     : tbl_cp_recruitment_drive,
--                                      tbl_cp_recruitment_drive_round
-- SECTION 13 – Application           : tbl_cp_application,
--                                      tbl_cp_application_status_history
-- SECTION 14 – Exam Session          : tbl_cp_exam_session,
--                                      tbl_cp_m2m_exam_question_response
-- SECTION 15 – Interview Session     : tbl_cp_interview_session,
--                                      tbl_cp_m2m_session_module_score,
--                                      tbl_cp_m2m_session_question_response
-- SECTION 16 – Placements            : tbl_cp_placements
-- ============================================================================

ALTER TABLE campus6.tbl_cp_mcountries 
MODIFY COLUMN country_code VARCHAR(5) NULL DEFAULT NULL;

ALTER TABLE tbl_cp_mskills ALTER COLUMN language_id SET DEFAULT 1;

ALTER TABLE tbl_cp_mskills DROP FOREIGN KEY tbl_cp_mskills_ibfk_1;
ALTER TABLE tbl_cp_mskills DROP COLUMN language_id;