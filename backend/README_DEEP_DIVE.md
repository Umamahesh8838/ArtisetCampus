# OTP Authentication Backend - Deep Dive README

## Project Overview

This is a **production-grade OTP authentication backend** built with **Node.js, Express, and MySQL**. It implements:
- Dual-channel OTP verification (email + phone) before user signup
- Secure password hashing with bcrypt and JWT-based authentication
- A robust registration mapping system that transforms a modern registration draft into a legacy database schema
- Transactional integrity for complex multi-table registrations
- Environment-controlled structured logging
- CORS support for multi-origin frontend deployments

**Tech Stack:**
- Node.js (v14+)
- Express.js
- MySQL (mysql2/promise)
- bcrypt (password & OTP hashing)
- jsonwebtoken (JWT auth)
- dotenv (environment config)
- cors (cross-origin support)

---

## Architecture & Design Decisions

### 1. **OTP Flow (Why print to logs, not send via email/SMS?)**

**Decision:** OTP codes are printed to server logs, not sent via external services (email/SMS).

**Why:**
- Development velocity: no external service dependencies or mocking needed
- Testing simplicity: OTPs visible in logs during test runs
- Cost reduction: no email/SMS service charges
- Proof of concept: demonstrates the flow without infrastructure

**How it works:**
```
1. Frontend requests OTP → POST /auth/send-email-otp { email }
2. Backend generates 6-digit OTP, hashes it with bcrypt, stores in otp_requests table
3. Server logs: "[info] EMAIL OTP for user@example.com is: 123456"
4. Frontend submits OTP → POST /auth/verify-email-otp { email, otp }
5. Backend bcrypt-compares input against stored hash, marks is_verified = true
6. Similar flow for phone OTP
```

**Key Implementation Detail:**
- OTPs are hashed before storage (never stored in plain text)
- Each OTP request auto-expires after `OTP_EXPIRY_MINUTES` (default 5 min)
- Previous OTPs for the same identifier+type are deleted when a new one is requested
- OTP logged to server console, never returned in API response

---

### 2. **Dual-Channel Verification Requirement**

**Decision:** Both email OTP and phone OTP must be verified before signup succeeds.

**Why:**
- **Ownership proof:** confirms user controls both email and phone
- **Account recovery:** both channels available for password reset
- **Security:** raises the bar for account takeovers

**Flow:**
```
1. POST /auth/send-email-otp { email }           → OTP sent & logged
2. POST /auth/verify-email-otp { email, otp }    → is_verified = true for email
3. POST /auth/send-phone-otp { phone }           → OTP sent & logged
4. POST /auth/verify-phone-otp { phone, otp }    → is_verified = true for phone
5. POST /auth/signup { email, phone, password }  → check both verified, then create user
```

**Code flow in authController.js:**
```javascript
// In signup(), verify both channels before creating user
const emailVerified = await checkOtpVerified(email, 'email');
const phoneVerified = await checkOtpVerified(phone, 'phone');
if (!emailVerified || !phoneVerified) {
  return res.status(400).json({ message: 'Both email and phone OTPs must be verified' });
}
// Only then proceed with user creation
```

---

### 3. **Legacy Database Schema Mapping (The Core Challenge)**

**Decision:** Map a modern, normalized registration draft into a legacy relational schema with non-AUTO_INCREMENT primary keys.

**Why the complexity?**
- The legacy schema has 40+ tables tracking student profiles, education, experience, skills, etc.
- Many business-id columns (college_id, course_id, skill_id, etc.) are not AUTO_INCREMENT
- Geography chain (country → state → city → pincode) must be pre-created or validated
- A single registration can touch 15+ tables in a single transaction

