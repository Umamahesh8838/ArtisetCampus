-- ============================================================================
-- Create databases for Flyway migrations (DEV, QA, PROD)
-- ============================================================================
-- Run this script as admin user on your Azure MySQL server
-- This creates empty databases that Flyway will populate with migrations

-- Create DEV database
CREATE DATABASE IF NOT EXISTS campus_db_dev
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

-- Create QA database
CREATE DATABASE IF NOT EXISTS campus_db_qa
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

-- Create PROD database
CREATE DATABASE IF NOT EXISTS campus_db_prod
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

-- Verify databases were created
SHOW DATABASES LIKE 'campus_db_%';

-- ============================================================================
-- Optional: Grant permissions to your database user
-- ============================================================================
-- Replace 'your_username' with your actual MySQL username
-- Replace 'your_password' with your actual MySQL password

-- GRANT ALL PRIVILEGES ON campus_db_dev.* TO 'your_username'@'%' IDENTIFIED BY 'your_password';
-- GRANT ALL PRIVILEGES ON campus_db_qa.* TO 'your_username'@'%' IDENTIFIED BY 'your_password';
-- GRANT ALL PRIVILEGES ON campus_db_prod.* TO 'your_username'@'%' IDENTIFIED BY 'your_password';
-- FLUSH PRIVILEGES;
