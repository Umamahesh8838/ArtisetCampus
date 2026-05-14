-- ============================================================================
-- ARTISET CAMPUS PLATFORM - DATABASE SANITY TEST CASES
-- ============================================================================
-- Purpose : Verify every table is accessible and every column is selectable.
-- Pattern : For each table →
--             1. COUNT(*)              → table is reachable, returns a row count
--             2. SELECT <col>          → each column is individually selectable
-- No INSERT / UPDATE / DELETE — read-only sanity checks only.
-- ============================================================================


-- ============================================================================
-- [1] users
-- ============================================================================
SELECT COUNT(*) AS total_users FROM users;

SELECT id            FROM users;
SELECT email         FROM users;
SELECT phone         FROM users;
SELECT password      FROM users;
SELECT first_name    FROM users;
SELECT last_name     FROM users;
SELECT registration_draft    FROM users;
SELECT registration_step     FROM users;
SELECT is_registration_complete FROM users;
SELECT role          FROM users;
SELECT is_email_verified FROM users;
SELECT is_phone_verified FROM users;
SELECT is_active     FROM users;
SELECT created_at    FROM users;
SELECT updated_at    FROM users;


-- ============================================================================
-- [2] otp_requests
-- ============================================================================
SELECT COUNT(*) AS total_otp_requests FROM otp_requests;

SELECT id          FROM otp_requests;
SELECT identifier  FROM otp_requests;
SELECT type        FROM otp_requests;
SELECT otp_code    FROM otp_requests;
SELECT expires_at  FROM otp_requests;
SELECT is_verified FROM otp_requests;
SELECT created_at  FROM otp_requests;


-- ============================================================================
-- [3] tbl_cp_mroles
-- ============================================================================
SELECT COUNT(*) AS total_roles FROM tbl_cp_mroles;

SELECT role_id     FROM tbl_cp_mroles;
SELECT role_name   FROM tbl_cp_mroles;
SELECT description FROM tbl_cp_mroles;
SELECT permissions FROM tbl_cp_mroles;
SELECT created_at  FROM tbl_cp_mroles;
SELECT updated_at  FROM tbl_cp_mroles;


-- ============================================================================
-- [4] tbl_cp_msalutation
-- ============================================================================
SELECT COUNT(*) AS total_salutations FROM tbl_cp_msalutation;

SELECT row_id        FROM tbl_cp_msalutation;
SELECT salutation_id FROM tbl_cp_msalutation;
SELECT value         FROM tbl_cp_msalutation;
SELECT description   FROM tbl_cp_msalutation;
SELECT created_at    FROM tbl_cp_msalutation;
SELECT updated_at    FROM tbl_cp_msalutation;


-- ============================================================================
-- [5] tbl_cp_mlanguages
-- ============================================================================
SELECT COUNT(*) AS total_languages FROM tbl_cp_mlanguages;

SELECT row_id        FROM tbl_cp_mlanguages;
SELECT language_id   FROM tbl_cp_mlanguages;
SELECT language_code FROM tbl_cp_mlanguages;
SELECT language_name FROM tbl_cp_mlanguages;
SELECT created_at    FROM tbl_cp_mlanguages;
SELECT updated_at    FROM tbl_cp_mlanguages;


-- ============================================================================
-- [6] tbl_cp_minterests
-- ============================================================================
SELECT COUNT(*) AS total_interests FROM tbl_cp_minterests;

SELECT row_id      FROM tbl_cp_minterests;
SELECT interest_id FROM tbl_cp_minterests;
SELECT name        FROM tbl_cp_minterests;
SELECT created_at  FROM tbl_cp_minterests;
SELECT updated_at  FROM tbl_cp_minterests;


-- ============================================================================
-- [7] tbl_cp_mcourses
-- ============================================================================
SELECT COUNT(*) AS total_courses FROM tbl_cp_mcourses;

SELECT row_id              FROM tbl_cp_mcourses;
SELECT course_id           FROM tbl_cp_mcourses;
SELECT course_name         FROM tbl_cp_mcourses;
SELECT course_code         FROM tbl_cp_mcourses;
SELECT specialization_name FROM tbl_cp_mcourses;
SELECT specialization_code FROM tbl_cp_mcourses;
SELECT created_at          FROM tbl_cp_mcourses;
SELECT updated_at          FROM tbl_cp_mcourses;


-- ============================================================================
-- [8] tbl_cp_mcolleges
-- ============================================================================
SELECT COUNT(*) AS total_colleges FROM tbl_cp_mcolleges;

