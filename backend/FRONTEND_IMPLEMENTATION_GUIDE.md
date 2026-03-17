# 🚀 Frontend Implementation Guide - Phase 3

**Duration:** 2-3 weeks  
**Status:** Ready to start (backend needs fix first)  
**Team:** Frontend developer + Full-stack dev for integration

---

## 📋 Frontend Development Roadmap

### Week 1: Foundation & Auth Integration
**Goal:** Backend working + Auth flows integrated

#### Day 1: Backend Fix + Setup
**Deliverable:** Backend server running, frontend can call APIs

```bash
# 1. Diagnose backend issue
cd backend
npm list
npm ci  # clean install dependencies
node server.js  # test direct execution
npm start  # test npm start

# 2. If database issue:
# - Check MySQL service running
# - Verify .env DATABASE_URL
# - Clear migrations, restart
# - Check tbl_cp_student exists in DB

# 3. Once backend running:
cd ../frontend
npm install  # ensure all deps
npm run dev  # start frontend dev server on port 5173
```

**Success Metric:** 
- Backend logs show "Server running on port 3000"
- Frontend loads on http://localhost:5173
- curl -X GET http://localhost:3000/auth/send-otp returns valid response

---

#### Day 2-3: API Layer Implementation
**Deliverable:** API client, Auth context, Auth pages working

**Files to Create:**

**1️⃣ `frontend/src/api/client.ts`** (70 lines)
```typescript
// API client setup with axios
// - Base URL from env
// - JWT interceptor (add token to headers)
// - 401 handling (redirect to login)
// - Error handling (show user-friendly messages)
```

**2️⃣ `frontend/src/api/auth.ts`** (50 lines)
```typescript
// Auth API functions
// - sendOTP(email, phone)
// - verifyOTP(email, phone, emailOTP, phoneOTP)
// - signup(email, phone, password)
// - login(email, password)
// - changePassword(old, new)
```

**3️⃣ `frontend/src/api/users.ts`** (40 lines)
```typescript
// User API functions
// - getMe()
// - updateProfile(firstName, lastName, phone)
// - changePassword(old, new)
// Admin only:
// - getAllUsers(role, isActive, limit, offset)
// - getUserById(id)
// - createUser(email, phone, password, role)
// - updateUser(id, fields)
// - deleteUser(id)
```

**4️⃣ `frontend/src/api/companies.ts`** (40 lines)
```typescript
// Company API functions
// - getCompanies(limit, offset, isActive)
// - getCompanyById(id)
// - createCompany(data)
// - updateCompany(id, data)
// - deleteCompany(id)
// - getCompanyDrives(id, limit, offset)
```

**5️⃣ `frontend/src/contexts/AuthContext.tsx`** (150 lines)
```typescript
// Auth context + provider
// - User state (id, email, role, etc)
// - Token management
// - Login, logout, signup functions
// - useAuth hook
// - Auto-load user on mount if token exists
```

**6️⃣ `frontend/src/hooks/useAuth.ts`** (15 lines)
```typescript
// Custom hook
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
};
```

**7️⃣ `frontend/src/hooks/useApi.ts`** (30 lines)
```typescript
// API hook for data fetching with loading/error states
export const useApi = (apiCall, deps) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    setLoading(true);
    apiCall()
      .then(res => setData(res.data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, deps);
  
  return { data, loading, error };
};
```

**8️⃣ `frontend/.env`** (Updated)
```bash
VITE_API_URL=http://localhost:3000
VITE_APP_NAME=Artiset Campus
```

**9️⃣ `frontend/src/App.tsx`** (Updated)
```typescript
// Wrap app with AuthProvider
// Update routing to use protected routes
// Add error boundary
```

**Test After Completion:**
```bash
npm run dev
# Navigate to http://localhost:5173/login
# Try login with test user
# Check browser console for API calls
# Verify token in localStorage
```

---

#### Day 4-5: Auth Pages Integration
**Deliverable:** Login, Register, OTP pages working with backend

**Update Files:**

**`frontend/src/pages/Login.tsx`** (80 lines)
```typescript
Functionality:
- Email + Password form
- useAuth() hook for login
- Error display (Alert component)
- Loading state
- Redirect to /dashboard on success
- Link to /register for new users
- "Forgot Password?" link
- Role-based redirect (admin → /admin, tpo → /tpo, etc)
```

**`frontend/src/pages/Register.tsx`** (200 lines)
```typescript
Multi-step form:
Step 1: Email + Phone
  - sendOTP() on submit
  - Show "OTP sent" message

Step 2: Verify OTP
  - 2 input fields (email OTP + phone OTP)
  - verifyOTP() on submit
  - 30-second resend timer

Step 3: Password Setup
  - Password + confirm password
  - Password strength indicator
  - signup() on submit
  - Redirect to login

Components:
- useAuth hook integration
- Form validation
- Error handling
- Loading states
- Progress indicator
```

