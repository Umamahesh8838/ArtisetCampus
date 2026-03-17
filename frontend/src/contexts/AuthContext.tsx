import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { authAPI, User, LoginResponse } from '../api/auth';

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  login: (identifier: string, password: string) => Promise<any>;
  signup: (firstName: string, lastName: string, email: string, phone: string, password: string) => Promise<void>;
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
          // Don't clear on error - user data might already be in localStorage from login
          // localStorage.removeItem('authToken');
          // localStorage.removeItem('user');
          // setToken(null);
          // setUser(null);
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [token]);

  // Listen for localStorage changes (from login in another component)
  useEffect(() => {
    const handleStorageChange = () => {
      const newToken = localStorage.getItem('authToken');
      const newUser = localStorage.getItem('user');
      
      if (newToken && newToken !== token) {
        setToken(newToken);
      }
      
      if (newUser) {
        try {
          const userData = JSON.parse(newUser);
          if (userData && JSON.stringify(userData) !== JSON.stringify(user)) {
            setUser(userData);
          }
        } catch (e) {
          console.error('Failed to parse user from localStorage:', e);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('authTokenChanged', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('authTokenChanged', handleStorageChange);
    };
  }, [token, user]);

  const login = async (identifier: string, password: string) => {
    try {
      setError(null);
      const res = await authAPI.login(identifier, password);
      const { token: newToken, user: newUser } = res.data;

      localStorage.setItem('authToken', newToken);
      localStorage.setItem('user', JSON.stringify(newUser));
      localStorage.setItem('artiset_logged_in', 'true');

      setToken(newToken);
      setUser(newUser);
      return res;
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Login failed';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const signup = async (
    firstName: string,
    lastName: string,
    email: string,
    phone: string,
    password: string
  ) => {
    try {
      setError(null);
      const res = await authAPI.signup(firstName, lastName, email, phone, password);
      const { token: newToken, user: newUser } = res.data;

      localStorage.setItem('authToken', newToken);
      localStorage.setItem('user', JSON.stringify(newUser));
      localStorage.setItem('artiset_logged_in', 'true');

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
    localStorage.removeItem('artiset_logged_in');
    localStorage.removeItem('artiset_registration_complete');
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
