# 🎨 Frontend Status Analysis & Development Plan

**Date:** March 14, 2026  
**Status:** Frontend structure exists but integration needs work  
**Backend Status:** ✅ Phase 1 complete (13 endpoints, RBAC, JWT auth)

---

## 📊 Current Frontend State

### ✅ What Exists
Frontend project already scaffolded with:

**Technology Stack:**
- React 18+ with TypeScript
- Vite (build tool)
- Tailwind CSS (styling)
- shadcn/ui component library (40+ pre-built components)
- Vitest (testing)
- ESLint (code quality)

**Project Structure:**
```
frontend/
├── src/
│   ├── components/           (UI components + layouts)
│   ├── pages/               (Page components)
│   ├── contexts/            (React contexts - not yet using auth)
│   ├── hooks/               (Custom hooks)
│   ├── integrations/        (API integrations)
│   ├── data/                (Mock data)
│   ├── lib/                 (Utilities)
│   ├── test/                (Test files)
│   ├── App.tsx              (Main app component)
│   └── main.tsx             (Entry point)
├── public/                  (Static assets)
├── package.json             (Dependencies)
├── vite.config.ts           (Vite config)
├── tailwind.config.ts       (Tailwind theme)
└── .env                     (Supabase keys - NOT USED)
```

**Existing Pages:**
- ✅ Auth Pages: Login, Register, OtpVerification, ForgotPassword, NotFound
- ✅ Admin Pages: Dashboard, Applications, Companies, Drives, JobDescriptions, QuestionBank, Reports, RoundConfig, Analytics
- ✅ TPO Pages: Dashboard, Drives, DriveDetails, Applications, Exams, Interviews, Profile, Settings
- ✅ Student Pages: Dashboard, Applications, ApplicationDetail, Drives, Exams, Interviews, Profile, Settings

**Existing Components:**
- ✅ 40+ shadcn/ui components (Button, Card, Alert, Dialog, etc.)
- ✅ Registration components (various form sections)
- ✅ Layouts (AdminLayout, StudentLayout, NavLink)

---

## ⚠️ Current Issues

### 🔴 Critical Issues
1. **No Backend Integration**
   - Frontend currently disconnected from backend API
   - All data is likely mocked or hardcoded
   - `.env` has Supabase keys (not our backend!)
   - API calls not implemented

2. **No Authentication System**
   - Login page exists but no JWT handling
   - No token storage (localStorage)
   - No auth context for user management
   - No protected routes

3. **Missing API Service Layer**
   - No axios/fetch setup for backend calls
   - No API endpoint constants
   - No error handling for API failures

4. **No State Management**
   - Pages likely using local state only
   - No global user context
   - No role-based UI rendering

### 🟡 Medium Issues
5. **Terminal Errors**
   - Backend server not starting (Exit Code 1 in latest attempts)
   - npm start failing - likely dependency or config issue
   - Need to diagnose and fix server startup

---

## 🎯 Phase 3 Frontend Development Plan

### Priority 1: Fix Backend + Setup Integration (Day 1)
**Tasks:**
- [ ] Fix backend server startup (diagnose Exit Code 1)
- [ ] Create `.env` file in frontend pointing to `http://localhost:3000`
- [ ] Create API service layer (api/auth.js, api/users.js, api/companies.js)
- [ ] Create axios instance with base URL and interceptors

**Files to Create/Modify:**
```
frontend/src/
├── api/
│   ├── client.ts          (Axios instance with interceptors)
│   ├── auth.ts            (Login, signup, verify OTP, change password)
│   ├── users.ts           (User CRUD, profile, password)
│   ├── companies.ts       (Company CRUD)
│   └── utils.ts           (Common API utilities)
├── contexts/
│   └── AuthContext.tsx    (User + JWT token management)
├── hooks/
│   └── useAuth.ts         (Auth hook - get user, login, logout)
├── utils/
│   └── localStorage.ts    (Safe token storage)
└── .env                   (VITE_API_URL=http://localhost:3000)
```

**Detailed Tasks:**

#### 1.1 Create API Client (`frontend/src/api/client.ts`)
```typescript
import axios from 'axios';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  timeout: 10000,
});

// Add JWT token to headers
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 (token expired) - redirect to login
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default client;
```

#### 1.2 Create Auth API (`frontend/src/api/auth.ts`)
```typescript
import client from './client';

export const authAPI = {
  // Send OTP to email/phone
  sendOTP: (email: string, phone: string) =>
    client.post('/auth/send-otp', { email, phone }),

  // Verify OTP
  verifyOTP: (email: string, phone: string, emailOTP: string, phoneOTP: string) =>
    client.post('/auth/verify-otp', { email, phone, emailOTP, phoneOTP }),

  // Signup (after OTP verification)
  signup: (email: string, phone: string, password: string) =>
    client.post('/auth/signup', { email, phone, password }),

  // Login
  login: (email: string, password: string) =>
    client.post('/auth/login', { email, password }),

  // Get current user
  getMe: () => client.get('/users/me'),

  // Update profile
  updateProfile: (firstName: string, lastName: string, phone: string) =>
    client.put('/users/me', { firstName, lastName, phone }),

  // Change password
  changePassword: (oldPassword: string, newPassword: string) =>
    client.post('/users/me/change-password', { oldPassword, newPassword }),
};
```

