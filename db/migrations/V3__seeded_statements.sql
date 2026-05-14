-- ============================================================================
-- CAMPUS5 - SEED DATA FOR GROUP A (Master / Lookup Tables)
-- Tables: tbl_cp_mroles, tbl_cp_msalutation, tbl_cp_mlanguages,
--         tbl_cp_minterests, tbl_cp_mcourses, tbl_cp_mskills
-- ============================================================================


SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================================
-- TABLE 1 : tbl_cp_mroles
-- ============================================================================

INSERT IGNORE INTO tbl_cp_mroles (role_id, role_name, description, permissions) VALUES
(1, 'student',   'Student user',      JSON_OBJECT('all', JSON_ARRAY('read'))),
(2, 'tpo',       'Placement Officer', JSON_OBJECT('all', JSON_ARRAY('manage'))),
(3, 'recruiter', 'Company Recruiter', JSON_OBJECT('all', JSON_ARRAY('manage'))),
(4, 'admin',     'System Admin',      JSON_OBJECT('all', JSON_ARRAY('*')));

-- ============================================================================
-- TABLE 2 : tbl_cp_msalutation
-- ============================================================================

INSERT IGNORE INTO tbl_cp_msalutation (salutation_id, value, description) VALUES
(1, 'Mr.',  'Mister - for males'),
(2, 'Ms.',  'Miss/Mrs - for females'),
(3, 'Mrs.', 'Missus - for married females'),
(4, 'Dr.',  'Doctor - for doctorate holders');

-- ============================================================================
-- TABLE 3 : tbl_cp_mlanguages
-- (Spoken / human languages only - NOT programming languages)
-- ============================================================================

INSERT IGNORE INTO tbl_cp_mlanguages (language_id, language_code, language_name) VALUES
(1, 'EN', 'English'),
(2, 'HI', 'Hindi'),
(3, 'TE', 'Telugu'),
(4, 'TA', 'Tamil'),
(5, 'KN', 'Kannada'),
(6, 'ML', 'Malayalam'),
(7, 'MR', 'Marathi'),
(8, 'BN', 'Bengali'),
(9, 'GU', 'Gujarati'),
(10, 'PA', 'Punjabi'),
(11, 'UR', 'Urdu'),
(12, 'OR', 'Odia'),
(13, 'AS', 'Assamese'),
(14, 'SA', 'Sanskrit'),
(15, 'KS', 'Kashmiri'),
(16, 'SD', 'Sindhi'),
(17, 'NE', 'Nepali'),
(18, 'MAI', 'Maithili'),
(19, 'KOK', 'Konkani'),
(20, 'DOG', 'Dogri'),
(21, 'MNI', 'Manipuri'),
(22, 'BHO', 'Bhojpuri'),
(23, 'SAN', 'Santhali'),
(24, 'FR', 'French'),
(25, 'DE', 'German'),
(26, 'ES', 'Spanish'),
(27, 'JA', 'Japanese'),
(28, 'ZH', 'Chinese'),
(29, 'AR', 'Arabic'),
(30, 'PT', 'Portuguese'),
(31, 'RU', 'Russian'),
(32, 'KO', 'Korean'),
(33, 'IT', 'Italian'),
(34, 'NL', 'Dutch'),
(35, 'TR', 'Turkish'),
(36, 'FA', 'Persian'),
(37, 'HE', 'Hebrew'),
(38, 'TH', 'Thai'),
(39, 'VI', 'Vietnamese'),
(40, 'ID', 'Indonesian');

-- ============================================================================
-- TABLE 4 : tbl_cp_minterests
-- (Career interests like Internshala categories)
-- ============================================================================

INSERT IGNORE INTO tbl_cp_minterests (interest_id, name) VALUES
(1,  'Web Development'),
(2,  'App Development'),
(3,  'Data Science & Analytics'),
(4,  'Machine Learning & AI'),
(5,  'Cybersecurity'),
(6,  'Cloud Computing'),
(7,  'DevOps'),
(8,  'Blockchain'),
(9,  'Internet of Things (IoT)'),
(10, 'Game Development'),
(11, 'AR/VR Development'),
(12, 'Embedded Systems'),
(13, 'UI/UX Design'),
(14, 'Graphic Design'),
(15, 'Motion Graphics & Animation'),
(16, 'Photography'),
(17, 'Video Editing & Production'),
(18, 'Digital Marketing'),
(19, 'Content Writing & Blogging'),
(20, 'Social Media Marketing'),
(21, 'SEO & SEM'),
(22, 'Business Development'),
(23, 'Entrepreneurship & Startups'),
(24, 'Product Management'),
(25, 'Sales'),
(26, 'Finance & Accounting'),
(27, 'Banking & Insurance'),
(28, 'Stock Market & Trading'),
(29, 'Investment & Wealth Management'),
(30, 'Human Resources'),
(31, 'Operations Management'),
(32, 'Supply Chain & Logistics'),
(33, 'Project Management'),
(34, 'Mechanical Engineering'),
(35, 'Electrical Engineering'),
(36, 'Electronics & Communication'),
(37, 'Civil Engineering'),
(38, 'Chemical Engineering'),
(39, 'Aerospace Engineering'),
(40, 'Healthcare & Medicine'),
(41, 'Pharmacy'),
(42, 'Biotechnology'),
(43, 'Research & Development'),
(44, 'Teaching & Education'),
(45, 'Civil Services & Government'),
(46, 'Law & Legal Services'),
(47, 'Music'),
(48, 'Journalism & Mass Communication'),
(49, 'Event Management'),
(50, 'Fashion & Lifestyle');

-- ============================================================================
-- TABLE 5 : tbl_cp_mcourses
-- (All major Indian university degree courses with specializations)
-- ============================================================================

INSERT IGNORE INTO tbl_cp_mcourses (course_id, course_name, course_code, specialization_name, specialization_code) VALUES

-- B.Tech
(1,  'Bachelor of Technology', 'BTECH', 'Computer Science & Engineering',   'CSE'),
(2,  'Bachelor of Technology', 'BTECH', 'Information Technology',           'IT'),
(3,  'Bachelor of Technology', 'BTECH', 'Electronics & Communication Engg', 'ECE'),
(4,  'Bachelor of Technology', 'BTECH', 'Electrical & Electronics Engg',    'EEE'),
(5,  'Bachelor of Technology', 'BTECH', 'Mechanical Engineering',           'MECH'),
(6,  'Bachelor of Technology', 'BTECH', 'Civil Engineering',                'CIVIL'),
(7,  'Bachelor of Technology', 'BTECH', 'Chemical Engineering',             'CHEM'),
(8,  'Bachelor of Technology', 'BTECH', 'Aerospace Engineering',            'AERO'),
(9,  'Bachelor of Technology', 'BTECH', 'Biotechnology',                    'BT'),
(10, 'Bachelor of Technology', 'BTECH', 'Artificial Intelligence & ML',     'AIML'),
(11, 'Bachelor of Technology', 'BTECH', 'Data Science',                     'DS'),
(12, 'Bachelor of Technology', 'BTECH', 'Cyber Security',                   'CSEC'),

-- B.E
(13, 'Bachelor of Engineering', 'BE', 'Computer Science & Engineering',   'CSE'),
(14, 'Bachelor of Engineering', 'BE', 'Information Technology',           'IT'),
(15, 'Bachelor of Engineering', 'BE', 'Electronics & Communication Engg', 'ECE'),
(16, 'Bachelor of Engineering', 'BE', 'Electrical & Electronics Engg',    'EEE'),
(17, 'Bachelor of Engineering', 'BE', 'Mechanical Engineering',           'MECH'),
(18, 'Bachelor of Engineering', 'BE', 'Civil Engineering',                'CIVIL'),

-- M.Tech
(19, 'Master of Technology', 'MTECH', 'Computer Science & Engineering',   'CSE'),
(20, 'Master of Technology', 'MTECH', 'Information Technology',           'IT'),
(21, 'Master of Technology', 'MTECH', 'Electronics & Communication Engg', 'ECE'),
(22, 'Master of Technology', 'MTECH', 'Mechanical Engineering',           'MECH'),
(23, 'Master of Technology', 'MTECH', 'Data Science & AI',                'DSAI'),
(24, 'Master of Technology', 'MTECH', 'Cyber Security',                   'CSEC'),
(25, 'Master of Technology', 'MTECH', 'VLSI Design',                      'VLSI'),

-- MCA
(26, 'Master of Computer Applications', 'MCA', 'General',         'GEN'),
(27, 'Master of Computer Applications', 'MCA', 'Data Science',    'DS'),
(28, 'Master of Computer Applications', 'MCA', 'Cloud Computing', 'CC'),

-- BCA
(29, 'Bachelor of Computer Applications', 'BCA', 'General',         'GEN'),
(30, 'Bachelor of Computer Applications', 'BCA', 'Data Science',    'DS'),
(31, 'Bachelor of Computer Applications', 'BCA', 'Cloud Computing', 'CC'),

-- MBA
(32, 'Master of Business Administration', 'MBA', 'Finance',                 'FIN'),
(33, 'Master of Business Administration', 'MBA', 'Human Resources',         'HR'),
(34, 'Master of Business Administration', 'MBA', 'Marketing',               'MKT'),
(35, 'Master of Business Administration', 'MBA', 'Operations Management',   'OPS'),
(36, 'Master of Business Administration', 'MBA', 'Information Technology',  'IT'),
(37, 'Master of Business Administration', 'MBA', 'Business Analytics',      'BA'),
(38, 'Master of Business Administration', 'MBA', 'International Business',  'IB'),
(39, 'Master of Business Administration', 'MBA', 'Supply Chain Management', 'SCM'),
(40, 'Master of Business Administration', 'MBA', 'Entrepreneurship',        'ENT'),

-- BBA
(41, 'Bachelor of Business Administration', 'BBA', 'General',             'GEN'),
(42, 'Bachelor of Business Administration', 'BBA', 'Finance',             'FIN'),
(43, 'Bachelor of Business Administration', 'BBA', 'Human Resources',     'HR'),
(44, 'Bachelor of Business Administration', 'BBA', 'Marketing',           'MKT'),
(45, 'Bachelor of Business Administration', 'BBA', 'International Business','IB'),

-- B.Sc
(46, 'Bachelor of Science', 'BSC', 'Computer Science',       'CS'),
(47, 'Bachelor of Science', 'BSC', 'Information Technology', 'IT'),
(48, 'Bachelor of Science', 'BSC', 'Data Science',           'DS'),
(49, 'Bachelor of Science', 'BSC', 'Mathematics',            'MATH'),
(50, 'Bachelor of Science', 'BSC', 'Physics',                'PHY'),
(51, 'Bachelor of Science', 'BSC', 'Chemistry',              'CHEM'),
(52, 'Bachelor of Science', 'BSC', 'Statistics',             'STAT'),
(53, 'Bachelor of Science', 'BSC', 'Electronics',            'ELEC'),
(54, 'Bachelor of Science', 'BSC', 'Biotechnology',          'BT'),
(55, 'Bachelor of Science', 'BSC', 'Microbiology',           'MB'),

-- M.Sc
(56, 'Master of Science', 'MSC', 'Computer Science',       'CS'),
(57, 'Master of Science', 'MSC', 'Information Technology', 'IT'),
(58, 'Master of Science', 'MSC', 'Data Science',           'DS'),
(59, 'Master of Science', 'MSC', 'Mathematics',            'MATH'),
(60, 'Master of Science', 'MSC', 'Physics',                'PHY'),
(61, 'Master of Science', 'MSC', 'Chemistry',              'CHEM'),
(62, 'Master of Science', 'MSC', 'Statistics',             'STAT'),
(63, 'Master of Science', 'MSC', 'Biotechnology',          'BT'),

-- B.Com
(64, 'Bachelor of Commerce', 'BCOM', 'General',              'GEN'),
(65, 'Bachelor of Commerce', 'BCOM', 'Accounting & Finance', 'AF'),
(66, 'Bachelor of Commerce', 'BCOM', 'Computer Applications','CA'),
(67, 'Bachelor of Commerce', 'BCOM', 'Banking & Insurance',  'BI'),

-- M.Com
(68, 'Master of Commerce', 'MCOM', 'General',              'GEN'),
(69, 'Master of Commerce', 'MCOM', 'Accounting & Finance', 'AF'),
(70, 'Master of Commerce', 'MCOM', 'Banking & Finance',    'BF'),

-- B.A
(71, 'Bachelor of Arts', 'BA', 'General',                        'GEN'),
(72, 'Bachelor of Arts', 'BA', 'English',                        'ENG'),
(73, 'Bachelor of Arts', 'BA', 'Economics',                      'ECO'),
(74, 'Bachelor of Arts', 'BA', 'Psychology',                     'PSY'),
(75, 'Bachelor of Arts', 'BA', 'Sociology',                      'SOC'),
(76, 'Bachelor of Arts', 'BA', 'Political Science',              'POL'),
(77, 'Bachelor of Arts', 'BA', 'History',                        'HIST'),
(78, 'Bachelor of Arts', 'BA', 'Journalism & Mass Communication','JMC'),

-- M.A
(79, 'Master of Arts', 'MA', 'English',           'ENG'),
(80, 'Master of Arts', 'MA', 'Economics',         'ECO'),
(81, 'Master of Arts', 'MA', 'Psychology',        'PSY'),
(82, 'Master of Arts', 'MA', 'Sociology',         'SOC'),
(83, 'Master of Arts', 'MA', 'Political Science', 'POL'),

-- Diploma
(84, 'Diploma', 'DIP', 'Computer Science & Engineering',   'CSE'),
(85, 'Diploma', 'DIP', 'Electronics & Communication Engg', 'ECE'),
(86, 'Diploma', 'DIP', 'Mechanical Engineering',           'MECH'),
(87, 'Diploma', 'DIP', 'Civil Engineering',                'CIVIL'),
(88, 'Diploma', 'DIP', 'Electrical Engineering',           'EE'),
(89, 'Diploma', 'DIP', 'Information Technology',           'IT'),

-- Law
(90, 'Bachelor of Laws',        'LLB',   'General', 'GEN'),
(91, 'Bachelor of Arts & Laws', 'BALLB', 'General', 'GEN'),
(92, 'Master of Laws',          'LLM',   'General', 'GEN'),

-- Medical & Pharmacy
(93, 'Bachelor of Medicine & Surgery', 'MBBS',   'General', 'GEN'),
(94, 'Bachelor of Dental Surgery',     'BDS',    'General', 'GEN'),
(95, 'Bachelor of Pharmacy',           'BPHARM', 'General', 'GEN'),
(96, 'Master of Pharmacy',             'MPHARM', 'General', 'GEN'),
(97, 'Bachelor of Physiotherapy',      'BPT',    'General', 'GEN'),

-- Education
(98,  'Bachelor of Education', 'BED', 'General', 'GEN'),
(99,  'Master of Education',   'MED', 'General', 'GEN'),

-- Architecture & Design
(100, 'Bachelor of Architecture', 'BARCH', 'General',       'GEN'),
(101, 'Bachelor of Design',       'BDES',  'UI/UX Design',  'UIUX'),
(102, 'Bachelor of Design',       'BDES',  'Graphic Design', 'GD'),
(103, 'Bachelor of Design',       'BDES',  'Fashion Design', 'FD'),

-- CA / CS / CMA
(104, 'Chartered Accountancy',         'CA',  'General', 'GEN'),
(105, 'Company Secretary',             'CS',  'General', 'GEN'),
(106, 'Cost & Management Accountancy', 'CMA', 'General', 'GEN'),

-- Ph.D
(107, 'Doctor of Philosophy', 'PHD', 'Computer Science',  'CS'),
(108, 'Doctor of Philosophy', 'PHD', 'Engineering',       'ENGG'),
(109, 'Doctor of Philosophy', 'PHD', 'Management',        'MGMT'),
(110, 'Doctor of Philosophy', 'PHD', 'Science',           'SCI'),
(111, 'Doctor of Philosophy', 'PHD', 'Arts & Humanities', 'ARTS'),

-- B.Tech Lateral Entry
(112, 'Bachelor of Technology (Lateral Entry)', 'BTECH-LE', 'Computer Science & Engineering',   'CSE'),
(113, 'Bachelor of Technology (Lateral Entry)', 'BTECH-LE', 'Electronics & Communication Engg', 'ECE'),
(114, 'Bachelor of Technology (Lateral Entry)', 'BTECH-LE', 'Mechanical Engineering',           'MECH'),

-- Integrated Courses
(115, 'Integrated B.Tech + M.Tech', 'BTECH-MTECH', 'Computer Science & Engineering', 'CSE'),
(116, 'Integrated BBA + MBA',       'BBA-MBA',     'General',                        'GEN'),
(117, 'Integrated B.Sc + M.Sc',     'BSC-MSC',     'Data Science',                   'DS');

-- ============================================================================
-- TABLE 8 : tbl_cp_mskills
-- (Technical skills - like Internshala skills section)
-- NOTE: language_id column removed from this table (wrong connection)
-- ============================================================================

INSERT IGNORE INTO tbl_cp_mskills (skill_id, name, description, version, complexity, status) VALUES

-- Programming Languages
(1,  'Python',          'General purpose programming language',          '3.x',    'Beginner',     'Active'),
(2,  'Java',            'Object oriented programming language',          '17+',    'Intermediate', 'Active'),
(3,  'C',               'System level programming language',             'C17',    'Beginner',     'Active'),
(4,  'C++',             'Extension of C with OOP features',              'C++17',  'Intermediate', 'Active'),
(5,  'JavaScript',      'Scripting language for web',                    'ES2023', 'Beginner',     'Active'),
(6,  'TypeScript',      'Typed superset of JavaScript',                  '5.x',    'Intermediate', 'Active'),
(7,  'PHP',             'Server side scripting language',                '8.x',    'Beginner',     'Active'),
(8,  'Ruby',            'Dynamic object oriented language',              '3.x',    'Intermediate', 'Active'),
(9,  'Go',              'Statically typed compiled language by Google',  '1.21+',  'Intermediate', 'Active'),
(10, 'Kotlin',          'Modern language for JVM and Android',           '1.9+',   'Intermediate', 'Active'),
(11, 'Swift',           'Programming language for Apple platforms',      '5.x',    'Intermediate', 'Active'),
(12, 'Rust',            'Systems programming language',                  '1.7x',   'Advanced',     'Active'),
(13, 'Scala',           'Functional and OOP language on JVM',            '3.x',    'Advanced',     'Active'),
(14, 'R',               'Statistical computing language',                '4.x',    'Intermediate', 'Active'),
(15, 'MATLAB',          'Numerical computing environment',               'R2023',  'Intermediate', 'Active'),
(16, 'Dart',            'Language for Flutter development',              '3.x',    'Beginner',     'Active'),
(17, 'Shell Scripting', 'Bash and shell automation scripts',             'Bash 5', 'Intermediate', 'Active'),

-- Web Frontend
(18, 'HTML',            'HyperText Markup Language for web structure',   '5',      'Beginner',     'Active'),
(19, 'CSS',             'Cascading Style Sheets for web design',         '3',      'Beginner',     'Active'),
(20, 'React.js',        'JavaScript library for building UIs',           '18.x',   'Intermediate', 'Active'),
(21, 'Angular',         'TypeScript based web framework by Google',      '17.x',   'Intermediate', 'Active'),
(22, 'Vue.js',          'Progressive JavaScript framework',              '3.x',    'Intermediate', 'Active'),
(23, 'Next.js',         'React framework for production',                '14.x',   'Intermediate', 'Active'),
(24, 'Bootstrap',       'CSS framework for responsive design',           '5.x',    'Beginner',     'Active'),
(25, 'Tailwind CSS',    'Utility first CSS framework',                   '3.x',    'Beginner',     'Active'),
(26, 'jQuery',          'Fast and lightweight JavaScript library',       '3.x',    'Beginner',     'Active'),
(27, 'Sass/SCSS',       'CSS preprocessor with variables and nesting',   '1.x',    'Intermediate', 'Active'),
(28, 'Redux',           'State management library for React',            '4.x',    'Intermediate', 'Active'),

-- Web Backend
(29, 'Node.js',         'JavaScript runtime for server side',            '20.x',   'Intermediate', 'Active'),
(30, 'Express.js',      'Minimal Node.js web framework',                 '4.x',    'Intermediate', 'Active'),
(31, 'Django',          'High level Python web framework',               '4.x',    'Intermediate', 'Active'),
(32, 'Flask',           'Lightweight Python web framework',              '3.x',    'Beginner',     'Active'),
(33, 'FastAPI',         'Modern fast Python web framework',              '0.10x',  'Intermediate', 'Active'),
(34, 'Spring Boot',     'Java based enterprise web framework',           '3.x',    'Advanced',     'Active'),
(35, 'Laravel',         'PHP web application framework',                 '10.x',   'Intermediate', 'Active'),
(36, 'ASP.NET Core',    'Cross platform .NET web framework',             '8.x',    'Advanced',     'Active'),
(37, 'NestJS',          'Node.js framework for scalable apps',           '10.x',   'Intermediate', 'Active'),

-- Database
(38, 'MySQL',           'Open source relational database',               '8.x',    'Beginner',     'Active'),
(39, 'PostgreSQL',      'Advanced open source relational database',      '16.x',   'Intermediate', 'Active'),
(40, 'MongoDB',         'NoSQL document database',                       '7.x',    'Intermediate', 'Active'),
(41, 'Redis',           'In memory data structure store',                '7.x',    'Intermediate', 'Active'),
(42, 'Oracle DB',       'Enterprise relational database',                '21c',    'Advanced',     'Active'),
(43, 'SQLite',          'Lightweight embedded relational database',      '3.x',    'Beginner',     'Active'),
(44, 'MS SQL Server',   'Microsoft relational database',                 '2022',   'Intermediate', 'Active'),
(45, 'Firebase',        'Google cloud database and backend platform',    'Latest', 'Beginner',     'Active'),
(46, 'Elasticsearch',   'Distributed search and analytics engine',       '8.x',    'Advanced',     'Active'),

-- Mobile Development
(47, 'Android Development', 'Native Android app development',           'API 34', 'Intermediate', 'Active'),
(48, 'iOS Development',     'Native iOS app development with Swift',    'iOS 17', 'Intermediate', 'Active'),
(49, 'Flutter',             'Google UI toolkit for cross platform apps', '3.x',    'Intermediate', 'Active'),
(50, 'React Native',        'Cross platform mobile using React',         '0.73+',  'Intermediate', 'Active'),

-- Cloud & DevOps
(51, 'AWS',             'Amazon Web Services cloud platform',            'Latest', 'Intermediate', 'Active'),
(52, 'Microsoft Azure', 'Microsoft cloud computing platform',            'Latest', 'Intermediate', 'Active'),
(53, 'Google Cloud',    'Google cloud computing platform',               'Latest', 'Intermediate', 'Active'),
(54, 'Docker',          'Containerization platform',                     'Latest', 'Intermediate', 'Active'),
(55, 'Kubernetes',      'Container orchestration system',                'Latest', 'Advanced',     'Active'),
(56, 'Jenkins',         'Open source automation server for CI/CD',       'Latest', 'Intermediate', 'Active'),
(57, 'Terraform',       'Infrastructure as code tool',                   'Latest', 'Advanced',     'Active'),
(58, 'GitHub Actions',  'CI/CD platform built into GitHub',              'Latest', 'Intermediate', 'Active'),
(59, 'Linux',           'Open source operating system',                  'Latest', 'Intermediate', 'Active'),

-- Data Science & ML
(60, 'Machine Learning',    'Building models that learn from data',      'Latest', 'Intermediate', 'Active'),
(61, 'Deep Learning',       'Neural network based machine learning',     'Latest', 'Advanced',     'Active'),
(62, 'Data Analysis',       'Analyzing and interpreting data',           'Latest', 'Beginner',     'Active'),
(63, 'Data Visualization',  'Representing data graphically',             'Latest', 'Beginner',     'Active'),
(64, 'TensorFlow',          'Open source ML framework by Google',        '2.x',    'Advanced',     'Active'),
(65, 'PyTorch',             'Open source ML framework by Meta',          '2.x',    'Advanced',     'Active'),
(66, 'Pandas',              'Python data manipulation library',           '2.x',    'Intermediate', 'Active'),
(67, 'NumPy',               'Python numerical computing library',         'Latest', 'Intermediate', 'Active'),
(68, 'Scikit-learn',        'Python ML library',                          'Latest', 'Intermediate', 'Active'),
(69, 'Keras',               'High level neural network API',              '3.x',    'Intermediate', 'Active'),
(70, 'OpenCV',              'Open source computer vision library',        '4.x',    'Intermediate', 'Active'),
(71, 'NLP',                 'Natural Language Processing',                'Latest', 'Advanced',     'Active'),
(72, 'Power BI',            'Microsoft business analytics tool',          'Latest', 'Intermediate', 'Active'),
(73, 'Tableau',             'Data visualization and analytics tool',      'Latest', 'Intermediate', 'Active'),
(74, 'Apache Spark',        'Unified analytics engine for big data',      '3.x',    'Advanced',     'Active'),

-- Tools & Platforms
(75, 'Git',             'Distributed version control system',             '2.x',    'Beginner',     'Active'),
(76, 'GitHub',          'Code hosting platform using Git',                'Latest', 'Beginner',     'Active'),
(77, 'Postman',         'API testing and development tool',               'Latest', 'Beginner',     'Active'),
(78, 'Figma',           'Collaborative UI/UX design tool',                'Latest', 'Beginner',     'Active'),
(79, 'Jira',            'Project management and issue tracking tool',     'Latest', 'Beginner',     'Active'),
(80, 'MS Excel',        'Microsoft spreadsheet application',              '365',    'Beginner',     'Active'),

