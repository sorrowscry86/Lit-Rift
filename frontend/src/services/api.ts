import axios from 'axios';
import { auth } from '../config/firebase';
import { logApiError } from '../utils/errorLogger';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000, // 30 seconds default timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for authentication
api.interceptors.request.use(
  async (config) => {
    // Get current user and Firebase ID token
    const user = auth.currentUser;
    if (user) {
      try {
        const token = await user.getIdToken();
        config.headers.Authorization = `Bearer ${token}`;
      } catch (error) {
        console.error('Error getting auth token:', error);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const endpoint = error.config?.url || 'unknown';

    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout');
      error.message = 'Request timed out. Please try again.';
      logApiError(endpoint, error);
    } else if (error.response) {
      // Server responded with error status
      switch (error.response.status) {
        case 401:
          error.message = 'Authentication required. Please log in.';
          // Redirect to login page on authentication failure
          if (window.location.pathname !== '/login' && window.location.pathname !== '/signup') {
            window.location.href = '/login';
          }
          break;
        case 403:
          error.message = 'You do not have permission to access this resource.';
          logApiError(endpoint, error);
          break;
        case 429:
          error.message = 'Too many requests. Please wait and try again.';
          logApiError(endpoint, error);
          break;
        case 500:
          error.message = 'Server error. Please try again later.';
          logApiError(endpoint, error);
          break;
        default:
          error.message = error.response.data?.error || 'An error occurred';
          logApiError(endpoint, error);
      }
    } else if (error.request) {
      // Request made but no response
      error.message = 'No response from server. Please check your connection.';
      logApiError(endpoint, error);
    }
    return Promise.reject(error);
  }
);

export default api;
