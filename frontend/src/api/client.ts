import axios, { AxiosError, AxiosResponse } from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://artisetcampus-backend-fngbg6g3eahsf4gg.eastasia-01.azurewebsites.net';

const client = axios.create({
  baseURL: API_URL,
  // timeout removed as per request to allow long registration processes
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
      const isAuthEndpoint = error.config?.url?.includes('/auth/login') || error.config?.url?.includes('/auth/signup');
      
      if (!isAuthEndpoint) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        window.location.href = '/login?expired=true';
        return Promise.reject(new Error('Session expired. Please login again.'));
      }
    }

    // 403 Forbidden
    if (error.response?.status === 403) {
      return Promise.reject(new Error('You do not have permission for this action.'));
    }

    // 500 Server error
    if (error.response?.status === 500) {
      const message = (error.response.data as any)?.error || (error.response.data as any)?.message || 'Server error. Please try again later.';
      return Promise.reject(new Error(message));
    }

    return Promise.reject(error);
  }
);

export default client;