**Architecture:**
```
Frontend Registration Draft (JSON)
         ↓
normalizeDraft() [validation.js]
  - Trim strings
  - Enforce max lengths
  - Parse dates/numbers
  - Set safe defaults
         ↓
processRegistration() [registrationService.js]
  - Upsert profile
  - Geography chain + addresses
  - Education + subject marks
  - Work, projects, skills M2M
  - Certifications
         ↓
15+ Legacy Database Tables (within single transaction)
  - tbl_cp_student
  - tbl_cp_student_address
  - tbl_cp_student_education
  - tbl_cp_student_subject_marks
  - tbl_cp_student_workexp
  - tbl_cp_studentprojects
  - tbl_cp_m2m_std_skill
  - tbl_cp_m2m_std_lng
  - tbl_cp_m2m_std_interest
  - tbl_cp_m2m_student_certification
  - ... and more
```

---

### 4. **Shared Primary Key Strategy**

**Decision:** `users.id == tbl_cp_student.student_id`

**Why:**
- Avoids duplication: one user record, one student record, same ID
- Simplifies joins and cleanup
- Legacy system expects student_id to reference a unique user

**Trade-off:**
- Must ensure atomicity: if users INSERT succeeds but tbl_cp_student fails, rollback entire transaction

---

### 5. **Manual ID Assignment with Retries (insertWithNextId)**

**Decision:** For legacy tables without AUTO_INCREMENT, use explicit ID assignment with retry logic on duplicate-entry.

**Why?**
- Legacy schema has many business tables with manual IDs
- Concurrent inserts can cause duplicate-key errors
- Simple `MAX(id)+1` is not race-safe in multi-threaded environment

**Implementation (masterHelpers2.js):**
```javascript
async function getNextId(connection, table, idCol) {
  const [[result]] = await connection.execute(
    `SELECT COALESCE(MAX(${idCol}), 0) + 1 AS next_id FROM ${table}`
  );
  return result.next_id;
}

async function insertWithNextId(connection, table, idCol, cols, vals) {
  let retries = 0;
  while (retries < 5) {
    try {
      const nextId = await getNextId(connection, table, idCol);
      const allCols = [idCol, ...cols];
      const allVals = [nextId, ...vals];
      await connection.execute(
        `INSERT INTO ${table} (${allCols.join(',')}) VALUES (...)`,
        allVals
      );
      return nextId;
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY' && retries < 4) {
        retries++;
        continue; // race condition, retry with new ID
      }
      throw err;
    }
  }
}
```

**Why retries?**
- Two concurrent requests to `getNextId` might get the same ID
- First insert succeeds, second gets ER_DUP_ENTRY
- Retry logic ensures eventual success without manual ID coordination

---

### 6. **Geography Chain Upsert (Defensive Master Data)**

**Decision:** Before creating an address, ensure country/state/city/pincode chain exists in master tables.

**Why?**
- Foreign keys: `tbl_cp_student_address.pincode_id` references `tbl_cp_mpincodes.pincode_id`
- Which references `city_id`, which references `state_id`, which references `country_id`
- If any intermediate row is missing, the INSERT fails with FK error
- Solution: `upsertGeographyChain()` creates/finds the chain atomically

**Example:**
```javascript
const pincodeId = await upsertGeographyChain(
  connection,
  'India',           // country
  'Karnataka',       // state
  'Bangalore',       // city
  '560001',          // pincode
  'Indiranagar'      // area_name
);
// Returns: pincode_id (creates intermediate rows if needed)

// Then use pincodeId to create address
await insertWithNextId(connection, 'tbl_cp_student_address', 'address_id',
  ['student_id', 'address_line_1', 'pincode_id'],
  [user_id, '123 Main St', pincodeId]
);
```

---

### 7. **Dynamic Column Discovery for Subject Marks**

**Decision:** Query information_schema to find available column names before inserting subject marks.

**Why?**
- Legacy schema has inconsistent column naming: `semester_name` vs `sem_name`, `subject_name` vs `subject`, etc.
- Across deployments, column names vary
- Rather than hardcoding, detect at runtime

