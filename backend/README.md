# Backend (Express + SQL)

Single source of truth for the backend docs.

## Stack
- Node.js / Express
- SQL DB (see `config/db.js` for connection)
- JWT auth, resume parser proxy to `http://127.0.0.1:8000`

## Setup
```powershell
cd backend
npm install
copy .env.example .env  # fill DB and JWT vars
npm start
```

Key env vars (see `.env.example`): DB connection, `JWT_SECRET`, `FRONTEND_ORIGINS`, optional `BODY_LIMIT`.

## Important routes
- `POST /auth/send-otp`, `POST /auth/verify-otp`, `POST /auth/signup`
- `GET /auth/registration/draft`, `PUT /auth/registration/draft`, `POST /auth/registration/submit`
- `POST /resume/parse-preview` → forwards file to parser and returns mapped draft + `resume_hash`
- `GET /resume/get-cached/:hash` → fetch cached parse from parser

## Resume parsing flow (backend side)
1) Receive file (multer in-memory, 8MB limit), log steps.
2) Forward to parser `http://127.0.0.1:8000/resume/parse-preview`.
3) Map `parserResponse.data.parsed` into registration draft and return `{ success, resume_hash, draft }`.
4) Errors are logged with step info; 500 returned on failure.

## Scripts
- `npm start` – run server
- `npm test` – (add tests as needed; placeholder)


