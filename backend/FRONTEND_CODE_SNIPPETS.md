# 🔧 Frontend Code Snippets - Ready to Use

**Copy-paste ready code for immediate implementation**

---

## 1️⃣ API Client Setup

### `frontend/src/api/client.ts`
```typescript
import axios, { AxiosError, AxiosResponse } from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const client = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add JWT token to request headers
client.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle response errors
client.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // 401 Unauthorized - token expired or invalid
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login?expired=true';
      return Promise.reject(new Error('Session expired. Please login again.'));
    }

    // 403 Forbidden
    if (error.response?.status === 403) {
      return Promise.reject(new Error('You do not have permission for this action.'));
    }

    // 500 Server error
    if (error.response?.status === 500) {
      return Promise.reject(new Error('Server error. Please try again later.'));
    }

    return Promise.reject(error);
  }
);

export default client;
```

### `frontend/src/api/auth.ts`
```typescript
import client from './client';

export interface User {
  id: number;
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  role: 'student' | 'tpo' | 'recruiter' | 'admin';
  isActive: boolean;
  createdAt: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export const authAPI = {
  // Send OTP to email and phone
  sendOTP: (email: string, phone: string) =>
    client.post('/auth/send-otp', { email, phone }),

  // Verify OTP codes
  verifyOTP: (
    email: string,
    phone: string,
    emailOTP: string,
    phoneOTP: string
  ) =>
    client.post('/auth/verify-otp', {
      email,
      phone,
      emailOTP,
      phoneOTP,
    }),

  // Sign up with verified OTP
  signup: (email: string, phone: string, password: string) =>
    client.post('/auth/signup', { email, phone, password }),

  // Login with email and password
  login: (email: string, password: string) =>
    client.post<LoginResponse>('/auth/login', { email, password }),

  // Get current user profile
  getMe: () => client.get<{ user: User }>('/users/me'),

  // Update user profile
  updateProfile: (
    firstName: string,
    lastName: string,
    phone: string
  ) =>
    client.put('/users/me', { firstName, lastName, phone }),

  // Change password
  changePassword: (oldPassword: string, newPassword: string) =>
    client.post('/users/me/change-password', {
      oldPassword,
      newPassword,
    }),
};
```

### `frontend/src/api/users.ts`
```typescript
import client from './client';
import { User } from './auth';

export const usersAPI = {
  // Get current user (same as auth.getMe)
  getMe: () => client.get<{ user: User }>('/users/me'),

  // Update current user profile
  updateMe: (firstName: string, lastName: string, phone: string) =>
    client.put('/users/me', { firstName, lastName, phone }),

  // Change password
  changePassword: (oldPassword: string, newPassword: string) =>
    client.post('/users/me/change-password', { oldPassword, newPassword }),

  // Admin: Get all users
  getAllUsers: (
    role?: string,
    isActive?: boolean,
    limit: number = 10,
    offset: number = 0
  ) =>
    client.get('/users', {
      params: { role, isActive, limit, offset },
    }),

  // Admin: Get specific user
  getUserById: (id: number) => client.get(`/users/${id}`),

  // Admin: Create user
  createUser: (
    email: string,
    phone: string,
    password: string,
    role: string
  ) =>
    client.post('/users', { email, phone, password, role }),

  // Admin: Update user
  updateUser: (id: number, fields: Partial<User>) =>
    client.put(`/users/${id}`, fields),

  // Admin: Delete user
  deleteUser: (id: number) => client.delete(`/users/${id}`),
};
```

### `frontend/src/api/companies.ts`
```typescript
import client from './client';

export interface Company {
  id: number;
  name: string;
  email: string;
  phone: string;
  website?: string;
  description?: string;
  address?: string;
  city?: string;
  country?: string;
  spocUserId?: number;
  spocUserName?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RecruitmentDrive {
  id: number;
  companyId: number;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: 'ACTIVE' | 'CLOSED' | 'DRAFT';
  createdAt: string;
}

export const companiesAPI = {
  // Get all companies
  getCompanies: (
    limit: number = 10,
    offset: number = 0,
    isActive?: boolean
  ) =>
    client.get<{ companies: Company[]; total: number }>('/companies', {
      params: { limit, offset, isActive },
    }),

  // Get company by ID
  getCompanyById: (id: number) =>
    client.get<{ company: Company }>(`/companies/${id}`),

  // Create company
  createCompany: (data: Partial<Company>) =>
    client.post<{ company: Company }>('/companies', data),

  // Update company
  updateCompany: (id: number, data: Partial<Company>) =>
    client.put<{ company: Company }>(`/companies/${id}`, data),

  // Delete company
  deleteCompany: (id: number) => client.delete(`/companies/${id}`),

  // Get recruitment drives for company
  getCompanyDrives: (
    companyId: number,
    limit: number = 10,
    offset: number = 0
  ) =>
    client.get<{ drives: RecruitmentDrive[]; total: number }>(
      `/companies/${companyId}/recruitment-drives`,
      { params: { limit, offset } }
    ),
};
```

