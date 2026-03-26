# ArtisetCampus

A monorepo for the Artiset Campus platform:
- **Backend**: Node.js/Express + SQL (via `backend/`), exposes auth, registration, resume proxy endpoints.
- **Frontend**: React + Vite + TypeScript + Tailwind/shadcn (via `frontend/`), student registration UI.
- **Resume parsing**: Backend proxies to an external parser service at `http://127.0.0.1:8000`.

## Prerequisites
- Node.js 18+ and npm
- SQL database (see `backend/config/db.js` for connection)
- Resume parser service reachable at `http://127.0.0.1:8000` (FastAPI per project docs)

## Backend setup
```powershell
cd backend
npm install
# copy .env.example to .env and fill DB/secret values
npm start
```
Key endpoints:
- `POST /resume/parse-preview` — forwards resume file to parser, returns mapped draft + `resume_hash`.
- `GET /resume/get-cached/:hash` — fetch cached parse by hash from parser.
- Auth/registration routes under `/auth`, student routes under `/student`.

## Frontend setup
```powershell
cd frontend
npm install
npm run dev -- --host
```
Set `VITE_API_URL` in `frontend/.env` (defaults to `http://localhost:3000`).

## Resume parsing flow
1) Frontend uploads resume to backend `/resume/parse-preview`.
2) Backend sends to parser at `http://127.0.0.1:8000/resume/parse-preview` and maps response into registration draft.
3) Frontend pre-fills the registration form, saves draft via `/auth/registration/draft`, and shows a banner.
4) If data is lost, frontend can call `GET /resume/get-cached/{resume_hash}` to reload cached parse.

## Tests
Project-specific test scripts were removed as part of cleanup; add targeted tests as needed under `backend/tests` or frontend `vitest`.

## Notes
- CORS origins are configured via `FRONTEND_ORIGINS` env (default `http://localhost:3000`).
- Body size limit defaults to `1mb`; adjust `BODY_LIMIT` env if needed.