**Implementation:**
```javascript
// Query available columns from information_schema
const [colInfo] = await connection.execute(
  `SELECT COLUMN_NAME FROM information_schema.COLUMNS 
   WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?`,
  [dbName, 'tbl_cp_student_subject_marks']
);
const availableCols = new Set(colInfo.map(r => r.COLUMN_NAME));

// Map logical names to actual column names
const candidateNames = {
  semester_name: ['semester_name', 'sem_name', 'semester'],
  subject_name: ['subject_name', 'subject', 'sub_name', 'subject_title'],
  credits: ['credits', 'credit_points'],
  internal_marks: ['internal_marks', 'internal', 'internal_mark'],
  external_marks: ['external_marks', 'external', 'external_mark'],
  total_marks: ['total_marks', 'total', 'marks'],
  grade: ['grade', 'letter_grade']
};

const resolvedCols = {};
for (const [logical, candidates] of Object.entries(candidateNames)) {
  for (const c of candidates) {
    if (availableCols.has(c)) { 
      resolvedCols[logical] = c; 
      break; 
    }
  }
}

// Use resolved column names in INSERT
const cols = ['student_id'];
const vals = [user_id];
if (resolvedCols.semester_name) {
  cols.push(resolvedCols.semester_name);
  vals.push(sem_name);
}
// ... etc
```

---

### 8. **Input Validation & Normalization (normalizeDraft)**

**Decision:** Normalize and validate all input at the start of registration to avoid downstream schema errors.

**What it does:**
- **Trims strings:** removes leading/trailing whitespace
- **Enforces max lengths:** name fields capped at 100 chars, emails at 255, etc.
- **Parses dates:** converts ISO/timestamp strings to 'YYYY-MM-DD'
- **Converts numbers:** CGPA, percentage, start_year/end_year to safe floats/ints
- **Sets defaults:** gender defaults to 'Male', status to 'Active', priority to 5
- **Handles field aliases:** accepts both `firstName` and `first_name`, `linkedIn` and `linkedin`, etc.

**Example:**
```javascript
const normalizedDraft = normalizeDraft(rawRequestBody);
// Input: { 
//   basic: { 
//     firstName: '  John  ', 
//     gender: null, 
//     dob: '1999-05-15T00:00:00.000Z' 
//   } 
// }
// Output: { 
//   basic: { 
//     firstName: 'John', 
//     gender: 'Male',        // default applied
//     dob: '1999-05-15'      // parsed to date string
//   } 
// }
```

**Location:** `utils/validation.js` / `normalizeDraft()` function

---

### 9. **Transactional Integrity**

**Decision:** All registration writes happen within a single database transaction.

**Why:**
- If any table write fails, the entire registration is rolled back
- Prevents partial/orphaned data in the DB
- Atomic from the application perspective

**Flow in authController.js:**
```javascript
async function submitRegistration(req, res) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    
    // Normalize input (defensive)
    const normalizedDraft = normalizeDraft(req.body.draft);
    
    // Delegate all writes to processRegistration (same connection, same transaction)
    await processRegistration(connection, user_id, normalizedDraft);
    
    // All writes succeeded
    await connection.commit();
    res.json({ message: 'Registration submitted successfully' });
    
  } catch (err) {
    // Any error: rollback entire transaction
    await connection.rollback();
    res.status(400).json({ message: 'Registration failed', error: err.message });
    
  } finally {
    connection.release();
  }
}
```

---

### 10. **Structured Logging**

**Decision:** Use a lightweight, LOG_LEVEL-controlled logger instead of raw console.log.

**Why:**
- **Dev/prod control:** set LOG_LEVEL=info for production, debug for dev
- **Structured output:** all logs tagged with [info], [warn], [error], [debug]
- **Sanitization ready:** can later add sanitizers to remove sensitive data
- **No external deps:** uses Node.js console under the hood (no winston/pino overhead for MVP)

**Usage in codebase:**
```javascript
const logger = require('../utils/logger');

logger.info('User signup:', email, phone);
logger.warn('OTP already verified for', email);
logger.error('DB connection failed:', err.message);
logger.debug('Detailed trace info:', traceData);
```

**Control via environment:**
```bash
LOG_LEVEL=debug node server.js    # verbose: debug, info, warn, error
LOG_LEVEL=info node server.js     # normal (default): info, warn, error
LOG_LEVEL=warn node server.js     # only: warn, error
LOG_LEVEL=error node server.js    # only: error
```