---

## 2️⃣ Auth Context & Hooks

### `frontend/src/contexts/AuthContext.tsx`
```typescript
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { authAPI, User, LoginResponse } from '../api/auth';

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, phone: string, password: string) => Promise<void>;
  sendOTP: (email: string, phone: string) => Promise<void>;
  verifyOTP: (
    email: string,
    phone: string,
    emailOTP: string,
    phoneOTP: string
  ) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem('authToken')
  );

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // On mount and when token changes, fetch user profile
  useEffect(() => {
    if (token) {
      authAPI
        .getMe()
        .then((res) => {
          setUser(res.data.user);
          localStorage.setItem('user', JSON.stringify(res.data.user));
        })
        .catch((err) => {
          console.error('Failed to fetch user:', err);
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
          setToken(null);
          setUser(null);
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
      const { token: newToken, user: newUser } = res.data;

      localStorage.setItem('authToken', newToken);
      localStorage.setItem('user', JSON.stringify(newUser));

      setToken(newToken);
      setUser(newUser);
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Login failed';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const signup = async (
    email: string,
    phone: string,
    password: string
  ) => {
    try {
      setError(null);
      const res = await authAPI.signup(email, phone, password);
      const { token: newToken, user: newUser } = res.data;

      localStorage.setItem('authToken', newToken);
      localStorage.setItem('user', JSON.stringify(newUser));

      setToken(newToken);
      setUser(newUser);
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Signup failed';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const sendOTP = async (email: string, phone: string) => {
    try {
      setError(null);
      await authAPI.sendOTP(email, phone);
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to send OTP';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const verifyOTP = async (
    email: string,
    phone: string,
    emailOTP: string,
    phoneOTP: string
  ) => {
    try {
      setError(null);
      await authAPI.verifyOTP(email, phone, emailOTP, phoneOTP);
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'OTP verification failed';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setError(null);
  };

  const clearError = () => setError(null);

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    error,
    login,
    signup,
    sendOTP,
    verifyOTP,
    logout,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
};
```

### `frontend/src/hooks/useAuth.ts`
```typescript
import { useContext } from 'react';
import { AuthContext, AuthContextType } from '../contexts/AuthContext';

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

### `frontend/src/hooks/useApi.ts`
```typescript
import { useState, useEffect } from 'react';

interface UseApiReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useApi<T>(
  apiCall: () => Promise<any>,
  dependencies: any[] = []
): UseApiReturn<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refetchCount, setRefetchCount] = useState(0);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiCall();
        if (isMounted) {
          setData(response.data);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(
            err.message ||
            err.response?.data?.message ||
            'An error occurred'
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [...dependencies, refetchCount]);

  return {
    data,
    loading,
    error,
    refetch: () => setRefetchCount((c) => c + 1),
  };
}
```

---

## 3️⃣ Protected Route Component

### `frontend/src/components/ProtectedRoute.tsx`
```typescript
import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRoles?: string[];
}

export const ProtectedRoute = ({
  children,
  requiredRoles,
}: ProtectedRouteProps) => {
  const { user, isLoading, token } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRoles && !requiredRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};
```

---

## 4️⃣ Environment Files

### `frontend/.env`
```bash
# Backend API
VITE_API_URL=http://localhost:3000

# App Config
VITE_APP_NAME=Artiset Campus
VITE_LOG_LEVEL=debug
```

### `frontend/.env.production`
```bash
# Backend API (production)
VITE_API_URL=https://api.artiset.com

# App Config
VITE_APP_NAME=Artiset Campus
VITE_LOG_LEVEL=error
```

---

## 5️⃣ Updated App.tsx

### `frontend/src/App.tsx`
```typescript
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';

// Auth Pages
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import NotFound from './pages/NotFound';