#### 1.3 Create Auth Context (`frontend/src/contexts/AuthContext.tsx`)
```typescript
import React, { createContext, useState, useEffect } from 'react';
import { authAPI } from '../api/auth';

interface User {
  id: number;
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  role: 'student' | 'tpo' | 'recruiter' | 'admin';
  isActive: boolean;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, phone: string, password: string) => Promise<void>;
  logout: () => void;
  sendOTP: (email: string, phone: string) => Promise<void>;
  verifyOTP: (email: string, phone: string, emailOTP: string, phoneOTP: string) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // On mount, fetch user if token exists
  useEffect(() => {
    if (token) {
      authAPI
        .getMe()
        .then((res) => setUser(res.data.user))
        .catch(() => {
          localStorage.removeItem('token');
          setToken(null);
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [token]);

  const login = async (email: string, password: string) => {
    try {
      setError(null);
      const res = await authAPI.login(email, password);
      localStorage.setItem('token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    error,
    login,
    signup,
    logout,
    sendOTP,
    verifyOTP,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
```

---

### Priority 2: Update Auth Pages (Day 1-2)
**Update existing pages to use API:**

#### 2.1 Update Login Page (`frontend/src/pages/Login.tsx`)
```typescript
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Alert } from '../components/ui/alert';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setError('');
      await login(email, password);
      // Redirect based on role
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <Alert variant="destructive">{error}</Alert>}
      <Input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <Input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'Logging in...' : 'Login'}
      </Button>
    </form>
  );
}
```

#### 2.2 Update Register Page (OTP Flow)
Implement 3-step process:
1. Send OTP (email + phone)
2. Verify OTP (6-digit codes)
3. Set password & signup

---

### Priority 3: Add Protected Routes (Day 2)
**Create ProtectedRoute component:**

```typescript
// frontend/src/components/ProtectedRoute.tsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const ProtectedRoute = ({ children, requiredRole }: any) => {
  const { user, isLoading } = useAuth();

  if (isLoading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (requiredRole && !requiredRole.includes(user.role)) {
    return <Navigate to="/unauthorized" />;
  }

  return children;
};
```

**Update routing in App.tsx:**
```typescript
<Routes>
  <Route path="/login" element={<Login />} />
  <Route path="/register" element={<Register />} />
  <Route
    path="/dashboard"
    element={
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    }
  />
  <Route
    path="/companies"
    element={
      <ProtectedRoute requiredRole={['recruiter', 'admin']}>
        <Companies />
      </ProtectedRoute>
    }
  />
</Routes>
```

---

### Priority 4: Real API Integration (Day 3-5)

#### 4.1 Company Pages Integration
- **GET** /companies (list) → Companies.tsx
- **GET** /companies/:id (detail) → CompanyDetail.tsx
- **POST** /companies (create) → CompanyForm.tsx
- **PUT** /companies/:id (update) → CompanyForm.tsx
- **DELETE** /companies/:id (delete with confirmation)

**Example CompanyForm.tsx:**
```typescript
import { useState } from 'react';
import { companiesAPI } from '../api/companies';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Alert } from '../components/ui/alert';

export default function CompanyForm({ companyId }: { companyId?: number }) {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', website: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      if (companyId) {
        await companiesAPI.updateCompany(companyId, formData);
      } else {
        await companiesAPI.createCompany(formData);
      }
      // Redirect or show success
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error saving company');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <Alert variant="destructive">{error}</Alert>}
      <Input
        placeholder="Company Name"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        required
      />
      {/* Other fields */}
      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'Saving...' : 'Save Company'}
      </Button>
    </form>
  );
}
```

#### 4.2 User Profile Integration
- **GET** /users/me → Profile.tsx
- **PUT** /users/me → Edit profile
- **POST** /users/me/change-password → Settings.tsx

---

### Priority 5: Dashboard & Role-Based Views (Day 5+)

#### Student Dashboard
- Applications summary
- Upcoming exams/interviews
- Profile card
- Recent notifications

#### TPO Dashboard
- Active recruitment drives
- Total applications
- Placement status
- Student search

#### Recruiter Dashboard
- Posted job descriptions
- Applications received
- Upcoming interviews
- Company profile

#### Admin Dashboard
- System statistics
- User management
- Role assignments
- Audit logs

---

## 📋 Detailed Task Breakdown

### Week 1 (Days 1-5): Core Integration
```
Day 1:
  - Fix backend server startup ⚠️ BLOCKER
  - Create API client layer
  - Create Auth context
  - Setup .env

Day 2:
  - Update Login page
  - Update Register page (OTP flow)
  - Add Protected routes
  - Test auth flow end-to-end

Day 3:
  - Integrate Company pages
  - Create CompanyForm component
  - List/edit/delete companies
  - Test company CRUD

Day 4:
  - Integrate User profile pages
  - Update profile functionality
  - Change password page
  - Test user updates

Day 5:
  - Dashboard integration
  - Role-based rendering
  - Navigation updates
  - End-to-end testing
```

