const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'test',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

const logger = require('../utils/logger');

async function initDb() {
  // Create otp_requests table if it doesn't exist (identifier + type)
  const createOtpTableSql = `
    CREATE TABLE IF NOT EXISTS otp_requests (
      id INT AUTO_INCREMENT PRIMARY KEY,
      identifier VARCHAR(255),
      type ENUM('email','phone'),
      otp_code VARCHAR(255),
      expires_at DATETIME,
      is_verified BOOLEAN DEFAULT FALSE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `;

  // Create users table if it doesn't exist
  const createUsersTableSql = `
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(255) UNIQUE,
      phone VARCHAR(20) UNIQUE,
      first_name VARCHAR(100),
      last_name VARCHAR(100),
      is_email_verified BOOLEAN DEFAULT FALSE,
      is_phone_verified BOOLEAN DEFAULT FALSE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `;

  await pool.execute(createOtpTableSql);
  await pool.execute(createUsersTableSql);

  // Migration: if otp_requests exists but uses old schema (email column), migrate to new schema
  try {
    const dbName = process.env.DB_NAME || 'test';
    const [identifierCols] = await pool.execute(
      `SELECT COUNT(*) as cnt FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'otp_requests' AND COLUMN_NAME = 'identifier'`,
      [dbName]
    );

    if (identifierCols && identifierCols[0] && identifierCols[0].cnt === 0) {
      // add identifier and type columns
      await pool.execute("ALTER TABLE otp_requests ADD COLUMN identifier VARCHAR(255) NULL AFTER id");
      await pool.execute("ALTER TABLE otp_requests ADD COLUMN `type` ENUM('email','phone') NOT NULL DEFAULT 'email' AFTER identifier");

      // If there's an `email` column, copy it into identifier and mark type=email, then drop email
      const [emailCols] = await pool.execute(
        `SELECT COUNT(*) as cnt FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'otp_requests' AND COLUMN_NAME = 'email'`,
        [dbName]
      );
      if (emailCols && emailCols[0] && emailCols[0].cnt > 0) {
        await pool.execute("UPDATE otp_requests SET identifier = email, `type` = 'email' WHERE identifier IS NULL");
        await pool.execute("ALTER TABLE otp_requests DROP COLUMN email");
      }

      // If there's a `phone` column, copy it into identifier and mark type=phone, then drop phone
      const [phoneCols] = await pool.execute(
        `SELECT COUNT(*) as cnt FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'otp_requests' AND COLUMN_NAME = 'phone'`,
        [dbName]
      );
      if (phoneCols && phoneCols[0] && phoneCols[0].cnt > 0) {
        await pool.execute("UPDATE otp_requests SET identifier = phone, `type` = 'phone' WHERE identifier IS NULL");
        await pool.execute("ALTER TABLE otp_requests DROP COLUMN phone");
      }
    }
  } catch (err) {
    // Migration errors shouldn't stop the app; just log
    logger.warn('OTP migration warning:', err.message || err);
  }

  // Migration: ensure users table has a password column
  try {
    const dbName = process.env.DB_NAME || 'test';
    const [pwdCols] = await pool.execute(
      `SELECT COUNT(*) as cnt FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users' AND COLUMN_NAME = 'password'`,
      [dbName]
    );
    if (pwdCols && pwdCols[0] && pwdCols[0].cnt === 0) {
      await pool.execute("ALTER TABLE users ADD COLUMN password VARCHAR(255) NULL AFTER phone");
    }

    // Add registration draft columns
    const [draftCols] = await pool.execute(
      `SELECT COUNT(*) as cnt FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users' AND COLUMN_NAME = 'registration_draft'`,
      [dbName]
    );
    if (draftCols && draftCols[0] && draftCols[0].cnt === 0) {
      await pool.execute("ALTER TABLE users ADD COLUMN registration_draft JSON NULL AFTER last_name");
      await pool.execute("ALTER TABLE users ADD COLUMN registration_step VARCHAR(50) DEFAULT 'basic' AFTER registration_draft");
      await pool.execute("ALTER TABLE users ADD COLUMN is_registration_complete BOOLEAN DEFAULT FALSE AFTER registration_step");
    }
  } catch (err) {
    logger.warn('Users migration warning:', err.message || err);
  }

  // Migration: Add updated_at to users table if it doesn't exist
  try {
    const dbName = process.env.DB_NAME || 'test';
    const [updatedAtCols] = await pool.execute(
      `SELECT COUNT(*) as cnt FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users' AND COLUMN_NAME = 'updated_at'`,
      [dbName]
    );

    if (!updatedAtCols || updatedAtCols[0].cnt === 0) {
      logger.info('Adding updated_at column to users table...');
      await pool.execute("ALTER TABLE users ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER created_at");
    }
  } catch (err) {
    logger.warn('Users updated_at migration warning:', err.message || err);
  }

  // Migration 002: Recruitment, RBAC, and full campus platform schema
  await runMigration002();
}