SELECT row_id                    FROM tbl_cp_mcolleges;
SELECT college_id                FROM tbl_cp_mcolleges;
SELECT college_name              FROM tbl_cp_mcolleges;
SELECT spoc_name                 FROM tbl_cp_mcolleges;
SELECT spoc_phone                FROM tbl_cp_mcolleges;
SELECT spoc_email                FROM tbl_cp_mcolleges;
SELECT tpo_name                  FROM tbl_cp_mcolleges;
SELECT tpo_phone                 FROM tbl_cp_mcolleges;
SELECT tpo_email                 FROM tbl_cp_mcolleges;
SELECT student_coordinator_name  FROM tbl_cp_mcolleges;
SELECT student_coordinator_phone FROM tbl_cp_mcolleges;
SELECT student_coordinator_email FROM tbl_cp_mcolleges;
SELECT reference_details         FROM tbl_cp_mcolleges;
SELECT priority                  FROM tbl_cp_mcolleges;
SELECT created_at                FROM tbl_cp_mcolleges;
SELECT updated_at                FROM tbl_cp_mcolleges;


-- ============================================================================
-- [9] tbl_cp_mcertifications
-- ============================================================================
SELECT COUNT(*) AS total_certifications FROM tbl_cp_mcertifications;

SELECT row_id                FROM tbl_cp_mcertifications;
SELECT certification_id      FROM tbl_cp_mcertifications;
SELECT certification_name    FROM tbl_cp_mcertifications;
SELECT certification_code    FROM tbl_cp_mcertifications;
SELECT issuing_organization  FROM tbl_cp_mcertifications;
SELECT certification_type    FROM tbl_cp_mcertifications;
SELECT mode                  FROM tbl_cp_mcertifications;
SELECT validity_period_value FROM tbl_cp_mcertifications;
SELECT validity_period_unit  FROM tbl_cp_mcertifications;
SELECT is_lifetime           FROM tbl_cp_mcertifications;
SELECT created_at            FROM tbl_cp_mcertifications;
SELECT updated_at            FROM tbl_cp_mcertifications;


-- ============================================================================
-- [10] tbl_cp_mskills
-- ============================================================================
SELECT COUNT(*) AS total_skills FROM tbl_cp_mskills;

SELECT row_id      FROM tbl_cp_mskills;
SELECT skill_id    FROM tbl_cp_mskills;
SELECT name        FROM tbl_cp_mskills;
SELECT description FROM tbl_cp_mskills;
SELECT language_id FROM tbl_cp_mskills;
SELECT version     FROM tbl_cp_mskills;
SELECT complexity  FROM tbl_cp_mskills;
SELECT status      FROM tbl_cp_mskills;
SELECT created_at  FROM tbl_cp_mskills;
SELECT updated_at  FROM tbl_cp_mskills;


-- ============================================================================
-- [11] tbl_cp_mmodule
-- ============================================================================
SELECT COUNT(*) AS total_modules FROM tbl_cp_mmodule;

SELECT row_id        FROM tbl_cp_mmodule;
SELECT module_id     FROM tbl_cp_mmodule;
SELECT module_name   FROM tbl_cp_mmodule;
SELECT module_code   FROM tbl_cp_mmodule;
SELECT description   FROM tbl_cp_mmodule;
SELECT has_questions FROM tbl_cp_mmodule;
SELECT created_at    FROM tbl_cp_mmodule;
SELECT updated_at    FROM tbl_cp_mmodule;


-- ============================================================================
-- [12] tbl_cp_mdifficulty
-- ============================================================================
SELECT COUNT(*) AS total_difficulty_levels FROM tbl_cp_mdifficulty;

SELECT row_id        FROM tbl_cp_mdifficulty;
SELECT difficulty_id FROM tbl_cp_mdifficulty;
SELECT level_code    FROM tbl_cp_mdifficulty;
SELECT level_label   FROM tbl_cp_mdifficulty;
SELECT score_weight  FROM tbl_cp_mdifficulty;
SELECT created_at    FROM tbl_cp_mdifficulty;
SELECT updated_at    FROM tbl_cp_mdifficulty;


-- ============================================================================
-- [13] tbl_cp_mround_result
-- ============================================================================
SELECT COUNT(*) AS total_round_results FROM tbl_cp_mround_result;

SELECT row_id     FROM tbl_cp_mround_result;
SELECT result_id  FROM tbl_cp_mround_result;
SELECT label      FROM tbl_cp_mround_result;
SELECT created_at FROM tbl_cp_mround_result;
SELECT updated_at FROM tbl_cp_mround_result;


-- ============================================================================
-- [14] tbl_cp_mattendance
-- ============================================================================
SELECT COUNT(*) AS total_attendance_codes FROM tbl_cp_mattendance;

SELECT row_id        FROM tbl_cp_mattendance;
SELECT attendance_id FROM tbl_cp_mattendance;
SELECT code          FROM tbl_cp_mattendance;
SELECT label         FROM tbl_cp_mattendance;
SELECT created_at    FROM tbl_cp_mattendance;
SELECT updated_at    FROM tbl_cp_mattendance;


-- ============================================================================
-- [15] tbl_cp_minterviewer
-- ============================================================================
SELECT COUNT(*) AS total_interviewers FROM tbl_cp_minterviewer;