**`frontend/src/pages/ForgotPassword.tsx`** (150 lines)
```typescript
Step 1: Send OTP
  - Email input
  - sendOTP() (can reuse auth OTP)
  
Step 2: Verify & Reset
  - OTP input
  - New password input
  - Password reset endpoint (create if needed)
  
Integration:
- Similar to Register flow
- Redirect to login on success
```

**Protected Route Component:** `frontend/src/components/ProtectedRoute.tsx` (30 lines)
```typescript
<Routes>
  <Route path="/login" element={<Login />} />
  <Route path="/register" element={<Register />} />
  <Route path="/forgot-password" element={<ForgotPassword />} />
  
  {/* Protected routes */}
  <Route
    path="/dashboard"
    element={
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    }
  />
  
  {/* Role-specific routes */}
  <Route
    path="/admin/*"
    element={
      <ProtectedRoute requiredRole={['admin']}>
        <AdminLayout />
      </ProtectedRoute>
    }
  />
  
  <Route
    path="/tpo/*"
    element={
      <ProtectedRoute requiredRole={['tpo']}>
        <TPOLayout />
      </ProtectedRoute>
    }
  />
  
  <Route
    path="/recruiter/*"
    element={
      <ProtectedRoute requiredRole={['recruiter']}>
        <RecruiterLayout />
      </ProtectedRoute>
    }
  />
  
  <Route
    path="/student/*"
    element={
      <ProtectedRoute requiredRole={['student']}>
        <StudentLayout />
      </ProtectedRoute>
    }
  />
</Routes>
```

**Test After Completion:**
```bash
# Test signup flow (should create user via API)
Email: test@example.com
Phone: 9876543210
OTP: (check server logs)

# Test login flow (should return JWT token)
# Verify token in localStorage
# Verify redirect to dashboard
```

---

### Week 2: CRUD Pages & Data Integration
**Goal:** All 13 backend endpoints consumed by frontend

#### Day 6-8: User Profile Pages
**Deliverable:** Profile view, edit, password change pages

**`frontend/src/pages/Profile.tsx`** (150 lines)
```typescript
Displays:
- User avatar (from gravatar or UI component)
- First name, last name
- Email
- Phone
- Role badge
- Account created date
- Actions:
  - Edit Profile button
  - Change Password button
  - Logout button

Integrations:
- GET /users/me → useAuth().user
- Shows user data from context
- Refresh on page load
```

**`frontend/src/pages/ProfileEdit.tsx`** (120 lines)
```typescript
Form fields:
- First Name (text)
- Last Name (text)
- Phone (tel)
- [Disabled] Email (read-only)
- [Disabled] Role (read-only)

Functionality:
- useApi() hook to fetch current data
- Form submit calls: PUT /users/me
- Success: Toast notification + redirect
- Error: Show error Alert
- Loading: Disable submit button

Example:
handleSubmit = async (e) => {
  const response = await usersAPI.updateProfile(
    firstName, lastName, phone
  );
  showToast('Profile updated');
  navigate('/profile');
}
```

**`frontend/src/pages/ChangePassword.tsx`** (100 lines)
```typescript
Form fields:
- Old Password (password)
- New Password (password)
- Confirm Password (password)

Validation:
- Passwords match check
- Min 8 characters
- Must contain uppercase, number

Functionality:
- POST /users/me/change-password
- Success: Logout user
- Redirect to login

Example:
handleSubmit = async (e) => {
  const response = await usersAPI.changePassword(
    oldPassword, newPassword
  );
  logout();
  navigate('/login?message=PasswordChanged');
}
```

---

#### Day 8-10: Company Management Pages
**Deliverable:** Company CRUD pages working with backend

**`frontend/src/pages/Companies.tsx`** (180 lines)
```typescript
Data Table:
- Company name
- Email
- Phone
- SPOC (if logged in as recruiter)
- Is Active (toggle for admin)
- Actions (Edit, Delete, View Drives)

Features:
- GET /companies → List all
- Pagination (limit=10, offset)
- Search filter by name/email
- Sorting by name/date
- Delete confirmation dialog
- Loading state (skeleton loader)
- Empty state message

UI Components:
- useApi() for data fetching
- Table component (shadcn)
- Pagination component
- SearchInput
- Dialog (confirm delete)

Example API call:
const { data: companies, loading } = useApi(
  () => companiesAPI.getCompanies(10, 0, true),
  []
);
```

