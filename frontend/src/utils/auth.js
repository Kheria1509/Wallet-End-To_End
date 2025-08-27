import axios from 'axios';
import { API_CONFIG } from '../config/api';

// Set up axios base URL and interceptor for handling token expiration
axios.defaults.baseURL = API_CONFIG.BASE_URL;
axios.defaults.timeout = API_CONFIG.TIMEOUT;

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      window.location.href = '/signin';
    }
    return Promise.reject(error);
  }
);

// Function to set auth header for all requests
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);