SELECT row_id         FROM tbl_cp_minterviewer;
SELECT interviewer_id FROM tbl_cp_minterviewer;
SELECT name           FROM tbl_cp_minterviewer;
SELECT email          FROM tbl_cp_minterviewer;
SELECT phone          FROM tbl_cp_minterviewer;
SELECT is_internal    FROM tbl_cp_minterviewer;
SELECT company        FROM tbl_cp_minterviewer;
SELECT designation    FROM tbl_cp_minterviewer;
SELECT is_active      FROM tbl_cp_minterviewer;
SELECT created_at     FROM tbl_cp_minterviewer;
SELECT updated_at     FROM tbl_cp_minterviewer;


-- ============================================================================
-- [16] tbl_cp_mcountries
-- ============================================================================
SELECT COUNT(*) AS total_countries FROM tbl_cp_mcountries;

SELECT row_id       FROM tbl_cp_mcountries;
SELECT country_id   FROM tbl_cp_mcountries;
SELECT country_name FROM tbl_cp_mcountries;
SELECT country_code FROM tbl_cp_mcountries;
SELECT created_at   FROM tbl_cp_mcountries;
SELECT updated_at   FROM tbl_cp_mcountries;


-- ============================================================================
-- [17] tbl_cp_mstates
-- ============================================================================
SELECT COUNT(*) AS total_states FROM tbl_cp_mstates;

SELECT row_id      FROM tbl_cp_mstates;
SELECT state_id    FROM tbl_cp_mstates;
SELECT state_name  FROM tbl_cp_mstates;
SELECT state_code  FROM tbl_cp_mstates;
SELECT country_id  FROM tbl_cp_mstates;
SELECT created_at  FROM tbl_cp_mstates;
SELECT updated_at  FROM tbl_cp_mstates;


-- ============================================================================
-- [18] tbl_cp_mcities
-- ============================================================================
SELECT COUNT(*) AS total_cities FROM tbl_cp_mcities;

SELECT row_id     FROM tbl_cp_mcities;
SELECT city_id    FROM tbl_cp_mcities;
SELECT city_name  FROM tbl_cp_mcities;
SELECT state_id   FROM tbl_cp_mcities;
SELECT created_at FROM tbl_cp_mcities;
SELECT updated_at FROM tbl_cp_mcities;


-- ============================================================================
-- [19] tbl_cp_mpincodes
-- ============================================================================
SELECT COUNT(*) AS total_pincodes FROM tbl_cp_mpincodes;

SELECT row_id     FROM tbl_cp_mpincodes;
SELECT pincode_id FROM tbl_cp_mpincodes;
SELECT pincode    FROM tbl_cp_mpincodes;
SELECT city_id    FROM tbl_cp_mpincodes;
SELECT area_name  FROM tbl_cp_mpincodes;
SELECT created_at FROM tbl_cp_mpincodes;
SELECT updated_at FROM tbl_cp_mpincodes;


-- ============================================================================
-- [20] tbl_cp_student
-- ============================================================================
SELECT COUNT(*) AS total_students FROM tbl_cp_student;

SELECT row_id             FROM tbl_cp_student;
SELECT student_id         FROM tbl_cp_student;
SELECT salutation_id      FROM tbl_cp_student;
SELECT first_name         FROM tbl_cp_student;
SELECT middle_name        FROM tbl_cp_student;
SELECT last_name          FROM tbl_cp_student;
SELECT email              FROM tbl_cp_student;
SELECT alt_email          FROM tbl_cp_student;
SELECT contact_number     FROM tbl_cp_student;
SELECT alt_contact_number FROM tbl_cp_student;
SELECT linkedin_url       FROM tbl_cp_student;
SELECT github_url         FROM tbl_cp_student;
SELECT portfolio_url      FROM tbl_cp_student;
SELECT resume_url         FROM tbl_cp_student;
SELECT profile_photo_url  FROM tbl_cp_student;
SELECT date_of_birth      FROM tbl_cp_student;
SELECT current_city       FROM tbl_cp_student;
SELECT gender             FROM tbl_cp_student;
SELECT user_type          FROM tbl_cp_student;
SELECT is_active          FROM tbl_cp_student;
SELECT status             FROM tbl_cp_student;
SELECT created_at         FROM tbl_cp_student;
SELECT updated_at         FROM tbl_cp_student;


-- ============================================================================
-- [21] tbl_cp_student_school
-- ============================================================================
SELECT COUNT(*) AS total_student_school_records FROM tbl_cp_student_school;

SELECT row_id       FROM tbl_cp_student_school;
SELECT school_id    FROM tbl_cp_student_school;
SELECT student_id   FROM tbl_cp_student_school;
SELECT standard     FROM tbl_cp_student_school;
SELECT board        FROM tbl_cp_student_school;
SELECT school_name  FROM tbl_cp_student_school;
SELECT percentage   FROM tbl_cp_student_school;
SELECT passing_year FROM tbl_cp_student_school;
SELECT created_at   FROM tbl_cp_student_school;
SELECT updated_at   FROM tbl_cp_student_school;


-- ============================================================================
-- [22] tbl_cp_student_education
-- ============================================================================
SELECT COUNT(*) AS total_student_education_records FROM tbl_cp_student_education;