-- API & Architecture
(81, 'REST API',        'Representational State Transfer API design',     'Latest', 'Intermediate', 'Active'),
(82, 'GraphQL',         'Query language for APIs',                        'Latest', 'Intermediate', 'Active'),
(83, 'Microservices',   'Architectural style for distributed systems',    'Latest', 'Advanced',     'Active'),
(84, 'WebSockets',      'Full duplex communication protocol',             'Latest', 'Intermediate', 'Active'),

-- Testing
(85, 'Selenium',        'Browser automation and testing framework',       'Latest', 'Intermediate', 'Active'),
(86, 'Jest',            'JavaScript testing framework',                   'Latest', 'Intermediate', 'Active'),
(87, 'JUnit',           'Java unit testing framework',                    'Latest', 'Intermediate', 'Active'),

-- Security
(88, 'Cybersecurity',   'Protecting systems and networks from attacks',   'Latest', 'Intermediate', 'Active'),
(89, 'Ethical Hacking', 'Legal penetration testing of systems',           'Latest', 'Advanced',     'Active'),
(90, 'Network Security','Securing computer networks',                     'Latest', 'Intermediate', 'Active'),

-- Emerging Tech
(91, 'Blockchain',        'Distributed ledger technology',               'Latest', 'Advanced',     'Active'),
(92, 'IoT',               'Internet of Things development',              'Latest', 'Intermediate', 'Active'),
(93, 'Generative AI',     'AI that generates content like text/images',  'Latest', 'Advanced',     'Active'),
(94, 'Prompt Engineering','Designing inputs for AI language models',      'Latest', 'Intermediate', 'Active');

-- ============================================================================

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================================
-- SUMMARY
-- tbl_cp_mroles       :   4 rows
-- tbl_cp_msalutation  :   4 rows
-- tbl_cp_mlanguages   :  25 rows
-- tbl_cp_minterests   :  50 rows
-- tbl_cp_mcourses     : 117 rows
-- tbl_cp_mskills      :  94 rows
-- TOTAL               : 294 rows
-- ============================================================================

-- ============================================================================
-- CAMPUS5 - SEED DATA FOR GROUP B (Geography)
-- Tables: tbl_cp_mcountries, tbl_cp_mstates, tbl_cp_mcities, tbl_cp_mpincodes
-- India: ALL states/UTs, ALL major cities, real pincodes
-- Other countries: major countries with key states and cities
-- ============================================================================

SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================================
-- TABLE 14 : tbl_cp_mcountries
-- ============================================================================

INSERT IGNORE INTO tbl_cp_mcountries (country_id, country_name, country_code) VALUES
(1, 'Afghanistan', 'AF'),
(2, 'Albania', 'AL'),
(3, 'Algeria', 'DZ'),
(4, 'Andorra', 'AD'),
(5, 'Angola', 'AO'),
(6, 'Argentina', 'AR'),
(7, 'Armenia', 'AM'),
(8, 'Australia', 'AU'),
(9, 'Austria', 'AT'),
(10, 'Azerbaijan', 'AZ'),
(11, 'Bahrain', 'BH'),
(12, 'Bangladesh', 'BD'),
(13, 'Belarus', 'BY'),
(14, 'Belgium', 'BE'),
(15, 'Bhutan', 'BT'),
(16, 'Bolivia', 'BO'),
(17, 'Bosnia and Herzegovina', 'BA'),
(18, 'Botswana', 'BW'),
(19, 'Brazil', 'BR'),
(20, 'Brunei', 'BN'),
(21, 'Bulgaria', 'BG'),
(22, 'Cambodia', 'KH'),
(23, 'Cameroon', 'CM'),
(24, 'Canada', 'CA'),
(25, 'Chile', 'CL'),
(26, 'China', 'CN'),
(27, 'Colombia', 'CO'),
(28, 'Costa Rica', 'CR'),
(29, 'Croatia', 'HR'),
(30, 'Cuba', 'CU'),
(31, 'Cyprus', 'CY'),
(32, 'Czech Republic', 'CZ'),
(33, 'Denmark', 'DK'),
(34, 'Dominican Republic', 'DO'),
(35, 'Ecuador', 'EC'),
(36, 'Egypt', 'EG'),
(37, 'El Salvador', 'SV'),
(38, 'Estonia', 'EE'),
(39, 'Ethiopia', 'ET'),
(40, 'Finland', 'FI'),
(41, 'France', 'FR'),
(42, 'Georgia', 'GE'),
(43, 'Germany', 'DE'),
(44, 'Ghana', 'GH'),
(45, 'Greece', 'GR'),
(46, 'Guatemala', 'GT'),
(47, 'Hungary', 'HU'),
(48, 'Iceland', 'IS'),
(49, 'India', 'IN'),
(50, 'Indonesia', 'ID'),
(51, 'Iran', 'IR'),
(52, 'Iraq', 'IQ'),
(53, 'Ireland', 'IE'),
(54, 'Israel', 'IL'),
(55, 'Italy', 'IT'),
(56, 'Jamaica', 'JM'),
(57, 'Japan', 'JP'),
(58, 'Jordan', 'JO'),
(59, 'Kazakhstan', 'KZ'),
(60, 'Kenya', 'KE'),
(61, 'Kuwait', 'KW'),
(62, 'Kyrgyzstan', 'KG'),
(63, 'Laos', 'LA'),
(64, 'Latvia', 'LV'),
(65, 'Lebanon', 'LB'),
(66, 'Libya', 'LY'),
(67, 'Lithuania', 'LT'),
(68, 'Luxembourg', 'LU'),
(69, 'Malaysia', 'MY'),
(70, 'Maldives', 'MV'),
(71, 'Mexico', 'MX'),
(72, 'Mongolia', 'MN'),
(73, 'Morocco', 'MA'),
(74, 'Myanmar', 'MM'),
(75, 'Nepal', 'NP'),
(76, 'Netherlands', 'NL'),
(77, 'New Zealand', 'NZ'),
(78, 'Nigeria', 'NG'),
(79, 'North Korea', 'KP'),
(80, 'Norway', 'NO'),
(81, 'Oman', 'OM'),
(82, 'Pakistan', 'PK'),
(83, 'Palestine', 'PS'),
(84, 'Panama', 'PA'),
(85, 'Paraguay', 'PY'),
(86, 'Peru', 'PE'),
(87, 'Philippines', 'PH'),
(88, 'Poland', 'PL'),
(89, 'Portugal', 'PT'),
(90, 'Qatar', 'QA'),
(91, 'Romania', 'RO'),
(92, 'Russia', 'RU'),
(93, 'Saudi Arabia', 'SA'),
(94, 'Serbia', 'RS'),
(95, 'Singapore', 'SG'),
(96, 'Slovakia', 'SK'),
(97, 'Slovenia', 'SI'),
(98, 'South Africa', 'ZA'),
(99, 'South Korea', 'KR'),
(100, 'Spain', 'ES'),
(101, 'Sri Lanka', 'LK'),
(102, 'Sudan', 'SD'),
(103, 'Sweden', 'SE'),
(104, 'Switzerland', 'CH'),
(105, 'Syria', 'SY'),
(106, 'Taiwan', 'TW'),
(107, 'Tajikistan', 'TJ'),
(108, 'Tanzania', 'TZ'),
(109, 'Thailand', 'TH'),
(110, 'Tunisia', 'TN'),
(111, 'Turkey', 'TR'),
(112, 'Turkmenistan', 'TM'),
(113, 'Uganda', 'UG'),
(114, 'Ukraine', 'UA'),
(115, 'United Arab Emirates', 'AE'),
(116, 'United Kingdom', 'GB'),
(117, 'United States', 'US'),
(118, 'Uruguay', 'UY'),
(119, 'Uzbekistan', 'UZ'),
(120, 'Venezuela', 'VE'),
(121, 'Vietnam', 'VN'),
(122, 'Yemen', 'YE'),
(123, 'Zambia', 'ZM'),
(124, 'Zimbabwe', 'ZW');

-- ============================================================================
-- TABLE 15 : tbl_cp_mstates
-- ============================================================================

INSERT IGNORE INTO tbl_cp_mstates 
(state_id, state_name, state_code, country_id) 
VALUES

-- =========================
-- INDIA STATES
-- =========================
(1,  'Andhra Pradesh', 'AP', 49),
(2,  'Arunachal Pradesh', 'AR', 49),
(3,  'Assam', 'AS', 49),
(4,  'Bihar', 'BR', 49),
(5,  'Chhattisgarh', 'CG', 49),
(6,  'Goa', 'GA', 49),
(7,  'Gujarat', 'GJ', 49),
(8,  'Haryana', 'HR', 49),
(9,  'Himachal Pradesh', 'HP', 49),
(10, 'Jharkhand', 'JH', 49),
(11, 'Karnataka', 'KA', 49),
(12, 'Kerala', 'KL', 49),
(13, 'Madhya Pradesh', 'MP', 49),
(14, 'Maharashtra', 'MH', 49),
(15, 'Manipur', 'MN', 49),
(16, 'Meghalaya', 'ML', 49),
(17, 'Mizoram', 'MZ', 49),
(18, 'Nagaland', 'NL', 49),
(19, 'Odisha', 'OD', 49),
(20, 'Punjab', 'PB', 49),
(21, 'Rajasthan', 'RJ', 49),
(22, 'Sikkim', 'SK', 49),
(23, 'Tamil Nadu', 'TN', 49),
(24, 'Telangana', 'TS', 49),
(25, 'Tripura', 'TR', 49),
(26, 'Uttar Pradesh', 'UP', 49),
(27, 'Uttarakhand', 'UK', 49),
(28, 'West Bengal', 'WB', 49),

-- =========================
-- UNION TERRITORIES
-- =========================
(29, 'Andaman and Nicobar Islands', 'AN', 49),
(30, 'Chandigarh', 'CH', 49),
(31, 'Dadra and Nagar Haveli and Daman and Diu', 'DH', 49),
(32, 'Delhi', 'DL', 49),
(33, 'Jammu and Kashmir', 'JK', 49),
(34, 'Ladakh', 'LA', 49),
(35, 'Lakshadweep', 'LD', 49),
(36, 'Puducherry', 'PY', 49);

INSERT IGNORE INTO tbl_cp_mstates 
(state_id, state_name, state_code, country_id) 
VALUES

-- =========================
-- UNITED STATES (country_id = 117)
-- =========================
(37, 'California', 'CA', 117),
(38, 'New York', 'NY', 117),
(39, 'Texas', 'TX', 117),
(40, 'Florida', 'FL', 117),
(41, 'Illinois', 'IL', 117),
(42, 'Washington', 'WA', 117),
(43, 'Massachusetts', 'MA', 117),

-- =========================
-- UNITED KINGDOM (country_id = 116)
-- =========================
(44, 'England', 'ENG', 116),
(45, 'Scotland', 'SCT', 116),
(46, 'Wales', 'WLS', 116),
(47, 'Northern Ireland', 'NIR', 116),

-- =========================
-- CANADA (country_id = 24)
-- =========================
(48, 'Ontario', 'ON', 24),
(49, 'British Columbia', 'BC', 24),
(50, 'Quebec', 'QC', 24),
(51, 'Alberta', 'AB', 24),

-- =========================
-- AUSTRALIA (country_id = 8)
-- =========================
(52, 'New South Wales', 'NSW', 8),
(53, 'Victoria', 'VIC', 8),
(54, 'Queensland', 'QLD', 8),
(55, 'Western Australia', 'WA', 8),

-- =========================
-- GERMANY (country_id = 43)
-- =========================
(56, 'Bavaria', 'BY', 43),
(57, 'Berlin', 'BE', 43),
(58, 'Hamburg', 'HH', 43),
(59, 'Baden-Wurttemberg', 'BW', 43),
(60, 'North Rhine-Westphalia', 'NW', 43),

-- =========================
-- FRANCE (country_id = 41)
-- =========================
(61, 'Ile-de-France', 'IDF', 41),
(62, 'Auvergne-Rhone-Alpes', 'ARA', 41),
(63, 'Provence-Alpes-Cote dAzur', 'PAC', 41),

-- =========================
-- JAPAN (country_id = 57)
-- =========================
(64, 'Tokyo', 'TK', 57),
(65, 'Osaka', 'OS', 57),
(66, 'Kyoto', 'KY', 57),
(67, 'Kanagawa', 'KN', 57),
(68, 'Hokkaido', 'HK', 57),

-- =========================
-- UNITED ARAB EMIRATES (country_id = 115)
-- =========================
(69, 'Dubai', 'DXB', 115),
(70, 'Abu Dhabi', 'AUH', 115),
(71, 'Sharjah', 'SHJ', 115),
(72, 'Ajman', 'AJM', 115),

-- =========================
-- SINGAPORE (country_id = 95)
-- =========================
(73, 'Singapore', 'SG', 95),

-- =========================
-- CHINA (country_id = 26)
-- =========================
(74, 'Beijing', 'BJ', 26),
(75, 'Shanghai', 'SH', 26),
(76, 'Guangdong', 'GD', 26),

-- =========================
-- RUSSIA (country_id = 92)
-- =========================
(77, 'Moscow', 'MOW', 92),
(78, 'Saint Petersburg', 'SPE', 92),

-- =========================
-- SOUTH KOREA (country_id = 99)
-- =========================
(79, 'Seoul', 'SEO', 99),
(80, 'Busan', 'BUS', 99),

-- =========================
-- BRAZIL (country_id = 19)
-- =========================
(81, 'Sao Paulo', 'SP', 19),
(82, 'Rio de Janeiro', 'RJ', 19),

-- =========================
-- SOUTH AFRICA (country_id = 98)
-- =========================
(83, 'Gauteng', 'GP', 98),
(84, 'Western Cape', 'WC', 98),

-- =========================
-- MEXICO (country_id = 71)
-- =========================
(85, 'Mexico City', 'CDMX', 71),
(86, 'Jalisco', 'JAL', 71),

-- =========================
-- ITALY (country_id = 55)
-- =========================
(87, 'Lombardy', 'LOM', 55),
(88, 'Lazio', 'LAZ', 55),

-- =========================
-- SPAIN (country_id = 100)
-- =========================
(89, 'Madrid', 'MAD', 100),
(90, 'Catalonia', 'CAT', 100),

-- =========================
-- NETHERLANDS (country_id = 76)
-- =========================
(91, 'North Holland', 'NH', 76),
(92, 'South Holland', 'ZH', 76),

-- =========================
-- SAUDI ARABIA (country_id = 93)
-- =========================
(93, 'Riyadh', 'RD', 93),
(94, 'Makkah', 'MK', 93),

-- =========================
-- INDONESIA (country_id = 50)
-- =========================
(95, 'Jakarta', 'JK', 50),
(96, 'West Java', 'JB', 50),

-- =========================
-- MALAYSIA (country_id = 69)
-- =========================
(97, 'Kuala Lumpur', 'KL', 69),
(98, 'Selangor', 'SGR', 69),

-- =========================
-- THAILAND (country_id = 109)
-- =========================
(99, 'Bangkok', 'BKK', 109),
(100, 'Chiang Mai', 'CNX', 109);

-- ============================================================================
-- TABLE 16 : tbl_cp_mcities
-- ============================================================================

INSERT IGNORE INTO tbl_cp_mcities (city_id, city_name, state_id) VALUES

-- =========================
-- ANDHRA PRADESH
-- =========================
(1, 'Visakhapatnam', 1),
(2, 'Vijayawada', 1),
(3, 'Guntur', 1),
(4, 'Nellore', 1),
(5, 'Kurnool', 1),
(6, 'Kadapa', 1),
(7, 'Tirupati', 1),
(8, 'Rajahmundry', 1),
(9, 'Kakinada', 1),
(10, 'Eluru', 1),
(11, 'Ongole', 1),
(12, 'Anantapur', 1),
(13, 'Vizianagaram', 1),
(14, 'Srikakulam', 1),
(15, 'Machilipatnam', 1),

-- =========================
-- ARUNACHAL PRADESH
-- =========================
(16, 'Itanagar', 2),
(17, 'Naharlagun', 2),
(18, 'Pasighat', 2),

-- =========================
-- ASSAM
-- =========================
(19, 'Guwahati', 3),
(20, 'Silchar', 3),
(21, 'Dibrugarh', 3),
(22, 'Jorhat', 3),

-- =========================
-- BIHAR
-- =========================
(23, 'Patna', 4),
(24, 'Gaya', 4),
(25, 'Muzaffarpur', 4),
(26, 'Bhagalpur', 4),

-- =========================
-- CHHATTISGARH
-- =========================
(27, 'Raipur', 5),
(28, 'Bhilai', 5),
(29, 'Bilaspur', 5),

-- =========================
-- GOA
-- =========================
(30, 'Panaji', 6),
(31, 'Margao', 6),

-- =========================
-- GUJARAT
-- =========================
(32, 'Ahmedabad', 7),
(33, 'Surat', 7),
(34, 'Vadodara', 7),
(35, 'Rajkot', 7),
(36, 'Bhavnagar', 7),

-- =========================
-- HARYANA
-- =========================
(37, 'Gurugram', 8),
(38, 'Faridabad', 8),
(39, 'Panipat', 8),
(40, 'Ambala', 8),

-- =========================
-- HIMACHAL PRADESH
-- =========================
(41, 'Shimla', 9),
(42, 'Dharamshala', 9),
(43, 'Manali', 9),

-- =========================
-- JHARKHAND
-- =========================
(44, 'Ranchi', 10),
(45, 'Jamshedpur', 10),
(46, 'Dhanbad', 10),

-- =========================
-- KARNATAKA
-- =========================
(47, 'Bengaluru', 11),
(48, 'Mysuru', 11),
(49, 'Hubballi', 11),
(50, 'Mangaluru', 11),
(51, 'Belagavi', 11),

-- =========================
-- KERALA
-- =========================
(52, 'Thiruvananthapuram', 12),
(53, 'Kochi', 12),
(54, 'Kozhikode', 12),
(55, 'Thrissur', 12),

-- =========================
-- MADHYA PRADESH
-- =========================
(56, 'Bhopal', 13),
(57, 'Indore', 13),
(58, 'Jabalpur', 13),
(59, 'Gwalior', 13),

-- =========================
-- MAHARASHTRA
-- =========================
(60, 'Mumbai', 14),
(61, 'Pune', 14),
(62, 'Nagpur', 14),
(63, 'Nashik', 14),
(64, 'Aurangabad', 14),

-- =========================
-- MANIPUR
-- =========================
(65, 'Imphal', 15),

-- =========================
-- MEGHALAYA
-- =========================
(66, 'Shillong', 16),

-- =========================
-- MIZORAM
-- =========================
(67, 'Aizawl', 17),

-- =========================
-- NAGALAND
-- =========================
(68, 'Kohima', 18),
(69, 'Dimapur', 18),

-- =========================
-- ODISHA
-- =========================
(70, 'Bhubaneswar', 19),
(71, 'Cuttack', 19),
(72, 'Rourkela', 19),
(73, 'Sambalpur', 19),

-- =========================
-- PUNJAB
-- =========================
(74, 'Ludhiana', 20),
(75, 'Amritsar', 20),
(76, 'Jalandhar', 20),
(77, 'Patiala', 20),

-- =========================
-- RAJASTHAN
-- =========================
(78, 'Jaipur', 21),
(79, 'Jodhpur', 21),
(80, 'Udaipur', 21),
(81, 'Kota', 21),

-- =========================
-- SIKKIM
-- =========================
(82, 'Gangtok', 22),

-- =========================
-- TAMIL NADU
-- =========================
(83, 'Chennai', 23),
(84, 'Coimbatore', 23),
(85, 'Madurai', 23),
(86, 'Salem', 23),
(87, 'Tiruchirappalli', 23),

-- =========================
-- TELANGANA
-- =========================
(88, 'Hyderabad', 24),
(89, 'Warangal', 24),
(90, 'Karimnagar', 24),
(91, 'Nizamabad', 24),

-- =========================
-- TRIPURA
-- =========================
(92, 'Agartala', 25),

-- =========================
-- UTTAR PRADESH
-- =========================
(93, 'Lucknow', 26),
(94, 'Kanpur', 26),
(95, 'Noida', 26),
(96, 'Agra', 26),
(97, 'Varanasi', 26),

-- =========================
-- UTTARAKHAND
-- =========================
(98, 'Dehradun', 27),
(99, 'Haridwar', 27),
(100, 'Rishikesh', 27),

-- =========================
-- WEST BENGAL
-- =========================
(101, 'Kolkata', 28),
(102, 'Siliguri', 28),
(103, 'Durgapur', 28),

-- =========================
-- UNION TERRITORIES
-- =========================
(104, 'Port Blair', 29),
(105, 'Chandigarh', 30),
(106, 'Daman', 31),
(107, 'Delhi', 32),
(108, 'Srinagar', 33),
(109, 'Jammu', 33),
(110, 'Leh', 34),
(111, 'Kavaratti', 35),
(112, 'Puducherry', 36),

-- =========================
-- UNITED STATES
-- =========================
(113, 'Los Angeles', 37),
(114, 'San Francisco', 37),
(115, 'San Diego', 37),
(116, 'New York City', 38),
(117, 'Houston', 39),
(118, 'Dallas', 39),
(119, 'Miami', 40),
(120, 'Chicago', 41),
(121, 'Seattle', 42),
(122, 'Boston', 43),

-- =========================
-- UNITED KINGDOM
-- =========================
(123, 'London', 44),
(124, 'Manchester', 44),
(125, 'Glasgow', 45),
(126, 'Cardiff', 46),
(127, 'Belfast', 47),

-- =========================
-- CANADA
-- =========================
(128, 'Toronto', 48),
(129, 'Ottawa', 48),
(130, 'Vancouver', 49),
(131, 'Montreal', 50),
(132, 'Calgary', 51),

-- =========================
-- AUSTRALIA
-- =========================
(133, 'Sydney', 52),
(134, 'Melbourne', 53),
(135, 'Brisbane', 54),
(136, 'Perth', 55),

-- =========================
-- GERMANY
-- =========================
(137, 'Munich', 56),
(138, 'Berlin', 57),
(139, 'Hamburg', 58),
(140, 'Stuttgart', 59),
(141, 'Cologne', 60),

-- =========================
-- FRANCE
-- =========================
(142, 'Paris', 61),
(143, 'Lyon', 62),
(144, 'Marseille', 63),

-- =========================
-- JAPAN
-- =========================
(145, 'Tokyo', 64),
(146, 'Osaka', 65),
(147, 'Kyoto', 66),
(148, 'Yokohama', 67),
(149, 'Sapporo', 68),

-- =========================
-- UAE
-- =========================
(150, 'Dubai', 69),
(151, 'Abu Dhabi', 70),
(152, 'Sharjah', 71),
(153, 'Ajman', 72),

-- =========================
-- SINGAPORE
-- =========================
(154, 'Singapore', 73),

-- =========================
-- CHINA
-- =========================
(155, 'Beijing', 74),
(156, 'Shanghai', 75),
(157, 'Guangzhou', 76),
(158, 'Shenzhen', 76),

-- =========================
-- RUSSIA
-- =========================
(159, 'Moscow', 77),
(160, 'Saint Petersburg', 78),

-- =========================
-- SOUTH KOREA
-- =========================
(161, 'Seoul', 79),
(162, 'Busan', 80),

-- =========================
-- BRAZIL
-- =========================
(163, 'Sao Paulo', 81),
(164, 'Rio de Janeiro', 82),

-- =========================
-- SOUTH AFRICA
-- =========================
(165, 'Johannesburg', 83),
(166, 'Cape Town', 84),

-- =========================
-- MEXICO
-- =========================
(167, 'Mexico City', 85),
(168, 'Guadalajara', 86),

-- =========================
-- ITALY
-- =========================
(169, 'Milan', 87),
(170, 'Rome', 88),

-- =========================
-- SPAIN
-- =========================
(171, 'Madrid', 89),
(172, 'Barcelona', 90),

-- =========================
-- NETHERLANDS
-- =========================
(173, 'Amsterdam', 91),
(174, 'Rotterdam', 92),

-- =========================
-- SAUDI ARABIA
-- =========================
(175, 'Riyadh', 93),
(176, 'Mecca', 94),
(177, 'Jeddah', 94),

-- =========================
-- INDONESIA
-- =========================
(178, 'Jakarta', 95),
(179, 'Bandung', 96),

-- =========================
-- MALAYSIA
-- =========================
(180, 'Kuala Lumpur', 97),
(181, 'Shah Alam', 98),

-- =========================
-- THAILAND
-- =========================
(182, 'Bangkok', 99),
(183, 'Chiang Mai', 100);

-- ============================================================================
-- TABLE 17 : tbl_cp_mpincodes
-- India: real 6-digit pincodes
-- Other countries: representative postal codes
-- ============================================================================

INSERT IGNORE INTO tbl_cp_mpincodes (pincode_id, pincode, city_id, area_name) VALUES

-- ── Andhra Pradesh ────────────────────────────────────────────────────────────
(1,  '530001', 1,  'Visakhapatnam HO'),
(2,  '520001', 2,  'Vijayawada HO'),
(3,  '522001', 3,  'Guntur HO'),
(4,  '524001', 4,  'Nellore HO'),
(5,  '518001', 5,  'Kurnool HO'),
(6,  '516001', 6,  'Kadapa HO'),
(7,  '517501', 7,  'Tirupati HO'),
(8,  '533101', 8,  'Rajahmundry HO'),
(9,  '533001', 9,  'Kakinada HO'),
(10, '534001', 10, 'Eluru HO'),
(11, '523001', 11, 'Ongole HO'),
(12, '515001', 12, 'Anantapur HO'),
(13, '517001', 13, 'Chittoor HO'),
(14, '532001', 14, 'Srikakulam HO'),
(15, '535001', 15, 'Vizianagaram HO'),

