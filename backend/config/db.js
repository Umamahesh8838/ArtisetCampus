// MIGRATED TO campus6 schema - Complete 52-table relational schema for campus recruitment platform
// This file initializes the database with the full final schema structure

const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'campus5',
  ssl: { rejectUnauthorized: false },
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

const logger = require('../utils/logger');

async function initDb() {
  logger.info('Initializing campus6 database schema...');
  
  try {
    // Set FOREIGN_KEY_CHECKS to 0 to allow forward references
    await pool.execute('SET FOREIGN_KEY_CHECKS = 0');

    // ========== SECTION 1: CORE AUTH & RBAC ==========
    await pool.execute(`
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
        role ENUM('student','tpo','recruiter','admin') DEFAULT 'student',
        is_email_verified BOOLEAN DEFAULT FALSE,
        is_phone_verified BOOLEAN DEFAULT FALSE,
        is_active BOOLEAN DEFAULT TRUE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        KEY idx_role (role)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await pool.execute(`
      CREATE TABLE IF NOT EXISTS otp_requests (
        id INT AUTO_INCREMENT PRIMARY KEY,
        identifier VARCHAR(255),
        type ENUM('email','phone'),
        otp_code VARCHAR(255),
        expires_at DATETIME,
        is_verified BOOLEAN DEFAULT FALSE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await pool.execute(`
      CREATE TABLE IF NOT EXISTS tbl_cp_mroles (
        role_id INT PRIMARY KEY,
        role_name VARCHAR(50) NOT NULL UNIQUE,
        description VARCHAR(255),
        permissions JSON,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Insert default roles
    await pool.execute(`
      INSERT IGNORE INTO tbl_cp_mroles (role_id, role_name, description, permissions) VALUES
      (1, 'student',   'Student user',       JSON_OBJECT('all', JSON_ARRAY('read'))),
      (2, 'tpo',       'Placement Officer',  JSON_OBJECT('all', JSON_ARRAY('manage'))),
      (3, 'recruiter', 'Company Recruiter',  JSON_OBJECT('all', JSON_ARRAY('manage'))),
      (4, 'admin',     'System Admin',       JSON_OBJECT('all', JSON_ARRAY('*')))
    `);

    // ========== SECTION 2: MASTER / LOOKUP TABLES ==========
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS tbl_cp_msalutation (
        row_id INT AUTO_INCREMENT PRIMARY KEY,
        salutation_id INT NOT NULL UNIQUE,
        value VARCHAR(50) NOT NULL UNIQUE,
        description VARCHAR(255) DEFAULT 'No description',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await pool.execute(`
      INSERT IGNORE INTO tbl_cp_msalutation (salutation_id, value) VALUES
      (1,'Mr.'),(2,'Ms.'),(3,'Mrs.'),(4,'Dr.')
    `);

    await pool.execute(`
      CREATE TABLE IF NOT EXISTS tbl_cp_mlanguages (
        row_id INT AUTO_INCREMENT PRIMARY KEY,
        language_id INT NOT NULL UNIQUE,
        language_code VARCHAR(20) NOT NULL UNIQUE,
        language_name VARCHAR(100) NOT NULL UNIQUE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await pool.execute(`
      CREATE TABLE IF NOT EXISTS tbl_cp_minterests (
        row_id INT AUTO_INCREMENT PRIMARY KEY,
        interest_id INT NOT NULL UNIQUE,
        name VARCHAR(150) NOT NULL UNIQUE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await pool.execute(`
      CREATE TABLE IF NOT EXISTS tbl_cp_mcourses (
        row_id INT AUTO_INCREMENT PRIMARY KEY,
        course_id INT NOT NULL UNIQUE,
        course_name VARCHAR(150) NOT NULL,
        course_code VARCHAR(50) NOT NULL DEFAULT 'UNKNOWN',
        specialization_name VARCHAR(150) NOT NULL DEFAULT 'General',
        specialization_code VARCHAR(50) NOT NULL DEFAULT 'GEN',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE (course_code, specialization_code),
        UNIQUE (course_name, specialization_name)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await pool.execute(`
      CREATE TABLE IF NOT EXISTS tbl_cp_mcolleges (
        row_id INT AUTO_INCREMENT PRIMARY KEY,
        college_id INT NOT NULL UNIQUE,
        college_name VARCHAR(255) NOT NULL UNIQUE,
        spoc_name VARCHAR(150) DEFAULT 'Not Assigned',
        spoc_phone VARCHAR(20) DEFAULT '0000000000',
        spoc_email VARCHAR(255) DEFAULT 'noreply@college.com',
        tpo_name VARCHAR(150) DEFAULT 'Not Assigned',
        tpo_phone VARCHAR(20) DEFAULT '0000000000',
        tpo_email VARCHAR(255) DEFAULT 'noreply@college.com',
        student_coordinator_name VARCHAR(150) DEFAULT 'Not Assigned',
        student_coordinator_phone VARCHAR(20) DEFAULT '0000000000',
        student_coordinator_email VARCHAR(255) DEFAULT 'noreply@college.com',
        reference_details TEXT,
        priority INT NOT NULL DEFAULT 5,
        CONSTRAINT chk_college_priority CHECK (priority BETWEEN 1 AND 10),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await pool.execute(`
      CREATE TABLE IF NOT EXISTS tbl_cp_mcertifications (
        row_id INT AUTO_INCREMENT PRIMARY KEY,
        certification_id INT NOT NULL UNIQUE,
        certification_name VARCHAR(255) NOT NULL,
        certification_code VARCHAR(100) NOT NULL UNIQUE,
        issuing_organization VARCHAR(255) NOT NULL,
        certification_type VARCHAR(100) DEFAULT 'General',
        mode VARCHAR(50) DEFAULT 'Online',
        validity_period_value INT DEFAULT 0,
        validity_period_unit VARCHAR(20) DEFAULT 'Years',
        is_lifetime BOOLEAN NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE (certification_name, issuing_organization)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await pool.execute(`
      CREATE TABLE IF NOT EXISTS tbl_cp_mskills (
        row_id INT AUTO_INCREMENT PRIMARY KEY,
        skill_id INT NOT NULL UNIQUE,
        name VARCHAR(100) NOT NULL UNIQUE,
        description VARCHAR(255) DEFAULT 'No description',
        version VARCHAR(50) DEFAULT 'N/A',
        complexity VARCHAR(50) DEFAULT 'Beginner',
        status VARCHAR(30) DEFAULT 'Active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await pool.execute(`
      CREATE TABLE IF NOT EXISTS tbl_cp_mmodule (
        row_id INT AUTO_INCREMENT PRIMARY KEY,
        module_id INT NOT NULL UNIQUE,
        module_name VARCHAR(150) NOT NULL UNIQUE,
        module_code VARCHAR(50) NOT NULL UNIQUE,
        description VARCHAR(255) DEFAULT 'No description',
        has_questions BOOLEAN NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await pool.execute(`
      CREATE TABLE IF NOT EXISTS tbl_cp_mdifficulty (
        row_id INT AUTO_INCREMENT PRIMARY KEY,
        difficulty_id INT NOT NULL UNIQUE,
        level_code VARCHAR(20) NOT NULL UNIQUE,
        level_label VARCHAR(50) NOT NULL,
        score_weight DECIMAL(4,2) NOT NULL DEFAULT 1.00,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await pool.execute(`
      CREATE TABLE IF NOT EXISTS tbl_cp_mround_result (
        row_id INT AUTO_INCREMENT PRIMARY KEY,
        result_id INT NOT NULL UNIQUE,
        label VARCHAR(100) NOT NULL UNIQUE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await pool.execute(`
      CREATE TABLE IF NOT EXISTS tbl_cp_mattendance (
        row_id INT AUTO_INCREMENT PRIMARY KEY,
        attendance_id INT NOT NULL UNIQUE,
        code VARCHAR(5) NOT NULL UNIQUE,
        label VARCHAR(50) NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await pool.execute(`
      CREATE TABLE IF NOT EXISTS tbl_cp_minterviewer (
        row_id INT AUTO_INCREMENT PRIMARY KEY,
        interviewer_id INT NOT NULL UNIQUE,
        name VARCHAR(150) NOT NULL,
        email VARCHAR(255) DEFAULT 'noreply@interviewer.com',
        phone VARCHAR(20) DEFAULT '0000000000',
        is_internal BOOLEAN NULL,
        company VARCHAR(255) DEFAULT 'Campus4',
        designation VARCHAR(150) DEFAULT 'Interviewer',
        is_active BOOLEAN NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // ========== SECTION 3: GEOGRAPHY MASTER ==========
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS tbl_cp_mcountries (
        row_id INT AUTO_INCREMENT PRIMARY KEY,
        country_id INT NOT NULL UNIQUE,
        country_name VARCHAR(100) NOT NULL UNIQUE,
        country_code VARCHAR(5) NULL DEFAULT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await pool.execute(`
      CREATE TABLE IF NOT EXISTS tbl_cp_mstates (
        row_id INT AUTO_INCREMENT PRIMARY KEY,
        state_id INT NOT NULL UNIQUE,
        state_name VARCHAR(100) NOT NULL,
        state_code VARCHAR(10) DEFAULT 'XX',
        country_id INT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE (state_name, country_id),
        FOREIGN KEY (country_id) REFERENCES tbl_cp_mcountries(country_id) ON DELETE RESTRICT
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await pool.execute(`
      CREATE TABLE IF NOT EXISTS tbl_cp_mcities (
        row_id INT AUTO_INCREMENT PRIMARY KEY,
        city_id INT NOT NULL UNIQUE,
        city_name VARCHAR(100) NOT NULL,
        state_id INT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE (city_name, state_id),
        FOREIGN KEY (state_id) REFERENCES tbl_cp_mstates(state_id) ON DELETE RESTRICT
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await pool.execute(`
      CREATE TABLE IF NOT EXISTS tbl_cp_mpincodes (
        row_id INT AUTO_INCREMENT PRIMARY KEY,
        pincode_id INT NOT NULL UNIQUE,
        pincode VARCHAR(20) NOT NULL UNIQUE,
        city_id INT NOT NULL,
        area_name VARCHAR(150) DEFAULT 'Unknown Area',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (city_id) REFERENCES tbl_cp_mcities(city_id) ON DELETE RESTRICT
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // ========== SECTION 4-8: STUDENT DATA STRUCTURES ==========
    // These depend on users table, so we ensure users exists first (already created above)
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS tbl_cp_student (
        row_id INT AUTO_INCREMENT PRIMARY KEY,
        student_id INT NOT NULL UNIQUE,
        salutation_id INT,
        first_name VARCHAR(100) NOT NULL,
        middle_name VARCHAR(100) DEFAULT '',
        last_name VARCHAR(100) DEFAULT '',
        email VARCHAR(255) NOT NULL UNIQUE,
        alt_email VARCHAR(255) DEFAULT '',
        contact_number VARCHAR(20) UNIQUE,
        alt_contact_number VARCHAR(20) DEFAULT '0000000000',
        linkedin_url VARCHAR(255) DEFAULT '',
        github_url VARCHAR(255) DEFAULT '',
        portfolio_url VARCHAR(255) DEFAULT '',
        resume_url VARCHAR(500) DEFAULT '',
        profile_photo_url VARCHAR(500) NOT NULL DEFAULT 'default_profile.png',
        date_of_birth DATE NOT NULL DEFAULT '1900-01-01',
        current_city VARCHAR(100) DEFAULT 'Not Specified',
        gender VARCHAR(20) DEFAULT 'Not Specified',
        user_type VARCHAR(100) DEFAULT 'Student',
        is_active BOOLEAN NULL,
        status VARCHAR(30) NOT NULL DEFAULT 'Active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (salutation_id) REFERENCES tbl_cp_msalutation(salutation_id) ON DELETE RESTRICT
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await pool.execute(`
      CREATE TABLE IF NOT EXISTS tbl_cp_student_school (
        row_id INT AUTO_INCREMENT PRIMARY KEY,
        school_id INT NOT NULL UNIQUE,
        student_id INT NOT NULL,
        standard VARCHAR(50) NOT NULL,
        board VARCHAR(100) DEFAULT 'Not Specified',
        school_name VARCHAR(255) DEFAULT 'Not Specified',
        percentage DECIMAL(5,2) NOT NULL DEFAULT 0.00,
        passing_year INT DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES tbl_cp_student(student_id) ON DELETE RESTRICT
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await pool.execute(`
      CREATE TABLE IF NOT EXISTS tbl_cp_student_education (
        row_id INT AUTO_INCREMENT PRIMARY KEY,
        edu_id INT NOT NULL UNIQUE,
        student_id INT NOT NULL,
        college_id INT NOT NULL,
        course_id INT NOT NULL,
        start_year INT DEFAULT 0,
        end_year INT DEFAULT 0,
        cgpa DECIMAL(4,2) DEFAULT 0.00,
        percentage DECIMAL(5,2) DEFAULT 0.00,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES tbl_cp_student(student_id) ON DELETE RESTRICT,
        FOREIGN KEY (college_id) REFERENCES tbl_cp_mcolleges(college_id) ON DELETE RESTRICT,
        FOREIGN KEY (course_id) REFERENCES tbl_cp_mcourses(course_id) ON DELETE RESTRICT
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await pool.execute(`
      CREATE TABLE IF NOT EXISTS tbl_cp_msemester (
        row_id INT AUTO_INCREMENT PRIMARY KEY,
        semester_id INT NOT NULL UNIQUE,
        course_id INT NOT NULL,
        semester_number INT NOT NULL,
        semester_name VARCHAR(50) DEFAULT 'Semester',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE (course_id, semester_number),
        FOREIGN KEY (course_id) REFERENCES tbl_cp_mcourses(course_id) ON DELETE RESTRICT
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await pool.execute(`
      CREATE TABLE IF NOT EXISTS tbl_cp_msubjects (
        row_id INT AUTO_INCREMENT PRIMARY KEY,
        subject_id INT NOT NULL UNIQUE,
        subject_code VARCHAR(50) NOT NULL UNIQUE,
        subject_name VARCHAR(255) NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await pool.execute(`
      CREATE TABLE IF NOT EXISTS tbl_cp_college_sem_subject (
        row_id INT AUTO_INCREMENT PRIMARY KEY,
        college_sem_subject_id INT NOT NULL UNIQUE,
        college_id INT NOT NULL,
        semester_id INT NOT NULL,
        subject_id INT NOT NULL,
        credits DECIMAL(3,1) NOT NULL DEFAULT 3.0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE (college_id, semester_id, subject_id),
        FOREIGN KEY (college_id) REFERENCES tbl_cp_mcolleges(college_id) ON DELETE RESTRICT,
        FOREIGN KEY (semester_id) REFERENCES tbl_cp_msemester(semester_id) ON DELETE RESTRICT,
        FOREIGN KEY (subject_id) REFERENCES tbl_cp_msubjects(subject_id) ON DELETE RESTRICT
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await pool.execute(`
      CREATE TABLE IF NOT EXISTS tbl_cp_student_subject_marks (
        row_id INT AUTO_INCREMENT PRIMARY KEY,
        student_id INT NOT NULL,
        college_sem_subject_id INT NOT NULL,
        evaluation_type VARCHAR(20) NOT NULL DEFAULT 'internal',
        marks_obtained DECIMAL(5,2) NOT NULL DEFAULT 0.00,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE (student_id, college_sem_subject_id, evaluation_type),
        FOREIGN KEY (student_id) REFERENCES tbl_cp_student(student_id) ON DELETE RESTRICT,
        FOREIGN KEY (college_sem_subject_id) REFERENCES tbl_cp_college_sem_subject(college_sem_subject_id) ON DELETE RESTRICT
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await pool.execute(`
      CREATE TABLE IF NOT EXISTS tbl_cp_student_workexp (
        row_id INT AUTO_INCREMENT PRIMARY KEY,
        workexp_id INT NOT NULL UNIQUE,
        student_id INT NOT NULL,
        company_name VARCHAR(255) NOT NULL,
        company_location VARCHAR(150) DEFAULT 'Not Specified',
        designation VARCHAR(150) DEFAULT 'Not Specified',
        employment_type VARCHAR(50) DEFAULT 'Full-Time',
        start_date DATE NOT NULL DEFAULT '1900-01-01',
        end_date DATE DEFAULT '1900-01-01',
        is_current BOOLEAN NULL,
        CONSTRAINT chk_workexp_dates CHECK (end_date = '1900-01-01' OR start_date <= end_date),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES tbl_cp_student(student_id) ON DELETE RESTRICT
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await pool.execute(`
      CREATE TABLE IF NOT EXISTS tbl_cp_studentprojects (
        row_id INT AUTO_INCREMENT PRIMARY KEY,
        project_id INT NOT NULL UNIQUE,
        student_id INT NOT NULL,
        workexp_id INT NULL,
        project_title VARCHAR(255) NOT NULL,
        project_description TEXT,
        achievements TEXT,
        project_start_date DATE DEFAULT '1900-01-01',
        project_end_date DATE DEFAULT '1900-01-01',
        CONSTRAINT chk_project_dates CHECK (
          project_start_date = '1900-01-01' OR project_end_date = '1900-01-01'
          OR project_start_date <= project_end_date
        ),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES tbl_cp_student(student_id) ON DELETE RESTRICT,
        FOREIGN KEY (workexp_id) REFERENCES tbl_cp_student_workexp(workexp_id) ON DELETE RESTRICT
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // ========== SECTION 7: M2M RELATIONS ==========
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS tbl_cp_m2m_std_skill (
        row_id INT AUTO_INCREMENT PRIMARY KEY,
        student_id INT NOT NULL,
        skill_id INT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE (student_id, skill_id),
        FOREIGN KEY (student_id) REFERENCES tbl_cp_student(student_id) ON DELETE RESTRICT,
        FOREIGN KEY (skill_id) REFERENCES tbl_cp_mskills(skill_id) ON DELETE RESTRICT
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await pool.execute(`
      CREATE TABLE IF NOT EXISTS tbl_cp_m2m_std_lng (
        row_id INT AUTO_INCREMENT PRIMARY KEY,
        student_id INT NOT NULL,
        language_id INT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE (student_id, language_id),
        FOREIGN KEY (student_id) REFERENCES tbl_cp_student(student_id) ON DELETE RESTRICT,
        FOREIGN KEY (language_id) REFERENCES tbl_cp_mlanguages(language_id) ON DELETE RESTRICT
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await pool.execute(`
      CREATE TABLE IF NOT EXISTS tbl_cp_m2m_std_interest (
        row_id INT AUTO_INCREMENT PRIMARY KEY,
        student_id INT NOT NULL,
        interest_id INT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE (student_id, interest_id),
        FOREIGN KEY (student_id) REFERENCES tbl_cp_student(student_id) ON DELETE RESTRICT,
        FOREIGN KEY (interest_id) REFERENCES tbl_cp_minterests(interest_id) ON DELETE RESTRICT
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await pool.execute(`
      CREATE TABLE IF NOT EXISTS tbl_cp_m2m_student_certification (
        row_id INT AUTO_INCREMENT PRIMARY KEY,
        student_id INT NOT NULL,
        certification_id INT NOT NULL,
        issue_date DATE DEFAULT '1900-01-01',
        expiry_date DATE DEFAULT '9999-12-31',
        certificate_url VARCHAR(500) DEFAULT '',
        credential_id VARCHAR(150) DEFAULT '',
        is_verified BOOLEAN NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE (student_id, certification_id),
        FOREIGN KEY (student_id) REFERENCES tbl_cp_student(student_id) ON DELETE RESTRICT,
        FOREIGN KEY (certification_id) REFERENCES tbl_cp_mcertifications(certification_id) ON DELETE RESTRICT
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await pool.execute(`
      CREATE TABLE IF NOT EXISTS tbl_cp_m2m_studentproject_skill (
        row_id INT AUTO_INCREMENT PRIMARY KEY,
        project_id INT NOT NULL,
        skill_id INT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE (project_id, skill_id),
        FOREIGN KEY (project_id) REFERENCES tbl_cp_studentprojects(project_id) ON DELETE RESTRICT,
        FOREIGN KEY (skill_id) REFERENCES tbl_cp_mskills(skill_id) ON DELETE RESTRICT
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // ========== SECTION 8: ADDRESSES ==========
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS tbl_cp_student_address (
        row_id INT AUTO_INCREMENT PRIMARY KEY,
        address_id INT NOT NULL UNIQUE,
        student_id INT NOT NULL,
        address_line_1 VARCHAR(255) NOT NULL,
        address_line_2 VARCHAR(255) DEFAULT '',
        care_of VARCHAR(255) DEFAULT '',
        landmark VARCHAR(255) DEFAULT 'No Landmark',
        pincode_id INT NOT NULL,
        latitude DECIMAL(10,8) DEFAULT 0.00000000,
        longitude DECIMAL(11,8) DEFAULT 0.00000000,
        address_type VARCHAR(50) NOT NULL DEFAULT 'current',
        address_expiry DATE DEFAULT '9999-12-31',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES tbl_cp_student(student_id) ON DELETE RESTRICT,
        FOREIGN KEY (pincode_id) REFERENCES tbl_cp_mpincodes(pincode_id) ON DELETE RESTRICT
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await pool.execute(`
      CREATE TABLE IF NOT EXISTS tbl_cp_college_address (
        row_id INT AUTO_INCREMENT PRIMARY KEY,
        address_id INT NOT NULL UNIQUE,
        college_id INT NOT NULL,
        address_line_1 VARCHAR(255) NOT NULL,
        address_line_2 VARCHAR(255) DEFAULT '',
        landmark VARCHAR(255) DEFAULT 'No Landmark',
        pincode_id INT NOT NULL,
        latitude DECIMAL(10,8) DEFAULT 0.00000000,
        longitude DECIMAL(11,8) DEFAULT 0.00000000,
        address_type VARCHAR(50) NOT NULL DEFAULT 'campus',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (college_id) REFERENCES tbl_cp_mcolleges(college_id) ON DELETE RESTRICT,
        FOREIGN KEY (pincode_id) REFERENCES tbl_cp_mpincodes(pincode_id) ON DELETE RESTRICT
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // ========== SECTION 9: COMPANY & JOB DESCRIPTION ==========
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS tbl_cp_mcompany (
        row_id INT AUTO_INCREMENT PRIMARY KEY,
        company_id INT NOT NULL UNIQUE,
        name VARCHAR(255) NOT NULL UNIQUE,
        industry VARCHAR(150) DEFAULT 'Not Specified',
        website VARCHAR(255) DEFAULT '',
        city VARCHAR(100) DEFAULT 'Not Specified',
        is_active BOOLEAN NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await pool.execute(`
      CREATE TABLE IF NOT EXISTS tbl_cp_company_address (
        row_id INT AUTO_INCREMENT PRIMARY KEY,
        address_id INT NOT NULL UNIQUE,
        company_id INT NOT NULL,
        address_line_1 VARCHAR(255) NOT NULL,
        address_line_2 VARCHAR(255) DEFAULT '',
        landmark VARCHAR(255) DEFAULT 'No Landmark',
        pincode_id INT NOT NULL,
        latitude DECIMAL(10,8) DEFAULT 0.00000000,
        longitude DECIMAL(11,8) DEFAULT 0.00000000,
        address_type VARCHAR(50) NOT NULL DEFAULT 'registered',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (company_id) REFERENCES tbl_cp_mcompany(company_id) ON DELETE RESTRICT,
        FOREIGN KEY (pincode_id) REFERENCES tbl_cp_mpincodes(pincode_id) ON DELETE RESTRICT
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await pool.execute(`
      CREATE TABLE IF NOT EXISTS tbl_cp_job_description (
        row_id INT AUTO_INCREMENT PRIMARY KEY,
        jd_id INT NOT NULL UNIQUE,
        company_id INT NOT NULL,
        job_role VARCHAR(150) NOT NULL DEFAULT 'Not Specified',
        title VARCHAR(255) NOT NULL,
        description TEXT,
        experience_min_yrs DECIMAL(4,1) DEFAULT 0.0,
        experience_max_yrs DECIMAL(4,1) DEFAULT 0.0,
        salary_min DECIMAL(12,2) DEFAULT 0.00,
        salary_max DECIMAL(12,2) DEFAULT 0.00,
        bond_months INT DEFAULT 0,
        location VARCHAR(150) DEFAULT 'Remote',
        employment_type VARCHAR(50) DEFAULT 'Full-Time',
        openings INT DEFAULT 1,
        hiring_manager_name VARCHAR(150) DEFAULT 'Not Assigned',
        hiring_manager_email VARCHAR(255) DEFAULT 'noreply@company.com',
        status VARCHAR(30) NOT NULL DEFAULT 'Open',
        CONSTRAINT chk_salary CHECK (salary_min <= salary_max),
        CONSTRAINT chk_experience CHECK (experience_min_yrs <= experience_max_yrs),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (company_id) REFERENCES tbl_cp_mcompany(company_id) ON DELETE RESTRICT
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // ========== SECTION 10: QUESTION BANK ==========
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS tbl_cp_mquestions (
        row_id INT AUTO_INCREMENT PRIMARY KEY,
        question_id INT NOT NULL UNIQUE,
        module_id INT NOT NULL,
        difficulty_id INT NOT NULL,
        question_text TEXT NOT NULL,
        question_type VARCHAR(50) NOT NULL DEFAULT 'mcq',
        correct_answer TEXT,
        max_marks DECIMAL(6,2) NOT NULL DEFAULT 1.0,
        is_active BOOLEAN NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (module_id) REFERENCES tbl_cp_mmodule(module_id) ON DELETE RESTRICT,
        FOREIGN KEY (difficulty_id) REFERENCES tbl_cp_mdifficulty(difficulty_id) ON DELETE RESTRICT
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await pool.execute(`
      CREATE TABLE IF NOT EXISTS tbl_cp_m2m_question_options (
        row_id INT AUTO_INCREMENT PRIMARY KEY,
        option_id INT NOT NULL UNIQUE,
        question_id INT NOT NULL,
        option_text TEXT NOT NULL,
        is_correct BOOLEAN NULL,
        display_order INT NOT NULL DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (question_id) REFERENCES tbl_cp_mquestions(question_id) ON DELETE RESTRICT
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // ========== SECTION 11: ROUND CONFIGURATION ==========
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS tbl_cp_jd_round_config (
        row_id INT AUTO_INCREMENT PRIMARY KEY,
        round_config_id INT NOT NULL UNIQUE,
        jd_id INT NOT NULL,
        round_number TINYINT NOT NULL,
        round_label VARCHAR(100) NOT NULL DEFAULT 'Round',
        is_exam BOOLEAN NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE (jd_id, round_number),
        UNIQUE (jd_id, round_label),
        FOREIGN KEY (jd_id) REFERENCES tbl_cp_job_description(jd_id) ON DELETE RESTRICT
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await pool.execute(`
      CREATE TABLE IF NOT EXISTS tbl_cp_m2m_jd_round_module (
        row_id INT AUTO_INCREMENT PRIMARY KEY,
        jd_round_mod_id INT NOT NULL UNIQUE,
        round_config_id INT NOT NULL,
        module_id INT NOT NULL,
        weightage DECIMAL(5,4) NOT NULL DEFAULT 0.1,
        difficulty_id INT DEFAULT NULL,
        is_mandatory BOOLEAN NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE (round_config_id, module_id),
        FOREIGN KEY (round_config_id) REFERENCES tbl_cp_jd_round_config(round_config_id) ON DELETE RESTRICT,
        FOREIGN KEY (module_id) REFERENCES tbl_cp_mmodule(module_id) ON DELETE RESTRICT,
        FOREIGN KEY (difficulty_id) REFERENCES tbl_cp_mdifficulty(difficulty_id) ON DELETE RESTRICT
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // ========== SECTION 12: RECRUITMENT DRIVE ==========
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS tbl_cp_recruitment_drive (
        row_id INT AUTO_INCREMENT PRIMARY KEY,
        drive_id INT NOT NULL UNIQUE,
        drive_name VARCHAR(255) NOT NULL,
        jd_id INT NOT NULL,
        start_date DATE DEFAULT '1900-01-01',
        end_date DATE DEFAULT '9999-12-31',
        description TEXT,
        status VARCHAR(30) NOT NULL DEFAULT 'Active',
        CONSTRAINT chk_drive_dates CHECK (start_date <= end_date),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (jd_id) REFERENCES tbl_cp_job_description(jd_id) ON DELETE RESTRICT
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await pool.execute(`
      CREATE TABLE IF NOT EXISTS tbl_cp_recruitment_drive_round (
        round_id INT AUTO_INCREMENT PRIMARY KEY,
        drive_id INT NOT NULL,
        round_number INT NOT NULL,
        round_name VARCHAR(255) NOT NULL,
        round_type ENUM('aptitude','technical_quiz','coding_test','technical_interview','hr_interview') NOT NULL,
        config_json JSON,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (drive_id) REFERENCES tbl_cp_recruitment_drive(drive_id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // ========== SECTION 13: APPLICATION ==========
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS tbl_cp_application (
        row_id INT AUTO_INCREMENT PRIMARY KEY,
        application_id INT NOT NULL UNIQUE,
        student_id INT NOT NULL,
        drive_id INT NOT NULL,
        serial_no INT NOT NULL,
        application_date DATE NOT NULL DEFAULT (CURRENT_DATE),
        status VARCHAR(50) NOT NULL DEFAULT 'Applied',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE (student_id, drive_id),
        UNIQUE (drive_id, serial_no),
        FOREIGN KEY (student_id) REFERENCES tbl_cp_student(student_id) ON DELETE RESTRICT,
        FOREIGN KEY (drive_id) REFERENCES tbl_cp_recruitment_drive(drive_id) ON DELETE RESTRICT
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await pool.execute(`
      CREATE TABLE IF NOT EXISTS tbl_cp_application_status_history (
        row_id INT AUTO_INCREMENT PRIMARY KEY,
        history_id INT NOT NULL UNIQUE,
        application_id INT NOT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'Applied',
        changed_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (application_id) REFERENCES tbl_cp_application(application_id) ON DELETE RESTRICT
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // ========== SECTION 14: EXAM SESSION ==========
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS tbl_cp_exam_session (
        row_id INT AUTO_INCREMENT PRIMARY KEY,
        exam_session_id INT NOT NULL UNIQUE,
        application_id INT NOT NULL,
        round_config_id INT NOT NULL,
        attendance_id INT NOT NULL,
        exam_date DATE DEFAULT '1900-01-01',
        exam_time TIME DEFAULT '00:00:00',
        cutoff_pct DECIMAL(5,4) DEFAULT 0.4000,
        correct_count INT DEFAULT 0,
        incorrect_count INT DEFAULT 0,
        total_questions INT DEFAULT 0,
        score_pct DECIMAL(5,4) DEFAULT 0.0000,
        CONSTRAINT chk_score_pct CHECK (score_pct >= 0 AND score_pct <= 1),
        result_id INT,
        feedback TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE (application_id, round_config_id),
        FOREIGN KEY (application_id) REFERENCES tbl_cp_application(application_id) ON DELETE RESTRICT,
        FOREIGN KEY (round_config_id) REFERENCES tbl_cp_jd_round_config(round_config_id) ON DELETE RESTRICT,
        FOREIGN KEY (attendance_id) REFERENCES tbl_cp_mattendance(attendance_id) ON DELETE RESTRICT,
        FOREIGN KEY (result_id) REFERENCES tbl_cp_mround_result(result_id) ON DELETE RESTRICT
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await pool.execute(`
      CREATE TABLE IF NOT EXISTS tbl_cp_m2m_exam_question_response (
        row_id INT AUTO_INCREMENT PRIMARY KEY,
        response_id INT NOT NULL UNIQUE,
        exam_session_id INT NOT NULL,
        question_id INT NOT NULL,
        option_id INT NULL,
        is_correct BOOLEAN NULL,
        marks_awarded DECIMAL(5,2) DEFAULT 0.00,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE (exam_session_id, question_id),
        FOREIGN KEY (exam_session_id) REFERENCES tbl_cp_exam_session(exam_session_id) ON DELETE RESTRICT,
        FOREIGN KEY (question_id) REFERENCES tbl_cp_mquestions(question_id) ON DELETE RESTRICT,
        FOREIGN KEY (option_id) REFERENCES tbl_cp_m2m_question_options(option_id) ON DELETE RESTRICT
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // ========== SECTION 15: INTERVIEW SESSION ==========
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS tbl_cp_interview_session (
        row_id INT AUTO_INCREMENT PRIMARY KEY,
        session_id INT NOT NULL UNIQUE,
        application_id INT NOT NULL,
        round_config_id INT NOT NULL,
        interviewer_id INT NULL,
        attendance_id INT NOT NULL,
        session_date DATE DEFAULT '1900-01-01',
        session_time TIME DEFAULT '00:00:00',
        bonus_marks DECIMAL(5,2) DEFAULT 0.00,
        total_score DECIMAL(6,2) DEFAULT 0.00,
        result_id INT NULL,
        comments TEXT,
        internal_feedback TEXT,
        external_feedback TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE (application_id, round_config_id),
        FOREIGN KEY (application_id) REFERENCES tbl_cp_application(application_id) ON DELETE RESTRICT,
        FOREIGN KEY (round_config_id) REFERENCES tbl_cp_jd_round_config(round_config_id) ON DELETE RESTRICT,
        FOREIGN KEY (interviewer_id) REFERENCES tbl_cp_minterviewer(interviewer_id) ON DELETE RESTRICT,
        FOREIGN KEY (attendance_id) REFERENCES tbl_cp_mattendance(attendance_id) ON DELETE RESTRICT,
        FOREIGN KEY (result_id) REFERENCES tbl_cp_mround_result(result_id) ON DELETE RESTRICT
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await pool.execute(`
      CREATE TABLE IF NOT EXISTS tbl_cp_m2m_session_module_score (
        row_id INT AUTO_INCREMENT PRIMARY KEY,
        score_id INT NOT NULL UNIQUE,
        session_id INT NOT NULL,
        module_id INT NOT NULL,
        correct_count INT DEFAULT 0,
        incorrect_count INT DEFAULT 0,
        total_questions INT DEFAULT 0,
        score_sum DECIMAL(6,2) NOT NULL DEFAULT 0.00,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE (session_id, module_id),
        FOREIGN KEY (session_id) REFERENCES tbl_cp_interview_session(session_id) ON DELETE RESTRICT,
        FOREIGN KEY (module_id) REFERENCES tbl_cp_mmodule(module_id) ON DELETE RESTRICT
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await pool.execute(`
      CREATE TABLE IF NOT EXISTS tbl_cp_m2m_session_question_response (
        row_id INT AUTO_INCREMENT PRIMARY KEY,
        response_id INT NOT NULL UNIQUE,
        session_id INT NOT NULL,
        question_id INT NOT NULL,
        is_correct BOOLEAN NULL,
        marks_awarded DECIMAL(5,2) DEFAULT 0.00,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE (session_id, question_id),
        FOREIGN KEY (session_id) REFERENCES tbl_cp_interview_session(session_id) ON DELETE RESTRICT,
        FOREIGN KEY (question_id) REFERENCES tbl_cp_mquestions(question_id) ON DELETE RESTRICT
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // ========== SECTION 16: PLACEMENTS ==========
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS tbl_cp_placements (
        placement_id INT AUTO_INCREMENT PRIMARY KEY,
        student_id INT NOT NULL,
        company_id INT NOT NULL,
        application_id INT NOT NULL,
        job_title VARCHAR(100),
        salary DECIMAL(12,2),
        placement_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES tbl_cp_student(student_id) ON DELETE RESTRICT,
        FOREIGN KEY (company_id) REFERENCES tbl_cp_mcompany(company_id) ON DELETE RESTRICT,
        FOREIGN KEY (application_id) REFERENCES tbl_cp_application(application_id) ON DELETE RESTRICT
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // ========== CREATE INDEXES ==========
    // Helper function to safely create indexes
    const createIndexSafely = async (indexName, tableName, columns) => {
      try {
        await pool.execute(`CREATE INDEX ${indexName} ON ${tableName}(${columns})`);
      } catch (err) {
        // Index already exists - ignore error
        if (!err.message.includes('Duplicate key name')) {
          throw err;
        }
      }
    };

    await createIndexSafely('idx_student_email', 'tbl_cp_student', 'email');
    await createIndexSafely('idx_student_status', 'tbl_cp_student', 'status');
    await createIndexSafely('idx_jd_company', 'tbl_cp_job_description', 'company_id');
    await createIndexSafely('idx_jd_job_role', 'tbl_cp_job_description', 'job_role');
    await createIndexSafely('idx_jd_status', 'tbl_cp_job_description', 'status');
    await createIndexSafely('idx_round_config_jd', 'tbl_cp_jd_round_config', 'jd_id');
    await createIndexSafely('idx_jrm_round_config', 'tbl_cp_m2m_jd_round_module', 'round_config_id');
    await createIndexSafely('idx_jrm_module', 'tbl_cp_m2m_jd_round_module', 'module_id');
    await createIndexSafely('idx_drive_jd', 'tbl_cp_recruitment_drive', 'jd_id');
    await createIndexSafely('idx_drive_status', 'tbl_cp_recruitment_drive', 'status');
    await createIndexSafely('idx_application_student', 'tbl_cp_application', 'student_id');
    await createIndexSafely('idx_application_drive', 'tbl_cp_application', 'drive_id');
    await createIndexSafely('idx_application_status', 'tbl_cp_application', 'status');
    await createIndexSafely('idx_status_history_app', 'tbl_cp_application_status_history', 'application_id');
    await createIndexSafely('idx_exam_result', 'tbl_cp_exam_session', 'result_id');
    await createIndexSafely('idx_exam_qr_question', 'tbl_cp_m2m_exam_question_response', 'question_id');
    await createIndexSafely('idx_session_application', 'tbl_cp_interview_session', 'application_id');
    await createIndexSafely('idx_session_round_config', 'tbl_cp_interview_session', 'round_config_id');
    await createIndexSafely('idx_session_interviewer', 'tbl_cp_interview_session', 'interviewer_id');
    await createIndexSafely('idx_session_result', 'tbl_cp_interview_session', 'result_id');
    await createIndexSafely('idx_session_date', 'tbl_cp_interview_session', 'session_date');
    await createIndexSafely('idx_sms_module', 'tbl_cp_m2m_session_module_score', 'module_id');
    await createIndexSafely('idx_sqr_question', 'tbl_cp_m2m_session_question_response', 'question_id');
    await createIndexSafely('idx_question_module', 'tbl_cp_mquestions', 'module_id');
    await createIndexSafely('idx_question_difficulty', 'tbl_cp_mquestions', 'difficulty_id');
    await createIndexSafely('idx_question_type', 'tbl_cp_mquestions', 'question_type');

    // Re-enable foreign key checks
    await pool.execute('SET FOREIGN_KEY_CHECKS = 1');

    logger.info('✅ Database initialization completed successfully for campus6 schema');
  } catch (err) {
    logger.error('❌ Database initialization error:', err.message || err);
    throw err;
  }
}

module.exports = {
  pool,
  initDb,
};