SELECT row_id      FROM tbl_cp_student_education;
SELECT edu_id      FROM tbl_cp_student_education;
SELECT student_id  FROM tbl_cp_student_education;
SELECT college_id  FROM tbl_cp_student_education;
SELECT course_id   FROM tbl_cp_student_education;
SELECT start_year  FROM tbl_cp_student_education;
SELECT end_year    FROM tbl_cp_student_education;
SELECT cgpa        FROM tbl_cp_student_education;
SELECT percentage  FROM tbl_cp_student_education;
SELECT created_at  FROM tbl_cp_student_education;
SELECT updated_at  FROM tbl_cp_student_education;


-- ============================================================================
-- [23] tbl_cp_msemester
-- ============================================================================
SELECT COUNT(*) AS total_semesters FROM tbl_cp_msemester;

SELECT row_id          FROM tbl_cp_msemester;
SELECT semester_id     FROM tbl_cp_msemester;
SELECT course_id       FROM tbl_cp_msemester;
SELECT semester_number FROM tbl_cp_msemester;
SELECT semester_name   FROM tbl_cp_msemester;
SELECT created_at      FROM tbl_cp_msemester;
SELECT updated_at      FROM tbl_cp_msemester;


-- ============================================================================
-- [24] tbl_cp_msubjects
-- ============================================================================
SELECT COUNT(*) AS total_subjects FROM tbl_cp_msubjects;

SELECT row_id        FROM tbl_cp_msubjects;
SELECT subject_id    FROM tbl_cp_msubjects;
SELECT subject_code  FROM tbl_cp_msubjects;
SELECT subject_name  FROM tbl_cp_msubjects;
SELECT created_at    FROM tbl_cp_msubjects;
SELECT updated_at    FROM tbl_cp_msubjects;


-- ============================================================================
-- [25] tbl_cp_college_sem_subject
-- ============================================================================
SELECT COUNT(*) AS total_college_sem_subjects FROM tbl_cp_college_sem_subject;

SELECT row_id                 FROM tbl_cp_college_sem_subject;
SELECT college_sem_subject_id FROM tbl_cp_college_sem_subject;
SELECT college_id             FROM tbl_cp_college_sem_subject;
SELECT semester_id            FROM tbl_cp_college_sem_subject;
SELECT subject_id             FROM tbl_cp_college_sem_subject;
SELECT credits                FROM tbl_cp_college_sem_subject;
SELECT created_at             FROM tbl_cp_college_sem_subject;
SELECT updated_at             FROM tbl_cp_college_sem_subject;


-- ============================================================================
-- [26] tbl_cp_student_subject_marks
-- ============================================================================
SELECT COUNT(*) AS total_subject_marks FROM tbl_cp_student_subject_marks;

SELECT row_id                 FROM tbl_cp_student_subject_marks;
SELECT student_id             FROM tbl_cp_student_subject_marks;
SELECT college_sem_subject_id FROM tbl_cp_student_subject_marks;
SELECT evaluation_type        FROM tbl_cp_student_subject_marks;
SELECT marks_obtained         FROM tbl_cp_student_subject_marks;
SELECT created_at             FROM tbl_cp_student_subject_marks;
SELECT updated_at             FROM tbl_cp_student_subject_marks;


-- ============================================================================
-- [27] tbl_cp_student_workexp
-- ============================================================================
SELECT COUNT(*) AS total_work_experiences FROM tbl_cp_student_workexp;

SELECT row_id           FROM tbl_cp_student_workexp;
SELECT workexp_id       FROM tbl_cp_student_workexp;
SELECT student_id       FROM tbl_cp_student_workexp;
SELECT company_name     FROM tbl_cp_student_workexp;
SELECT company_location FROM tbl_cp_student_workexp;
SELECT designation      FROM tbl_cp_student_workexp;
SELECT employment_type  FROM tbl_cp_student_workexp;
SELECT start_date       FROM tbl_cp_student_workexp;
SELECT end_date         FROM tbl_cp_student_workexp;
SELECT is_current       FROM tbl_cp_student_workexp;
SELECT created_at       FROM tbl_cp_student_workexp;
SELECT updated_at       FROM tbl_cp_student_workexp;


-- ============================================================================
-- [28] tbl_cp_studentprojects
-- ============================================================================
SELECT COUNT(*) AS total_projects FROM tbl_cp_studentprojects;

SELECT row_id               FROM tbl_cp_studentprojects;
SELECT project_id           FROM tbl_cp_studentprojects;
SELECT student_id           FROM tbl_cp_studentprojects;
SELECT workexp_id           FROM tbl_cp_studentprojects;
SELECT project_title        FROM tbl_cp_studentprojects;
SELECT project_description  FROM tbl_cp_studentprojects;
SELECT achievements         FROM tbl_cp_studentprojects;
SELECT project_start_date   FROM tbl_cp_studentprojects;
SELECT project_end_date     FROM tbl_cp_studentprojects;
SELECT created_at           FROM tbl_cp_studentprojects;
SELECT updated_at           FROM tbl_cp_studentprojects;


