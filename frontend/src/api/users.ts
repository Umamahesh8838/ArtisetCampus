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
