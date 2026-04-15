# Frontend (React + Vite + TS)

Single source of truth for the frontend docs.

## Stack
- React, TypeScript, Vite
- Tailwind CSS + shadcn-ui
- Axios client at `VITE_API_URL` (defaults to `http://localhost:3000`)

## Setup
```powershell
cd frontend
npm install
npm run dev -- --host
```
Set `VITE_API_URL` in `frontend/.env` to point at the backend (default `http://localhost:3000`).

## Resume parsing UX
- Upload resume → calls `POST /resume/parse-preview` via backend proxy.
- On success: logs response, stores `resume_hash`, fills registration draft, shows success banner, scrolls to form.
- If data lost but hash exists: "Retrieve parsed data" button calls `GET /resume/get-cached/{hash}`.
- On failure: shows error banner; user can fill manually.

## Testing
- Add or run component/tests with `npm run test` (configure as needed).