-- ============================================================================
-- [29] tbl_cp_m2m_std_skill
-- ============================================================================
SELECT COUNT(*) AS total_student_skills FROM tbl_cp_m2m_std_skill;

SELECT row_id      FROM tbl_cp_m2m_std_skill;
SELECT student_id  FROM tbl_cp_m2m_std_skill;
SELECT skill_id    FROM tbl_cp_m2m_std_skill;
SELECT created_at  FROM tbl_cp_m2m_std_skill;
SELECT updated_at  FROM tbl_cp_m2m_std_skill;


-- ============================================================================
-- [30] tbl_cp_m2m_std_lng
-- ============================================================================
SELECT COUNT(*) AS total_student_languages FROM tbl_cp_m2m_std_lng;

SELECT row_id      FROM tbl_cp_m2m_std_lng;
SELECT student_id  FROM tbl_cp_m2m_std_lng;
SELECT language_id FROM tbl_cp_m2m_std_lng;
SELECT created_at  FROM tbl_cp_m2m_std_lng;
SELECT updated_at  FROM tbl_cp_m2m_std_lng;


-- ============================================================================
-- [31] tbl_cp_m2m_std_interest
-- ============================================================================
SELECT COUNT(*) AS total_student_interests FROM tbl_cp_m2m_std_interest;

SELECT row_id      FROM tbl_cp_m2m_std_interest;
SELECT student_id  FROM tbl_cp_m2m_std_interest;
SELECT interest_id FROM tbl_cp_m2m_std_interest;
SELECT created_at  FROM tbl_cp_m2m_std_interest;
SELECT updated_at  FROM tbl_cp_m2m_std_interest;


-- ============================================================================
-- [32] tbl_cp_m2m_student_certification
-- ============================================================================
SELECT COUNT(*) AS total_student_certifications FROM tbl_cp_m2m_student_certification;

SELECT row_id            FROM tbl_cp_m2m_student_certification;
SELECT student_id        FROM tbl_cp_m2m_student_certification;
SELECT certification_id  FROM tbl_cp_m2m_student_certification;
SELECT issue_date        FROM tbl_cp_m2m_student_certification;
SELECT expiry_date       FROM tbl_cp_m2m_student_certification;
SELECT certificate_url   FROM tbl_cp_m2m_student_certification;
SELECT credential_id     FROM tbl_cp_m2m_student_certification;
SELECT is_verified       FROM tbl_cp_m2m_student_certification;
SELECT created_at        FROM tbl_cp_m2m_student_certification;
SELECT updated_at        FROM tbl_cp_m2m_student_certification;


-- ============================================================================
-- [33] tbl_cp_m2m_studentproject_skill
-- ============================================================================
SELECT COUNT(*) AS total_project_skills FROM tbl_cp_m2m_studentproject_skill;

SELECT row_id      FROM tbl_cp_m2m_studentproject_skill;
SELECT project_id  FROM tbl_cp_m2m_studentproject_skill;
SELECT skill_id    FROM tbl_cp_m2m_studentproject_skill;
SELECT created_at  FROM tbl_cp_m2m_studentproject_skill;
SELECT updated_at  FROM tbl_cp_m2m_studentproject_skill;


-- ============================================================================
-- [34] tbl_cp_student_address
-- ============================================================================
SELECT COUNT(*) AS total_student_addresses FROM tbl_cp_student_address;

SELECT row_id         FROM tbl_cp_student_address;
SELECT address_id     FROM tbl_cp_student_address;
SELECT student_id     FROM tbl_cp_student_address;
SELECT address_line_1 FROM tbl_cp_student_address;
SELECT address_line_2 FROM tbl_cp_student_address;
SELECT care_of        FROM tbl_cp_student_address;
SELECT landmark       FROM tbl_cp_student_address;
SELECT pincode_id     FROM tbl_cp_student_address;
SELECT latitude       FROM tbl_cp_student_address;
SELECT longitude      FROM tbl_cp_student_address;
SELECT address_type   FROM tbl_cp_student_address;
SELECT address_expiry FROM tbl_cp_student_address;
SELECT created_at     FROM tbl_cp_student_address;
SELECT updated_at     FROM tbl_cp_student_address;


-- ============================================================================
-- [35] tbl_cp_college_address
-- ============================================================================
SELECT COUNT(*) AS total_college_addresses FROM tbl_cp_college_address;

SELECT row_id         FROM tbl_cp_college_address;
SELECT address_id     FROM tbl_cp_college_address;
SELECT college_id     FROM tbl_cp_college_address;
SELECT address_line_1 FROM tbl_cp_college_address;
SELECT address_line_2 FROM tbl_cp_college_address;
SELECT landmark       FROM tbl_cp_college_address;
SELECT pincode_id     FROM tbl_cp_college_address;
SELECT latitude       FROM tbl_cp_college_address;
SELECT longitude      FROM tbl_cp_college_address;
SELECT address_type   FROM tbl_cp_college_address;
SELECT created_at     FROM tbl_cp_college_address;
SELECT updated_at     FROM tbl_cp_college_address;


