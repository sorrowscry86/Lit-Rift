import axios from 'axios';

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
  (config) => {
    // Add auth token if available (placeholder for future implementation)
    // const token = localStorage.getItem('authToken');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
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
    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout');
      error.message = 'Request timed out. Please try again.';
    } else if (error.response) {
      // Server responded with error status
      switch (error.response.status) {
        case 401:
          error.message = 'Authentication required. Please log in.';
          break;
        case 403:
          error.message = 'You do not have permission to access this resource.';
          break;
        case 429:
          error.message = 'Too many requests. Please wait and try again.';
          break;
        case 500:
          error.message = 'Server error. Please try again later.';
          break;
        default:
          error.message = error.response.data?.error || 'An error occurred';
      }
    } else if (error.request) {
      // Request made but no response
      error.message = 'No response from server. Please check your connection.';
    }
    return Promise.reject(error);
  }
);

export default api;