-- ── Arunachal Pradesh ────────────────────────────────────────────────────────
(16, '791111', 16, 'Itanagar HO'),
(17, '791110', 17, 'Naharlagun HO'),
(18, '791102', 18, 'Pasighat HO'),
(19, '790104', 19, 'Tawang HO'),
(20, '791120', 20, 'Ziro HO'),

-- ── Assam ─────────────────────────────────────────────────────────────────────
(21, '781001', 21, 'Guwahati HO'),
(22, '788001', 22, 'Silchar HO'),
(23, '786001', 23, 'Dibrugarh HO'),
(24, '785001', 24, 'Jorhat HO'),
(25, '782001', 25, 'Nagaon HO'),
(26, '786125', 26, 'Tinsukia HO'),
(27, '784001', 27, 'Tezpur HO'),
(28, '783380', 28, 'Bongaigaon HO'),
(29, '783301', 29, 'Dhubri HO'),
(30, '788710', 30, 'Karimganj HO'),

-- ── Bihar ─────────────────────────────────────────────────────────────────────
(31, '800001', 31, 'Patna HO'),
(32, '823001', 32, 'Gaya HO'),
(33, '812001', 33, 'Bhagalpur HO'),
(34, '842001', 34, 'Muzaffarpur HO'),
(35, '854301', 35, 'Purnia HO'),
(36, '846001', 36, 'Darbhanga HO'),
(37, '802301', 37, 'Arrah HO'),
(38, '851101', 38, 'Begusarai HO'),
(39, '854105', 39, 'Katihar HO'),
(40, '811201', 40, 'Munger HO'),
(41, '841301', 41, 'Chapra HO'),
(42, '844101', 42, 'Hajipur HO'),
(43, '841226', 43, 'Siwan HO'),
(44, '852201', 44, 'Saharsa HO'),
(45, '821115', 45, 'Sasaram HO'),

-- ── Chhattisgarh ─────────────────────────────────────────────────────────────
(46, '492001', 46, 'Raipur HO'),
(47, '490001', 47, 'Bhilai HO'),
(48, '495677', 48, 'Korba HO'),
(49, '495001', 49, 'Bilaspur HO'),
(50, '491001', 50, 'Durg HO'),
(51, '491441', 51, 'Rajnandgaon HO'),
(52, '494001', 52, 'Jagdalpur HO'),
(53, '497001', 53, 'Ambikapur HO'),
(54, '496001', 54, 'Raigarh HO'),
(55, '493773', 55, 'Dhamtari HO'),

-- ── Goa ───────────────────────────────────────────────────────────────────────
(56, '403001', 56, 'Panaji HO'),
(57, '403601', 57, 'Margao HO'),
(58, '403802', 58, 'Vasco da Gama HO'),
(59, '403507', 59, 'Mapusa HO'),
(60, '403401', 60, 'Ponda HO'),
(61, '403529', 61, 'Bicholim HO'),

-- ── Gujarat ───────────────────────────────────────────────────────────────────
(62, '380001', 62, 'Ahmedabad HO'),
(63, '395001', 63, 'Surat HO'),
(64, '390001', 64, 'Vadodara HO'),
(65, '360001', 65, 'Rajkot HO'),
(66, '364001', 66, 'Bhavnagar HO'),
(67, '361001', 67, 'Jamnagar HO'),
(68, '362001', 68, 'Junagadh HO'),
(69, '382001', 69, 'Gandhinagar HO'),
(70, '388001', 70, 'Anand HO'),
(71, '396445', 71, 'Navsari HO'),
(72, '363641', 72, 'Morbi HO'),
(73, '387001', 73, 'Nadiad HO'),
(74, '363001', 74, 'Surendranagar HO'),
(75, '392001', 75, 'Bharuch HO'),
(76, '384001', 76, 'Mehsana HO'),

-- ── Haryana ───────────────────────────────────────────────────────────────────
(77, '122001', 77, 'Gurugram HO'),
(78, '121001', 78, 'Faridabad HO'),
(79, '132103', 79, 'Panipat HO'),
(80, '134003', 80, 'Ambala HO'),
(81, '135001', 81, 'Yamunanagar HO'),
(82, '124001', 82, 'Rohtak HO'),
(83, '125001', 83, 'Hisar HO'),
(84, '132001', 84, 'Karnal HO'),
(85, '131001', 85, 'Sonipat HO'),
(86, '134109', 86, 'Panchkula HO'),
(87, '127021', 87, 'Bhiwani HO'),
(88, '125055', 88, 'Sirsa HO'),
(89, '124507', 89, 'Bahadurgarh HO'),
(90, '126102', 90, 'Jind HO'),
(91, '136118', 91, 'Thanesar HO'),

-- ── Himachal Pradesh ─────────────────────────────────────────────────────────
(92,  '171001', 92,  'Shimla HO'),
(93,  '175001', 93,  'Mandi HO'),
(94,  '173212', 94,  'Solan HO'),
(95,  '176215', 95,  'Dharamsala HO'),
(96,  '175101', 96,  'Kullu HO'),
(97,  '175131', 97,  'Manali HO'),
(98,  '177001', 98,  'Hamirpur HO'),
(99,  '174303', 99,  'Una HO'),
(100, '173001', 100, 'Nahan HO'),
(101, '176061', 101, 'Palampur HO'),

-- ── Jharkhand ────────────────────────────────────────────────────────────────
(102, '834001', 102, 'Ranchi HO'),
(103, '831001', 103, 'Jamshedpur HO'),
(104, '826001', 104, 'Dhanbad HO'),
(105, '827001', 105, 'Bokaro HO'),
(106, '814112', 106, 'Deoghar HO'),
(107, '825301', 107, 'Hazaribagh HO'),
(108, '815301', 108, 'Giridih HO'),
(109, '829122', 109, 'Ramgarh HO'),
(110, '822101', 110, 'Medininagar HO'),
(111, '828111', 111, 'Phusro HO'),

-- ── Karnataka ────────────────────────────────────────────────────────────────
(112, '560001', 112, 'Bengaluru HO'),
(113, '570001', 113, 'Mysuru HO'),
(114, '580001', 114, 'Hubballi HO'),
(115, '575001', 115, 'Mangaluru HO'),
(116, '590001', 116, 'Belagavi HO'),
(117, '585101', 117, 'Kalaburagi HO'),
(118, '583101', 118, 'Ballari HO'),
(119, '586101', 119, 'Vijayapura HO'),
(120, '577201', 120, 'Shivamogga HO'),
(121, '572101', 121, 'Tumakuru HO'),
(122, '577001', 122, 'Davangere HO'),
(123, '585401', 123, 'Bidar HO'),
(124, '576101', 124, 'Udupi HO'),
(125, '573201', 125, 'Hassan HO'),
(126, '577501', 126, 'Chitradurga HO'),

-- ── Kerala ───────────────────────────────────────────────────────────────────
(127, '695001', 127, 'Thiruvananthapuram HO'),
(128, '682001', 128, 'Kochi HO'),
(129, '673001', 129, 'Kozhikode HO'),
(130, '680001', 130, 'Thrissur HO'),
(131, '691001', 131, 'Kollam HO'),
(132, '670001', 132, 'Kannur HO'),
(133, '688001', 133, 'Alappuzha HO'),
(134, '678001', 134, 'Palakkad HO'),
(135, '676501', 135, 'Malappuram HO'),
(136, '686001', 136, 'Kottayam HO'),
(137, '671121', 137, 'Kasaragod HO'),
(138, '689001', 138, 'Pathanamthitta HO'),
(139, '682011', 139, 'Ernakulam HO'),

-- ── Madhya Pradesh ───────────────────────────────────────────────────────────
(140, '462001', 140, 'Bhopal HO'),
(141, '452001', 141, 'Indore HO'),
(142, '482001', 142, 'Jabalpur HO'),
(143, '474001', 143, 'Gwalior HO'),
(144, '456001', 144, 'Ujjain HO'),
(145, '470001', 145, 'Sagar HO'),
(146, '455001', 146, 'Dewas HO'),
(147, '485001', 147, 'Satna HO'),
(148, '457001', 148, 'Ratlam HO'),
(149, '486001', 149, 'Rewa HO'),
(150, '486889', 150, 'Singrauli HO'),
(151, '450331', 151, 'Burhanpur HO'),
(152, '450001', 152, 'Khandwa HO'),
(153, '477001', 153, 'Bhind HO'),

-- ── Maharashtra ──────────────────────────────────────────────────────────────
(154, '400001', 154, 'Mumbai HO'),
(155, '411001', 155, 'Pune HO'),
(156, '440001', 156, 'Nagpur HO'),
(157, '422001', 157, 'Nashik HO'),
(158, '400601', 158, 'Thane HO'),
(159, '431001', 159, 'Aurangabad HO'),
(160, '413001', 160, 'Solapur HO'),
(161, '444601', 161, 'Amravati HO'),
(162, '400701', 162, 'Navi Mumbai HO'),
(163, '416001', 163, 'Kolhapur HO'),
(164, '444001', 164, 'Akola HO'),
(165, '413512', 165, 'Latur HO'),
(166, '424001', 166, 'Dhule HO'),
(167, '414001', 167, 'Ahmednagar HO'),
(168, '442401', 168, 'Chandrapur HO'),
(169, '425001', 169, 'Jalgaon HO'),
(170, '431601', 170, 'Nanded HO'),
(171, '423203', 171, 'Malegaon HO'),
(172, '416416', 172, 'Sangli HO'),
(173, '431203', 173, 'Jalna HO'),

-- ── Manipur ──────────────────────────────────────────────────────────────────
(174, '795001', 174, 'Imphal HO'),
(175, '795138', 175, 'Thoubal HO'),
(176, '795133', 176, 'Bishnupur HO'),
(177, '795128', 177, 'Churachandpur HO'),
(178, '795106', 178, 'Senapati HO'),

-- ── Meghalaya ────────────────────────────────────────────────────────────────
(179, '793001', 179, 'Shillong HO'),
(180, '794001', 180, 'Tura HO'),
(181, '793150', 181, 'Jowai HO'),
(182, '793119', 182, 'Nongstoin HO'),
(183, '794102', 183, 'Baghmara HO'),

-- ── Mizoram ──────────────────────────────────────────────────────────────────
(184, '796001', 184, 'Aizawl HO'),
(185, '796701', 185, 'Lunglei HO'),
(186, '796321', 186, 'Champhai HO'),
(187, '796181', 187, 'Serchhip HO'),
(188, '796081', 188, 'Kolasib HO'),

-- ── Nagaland ─────────────────────────────────────────────────────────────────
(189, '797001', 189, 'Kohima HO'),
(190, '797112', 190, 'Dimapur HO'),
(191, '798601', 191, 'Mokokchung HO'),
(192, '798612', 192, 'Tuensang HO'),
(193, '797111', 193, 'Wokha HO'),

-- ── Odisha ───────────────────────────────────────────────────────────────────
(194, '751001', 194, 'Bhubaneswar HO'),
(195, '753001', 195, 'Cuttack HO'),
(196, '769001', 196, 'Rourkela HO'),
(197, '760001', 197, 'Brahmapur HO'),
(198, '768001', 198, 'Sambalpur HO'),
(199, '752001', 199, 'Puri HO'),
(200, '756001', 200, 'Balasore HO'),
(201, '756100', 201, 'Bhadrak HO'),
(202, '757001', 202, 'Baripada HO'),
(203, '768201', 203, 'Jharsuguda HO'),
(204, '764001', 204, 'Jeypore HO'),
(205, '759122', 205, 'Angul HO'),
(206, '759001', 206, 'Dhenkanal HO'),
(207, '758001', 207, 'Kendujhar HO'),
(208, '765001', 208, 'Rayagada HO'),

-- ── Punjab ───────────────────────────────────────────────────────────────────
(209, '141001', 209, 'Ludhiana HO'),
(210, '143001', 210, 'Amritsar HO'),
(211, '144001', 211, 'Jalandhar HO'),
(212, '147001', 212, 'Patiala HO'),
(213, '151001', 213, 'Bathinda HO'),
(214, '160055', 214, 'Mohali HO'),
(215, '152001', 215, 'Firozpur HO'),
(216, '145001', 216, 'Pathankot HO'),
(217, '146001', 217, 'Hoshiarpur HO'),
(218, '143505', 218, 'Batala HO'),
(219, '142001', 219, 'Moga HO'),
(220, '152116', 220, 'Abohar HO'),
(221, '148023', 221, 'Malerkotla HO'),
(222, '141401', 222, 'Khanna HO'),
(223, '144401', 223, 'Phagwara HO'),

-- ── Rajasthan ────────────────────────────────────────────────────────────────
(224, '302001', 224, 'Jaipur HO'),
(225, '342001', 225, 'Jodhpur HO'),
(226, '324001', 226, 'Kota HO'),
(227, '334001', 227, 'Bikaner HO'),
(228, '305001', 228, 'Ajmer HO'),
(229, '313001', 229, 'Udaipur HO'),
(230, '311001', 230, 'Bhilwara HO'),
(231, '301001', 231, 'Alwar HO'),
(232, '321001', 232, 'Bharatpur HO'),
(233, '332001', 233, 'Sikar HO'),
(234, '306401', 234, 'Pali HO'),
(235, '335001', 235, 'Sri Ganganagar HO'),
(236, '304001', 236, 'Tonk HO'),
(237, '344001', 237, 'Barmer HO'),
(238, '331001', 238, 'Churu HO'),

-- ── Sikkim ───────────────────────────────────────────────────────────────────
(239, '737101', 239, 'Gangtok HO'),
(240, '737126', 240, 'Namchi HO'),
(241, '737111', 241, 'Gyalshing HO'),
(242, '737116', 242, 'Mangan HO'),
(243, '737132', 243, 'Rangpo HO'),

-- ── Tamil Nadu ───────────────────────────────────────────────────────────────
(244, '600001', 244, 'Chennai HO'),
(245, '641001', 245, 'Coimbatore HO'),
(246, '625001', 246, 'Madurai HO'),
(247, '620001', 247, 'Tiruchirappalli HO'),
(248, '636001', 248, 'Salem HO'),
(249, '627001', 249, 'Tirunelveli HO'),
(250, '641601', 250, 'Tiruppur HO'),
(251, '638001', 251, 'Erode HO'),
(252, '632001', 252, 'Vellore HO'),
(253, '628001', 253, 'Thoothukkudi HO'),
(254, '624001', 254, 'Dindigul HO'),
(255, '613001', 255, 'Thanjavur HO'),
(256, '632401', 256, 'Ranipet HO'),
(257, '626123', 257, 'Sivakasi HO'),
(258, '639001', 258, 'Karur HO'),

-- ── Telangana ────────────────────────────────────────────────────────────────
(259, '500001', 259, 'Hyderabad HO'),
(260, '506001', 260, 'Warangal HO'),
(261, '503001', 261, 'Nizamabad HO'),
(262, '505001', 262, 'Karimnagar HO'),
(263, '507001', 263, 'Khammam HO'),
(264, '505208', 264, 'Ramagundam HO'),
(265, '509001', 265, 'Mahbubnagar HO'),
(266, '508001', 266, 'Nalgonda HO'),
(267, '504001', 267, 'Adilabad HO'),
(268, '508213', 268, 'Suryapet HO'),
(269, '508207', 269, 'Miryalaguda HO'),
(270, '505327', 270, 'Jagtial HO'),
(271, '504208', 271, 'Mancherial HO'),
(272, '502103', 272, 'Siddipet HO'),
(273, '503185', 273, 'Bodhan HO'),

-- ── Tripura ──────────────────────────────────────────────────────────────────
(274, '799001', 274, 'Agartala HO'),
(275, '799120', 275, 'Udaipur HO'),
(276, '799253', 276, 'Dharmanagar HO'),
(277, '799277', 277, 'Kailashahar HO'),
(278, '799155', 278, 'Belonia HO'),

-- ── Uttar Pradesh ────────────────────────────────────────────────────────────
(279, '226001', 279, 'Lucknow HO'),
(280, '208001', 280, 'Kanpur HO'),
(281, '201001', 281, 'Ghaziabad HO'),
(282, '282001', 282, 'Agra HO'),
(283, '221001', 283, 'Varanasi HO'),
(284, '250001', 284, 'Meerut HO'),
(285, '211001', 285, 'Prayagraj HO'),
(286, '243001', 286, 'Bareilly HO'),
(287, '202001', 287, 'Aligarh HO'),
(288, '244001', 288, 'Moradabad HO'),
(289, '247001', 289, 'Saharanpur HO'),
(290, '273001', 290, 'Gorakhpur HO'),
(291, '201301', 291, 'Noida HO'),
(292, '283203', 292, 'Firozabad HO'),
(293, '284001', 293, 'Jhansi HO'),
(294, '281001', 294, 'Mathura HO'),
(295, '251001', 295, 'Muzaffarnagar HO'),
(296, '244901', 296, 'Rampur HO'),
(297, '242001', 297, 'Shahjahanpur HO'),
(298, '245101', 298, 'Hapur HO'),

-- ── Uttarakhand ──────────────────────────────────────────────────────────────
(299, '248001', 299, 'Dehradun HO'),
(300, '249401', 300, 'Haridwar HO'),
(301, '247667', 301, 'Roorkee HO'),
(302, '263139', 302, 'Haldwani HO'),
(303, '263153', 303, 'Rudrapur HO'),
(304, '244713', 304, 'Kashipur HO'),
(305, '249201', 305, 'Rishikesh HO'),
(306, '262501', 306, 'Pithoragarh HO'),
(307, '244715', 307, 'Ramnagar HO'),
(308, '246149', 308, 'Kotdwar HO'),

-- ── West Bengal ──────────────────────────────────────────────────────────────
(309, '700001', 309, 'Kolkata HO'),
(310, '711101', 310, 'Howrah HO'),
(311, '713201', 311, 'Durgapur HO'),
(312, '713301', 312, 'Asansol HO'),
(313, '734001', 313, 'Siliguri HO'),
(314, '713101', 314, 'Bardhaman HO'),
(315, '732101', 315, 'Malda HO'),
(316, '700124', 316, 'Barasat HO'),
(317, '721301', 317, 'Kharagpur HO'),
(318, '741302', 318, 'Shantipur HO'),
(319, '734101', 319, 'Darjeeling HO'),
(320, '735101', 320, 'Jalpaiguri HO'),
(321, '736101', 321, 'Cooch Behar HO'),
(322, '721602', 322, 'Haldia HO'),
(323, '733134', 323, 'Raiganj HO'),

-- ── Delhi ─────────────────────────────────────────────────────────────────────
(324, '110001', 324, 'New Delhi HO'),
(325, '110006', 325, 'North Delhi HO'),
(326, '110003', 326, 'South Delhi HO'),
(327, '110051', 327, 'East Delhi HO'),
(328, '110018', 328, 'West Delhi HO'),
(329, '110002', 329, 'Central Delhi HO'),
(330, '110075', 330, 'Dwarka HO'),
(331, '110085', 331, 'Rohini HO'),

-- ── Jammu & Kashmir ──────────────────────────────────────────────────────────
(332, '190001', 332, 'Srinagar HO'),
(333, '180001', 333, 'Jammu HO'),
(334, '192101', 334, 'Anantnag HO'),
(335, '193101', 335, 'Baramulla HO'),
(336, '193201', 336, 'Sopore HO'),
(337, '184141', 337, 'Kathua HO'),
(338, '182101', 338, 'Udhampur HO'),
(339, '192301', 339, 'Pulwama HO'),
(340, '193222', 340, 'Kupwara HO'),
(341, '185101', 341, 'Poonch HO'),

-- ── Ladakh ───────────────────────────────────────────────────────────────────
(342, '194101', 342, 'Leh HO'),
(343, '194103', 343, 'Kargil HO'),

-- ── Andaman & Nicobar ────────────────────────────────────────────────────────
(344, '744101', 344, 'Port Blair HO'),
(345, '744202', 345, 'Diglipur HO'),
(346, '744301', 346, 'Car Nicobar HO'),

-- ── Chandigarh ───────────────────────────────────────────────────────────────
(347, '160001', 347, 'Chandigarh HO'),

-- ── Dadra & Nagar Haveli and Daman & Diu ─────────────────────────────────────
(348, '396210', 348, 'Daman HO'),
(349, '362520', 349, 'Diu HO'),
(350, '396230', 350, 'Silvassa HO'),

-- ── Lakshadweep ──────────────────────────────────────────────────────────────
(351, '682555', 351, 'Kavaratti HO'),

-- ── Puducherry ───────────────────────────────────────────────────────────────
(352, '605001', 352, 'Puducherry HO'),
(353, '609601', 353, 'Karaikal HO'),
(354, '673310', 354, 'Mahe HO'),
(355, '533464', 355, 'Yanam HO'),

-- ── USA ───────────────────────────────────────────────────────────────────────
(356, '90001', 356, 'Los Angeles Downtown'),
(357, '94102', 357, 'San Francisco Downtown'),
(358, '95101', 358, 'San Jose Downtown'),
(359, '92101', 359, 'San Diego Downtown'),
(360, '10001', 360, 'New York City Manhattan'),
(361, '14201', 361, 'Buffalo Downtown'),
(362, '77001', 362, 'Houston Downtown'),
(363, '75201', 363, 'Dallas Downtown'),
(364, '73301', 364, 'Austin Downtown'),
(365, '33101', 365, 'Miami Downtown'),
(366, '32801', 366, 'Orlando Downtown'),
(367, '60601', 367, 'Chicago Downtown'),
(368, '98101', 368, 'Seattle Downtown'),
(369, '02101', 369, 'Boston Downtown'),

-- ── UK ───────────────────────────────────────────────────────────────────────
(370, 'EC1A1BB', 370, 'London City'),
(371, 'M11AE',   371, 'Manchester City Centre'),
(372, 'B11BB',   372, 'Birmingham City Centre'),
(373, 'LS11BA',  373, 'Leeds City Centre'),
(374, 'L11AA',   374, 'Liverpool City Centre'),
(375, 'BS11AA',  375, 'Bristol City Centre'),
(376, 'G11AA',   376, 'Glasgow City Centre'),
(377, 'EH11BB',  377, 'Edinburgh City Centre'),
(378, 'CF101AA', 378, 'Cardiff City Centre'),
(379, 'BT11AA',  379, 'Belfast City Centre'),

-- ── Canada ───────────────────────────────────────────────────────────────────
(380, 'M5V2T6', 380, 'Toronto Downtown'),
(381, 'K1A0A9', 381, 'Ottawa Downtown'),
(382, 'V6B1A1', 382, 'Vancouver Downtown'),
(383, 'H2Y1C6', 383, 'Montreal Downtown'),
(384, 'G1R2J5', 384, 'Quebec City Downtown'),
(385, 'T2P1J9', 385, 'Calgary Downtown'),
(386, 'T5J0N3', 386, 'Edmonton Downtown'),

-- ── Australia ────────────────────────────────────────────────────────────────
(387, '2000', 387, 'Sydney CBD'),
(388, '2601', 388, 'Canberra CBD'),
(389, '3000', 389, 'Melbourne CBD'),
(390, '4000', 390, 'Brisbane CBD'),
(391, '4217', 391, 'Gold Coast CBD'),
(392, '6000', 392, 'Perth CBD'),

-- ── Germany ──────────────────────────────────────────────────────────────────
(393, '80331', 393, 'Munich City Centre'),
(394, '10115', 394, 'Berlin City Centre'),
(395, '20095', 395, 'Hamburg City Centre'),
(396, '70173', 396, 'Stuttgart City Centre'),
(397, '50667', 397, 'Cologne City Centre'),
(398, '40213', 398, 'Dusseldorf City Centre'),
(399, '60311', 399, 'Frankfurt City Centre'),

-- ── France ───────────────────────────────────────────────────────────────────
(400, '75001', 400, 'Paris 1st Arrondissement'),
(401, '69001', 401, 'Lyon City Centre'),
(402, '13001', 402, 'Marseille City Centre'),
(403, '06000', 403, 'Nice City Centre'),

-- ── Japan ────────────────────────────────────────────────────────────────────
(404, '100-0001', 404, 'Tokyo Chiyoda'),
(405, '530-0001', 405, 'Osaka Kita'),
(406, '600-8216', 406, 'Kyoto City Centre'),
(407, '220-0011', 407, 'Yokohama Nishi'),
(408, '060-0001', 408, 'Sapporo Chuo'),

-- ── UAE ──────────────────────────────────────────────────────────────────────
(409, '00000', 409, 'Dubai Downtown'),
(410, '00001', 410, 'Abu Dhabi Downtown'),
(411, '00002', 411, 'Sharjah Downtown'),
(412, '00003', 412, 'Ajman Downtown'),
(413, '00004', 413, 'Al Ain Downtown'),
(414, '00005', 414, 'Ras Al Khaimah Downtown'),

-- ── Singapore ────────────────────────────────────────────────────────────────
(415, '018956', 415, 'Singapore Downtown Core');

-- ============================================================================

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================================
-- FINAL COUNT SUMMARY
-- tbl_cp_mcountries :  10 rows
-- tbl_cp_mstates    :  73 rows (36 India + 37 other countries)
-- tbl_cp_mcities    : 415 rows (355 India + 60 other countries)
-- tbl_cp_mpincodes  : 415 rows (one per city)
-- TOTAL             : 913 rows
-- ============================================================================

-- ============================================================================
-- CAMPUS5 - SEED DATA FOR GROUP D (Education Structure)
-- Tables: tbl_cp_msemester (31), tbl_cp_msubjects (32),
--         tbl_cp_college_sem_subject (33)
-- Follows Indian education system & Internshala structure
-- ============================================================================

SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================================
-- TABLE 31 : tbl_cp_msemester
-- semester_id | course_id | semester_number | semester_name
-- NOTE: course_ids refer to tbl_cp_mcourses seeded in Group A
--   BTech      = course_ids 1-12   (8 semesters each)
--   BE         = course_ids 13-18  (8 semesters each)
--   MTech      = course_ids 19-25  (4 semesters each)
--   MCA        = course_ids 26-28  (6 semesters each)
--   BCA        = course_ids 29-31  (6 semesters each)
--   MBA        = course_ids 32-40  (4 semesters each)
--   BBA        = course_ids 41-45  (6 semesters each)
--   BSc        = course_ids 46-55  (6 semesters each)
--   MSc        = course_ids 56-63  (4 semesters each)
--   BCom       = course_ids 64-67  (6 semesters each)
--   MCom       = course_ids 68-70  (4 semesters each)
--   BA         = course_ids 71-78  (6 semesters each)
--   MA         = course_ids 79-83  (4 semesters each)
--   Diploma    = course_ids 84-89  (6 semesters each)
--   LLB        = course_id  90     (6 semesters)
--   BALLB      = course_id  91     (10 semesters)
--   LLM        = course_id  92     (4 semesters)
--   MBBS       = course_id  93     (9 semesters)
--   BDS        = course_id  94     (8 semesters)
--   BPharm     = course_id  95     (8 semesters)
--   MPharm     = course_id  96     (4 semesters)
--   BPT        = course_id  97     (8 semesters)
--   BEd        = course_id  98     (4 semesters)
--   MEd        = course_id  99     (4 semesters)
--   BArch      = course_id  100    (10 semesters)
--   BDes       = course_ids 101-103(8 semesters each)
--   CA         = course_id  104    (5 levels)
--   CS         = course_id  105    (3 levels)
--   CMA        = course_id  106    (3 levels)
--   PhD        = course_ids 107-111(6 semesters each)
--   BTech LE   = course_ids 112-114(6 semesters, starting sem 3)
--   Int BTech+MTech = course_id 115 (12 semesters)
--   Int BBA+MBA     = course_id 116 (10 semesters)
--   Int BSc+MSc     = course_id 117 (8 semesters)
-- ============================================================================

INSERT IGNORE INTO tbl_cp_msemester (semester_id, course_id, semester_number, semester_name) VALUES

-- ── BTech CSE (course_id=1) — 8 semesters ─────────────────────────────────────
(1,1,1,'Semester 1'),(2,1,2,'Semester 2'),(3,1,3,'Semester 3'),(4,1,4,'Semester 4'),
(5,1,5,'Semester 5'),(6,1,6,'Semester 6'),(7,1,7,'Semester 7'),(8,1,8,'Semester 8'),
-- BTech IT (course_id=2)
(9,2,1,'Semester 1'),(10,2,2,'Semester 2'),(11,2,3,'Semester 3'),(12,2,4,'Semester 4'),
(13,2,5,'Semester 5'),(14,2,6,'Semester 6'),(15,2,7,'Semester 7'),(16,2,8,'Semester 8'),
-- BTech ECE (course_id=3)
(17,3,1,'Semester 1'),(18,3,2,'Semester 2'),(19,3,3,'Semester 3'),(20,3,4,'Semester 4'),
(21,3,5,'Semester 5'),(22,3,6,'Semester 6'),(23,3,7,'Semester 7'),(24,3,8,'Semester 8'),
-- BTech EEE (course_id=4)
(25,4,1,'Semester 1'),(26,4,2,'Semester 2'),(27,4,3,'Semester 3'),(28,4,4,'Semester 4'),
(29,4,5,'Semester 5'),(30,4,6,'Semester 6'),(31,4,7,'Semester 7'),(32,4,8,'Semester 8'),
-- BTech Mechanical (course_id=5)
(33,5,1,'Semester 1'),(34,5,2,'Semester 2'),(35,5,3,'Semester 3'),(36,5,4,'Semester 4'),
(37,5,5,'Semester 5'),(38,5,6,'Semester 6'),(39,5,7,'Semester 7'),(40,5,8,'Semester 8'),
-- BTech Civil (course_id=6)
(41,6,1,'Semester 1'),(42,6,2,'Semester 2'),(43,6,3,'Semester 3'),(44,6,4,'Semester 4'),
(45,6,5,'Semester 5'),(46,6,6,'Semester 6'),(47,6,7,'Semester 7'),(48,6,8,'Semester 8'),
-- BTech Chemical (course_id=7)
(49,7,1,'Semester 1'),(50,7,2,'Semester 2'),(51,7,3,'Semester 3'),(52,7,4,'Semester 4'),
(53,7,5,'Semester 5'),(54,7,6,'Semester 6'),(55,7,7,'Semester 7'),(56,7,8,'Semester 8'),
-- BTech Aerospace (course_id=8)
(57,8,1,'Semester 1'),(58,8,2,'Semester 2'),(59,8,3,'Semester 3'),(60,8,4,'Semester 4'),
(61,8,5,'Semester 5'),(62,8,6,'Semester 6'),(63,8,7,'Semester 7'),(64,8,8,'Semester 8'),
-- BTech Biotechnology (course_id=9)
(65,9,1,'Semester 1'),(66,9,2,'Semester 2'),(67,9,3,'Semester 3'),(68,9,4,'Semester 4'),
(69,9,5,'Semester 5'),(70,9,6,'Semester 6'),(71,9,7,'Semester 7'),(72,9,8,'Semester 8'),
-- BTech AIML (course_id=10)
(73,10,1,'Semester 1'),(74,10,2,'Semester 2'),(75,10,3,'Semester 3'),(76,10,4,'Semester 4'),
(77,10,5,'Semester 5'),(78,10,6,'Semester 6'),(79,10,7,'Semester 7'),(80,10,8,'Semester 8'),
-- BTech Data Science (course_id=11)
(81,11,1,'Semester 1'),(82,11,2,'Semester 2'),(83,11,3,'Semester 3'),(84,11,4,'Semester 4'),
(85,11,5,'Semester 5'),(86,11,6,'Semester 6'),(87,11,7,'Semester 7'),(88,11,8,'Semester 8'),
-- BTech Cyber Security (course_id=12)
(89,12,1,'Semester 1'),(90,12,2,'Semester 2'),(91,12,3,'Semester 3'),(92,12,4,'Semester 4'),
(93,12,5,'Semester 5'),(94,12,6,'Semester 6'),(95,12,7,'Semester 7'),(96,12,8,'Semester 8'),

-- ── BE courses (course_ids 13-18) — 8 semesters each ─────────────────────────
-- BE CSE (13)
(97,13,1,'Semester 1'),(98,13,2,'Semester 2'),(99,13,3,'Semester 3'),(100,13,4,'Semester 4'),
(101,13,5,'Semester 5'),(102,13,6,'Semester 6'),(103,13,7,'Semester 7'),(104,13,8,'Semester 8'),
-- BE IT (14)
(105,14,1,'Semester 1'),(106,14,2,'Semester 2'),(107,14,3,'Semester 3'),(108,14,4,'Semester 4'),
(109,14,5,'Semester 5'),(110,14,6,'Semester 6'),(111,14,7,'Semester 7'),(112,14,8,'Semester 8'),
-- BE ECE (15)
(113,15,1,'Semester 1'),(114,15,2,'Semester 2'),(115,15,3,'Semester 3'),(116,15,4,'Semester 4'),
(117,15,5,'Semester 5'),(118,15,6,'Semester 6'),(119,15,7,'Semester 7'),(120,15,8,'Semester 8'),
-- BE EEE (16)
(121,16,1,'Semester 1'),(122,16,2,'Semester 2'),(123,16,3,'Semester 3'),(124,16,4,'Semester 4'),
(125,16,5,'Semester 5'),(126,16,6,'Semester 6'),(127,16,7,'Semester 7'),(128,16,8,'Semester 8'),
-- BE Mechanical (17)
(129,17,1,'Semester 1'),(130,17,2,'Semester 2'),(131,17,3,'Semester 3'),(132,17,4,'Semester 4'),
(133,17,5,'Semester 5'),(134,17,6,'Semester 6'),(135,17,7,'Semester 7'),(136,17,8,'Semester 8'),
-- BE Civil (18)
(137,18,1,'Semester 1'),(138,18,2,'Semester 2'),(139,18,3,'Semester 3'),(140,18,4,'Semester 4'),
(141,18,5,'Semester 5'),(142,18,6,'Semester 6'),(143,18,7,'Semester 7'),(144,18,8,'Semester 8'),

-- ── MTech courses (course_ids 19-25) — 4 semesters each ──────────────────────
(145,19,1,'Semester 1'),(146,19,2,'Semester 2'),(147,19,3,'Semester 3'),(148,19,4,'Semester 4'),
(149,20,1,'Semester 1'),(150,20,2,'Semester 2'),(151,20,3,'Semester 3'),(152,20,4,'Semester 4'),
(153,21,1,'Semester 1'),(154,21,2,'Semester 2'),(155,21,3,'Semester 3'),(156,21,4,'Semester 4'),
(157,22,1,'Semester 1'),(158,22,2,'Semester 2'),(159,22,3,'Semester 3'),(160,22,4,'Semester 4'),
(161,23,1,'Semester 1'),(162,23,2,'Semester 2'),(163,23,3,'Semester 3'),(164,23,4,'Semester 4'),
(165,24,1,'Semester 1'),(166,24,2,'Semester 2'),(167,24,3,'Semester 3'),(168,24,4,'Semester 4'),
(169,25,1,'Semester 1'),(170,25,2,'Semester 2'),(171,25,3,'Semester 3'),(172,25,4,'Semester 4'),

-- ── MCA courses (course_ids 26-28) — 6 semesters each ────────────────────────
(173,26,1,'Semester 1'),(174,26,2,'Semester 2'),(175,26,3,'Semester 3'),
(176,26,4,'Semester 4'),(177,26,5,'Semester 5'),(178,26,6,'Semester 6'),
(179,27,1,'Semester 1'),(180,27,2,'Semester 2'),(181,27,3,'Semester 3'),
(182,27,4,'Semester 4'),(183,27,5,'Semester 5'),(184,27,6,'Semester 6'),
(185,28,1,'Semester 1'),(186,28,2,'Semester 2'),(187,28,3,'Semester 3'),
(188,28,4,'Semester 4'),(189,28,5,'Semester 5'),(190,28,6,'Semester 6'),

-- ── BCA courses (course_ids 29-31) — 6 semesters each ────────────────────────
(191,29,1,'Semester 1'),(192,29,2,'Semester 2'),(193,29,3,'Semester 3'),
(194,29,4,'Semester 4'),(195,29,5,'Semester 5'),(196,29,6,'Semester 6'),
(197,30,1,'Semester 1'),(198,30,2,'Semester 2'),(199,30,3,'Semester 3'),
(200,30,4,'Semester 4'),(201,30,5,'Semester 5'),(202,30,6,'Semester 6'),
(203,31,1,'Semester 1'),(204,31,2,'Semester 2'),(205,31,3,'Semester 3'),
(206,31,4,'Semester 4'),(207,31,5,'Semester 5'),(208,31,6,'Semester 6'),

-- ── MBA courses (course_ids 32-40) — 4 semesters each ────────────────────────
(209,32,1,'Semester 1'),(210,32,2,'Semester 2'),(211,32,3,'Semester 3'),(212,32,4,'Semester 4'),
(213,33,1,'Semester 1'),(214,33,2,'Semester 2'),(215,33,3,'Semester 3'),(216,33,4,'Semester 4'),
(217,34,1,'Semester 1'),(218,34,2,'Semester 2'),(219,34,3,'Semester 3'),(220,34,4,'Semester 4'),
(221,35,1,'Semester 1'),(222,35,2,'Semester 2'),(223,35,3,'Semester 3'),(224,35,4,'Semester 4'),
(225,36,1,'Semester 1'),(226,36,2,'Semester 2'),(227,36,3,'Semester 3'),(228,36,4,'Semester 4'),
(229,37,1,'Semester 1'),(230,37,2,'Semester 2'),(231,37,3,'Semester 3'),(232,37,4,'Semester 4'),
(233,38,1,'Semester 1'),(234,38,2,'Semester 2'),(235,38,3,'Semester 3'),(236,38,4,'Semester 4'),
(237,39,1,'Semester 1'),(238,39,2,'Semester 2'),(239,39,3,'Semester 3'),(240,39,4,'Semester 4'),
(241,40,1,'Semester 1'),(242,40,2,'Semester 2'),(243,40,3,'Semester 3'),(244,40,4,'Semester 4'),

-- ── BBA courses (course_ids 41-45) — 6 semesters each ────────────────────────
(245,41,1,'Semester 1'),(246,41,2,'Semester 2'),(247,41,3,'Semester 3'),
(248,41,4,'Semester 4'),(249,41,5,'Semester 5'),(250,41,6,'Semester 6'),
(251,42,1,'Semester 1'),(252,42,2,'Semester 2'),(253,42,3,'Semester 3'),
(254,42,4,'Semester 4'),(255,42,5,'Semester 5'),(256,42,6,'Semester 6'),
(257,43,1,'Semester 1'),(258,43,2,'Semester 2'),(259,43,3,'Semester 3'),
(260,43,4,'Semester 4'),(261,43,5,'Semester 5'),(262,43,6,'Semester 6'),
(263,44,1,'Semester 1'),(264,44,2,'Semester 2'),(265,44,3,'Semester 3'),
(266,44,4,'Semester 4'),(267,44,5,'Semester 5'),(268,44,6,'Semester 6'),
(269,45,1,'Semester 1'),(270,45,2,'Semester 2'),(271,45,3,'Semester 3'),
(272,45,4,'Semester 4'),(273,45,5,'Semester 5'),(274,45,6,'Semester 6'),

-- ── BSc courses (course_ids 46-55) — 6 semesters each ────────────────────────
(275,46,1,'Semester 1'),(276,46,2,'Semester 2'),(277,46,3,'Semester 3'),
(278,46,4,'Semester 4'),(279,46,5,'Semester 5'),(280,46,6,'Semester 6'),
(281,47,1,'Semester 1'),(282,47,2,'Semester 2'),(283,47,3,'Semester 3'),
(284,47,4,'Semester 4'),(285,47,5,'Semester 5'),(286,47,6,'Semester 6'),
(287,48,1,'Semester 1'),(288,48,2,'Semester 2'),(289,48,3,'Semester 3'),
(290,48,4,'Semester 4'),(291,48,5,'Semester 5'),(292,48,6,'Semester 6'),
(293,49,1,'Semester 1'),(294,49,2,'Semester 2'),(295,49,3,'Semester 3'),
(296,49,4,'Semester 4'),(297,49,5,'Semester 5'),(298,49,6,'Semester 6'),
(299,50,1,'Semester 1'),(300,50,2,'Semester 2'),(301,50,3,'Semester 3'),
(302,50,4,'Semester 4'),(303,50,5,'Semester 5'),(304,50,6,'Semester 6'),
(305,51,1,'Semester 1'),(306,51,2,'Semester 2'),(307,51,3,'Semester 3'),
(308,51,4,'Semester 4'),(309,51,5,'Semester 5'),(310,51,6,'Semester 6'),
(311,52,1,'Semester 1'),(312,52,2,'Semester 2'),(313,52,3,'Semester 3'),
(314,52,4,'Semester 4'),(315,52,5,'Semester 5'),(316,52,6,'Semester 6'),
(317,53,1,'Semester 1'),(318,53,2,'Semester 2'),(319,53,3,'Semester 3'),
(320,53,4,'Semester 4'),(321,53,5,'Semester 5'),(322,53,6,'Semester 6'),
(323,54,1,'Semester 1'),(324,54,2,'Semester 2'),(325,54,3,'Semester 3'),
(326,54,4,'Semester 4'),(327,54,5,'Semester 5'),(328,54,6,'Semester 6'),
(329,55,1,'Semester 1'),(330,55,2,'Semester 2'),(331,55,3,'Semester 3'),
(332,55,4,'Semester 4'),(333,55,5,'Semester 5'),(334,55,6,'Semester 6'),

-- ── MSc courses (course_ids 56-63) — 4 semesters each ────────────────────────
(335,56,1,'Semester 1'),(336,56,2,'Semester 2'),(337,56,3,'Semester 3'),(338,56,4,'Semester 4'),
(339,57,1,'Semester 1'),(340,57,2,'Semester 2'),(341,57,3,'Semester 3'),(342,57,4,'Semester 4'),
(343,58,1,'Semester 1'),(344,58,2,'Semester 2'),(345,58,3,'Semester 3'),(346,58,4,'Semester 4'),
(347,59,1,'Semester 1'),(348,59,2,'Semester 2'),(349,59,3,'Semester 3'),(350,59,4,'Semester 4'),
(351,60,1,'Semester 1'),(352,60,2,'Semester 2'),(353,60,3,'Semester 3'),(354,60,4,'Semester 4'),
(355,61,1,'Semester 1'),(356,61,2,'Semester 2'),(357,61,3,'Semester 3'),(358,61,4,'Semester 4'),
(359,62,1,'Semester 1'),(360,62,2,'Semester 2'),(361,62,3,'Semester 3'),(362,62,4,'Semester 4'),
(363,63,1,'Semester 1'),(364,63,2,'Semester 2'),(365,63,3,'Semester 3'),(366,63,4,'Semester 4'),

-- ── BCom courses (course_ids 64-67) — 6 semesters each ───────────────────────
(367,64,1,'Semester 1'),(368,64,2,'Semester 2'),(369,64,3,'Semester 3'),
(370,64,4,'Semester 4'),(371,64,5,'Semester 5'),(372,64,6,'Semester 6'),
(373,65,1,'Semester 1'),(374,65,2,'Semester 2'),(375,65,3,'Semester 3'),
(376,65,4,'Semester 4'),(377,65,5,'Semester 5'),(378,65,6,'Semester 6'),
(379,66,1,'Semester 1'),(380,66,2,'Semester 2'),(381,66,3,'Semester 3'),
(382,66,4,'Semester 4'),(383,66,5,'Semester 5'),(384,66,6,'Semester 6'),
(385,67,1,'Semester 1'),(386,67,2,'Semester 2'),(387,67,3,'Semester 3'),
(388,67,4,'Semester 4'),(389,67,5,'Semester 5'),(390,67,6,'Semester 6'),

-- ── MCom courses (course_ids 68-70) — 4 semesters each ───────────────────────
(391,68,1,'Semester 1'),(392,68,2,'Semester 2'),(393,68,3,'Semester 3'),(394,68,4,'Semester 4'),
(395,69,1,'Semester 1'),(396,69,2,'Semester 2'),(397,69,3,'Semester 3'),(398,69,4,'Semester 4'),
(399,70,1,'Semester 1'),(400,70,2,'Semester 2'),(401,70,3,'Semester 3'),(402,70,4,'Semester 4'),

-- ── BA courses (course_ids 71-78) — 6 semesters each ─────────────────────────
(403,71,1,'Semester 1'),(404,71,2,'Semester 2'),(405,71,3,'Semester 3'),
(406,71,4,'Semester 4'),(407,71,5,'Semester 5'),(408,71,6,'Semester 6'),
(409,72,1,'Semester 1'),(410,72,2,'Semester 2'),(411,72,3,'Semester 3'),
(412,72,4,'Semester 4'),(413,72,5,'Semester 5'),(414,72,6,'Semester 6'),
(415,73,1,'Semester 1'),(416,73,2,'Semester 2'),(417,73,3,'Semester 3'),
(418,73,4,'Semester 4'),(419,73,5,'Semester 5'),(420,73,6,'Semester 6'),
(421,74,1,'Semester 1'),(422,74,2,'Semester 2'),(423,74,3,'Semester 3'),
(424,74,4,'Semester 4'),(425,74,5,'Semester 5'),(426,74,6,'Semester 6'),
(427,75,1,'Semester 1'),(428,75,2,'Semester 2'),(429,75,3,'Semester 3'),
(430,75,4,'Semester 4'),(431,75,5,'Semester 5'),(432,75,6,'Semester 6'),
(433,76,1,'Semester 1'),(434,76,2,'Semester 2'),(435,76,3,'Semester 3'),
(436,76,4,'Semester 4'),(437,76,5,'Semester 5'),(438,76,6,'Semester 6'),
(439,77,1,'Semester 1'),(440,77,2,'Semester 2'),(441,77,3,'Semester 3'),
(442,77,4,'Semester 4'),(443,77,5,'Semester 5'),(444,77,6,'Semester 6'),
(445,78,1,'Semester 1'),(446,78,2,'Semester 2'),(447,78,3,'Semester 3'),
(448,78,4,'Semester 4'),(449,78,5,'Semester 5'),(450,78,6,'Semester 6'),

-- ── MA courses (course_ids 79-83) — 4 semesters each ─────────────────────────
(451,79,1,'Semester 1'),(452,79,2,'Semester 2'),(453,79,3,'Semester 3'),(454,79,4,'Semester 4'),
(455,80,1,'Semester 1'),(456,80,2,'Semester 2'),(457,80,3,'Semester 3'),(458,80,4,'Semester 4'),
(459,81,1,'Semester 1'),(460,81,2,'Semester 2'),(461,81,3,'Semester 3'),(462,81,4,'Semester 4'),
(463,82,1,'Semester 1'),(464,82,2,'Semester 2'),(465,82,3,'Semester 3'),(466,82,4,'Semester 4'),
(467,83,1,'Semester 1'),(468,83,2,'Semester 2'),(469,83,3,'Semester 3'),(470,83,4,'Semester 4'),

-- ── Diploma courses (course_ids 84-89) — 6 semesters each ────────────────────
(471,84,1,'Semester 1'),(472,84,2,'Semester 2'),(473,84,3,'Semester 3'),
(474,84,4,'Semester 4'),(475,84,5,'Semester 5'),(476,84,6,'Semester 6'),
(477,85,1,'Semester 1'),(478,85,2,'Semester 2'),(479,85,3,'Semester 3'),
(480,85,4,'Semester 4'),(481,85,5,'Semester 5'),(482,85,6,'Semester 6'),
(483,86,1,'Semester 1'),(484,86,2,'Semester 2'),(485,86,3,'Semester 3'),
(486,86,4,'Semester 4'),(487,86,5,'Semester 5'),(488,86,6,'Semester 6'),
(489,87,1,'Semester 1'),(490,87,2,'Semester 2'),(491,87,3,'Semester 3'),
(492,87,4,'Semester 4'),(493,87,5,'Semester 5'),(494,87,6,'Semester 6'),
(495,88,1,'Semester 1'),(496,88,2,'Semester 2'),(497,88,3,'Semester 3'),
(498,88,4,'Semester 4'),(499,88,5,'Semester 5'),(500,88,6,'Semester 6'),
(501,89,1,'Semester 1'),(502,89,2,'Semester 2'),(503,89,3,'Semester 3'),
(504,89,4,'Semester 4'),(505,89,5,'Semester 5'),(506,89,6,'Semester 6'),

-- ── LLB (course_id=90) — 6 semesters ─────────────────────────────────────────
(507,90,1,'Semester 1'),(508,90,2,'Semester 2'),(509,90,3,'Semester 3'),
(510,90,4,'Semester 4'),(511,90,5,'Semester 5'),(512,90,6,'Semester 6'),

-- ── BALLB (course_id=91) — 10 semesters ──────────────────────────────────────
(513,91,1,'Semester 1'),(514,91,2,'Semester 2'),(515,91,3,'Semester 3'),
(516,91,4,'Semester 4'),(517,91,5,'Semester 5'),(518,91,6,'Semester 6'),
(519,91,7,'Semester 7'),(520,91,8,'Semester 8'),(521,91,9,'Semester 9'),(522,91,10,'Semester 10'),

-- ── LLM (course_id=92) — 4 semesters ─────────────────────────────────────────
(523,92,1,'Semester 1'),(524,92,2,'Semester 2'),(525,92,3,'Semester 3'),(526,92,4,'Semester 4'),

-- ── MBBS (course_id=93) — 9 semesters ────────────────────────────────────────
(527,93,1,'Semester 1 (Phase I)'),(528,93,2,'Semester 2 (Phase I)'),
(529,93,3,'Semester 3 (Phase II)'),(530,93,4,'Semester 4 (Phase II)'),
(531,93,5,'Semester 5 (Phase III Pt1)'),(532,93,6,'Semester 6 (Phase III Pt1)'),
(533,93,7,'Semester 7 (Phase III Pt2)'),(534,93,8,'Semester 8 (Phase III Pt2)'),
(535,93,9,'Semester 9 (Internship)'),

-- ── BDS (course_id=94) — 8 semesters ─────────────────────────────────────────
(536,94,1,'Semester 1'),(537,94,2,'Semester 2'),(538,94,3,'Semester 3'),(539,94,4,'Semester 4'),
(540,94,5,'Semester 5'),(541,94,6,'Semester 6'),(542,94,7,'Semester 7'),(543,94,8,'Semester 8'),

-- ── BPharm (course_id=95) — 8 semesters ──────────────────────────────────────
(544,95,1,'Semester 1'),(545,95,2,'Semester 2'),(546,95,3,'Semester 3'),(547,95,4,'Semester 4'),
(548,95,5,'Semester 5'),(549,95,6,'Semester 6'),(550,95,7,'Semester 7'),(551,95,8,'Semester 8'),

-- ── MPharm (course_id=96) — 4 semesters ──────────────────────────────────────
(552,96,1,'Semester 1'),(553,96,2,'Semester 2'),(554,96,3,'Semester 3'),(555,96,4,'Semester 4'),

-- ── BPT (course_id=97) — 8 semesters ─────────────────────────────────────────
(556,97,1,'Semester 1'),(557,97,2,'Semester 2'),(558,97,3,'Semester 3'),(559,97,4,'Semester 4'),
(560,97,5,'Semester 5'),(561,97,6,'Semester 6'),(562,97,7,'Semester 7'),(563,97,8,'Semester 8'),