-- ============================================================================
-- [36] tbl_cp_mcompany
-- ============================================================================
SELECT COUNT(*) AS total_companies FROM tbl_cp_mcompany;

SELECT row_id      FROM tbl_cp_mcompany;
SELECT company_id  FROM tbl_cp_mcompany;
SELECT name        FROM tbl_cp_mcompany;
SELECT industry    FROM tbl_cp_mcompany;
SELECT website     FROM tbl_cp_mcompany;
SELECT city        FROM tbl_cp_mcompany;
SELECT is_active   FROM tbl_cp_mcompany;
SELECT created_at  FROM tbl_cp_mcompany;
SELECT updated_at  FROM tbl_cp_mcompany;


-- ============================================================================
-- [37] tbl_cp_company_address
-- ============================================================================
SELECT COUNT(*) AS total_company_addresses FROM tbl_cp_company_address;

SELECT row_id         FROM tbl_cp_company_address;
SELECT address_id     FROM tbl_cp_company_address;
SELECT company_id     FROM tbl_cp_company_address;
SELECT address_line_1 FROM tbl_cp_company_address;
SELECT address_line_2 FROM tbl_cp_company_address;
SELECT landmark       FROM tbl_cp_company_address;
SELECT pincode_id     FROM tbl_cp_company_address;
SELECT latitude       FROM tbl_cp_company_address;
SELECT longitude      FROM tbl_cp_company_address;
SELECT address_type   FROM tbl_cp_company_address;
SELECT created_at     FROM tbl_cp_company_address;
SELECT updated_at     FROM tbl_cp_company_address;


-- ============================================================================
-- [38] tbl_cp_job_description
-- ============================================================================
SELECT COUNT(*) AS total_job_descriptions FROM tbl_cp_job_description;

SELECT row_id                FROM tbl_cp_job_description;
SELECT jd_id                 FROM tbl_cp_job_description;
SELECT company_id            FROM tbl_cp_job_description;
SELECT job_role              FROM tbl_cp_job_description;
SELECT title                 FROM tbl_cp_job_description;
SELECT description           FROM tbl_cp_job_description;
SELECT experience_min_yrs    FROM tbl_cp_job_description;
SELECT experience_max_yrs    FROM tbl_cp_job_description;
SELECT salary_min            FROM tbl_cp_job_description;
SELECT salary_max            FROM tbl_cp_job_description;
SELECT bond_months           FROM tbl_cp_job_description;
SELECT location              FROM tbl_cp_job_description;
SELECT employment_type       FROM tbl_cp_job_description;
SELECT openings              FROM tbl_cp_job_description;
SELECT hiring_manager_name   FROM tbl_cp_job_description;
SELECT hiring_manager_email  FROM tbl_cp_job_description;
SELECT status                FROM tbl_cp_job_description;
SELECT created_at            FROM tbl_cp_job_description;
SELECT updated_at            FROM tbl_cp_job_description;


-- ============================================================================
-- [39] tbl_cp_mquestions
-- ============================================================================
SELECT COUNT(*) AS total_questions FROM tbl_cp_mquestions;

SELECT row_id         FROM tbl_cp_mquestions;
SELECT question_id    FROM tbl_cp_mquestions;
SELECT module_id      FROM tbl_cp_mquestions;
SELECT difficulty_id  FROM tbl_cp_mquestions;
SELECT question_text  FROM tbl_cp_mquestions;
SELECT question_type  FROM tbl_cp_mquestions;
SELECT correct_answer FROM tbl_cp_mquestions;
SELECT max_marks      FROM tbl_cp_mquestions;
SELECT is_active      FROM tbl_cp_mquestions;
SELECT created_at     FROM tbl_cp_mquestions;
SELECT updated_at     FROM tbl_cp_mquestions;


-- ============================================================================
-- [40] tbl_cp_m2m_question_options
-- ============================================================================
SELECT COUNT(*) AS total_question_options FROM tbl_cp_m2m_question_options;

SELECT row_id        FROM tbl_cp_m2m_question_options;
SELECT option_id     FROM tbl_cp_m2m_question_options;
SELECT question_id   FROM tbl_cp_m2m_question_options;
SELECT option_text   FROM tbl_cp_m2m_question_options;
SELECT is_correct    FROM tbl_cp_m2m_question_options;
SELECT display_order FROM tbl_cp_m2m_question_options;
SELECT created_at    FROM tbl_cp_m2m_question_options;
SELECT updated_at    FROM tbl_cp_m2m_question_options;


-- ============================================================================
-- [41] tbl_cp_jd_round_config
-- ============================================================================
SELECT COUNT(*) AS total_round_configs FROM tbl_cp_jd_round_config;

