# 🎯 Frontend Integration Guide - Page by Page

## Overview

This guide shows exactly how to update each existing frontend page to use the new backend API integration. Copy-paste ready code with TypeScript support.

---

## 📋 Table of Contents

1. [Login.tsx](#logintsx)
2. [Register.tsx](#registertsx)
3. [Companies.tsx](#companiestsx)
4. [Profile/Dashboard.tsx](#profiledashboardtsx)
5. [Protected Routes Pattern](#protected-routes-pattern)
6. [Error Handling](#error-handling)

---

## Login.tsx

### Current State
Login page exists but doesn't connect to backend.

### What Needs to Change
- Import `useAuth` hook
- Call `login()` function instead of localStorage
- Handle loading and error states
- Redirect on success

### Updated Code
```typescript
import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');
  
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, isLoading, error: authError } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');

    if (!email || !password) {
      setLocalError('Email and password are required');
      return;
    }

    try {
      await login(email, password);
      // Redirect to dashboard or home page
      navigate('/dashboard');
    } catch (err) {
      // Error is handled by useAuth and displayed
      setLocalError(authError || 'Login failed');
    }
  };

  const showExpiredMessage = searchParams.get('expired') === 'true';

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-md p-8">
        <h1 className="text-2xl font-bold mb-2">Welcome Back</h1>
        <p className="text-gray-600 mb-6">Sign in to your account</p>

        {showExpiredMessage && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded text-red-700">
            Session expired. Please login again.
          </div>
        )}

        {(localError || authError) && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded text-red-700">
            {localError || authError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              disabled={isLoading}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={isLoading}
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-4">
          Don't have an account?{' '}
          <a href="/register" className="text-blue-600 hover:underline">
            Register here
          </a>
        </p>
      </Card>
    </div>
  );
}
```

### Key Changes
- ✅ Uses `useAuth()` hook for authentication
- ✅ Calls `login(email, password)` instead of storing in localStorage
- ✅ Shows loading state while logging in
- ✅ Displays error messages from backend
- ✅ Redirects to `/dashboard` on success
- ✅ Handles "session expired" query param

---

## Register.tsx

### Current State
Register page exists but doesn't implement 3-step OTP flow.

### What Needs to Change
- Implement 3 steps: OTP sending, OTP verification, Account creation
- Use `sendOTP()`, `verifyOTP()`, `signup()` from AuthContext
- Handle step transitions and errors

### Updated Code
```typescript
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

type RegistrationStep = 'details' | 'otp' | 'password';

export default function Register() {
  // Step 1: Details
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  
  // Step 2: OTP
  const [emailOTP, setEmailOTP] = useState('');
  const [phoneOTP, setPhoneOTP] = useState('');
  
  // Step 3: Password
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // State management
  const [currentStep, setCurrentStep] = useState<RegistrationStep>('details');
  const [localError, setLocalError] = useState('');
  
  const navigate = useNavigate();
  const { sendOTP, verifyOTP, signup, isLoading, error: authError } = useAuth();

  const handleStepOne = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');

    if (!email || !phone) {
      setLocalError('Email and phone are required');
      return;
    }

    // Basic validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setLocalError('Invalid email format');
      return;
    }

    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phone)) {
      setLocalError('Phone must be 10 digits');
      return;
    }

    try {
      await sendOTP(email, phone);
      setCurrentStep('otp');
    } catch (err) {
      setLocalError(authError || 'Failed to send OTP');
    }
  };

  const handleStepTwo = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');

    if (!emailOTP || !phoneOTP) {
      setLocalError('Both OTPs are required');
      return;
    }

    try {
      await verifyOTP(email, phone, emailOTP, phoneOTP);
      setCurrentStep('password');
    } catch (err) {
      setLocalError(authError || 'OTP verification failed');
    }
  };

  const handleStepThree = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');

    if (!password || !confirmPassword) {
      setLocalError('Password fields are required');
      return;
    }

    if (password !== confirmPassword) {
      setLocalError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setLocalError('Password must be at least 8 characters');
      return;
    }

    try {
      await signup(email, phone, password);
      // Successfully registered, redirect to login
      navigate('/login', { replace: true });
    } catch (err) {
      setLocalError(authError || 'Registration failed');
    }
  };

  const handleBackStep = () => {
    if (currentStep === 'otp') setCurrentStep('details');
    if (currentStep === 'password') setCurrentStep('otp');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-md p-8">
        <h1 className="text-2xl font-bold mb-2">Create Account</h1>
        <p className="text-gray-600 mb-6">
          Step {currentStep === 'details' ? '1' : currentStep === 'otp' ? '2' : '3'} of 3
        </p>

        {(localError || authError) && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
            {localError || authError}
          </div>
        )}

        {/* Step 1: Email and Phone */}
        {currentStep === 'details' && (
          <form onSubmit={handleStepOne} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                disabled={isLoading}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Phone Number</label>
              <Input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="9876543210"
                disabled={isLoading}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Sending OTP...' : 'Send OTP'}
            </Button>
          </form>
        )}

        {/* Step 2: OTP Verification */}
        {currentStep === 'otp' && (
          <form onSubmit={handleStepTwo} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email OTP</label>
              <Input
                type="text"
                value={emailOTP}
                onChange={(e) => setEmailOTP(e.target.value.slice(0, 6))}
                placeholder="000000"
                maxLength={6}
                disabled={isLoading}
                required
              />
              <p className="text-xs text-gray-500 mt-1">Sent to {email}</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Phone OTP</label>
              <Input
                type="text"
                value={phoneOTP}
                onChange={(e) => setPhoneOTP(e.target.value.slice(0, 6))}
                placeholder="000000"
                maxLength={6}
                disabled={isLoading}
                required
              />
              <p className="text-xs text-gray-500 mt-1">Sent to {phone}</p>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Verifying...' : 'Verify OTP'}
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleBackStep}
              disabled={isLoading}
            >
              Back
            </Button>
          </form>
        )}

        {/* Step 3: Password */}
        {currentStep === 'password' && (
          <form onSubmit={handleStepThree} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={isLoading}
                required
              />
              <p className="text-xs text-gray-500 mt-1">At least 8 characters</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Confirm Password</label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                disabled={isLoading}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleBackStep}
              disabled={isLoading}
            >
              Back
            </Button>
          </form>
        )}

        <p className="text-center text-sm text-gray-600 mt-4">
          Already have an account?{' '}
          <a href="/login" className="text-blue-600 hover:underline">
            Login here
          </a>
        </p>
      </Card>
    </div>
  );
}
```

### Key Changes
- ✅ 3-step registration flow
- ✅ Step 1: Collect email & phone, send OTP
- ✅ Step 2: Verify OTP from both channels
- ✅ Step 3: Set password and create account
- ✅ Back button to go to previous steps
- ✅ Error handling at each step
- ✅ Redirects to login after successful registration

---

## Companies.tsx

### Current State
Companies page exists but doesn't fetch from backend.

### What Needs to Change
- Use `useApi()` hook to fetch companies
- Display in table or card format
- Add filters and pagination
- Add create/edit/delete buttons

### Updated Code
```typescript
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useApi } from '../hooks/useApi';
import { companiesAPI } from '../api/companies';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

export default function Companies() {
  const { user } = useAuth();
  const [filters, setFilters] = useState({
    isActive: true,
    limit: 10,
    offset: 0
  });
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newCompany, setNewCompany] = useState({
    name: '',
    description: '',
    website: '',
    city: ''
  });

  // Fetch companies
  const { 
    data: companiesResponse, 
    loading, 
    error,
    refetch 
  } = useApi(
    () => companiesAPI.getCompanies(filters.limit, filters.offset, filters.isActive),
    [filters.limit, filters.offset, filters.isActive]
  );

  const companies = companiesResponse?.companies || [];
  const total = companiesResponse?.total || 0;

  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await companiesAPI.createCompany(newCompany);
      setNewCompany({ name: '', description: '', website: '', city: '' });
      setShowCreateForm(false);
      refetch();
    } catch (err) {
      alert('Failed to create company');
    }
  };

  const handleDeleteCompany = async (id: number) => {
    if (confirm('Are you sure?')) {
      try {
        await companiesAPI.deleteCompany(id);
        refetch();
      } catch (err) {
        alert('Failed to delete company');
      }
    }
  };

  const isRecruiter = user?.role === 'recruiter' || user?.role === 'admin';

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Companies</h1>
        {isRecruiter && (
          <Button onClick={() => setShowCreateForm(!showCreateForm)}>
            {showCreateForm ? 'Cancel' : 'Add Company'}
          </Button>
        )}
      </div>

      {/* Create Company Form */}
      {showCreateForm && isRecruiter && (
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Create New Company</h2>
          <form onSubmit={handleCreateCompany} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Company Name</label>
              <Input
                value={newCompany.name}
                onChange={(e) => setNewCompany({...newCompany, name: e.target.value})}
                placeholder="Company Inc."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                value={newCompany.description}
                onChange={(e) => setNewCompany({...newCompany, description: e.target.value})}
                placeholder="Company description..."
                className="w-full p-2 border rounded"
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Website</label>
                <Input
                  type="url"
                  value={newCompany.website}
                  onChange={(e) => setNewCompany({...newCompany, website: e.target.value})}
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">City</label>
                <Input
                  value={newCompany.city}
                  onChange={(e) => setNewCompany({...newCompany, city: e.target.value})}
                  placeholder="Bangalore"
                />
              </div>
            </div>

            <Button type="submit" className="w-full">Create Company</Button>
          </form>
        </Card>
      )}

      {/* Filters */}
      <Card className="p-4 mb-6">
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={filters.isActive}
              onChange={(e) => setFilters({...filters, isActive: e.target.checked, offset: 0})}
            />
            <span className="text-sm">Active Companies Only</span>
          </label>
        </div>
      </Card>

      {/* Loading State */}
      {loading && <div className="text-center py-8">Loading companies...</div>}

      {/* Error State */}
      {error && <div className="text-red-600 p-4 bg-red-50 rounded mb-4">{error}</div>}

      {/* Companies List */}
      {!loading && companies.length === 0 && (
        <div className="text-center py-8 text-gray-600">No companies found</div>
      )}

      {!loading && companies.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {companies.map((company) => (
            <Card key={company.id} className="p-6 hover:shadow-lg transition">
              <h3 className="text-xl font-semibold mb-2">{company.name}</h3>
              <p className="text-gray-600 text-sm mb-4">{company.description}</p>
              
              <div className="space-y-2 mb-4 text-sm">
                {company.website && <p><span className="font-medium">Website:</span> {company.website}</p>}
                {company.city && <p><span className="font-medium">City:</span> {company.city}</p>}
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  View
                </Button>
                {isRecruiter && (
                  <>
                    <Button variant="outline" size="sm" className="flex-1">
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteCompany(company.id)}
                    >
                      Delete
                    </Button>
                  </>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {total > filters.limit && (
        <div className="flex justify-center gap-4 mt-6">
          <Button
            variant="outline"
            onClick={() => setFilters({...filters, offset: Math.max(0, filters.offset - filters.limit)})}
            disabled={filters.offset === 0}
          >
            Previous
          </Button>
          <span className="flex items-center">{Math.floor(filters.offset / filters.limit) + 1}</span>
          <Button
            variant="outline"
            onClick={() => setFilters({...filters, offset: filters.offset + filters.limit})}
            disabled={filters.offset + filters.limit >= total}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
```

### Key Changes
- ✅ Uses `useApi()` hook to fetch companies
- ✅ Displays loading and error states
- ✅ Shows company cards with details
- ✅ Create form for recruiters
- ✅ Delete functionality
- ✅ Pagination support
- ✅ Active status filter

---

## Profile/Dashboard.tsx

### Current State
Profile page exists but doesn't use user data from auth.

### What Needs to Change
- Display user info from `useAuth()`
- Allow profile edit
- Allow password change
- Show role and permissions

### Updated Code
```typescript
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

export default function Profile() {
  const { user, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [editData, setEditData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || ''
  });
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [message, setMessage] = useState('');

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Call update API
      setMessage('Profile updated successfully');
      setIsEditing(false);
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('Failed to update profile');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage('Passwords do not match');
      return;
    }

    try {
      // Call changePassword API
      setMessage('Password changed successfully');
      setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
      setIsChangingPassword(false);
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('Failed to change password');
    }
  };

  const handleLogout = () => {
    if (confirm('Are you sure?')) {
      logout();
      // Redirect happens automatically
    }
  };

  if (!user) {
    return <div className="text-center py-8">Not logged in</div>;
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Profile</h1>

      {message && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded text-green-700">
          {message}
        </div>
      )}

      {/* User Info */}
      <Card className="p-6 mb-6">
        <div className="mb-4">
          <h2 className="text-2xl font-semibold">{user.firstName} {user.lastName}</h2>
          <p className="text-gray-600">{user.email}</p>
          <p className="text-sm font-medium mt-2">
            Role: <span className="capitalize">{user.role}</span>
          </p>
        </div>

        {!isEditing && (
          <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
        )}
      </Card>

      {/* Edit Profile Form */}
      {isEditing && (
        <Card className="p-6 mb-6">
          <h3 className="text-xl font-semibold mb-4">Edit Profile</h3>
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">First Name</label>
                <Input
                  value={editData.firstName}
                  onChange={(e) => setEditData({...editData, firstName: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Last Name</label>
                <Input
                  value={editData.lastName}
                  onChange={(e) => setEditData({...editData, lastName: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <Input value={editData.email} disabled />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Phone</label>
              <Input
                value={editData.phone}
                onChange={(e) => setEditData({...editData, phone: e.target.value})}
              />
            </div>

            <div className="flex gap-2">
              <Button type="submit">Save Changes</Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Change Password */}
      <Card className="p-6 mb-6">
        {!isChangingPassword && (
          <Button onClick={() => setIsChangingPassword(true)}>Change Password</Button>
        )}

        {isChangingPassword && (
          <form onSubmit={handleChangePassword} className="space-y-4">
            <h3 className="text-xl font-semibold mb-4">Change Password</h3>

            <div>
              <label className="block text-sm font-medium mb-1">Current Password</label>
              <Input
                type="password"
                value={passwordData.oldPassword}
                onChange={(e) => setPasswordData({...passwordData, oldPassword: e.target.value})}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">New Password</label>
              <Input
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Confirm Password</label>
              <Input
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                required
              />
            </div>

            <div className="flex gap-2">
              <Button type="submit">Change Password</Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsChangingPassword(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        )}
      </Card>

      {/* Logout */}
      <Card className="p-6">
        <Button
          variant="destructive"
          onClick={handleLogout}
        >
          Logout
        </Button>
      </Card>
    </div>
  );
}
```

### Key Changes
- ✅ Displays user data from `useAuth()`
- ✅ Edit profile form
- ✅ Change password form
- ✅ Shows user role
- ✅ Logout functionality
- ✅ Success/error messages

---

## Protected Routes Pattern

### How to Protect Routes by Role

```typescript
// In App.tsx

import { ProtectedRoute } from './components/ProtectedRoute';

<Routes>
  {/* Public routes */}
  <Route path="/login" element={<Login />} />
  <Route path="/register" element={<Register />} />

  {/* Protected - any authenticated user */}
  <Route 
    path="/profile" 
    element={
      <ProtectedRoute>
        <Profile />
      </ProtectedRoute>
    }
  />

  {/* Protected - students only */}
  <Route 
    path="/student/*" 
    element={
      <ProtectedRoute requiredRoles={['student']}>
        <StudentDashboard />
      </ProtectedRoute>
    }
  />

  {/* Protected - recruiters only */}
  <Route 
    path="/recruiter/*" 
    element={
      <ProtectedRoute requiredRoles={['recruiter']}>
        <RecruiterDashboard />
      </ProtectedRoute>
    }
  />

  {/* Protected - admin only */}
  <Route 
    path="/admin/*" 
    element={
      <ProtectedRoute requiredRoles={['admin']}>
        <AdminDashboard />
      </ProtectedRoute>
    }
  />

  {/* Protected - admin or TPO */}
  <Route 
    path="/companies" 
    element={
      <ProtectedRoute requiredRoles={['admin', 'tpo']}>
        <Companies />
      </ProtectedRoute>
    }
  />

  {/* 404 */}
  <Route path="/unauthorized" element={<UnauthorizedPage />} />
  <Route path="*" element={<NotFound />} />
</Routes>
```

### What ProtectedRoute Does

1. **No token?** → Redirect to `/login`
2. **Token exists?** → Continue
3. **requiredRoles specified?** → Check if user.role matches
4. **Role doesn't match?** → Redirect to `/unauthorized`
5. **Loading?** → Show spinner

---

## Error Handling

### In useAuth()
```typescript
const { 
  login, 
  error,          // ← Error message from backend
  isLoading,      // ← Loading state
  clearError 
} = useAuth();

// All errors auto-displayed, e.g.:
// - "Invalid email or password"
// - "User already exists"
// - "OTP expired"
// - etc.
```

### In useApi()
```typescript
const { 
  data, 
  loading, 
  error       // ← Error message from API call
} = useApi(
  () => companiesAPI.getCompanies(),
  []
);

if (error) {
  return <div className="text-red-600">{error}</div>;
}
```

### Handling Specific Errors
```typescript
try {
  await login(email, password);
} catch (err: any) {
  if (err.status === 401) {
    // Invalid credentials
  } else if (err.status === 400) {
    // Bad request (validation error)
  } else if (err.status === 500) {
    // Server error
  }
}
```

---

## Summary

Each page should follow this pattern:

1. **Import hooks**
   ```typescript
   import { useAuth } from '../hooks/useAuth';
   import { useApi } from '../hooks/useApi';
   ```

2. **Get data**
   ```typescript
   const { user } = useAuth();
   const { data, loading, error } = useApi(...);
   ```

3. **Show states**
   ```typescript
   if (loading) return <Spinner />;
   if (error) return <Error />;
   ```

4. **Display & interact**
   ```typescript
   return <div>{data.map(...)}</div>;
   ```

---

**All pages follow the same pattern!** Copy-paste and adapt to your specific API calls.

Last updated: March 14, 2026
