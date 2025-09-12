// Update: hospitalink-fe/src/types/api.ts
import axios from 'axios';

// Debug environment variables
console.log('🔍 Environment Variables Debug:');
console.log('- import.meta.env.VITE_API_URL:', import.meta.env.VITE_API_URL);
console.log('- import.meta.env.MODE:', import.meta.env.MODE);
console.log('- import.meta.env.DEV:', import.meta.env.DEV);

// Force the base URL for now
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
console.log('🌐 Final Base URL:', baseURL);

const api = axios.create({
  baseURL: baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    console.log('📤 API Request Debug:', {
      baseURL: config.baseURL,
      url: config.url,
      fullURL: `${config.baseURL}${config.url}`,
      method: config.method?.toUpperCase(),
      data: config.data
    });
    return config;
  },
  (error) => {
    console.error('📤 Request Error:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    console.log('📥 API Response:', {
      status: response.status,
      url: response.config.url,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('📥 Response Error:', {
      status: error.response?.status,
      message: error.message,
      config: error.config,
      fullURL: error.config ? `${error.config.baseURL}${error.config.url}` : 'Unknown'
    });
    
    if (error.response?.status === 401) {
      localStorage.removeItem('userRole');
      localStorage.removeItem('user');
      window.location.href = '/auth';
    }
    
    return Promise.reject(error);
  }
);

export default api;