SELECT row_id          FROM tbl_cp_jd_round_config;
SELECT round_config_id FROM tbl_cp_jd_round_config;
SELECT jd_id           FROM tbl_cp_jd_round_config;
SELECT round_number    FROM tbl_cp_jd_round_config;
SELECT round_label     FROM tbl_cp_jd_round_config;
SELECT is_exam         FROM tbl_cp_jd_round_config;
SELECT created_at      FROM tbl_cp_jd_round_config;
SELECT updated_at      FROM tbl_cp_jd_round_config;


-- ============================================================================
-- [42] tbl_cp_m2m_jd_round_module
-- ============================================================================
SELECT COUNT(*) AS total_jd_round_modules FROM tbl_cp_m2m_jd_round_module;

SELECT row_id          FROM tbl_cp_m2m_jd_round_module;
SELECT jd_round_mod_id FROM tbl_cp_m2m_jd_round_module;
SELECT round_config_id FROM tbl_cp_m2m_jd_round_module;
SELECT module_id       FROM tbl_cp_m2m_jd_round_module;
SELECT weightage       FROM tbl_cp_m2m_jd_round_module;
SELECT difficulty_id   FROM tbl_cp_m2m_jd_round_module;
SELECT is_mandatory    FROM tbl_cp_m2m_jd_round_module;
SELECT created_at      FROM tbl_cp_m2m_jd_round_module;
SELECT updated_at      FROM tbl_cp_m2m_jd_round_module;


-- ============================================================================
-- [43] tbl_cp_recruitment_drive
-- ============================================================================
SELECT COUNT(*) AS total_drives FROM tbl_cp_recruitment_drive;

SELECT row_id      FROM tbl_cp_recruitment_drive;
SELECT drive_id    FROM tbl_cp_recruitment_drive;
SELECT drive_name  FROM tbl_cp_recruitment_drive;
SELECT jd_id       FROM tbl_cp_recruitment_drive;
SELECT start_date  FROM tbl_cp_recruitment_drive;
SELECT end_date    FROM tbl_cp_recruitment_drive;
SELECT description FROM tbl_cp_recruitment_drive;
SELECT status      FROM tbl_cp_recruitment_drive;
SELECT created_at  FROM tbl_cp_recruitment_drive;
SELECT updated_at  FROM tbl_cp_recruitment_drive;


-- ============================================================================
-- [44] tbl_cp_recruitment_drive_round
-- ============================================================================
SELECT COUNT(*) AS total_drive_rounds FROM tbl_cp_recruitment_drive_round;

SELECT round_id      FROM tbl_cp_recruitment_drive_round;
SELECT drive_id      FROM tbl_cp_recruitment_drive_round;
SELECT round_number  FROM tbl_cp_recruitment_drive_round;
SELECT round_name    FROM tbl_cp_recruitment_drive_round;
SELECT round_type    FROM tbl_cp_recruitment_drive_round;
SELECT config_json   FROM tbl_cp_recruitment_drive_round;
SELECT created_at    FROM tbl_cp_recruitment_drive_round;


-- ============================================================================
-- [45] tbl_cp_application
-- ============================================================================
SELECT COUNT(*) AS total_applications FROM tbl_cp_application;

SELECT row_id           FROM tbl_cp_application;
SELECT application_id   FROM tbl_cp_application;
SELECT student_id       FROM tbl_cp_application;
SELECT drive_id         FROM tbl_cp_application;
SELECT serial_no        FROM tbl_cp_application;
SELECT application_date FROM tbl_cp_application;
SELECT status           FROM tbl_cp_application;
SELECT created_at       FROM tbl_cp_application;
SELECT updated_at       FROM tbl_cp_application;


-- ============================================================================
-- [46] tbl_cp_application_status_history
-- ============================================================================
SELECT COUNT(*) AS total_status_history_records FROM tbl_cp_application_status_history;

SELECT row_id          FROM tbl_cp_application_status_history;
SELECT history_id      FROM tbl_cp_application_status_history;
SELECT application_id  FROM tbl_cp_application_status_history;
SELECT status          FROM tbl_cp_application_status_history;
SELECT changed_date    FROM tbl_cp_application_status_history;
SELECT created_at      FROM tbl_cp_application_status_history;
SELECT updated_at      FROM tbl_cp_application_status_history;


-- ============================================================================
-- [47] tbl_cp_exam_session
-- ============================================================================
SELECT COUNT(*) AS total_exam_sessions FROM tbl_cp_exam_session;

SELECT row_id           FROM tbl_cp_exam_session;
SELECT exam_session_id  FROM tbl_cp_exam_session;
SELECT application_id   FROM tbl_cp_exam_session;
SELECT round_config_id  FROM tbl_cp_exam_session;
SELECT attendance_id    FROM tbl_cp_exam_session;
SELECT exam_date        FROM tbl_cp_exam_session;
SELECT exam_time        FROM tbl_cp_exam_session;
SELECT cutoff_pct       FROM tbl_cp_exam_session;
SELECT correct_count    FROM tbl_cp_exam_session;
SELECT incorrect_count  FROM tbl_cp_exam_session;
SELECT total_questions  FROM tbl_cp_exam_session;
SELECT score_pct        FROM tbl_cp_exam_session;
SELECT result_id        FROM tbl_cp_exam_session;
SELECT feedback         FROM tbl_cp_exam_session;
SELECT created_at       FROM tbl_cp_exam_session;
SELECT updated_at       FROM tbl_cp_exam_session;