**Logger implementation (utils/logger.js):**
```javascript
const LEVEL = (process.env.LOG_LEVEL || 'debug').toLowerCase();

function shouldLog(level) {
  const order = { error: 0, warn: 1, info: 2, debug: 3 };
  return order[level] <= (order[LEVEL] ?? 3);
}

module.exports = {
  info: (...args) => { if (shouldLog('info')) console.log('[info]', ...args); },
  warn: (...args) => { if (shouldLog('warn')) console.warn('[warn]', ...args); },
  error: (...args) => { if (shouldLog('error')) console.error('[error]', ...args); },
  debug: (...args) => { if (shouldLog('debug')) console.debug('[debug]', ...args); }
};
```

---

## File Structure & Purpose

```
backend/
├── server.js
│   Purpose: Express app setup, CORS config, routes, server bootstrap
│   Key: Loads FRONTEND_ORIGINS from env, sets BODY_LIMIT, initializes DB
│
├── package.json
│   Purpose: Dependencies manifest, npm scripts (start, test, test-e2e, test-upsert)
│
├── .env
│   Purpose: Environment configuration (DB credentials, secrets, logging level)
│
├── config/
│   └── db.js
│       Purpose: MySQL connection pool, DB initialization, auto-create migrations
│       Key: Creates users and otp_requests tables if missing
│
├── controllers/
│   ├── authController.js
│   │   Purpose: OTP send/verify, signup, login, registration draft/submit handlers
│   │   Key: Calls normalizeDraft, calls processRegistration in transaction
│   │
│   ├── registrationService.js
│   │   Purpose: Full mapping logic from draft to legacy tables
│   │   Key: processRegistration(connection, user_id, draft) - NO transaction boundary
│   │   Calls: upsertGeographyChain, insertWithNextId, master resolvers
│   │
│   └── studentController.js
│       Purpose: Student profile GET endpoints (future)
│
├── routes/
│   ├── authRoutes.js
│   │   Purpose: Route definitions for /auth/* endpoints
│   │   Key: POST /send-email-otp, /verify-email-otp, /signup, /login, /registration/*
│   │
│   └── studentRoutes.js
│       Purpose: Route definitions for /student/* endpoints (future)
│
├── utils/
│   ├── generateOtp.js
│   │   Purpose: Generate random 6-digit OTP
│   │   Key: Math.random() * 1000000, zero-padded
│   │
│   ├── validation.js
│   │   Purpose: Input normalization and validation
│   │   Key: normalizeDraft(raw) - trims, enforces lengths, parses dates, sets defaults
│   │
│   ├── logger.js
│   │   Purpose: LOG_LEVEL-controlled structured logger
│   │   Key: logger.info/warn/error/debug(...args)
│   │
│   └── masterHelpers2.js
│       Purpose: Master-data resolvers, manual ID assignment, geography chain upsert
│       Key: getNextId, insertWithNextId, upsertGeographyChain, resolveCollegeId, resolveCourseId, etc.
│
├── tests/
│   ├── test_e2e.js
│   │   Purpose: End-to-end integration test
│   │   Flow: Create user → Sign JWT → POST draft → Verify row in DB → Cleanup
│   │
│   └── test_upsert.js
│       Purpose: Test geography chain upsert logic
│       Flow: Begin transaction → upsertGeographyChain → Rollback (no pollution)
│
├── scripts/
│   ├── list_tables.js
│   │   Purpose: Diagnostic - list all tables in configured DB
│   │   Usage: node scripts/list_tables.js
│   │
│   └── create_compat_views.js
│       Purpose: Create tb_* views for legacy table name compatibility
│       Usage: node scripts/create_compat_views.js
│
└── README.md / README_DEEP_DIVE.md
    Purpose: Documentation
```

---

## Key Endpoints

### OTP Endpoints

**Send Email OTP**
```
POST /auth/send-email-otp
Body: { email: "user@example.com" }
Response: { message: "OTP generated successfully" }
Server log: "[info] EMAIL OTP for user@example.com is: 123456"
```

