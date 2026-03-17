# OTP Authentication Backend

This is a production-style OTP authentication backend using Node.js, Express, and MySQL.

Important behavior:
- OTPs are NOT sent via email or SMS.
- For development, generated OTPs are printed to the server console via `console.log` (so you can use them to verify).
- OTP is never returned in API responses.

Tech stack
- Node.js
- Express
- MySQL (mysql2)
- jsonwebtoken
- dotenv
- cors
- bcrypt

Project structure
```
backend/
  server.js
  config/db.js
  routes/authRoutes.js
  controllers/authController.js
  utils/generateOtp.js
  package.json
  .env.example
  README.md
```

Database
- Your DB must already contain `tbl_cp_student` (the student table). Adjust column names in `controllers/authController.js` if needed.

The project will ensure `otp_requests` table exists. SQL definition used:

```sql
CREATE TABLE IF NOT EXISTS otp_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255),
  otp_code VARCHAR(255),
  expires_at DATETIME,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

API Endpoints

POST /auth/send-otp
Input:
```
{ "email": "user@example.com" }
```
Behavior:
- Generates a 6-digit OTP (expires after 5 minutes)
- Deletes previous OTP requests for the email
- Stores hashed OTP in `otp_requests`
- Prints OTP in server console: `console.log('OTP for', email, 'is:', otp)`
Response:
```
{ "message": "OTP generated successfully" }
```

POST /auth/verify-otp
Input:
```
{ "email": "user@example.com", "otp": "123456" }
```
Behavior:
- Checks latest OTP request for email
- Validates expiry and OTP match
- Marks `is_verified = true`
Response:
```
{ "message": "OTP verified successfully" }
```

POST /auth/signup
Input:
```
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "user@example.com",
  "contact_number": "9999999999"
}
```
Behavior:
- Requires latest OTP for email to be verified
- Inserts a new row into `tbl_cp_student`
- Returns a JWT token
Response:
```
{ "message": "Signup successful", "token": "jwt_token" }
```

Setup
1. Copy `.env.example` to `.env` and fill values.
2. Install dependencies:

```powershell
npm install express mysql2 cors dotenv jsonwebtoken bcrypt
```

3. Start server:

```powershell
node server.js
```

Notes & assumptions
- I assumed `tbl_cp_student` has columns `first_name`, `last_name`, `email`, and `contact_number`. If your table uses different column names, update `controllers/authController.js` accordingly.
- OTPs are hashed before storage using `bcrypt` for better security.
- The server prints plaintext OTP to console for development only; do not do this in production.

Next steps you may want
- Add rate-limiting to `POST /auth/send-otp` (to avoid abuse)
- Add email normalization and canonicalization
- Add tests for endpoints
- Add middleware to validate request bodies