-- ── BEd (course_id=98) — 4 semesters ─────────────────────────────────────────
(564,98,1,'Semester 1'),(565,98,2,'Semester 2'),(566,98,3,'Semester 3'),(567,98,4,'Semester 4'),

-- ── MEd (course_id=99) — 4 semesters ─────────────────────────────────────────
(568,99,1,'Semester 1'),(569,99,2,'Semester 2'),(570,99,3,'Semester 3'),(571,99,4,'Semester 4'),

-- ── BArch (course_id=100) — 10 semesters ─────────────────────────────────────
(572,100,1,'Semester 1'),(573,100,2,'Semester 2'),(574,100,3,'Semester 3'),
(575,100,4,'Semester 4'),(576,100,5,'Semester 5'),(577,100,6,'Semester 6'),
(578,100,7,'Semester 7'),(579,100,8,'Semester 8'),(580,100,9,'Semester 9'),(581,100,10,'Semester 10'),

-- ── BDes courses (course_ids 101-103) — 8 semesters each ─────────────────────
(582,101,1,'Semester 1'),(583,101,2,'Semester 2'),(584,101,3,'Semester 3'),(585,101,4,'Semester 4'),
(586,101,5,'Semester 5'),(587,101,6,'Semester 6'),(588,101,7,'Semester 7'),(589,101,8,'Semester 8'),
(590,102,1,'Semester 1'),(591,102,2,'Semester 2'),(592,102,3,'Semester 3'),(593,102,4,'Semester 4'),
(594,102,5,'Semester 5'),(595,102,6,'Semester 6'),(596,102,7,'Semester 7'),(597,102,8,'Semester 8'),
(598,103,1,'Semester 1'),(599,103,2,'Semester 2'),(600,103,3,'Semester 3'),(601,103,4,'Semester 4'),
(602,103,5,'Semester 5'),(603,103,6,'Semester 6'),(604,103,7,'Semester 7'),(605,103,8,'Semester 8'),

-- ── CA (course_id=104) — 5 levels ────────────────────────────────────────────
(606,104,1,'Foundation'),(607,104,2,'Intermediate - Group I'),
(608,104,3,'Intermediate - Group II'),(609,104,4,'Final - Group I'),(610,104,5,'Final - Group II'),

-- ── CS (course_id=105) — 3 levels ────────────────────────────────────────────
(611,105,1,'Foundation'),(612,105,2,'Executive'),(613,105,3,'Professional'),

-- ── CMA (course_id=106) — 3 levels ───────────────────────────────────────────
(614,106,1,'Foundation'),(615,106,2,'Intermediate'),(616,106,3,'Final'),

-- ── PhD courses (course_ids 107-111) — 6 semesters each ──────────────────────
(617,107,1,'Semester 1'),(618,107,2,'Semester 2'),(619,107,3,'Semester 3'),
(620,107,4,'Semester 4'),(621,107,5,'Research Phase I'),(622,107,6,'Research Phase II'),
(623,108,1,'Semester 1'),(624,108,2,'Semester 2'),(625,108,3,'Semester 3'),
(626,108,4,'Semester 4'),(627,108,5,'Research Phase I'),(628,108,6,'Research Phase II'),
(629,109,1,'Semester 1'),(630,109,2,'Semester 2'),(631,109,3,'Semester 3'),
(632,109,4,'Semester 4'),(633,109,5,'Research Phase I'),(634,109,6,'Research Phase II'),
(635,110,1,'Semester 1'),(636,110,2,'Semester 2'),(637,110,3,'Semester 3'),
(638,110,4,'Semester 4'),(639,110,5,'Research Phase I'),(640,110,6,'Research Phase II'),
(641,111,1,'Semester 1'),(642,111,2,'Semester 2'),(643,111,3,'Semester 3'),
(644,111,4,'Semester 4'),(645,111,5,'Research Phase I'),(646,111,6,'Research Phase II'),

-- ── BTech Lateral Entry (course_ids 112-114) — semesters 3-8 ─────────────────
(647,112,3,'Semester 3'),(648,112,4,'Semester 4'),(649,112,5,'Semester 5'),
(650,112,6,'Semester 6'),(651,112,7,'Semester 7'),(652,112,8,'Semester 8'),
(653,113,3,'Semester 3'),(654,113,4,'Semester 4'),(655,113,5,'Semester 5'),
(656,113,6,'Semester 6'),(657,113,7,'Semester 7'),(658,113,8,'Semester 8'),
(659,114,3,'Semester 3'),(660,114,4,'Semester 4'),(661,114,5,'Semester 5'),
(662,114,6,'Semester 6'),(663,114,7,'Semester 7'),(664,114,8,'Semester 8'),

-- ── Integrated BTech+MTech (course_id=115) — 12 semesters ────────────────────
(665,115,1,'Semester 1'),(666,115,2,'Semester 2'),(667,115,3,'Semester 3'),
(668,115,4,'Semester 4'),(669,115,5,'Semester 5'),(670,115,6,'Semester 6'),
(671,115,7,'Semester 7'),(672,115,8,'Semester 8'),(673,115,9,'Semester 9'),
(674,115,10,'Semester 10'),(675,115,11,'Semester 11'),(676,115,12,'Semester 12'),

-- ── Integrated BBA+MBA (course_id=116) — 10 semesters ────────────────────────
(677,116,1,'Semester 1'),(678,116,2,'Semester 2'),(679,116,3,'Semester 3'),
(680,116,4,'Semester 4'),(681,116,5,'Semester 5'),(682,116,6,'Semester 6'),
(683,116,7,'Semester 7'),(684,116,8,'Semester 8'),(685,116,9,'Semester 9'),(686,116,10,'Semester 10'),

-- ── Integrated BSc+MSc (course_id=117) — 8 semesters ─────────────────────────
(687,117,1,'Semester 1'),(688,117,2,'Semester 2'),(689,117,3,'Semester 3'),(690,117,4,'Semester 4'),
(691,117,5,'Semester 5'),(692,117,6,'Semester 6'),(693,117,7,'Semester 7'),(694,117,8,'Semester 8');

-- ============================================================================
-- TABLE 32 : tbl_cp_msubjects
-- Master subject bank — all unique subjects across all courses
-- subject_code is short unique code, subject_name is full name
-- ============================================================================

INSERT IGNORE INTO tbl_cp_msubjects (subject_id, subject_code, subject_name) VALUES

-- ── Common Engineering (Sem 1 & 2) ───────────────────────────────────────────
(1,  'ENG-M1',   'Engineering Mathematics I'),
(2,  'ENG-M2',   'Engineering Mathematics II'),
(3,  'ENG-PHY',  'Engineering Physics'),
(4,  'ENG-CHEM', 'Engineering Chemistry'),
(5,  'BEE',      'Basic Electrical Engineering'),
(6,  'EG',       'Engineering Graphics'),
(7,  'COMM-SKL', 'Communication Skills'),
(8,  'ENV-SCI',  'Environmental Science'),
(9,  'WKSHP',    'Workshop Practice'),
(10, 'ENG-MECH', 'Engineering Mechanics'),
(11, 'BASIC-EL', 'Basic Electronics'),
(12, 'CP-C',     'Computer Programming in C'),
(13, 'ENG-DRG',  'Engineering Drawing'),
(14, 'PROB-STAT','Probability & Statistics'),
(15, 'PROF-ETH', 'Professional Ethics'),
(16, 'EVS',      'Environmental Studies'),

-- ── Computer Science Core ─────────────────────────────────────────────────────
(17, 'DS',       'Data Structures'),
(18, 'DM',       'Discrete Mathematics'),
(19, 'DLD',      'Digital Logic Design'),
(20, 'CO',       'Computer Organization'),
(21, 'OOP-JAVA', 'Object Oriented Programming with Java'),
(22, 'DBMS',     'Database Management Systems'),
(23, 'DAA',      'Design & Analysis of Algorithms'),
(24, 'OS',       'Operating Systems'),
(25, 'CN',       'Computer Networks'),
(26, 'MP',       'Microprocessors & Microcontrollers'),
(27, 'SE',       'Software Engineering'),
(28, 'TOC',      'Theory of Computation'),
(29, 'CD',       'Compiler Design'),
(30, 'AI',       'Artificial Intelligence'),
(31, 'WT',       'Web Technologies'),
(32, 'CG',       'Computer Graphics'),
(33, 'ML',       'Machine Learning'),
(34, 'CC',       'Cloud Computing'),
(35, 'IS',       'Information Security'),
(36, 'MAD',      'Mobile Application Development'),
(37, 'DL',       'Deep Learning'),
(38, 'BDA',      'Big Data Analytics'),
(39, 'IOT',      'Internet of Things'),
(40, 'DIST-SYS', 'Distributed Systems'),
(41, 'NLP',      'Natural Language Processing'),
(42, 'CV',       'Computer Vision'),
(43, 'CLD-ARCH', 'Cloud Architecture'),
(44, 'DEVOPS',   'DevOps & CI/CD'),
(45, 'CYBER',    'Cybersecurity Fundamentals'),
(46, 'PROJ-1',   'Project Phase I'),
(47, 'PROJ-2',   'Project Phase II'),
(48, 'MAJOR-PRJ','Major Project'),
(49, 'SEMINAR',  'Seminar'),
(50, 'INTERNSHP','Internship'),
(51, 'ELEC-1',   'Elective I'),
(52, 'ELEC-2',   'Elective II'),
(53, 'ELEC-3',   'Elective III'),
(54, 'ELEC-4',   'Elective IV'),
(55, 'ELEC-5',   'Elective V'),

-- ── Electronics & Communication ───────────────────────────────────────────────
(56, 'EDC',      'Electronic Devices & Circuits'),
(57, 'SS',       'Signals & Systems'),
(58, 'NT',       'Network Theory'),
(59, 'DE',       'Digital Electronics'),
(60, 'EMT',      'Electromagnetic Theory'),
(61, 'AEC',      'Analog Electronic Circuits'),
(62, 'CT',       'Communication Theory'),
(63, 'CS-ECE',   'Control Systems'),
(64, 'VLSI',     'VLSI Design'),
(65, 'MC',       'Microcontrollers'),
(66, 'DSP',      'Digital Signal Processing'),
(67, 'AWP',      'Antenna & Wave Propagation'),
(68, 'ES',       'Embedded Systems'),
(69, 'WC',       'Wireless Communications'),
(70, 'RF-MW',    'RF & Microwave Engineering'),
(71, 'OFC',      'Optical Fiber Communications'),
(72, 'IP',       'Image Processing'),
(73, 'RADAR',    'Radar & Navigation Systems'),

-- ── Mechanical Engineering ────────────────────────────────────────────────────
(74, 'THERMO',   'Engineering Thermodynamics'),
(75, 'MFG-TECH', 'Manufacturing Technology'),
(76, 'SOM',      'Strength of Materials'),
(77, 'FM-MECH',  'Fluid Mechanics'),
(78, 'ENG-MAT',  'Engineering Materials & Metallurgy'),
(79, 'HT',       'Heat Transfer'),
(80, 'MD',       'Machine Design'),
(81, 'KOM',      'Kinematics of Machinery'),
(82, 'METRO',    'Metrology & Quality Control'),
(83, 'CAD-CAM',  'CAD/CAM'),
(84, 'IC-ENG',   'Internal Combustion Engines'),
(85, 'ROBO',     'Robotics'),
(86, 'AUTO-ENG', 'Automobile Engineering'),
(87, 'IND-ENG',  'Industrial Engineering'),
(88, 'REFRIG',   'Refrigeration & Air Conditioning'),
(89, 'TURBO',    'Turbomachinery'),

-- ── Civil Engineering ─────────────────────────────────────────────────────────
(90, 'SA',       'Structural Analysis'),
(91, 'BM',       'Building Materials & Construction'),
(92, 'SURVEY',   'Surveying'),
(93, 'FM-CIVIL', 'Fluid Mechanics for Civil Engineering'),
(94, 'SOIL-M',   'Soil Mechanics & Foundation Engineering'),
(95, 'RCC',      'RCC Design & Drawing'),
(96, 'TRANS',    'Transportation Engineering'),
(97, 'ENV-ENGG', 'Environmental Engineering'),
(98, 'HYDRO',    'Hydraulics & Hydraulic Machines'),
(99, 'CONSTR',   'Construction Management'),
(100,'GEOTECH',  'Geotechnical Engineering'),
(101,'EST-COST', 'Estimation & Costing'),

-- ── Chemical Engineering ──────────────────────────────────────────────────────
(102,'CHEM-THERM','Chemical Engineering Thermodynamics'),
(103,'MT-OPS',   'Mass Transfer Operations'),
(104,'HT-OPS',   'Heat Transfer Operations'),
(105,'FLUID-CHEM','Fluid Flow Operations'),
(106,'REACT-ENG','Reaction Engineering'),
(107,'PROC-CTRL','Process Control & Instrumentation'),
(108,'PETRO',    'Petroleum Refining'),
(109,'POLY-TECH','Polymer Technology'),

-- ── Management & MBA ──────────────────────────────────────────────────────────
(110,'MGMT-CONC','Management Concepts & Principles'),
(111,'ORG-BEH',  'Organizational Behavior'),
(112,'MANG-ECO', 'Managerial Economics'),
(113,'FIN-ACCT', 'Financial Accounting'),
(114,'BUS-STAT', 'Business Statistics'),
(115,'BUS-COMM', 'Business Communication'),
(116,'MKT-MGMT', 'Marketing Management'),
(117,'FIN-MGMT', 'Financial Management'),
(118,'HRM',      'Human Resource Management'),
(119,'OPS-MGMT', 'Operations Management'),
(120,'BUS-LAW',  'Business Law & Corporate Governance'),
(121,'RES-METH', 'Research Methodology'),
(122,'STRAT-MGMT','Strategic Management'),
(123,'ENTREP',   'Entrepreneurship & Innovation'),
(124,'INTL-BUS', 'International Business'),
(125,'PROJ-WORK','Project Work & Dissertation'),
(126,'SCM',      'Supply Chain Management'),
(127,'BUSS-ANLYT','Business Analytics'),
(128,'BRAND-MGT','Brand Management'),
(129,'CONS-BEH', 'Consumer Behavior'),
(130,'CORP-FIN', 'Corporate Finance'),
(131,'INV-MGMT', 'Investment Management'),
(132,'DERIV',    'Derivatives & Risk Management'),

-- ── Commerce & Accounts ───────────────────────────────────────────────────────
(133,'FA',       'Financial Accounting'),
(134,'BUS-ECO',  'Business Economics'),
(135,'BUS-MATH', 'Business Mathematics'),
(136,'CORP-ACCT','Corporate Accounting'),
(137,'CO-LAW',   'Company Law'),
(138,'COST-ACCT','Cost Accounting'),
(139,'ADV-ACCT', 'Advanced Accounting'),
(140,'INC-TAX',  'Income Tax Law & Practice'),
(141,'MGMT-ACCT','Management Accounting'),
(142,'BANK-FIN', 'Banking & Finance'),
(143,'CA-COMP',  'Computer Applications in Commerce'),
(144,'AUDIT',    'Auditing & Assurance'),
(145,'DIR-TAX',  'Direct Taxes'),
(146,'INDIR-TAX','Indirect Taxes & GST'),
(147,'ECOMM',    'E-Commerce'),
(148,'ADV-FIN',  'Advanced Financial Accounting'),
(149,'INTL-FIN', 'International Finance'),

-- ── BCA / BSc CS Subjects ────────────────────────────────────────────────────
(150,'COMP-FUND','Computer Fundamentals & Office Automation'),
(151,'MATH-1',   'Mathematics I'),
(152,'MATH-2',   'Mathematics II'),
(153,'OOP-CPP',  'Object Oriented Programming with C++'),
(154,'PYTHON',   'Python Programming'),
(155,'JS-WEB',   'JavaScript & Web Development'),
(156,'PHP-MVC',  'PHP & MVC Framework'),
(157,'REACT-JS', 'React.js Development'),
(158,'NODE-JS',  'Node.js & Express'),
(159,'ANDROID',  'Android App Development'),
(160,'FLUTTER',  'Flutter Development'),
(161,'PROJ-MGT', 'Project Management'),
(162,'LINUX-ADM','Linux Administration'),

-- ── BSc Pure Sciences ─────────────────────────────────────────────────────────
(163,'CALC',     'Calculus'),
(164,'LIN-ALG',  'Linear Algebra'),
(165,'NUM-METH', 'Numerical Methods'),
(166,'REAL-ANA', 'Real Analysis'),
(167,'MECH-PHY', 'Mechanics'),
(168,'OPT',      'Optics'),
(169,'ELECTRO',  'Electricity & Magnetism'),
(170,'QUANT-PHY','Quantum Physics'),
(171,'ORG-CHEM', 'Organic Chemistry'),
(172,'INORG-CHEM','Inorganic Chemistry'),
(173,'PHY-CHEM', 'Physical Chemistry'),
(174,'BIO-CHEM', 'Biochemistry'),
(175,'MICRO-BIO','Microbiology'),
(176,'GENETICS', 'Genetics'),
(177,'CELL-BIO', 'Cell Biology'),
(178,'BIOTECH',  'Biotechnology'),
(179,'STAT-METH','Statistical Methods'),
(180,'OP-RSRCH', 'Operations Research'),

-- ── BA / MA Subjects ─────────────────────────────────────────────────────────
(181,'ENG-LIT',  'English Literature'),
(182,'SOCIOL',   'Sociology'),
(183,'PSYCH',    'Psychology'),
(184,'POL-SCI',  'Political Science'),
(185,'ECO-MICRO','Microeconomics'),
(186,'ECO-MACRO','Macroeconomics'),
(187,'HIST-IND', 'History of India'),
(188,'GEOG',     'Geography'),
(189,'PHIL',     'Philosophy'),
(190,'PUB-ADM',  'Public Administration'),
(191,'SOCIAL-W', 'Social Work'),
(192,'JOUR',     'Journalism & Mass Communication'),

-- ── Law Subjects ─────────────────────────────────────────────────────────────
(193,'CONST-LAW','Constitutional Law'),
(194,'CONT-LAW', 'Law of Contracts'),
(195,'TORT-LAW', 'Law of Torts'),
(196,'CRIM-LAW', 'Criminal Law'),
(197,'FAM-LAW',  'Family Law'),
(198,'PROP-LAW', 'Property Law'),
(199,'CORP-LAW', 'Corporate Law'),
(200,'INTL-LAW', 'International Law'),
(201,'TAX-LAW',  'Taxation Law'),
(202,'ENVL-LAW', 'Environmental Law'),
(203,'IP-LAW',   'Intellectual Property Law'),
(204,'LAW-MOOT', 'Moot Court & Trial Advocacy'),

-- ── Medical / MBBS Subjects ───────────────────────────────────────────────────
(205,'ANAT',     'Anatomy'),
(206,'PHYSIOL',  'Physiology'),
(207,'BIOCHEM-M','Biochemistry'),
(208,'PATH',     'Pathology'),
(209,'MICRO-MED','Microbiology (Medical)'),
(210,'PHARMCOL', 'Pharmacology'),
(211,'FORENSIC', 'Forensic Medicine & Toxicology'),
(212,'COMM-MED', 'Community Medicine'),
(213,'GEN-MED',  'General Medicine'),
(214,'GEN-SURG', 'General Surgery'),
(215,'OBG',      'Obstetrics & Gynaecology'),
(216,'PEDIA',    'Paediatrics'),
(217,'OPHTHAL',  'Ophthalmology'),
(218,'ENT',      'ENT'),
(219,'ORTHO',    'Orthopaedics'),

-- ── Pharmacy Subjects ────────────────────────────────────────────────────────
(220,'PHARMA-CHEM','Pharmaceutical Chemistry'),
(221,'PHARMACOG','Pharmacognosy'),
(222,'PHARM-ANA','Pharmaceutical Analysis'),
(223,'PHARM-MFG','Pharmaceutics & Manufacturing'),
(224,'CLIN-PHARM','Clinical Pharmacy'),
(225,'DRUG-REG', 'Drug Regulatory Affairs'),

-- ── BEd / MEd Subjects ───────────────────────────────────────────────────────
(226,'CHILD-DEV','Child Development & Pedagogy'),
(227,'EDU-PSYCH','Educational Psychology'),
(228,'CURR-DEV', 'Curriculum Development'),
(229,'TEACH-METH','Teaching Methodology'),
(230,'EDU-TECH', 'Educational Technology'),
(231,'SCH-MGMT', 'School Management'),
(232,'CURR-INSTR','Curriculum & Instruction'),
(233,'EDU-LEAD', 'Educational Leadership'),

-- ── BArch Subjects ───────────────────────────────────────────────────────────
(234,'ARCH-DESN','Architectural Design'),
(235,'BUILD-CONS','Building Construction'),
(236,'STRUCT-ARC','Structures for Architects'),
(237,'HIST-ARCH','History of Architecture'),
(238,'ENV-ARCH', 'Environmental Architecture'),
(239,'URB-PLAN', 'Urban Planning'),
(240,'LNDSC-ARC','Landscape Architecture'),
(241,'INT-DESN',  'Interior Design'),

-- ── BDes Subjects ────────────────────────────────────────────────────────────
(242,'DESN-FUND','Design Fundamentals'),
(243,'COLOR-TH', 'Color Theory & Typography'),
(244,'UI-DESN',  'UI Design Principles'),
(245,'UX-RESRCH','UX Research & Testing'),
(246,'PROTO-DESN','Prototyping & Wireframing'),
(247,'MOTION-GR','Motion Graphics'),
(248,'BRAND-DESN','Brand Identity Design'),
(249,'FASH-DESN','Fashion Design'),
(250,'TEXT-STDY','Textile Studies'),

-- ── CA / CS / CMA Subjects ───────────────────────────────────────────────────
(251,'CA-FOUND', 'CA Foundation'),
(252,'CA-INT-1', 'CA Intermediate Group I'),
(253,'CA-INT-2', 'CA Intermediate Group II'),
(254,'CA-FIN-1', 'CA Final Group I'),
(255,'CA-FIN-2', 'CA Final Group II'),
(256,'CS-FOUND', 'CS Foundation'),
(257,'CS-EXEC',  'CS Executive'),
(258,'CS-PROF',  'CS Professional'),
(259,'CMA-FOUND','CMA Foundation'),
(260,'CMA-INT',  'CMA Intermediate'),
(261,'CMA-FIN',  'CMA Final'),

-- ── Diploma Subjects ─────────────────────────────────────────────────────────
(262,'DIP-ENG-M','Diploma Engineering Mathematics'),
(263,'DIP-PHY',  'Applied Physics'),
(264,'DIP-CHEM', 'Applied Chemistry'),
(265,'DIP-EL',   'Basic Electrical'),
(266,'DIP-COMP', 'Computer Applications'),
(267,'DIP-DRAW', 'Engineering Drawing & Design'),
(268,'DIP-MECH', 'Mechanics of Machines'),
(269,'DIP-MFGS', 'Manufacturing Processes'),
(270,'DIP-CIVIL','Civil Engineering Drawing'),
(271,'DIP-SURV', 'Surveying'),
(272,'DIP-ELEC', 'Electronic Components & Circuits'),

-- ── PhD Subjects ─────────────────────────────────────────────────────────────
(273,'PHD-RES-M','Research Methodology'),
(274,'PHD-STAT', 'Advanced Statistics'),
(275,'PHD-LIT',  'Literature Review & Technical Writing'),
(276,'PHD-ADV',  'Advanced Topics in Specialization'),
(277,'PHD-SEM',  'Doctoral Seminar'),
(278,'PHD-THESIS','Thesis Work');

-- ============================================================================
-- TABLE 33 : tbl_cp_college_sem_subject
-- Links college + semester + subject + credits
-- Using college_id = 1 as the DEFAULT TEMPLATE college
-- This covers key courses: BTech CSE, BTech ECE, BTech Mech, BCA, MBA, BCom
-- IMPORTANT: Update college_id when real colleges are seeded
-- semester_ids for BTech CSE = 1-8 (course_id=1)
-- semester_ids for BTech ECE = 17-24 (course_id=3)
-- semester_ids for BTech Mech = 33-40 (course_id=5)
-- semester_ids for BCA = 191-196 (course_id=29)
-- semester_ids for MBA Finance = 209-212 (course_id=32)
-- semester_ids for BCom General = 367-372 (course_id=64)
-- ============================================================================

INSERT IGNORE INTO tbl_cp_college_sem_subject
(college_sem_subject_id, college_id, semester_id, subject_id, credits) VALUES

-- ── BTech CSE — Semester 1 (semester_id=1) ───────────────────────────────────
(1,  1,1,1,4.0),(2,  1,1,3,4.0),(3,  1,1,5,3.0),
(4,  1,1,6,2.0),(5,  1,1,7,2.0),(6,  1,1,8,2.0),(7,  1,1,9,1.0),
-- BTech CSE — Semester 2 (semester_id=2)
(8,  1,2,2,4.0),(9,  1,2,10,3.0),(10, 1,2,11,3.0),
(11, 1,2,12,4.0),(12, 1,2,13,2.0),(13, 1,2,17,3.0),
-- BTech CSE — Semester 3 (semester_id=3)
(14, 1,3,18,4.0),(15, 1,3,19,4.0),(16, 1,3,20,3.0),
(17, 1,3,21,4.0),(18, 1,3,22,4.0),(19, 1,3,14,3.0),
-- BTech CSE — Semester 4 (semester_id=4)
(20, 1,4,23,4.0),(21, 1,4,24,4.0),(22, 1,4,25,4.0),
(23, 1,4,26,3.0),(24, 1,4,27,3.0),(25, 1,4,28,3.0),
-- BTech CSE — Semester 5 (semester_id=5)
(26, 1,5,29,4.0),(27, 1,5,30,4.0),(28, 1,5,31,3.0),
(29, 1,5,32,3.0),(30, 1,5,51,3.0),(31, 1,5,52,3.0),
-- BTech CSE — Semester 6 (semester_id=6)
(32, 1,6,33,4.0),(33, 1,6,34,3.0),(34, 1,6,35,3.0),
(35, 1,6,36,3.0),(36, 1,6,53,3.0),(37, 1,6,46,2.0),
-- BTech CSE — Semester 7 (semester_id=7)
(38, 1,7,37,4.0),(39, 1,7,38,3.0),(40, 1,7,39,3.0),
(41, 1,7,40,3.0),(42, 1,7,54,3.0),(43, 1,7,47,2.0),
-- BTech CSE — Semester 8 (semester_id=8)
(44, 1,8,48,8.0),(45, 1,8,49,2.0),(46, 1,8,15,2.0),(47, 1,8,55,4.0),

