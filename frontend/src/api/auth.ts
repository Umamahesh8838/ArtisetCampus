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
  is_registration_complete?: boolean;
}

export interface LoginResponse {
  token: string;
  user?: User;
  is_registration_complete?: boolean;
  message?: string;
}

export const authAPI = {
  // Send OTP to email and phone (calls backend separately for each)
  sendOTP: async (email: string, phone: string) => {
    // Both return promises so we can run them concurrently
    const [emailRes, phoneRes] = await Promise.all([
      client.post('/auth/send-email-otp', { email }),
      client.post('/auth/send-phone-otp', { phone })
    ]);
    return { emailRes, phoneRes };
  },

  // Verify OTP codes
  verifyOTP: async (
    email: string,
    phone: string,
    emailOTP: string,
    phoneOTP: string
  ) => {
    const [emailRes, phoneRes] = await Promise.all([
      client.post('/auth/verify-email-otp', { email, otp: emailOTP }),
      client.post('/auth/verify-phone-otp', { phone, otp: phoneOTP })
    ]);
    return { emailRes, phoneRes };
  },

  // Sign up with verified OTP
  signup: (firstName: string, lastName: string, email: string, phone: string, password: string) =>
    client.post('/auth/signup', { first_name: firstName, last_name: lastName, email, phone, password }),

  // Login with email or phone and password
  login: (identifier: string, password: string) =>
    client.post<LoginResponse>('/auth/login', { identifier, password }),

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