async function runMigration002() {
  try {
    const dbName = process.env.DB_NAME || 'test';
    logger.info('Running Migration 002: Recruitment & Campus Platform Schema');

    // Check if RBAC has been applied
    const [roleCols] = await pool.execute(
      `SELECT COUNT(*) as cnt FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users' AND COLUMN_NAME = 'role'`,
      [dbName]
    );

    if (roleCols && roleCols[0] && roleCols[0].cnt === 0) {
      logger.info('Applying RBAC columns to users table...');
      await pool.execute("ALTER TABLE users ADD COLUMN role ENUM('student', 'tpo', 'recruiter', 'admin') DEFAULT 'student' AFTER is_registration_complete");
      await pool.execute("ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT 1 AFTER role");
      await pool.execute("ALTER TABLE users ADD KEY idx_role (role)");
      await pool.execute("ALTER TABLE users ADD KEY idx_is_active (is_active)");
    }

    // Check if mroles table exists
    const [rolesTable] = await pool.execute(
      `SELECT COUNT(*) as cnt FROM information_schema.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'tbl_cp_mroles'`,
      [dbName]
    );

    if (!rolesTable || rolesTable[0].cnt === 0) {
      logger.info('Creating RBAC roles table...');
      const createRolesTableSql = `
        CREATE TABLE tbl_cp_mroles (
          role_id INT PRIMARY KEY,
          role_name VARCHAR(50) NOT NULL UNIQUE,
          description VARCHAR(255),
          permissions JSON,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          KEY idx_role_name (role_name)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `;
      await pool.execute(createRolesTableSql);

      logger.info('Inserting default roles...');
      const insertRolesSql = `
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
      `;
      await pool.execute(insertRolesSql);
    }

    // Create company table if it doesn't exist
    const [companyTable] = await pool.execute(
      `SELECT COUNT(*) as cnt FROM information_schema.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'tbl_cp_mcompany'`,
      [dbName]
    );

    if (!companyTable || companyTable[0].cnt === 0) {
      logger.info('Creating company management tables...');
      const createCompanyTableSql = `
        CREATE TABLE tbl_cp_mcompany (
          company_id INT PRIMARY KEY AUTO_INCREMENT,
          company_name VARCHAR(255) NOT NULL,
          headquarters VARCHAR(255),
          industry VARCHAR(100),
          company_size INT,
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
      `;
      await pool.execute(createCompanyTableSql);
    }

    // Create recruitment_drive table if it doesn't exist
    const [driveTable] = await pool.execute(
      `SELECT COUNT(*) as cnt FROM information_schema.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'tbl_cp_recruitment_drive'`,
      [dbName]
    );

    if (!driveTable || driveTable[0].cnt === 0) {
      logger.info('Creating recruitment drive tables...');
      const createDriveTableSql = `
        CREATE TABLE tbl_cp_recruitment_drive (
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
      `;
      await pool.execute(createDriveTableSql);
    }

    // Create job_description table if it doesn't exist
    const [jdTable] = await pool.execute(
      `SELECT COUNT(*) as cnt FROM information_schema.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'tbl_cp_job_description'`,
      [dbName]
    );

    if (!jdTable || jdTable[0].cnt === 0) {
      logger.info('Creating job description tables...');
      const createJdTableSql = `
        CREATE TABLE tbl_cp_job_description (
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
          ctc_breakup JSON,
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
      `;
      await pool.execute(createJdTableSql);
    }

    // Create application table if it doesn't exist
    const [appTable] = await pool.execute(
      `SELECT COUNT(*) as cnt FROM information_schema.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'tbl_cp_application'`,
      [dbName]
    );

    if (!appTable || appTable[0].cnt === 0) {
      logger.info('Creating application tables...');
      const createAppTableSql = `
        CREATE TABLE tbl_cp_application (
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
      `;
      await pool.execute(createAppTableSql);
    }

    logger.info('Migration 002 completed successfully');
  } catch (err) {
    logger.error('Migration 002 error:', err.message || err);
    // Don't throw; let the app continue
  }
}

module.exports = {
  pool,
  initDb,
  runMigration002,
};