-- ── BTech ECE — Semester 1 (semester_id=17) ──────────────────────────────────
(48, 1,17,1,4.0),(49, 1,17,3,4.0),(50, 1,17,5,3.0),
(51, 1,17,6,2.0),(52, 1,17,7,2.0),(53, 1,17,8,2.0),
-- BTech ECE — Semester 2 (semester_id=18)
(54, 1,18,2,4.0),(55, 1,18,10,3.0),(56, 1,18,11,3.0),
(57, 1,18,12,4.0),(58, 1,18,13,2.0),(59, 1,18,14,3.0),
-- BTech ECE — Semester 3 (semester_id=19)
(60, 1,19,56,4.0),(61, 1,19,57,4.0),(62, 1,19,58,3.0),
(63, 1,19,59,4.0),(64, 1,19,60,4.0),(65, 1,19,18,3.0),
-- BTech ECE — Semester 4 (semester_id=20)
(66, 1,20,61,4.0),(67, 1,20,62,4.0),(68, 1,20,63,4.0),
(69, 1,20,64,4.0),(70, 1,20,65,3.0),(71, 1,20,26,3.0),
-- BTech ECE — Semester 5 (semester_id=21)
(72, 1,21,66,4.0),(73, 1,21,67,3.0),(74, 1,21,68,4.0),
(75, 1,21,69,3.0),(76, 1,21,51,3.0),(77, 1,21,52,3.0),
-- BTech ECE — Semester 6 (semester_id=22)
(78, 1,22,70,4.0),(79, 1,22,71,3.0),(80, 1,22,72,3.0),
(81, 1,22,73,3.0),(82, 1,22,53,3.0),(83, 1,22,46,2.0),
-- BTech ECE — Semester 7 (semester_id=23)
(84, 1,23,39,3.0),(85, 1,23,33,3.0),(86, 1,23,41,3.0),
(87, 1,23,54,3.0),(88, 1,23,47,2.0),
-- BTech ECE — Semester 8 (semester_id=24)
(89, 1,24,48,8.0),(90, 1,24,49,2.0),(91, 1,24,15,2.0),(92, 1,24,55,4.0),

-- ── BTech Mechanical — Semester 1 (semester_id=33) ───────────────────────────
(93, 1,33,1,4.0),(94, 1,33,3,4.0),(95, 1,33,5,3.0),
(96, 1,33,6,2.0),(97, 1,33,7,2.0),(98, 1,33,8,2.0),(99, 1,33,9,1.0),
-- BTech Mech — Semester 2 (semester_id=34)
(100,1,34,2,4.0),(101,1,34,10,4.0),(102,1,34,11,3.0),
(103,1,34,12,3.0),(104,1,34,13,2.0),(105,1,34,14,3.0),
-- BTech Mech — Semester 3 (semester_id=35)
(106,1,35,74,4.0),(107,1,35,75,4.0),(108,1,35,76,4.0),
(109,1,35,77,4.0),(110,1,35,78,3.0),(111,1,35,14,3.0),
-- BTech Mech — Semester 4 (semester_id=36)
(112,1,36,79,4.0),(113,1,36,80,4.0),(114,1,36,81,4.0),
(115,1,36,82,3.0),(116,1,36,83,3.0),(117,1,36,63,3.0),
-- BTech Mech — Semester 5 (semester_id=37)
(118,1,37,84,4.0),(119,1,37,87,3.0),(120,1,37,88,3.0),
(121,1,37,51,3.0),(122,1,37,52,3.0),
-- BTech Mech — Semester 6 (semester_id=38)
(123,1,38,85,3.0),(124,1,38,86,3.0),(125,1,38,89,3.0),
(126,1,38,53,3.0),(127,1,38,46,2.0),
-- BTech Mech — Semester 7 (semester_id=39)
(128,1,39,54,3.0),(129,1,39,47,2.0),(130,1,39,51,3.0),
-- BTech Mech — Semester 8 (semester_id=40)
(131,1,40,48,8.0),(132,1,40,49,2.0),(133,1,40,15,2.0),

-- ── BCA General — Semester 1 (semester_id=191) ───────────────────────────────
(134,1,191,150,3.0),(135,1,191,12,4.0),(136,1,191,151,4.0),
(137,1,191,59,3.0),(138,1,191,7,2.0),(139,1,191,8,2.0),
-- BCA — Semester 2 (semester_id=192)
(140,1,192,17,4.0),(141,1,192,153,4.0),(142,1,192,152,4.0),
(143,1,192,20,3.0),(144,1,192,16,2.0),
-- BCA — Semester 3 (semester_id=193)
(145,1,193,22,4.0),(146,1,193,21,4.0),(147,1,193,24,4.0),
(148,1,193,27,3.0),(149,1,193,18,4.0),
-- BCA — Semester 4 (semester_id=194)
(150,1,194,25,4.0),(151,1,194,31,4.0),(152,1,194,154,4.0),
(153,1,194,23,4.0),(154,1,194,179,3.0),
-- BCA — Semester 5 (semester_id=195)
(155,1,195,36,4.0),(156,1,195,34,3.0),(157,1,195,35,3.0),
(158,1,195,161,3.0),(159,1,195,51,3.0),
-- BCA — Semester 6 (semester_id=196)
(160,1,196,48,8.0),(161,1,196,50,4.0),(162,1,196,15,2.0),(163,1,196,49,2.0),

-- ── MBA Finance — Semester 1 (semester_id=209) ───────────────────────────────
(164,1,209,110,3.0),(165,1,209,111,3.0),(166,1,209,112,3.0),
(167,1,209,113,3.0),(168,1,209,114,3.0),(169,1,209,115,3.0),
-- MBA Finance — Semester 2 (semester_id=210)
(170,1,210,116,3.0),(171,1,210,117,3.0),(172,1,210,118,3.0),
(173,1,210,119,3.0),(174,1,210,120,3.0),(175,1,210,121,3.0),
-- MBA Finance — Semester 3 (semester_id=211)
(176,1,211,122,3.0),(177,1,211,123,3.0),(178,1,211,130,3.0),
(179,1,211,131,3.0),(180,1,211,124,3.0),
-- MBA Finance — Semester 4 (semester_id=212)
(181,1,212,125,8.0),(182,1,212,49,2.0),

-- ── BCom General — Semester 1 (semester_id=367) ──────────────────────────────
(183,1,367,133,4.0),(184,1,367,134,4.0),(185,1,367,120,3.0),
(186,1,367,135,3.0),(187,1,367,7,2.0),
-- BCom — Semester 2 (semester_id=368)
(188,1,368,136,4.0),(189,1,368,114,3.0),(190,1,368,137,3.0),
(191,1,368,138,4.0),(192,1,368,123,3.0),
-- BCom — Semester 3 (semester_id=369)
(193,1,369,139,4.0),(194,1,369,140,4.0),(195,1,369,141,3.0),
(196,1,369,142,3.0),(197,1,369,143,3.0),
-- BCom — Semester 4 (semester_id=370)
(198,1,370,144,4.0),(199,1,370,117,3.0),(200,1,370,145,4.0),
(201,1,370,131,3.0),(202,1,370,147,3.0),
-- BCom — Semester 5 (semester_id=371)
(203,1,371,148,4.0),(204,1,371,149,3.0),(205,1,371,146,4.0),
(206,1,371,122,3.0),
-- BCom — Semester 6 (semester_id=372)
(207,1,372,48,8.0),(208,1,372,50,2.0),(209,1,372,49,2.0);

-- ============================================================================

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================================
-- SUMMARY
-- tbl_cp_msemester           : 694 rows (all 117 courses covered)
-- tbl_cp_msubjects           : 278 rows (complete master subject bank)
-- tbl_cp_college_sem_subject : 209 rows (template for college_id=1)
--   Courses covered in college_sem_subject:
--     BTech CSE   (sems 1-8)
--     BTech ECE   (sems 1-8)
--     BTech Mech  (sems 1-8)
--     BCA General (sems 1-6)
--     MBA Finance (sems 1-4)
--     BCom General(sems 1-6)
-- NOTE: college_id=1 is a template. Update to real college_ids after
--       seeding tbl_cp_mcolleges.
-- TOTAL: 1181 rows
-- ============================================================================

-- ============================================================================
-- CAMPUS5 - SEED DATA FOR GROUP F (Question Bank)
-- Prerequisite seeds included: tbl_cp_mmodule, tbl_cp_mdifficulty
-- Tables: tbl_cp_mquestions (37), tbl_cp_m2m_question_options (38)
-- Covers 12 modules, 160 questions, 4 options each MCQ
-- Like real campus placement exams (TCS, Infosys, Wipro, Accenture style)
-- ============================================================================

SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================================
-- PREREQUISITE: tbl_cp_mmodule (Group A table 9 — not yet seeded)
-- module_id | module_name | module_code | description | has_questions
-- ============================================================================

INSERT IGNORE INTO tbl_cp_mmodule
(module_id, module_name, module_code, description, has_questions) VALUES
(1,  'Aptitude',                    'APT',   'Quantitative aptitude & numerical ability',     TRUE),
(2,  'Logical Reasoning',           'LR',    'Logical & analytical reasoning',                 TRUE),
(3,  'Verbal Ability',              'VA',    'English language & comprehension',               TRUE),
(4,  'Data Interpretation',         'DI',    'Charts, graphs, tables & data analysis',        TRUE),
(5,  'Programming Fundamentals',    'PF',    'Core programming concepts & logic',             TRUE),
(6,  'Data Structures & Algorithms','DSA',   'DS, algorithms & time/space complexity',        TRUE),
(7,  'Database & SQL',              'SQL',   'SQL queries, DBMS concepts & design',           TRUE),
(8,  'OOP Concepts',                'OOP',   'Object oriented programming principles',        TRUE),
(9,  'Computer Networks',           'CN',    'Networking concepts, protocols & models',       TRUE),
(10, 'Operating Systems',           'OS',    'OS concepts, scheduling & memory management',  TRUE),
(11, 'Python Programming',          'PY',    'Python language, libraries & best practices',   TRUE),
(12, 'Java Programming',            'JAVA',  'Java language, collections & frameworks',       TRUE),
(13, 'Web Development',             'WEB',   'HTML, CSS, JS, REST APIs & frameworks',        TRUE),
(14, 'System Design',               'SD',    'High level & low level system design',         TRUE),
(15, 'C & C++ Programming',         'CPP',   'C and C++ language concepts & STL',            TRUE),
(16, 'Communication Skills',        'COMM',  'Verbal & written communication assessment',    FALSE),
(17, 'Leadership & Teamwork',       'LEAD',  'Leadership, collaboration & team skills',      FALSE),
(18, 'Problem Solving',             'PS',    'Analytical & creative problem solving',        FALSE),
(19, 'Personality & Attitude',      'PERS',  'Attitude, values & behavioural assessment',    FALSE);

-- ============================================================================
-- PREREQUISITE: tbl_cp_mdifficulty (Group A table 10 — not yet seeded)
-- ============================================================================

INSERT IGNORE INTO tbl_cp_mdifficulty
(difficulty_id, level_code, level_label, score_weight) VALUES
(1, 'EASY',   'Easy',   1.00),
(2, 'MEDIUM', 'Medium', 1.50),
(3, 'HARD',   'Hard',   2.00);

-- ============================================================================
-- TABLE 37 : tbl_cp_mquestions
-- question_type: mcq | subjective | coding | case_study
-- correct_answer: filled for mcq (matches one option text), null for others
-- ============================================================================

INSERT IGNORE INTO tbl_cp_mquestions
(question_id, module_id, difficulty_id, question_text, question_type, correct_answer, max_marks, is_active) VALUES

-- ============================================================
-- MODULE 1: APTITUDE (module_id=1) — 20 questions
-- ============================================================

-- Easy (difficulty_id=1)
(1,  1,1,'A can do a piece of work in 10 days and B in 15 days. How many days will they take to finish the work together?',
 'mcq','6 days',1.0,TRUE),
(2,  1,1,'What is 25% of 480?',
 'mcq','120',1.0,TRUE),
(3,  1,1,'A shopkeeper buys an article for Rs. 200 and sells it for Rs. 250. What is the profit percentage?',
 'mcq','25%',1.0,TRUE),
(4,  1,1,'The ratio of boys to girls in a class is 3:2. If there are 30 boys, how many girls are there?',
 'mcq','20',1.0,TRUE),
(5,  1,1,'What is the simple interest on Rs. 5000 at 8% per annum for 3 years?',
 'mcq','Rs. 1200',1.0,TRUE),

-- Medium (difficulty_id=2)
(6,  1,2,'A train 150 m long passes a pole in 10 seconds. What is the speed of the train in km/h?',
 'mcq','54 km/h',1.0,TRUE),
(7,  1,2,'A and B together can do a piece of work in 12 days. A alone can do it in 20 days. In how many days can B alone do it?',
 'mcq','30 days',1.0,TRUE),
(8,  1,2,'The compound interest on Rs. 8000 at 10% per annum for 2 years compounded annually is:',
 'mcq','Rs. 1680',1.0,TRUE),
(9,  1,2,'In a mixture of 60 litres, milk and water are in ratio 2:1. How much water must be added to make the ratio 1:2?',
 'mcq','60 litres',1.0,TRUE),
(10, 1,2,'Two numbers are in ratio 3:5. If each is increased by 10, the ratio becomes 5:7. Find the numbers.',
 'mcq','15 and 25',1.0,TRUE),
(11, 1,2,'A cistern can be filled in 9 hours but due to a leak it takes 10 hours. If the cistern is full, in how many hours will the leak empty it?',
 'mcq','90 hours',1.0,TRUE),
(12, 1,2,'The average of 5 consecutive even numbers is 18. What is the largest number?',
 'mcq','22',1.0,TRUE),

-- Hard (difficulty_id=3)
(13, 1,3,'A boat travels 16 km upstream and 24 km downstream in 6 hours. It travels 12 km upstream and 36 km downstream in 6 hours. Find the speed of the boat in still water.',
 'mcq','8 km/h',1.0,TRUE),
(14, 1,3,'In how many ways can 4 boys and 3 girls be seated in a row such that no two girls sit together?',
 'mcq','720',1.0,TRUE),
(15, 1,3,'A merchant marks his goods 40% above cost price and allows 25% discount. Find his profit or loss percent.',
 'mcq','5% profit',1.0,TRUE),
(16, 1,3,'The sum of three consecutive multiples of 7 is 777. What is the largest multiple?',
 'mcq','266',1.0,TRUE),
(17, 1,3,'Pipes A and B can fill a tank in 20 and 30 minutes. Pipe C can empty it in 15 minutes. If all are opened simultaneously, in how many minutes will the tank be filled?',
 'mcq','60 minutes',1.0,TRUE),
(18, 1,3,'Two trains of lengths 120 m and 80 m run at speeds of 60 km/h and 40 km/h in opposite directions. How long do they take to cross each other?',
 'mcq','7.2 seconds',1.0,TRUE),
(19, 1,3,'Find the number of zeros at the end of 100 factorial (100!)',
 'mcq','24',1.0,TRUE),
(20, 1,3,'If log(2)=0.3010 and log(3)=0.4771, find the value of log(12).',
 'mcq','1.0791',1.0,TRUE),

-- ============================================================
-- MODULE 2: LOGICAL REASONING (module_id=2) — 15 questions
-- ============================================================

(21, 2,1,'Which number comes next in the series: 2, 6, 12, 20, 30, ?',
 'mcq','42',1.0,TRUE),
(22, 2,1,'If APPLE is coded as BQQMF, how is MANGO coded?',
 'mcq','NBOHP',1.0,TRUE),
(23, 2,1,'Pointing to a man, a woman said "His mother is the only daughter of my mother." How is the woman related to the man?',
 'mcq','Mother',1.0,TRUE),
(24, 2,1,'A is the brother of B. B is the sister of C. C is the son of D. How is D related to A?',
 'mcq','Parent (Father or Mother)',1.0,TRUE),
(25, 2,2,'In a row of 40 students, Ravi is 11th from the left and Meena is 19th from the right. How many students are between them?',
 'mcq','10',1.0,TRUE),
(26, 2,2,'All cats are dogs. All dogs are rats. Which conclusion follows? I. All cats are rats. II. All rats are cats.',
 'mcq','Only I follows',1.0,TRUE),
(27, 2,2,'A man walks 5 km North, turns East and walks 3 km, turns South and walks 5 km. How far is he from the starting point?',
 'mcq','3 km',1.0,TRUE),
(28, 2,2,'Find the odd one out: 8, 27, 64, 100, 125',
 'mcq','100',1.0,TRUE),
(29, 2,2,'Six persons A, B, C, D, E, F sit in a circle facing centre. A sits between F and B. D is not adjacent to F. C and D are adjacent. E is between D and C. Who sits opposite to A?',
 'mcq','D',1.0,TRUE),
(30, 2,2,'If 5*3=28 and 7*4=44, what is 9*5?',
 'mcq','64',1.0,TRUE),
(31, 2,3,'Statement: All pens are books. Some books are pencils. Conclusions: I. Some pens are pencils. II. Some pencils are pens. III. Some books are pens. Which conclusions follow?',
 'mcq','Only III follows',1.0,TRUE),
(32, 2,3,'In a family of 6: A, B, C, D, E, F. B is the son of C. A is the husband of C. D is the daughter of A. E is the brother of B. F is the mother of A. Who is D to F?',
 'mcq','Granddaughter',1.0,TRUE),
(33, 2,3,'A series: 3, 8, 15, 24, 35, ? Find the next term.',
 'mcq','48',1.0,TRUE),
(34, 2,3,'Which figure in the series does not belong? (Pattern: each shape gains one side) Triangle, Square, Pentagon, Circle, Hexagon',
 'mcq','Circle',1.0,TRUE),
(35, 2,3,'If in a code language FRIEND is written as HUMJTK, how is CANDLE written?',
 'mcq','EDRIRL',1.0,TRUE),

-- ============================================================
-- MODULE 3: VERBAL ABILITY (module_id=3) — 15 questions
-- ============================================================

(36, 3,1,'Choose the synonym of BENEVOLENT:',
 'mcq','Kind',1.0,TRUE),
(37, 3,1,'Choose the antonym of VERBOSE:',
 'mcq','Concise',1.0,TRUE),
(38, 3,1,'Fill in the blank: He has been working here _____ 2015.',
 'mcq','since',1.0,TRUE),
(39, 3,1,'Choose the correctly spelled word:',
 'mcq','Accommodate',1.0,TRUE),
(40, 3,1,'Identify the error: "She don''t know the answer."',
 'mcq',"doesn't",1.0,TRUE),
(41, 3,2,'Choose the word closest in meaning to LOQUACIOUS:',
 'mcq','Talkative',1.0,TRUE),
(42, 3,2,'Select the correct form: Neither the students nor the teacher _____ present.',
 'mcq','was',1.0,TRUE),
(43, 3,2,'Rearrange the sentences to form a coherent paragraph: P. He decided to leave. Q. John was tired. R. It was a long day. S. He packed his bags. The correct order is:',
 'mcq','RQPS',1.0,TRUE),
(44, 3,2,'Choose the one-word substitution for: "One who knows many languages"',
 'mcq','Polyglot',1.0,TRUE),
(45, 3,2,'Fill in the blank: The committee has submitted _____ report.',
 'mcq','its',1.0,TRUE),
(46, 3,2,'Identify the figure of speech: "The stars danced playfully in the moonlit sky."',
 'mcq','Personification',1.0,TRUE),
(47, 3,3,'Choose the sentence with correct usage of "affect" and "effect":',
 'mcq','The rain affected the match, and the effect was a cancellation.',1.0,TRUE),
(48, 3,3,'In the passage: "Despite his profligate lifestyle, he managed to save enough for retirement." The word "profligate" means:',
 'mcq','Recklessly wasteful',1.0,TRUE),
(49, 3,3,'Choose the sentence that is grammatically correct:',
 'mcq','If I were you, I would not do that.',1.0,TRUE),
(50, 3,3,'The idiom "to burn the midnight oil" means:',
 'mcq','To work or study late into the night',1.0,TRUE),

-- ============================================================
-- MODULE 4: DATA INTERPRETATION (module_id=4) — 10 questions
-- ============================================================

(51, 4,2,'A company sold 200 units in Jan, 250 in Feb, 300 in March, 350 in April. What is the average monthly sales?',
 'mcq','275',1.0,TRUE),
(52, 4,2,'In a pie chart, a sector representing "Transport" covers 72 degrees out of 360. What percentage of the budget is Transport?',
 'mcq','20%',1.0,TRUE),
(53, 4,2,'A bar graph shows profits: 2019=50L, 2020=40L, 2021=60L, 2022=80L. What is the percentage increase from 2019 to 2022?',
 'mcq','60%',1.0,TRUE),
(54, 4,2,'Table: Students scoring above 80% in subjects — Maths:40, Science:30, English:50, Social:20. Total students=200. What % scored above 80 in English?',
 'mcq','25%',1.0,TRUE),
(55, 4,2,'A line graph shows sales: Q1=100, Q2=150, Q3=120, Q4=200. What is the ratio of Q2 to Q4 sales?',
 'mcq','3:4',1.0,TRUE),
(56, 4,3,'Sales data: Product A: Jan=500, Feb=600, Mar=550. Product B: Jan=400, Feb=700, Mar=650. In which month is the combined sales highest?',
 'mcq','February',1.0,TRUE),
(57, 4,3,'A table shows income and expenditure for 5 years. If savings = income - expenditure, and income grew 10% each year from Rs.50000, expenditure grew 8% from Rs.40000, what is savings in Year 3?',
 'mcq','Rs. 13498',1.0,TRUE),
(58, 4,3,'In a pie chart with total budget of Rs.12 lakhs: Education=25%, Health=20%, Infrastructure=30%, Others=25%. How much more is Infrastructure than Health?',
 'mcq','Rs. 1.2 lakhs',1.0,TRUE),
(59, 4,3,'Two companies A and B. A: Revenue 2021=200Cr, 2022=240Cr. B: Revenue 2021=150Cr, 2022=195Cr. Which company grew faster?',
 'mcq','Company B (30%)',1.0,TRUE),
(60, 4,3,'A table shows 5 employees with their sales targets and achievements. Employee with highest achievement %: T1=100,A1=110; T2=150,A2=145; T3=80,A3=96; T4=200,A4=220; T5=120,A5=126. Who has the highest achievement%?',
 'mcq','Employee 3 (120%)',1.0,TRUE),

-- ============================================================
-- MODULE 5: PROGRAMMING FUNDAMENTALS (module_id=5) — 15 questions
-- ============================================================

(61, 5,1,'Which of the following is NOT a primitive data type in most programming languages?',
 'mcq','String',1.0,TRUE),
(62, 5,1,'What is the output of: x=5; y=x++; print(y)?',
 'mcq','5',1.0,TRUE),
(63, 5,1,'Which loop is guaranteed to execute at least once?',
 'mcq','do-while',1.0,TRUE),
(64, 5,1,'What does the "break" statement do inside a loop?',
 'mcq','Exits the loop immediately',1.0,TRUE),
(65, 5,1,'What is the index of the first element in most programming language arrays?',
 'mcq','0',1.0,TRUE),
(66, 5,2,'What is the output? int a=10, b=3; printf("%d", a%b);',
 'mcq','1',1.0,TRUE),
(67, 5,2,'Which of the following is a call by reference concept?',
 'mcq','Passing a pointer to a function',1.0,TRUE),
(68, 5,2,'What is recursion?',
 'mcq','A function that calls itself',1.0,TRUE),
(69, 5,2,'How many times will this loop execute? for(int i=0; i<10; i+=3)',
 'mcq','4',1.0,TRUE),
(70, 5,2,'What is the time complexity of binary search?',
 'mcq','O(log n)',1.0,TRUE),
(71, 5,2,'Which data type can store both integers and decimals?',
 'mcq','float/double',1.0,TRUE),
(72, 5,3,'What is the output? void f(int *p){*p=*p+10;} int main(){int x=5; f(&x); printf("%d",x);}',
 'mcq','15',1.0,TRUE),
(73, 5,3,'A function returns the nth Fibonacci number using recursion. What is the time complexity?',
 'mcq','O(2^n)',1.0,TRUE),
(74, 5,3,'What is a memory leak?',
 'mcq','Memory allocated dynamically but never freed',1.0,TRUE),
(75, 5,3,'What is the difference between stack and heap memory?',
 'mcq','Stack is for static/local variables; Heap is for dynamic allocation',1.0,TRUE),

-- ============================================================
-- MODULE 6: DATA STRUCTURES & ALGORITHMS (module_id=6) — 20 questions
-- ============================================================

(76,  6,1,'Which data structure follows LIFO (Last In First Out)?',
 'mcq','Stack',1.0,TRUE),
(77,  6,1,'Which data structure follows FIFO (First In First Out)?',
 'mcq','Queue',1.0,TRUE),
(78,  6,1,'What is the time complexity of accessing an element in an array by index?',
 'mcq','O(1)',1.0,TRUE),