**Verify Email OTP**
```
POST /auth/verify-email-otp
Body: { email: "user@example.com", otp: "123456" }
Response: { message: "OTP verified successfully" }
```

**Send Phone OTP**
```
POST /auth/send-phone-otp
Body: { phone: "9876543210" }
Response: { message: "OTP generated successfully" }
Server log: "[info] PHONE OTP for 9876543210 is: 654321"
```

**Verify Phone OTP**
```
POST /auth/verify-phone-otp
Body: { phone: "9876543210", otp: "654321" }
Response: { message: "OTP verified successfully" }
```

### Authentication Endpoints

**Signup (requires both OTPs verified)**
```
POST /auth/signup
Body: {
  email: "user@example.com",
  phone: "9876543210",
  password: "SecurePass123!",
  first_name: "John",
  last_name: "Doe"
}
Response: { message: "Signup successful", user_id: 5 }
```

**Login**
```
POST /auth/login
Body: { email: "user@example.com", password: "SecurePass123!" }
Response: {
  message: "Login successful",
  token: "eyJhbGc...",  // JWT token (expires in 1h)
  user_id: 5
}
```

**Password Reset (via OTP)**
```
POST /auth/reset-password
Body: { email: "user@example.com", otp: "123456", new_password: "NewPass456!" }
Response: { message: "Password reset successful" }
```

### Registration Endpoints

**Save Registration Draft**
```
POST /auth/registration/draft
Headers: { Authorization: "Bearer <jwt_token>" }
Body: {
  draft: {
    basic: { firstName: "John", lastName: "Doe", gender: "Male", dob: "1999-05-15" },
    address: {
      current: { line1: "123 Main St", city: "Bangalore", state: "KA", country: "India", pincode: "560001" }
    },
    college: { college: "IIT", course: "B.Tech", startYear: 2018, endYear: 2022, cgpa: 8.5 }
  }
}
Response: { message: "Draft saved successfully", step: "basic" }
```

**Get Registration Draft**
```
GET /auth/registration/draft
Headers: { Authorization: "Bearer <jwt_token>" }
Response: {
  draft: { ... },
  step: "college"
}
```

**Submit Registration (writes to all legacy tables in transaction)**
```
POST /auth/registration/submit
Headers: { Authorization: "Bearer <jwt_token>" }
Body: {
  draft: {
    basic: { firstName: "John", lastName: "Doe", ... },
    address: { current: { ... }, permanent: { ... } },
    college: { college: "IIT", course: "B.Tech", ... },
    semesters: [ { name: "Sem 1", subjects: [ { name: "Math", credits: 4, ... } ] } ],
    workExperience: [ { company: "Google", designation: "SWE", ... } ],
    projects: [ { title: "My Project", description: "...", ... } ],
    skills: [ { name: "Java" }, { name: "Python" } ],
    languages: [ { name: "English" }, { name: "Hindi" } ],
    interests: [ "AI", "Web Dev" ],
    certifications: [ { name: "AWS Cert", organization: "Amazon", ... } ]
  }
}
Response: { message: "Registration submitted successfully" }
// Creates/updates rows in 15+ legacy tables, all in single transaction
```

---

## Database Schema Overview

### Core Tables

**users** (new, for auth)
```
id (PK, auto-increment)
email (unique)
phone (unique)
password (bcrypt hashed)
first_name
last_name
is_email_verified (boolean)
is_phone_verified (boolean)
registration_draft (JSON)
registration_step (varchar)
is_registration_complete (boolean)
created_at
updated_at
```

**otp_requests** (new, for OTP tracking)
```
id (PK, auto-increment)
identifier (email or phone)
type ('email' or 'phone')
otp_code (bcrypt hashed)
expires_at (datetime)
is_verified (boolean)
created_at (datetime)
```

**tbl_cp_student** (legacy, student profile)
```
student_id (PK, = users.id for shared key)
salutation_id (FK to tbl_cp_msalutation)
first_name
last_name
email
contact_number
gender
user_type ('Student')
status ('Active', 'Inactive')
date_of_birth
linkedin_url
github_url
is_active (boolean)
created_at
```