// Shared Pages
import Profile from './pages/Profile';
import ProfileEdit from './pages/ProfileEdit';
import ChangePassword from './pages/ChangePassword';

// Dashboards
import StudentDashboard from './pages/StudentDashboard';
import TPODashboard from './pages/TPODashboard';
import RecruiterDashboard from './pages/RecruiterDashboard';
import AdminDashboard from './pages/AdminDashboard';

// Company Pages
import Companies from './pages/Companies';
import CompanyDetail from './pages/CompanyDetail';
import CompanyForm from './pages/CompanyForm';
import CompanyDrives from './pages/CompanyDrives';

// Layouts
import StudentLayout from './components/layouts/StudentLayout';
import AdminLayout from './components/layouts/AdminLayout';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/not-found" element={<NotFound />} />

          {/* Student Routes */}
          <Route
            path="/student/*"
            element={
              <ProtectedRoute requiredRoles={['student']}>
                <StudentLayout />
              </ProtectedRoute>
            }
          />

          {/* TPO Routes */}
          <Route
            path="/tpo/dashboard"
            element={
              <ProtectedRoute requiredRoles={['tpo']}>
                <TPODashboard />
              </ProtectedRoute>
            }
          />

          {/* Recruiter Routes */}
          <Route
            path="/recruiter/dashboard"
            element={
              <ProtectedRoute requiredRoles={['recruiter']}>
                <RecruiterDashboard />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute requiredRoles={['admin']}>
                <AdminLayout />
              </ProtectedRoute>
            }
          />

          {/* Shared Routes */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile/edit"
            element={
              <ProtectedRoute>
                <ProfileEdit />
              </ProtectedRoute>
            }
          />
          <Route
            path="/change-password"
            element={
              <ProtectedRoute>
                <ChangePassword />
              </ProtectedRoute>
            }
          />

          {/* Company Routes */}
          <Route
            path="/companies"
            element={
              <ProtectedRoute>
                <Companies />
              </ProtectedRoute>
            }
          />
          <Route
            path="/companies/:id"
            element={
              <ProtectedRoute>
                <CompanyDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/companies/new"
            element={
              <ProtectedRoute requiredRoles={['recruiter', 'admin']}>
                <CompanyForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/companies/:id/edit"
            element={
              <ProtectedRoute requiredRoles={['recruiter', 'admin']}>
                <CompanyForm />
              </ProtectedRoute>
            }
          />

          {/* Default & 404 */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
```

---

## 6️⃣ Login Page Example

### `frontend/src/pages/Login.tsx`
```typescript
import { FormEvent, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Alert } from '../components/ui/alert';
import { Card } from '../components/ui/card';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setError('');
      await login(email, password);
      // Redirect based on role
      navigate('/dashboard');
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
        err.message ||
        'Login failed. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const showExpiredMessage = searchParams.get('expired') === 'true';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md p-6 space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Artiset Campus</h1>
          <p className="mt-2 text-sm text-gray-600">Sign in to your account</p>
        </div>

        {showExpiredMessage && (
          <Alert variant="warning">
            Your session has expired. Please login again.
          </Alert>
        )}

        {error && (
          <Alert variant="destructive">{error}</Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <Input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full"
            size="lg"
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <div className="text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500">
            Sign up
          </Link>
        </div>

        <div className="text-center">
          <Link
            to="/forgot-password"
            className="text-sm text-blue-600 hover:text-blue-500"
          >
            Forgot your password?
          </Link>
        </div>
      </Card>
    </div>
  );
}
```

---

## 📦 Installation Steps

```bash
# 1. Install dependencies in frontend
cd frontend
npm install axios

# 2. Create folder structure
mkdir -p src/api src/contexts src/hooks

# 3. Copy all files from snippets above to their respective locations

# 4. Update .env file with backend URL

# 5. Start development server
npm run dev

# 6. Test login at http://localhost:5173/login
```

---

## ✅ Verification Checklist

- [ ] API client created with axios
- [ ] Auth context implemented
- [ ] useAuth hook accessible
- [ ] Protected routes working
- [ ] Login page connects to backend
- [ ] Token stored in localStorage
- [ ] All API functions exported
- [ ] TypeScript types defined
- [ ] Error handling implemented
- [ ] Frontend runs on port 5173

---

**Ready to copy-paste! Start with the API client, then AuthContext, then update App.tsx.**