**`frontend/src/pages/CompanyDetail.tsx`** (150 lines)
```typescript
Display:
- Company name, email, phone, website
- SPOC (if exists)
- Created date, updated date
- Is Active status
- Recruitment Drives (list)

Tabs:
- Overview
- Details
- Recruitment Drives
- Team (members)

Actions (role-based):
- Edit (if recruiter/admin)
- Delete (if admin)
- Add Drive (if recruiter/admin)
- View Drives

Example:
const { id } = useParams();
const { data: company } = useApi(
  () => companiesAPI.getCompanyById(id),
  [id]
);
```

**`frontend/src/pages/CompanyForm.tsx`** (180 lines)
```typescript
Form fields (POST/PUT):
- Company Name (required)
- Email (required, email validation)
- Phone (required)
- Website (optional, URL validation)
- Description (textarea, optional)
- Address (optional)
- City (optional)
- Country (optional)

Functionality:
- Create mode (POST /companies)
- Edit mode (PUT /companies/:id)
- Load existing data if edit mode
- Form validation
- Submit button disabled during loading
- Success: Toast + redirect to list
- Error: Show error Alert

Example:
const { id } = useParams();

useEffect(() => {
  if (id) {
    companiesAPI.getCompanyById(id)
      .then(res => setFormData(res.data))
      .catch(err => setError(err.message));
  }
}, [id]);

const handleSubmit = async (e) => {
  if (id) {
    await companiesAPI.updateCompany(id, formData);
  } else {
    await companiesAPI.createCompany(formData);
  }
  navigate('/companies');
};
```

**`frontend/src/pages/CompanyDrives.tsx`** (150 lines)
```typescript
Display recruitment drives for a company:
- Drive name
- Status (active/closed)
- Created date
- Number of applications
- Actions (View, Edit, Close)

Functionality:
- GET /companies/:id/recruitment-drives
- Filter by status
- Search by drive name
- Link to drive details

Example:
const { companyId } = useParams();
const { data: drives } = useApi(
  () => companiesAPI.getCompanyDrives(companyId),
  [companyId]
);
```

**Test After Completion:**
```bash
# Test company list page
GET http://localhost:3000/companies
# Should display all companies in table

# Test company creation
POST form with name, email, phone
# Should create in database

# Test company edit
# Load company data from API
# Edit and save
# Verify PUT request sent

# Test company delete
# Click delete, confirm dialog
# Should send DELETE request

# Test role-based access
# Student role: Can only view companies (no edit/delete)
# Recruiter: Can create/edit/delete own companies
# Admin: Can manage all companies
```

---

#### Day 10-12: Dashboard Pages (Role-Based)
**Deliverable:** Dashboards for each role with live data

**`frontend/src/pages/StudentDashboard.tsx`** (200 lines)
```typescript
Cards:
- Total Applications (count)
- Active Exams (count)
- Upcoming Interviews (count)
- Placement Status (badge)

Sections:
1. Quick Stats (4 cards with numbers)
2. Recent Applications (last 5)
   - Company name
   - Status
   - Applied date
   - Link to detail
3. Upcoming Sessions
   - Exam/Interview name
   - Date/time
   - Status
4. Placed Companies (if placed)
   - Company name
   - Offer status
   - Accept/Decline buttons

Example:
const { user } = useAuth();
const stats = {
  totalApplications: 12,
  activeExams: 2,
  upcomingInterviews: 1,
  placementStatus: 'PLACED'
};

return (
  <div className="grid grid-cols-4 gap-4">
    <Card><h3>Applications: 12</h3></Card>
    <Card><h3>Exams: 2</h3></Card>
    ...
  </div>
);
```

**`frontend/src/pages/TPODashboard.tsx`** (220 lines)
```typescript
Cards:
- Active Recruitment Drives
- Total Applications
- Students Placed
- Placements in Progress

Sections:
1. Key Metrics (4 cards)
2. Recent Drives (list)
   - Drive name
   - Company
   - Applications count
   - Link to manage
3. Placements Summary (chart)
   - Companies with placements
   - Number of placements per company
4. Upcoming Sessions (calendar view)

Integrations:
- GET /companies (count)
- GET /recruitment-drives (list)
- GET /applications (count by status)
- GET /placements (count, grouped)
```

**`frontend/src/pages/RecruiterDashboard.tsx`** (220 lines)
```typescript
Cards:
- My Job Postings
- Applications Received
- Interviews Scheduled
- Offers Extended

Sections:
1. Metrics (4 cards)
2. My Companies (list of companies where SPOC)
3. Active Job Descriptions (list)
   - Title
   - Status
   - Applications count
   - Link to manage
4. Recent Applications (list)
   - Candidate name
   - Job title
   - Status
   - Actions (Review, Schedule Interview)
```