**tbl_cp_student_address** (addresses, FK to geography)
```
address_id (manual PK)
student_id (FK to tbl_cp_student)
address_line_1
address_line_2
landmark
pincode_id (FK to tbl_cp_mpincodes)
address_type ('current' or 'permanent')
```

**Geography Chain (manual IDs, must pre-exist or be created):**
```
tbl_cp_mcountries
  - country_id (manual PK)
  - country_name
    ↓
tbl_cp_mstates
  - state_id (manual PK)
  - country_id (FK)
  - state_name
    ↓
tbl_cp_mcities
  - city_id (manual PK)
  - state_id (FK)
  - city_name
    ↓
tbl_cp_mpincodes
  - pincode_id (manual PK)
  - city_id (FK)
  - pincode (string)
  - area_name
```

**tbl_cp_student_education** (college education)
```
edu_id (manual PK)
student_id (FK to tbl_cp_student)
college_id (manual FK to tbl_cp_mcolleges)
course_id (manual FK to tbl_cp_mcourses)
start_year
end_year
cgpa
percentage
```

**tbl_cp_student_subject_marks** (semester marks)
```
mark_id (auto PK)
student_id (FK)
semester_name (or sem_name, flexible)
subject_name (or subject, flexible)
credits
internal_marks
external_marks
total_marks
grade
```

**M2M Tables (many-to-many junction tables):**
```
tbl_cp_m2m_std_skill        - links student ↔ skills
tbl_cp_m2m_std_lng          - links student ↔ languages
tbl_cp_m2m_std_interest     - links student ↔ interests
tbl_cp_m2m_student_certification - links student ↔ certifications
```

**Other Student Tables:**
```
tbl_cp_student_school       - 10th/12th school info
tbl_cp_student_workexp      - work experience
tbl_cp_studentprojects      - projects
```

---

## Environment Variables

Create a `.env` file in the project root:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password_here
DB_NAME=campus5

# Server
PORT=3000
BODY_LIMIT=1mb

# JWT & OTP
JWT_SECRET=your_jwt_secret_key_min_32_characters_long_for_security
OTP_EXPIRY_MINUTES=5

# Frontend CORS Origins (comma-separated, no spaces)
FRONTEND_ORIGINS=http://localhost:3000,http://localhost:8080,https://yourfrontend.com

# Logging
LOG_LEVEL=info
```

---

## Setup & Installation

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
# Edit .env with your DB credentials and secrets
```

### 3. Initialize Database
The app auto-creates the `users` and `otp_requests` tables on first run (see `config/db.js`).

For the legacy tables (`tbl_cp_student`, etc.), they should already exist in your `campus5` database.
If not, ask your DBA or run the schema creation scripts.

### 4. Start Server
```bash
npm start
```

Server will listen on `http://localhost:3000` (or configured PORT).

### 5. Run Tests
```bash
npm test                  # Run E2E integration test
npm run test-e2e          # Same as above
npm run test-upsert       # Test geography upsert helper function
```

---

## Common Workflows

### Workflow 1: User Signup (with OTP verification)

1. **Request email OTP:**
   ```bash
   curl -X POST http://localhost:3000/auth/send-email-otp \
     -H "Content-Type: application/json" \
     -d '{"email":"user@example.com"}'
   # Server logs: [info] EMAIL OTP for user@example.com is: 123456
   ```

2. **Verify email OTP:**
   ```bash
   curl -X POST http://localhost:3000/auth/verify-email-otp \
     -H "Content-Type: application/json" \
     -d '{"email":"user@example.com","otp":"123456"}'
   ```

3. **Request phone OTP:**
   ```bash
   curl -X POST http://localhost:3000/auth/send-phone-otp \
     -H "Content-Type: application/json" \
     -d '{"phone":"9876543210"}'
   # Server logs: [info] PHONE OTP for 9876543210 is: 654321
   ```

4. **Verify phone OTP:**
   ```bash
   curl -X POST http://localhost:3000/auth/verify-phone-otp \
     -H "Content-Type: application/json" \
     -d '{"phone":"9876543210","otp":"654321"}'
   ```

