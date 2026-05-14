-- Migration: V4__companies_skills_changes.sql
-- Purpose: adjust country_code, handle language_id on skills, and add contact columns to company table
-- Review before applying on production. Run in a transaction if your environment supports it.

-- 1. Allow NULL for country_code in countries
ALTER TABLE tbl_cp_mcountries
  MODIFY COLUMN country_code VARCHAR(5) NULL DEFAULT NULL;

-- 2. Set default for language_id on skills (if column exists)
-- NOTE: if your schema already has language_id, this will set a default. If not, this statement will fail.
ALTER TABLE tbl_cp_mskills
  MODIFY COLUMN language_id INT DEFAULT 1;

-- 3. Drop FK and column language_id from tbl_cp_mskills (if desired)
-- WARNING: This will remove the column and any referential integrity - ensure you want to remove it.
ALTER TABLE tbl_cp_mskills
  DROP FOREIGN KEY tbl_cp_mskills_ibfk_1;

ALTER TABLE tbl_cp_mskills
  DROP COLUMN language_id;

-- 4. Add contact columns to company table
ALTER TABLE tbl_cp_mcompany
  ADD COLUMN contact_name  VARCHAR(150) DEFAULT 'Not Assigned',
  ADD COLUMN contact_phone VARCHAR(20)  DEFAULT '0000000000',
  ADD COLUMN contact_email VARCHAR(255) DEFAULT 'noreply@company.com';