**`frontend/src/pages/AdminDashboard.tsx`** (250 lines)
```typescript
Cards:
- Total Users
- Total Companies
- Active Recruitment Drives
- Total Applications

Sections:
1. System Metrics (4 cards)
2. User Management Quick Access
3. Recent Users (list)
   - Email
   - Role
   - Status (active/inactive)
   - Actions (Edit, Deactivate)
4. System Health
   - Database connection
   - API response time
   - Error rate
5. Audit Log (recent actions)
```

---

### Week 3: Polish & Testing
**Goal:** Production-ready frontend

#### Day 13-14: Error Handling & UX
- Implement error boundaries
- Toast notifications for all actions
- Loading skeletons for data tables
- Optimistic updates (update UI before API response)
- Retry logic for failed requests
- Input validation (client-side)

#### Day 15: Responsive Design & Testing
- Mobile responsive (Tailwind breakpoints)
- E2E tests (Cypress or Playwright)
- Integration tests (Vitest)
- Performance optimization
- Dark mode (optional)

---

## 📝 Implementation Checklist

### Week 1: Foundation
- [ ] **Day 1:** Backend working + npm run dev running frontend
- [ ] **Day 2:** API client created, Auth context implemented
- [ ] **Day 3:** Auth context connected, hooks created
- [ ] **Day 4:** Login page working with backend
- [ ] **Day 5:** Register page working, OTP flow complete

### Week 2: CRUD
- [ ] **Day 6:** Profile page reading from /users/me
- [ ] **Day 7:** Profile edit page working (PUT /users/me)
- [ ] **Day 8:** Change password page working
- [ ] **Day 9:** Companies list page (GET /companies)
- [ ] **Day 10:** Company form (POST/PUT /companies)
- [ ] **Day 11:** Company detail page with drives
- [ ] **Day 12:** All dashboards integrated with real data

### Week 3: Polish
- [ ] **Day 13:** Error handling, loading states
- [ ] **Day 14:** Toast notifications, input validation
- [ ] **Day 15:** Responsive design, E2E tests

---

## 🎨 Component Library Reference

**shadcn/ui Components to Use:**
```typescript
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Alert } from "@/components/ui/alert"
import { Dialog } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select } from "@/components/ui/select"
import { Tabs } from "@/components/ui/tabs"
import { Table } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup } from "@/components/ui/radio-group"
import { Skeleton } from "@/components/ui/skeleton"
import { Toast } from "@/components/ui/toast"
import { Badge } from "@/components/ui/badge"
import { Avatar } from "@/components/ui/avatar"
```

---

## 🧪 Testing Strategy

### Unit Tests (useAuth hook)
```typescript
describe('useAuth', () => {
  it('should return user after login', async () => {
    const { result } = renderHook(() => useAuth());
    await act(async () => {
      await result.current.login('test@example.com', 'password');
    });
    expect(result.current.user).toBeDefined();
    expect(result.current.token).toBeDefined();
  });
});
```

### Integration Tests (Auth flow)
```typescript
describe('Auth Flow', () => {
  it('should complete signup + login', async () => {
    // 1. Signup with OTP
    // 2. Verify OTP
    // 3. Set password
    // 4. Login
    // 5. Assert user logged in
  });
});
```

### E2E Tests (Full journey)
```typescript
describe('Student Journey', () => {
  it('should register, login, apply for job', () => {
    // 1. Register on signup page
    // 2. Login
    // 3. Browse companies
    // 4. View job descriptions
    // 5. Submit application
    // 6. Verify application in dashboard
  });
});
```

---

## 🚀 Deployment Notes

### Before Deployment
- [ ] .env has correct backend URL
- [ ] Build optimizations enabled (tree-shaking, minification)
- [ ] Error tracking (Sentry) setup
- [ ] Analytics (GA) setup
- [ ] All environment variables set
- [ ] CORS origin updated to production domain

### Build & Deploy
```bash
# Build for production
npm run build

# Output: dist/ folder ready for deployment

# Deploy to Vercel/Netlify
# Or Docker container:
# - Use nginx to serve static files
# - Proxy /api/* to backend (or use CORS)
```

---

## 📞 Support & Resources

### Common Issues
1. **API calls failing:** Check CORS in backend, check token expiration
2. **Components not rendering:** Check AuthProvider wraps app
3. **Routes not working:** Verify React Router setup
4. **Styles not applied:** Check Tailwind CSS build process
5. **TypeScript errors:** Run `npm run type-check`

### Debug Mode
```bash
# Enable verbose logging
VITE_LOG_LEVEL=debug npm run dev

# Check network requests
# Browser → DevTools → Network tab
# Filter by /auth, /users, /companies
```

---

**Next Steps:** Fix backend startup, then proceed with Day 1 tasks.
