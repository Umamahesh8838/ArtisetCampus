# API Quick Reference - Phase 1

## Base URL
```
http://localhost:3000
```

## Authentication
All protected endpoints require:
```
Authorization: Bearer <JWT_TOKEN>
```

---

## 1. Authentication APIs

### Send Email OTP
```http
POST /auth/send-email-otp
Content-Type: application/json

{
  "email": "user@example.com"
}

Response: 200 OK
{
  "message": "OTP generated successfully"
}
```
**Note:** OTP is printed to server logs. Check console output.

### Verify Email OTP
```http
POST /auth/verify-email-otp
Content-Type: application/json

{
  "email": "user@example.com",
  "otp": "123456"
}

Response: 200 OK
{
  "message": "Email verified"
}
```

### Send Phone OTP
```http
POST /auth/send-phone-otp
Content-Type: application/json

{
  "phone": "+919876543210"
}

Response: 200 OK
{
  "message": "OTP generated successfully"
}
```

### Verify Phone OTP
```http
POST /auth/verify-phone-otp
Content-Type: application/json

{
  "phone": "+919876543210",
  "otp": "123456"
}

Response: 200 OK
{
  "message": "Phone verified"
}
```

### Signup
```http
POST /auth/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "phone": "+919876543210",
  "first_name": "John",
  "last_name": "Doe",
  "password": "SecurePass123"
}

Response: 201 Created
{
  "message": "User registered successfully",
  "user_id": 1
}
```

### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123"
}

Response: 200 OK
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user_id": 1,
  "role": "student"
}
```

---

## 2. User Management APIs

### Get Current User Profile
```http
GET /users/me
Authorization: Bearer <TOKEN>

Response: 200 OK
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "phone": "+919876543210",
    "first_name": "John",
    "last_name": "Doe",
    "role": "student",
    "is_active": true,
    "created_at": "2024-01-15T10:30:00Z"
  },
  "studentProfile": {
    "student_id": 1,
    "names": "John Doe",
    "gender": "M",
    "contact": "+919876543210"
  }
}
```

### Update Current User Profile
```http
PUT /users/me
Authorization: Bearer <TOKEN>
Content-Type: application/json

{
  "first_name": "Jonathan",
  "last_name": "Smith",
  "phone": "+919876543210"
}

Response: 200 OK
{
  "message": "Profile updated successfully",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "first_name": "Jonathan",
    "last_name": "Smith",
    "role": "student"
  }
}
```

### Change Password
```http
POST /users/me/change-password
Authorization: Bearer <TOKEN>
Content-Type: application/json

{
  "currentPassword": "SecurePass123",
  "newPassword": "NewSecurePass456"
}

Response: 200 OK
{
  "message": "Password changed successfully"
}
```

### Get All Users (Admin Only)
```http
GET /users?role=student&is_active=true&limit=20&offset=0
Authorization: Bearer <ADMIN_TOKEN>

Response: 200 OK
{
  "users": [
    {
      "id": 1,
      "email": "user@example.com",
      "phone": "+919876543210",
      "first_name": "John",
      "last_name": "Doe",
      "role": "student",
      "is_active": true,
      "created_at": "2024-01-15T10:30:00Z"
    }
  ],
  "total": 150,
  "limit": 20,
  "offset": 0
}
```

### Get User by ID (Admin Only)
```http
GET /users/1
Authorization: Bearer <ADMIN_TOKEN>

Response: 200 OK
{
  "id": 1,
  "email": "user@example.com",
  "phone": "+919876543210",
  "first_name": "John",
  "last_name": "Doe",
  "role": "student",
  "is_registration_complete": true,
  "created_at": "2024-01-15T10:30:00Z"
}
```

### Create New User (Admin Only)
```http
POST /users
Authorization: Bearer <ADMIN_TOKEN>
Content-Type: application/json

{
  "email": "newuser@example.com",
  "phone": "+919876543211",
  "first_name": "Jane",
  "last_name": "Smith",
  "password": "InitialPass123",
  "role": "recruiter"
}

Response: 201 Created
{
  "message": "User created successfully",
  "user_id": 2
}
```

### Update User (Admin Only)
```http
PUT /users/1
Authorization: Bearer <ADMIN_TOKEN>
Content-Type: application/json

{
  "first_name": "Jonathan",
  "role": "tpo",
  "is_active": true
}

Response: 200 OK
{
  "message": "User updated successfully"
}
```

### Delete User (Admin Only - Soft Delete)
```http
DELETE /users/1
Authorization: Bearer <ADMIN_TOKEN>

Response: 200 OK
{
  "message": "User deleted successfully"
}
```

---

## 3. Company Management APIs

### Get All Companies
```http
GET /companies?is_active=1&limit=20&offset=0
Content-Type: application/json

Response: 200 OK
{
  "companies": [
    {
      "company_id": 1,
      "company_name": "TechCorp Solutions",
      "headquarters": "Bangalore",
      "industry": "Software",
      "company_size": 500,
      "website": "https://techcorp.com",
      "logo_url": "https://...",
      "spoc_name": "Rajesh Kumar",
      "spoc_email": "rajesh@techcorp.com",
      "is_active": true,
      "created_at": "2024-01-15T10:30:00Z"
    }
  ],
  "total": 45,
  "limit": 20,
  "offset": 0
}
```

### Get Company by ID
```http
GET /companies/1
Content-Type: application/json