-- ============================================================================
-- [48] tbl_cp_m2m_exam_question_response
-- ============================================================================
SELECT COUNT(*) AS total_exam_responses FROM tbl_cp_m2m_exam_question_response;

SELECT row_id           FROM tbl_cp_m2m_exam_question_response;
SELECT response_id      FROM tbl_cp_m2m_exam_question_response;
SELECT exam_session_id  FROM tbl_cp_m2m_exam_question_response;
SELECT question_id      FROM tbl_cp_m2m_exam_question_response;
SELECT option_id        FROM tbl_cp_m2m_exam_question_response;
SELECT is_correct       FROM tbl_cp_m2m_exam_question_response;
SELECT marks_awarded    FROM tbl_cp_m2m_exam_question_response;
SELECT created_at       FROM tbl_cp_m2m_exam_question_response;
SELECT updated_at       FROM tbl_cp_m2m_exam_question_response;


-- ============================================================================
-- [49] tbl_cp_interview_session
-- ============================================================================
SELECT COUNT(*) AS total_interview_sessions FROM tbl_cp_interview_session;

SELECT row_id            FROM tbl_cp_interview_session;
SELECT session_id        FROM tbl_cp_interview_session;
SELECT application_id    FROM tbl_cp_interview_session;
SELECT round_config_id   FROM tbl_cp_interview_session;
SELECT interviewer_id    FROM tbl_cp_interview_session;
SELECT attendance_id     FROM tbl_cp_interview_session;
SELECT session_date      FROM tbl_cp_interview_session;
SELECT session_time      FROM tbl_cp_interview_session;
SELECT bonus_marks       FROM tbl_cp_interview_session;
SELECT total_score       FROM tbl_cp_interview_session;
SELECT result_id         FROM tbl_cp_interview_session;
SELECT comments          FROM tbl_cp_interview_session;
SELECT internal_feedback FROM tbl_cp_interview_session;
SELECT external_feedback FROM tbl_cp_interview_session;
SELECT created_at        FROM tbl_cp_interview_session;
SELECT updated_at        FROM tbl_cp_interview_session;


-- ============================================================================
-- [50] tbl_cp_m2m_session_module_score
-- ============================================================================
SELECT COUNT(*) AS total_session_module_scores FROM tbl_cp_m2m_session_module_score;

SELECT row_id          FROM tbl_cp_m2m_session_module_score;
SELECT score_id        FROM tbl_cp_m2m_session_module_score;
SELECT session_id      FROM tbl_cp_m2m_session_module_score;
SELECT module_id       FROM tbl_cp_m2m_session_module_score;
SELECT correct_count   FROM tbl_cp_m2m_session_module_score;
SELECT incorrect_count FROM tbl_cp_m2m_session_module_score;
SELECT total_questions FROM tbl_cp_m2m_session_module_score;
SELECT score_sum       FROM tbl_cp_m2m_session_module_score;
SELECT created_at      FROM tbl_cp_m2m_session_module_score;
SELECT updated_at      FROM tbl_cp_m2m_session_module_score;


-- ============================================================================
-- [51] tbl_cp_m2m_session_question_response
-- ============================================================================
SELECT COUNT(*) AS total_session_question_responses FROM tbl_cp_m2m_session_question_response;

SELECT row_id        FROM tbl_cp_m2m_session_question_response;
SELECT response_id   FROM tbl_cp_m2m_session_question_response;
SELECT session_id    FROM tbl_cp_m2m_session_question_response;
SELECT question_id   FROM tbl_cp_m2m_session_question_response;
SELECT is_correct    FROM tbl_cp_m2m_session_question_response;
SELECT marks_awarded FROM tbl_cp_m2m_session_question_response;
SELECT created_at    FROM tbl_cp_m2m_session_question_response;
SELECT updated_at    FROM tbl_cp_m2m_session_question_response;


-- ============================================================================
-- [52] tbl_cp_placements
-- ============================================================================
SELECT COUNT(*) AS total_placements FROM tbl_cp_placements;

SELECT placement_id   FROM tbl_cp_placements;
SELECT student_id     FROM tbl_cp_placements;
SELECT company_id     FROM tbl_cp_placements;
SELECT application_id FROM tbl_cp_placements;
SELECT package        FROM tbl_cp_placements;
SELECT job_title      FROM tbl_cp_placements;
SELECT location       FROM tbl_cp_placements;
SELECT joining_date   FROM tbl_cp_placements;
SELECT comments       FROM tbl_cp_placements;
SELECT created_at     FROM tbl_cp_placements;
SELECT updated_at     FROM tbl_cp_placements;


-- ============================================================================
-- END OF SANITY TEST CASES
-- Total tables tested : 52
-- Total COUNT checks  : 52  (one per table)
-- Total column SELECTs: 492 (every column in every table)
-- ============================================================================