(79,  6,1,'Which sorting algorithm has best average case time complexity?',
 'mcq','Merge Sort',1.0,TRUE),
(80,  6,1,'A binary tree node has at most how many children?',
 'mcq','2',1.0,TRUE),
(81,  6,2,'What is the worst case time complexity of Quick Sort?',
 'mcq','O(n^2)',1.0,TRUE),
(82,  6,2,'In a singly linked list, inserting a node at the beginning takes:',
 'mcq','O(1)',1.0,TRUE),
(83,  6,2,'What is the height of a complete binary tree with n nodes?',
 'mcq','O(log n)',1.0,TRUE),
(84,  6,2,'Which traversal of a BST gives sorted output?',
 'mcq','Inorder',1.0,TRUE),
(85,  6,2,'What is a hash collision?',
 'mcq','Two keys mapping to the same hash value',1.0,TRUE),
(86,  6,2,'Which algorithm is used to find shortest path in a weighted graph?',
 'mcq','Dijkstra''s Algorithm',1.0,TRUE),
(87,  6,2,'What is the space complexity of merge sort?',
 'mcq','O(n)',1.0,TRUE),
(88,  6,2,'What data structure is used to implement BFS (Breadth First Search)?',
 'mcq','Queue',1.0,TRUE),
(89,  6,2,'What data structure is used to implement DFS (Depth First Search)?',
 'mcq','Stack',1.0,TRUE),
(90,  6,3,'In dynamic programming, what is memoization?',
 'mcq','Storing results of subproblems to avoid recomputation',1.0,TRUE),
(91,  6,3,'What is the time complexity of finding an element in a balanced BST?',
 'mcq','O(log n)',1.0,TRUE),
(92,  6,3,'Which of the following is NOT a stable sorting algorithm?',
 'mcq','Quick Sort',1.0,TRUE),
(93,  6,3,'What is a spanning tree of a graph?',
 'mcq','A subgraph that connects all vertices with minimum edges and no cycle',1.0,TRUE),
(94,  6,3,'The number of edges in a complete graph with n vertices is:',
 'mcq','n(n-1)/2',1.0,TRUE),
(95,  6,3,'What is the amortized time complexity of push and pop operations in a dynamic array?',
 'mcq','O(1)',1.0,TRUE),

-- ============================================================
-- MODULE 7: DATABASE & SQL (module_id=7) — 15 questions
-- ============================================================

(96,  7,1,'Which SQL command is used to retrieve data from a table?',
 'mcq','SELECT',1.0,TRUE),
(97,  7,1,'Which SQL command is used to remove all rows from a table without deleting the table structure?',
 'mcq','TRUNCATE',1.0,TRUE),
(98,  7,1,'Which of the following is a DDL command?',
 'mcq','CREATE',1.0,TRUE),
(99,  7,1,'Which clause is used to filter records in SQL?',
 'mcq','WHERE',1.0,TRUE),
(100, 7,1,'What does PRIMARY KEY ensure in a table?',
 'mcq','Uniqueness and non-null values in a column',1.0,TRUE),
(101, 7,2,'What is the result of: SELECT COUNT(*) FROM students WHERE marks > 80; if 5 students have marks > 80?',
 'mcq','5',1.0,TRUE),
(102, 7,2,'Which JOIN returns all rows from both tables, with NULLs where there is no match?',
 'mcq','FULL OUTER JOIN',1.0,TRUE),
(103, 7,2,'What is the difference between WHERE and HAVING?',
 'mcq','WHERE filters rows before grouping; HAVING filters after grouping',1.0,TRUE),
(104, 7,2,'Which normal form eliminates transitive dependencies?',
 'mcq','Third Normal Form (3NF)',1.0,TRUE),
(105, 7,2,'What is an index in a database?',
 'mcq','A data structure to speed up query retrieval',1.0,TRUE),
(106, 7,2,'Write a query: Find employees earning more than the average salary. Which subquery is correct?',
 'mcq','SELECT * FROM emp WHERE salary > (SELECT AVG(salary) FROM emp)',1.0,TRUE),
(107, 7,3,'What is a deadlock in database transactions?',
 'mcq','Two transactions waiting indefinitely for each other to release locks',1.0,TRUE),
(108, 7,3,'What does ACID stand for in database transactions?',
 'mcq','Atomicity, Consistency, Isolation, Durability',1.0,TRUE),
(109, 7,3,'Which SQL statement is used to give a user permission to perform an action?',
 'mcq','GRANT',1.0,TRUE),
(110, 7,3,'What is a correlated subquery?',
 'mcq','A subquery that references a column from the outer query',1.0,TRUE),

-- ============================================================
-- MODULE 8: OOP CONCEPTS (module_id=8) — 10 questions
-- ============================================================

(111, 8,1,'Which OOP concept allows a class to inherit properties from another class?',
 'mcq','Inheritance',1.0,TRUE),
(112, 8,1,'What is encapsulation in OOP?',
 'mcq','Wrapping data and methods together and restricting direct access',1.0,TRUE),
(113, 8,1,'Which keyword is used to create an object of a class in Java/C++?',
 'mcq','new',1.0,TRUE),
(114, 8,2,'What is method overloading?',
 'mcq','Multiple methods with the same name but different parameters',1.0,TRUE),
(115, 8,2,'What is the difference between method overloading and method overriding?',
 'mcq','Overloading is compile-time polymorphism; Overriding is runtime polymorphism',1.0,TRUE),
(116, 8,2,'Which concept allows a subclass to provide specific implementation of a method already defined in the parent class?',
 'mcq','Method Overriding',1.0,TRUE),
(117, 8,2,'What is an abstract class?',
 'mcq','A class that cannot be instantiated and may contain abstract methods',1.0,TRUE),
(118, 8,3,'What is the difference between an interface and an abstract class?',
 'mcq','Interface has only abstract methods (by default); abstract class can have both concrete and abstract methods',1.0,TRUE),
(119, 8,3,'What is a constructor? When is it called?',
 'mcq','A special method called automatically when an object is created',1.0,TRUE),
(120, 8,3,'What is the significance of the "this" keyword in OOP?',
 'mcq','It refers to the current instance of the class',1.0,TRUE),

-- ============================================================
-- MODULE 9: COMPUTER NETWORKS (module_id=9) — 10 questions
-- ============================================================

(121, 9,1,'How many layers does the OSI model have?',
 'mcq','7',1.0,TRUE),
(122, 9,1,'Which protocol is used to assign IP addresses automatically?',
 'mcq','DHCP',1.0,TRUE),
(123, 9,1,'What does HTTP stand for?',
 'mcq','HyperText Transfer Protocol',1.0,TRUE),
(124, 9,1,'Which layer of the OSI model is responsible for routing?',
 'mcq','Network Layer (Layer 3)',1.0,TRUE),
(125, 9,2,'What is the difference between TCP and UDP?',
 'mcq','TCP is connection-oriented and reliable; UDP is connectionless and faster',1.0,TRUE),
(126, 9,2,'Which IP address range is used for private networks (Class C)?',
 'mcq','192.168.0.0 to 192.168.255.255',1.0,TRUE),
(127, 9,2,'What is the purpose of the DNS (Domain Name System)?',
 'mcq','Translates domain names to IP addresses',1.0,TRUE),
(128, 9,2,'What is the maximum number of IP addresses in a /24 subnet?',
 'mcq','256 (254 usable)',1.0,TRUE),
(129, 9,3,'What is the difference between a hub, switch, and router?',
 'mcq','Hub broadcasts to all; Switch sends to specific MAC; Router connects different networks',1.0,TRUE),
(130, 9,3,'What is a three-way handshake in TCP?',
 'mcq','SYN, SYN-ACK, ACK — used to establish a TCP connection',1.0,TRUE),

-- ============================================================
-- MODULE 10: OPERATING SYSTEMS (module_id=10) — 10 questions
-- ============================================================

(131, 10,1,'What is the role of an operating system?',
 'mcq','To manage hardware resources and provide services to programs',1.0,TRUE),
(132, 10,1,'Which scheduling algorithm gives the CPU to the process with the shortest execution time?',
 'mcq','Shortest Job First (SJF)',1.0,TRUE),
(133, 10,1,'What is a process in an operating system?',
 'mcq','A program in execution',1.0,TRUE),
(134, 10,2,'What is deadlock? Which of the four conditions must hold simultaneously for deadlock?',
 'mcq','Mutual Exclusion, Hold & Wait, No Preemption, Circular Wait',1.0,TRUE),
(135, 10,2,'What is virtual memory?',
 'mcq','A technique that uses disk space to extend RAM',1.0,TRUE),
(136, 10,2,'What is the difference between a process and a thread?',
 'mcq','A process is an independent program; a thread is a lightweight unit within a process',1.0,TRUE),
(137, 10,2,'What is paging in memory management?',
 'mcq','Dividing memory into fixed-size pages to avoid fragmentation',1.0,TRUE),
(138, 10,3,'What is the difference between internal and external fragmentation?',
 'mcq','Internal: wasted space within an allocated block; External: free memory in non-contiguous blocks',1.0,TRUE),
(139, 10,3,'In Round Robin scheduling with time quantum 4ms, processes P1(8ms), P2(4ms), P3(6ms) arrive at t=0. What is the average waiting time?',
 'mcq','6 ms',1.0,TRUE),
(140, 10,3,'What is a semaphore and how is it used in OS?',
 'mcq','A synchronization variable used to control access to shared resources',1.0,TRUE),

-- ============================================================
-- MODULE 11: PYTHON PROGRAMMING (module_id=11) — 10 questions
-- ============================================================

(141, 11,1,'What is the output of: print(type([]))?',
 'mcq',"<class 'list'>",1.0,TRUE),
(142, 11,1,'Which of the following is immutable in Python?',
 'mcq','Tuple',1.0,TRUE),
(143, 11,1,'What does the len() function return for a string "Hello"?',
 'mcq','5',1.0,TRUE),
(144, 11,2,'What is the output of: x=[1,2,3]; print(x[:-1])?',
 'mcq','[1, 2]',1.0,TRUE),
(145, 11,2,'What is a list comprehension? Which is correct for squares of even numbers from 0-9?',
 'mcq','[x**2 for x in range(10) if x%2==0]',1.0,TRUE),
(146, 11,2,'What does the *args parameter in a Python function mean?',
 'mcq','Accepts a variable number of positional arguments',1.0,TRUE),
(147, 11,2,'What is the output of: d={1:"a",2:"b"}; print(d.get(3,"not found"))?',
 'mcq','not found',1.0,TRUE),
(148, 11,3,'What is a decorator in Python?',
 'mcq','A function that wraps another function to extend its behavior',1.0,TRUE),
(149, 11,3,'What is the difference between @staticmethod and @classmethod in Python?',
 'mcq','staticmethod takes no implicit first arg; classmethod takes cls as first arg',1.0,TRUE),
(150, 11,3,'What is the output of: print(list(map(lambda x: x*2, [1,2,3])))?',
 'mcq','[2, 4, 6]',1.0,TRUE),

-- ============================================================
-- MODULE 12: JAVA PROGRAMMING (module_id=12) — 10 questions
-- ============================================================

(151, 12,1,'Which keyword is used to prevent a class from being subclassed in Java?',
 'mcq','final',1.0,TRUE),
(152, 12,1,'What is the default value of an int variable in Java?',
 'mcq','0',1.0,TRUE),
(153, 12,1,'Which collection class in Java allows duplicate values and maintains insertion order?',
 'mcq','ArrayList',1.0,TRUE),
(154, 12,2,'What is the difference between ArrayList and LinkedList in Java?',
 'mcq','ArrayList uses dynamic array; LinkedList uses doubly linked list',1.0,TRUE),
(155, 12,2,'What is the purpose of the "synchronized" keyword in Java?',
 'mcq','To ensure only one thread accesses a method or block at a time',1.0,TRUE),
(156, 12,2,'Which exception is thrown when you try to access a null object reference?',
 'mcq','NullPointerException',1.0,TRUE),
(157, 12,2,'What is the difference between checked and unchecked exceptions in Java?',
 'mcq','Checked exceptions are checked at compile time; unchecked at runtime',1.0,TRUE),
(158, 12,3,'What is the output of: System.out.println(10 + 20 + "Java" + 10 + 20);',
 'mcq','30Java1020',1.0,TRUE),
(159, 12,3,'What is a functional interface in Java 8?',
 'mcq','An interface with exactly one abstract method, used with lambda expressions',1.0,TRUE),
(160, 12,3,'What is the difference between HashMap and ConcurrentHashMap?',
 'mcq','HashMap is not thread-safe; ConcurrentHashMap is thread-safe',1.0,TRUE);

-- ============================================================================
-- TABLE 38 : tbl_cp_m2m_question_options
-- 4 options per MCQ question (option_id auto from row_id via trigger or manual)
-- All 160 questions are MCQ so all get 4 options
-- is_correct=TRUE for the right answer, FALSE for others
-- display_order: 1,2,3,4
-- ============================================================================

INSERT IGNORE INTO tbl_cp_m2m_question_options
(option_id, question_id, option_text, is_correct, display_order) VALUES

-- Q1: A and B together
(1,1,'5 days',FALSE,1),(2,1,'6 days',TRUE,2),(3,1,'8 days',FALSE,3),(4,1,'4 days',FALSE,4),
-- Q2: 25% of 480
(5,2,'100',FALSE,1),(6,2,'120',TRUE,2),(7,2,'140',FALSE,3),(8,2,'110',FALSE,4),
-- Q3: Profit %
(9,3,'20%',FALSE,1),(10,3,'25%',TRUE,2),(11,3,'30%',FALSE,3),(12,3,'15%',FALSE,4),
-- Q4: Boys girls ratio
(13,4,'15',FALSE,1),(14,4,'20',TRUE,2),(15,4,'25',FALSE,3),(16,4,'18',FALSE,4),
-- Q5: Simple interest
(17,5,'Rs. 1000',FALSE,1),(18,5,'Rs. 1200',TRUE,2),(19,5,'Rs. 1500',FALSE,3),(20,5,'Rs. 800',FALSE,4),
-- Q6: Train speed
(21,6,'45 km/h',FALSE,1),(22,6,'54 km/h',TRUE,2),(23,6,'60 km/h',FALSE,3),(24,6,'72 km/h',FALSE,4),
-- Q7: B alone
(25,7,'25 days',FALSE,1),(26,7,'30 days',TRUE,2),(27,7,'35 days',FALSE,3),(28,7,'40 days',FALSE,4),
-- Q8: Compound interest
(29,8,'Rs. 1600',FALSE,1),(30,8,'Rs. 1680',TRUE,2),(31,8,'Rs. 1700',FALSE,3),(32,8,'Rs. 1750',FALSE,4),
-- Q9: Mixture water
(33,9,'30 litres',FALSE,1),(34,9,'60 litres',TRUE,2),(35,9,'45 litres',FALSE,3),(36,9,'50 litres',FALSE,4),
-- Q10: Ratio numbers
(37,10,'12 and 20',FALSE,1),(38,10,'15 and 25',TRUE,2),(39,10,'18 and 30',FALSE,3),(40,10,'9 and 15',FALSE,4),
-- Q11: Cistern leak
(41,11,'45 hours',FALSE,1),(42,11,'90 hours',TRUE,2),(43,11,'60 hours',FALSE,3),(44,11,'80 hours',FALSE,4),
-- Q12: Average even numbers
(45,12,'20',FALSE,1),(46,12,'22',TRUE,2),(47,12,'24',FALSE,3),(48,12,'18',FALSE,4),
-- Q13: Boat speed
(49,13,'6 km/h',FALSE,1),(50,13,'8 km/h',TRUE,2),(51,13,'10 km/h',FALSE,3),(52,13,'12 km/h',FALSE,4),
-- Q14: Seating arrangements
(53,14,'240',FALSE,1),(54,14,'720',TRUE,2),(55,14,'1440',FALSE,3),(56,14,'360',FALSE,4),
-- Q15: Merchant profit
(57,15,'No profit no loss',FALSE,1),(58,15,'5% profit',TRUE,2),(59,15,'5% loss',FALSE,3),(60,15,'10% profit',FALSE,4),
-- Q16: Consecutive multiples of 7
(61,16,'252',FALSE,1),(62,16,'266',TRUE,2),(63,16,'259',FALSE,3),(64,16,'273',FALSE,4),
-- Q17: Pipes A B C
(65,17,'30 minutes',FALSE,1),(66,17,'60 minutes',TRUE,2),(67,17,'45 minutes',FALSE,3),(68,17,'90 minutes',FALSE,4),
-- Q18: Trains crossing
(69,18,'6.0 seconds',FALSE,1),(70,18,'7.2 seconds',TRUE,2),(71,18,'8.0 seconds',FALSE,3),(72,18,'9.0 seconds',FALSE,4),
-- Q19: Zeros in 100!
(73,19,'20',FALSE,1),(74,19,'24',TRUE,2),(75,19,'25',FALSE,3),(76,19,'22',FALSE,4),
-- Q20: log(12)
(77,20,'1.0561',FALSE,1),(78,20,'1.0791',TRUE,2),(79,20,'1.0981',FALSE,3),(80,20,'1.1051',FALSE,4),

-- Q21: Number series
(81,21,'36',FALSE,1),(82,21,'42',TRUE,2),(83,21,'48',FALSE,3),(84,21,'40',FALSE,4),
-- Q22: APPLE coding
(85,22,'NBOHO',FALSE,1),(86,22,'NBOHP',TRUE,2),(87,22,'MBNHP',FALSE,3),(88,22,'NBPHO',FALSE,4),
-- Q23: Pointing to man
(89,23,'Sister',FALSE,1),(90,23,'Mother',TRUE,2),(91,23,'Aunt',FALSE,3),(92,23,'Daughter',FALSE,4),
-- Q24: D related to A
(93,24,'Sibling',FALSE,1),(94,24,'Parent (Father or Mother)',TRUE,2),(95,24,'Uncle/Aunt',FALSE,3),(96,24,'Grandparent',FALSE,4),
-- Q25: Students between Ravi and Meena
(97,25,'8',FALSE,1),(98,25,'10',TRUE,2),(99,25,'12',FALSE,3),(100,25,'9',FALSE,4),
-- Q26: Syllogism
(101,26,'Both I and II follow',FALSE,1),(102,26,'Only I follows',TRUE,2),(103,26,'Only II follows',FALSE,3),(104,26,'Neither follows',FALSE,4),
-- Q27: Direction distance
(105,27,'5 km',FALSE,1),(106,27,'3 km',TRUE,2),(107,27,'4 km',FALSE,3),(108,27,'8 km',FALSE,4),
-- Q28: Odd one out
(109,28,'27',FALSE,1),(110,28,'100',TRUE,2),(111,28,'64',FALSE,3),(112,28,'125',FALSE,4),
-- Q29: Circular seating
(113,29,'C',FALSE,1),(114,29,'D',TRUE,2),(115,29,'E',FALSE,3),(116,29,'F',FALSE,4),
-- Q30: Pattern 5*3=28
(117,30,'54',FALSE,1),(118,30,'64',TRUE,2),(119,30,'72',FALSE,3),(120,30,'58',FALSE,4),
-- Q31: Syllogism (pens books pencils)
(121,31,'I and II follow',FALSE,1),(122,31,'Only III follows',TRUE,2),(123,31,'All follow',FALSE,3),(124,31,'None follows',FALSE,4),
-- Q32: Family D to F
(125,32,'Daughter',FALSE,1),(126,32,'Granddaughter',TRUE,2),(127,32,'Niece',FALSE,3),(128,32,'Sister',FALSE,4),
-- Q33: Series 3,8,15,24,35
(129,33,'44',FALSE,1),(130,33,'48',TRUE,2),(131,33,'46',FALSE,3),(132,33,'50',FALSE,4),
-- Q34: Pattern shape
(133,34,'Triangle',FALSE,1),(134,34,'Circle',TRUE,2),(135,34,'Pentagon',FALSE,3),(136,34,'Hexagon',FALSE,4),
-- Q35: Coding FRIEND
(137,35,'EDRIRL',TRUE,1),(138,35,'ECPGMO',FALSE,2),(139,35,'FDRIRL',FALSE,3),(140,35,'EDRIMK',FALSE,4),

-- Q36: Synonym BENEVOLENT
(141,36,'Cruel',FALSE,1),(142,36,'Kind',TRUE,2),(143,36,'Strict',FALSE,3),(144,36,'Selfish',FALSE,4),
-- Q37: Antonym VERBOSE
(145,37,'Wordy',FALSE,1),(146,37,'Concise',TRUE,2),(147,37,'Loud',FALSE,3),(148,37,'Fluent',FALSE,4),
-- Q38: since/for
(149,38,'for',FALSE,1),(150,38,'since',TRUE,2),(151,38,'from',FALSE,3),(152,38,'by',FALSE,4),
-- Q39: Spelling
(153,39,'Accomodate',FALSE,1),(154,39,'Accommodate',TRUE,2),(155,39,'Acommodate',FALSE,3),(156,39,'Accommodat',FALSE,4),
-- Q40: Grammar error
(157,40,"don't",FALSE,1),(158,40,"doesn't",TRUE,2),(159,40,"didn't",FALSE,3),(160,40,"doesn't not",FALSE,4),
-- Q41: LOQUACIOUS
(161,41,'Quiet',FALSE,1),(162,41,'Talkative',TRUE,2),(163,41,'Friendly',FALSE,3),(164,41,'Rude',FALSE,4),
-- Q42: Neither...nor
(165,42,'were',FALSE,1),(166,42,'was',TRUE,2),(167,42,'are',FALSE,3),(168,42,'is',FALSE,4),
-- Q43: Para jumble
(169,43,'QRPS',FALSE,1),(170,43,'RQPS',TRUE,2),(171,43,'QRSP',FALSE,3),(172,43,'RSPQ',FALSE,4),
-- Q44: One word substitution
(173,44,'Bilingual',FALSE,1),(174,44,'Polyglot',TRUE,2),(175,44,'Linguist',FALSE,3),(176,44,'Interpreter',FALSE,4),
-- Q45: its/their
(177,45,'their',FALSE,1),(178,45,'its',TRUE,2),(179,45,'it''s',FALSE,3),(180,45,'his',FALSE,4),
-- Q46: Figure of speech
(181,46,'Metaphor',FALSE,1),(182,46,'Personification',TRUE,2),(183,46,'Simile',FALSE,3),(184,46,'Alliteration',FALSE,4),
-- Q47: affect/effect
(185,47,'The rain effected the match, and the affect was a cancellation.',FALSE,1),
(186,47,'The rain affected the match, and the effect was a cancellation.',TRUE,2),
(187,47,'The rain affected the match, and the affect was a cancellation.',FALSE,3),
(188,47,'The rain effected the match, and the effect was cancellation.',FALSE,4),
-- Q48: profligate
(189,48,'Extremely wealthy',FALSE,1),(190,48,'Recklessly wasteful',TRUE,2),(191,48,'Very religious',FALSE,3),(192,48,'Highly intelligent',FALSE,4),
-- Q49: Grammar correct
(193,49,'If I was you, I would not do that.',FALSE,1),(194,49,'If I were you, I would not do that.',TRUE,2),
(195,49,'If I am you, I will not do that.',FALSE,3),(196,49,'If I be you, I would not do that.',FALSE,4),
-- Q50: Idiom midnight oil
(197,50,'To waste resources',FALSE,1),(198,50,'To work or study late into the night',TRUE,2),
(199,50,'To start a fire',FALSE,3),(200,50,'To be very passionate',FALSE,4),

-- Q51: Average monthly sales
(201,51,'250',FALSE,1),(202,51,'275',TRUE,2),(203,51,'300',FALSE,3),(204,51,'260',FALSE,4),
-- Q52: Pie chart transport
(205,52,'15%',FALSE,1),(206,52,'20%',TRUE,2),(207,52,'25%',FALSE,3),(208,52,'18%',FALSE,4),
-- Q53: Bar graph % increase
(209,53,'50%',FALSE,1),(210,53,'60%',TRUE,2),(211,53,'70%',FALSE,3),(212,53,'40%',FALSE,4),
-- Q54: % above 80 English
(213,54,'20%',FALSE,1),(214,54,'25%',TRUE,2),(215,54,'30%',FALSE,3),(216,54,'15%',FALSE,4),
-- Q55: Q2:Q4 ratio
(217,55,'2:3',FALSE,1),(218,55,'3:4',TRUE,2),(219,55,'1:2',FALSE,3),(220,55,'4:5',FALSE,4),
-- Q56: Combined sales highest
(221,56,'January',FALSE,1),(222,56,'February',TRUE,2),(223,56,'March',FALSE,3),(224,56,'Equal in Feb & Mar',FALSE,4),
-- Q57: Savings Year 3
(225,57,'Rs. 12000',FALSE,1),(226,57,'Rs. 13498',TRUE,2),(227,57,'Rs. 14500',FALSE,3),(228,57,'Rs. 11000',FALSE,4),
-- Q58: Infrastructure vs Health
(229,58,'Rs. 1.0 lakhs',FALSE,1),(230,58,'Rs. 1.2 lakhs',TRUE,2),(231,58,'Rs. 0.8 lakhs',FALSE,3),(232,58,'Rs. 1.5 lakhs',FALSE,4),
-- Q59: Company growth
(233,59,'Company A (20%)',FALSE,1),(234,59,'Company B (30%)',TRUE,2),(235,59,'Both equal',FALSE,3),(236,59,'Cannot determine',FALSE,4),
-- Q60: Highest achievement %
(237,60,'Employee 4',FALSE,1),(238,60,'Employee 3 (120%)',TRUE,2),(239,60,'Employee 1',FALSE,3),(240,60,'Employee 5',FALSE,4),