Response: 200 OK
{
  "company": {
    "company_id": 1,
    "company_name": "TechCorp Solutions",
    "headquarters": "Bangalore",
    "industry": "Software",
    "company_size": 500,
    "website": "https://techcorp.com",
    "logo_url": "https://...",
    "description": "A leading software company",
    "spoc_name": "Rajesh Kumar",
    "spoc_email": "rajesh@techcorp.com",
    "spoc_phone": "+919876543210",
    "spoc_user_id": 2,
    "is_active": true,
    "created_at": "2024-01-15T10:30:00Z"
  },
  "recruitment_drives": [
    {
      "drive_id": 1,
      "drive_name": "Summer 2024 Campus Drive",
      "status": "ongoing",
      "drive_start_date": "2024-05-01",
      "drive_end_date": "2024-06-30"
    }
  ]
}
```

### Get Company Recruitment Drives
```http
GET /companies/1/recruitment-drives?limit=10&offset=0
Content-Type: application/json

Response: 200 OK
{
  "drives": [
    {
      "drive_id": 1,
      "drive_name": "Summer 2024 Campus Drive",
      "status": "ongoing",
      "drive_start_date": "2024-05-01",
      "drive_end_date": "2024-06-30",
      "description": "On-campus recruitment for 2024",
      "created_at": "2024-01-10T09:00:00Z"
    }
  ],
  "total": 3,
  "limit": 10,
  "offset": 0
}
```

### Create Company (Recruiter/Admin/TPO Only)
```http
POST /companies
Authorization: Bearer <RECRUITER_TOKEN>
Content-Type: application/json

{
  "company_name": "InnovateLabs Inc",
  "headquarters": "Hyderabad",
  "industry": "AI/ML",
  "company_size": 200,
  "website": "https://innovatelabs.com",
  "logo_url": "https://...",
  "description": "Leading AI/ML company",
  "spoc_name": "Priya Singh",
  "spoc_email": "priya@innovatelabs.com",
  "spoc_phone": "+919876543212"
}

Response: 201 Created
{
  "message": "Company created successfully",
  "company_id": 2
}
```

### Update Company (Admin or SPOC Only)
```http
PUT /companies/1
Authorization: Bearer <COMPANY_SPOC_TOKEN>
Content-Type: application/json

{
  "company_name": "TechCorp Solutions Ltd",
  "company_size": 600,
  "website": "https://newtechcorp.com"
}

Response: 200 OK
{
  "message": "Company updated successfully"
}
```

### Delete Company (Admin Only - Soft Delete)
```http
DELETE /companies/1
Authorization: Bearer <ADMIN_TOKEN>

Response: 200 OK
{
  "message": "Company deleted successfully"
}
```

---

## Error Response Format

All errors follow this format:

```json
{
  "error": "Error message describing what went wrong"
}
```

### Common HTTP Status Codes
- `200 OK` - Request successful
- `201 Created` - Resource created
- `400 Bad Request` - Invalid input
- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `429 Too Many Requests` - Rate limit exceeded
- `500 Internal Server Error` - Server error

---

## Example Complete Flow

### 1. Send OTP
```bash
curl -X POST http://localhost:3000/auth/send-email-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com"}'
```
**Check server logs for OTP (e.g., `123456`)**

### 2. Verify Email OTP
```bash
curl -X POST http://localhost:3000/auth/verify-email-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","otp":"123456"}'
```

### 3. Send Phone OTP
```bash
curl -X POST http://localhost:3000/auth/send-phone-otp \
  -H "Content-Type: application/json" \
  -d '{"phone":"+919876543210"}'
```
**Check server logs for OTP**

### 4. Verify Phone OTP
```bash
curl -X POST http://localhost:3000/auth/verify-phone-otp \
  -H "Content-Type: application/json" \
  -d '{"phone":"+919876543210","otp":"123456"}'
```

### 5. Signup
```bash
curl -X POST http://localhost:3000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email":"john@example.com",
    "phone":"+919876543210",
    "first_name":"John",
    "last_name":"Doe",
    "password":"SecurePass123"
  }'
```
Response includes `user_id`

### 6. Login
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"SecurePass123"}'
```
Response includes `token`

### 7. Get User Profile
```bash
curl -X GET http://localhost:3000/users/me \
  -H "Authorization: Bearer <TOKEN_FROM_LOGIN>"
```

### 8. Create Company (as Recruiter)
```bash
curl -X POST http://localhost:3000/companies \
  -H "Authorization: Bearer <TOKEN_FROM_LOGIN>" \
  -H "Content-Type: application/json" \
  -d '{
    "company_name":"TechCorp",
    "headquarters":"Bangalore",
    "industry":"Software",
    "company_size":500,
    "spoc_name":"Rajesh",
    "spoc_email":"rajesh@techcorp.com",
    "spoc_phone":"+919876543210"
  }'
```

---

## Rate Limits by Role

| Role | Requests/Minute |
|---|---|
| Student | 100 |
| TPO | 200 |
| Recruiter | 150 |
| Admin | Unlimited |

---

## Role Permissions Matrix

| Resource | Student | TPO | Recruiter | Admin |
|---|---|---|---|---|
| Profile | R, U | R, U | R, U | R, U, D |
| Companies | R | R | CR, U | CR, U, D |
| Users | R (self) | R | R | CR, U, D |
| Applications | C, R | R | U | R |

**Legend:** C=Create, R=Read, U=Update, D=Delete

---

*Updated: 2024*
*For latest updates, refer to PHASE_1_COMPLETE.md*