### Week 2-3 (Days 6-15): Phase 2 Features
```
Recruitment Drives:
  - Create drive creation page
  - List drives
  - Student registration for drives
  - Drive detail page

Job Descriptions:
  - Post job description form
  - List jobs with filtering
  - Job detail page
  - Skill requirements display

Applications:
  - Application form
  - Applications list
  - Status history
  - Recruiter application review

Sessions (Exams/Interviews):
  - Exam/interview scheduling
  - Student session list
  - Take exam interface
  - Interview evaluation form
```

---

## 🔧 Backend Integration Details

### Environment Variables
```bash
# frontend/.env
VITE_API_URL=http://localhost:3000
VITE_APP_NAME=Artiset Campus
VITE_LOG_LEVEL=debug
```

### API Base URL Pattern
```typescript
// All requests to backend
GET    /auth/send-otp
POST   /auth/verify-otp
POST   /auth/signup
POST   /auth/login
GET    /users/me
PUT    /users/me
POST   /users/me/change-password
GET    /users (admin only)
POST   /users (admin only)
PUT    /users/:id (admin only)
DELETE /users/:id (admin only)
GET    /companies
GET    /companies/:id
POST   /companies
PUT    /companies/:id
DELETE /companies/:id
```

### Authentication Flow
```
1. User logs in with email + password
2. Backend returns { token, user }
3. Frontend stores token in localStorage
4. All subsequent requests include: Authorization: Bearer <token>
5. If token expires (401), redirect to login
6. On logout, clear localStorage and redirect
```

---

## ⚠️ Backend Startup Issue - URGENT

**Current Status:** Backend failing to start (Exit Code 1)

**Troubleshooting Checklist:**
- [ ] Check if MySQL is running
- [ ] Verify database connection string in .env
- [ ] Check for dependency issues: `npm list`
- [ ] Clear node_modules and reinstall: `npm ci`
- [ ] Check for syntax errors in server.js
- [ ] Review migration errors in logs
- [ ] Check port 3000 is not in use
- [ ] Verify all required tables exist in database

**Debug Commands:**
```bash
# Check npm dependencies
npm list | grep -E "MISSING|ERR"

# Clean install
rm -rf node_modules package-lock.json
npm install

# Start with verbose output
DEBUG=* npm start

# Check database connection
node -e "const mysql = require('mysql2/promise'); ..."

# Kill port 3000 if in use
netstat -ano | findstr :3000
```

**ACTION:** Fix this FIRST before frontend integration proceeds.

---

## 📦 Frontend Dependencies Check

**Already installed (from package.json):**
- ✅ axios (or fetch API)
- ✅ react-router-dom
- ✅ tailwind css
- ✅ shadcn/ui
- ✅ zustand or similar state mgmt (check)

**May need to install:**
```bash
npm install axios react-router-dom zustand
```

---

## 🎯 Success Criteria

✅ **Phase 3 Complete When:**
1. Backend server starts and serves requests
2. Frontend can login with backend credentials
3. JWT token stored and used in all API calls
4. Protected routes work (unauthorized users redirected)
5. Company CRUD operations work end-to-end
6. User profile update works
7. All pages render with real data from backend
8. Role-based access control enforced on frontend
9. Error handling works (400, 401, 403, 500 errors)
10. All 13 backend endpoints are consumed by frontend

---

## 📝 Next Immediate Actions

### 🔴 BLOCKING ISSUE
**Fix Backend Startup (NOW):**
```bash
cd "c:\Users\HP\OneDrive\Desktop\Artiset internship\backend"
npm start
# If fails, run:
npm ci  # clean install
npm start
```

### ✅ Then Proceed With:
1. Create `frontend/src/api/` folder with client.ts, auth.ts, users.ts, companies.ts
2. Create `frontend/src/contexts/AuthContext.tsx`
3. Create `frontend/.env` with VITE_API_URL
4. Update Login.tsx to use useAuth hook
5. Run frontend: `npm run dev` from frontend folder
6. Test login flow

---

## 📚 Reference

**Frontend Technologies:**
- React 18+ documentation: https://react.dev
- TypeScript: https://www.typescriptlang.org
- Tailwind CSS: https://tailwindcss.com
- shadcn/ui: https://ui.shadcn.com
- React Router: https://reactrouter.com
- Axios: https://axios-http.com

**Backend API (Ready):**
- All 13 endpoints documented in `../backend/API_REFERENCE.md`
- RBAC roles: student, tpo, recruiter, admin
- JWT token format: Bearer <token>

---

**Status:** ⏳ Waiting for backend fix  
**Assigned to:** Full-stack dev  
**Estimated Time:** 1-2 weeks for Phase 3 frontend  
**Critical Path:** Fix backend → Auth integration → CRUD pages → Dashboards