-- Q61: NOT primitive
(241,61,'int',FALSE,1),(242,61,'String',TRUE,2),(243,61,'char',FALSE,3),(244,61,'boolean',FALSE,4),
-- Q62: x++ output
(245,62,'6',FALSE,1),(246,62,'5',TRUE,2),(247,62,'4',FALSE,3),(248,62,'Error',FALSE,4),
-- Q63: Loop at least once
(249,63,'for',FALSE,1),(250,63,'do-while',TRUE,2),(251,63,'while',FALSE,3),(252,63,'foreach',FALSE,4),
-- Q64: break statement
(253,64,'Skips current iteration',FALSE,1),(254,64,'Exits the loop immediately',TRUE,2),
(255,64,'Restarts the loop',FALSE,3),(256,64,'Exits the program',FALSE,4),
-- Q65: Array index
(257,65,'1',FALSE,1),(258,65,'0',TRUE,2),(259,65,'-1',FALSE,3),(260,65,'Depends on language',FALSE,4),
-- Q66: a%b output
(261,66,'3',FALSE,1),(262,66,'1',TRUE,2),(263,66,'0',FALSE,3),(264,66,'2',FALSE,4),
-- Q67: Call by reference
(265,67,'Passing value directly',FALSE,1),(266,67,'Passing a pointer to a function',TRUE,2),
(267,67,'Using global variables',FALSE,3),(268,67,'Returning multiple values',FALSE,4),
-- Q68: Recursion
(269,68,'A loop that runs forever',FALSE,1),(270,68,'A function that calls itself',TRUE,2),
(271,68,'A function with no return value',FALSE,3),(272,68,'A nested loop',FALSE,4),
-- Q69: Loop executions
(273,69,'3',FALSE,1),(274,69,'4',TRUE,2),(275,69,'5',FALSE,3),(276,69,'2',FALSE,4),
-- Q70: Binary search complexity
(277,70,'O(n)',FALSE,1),(278,70,'O(log n)',TRUE,2),(279,70,'O(n^2)',FALSE,3),(280,70,'O(1)',FALSE,4),
-- Q71: float/double
(281,71,'int',FALSE,1),(282,71,'float/double',TRUE,2),(283,71,'char',FALSE,3),(284,71,'boolean',FALSE,4),
-- Q72: Pointer function output
(285,72,'5',FALSE,1),(286,72,'15',TRUE,2),(287,72,'10',FALSE,3),(288,72,'Compile Error',FALSE,4),
-- Q73: Fibonacci time complexity
(289,73,'O(n)',FALSE,1),(290,73,'O(2^n)',TRUE,2),(291,73,'O(log n)',FALSE,3),(292,73,'O(n log n)',FALSE,4),
-- Q74: Memory leak
(293,74,'Stack overflow',FALSE,1),(294,74,'Memory allocated dynamically but never freed',TRUE,2),
(295,74,'Too many variables declared',FALSE,3),(296,74,'Program crash',FALSE,4),
-- Q75: Stack vs Heap
(297,75,'Both are same',FALSE,1),(298,75,'Stack is for static/local variables; Heap is for dynamic allocation',TRUE,2),
(299,75,'Heap is faster than stack',FALSE,3),(300,75,'Stack is for objects only',FALSE,4),

-- Q76: LIFO
(301,76,'Queue',FALSE,1),(302,76,'Stack',TRUE,2),(303,76,'Array',FALSE,3),(304,76,'Linked List',FALSE,4),
-- Q77: FIFO
(305,77,'Stack',FALSE,1),(306,77,'Queue',TRUE,2),(307,77,'Tree',FALSE,3),(308,77,'Graph',FALSE,4),
-- Q78: Array access
(309,78,'O(n)',FALSE,1),(310,78,'O(1)',TRUE,2),(311,78,'O(log n)',FALSE,3),(312,78,'O(n^2)',FALSE,4),
-- Q79: Best sorting
(313,79,'Bubble Sort',FALSE,1),(314,79,'Merge Sort',TRUE,2),(315,79,'Selection Sort',FALSE,3),(316,79,'Insertion Sort',FALSE,4),
-- Q80: Binary tree children
(317,80,'1',FALSE,1),(318,80,'2',TRUE,2),(319,80,'3',FALSE,3),(320,80,'4',FALSE,4),
-- Q81: Quick sort worst
(321,81,'O(n log n)',FALSE,1),(322,81,'O(n^2)',TRUE,2),(323,81,'O(n)',FALSE,3),(324,81,'O(log n)',FALSE,4),
-- Q82: Linked list insert beginning
(325,82,'O(n)',FALSE,1),(326,82,'O(1)',TRUE,2),(327,82,'O(log n)',FALSE,3),(328,82,'O(n^2)',FALSE,4),
-- Q83: Tree height
(329,83,'O(n)',FALSE,1),(330,83,'O(log n)',TRUE,2),(331,83,'O(1)',FALSE,3),(332,83,'O(n^2)',FALSE,4),
-- Q84: BST sorted traversal
(333,84,'Preorder',FALSE,1),(334,84,'Inorder',TRUE,2),(335,84,'Postorder',FALSE,3),(336,84,'Level order',FALSE,4),
-- Q85: Hash collision
(337,85,'Two keys with the same value',FALSE,1),(338,85,'Two keys mapping to the same hash value',TRUE,2),
(339,85,'A hash function error',FALSE,3),(340,85,'Overflow of hash table',FALSE,4),
-- Q86: Shortest path
(341,86,'BFS',FALSE,1),(342,86,'Dijkstra''s Algorithm',TRUE,2),(343,86,'DFS',FALSE,3),(344,86,'Kruskal''s Algorithm',FALSE,4),
-- Q87: Merge sort space
(345,87,'O(1)',FALSE,1),(346,87,'O(n)',TRUE,2),(347,87,'O(log n)',FALSE,3),(348,87,'O(n^2)',FALSE,4),
-- Q88: BFS data structure
(349,88,'Stack',FALSE,1),(350,88,'Queue',TRUE,2),(351,88,'Array',FALSE,3),(352,88,'Tree',FALSE,4),
-- Q89: DFS data structure
(353,89,'Queue',FALSE,1),(354,89,'Stack',TRUE,2),(355,89,'Heap',FALSE,3),(356,89,'Graph',FALSE,4),
-- Q90: Memoization
(357,90,'A type of recursion',FALSE,1),(358,90,'Storing results of subproblems to avoid recomputation',TRUE,2),
(359,90,'A sorting technique',FALSE,3),(360,90,'A greedy approach',FALSE,4),
-- Q91: BST element find
(361,91,'O(n)',FALSE,1),(362,91,'O(log n)',TRUE,2),(363,91,'O(1)',FALSE,3),(364,91,'O(n^2)',FALSE,4),
-- Q92: NOT stable sort
(365,92,'Merge Sort',FALSE,1),(366,92,'Quick Sort',TRUE,2),(367,92,'Bubble Sort',FALSE,3),(368,92,'Insertion Sort',FALSE,4),
-- Q93: Spanning tree
(369,93,'A complete graph',FALSE,1),(370,93,'A subgraph that connects all vertices with minimum edges and no cycle',TRUE,2),
(371,93,'A tree with maximum edges',FALSE,3),(372,93,'A disconnected graph',FALSE,4),
-- Q94: Edges in complete graph
(373,94,'n^2',FALSE,1),(374,94,'n(n-1)/2',TRUE,2),(375,94,'n-1',FALSE,3),(376,94,'2n',FALSE,4),
-- Q95: Dynamic array amortized
(377,95,'O(n)',FALSE,1),(378,95,'O(1)',TRUE,2),(379,95,'O(log n)',FALSE,3),(380,95,'O(n^2)',FALSE,4),

-- Q96: SELECT
(381,96,'INSERT',FALSE,1),(382,96,'SELECT',TRUE,2),(383,96,'UPDATE',FALSE,3),(384,96,'DELETE',FALSE,4),
-- Q97: TRUNCATE
(385,97,'DELETE',FALSE,1),(386,97,'TRUNCATE',TRUE,2),(387,97,'DROP',FALSE,3),(388,97,'REMOVE',FALSE,4),
-- Q98: DDL command
(389,98,'INSERT',FALSE,1),(390,98,'CREATE',TRUE,2),(391,98,'SELECT',FALSE,3),(392,98,'UPDATE',FALSE,4),
-- Q99: WHERE clause
(393,99,'GROUP BY',FALSE,1),(394,99,'WHERE',TRUE,2),(395,99,'HAVING',FALSE,3),(396,99,'ORDER BY',FALSE,4),
-- Q100: Primary key
(397,100,'Allows duplicate values',FALSE,1),(398,100,'Uniqueness and non-null values in a column',TRUE,2),
(399,100,'Can be null',FALSE,3),(400,100,'Links two tables',FALSE,4),
-- Q101: COUNT query
(401,101,'4',FALSE,1),(402,101,'5',TRUE,2),(403,101,'6',FALSE,3),(404,101,'3',FALSE,4),
-- Q102: FULL OUTER JOIN
(405,102,'INNER JOIN',FALSE,1),(406,102,'FULL OUTER JOIN',TRUE,2),(407,102,'LEFT JOIN',FALSE,3),(408,102,'CROSS JOIN',FALSE,4),
-- Q103: WHERE vs HAVING
(409,103,'Both are same',FALSE,1),(410,103,'WHERE filters rows before grouping; HAVING filters after grouping',TRUE,2),
(411,103,'HAVING is used without GROUP BY',FALSE,3),(412,103,'WHERE works on grouped data',FALSE,4),
-- Q104: 3NF
(413,104,'First Normal Form (1NF)',FALSE,1),(414,104,'Third Normal Form (3NF)',TRUE,2),
(415,104,'Second Normal Form (2NF)',FALSE,3),(416,104,'Boyce Codd Normal Form (BCNF)',FALSE,4),
-- Q105: Index
(417,105,'A backup of data',FALSE,1),(418,105,'A data structure to speed up query retrieval',TRUE,2),
(419,105,'A type of constraint',FALSE,3),(420,105,'A foreign key reference',FALSE,4),
-- Q106: Subquery salary
(421,106,'SELECT * FROM emp WHERE salary > AVG(salary)',FALSE,1),
(422,106,'SELECT * FROM emp WHERE salary > (SELECT AVG(salary) FROM emp)',TRUE,2),
(423,106,'SELECT * FROM emp HAVING salary > AVG(salary)',FALSE,3),
(424,106,'SELECT AVG(salary) FROM emp WHERE salary > MAX(salary)',FALSE,4),
-- Q107: Deadlock
(425,107,'A process waiting for I/O',FALSE,1),(426,107,'Two transactions waiting indefinitely for each other to release locks',TRUE,2),
(427,107,'A query that takes too long',FALSE,3),(428,107,'A table with too many rows',FALSE,4),
-- Q108: ACID
(429,108,'Atomicity, Consistency, Integrity, Durability',FALSE,1),
(430,108,'Atomicity, Consistency, Isolation, Durability',TRUE,2),
(431,108,'Availability, Consistency, Isolation, Durability',FALSE,3),
(432,108,'Atomicity, Concurrency, Isolation, Distribution',FALSE,4),
-- Q109: GRANT
(433,109,'REVOKE',FALSE,1),(434,109,'GRANT',TRUE,2),(435,109,'ALLOW',FALSE,3),(436,109,'PERMIT',FALSE,4),
-- Q110: Correlated subquery
(437,110,'A subquery with no WHERE clause',FALSE,1),(438,110,'A subquery that references a column from the outer query',TRUE,2),
(439,110,'A subquery inside a JOIN',FALSE,3),(440,110,'A subquery in a GROUP BY clause',FALSE,4),

-- Q111: Inheritance
(441,111,'Polymorphism',FALSE,1),(442,111,'Inheritance',TRUE,2),(443,111,'Encapsulation',FALSE,3),(444,111,'Abstraction',FALSE,4),
-- Q112: Encapsulation
(445,112,'Using multiple classes',FALSE,1),(446,112,'Wrapping data and methods together and restricting direct access',TRUE,2),
(447,112,'Creating abstract classes',FALSE,3),(448,112,'Using interfaces',FALSE,4),
-- Q113: new keyword
(449,113,'class',FALSE,1),(450,113,'new',TRUE,2),(451,113,'object',FALSE,3),(452,113,'create',FALSE,4),
-- Q114: Method overloading
(453,114,'Same method different return type',FALSE,1),(454,114,'Multiple methods with the same name but different parameters',TRUE,2),
(455,114,'Overriding parent method',FALSE,3),(456,114,'Using super keyword',FALSE,4),
-- Q115: Overloading vs Overriding
(457,115,'Both are same',FALSE,1),(458,115,'Overloading is compile-time polymorphism; Overriding is runtime polymorphism',TRUE,2),
(459,115,'Overriding is compile-time',FALSE,3),(460,115,'Overloading requires inheritance',FALSE,4),
-- Q116: Method overriding
(461,116,'Method overloading',FALSE,1),(462,116,'Method Overriding',TRUE,2),(463,116,'Constructor chaining',FALSE,3),(464,116,'Encapsulation',FALSE,4),
-- Q117: Abstract class
(465,117,'A class with no methods',FALSE,1),(466,117,'A class that cannot be instantiated and may contain abstract methods',TRUE,2),
(467,117,'A class with only static methods',FALSE,3),(468,117,'A class with a private constructor',FALSE,4),
-- Q118: Interface vs Abstract
(469,118,'They are identical',FALSE,1),(470,118,'Interface has only abstract methods (by default); abstract class can have both concrete and abstract methods',TRUE,2),
(471,118,'Abstract class cannot have constructors',FALSE,3),(472,118,'Interface can have instance variables',FALSE,4),
-- Q119: Constructor
(473,119,'A static method',FALSE,1),(474,119,'A special method called automatically when an object is created',TRUE,2),
(475,119,'A method that returns the class type',FALSE,3),(476,119,'A destructor',FALSE,4),
-- Q120: this keyword
(477,120,'Refers to the parent class',FALSE,1),(478,120,'It refers to the current instance of the class',TRUE,2),
(479,120,'Refers to a static method',FALSE,3),(480,120,'Used to call a constructor of another class',FALSE,4),

-- Q121: OSI layers
(481,121,'5',FALSE,1),(482,121,'7',TRUE,2),(483,121,'4',FALSE,3),(484,121,'6',FALSE,4),
-- Q122: DHCP
(485,122,'DNS',FALSE,1),(486,122,'DHCP',TRUE,2),(487,122,'FTP',FALSE,3),(488,122,'SMTP',FALSE,4),
-- Q123: HTTP
(489,123,'High Transfer Text Protocol',FALSE,1),(490,123,'HyperText Transfer Protocol',TRUE,2),
(491,123,'Hyper Terminal Transfer Protocol',FALSE,3),(492,123,'Hosted Text Transfer Protocol',FALSE,4),
-- Q124: Routing layer
(493,124,'Data Link Layer',FALSE,1),(494,124,'Network Layer (Layer 3)',TRUE,2),(495,124,'Transport Layer',FALSE,3),(496,124,'Session Layer',FALSE,4),
-- Q125: TCP vs UDP
(497,125,'TCP is faster; UDP is reliable',FALSE,1),(498,125,'TCP is connection-oriented and reliable; UDP is connectionless and faster',TRUE,2),
(499,125,'Both are same',FALSE,3),(500,125,'UDP ensures delivery',FALSE,4),
-- Q126: Private Class C
(501,126,'10.0.0.0 to 10.255.255.255',FALSE,1),(502,126,'192.168.0.0 to 192.168.255.255',TRUE,2),
(503,126,'172.16.0.0 to 172.31.255.255',FALSE,3),(504,126,'169.254.0.0 to 169.254.255.255',FALSE,4),
-- Q127: DNS purpose
(505,127,'Encrypts web traffic',FALSE,1),(506,127,'Translates domain names to IP addresses',TRUE,2),
(507,127,'Assigns IP addresses',FALSE,3),(508,127,'Manages email routing',FALSE,4),
-- Q128: /24 subnet
(509,128,'128',FALSE,1),(510,128,'256 (254 usable)',TRUE,2),(511,128,'512',FALSE,3),(512,128,'1024',FALSE,4),
-- Q129: Hub switch router
(513,129,'All broadcast to all',FALSE,1),(514,129,'Hub broadcasts to all; Switch sends to specific MAC; Router connects different networks',TRUE,2),
(515,129,'Router and switch are same',FALSE,3),(516,129,'Hub connects networks',FALSE,4),
-- Q130: TCP three-way
(517,130,'SYN, ACK, FIN',FALSE,1),(518,130,'SYN, SYN-ACK, ACK — used to establish a TCP connection',TRUE,2),
(519,130,'ACK, SYN, SYN-ACK',FALSE,3),(520,130,'SYN, FIN, ACK',FALSE,4),

-- Q131: OS role
(521,131,'Only runs programs',FALSE,1),(522,131,'To manage hardware resources and provide services to programs',TRUE,2),
(523,131,'Only manages files',FALSE,3),(524,131,'Only provides security',FALSE,4),
-- Q132: SJF
(525,132,'FCFS',FALSE,1),(526,132,'Shortest Job First (SJF)',TRUE,2),(527,132,'Round Robin',FALSE,3),(528,132,'Priority Scheduling',FALSE,4),
-- Q133: Process
(529,133,'A program stored on disk',FALSE,1),(530,133,'A program in execution',TRUE,2),(531,133,'A piece of code',FALSE,3),(532,133,'An operating system function',FALSE,4),
-- Q134: Deadlock conditions
(533,134,'Mutual Exclusion only',FALSE,1),(534,134,'Mutual Exclusion, Hold & Wait, No Preemption, Circular Wait',TRUE,2),
(535,134,'Circular Wait only',FALSE,3),(536,134,'No Preemption and Hold & Wait only',FALSE,4),
-- Q135: Virtual memory
(537,135,'Extra RAM',FALSE,1),(538,135,'A technique that uses disk space to extend RAM',TRUE,2),(539,135,'Cache memory',FALSE,3),(540,135,'ROM',FALSE,4),
-- Q136: Process vs thread
(541,136,'They are same',FALSE,1),(542,136,'A process is an independent program; a thread is a lightweight unit within a process',TRUE,2),
(543,136,'Thread uses more memory',FALSE,3),(544,136,'A process is lighter than a thread',FALSE,4),
-- Q137: Paging
(545,137,'Dividing CPU into sections',FALSE,1),(546,137,'Dividing memory into fixed-size pages to avoid fragmentation',TRUE,2),
(547,137,'Segmenting programs into modules',FALSE,3),(548,137,'Caching disk pages',FALSE,4),
-- Q138: Fragmentation types
(549,138,'Both are the same',FALSE,1),(550,138,'Internal: wasted space within an allocated block; External: free memory in non-contiguous blocks',TRUE,2),
(551,138,'External happens inside blocks',FALSE,3),(552,138,'Internal means no fragmentation',FALSE,4),
-- Q139: Round Robin waiting time
(553,139,'4 ms',FALSE,1),(554,139,'6 ms',TRUE,2),(555,139,'8 ms',FALSE,3),(556,139,'5 ms',FALSE,4),
-- Q140: Semaphore
(557,140,'A type of process',FALSE,1),(558,140,'A synchronization variable used to control access to shared resources',TRUE,2),
(559,140,'A scheduling algorithm',FALSE,3),(560,140,'A memory management technique',FALSE,4),

-- Q141: type([])
(561,141,"<class 'dict'>",FALSE,1),(562,141,"<class 'list'>",TRUE,2),(563,141,"<class 'tuple'>",FALSE,3),(564,141,"<class 'set'>",FALSE,4),
-- Q142: Immutable Python
(565,142,'List',FALSE,1),(566,142,'Tuple',TRUE,2),(567,142,'Dictionary',FALSE,3),(568,142,'Set',FALSE,4),
-- Q143: len("Hello")
(569,143,'4',FALSE,1),(570,143,'5',TRUE,2),(571,143,'6',FALSE,3),(572,143,'Error',FALSE,4),
-- Q144: x[:-1]
(573,144,'[1, 2, 3]',FALSE,1),(574,144,'[1, 2]',TRUE,2),(575,144,'[2, 3]',FALSE,3),(576,144,'[3]',FALSE,4),
-- Q145: List comprehension
(577,145,'[x**2 for x in range(10) if x%2!=0]',FALSE,1),(578,145,'[x**2 for x in range(10) if x%2==0]',TRUE,2),
(579,145,'[x*2 for x in range(10)]',FALSE,3),(580,145,'[x**2 for x in range(0,10,2)]',FALSE,4),
-- Q146: *args
(581,146,'Accepts keyword arguments',FALSE,1),(582,146,'Accepts a variable number of positional arguments',TRUE,2),
(583,146,'Accepts a list only',FALSE,3),(584,146,'Returns multiple values',FALSE,4),
-- Q147: dict.get(3)
(585,147,'None',FALSE,1),(586,147,'not found',TRUE,2),(587,147,'KeyError',FALSE,3),(588,147,'0',FALSE,4),
-- Q148: Decorator
(589,148,'A type of loop',FALSE,1),(590,148,'A function that wraps another function to extend its behavior',TRUE,2),
(591,148,'A class method',FALSE,3),(592,148,'A built-in Python function',FALSE,4),
-- Q149: staticmethod vs classmethod
(593,149,'Both take self as first argument',FALSE,1),(594,149,'staticmethod takes no implicit first arg; classmethod takes cls as first arg',TRUE,2),
(595,149,'classmethod cannot access class variables',FALSE,3),(596,149,'staticmethod is same as classmethod',FALSE,4),
-- Q150: map lambda
(597,150,'[1, 2, 3]',FALSE,1),(598,150,'[2, 4, 6]',TRUE,2),(599,150,'[2, 4, 6, 8]',FALSE,3),(600,150,'Error',FALSE,4),

-- Q151: final keyword Java
(601,151,'abstract',FALSE,1),(602,151,'final',TRUE,2),(603,151,'static',FALSE,3),(604,151,'private',FALSE,4),
-- Q152: Default int Java
(605,152,'null',FALSE,1),(606,152,'0',TRUE,2),(607,152,'-1',FALSE,3),(608,152,'undefined',FALSE,4),
-- Q153: ArrayList duplicates
(609,153,'HashSet',FALSE,1),(610,153,'ArrayList',TRUE,2),(611,153,'TreeSet',FALSE,3),(612,153,'HashMap',FALSE,4),
-- Q154: ArrayList vs LinkedList
(613,154,'Both are same',FALSE,1),(614,154,'ArrayList uses dynamic array; LinkedList uses doubly linked list',TRUE,2),
(615,154,'LinkedList is faster for random access',FALSE,3),(616,154,'ArrayList uses pointers',FALSE,4),
-- Q155: synchronized
(617,155,'Makes a method faster',FALSE,1),(618,155,'To ensure only one thread accesses a method or block at a time',TRUE,2),
(619,155,'Creates a new thread',FALSE,3),(620,155,'Prevents method from being overridden',FALSE,4),
-- Q156: NullPointerException
(621,156,'ArrayIndexOutOfBoundsException',FALSE,1),(622,156,'NullPointerException',TRUE,2),(623,156,'ClassCastException',FALSE,3),(624,156,'NumberFormatException',FALSE,4),
-- Q157: Checked vs unchecked
(625,157,'Both are checked at runtime',FALSE,1),(626,157,'Checked exceptions are checked at compile time; unchecked at runtime',TRUE,2),
(627,157,'Unchecked are checked at compile time',FALSE,3),(628,157,'Both are same',FALSE,4),
-- Q158: String concatenation output
(629,158,'102030',FALSE,1),(630,158,'30Java1020',TRUE,2),(631,158,'30Java30',FALSE,3),(632,158,'Compile Error',FALSE,4),
-- Q159: Functional interface
(633,159,'An interface with multiple methods',FALSE,1),(634,159,'An interface with exactly one abstract method, used with lambda expressions',TRUE,2),
(635,159,'An interface that extends another interface',FALSE,3),(636,159,'An interface with only static methods',FALSE,4),
-- Q160: HashMap vs ConcurrentHashMap
(637,160,'Both are thread-safe',FALSE,1),(638,160,'HashMap is not thread-safe; ConcurrentHashMap is thread-safe',TRUE,2),
(639,160,'ConcurrentHashMap is slower',FALSE,3),(640,160,'HashMap is thread-safe by default',FALSE,4);

-- ============================================================================

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================================
-- FINAL SUMMARY
-- tbl_cp_mmodule (prerequisite)            : 19 rows
-- tbl_cp_mdifficulty (prerequisite)        :  3 rows
-- tbl_cp_mquestions (table 37)             : 160 questions
--   Module 1  Aptitude                     : 20 (Easy:5, Medium:7, Hard:8)
--   Module 2  Logical Reasoning            : 15 (Easy:4, Medium:6, Hard:5)
--   Module 3  Verbal Ability               : 15 (Easy:5, Medium:6, Hard:4)
--   Module 4  Data Interpretation          : 10 (Medium:5, Hard:5)
--   Module 5  Programming Fundamentals     : 15 (Easy:5, Medium:6, Hard:4)
--   Module 6  Data Structures & Algorithms : 20 (Easy:5, Medium:9, Hard:6)
--   Module 7  Database & SQL               : 15 (Easy:5, Medium:6, Hard:4)
--   Module 8  OOP Concepts                 : 10 (Easy:3, Medium:4, Hard:3)
--   Module 9  Computer Networks            : 10 (Easy:4, Medium:4, Hard:2)
--   Module 10 Operating Systems            : 10 (Easy:3, Medium:4, Hard:3)
--   Module 11 Python Programming           : 10 (Easy:3, Medium:4, Hard:3)
--   Module 12 Java Programming             : 10 (Easy:3, Medium:4, Hard:3)
-- tbl_cp_m2m_question_options (table 38)   : 640 rows (4 options per question)
-- GRAND TOTAL                              : 822 rows
-- ============================================================================