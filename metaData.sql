-- ============================================================================
-- CAMPUS6 SCHEMA METADATA TABLE
-- Contains: table_name, primary_key, foreign_keys, super_keys, section, notes
-- Total tables documented: 52
-- ============================================================================

USE Campus-DB-Dev;

-- ============================================================================
-- CREATE METADATA TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS tbl_cp_schema_metadata (
  meta_id       INT           AUTO_INCREMENT PRIMARY KEY,
  table_name    VARCHAR(150)  NOT NULL UNIQUE,
  section       VARCHAR(100)  NOT NULL,
  primary_key   VARCHAR(255)  NOT NULL,
  foreign_keys  TEXT          NOT NULL,
  super_keys    TEXT          NOT NULL,
  notes         TEXT,
  created_at    DATETIME      DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- INSERT METADATA ROWS (52 tables)
-- ============================================================================

INSERT IGNORE INTO tbl_cp_schema_metadata
  (table_name, section, primary_key, foreign_keys, super_keys, notes)
VALUES
  ('users', 'Auth & RBAC', 'id', 'NONE', 'id | email | phone', 'email and phone are UNIQUE — each can serve as a candidate key'),
  ('otp_requests', 'Auth & RBAC', 'id', 'NONE', 'id', 'No unique constraint other than PK'),
  ('tbl_cp_mroles', 'Auth & RBAC', 'role_id', 'NONE', 'role_id | role_name', 'role_name is UNIQUE — candidate key'),
  ('tbl_cp_msalutation', 'Master / Lookup', 'row_id', 'NONE', 'row_id | salutation_id | value', 'salutation_id and value are both UNIQUE'),
  ('tbl_cp_mlanguages', 'Master / Lookup', 'row_id', 'NONE', 'row_id | language_id | language_code | language_name', 'language_id, language_code, language_name all UNIQUE'),
  ('tbl_cp_minterests', 'Master / Lookup', 'row_id', 'NONE', 'row_id | interest_id | name', 'interest_id and name are UNIQUE'),
  ('tbl_cp_mcourses', 'Master / Lookup', 'row_id', 'NONE', 'row_id | course_id | (course_code, specialization_code) | (course_name, specialization_name)', 'course_id UNIQUE; composite UNIQUEs on code pair and name pair'),
  ('tbl_cp_mcolleges', 'Master / Lookup', 'row_id', 'NONE', 'row_id | college_id | college_name', 'college_id and college_name are UNIQUE'),
  ('tbl_cp_mcertifications', 'Master / Lookup', 'row_id', 'NONE', 'row_id | certification_id | certification_code | (certification_name, issuing_organization)', 'certification_id and certification_code UNIQUE; composite UNIQUE on name+org'),
  ('tbl_cp_mskills', 'Master / Lookup', 'row_id', 'NONE (language_id FK removed by ALTER in schema)', 'row_id | skill_id | name', 'language_id FK dropped by ALTER at end of schema; skill_id and name UNIQUE'),
  ('tbl_cp_mmodule', 'Master / Lookup', 'row_id', 'NONE', 'row_id | module_id | module_name | module_code', 'module_id, module_name, module_code all UNIQUE'),
  ('tbl_cp_mdifficulty', 'Master / Lookup', 'row_id', 'NONE', 'row_id | difficulty_id | level_code', 'difficulty_id and level_code are UNIQUE'),
  ('tbl_cp_mround_result', 'Master / Lookup', 'row_id', 'NONE', 'row_id | result_id | label', 'result_id and label are UNIQUE'),
  ('tbl_cp_mattendance', 'Master / Lookup', 'row_id', 'NONE', 'row_id | attendance_id | code', 'attendance_id and code are UNIQUE'),
  ('tbl_cp_minterviewer', 'Master / Lookup', 'row_id', 'NONE', 'row_id | interviewer_id', 'interviewer_id is UNIQUE'),
  ('tbl_cp_mcountries', 'Geography', 'row_id', 'NONE', 'row_id | country_id | country_name', 'country_id and country_name are UNIQUE'),
  ('tbl_cp_mstates', 'Geography', 'row_id', 'country_id REFERENCES tbl_cp_mcountries(country_id)', 'row_id | state_id | (state_name, country_id)', 'state_id UNIQUE; composite UNIQUE on state_name+country_id'),
  ('tbl_cp_mcities', 'Geography', 'row_id', 'state_id REFERENCES tbl_cp_mstates(state_id)', 'row_id | city_id | (city_name, state_id)', 'city_id UNIQUE; composite UNIQUE on city_name+state_id'),
  ('tbl_cp_mpincodes', 'Geography', 'row_id', 'city_id REFERENCES tbl_cp_mcities(city_id)', 'row_id | pincode_id | pincode', 'pincode_id and pincode are UNIQUE'),
  ('tbl_cp_student', 'Student Core', 'row_id', 'student_id REFERENCES users(id); salutation_id REFERENCES tbl_cp_msalutation(salutation_id)', 'row_id | student_id | email | contact_number', 'student_id, email, contact_number all UNIQUE'),
  ('tbl_cp_student_school', 'Student Education', 'row_id', 'student_id REFERENCES tbl_cp_student(student_id)', 'row_id | school_id', 'school_id is UNIQUE'),
  ('tbl_cp_student_education', 'Student Education', 'row_id', 'student_id REFERENCES tbl_cp_student(student_id); college_id REFERENCES tbl_cp_mcolleges(college_id); course_id REFERENCES tbl_cp_mcourses(course_id)', 'row_id | edu_id', 'edu_id is UNIQUE'),
  ('tbl_cp_msemester', 'Student Education', 'row_id', 'course_id REFERENCES tbl_cp_mcourses(course_id)', 'row_id | semester_id | (course_id, semester_number)', 'semester_id UNIQUE; composite UNIQUE on course_id+semester_number'),
  ('tbl_cp_msubjects', 'Student Education', 'row_id', 'NONE', 'row_id | subject_id | subject_code', 'subject_id and subject_code are UNIQUE'),
  ('tbl_cp_college_sem_subject', 'Student Education', 'row_id', 'college_id REFERENCES tbl_cp_mcolleges(college_id); semester_id REFERENCES tbl_cp_msemester(semester_id); subject_id REFERENCES tbl_cp_msubjects(subject_id)', 'row_id | college_sem_subject_id | (college_id, semester_id, subject_id)', 'college_sem_subject_id UNIQUE; composite UNIQUE on college+semester+subject'),
  ('tbl_cp_student_subject_marks', 'Student Education', 'row_id', 'student_id REFERENCES tbl_cp_student(student_id); college_sem_subject_id REFERENCES tbl_cp_college_sem_subject(college_sem_subject_id)', 'row_id | (student_id, college_sem_subject_id, evaluation_type)', 'composite UNIQUE on student+subject+evaluation_type'),
  ('tbl_cp_student_workexp', 'Work & Projects', 'row_id', 'student_id REFERENCES tbl_cp_student(student_id)', 'row_id | workexp_id', 'workexp_id is UNIQUE'),
  ('tbl_cp_studentprojects', 'Work & Projects', 'row_id', 'student_id REFERENCES tbl_cp_student(student_id); workexp_id REFERENCES tbl_cp_student_workexp(workexp_id)', 'row_id | project_id', 'project_id is UNIQUE'),
  ('tbl_cp_m2m_std_skill', 'Student M2M', 'row_id', 'student_id REFERENCES tbl_cp_student(student_id); skill_id REFERENCES tbl_cp_mskills(skill_id)', 'row_id | (student_id, skill_id)', 'composite UNIQUE on student_id+skill_id'),
  ('tbl_cp_m2m_std_lng', 'Student M2M', 'row_id', 'student_id REFERENCES tbl_cp_student(student_id); language_id REFERENCES tbl_cp_mlanguages(language_id)', 'row_id | (student_id, language_id)', 'composite UNIQUE on student_id+language_id'),
  ('tbl_cp_m2m_std_interest', 'Student M2M', 'row_id', 'student_id REFERENCES tbl_cp_student(student_id); interest_id REFERENCES tbl_cp_minterests(interest_id)', 'row_id | (student_id, interest_id)', 'composite UNIQUE on student_id+interest_id'),
  ('tbl_cp_m2m_student_certification', 'Student M2M', 'row_id', 'student_id REFERENCES tbl_cp_student(student_id); certification_id REFERENCES tbl_cp_mcertifications(certification_id)', 'row_id | (student_id, certification_id)', 'composite UNIQUE on student_id+certification_id'),
  ('tbl_cp_m2m_studentproject_skill', 'Student M2M', 'row_id', 'project_id REFERENCES tbl_cp_studentprojects(project_id); skill_id REFERENCES tbl_cp_mskills(skill_id)', 'row_id | (project_id, skill_id)', 'composite UNIQUE on project_id+skill_id'),
  ('tbl_cp_student_address', 'Addresses', 'row_id', 'student_id REFERENCES tbl_cp_student(student_id); pincode_id REFERENCES tbl_cp_mpincodes(pincode_id)', 'row_id | address_id', 'address_id is UNIQUE'),
  ('tbl_cp_college_address', 'Addresses', 'row_id', 'college_id REFERENCES tbl_cp_mcolleges(college_id); pincode_id REFERENCES tbl_cp_mpincodes(pincode_id)', 'row_id | address_id', 'address_id is UNIQUE'),
  ('tbl_cp_mcompany', 'Company & JD', 'row_id', 'NONE', 'row_id | company_id | name', 'company_id and name are UNIQUE; contact columns added by ALTER'),
  ('tbl_cp_company_address', 'Company & JD', 'row_id', 'company_id REFERENCES tbl_cp_mcompany(company_id); pincode_id REFERENCES tbl_cp_mpincodes(pincode_id)', 'row_id | address_id', 'address_id is UNIQUE'),
  ('tbl_cp_job_description', 'Company & JD', 'row_id', 'company_id REFERENCES tbl_cp_mcompany(company_id)', 'row_id | jd_id', 'jd_id is UNIQUE; CHECK constraints on salary and experience ranges'),
  ('tbl_cp_mquestions', 'Question Bank', 'row_id', 'module_id REFERENCES tbl_cp_mmodule(module_id); difficulty_id REFERENCES tbl_cp_mdifficulty(difficulty_id)', 'row_id | question_id', 'question_id is UNIQUE'),
  ('tbl_cp_m2m_question_options', 'Question Bank', 'row_id', 'question_id REFERENCES tbl_cp_mquestions(question_id)', 'row_id | option_id', 'option_id is UNIQUE'),
  ('tbl_cp_jd_round_config', 'Round Config', 'row_id', 'jd_id REFERENCES tbl_cp_job_description(jd_id)', 'row_id | round_config_id | (jd_id, round_number) | (jd_id, round_label)', 'round_config_id UNIQUE; composite UNIQUEs on jd+round_number and jd+round_label'),
  ('tbl_cp_m2m_jd_round_module', 'Round Config', 'row_id', 'round_config_id REFERENCES tbl_cp_jd_round_config(round_config_id); module_id REFERENCES tbl_cp_mmodule(module_id); difficulty_id REFERENCES tbl_cp_mdifficulty(difficulty_id)', 'row_id | jd_round_mod_id | (round_config_id, module_id)', 'jd_round_mod_id UNIQUE; composite UNIQUE on round_config+module'),
  ('tbl_cp_recruitment_drive', 'Recruitment Drive', 'row_id', 'jd_id REFERENCES tbl_cp_job_description(jd_id)', 'row_id | drive_id', 'drive_id is UNIQUE; CHECK constraint on start_date <= end_date'),
  ('tbl_cp_recruitment_drive_round', 'Recruitment Drive', 'round_id', 'drive_id REFERENCES tbl_cp_recruitment_drive(drive_id)', 'round_id', 'PK is round_id (AUTO_INCREMENT); no additional UNIQUE constraints'),
  ('tbl_cp_application', 'Application', 'row_id', 'student_id REFERENCES tbl_cp_student(student_id); drive_id REFERENCES tbl_cp_recruitment_drive(drive_id)', 'row_id | application_id | (student_id, drive_id) | (drive_id, serial_no)', 'application_id UNIQUE; composite UNIQUEs on student+drive and drive+serial_no'),
  ('tbl_cp_application_status_history', 'Application', 'row_id', 'application_id REFERENCES tbl_cp_application(application_id)', 'row_id | history_id', 'history_id is UNIQUE; full audit trail of status changes'),
  ('tbl_cp_exam_session', 'Exam Session', 'row_id', 'application_id REFERENCES tbl_cp_application(application_id); round_config_id REFERENCES tbl_cp_jd_round_config(round_config_id); attendance_id REFERENCES tbl_cp_mattendance(attendance_id); result_id REFERENCES tbl_cp_mround_result(result_id)', 'row_id | exam_session_id | (application_id, round_config_id)', 'exam_session_id UNIQUE; composite UNIQUE on application+round_config; CHECK on score_pct 0-1'),
  ('tbl_cp_m2m_exam_question_response', 'Exam Session', 'row_id', 'exam_session_id REFERENCES tbl_cp_exam_session(exam_session_id); question_id REFERENCES tbl_cp_mquestions(question_id); option_id REFERENCES tbl_cp_m2m_question_options(option_id)', 'row_id | response_id | (exam_session_id, question_id)', 'response_id UNIQUE; composite UNIQUE on session+question'),
  ('tbl_cp_interview_session', 'Interview Session', 'row_id', 'application_id REFERENCES tbl_cp_application(application_id); round_config_id REFERENCES tbl_cp_jd_round_config(round_config_id); interviewer_id REFERENCES tbl_cp_minterviewer(interviewer_id); attendance_id REFERENCES tbl_cp_mattendance(attendance_id); result_id REFERENCES tbl_cp_mround_result(result_id)', 'row_id | session_id | (application_id, round_config_id)', 'session_id UNIQUE; composite UNIQUE on application+round_config'),
  ('tbl_cp_m2m_session_module_score', 'Interview Session', 'row_id', 'session_id REFERENCES tbl_cp_interview_session(session_id); module_id REFERENCES tbl_cp_mmodule(module_id)', 'row_id | score_id | (session_id, module_id)', 'score_id UNIQUE; composite UNIQUE on session+module'),
  ('tbl_cp_m2m_session_question_response', 'Interview Session', 'row_id', 'session_id REFERENCES tbl_cp_interview_session(session_id); question_id REFERENCES tbl_cp_mquestions(question_id)', 'row_id | response_id | (session_id, question_id)', 'response_id UNIQUE; composite UNIQUE on session+question'),
  ('tbl_cp_placements', 'Placements', 'placement_id', 'student_id REFERENCES tbl_cp_student(student_id); company_id REFERENCES tbl_cp_mcompany(company_id); application_id REFERENCES tbl_cp_application(application_id)', 'placement_id', 'PK is placement_id; no additional UNIQUE constraints defined');

-- ============================================================================
-- USEFUL QUERIES
-- ============================================================================

-- View all metadata
-- SELECT * FROM tbl_cp_schema_metadata ORDER BY section, table_name;

-- Find all tables that have a FK to a specific table
-- SELECT table_name, foreign_keys FROM tbl_cp_schema_metadata
-- WHERE foreign_keys LIKE '%tbl_cp_student%';

-- Find all tables with composite super keys
-- SELECT table_name, super_keys FROM tbl_cp_schema_metadata
-- WHERE super_keys LIKE '%(%)%';

-- View by section
-- SELECT table_name, primary_key, super_keys FROM tbl_cp_schema_metadata
-- WHERE section = 'Student M2M';

-- ============================================================================