5. **Signup (both OTPs must be verified):**
   ```bash
   curl -X POST http://localhost:3000/auth/signup \
     -H "Content-Type: application/json" \
     -d '{
       "email":"user@example.com",
       "phone":"9876543210",
       "password":"SecurePass123!",
       "first_name":"John",
       "last_name":"Doe"
     }'
   # Response: { message: "Signup successful", user_id: 5 }
   ```

6. **Login:**
   ```bash
   curl -X POST http://localhost:3000/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"user@example.com","password":"SecurePass123!"}'
   # Response: { message: "Login successful", token: "eyJhbGc...", user_id: 5 }
   ```

### Workflow 2: Complete Registration (Draft → Submit)

1. **Save draft (step by step):**
   ```bash
   curl -X POST http://localhost:3000/auth/registration/draft \
     -H "Authorization: Bearer <token>" \
     -H "Content-Type: application/json" \
     -d '{
       "draft": {
         "basic": {
           "firstName":"John",
           "lastName":"Doe",
           "gender":"Male",
           "dob":"1999-05-15"
         },
         "college": {
           "college":"IIT Bombay",
           "course":"B.Tech",
           "startYear":2018,
           "endYear":2022,
           "cgpa":8.5
         }
       }
     }'
   ```

2. **Get draft (to see progress):**
   ```bash
   curl -X GET http://localhost:3000/auth/registration/draft \
     -H "Authorization: Bearer <token>"
   # Response: { draft: { ... }, step: "basic" }
   ```

3. **Submit complete registration (all tables written atomically):**
   ```bash
   curl -X POST http://localhost:3000/auth/registration/submit \
     -H "Authorization: Bearer <token>" \
     -H "Content-Type: application/json" \
     -d '{
       "draft": {
         "basic": {
           "firstName":"John",
           "lastName":"Doe",
           "gender":"Male",
           "dob":"1999-05-15"
         },
         "address": {
           "current": {
             "line1":"123 Main St",
             "line2":"Apt 456",
             "landmark":"Near Park",
             "city":"Bangalore",
             "state":"Karnataka",
             "country":"India",
             "pincode":"560001",
             "area_name":"Indiranagar"
           }
         },
         "college": {
           "college":"IIT Bombay",
           "course":"B.Tech",
           "startYear":2018,
           "endYear":2022,
           "cgpa":8.5,
           "percentage":85.0
         },
         "semesters": [
           {
             "name":"Sem 1",
             "subjects": [
               {
                 "name":"Mathematics",
                 "credits":4,
                 "internal":20,
                 "external":60,
                 "grade":"A"
               }
             ]
           }
         ],
         "workExperience": [
           {
             "company":"Google",
             "location":"Bangalore",
             "designation":"Software Engineer",
             "type":"Full-Time",
             "startDate":"2022-07-01",
             "endDate":"2023-06-30",
             "current":false
           }
         ],
         "projects": [
           {
             "title":"Chat Application",
             "description":"Real-time chat using WebSockets",
             "achievements":"Deployed to AWS",
             "startDate":"2022-01-01",
             "endDate":"2022-03-01"
           }
         ],
         "skills": [
           { "name":"Java" },
           { "name":"Python" },
           { "name":"JavaScript" }
         ],
         "languages": [
           { "name":"English" },
           { "name":"Hindi" },
           { "name":"Kannada" }
         ],
         "interests": ["AI", "Web Dev", "Cloud"],
         "certifications": [
           {
             "name":"AWS Solutions Architect",
             "organization":"Amazon",
             "issueDate":"2022-05-01",
             "expiryDate":"2024-05-01"
           }
         ]
       }
     }'
   # Response: { message: "Registration submitted successfully" }
   ```

4. **Verify in database:**
   ```sql
   SELECT * FROM tbl_cp_student WHERE student_id = 5;
   SELECT * FROM tbl_cp_student_address WHERE student_id = 5;
   SELECT * FROM tbl_cp_m2m_std_skill WHERE student_id = 5;
   SELECT * FROM tbl_cp_student_education WHERE student_id = 5;
   -- ... etc
   ```

