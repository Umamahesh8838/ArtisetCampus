# ArtisetCampus Overview

This overview explains every major part of the project—backend, frontend, flows, and where key functions live—so you can navigate quickly.

## Repository at a glance
- Root docs: `README.md` (project), `overview_uma.md` (this file)
- Backend app: `backend/`
- Frontend app: `frontend/`

## Backend (Express + SQL)
**Purpose**: Auth, registration draft save/load/submit, and resume parsing proxy.

**Stack**: Node.js, Express, SQL DB (config in `backend/config/db.js`), JWT auth, multer (in-memory uploads), axios proxy to parser (`http://127.0.0.1:8000`).

**Process entry**: `backend/server.js`
- Sets CORS (`FRONTEND_ORIGINS`), JSON body limit (`BODY_LIMIT`), mounts routers, starts server after DB init.

**Routers and main functions**
- `routes/authRoutes.js` → OTP send/verify, signup, registration draft GET/PUT, submit.
- `routes/studentRoutes.js`, `routes/userRoutes.js`, `routes/companyRoutes.js` → student/user/company endpoints (see respective controllers).
- `routes/resumeRoutes.js` → resume proxy + save-confirmed:
  - `POST /resume/parse-preview`: multer receives file (8MB); logs every step; forwards to parser; reads `parserResponse.data.data.parsed`; maps via `mapParserToDraft`; returns `{ success, resume_hash, draft }`.
  - `GET /resume/get-cached/:hash`: forwards to parser cache endpoint and returns payload.
  - `POST /resume/save-confirmed`: forwards confirmed draft to parser.

**Controllers (located under `backend/controllers/`)**
- `authController.js`: OTP generation/verification, signup, draft fetch/save/submit.
- `studentController.js`: student-related endpoints (profile/registration helpers).
- `userController.js`: user CRUD or profile functions.
- `companyController.js`: company endpoints.

**Middleware**
- `middleware/auth.js` and `utils/authMiddleware.js`: JWT verification (`authenticateToken`).
- `middleware/rbac.js`: role-based checks (where applied).

**Utilities**
- `config/db.js`: DB connection pool/init.
- `utils/logger.js`: logging (used in routes).
- Migration helpers: `migrations/002_create_recruitment_schema.sql`, scripts under `scripts/` and fix_*.js for schema hygiene.

**Resume mapping (core logic)**
- In `routes/resumeRoutes.js`, `mapParserToDraft(parsed)` maps parser fields to registration draft shape:
  - basicProfile: names, email, phone, links, DOB, gender, city
  - schoolEducation: standard, board, schoolName, percentage, passingYear
  - collegeEducation: collegeName, courseName, specializationName, start/end year, cgpa/percentage
  - workExperience: company, location, designation, employmentType, start/end, isCurrent
  - projects: title, description, achievements, dates, skillsUsed
  - skills: skillName, proficiencyLevel
  - languages, certifications, interests

**Runtime defaults & envs** (see `.env.example`)
- Upload limit: 8MB (multer memory).
- JSON body limit: `BODY_LIMIT` (default `1mb`).
- CORS: `FRONTEND_ORIGINS` (default `http://localhost:3000`).
- DB: `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`.
- Auth: `JWT_SECRET`.

**Setup & run**
```powershell
cd backend
npm install
copy .env.example .env  # fill DB + JWT + CORS vars
npm start
```

**Troubleshooting (backend)**
- Resume parsing: check console for `[RESUME] Step ...` logs; ensure parser service is running at `http://127.0.0.1:8000`.
- CORS errors: confirm `FRONTEND_ORIGINS` includes the frontend origin.
- Payload too large: increase `BODY_LIMIT` or adjust multer limit in `resumeRoutes.js`.
- DB issues: verify `.env` DB credentials and connectivity in `config/db.js`.

## Frontend (React + Vite + TS)
**Purpose**: Student registration experience with auto-fill from resumes and draft persistence.

**Stack**: React, TypeScript, Vite, Tailwind, shadcn-ui, Axios (`VITE_API_URL`, default `http://localhost:3000`).

**Core data flow**
- Global state: `src/contexts/RegistrationContext.tsx`
  - Holds `draftData`, `resumeData`, section completion, profile preview.
  - Exposes `updateDraftAndGoNext` (saves draft and advances sections), `setDraftDataDirect` (used by resume auto-fill), `setResumeData`.
- Upload & banners: `src/pages/student/Profile.tsx`
  - Handles file upload to `/resume/parse-preview`; logs `[FRONTEND]` response; saves draft via `/auth/registration/draft`; applies draft to context; shows success/error banners; smooth scrolls.
  - “Retrieve parsed data” button calls `/resume/get-cached/{hash}` when a hash exists.
- Form sections (read from `draftData`):
  - Basic: `components/registration/BasicProfile.tsx`
  - Address: `AddressDetails.tsx`
  - School: `SchoolEducation.tsx`
  - College: `CollegeEducation.tsx`
  - Semesters: `SemesterMarks.tsx`
  - Work: `WorkExperience.tsx`
  - Projects: `Projects.tsx`
  - Skills: `Skills.tsx`
  - Languages: `Languages.tsx`
  - Interests: `Interests.tsx`
  - Certifications: `Certifications.tsx`

**Setup & run**
```powershell
cd frontend
npm install
npm run dev -- --host
```
Set `VITE_API_URL` in `frontend/.env` if the backend is not at the default.

**Testing**
- Vitest config present (`vitest.config.ts`); run/add tests with `npm run test`.

**Troubleshooting (frontend)**
- If form does not prefill: check browser console for `[FRONTEND]` logs; confirm backend returns `draft` and `resume_hash`.
- CORS/401: ensure auth token present and `VITE_API_URL` points to the backend allowed origin.
- Retrieve button not working: verify a stored `resume_hash` and backend `/resume/get-cached/:hash` reach the parser.

## Quick dev loop
1) Start backend: `cd backend; npm start`
2) Start frontend: `cd frontend; npm run dev -- --host`
3) Ensure `VITE_API_URL` points to the backend URL.
4) Ensure parser is up at `http://127.0.0.1:8000` for resume operations.

### Suggested terminal layout (4 panes)
1. **Terminal 1 — Ollama** (if using local LLM helper)
  ```powershell
  ollama serve
  ```
  Expect: model loading / inference logs.

2. **Terminal 2 — Resume Parser (FastAPI)**
  ```powershell
  uvicorn main:app --port 8000 --reload
  ```
  Expect: step logs like `[STEP 1/8]`, `[STEP 2/8]` with checkmarks.

3. **Terminal 3 — Express Backend**
  ```powershell
  cd backend
  npm start
  ```
  Expect: `[RESUME] Step 1... Step 5` logs for resume proxy.

4. **Terminal 4 — Browser DevTools Console**
  - Open Chrome → F12 → Console tab while using the app.
  - Expect: `[FRONTEND]` logs for SSE/resume upload responses and draft mapping.

## File map (jump points)
- Backend: `server.js`, `routes/resumeRoutes.js`, `routes/authRoutes.js`, `controllers/*`, `config/db.js`
- Frontend: `src/pages/student/Profile.tsx`, `src/contexts/RegistrationContext.tsx`, `src/components/registration/*`

## Need more depth?
- Backend deep dive: `backend/README.md`
- Frontend deep dive: `frontend/README.md`
- Repo-level summary: `README.md`
