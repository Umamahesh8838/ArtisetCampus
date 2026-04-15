-- ==============================================================================
-- AUTHENTICATION & REGISTRATION TABLES FOR CAMPUS5
-- Run this script in your Azure MySQL Portal to initialize the auth schemas
-- ==============================================================================

USE campus5;

-- 1. Create OTP Requests Table
-- Used for handling email and phone verification flows
CREATE TABLE IF NOT EXISTS otp_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  identifier VARCHAR(255) NOT NULL,
  type ENUM('email', 'phone') NOT NULL DEFAULT 'email',
  otp_code VARCHAR(255) NOT NULL,
  expires_at DATETIME NOT NULL,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create Users Table
-- Central authentication table handling login, passwords, and draft state
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE,
  phone VARCHAR(20) UNIQUE,
  password VARCHAR(255) NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  registration_draft JSON NULL,
  registration_step VARCHAR(50) DEFAULT 'basic',
  is_registration_complete BOOLEAN DEFAULT FALSE,
  is_email_verified BOOLEAN DEFAULT FALSE,
  is_phone_verified BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