---

## Error Handling & Debugging

### Payload Too Large Warning
If you see `[warn] Payload too large`, the registration draft exceeds the configured limit.

**Fix:** Increase `BODY_LIMIT` in `.env`:
```env
BODY_LIMIT=2mb
```

### OTP Already Verified
If OTP verify returns "OTP already verified", the frontend tried to verify the same OTP twice.

**Fix:** Send a new OTP request:
```bash
curl -X POST http://localhost:3000/auth/send-email-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com"}'
```

### Registration Submit Fails

**Common reasons:**
1. **Missing master data:** e.g., college name doesn't exist in `tbl_cp_mcolleges`
   - Fix: `insertWithNextId` auto-creates missing master entries
2. **Geography chain broken:** e.g., city exists but state doesn't
   - Fix: `upsertGeographyChain` ensures the chain is created
3. **Invalid input:** e.g., CGPA > 10 or negative year
   - Fix: Validation catches this; check `normalizeDraft` output in logs
4. **DB connection timeout**
   - Fix: Check `DB_HOST`, `DB_USER`, `DB_PASSWORD` in `.env`

### Enable Debug Logging
```bash
LOG_LEVEL=debug npm start
```

All debug logs will print to console.

### Diagnostic Scripts

**List all tables in DB:**
```bash
node scripts/list_tables.js
```

**Create compatibility views (tb_* → tbl_*):**
```bash
node scripts/create_compat_views.js
```

---

## Security Best Practices

1. **Passwords:** Hashed with bcrypt (cost 10, 10 salt rounds)
   - Never stored in plain text
   - Never logged

2. **OTPs:** Hashed before storage
   - Never logged in plain text (only logged at generation: "[info] OTP is: 123456")
   - Never returned in API responses

3. **JWTs:** Use strong `JWT_SECRET` from env
   - Recommended: min 32 characters
   - Example: `your_jwt_secret_key_min_32_characters_long_for_security`

4. **CORS:** Whitelist specific origins
   - Deny by default in production
   - Configure via `FRONTEND_ORIGINS` env var

5. **Body Limit:** Set to prevent DOS attacks
   - Default: 1mb (via `BODY_LIMIT` env var)

6. **SQL Injection:** All queries use parameterized statements
   - Always use `?` placeholders, never string concatenation

7. **Rate Limiting:** Not yet implemented
   - Recommended for production: rate-limit `/auth/send-*-otp` endpoints

---

## Performance Considerations

1. **Transactional overhead:** Registrations lock tables during writes
   - For high concurrency, consider:
     - Connection pooling (already in place via mysql2)
     - Read replicas for non-transactional reads
     - Async queuing for heavy registrations

2. **Geography chain upserts:** Each address triggers a chain lookup
   - To optimize:
     - Pre-populate common geography entries
     - Cache geography IDs in memory (not yet implemented)

3. **Dynamic column discovery:** Runs every registration
   - To optimize:
     - Cache schema info in memory (with TTL)
     - Refresh on admin config changes

---

## Future Enhancements

1. **Real email/SMS OTP delivery** (replace log-based)
2. **Rate limiting** (prevent OTP brute-force)
3. **Audit logging** (compliance)
4. **Pagination** (for profile APIs)
5. **Soft deletes** (for registrations)
6. **Search/filter** (by email, phone, college, etc.)
7. **TypeScript migration** (type safety)
8. **Full unit test suite** (jest/supertest)
9. **CI/CD** (GitHub Actions)
10. **API documentation** (Swagger/OpenAPI)

---

## Support & Questions

- **Check logs:** `LOG_LEVEL=debug npm start`
- **Review error messages** in server output
- **Verify .env** configuration
- **Check DB connection:** `node scripts/list_tables.js`
- **Run E2E test:** `npm test`
- **Review README** sections on specific features

---

**Built for:** Artiset Internship Program  
**Last Updated:** March 2026  
**Backend Repository:** Artiset Campus Recruitment System
