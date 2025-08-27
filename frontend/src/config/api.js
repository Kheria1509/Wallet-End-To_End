// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const API_TIMEOUT = parseInt(import.meta.env.VITE_API_TIMEOUT) || 30000;

// Ensure the base URL doesn't have a trailing slash
const baseURL = API_BASE_URL.replace(/\/$/, '');

export const API_CONFIG = {
  BASE_URL: baseURL,
  TIMEOUT: API_TIMEOUT,
  ENDPOINTS: {
    // User endpoints
    USER_SIGNUP: '/api/v1/user/signup',
    USER_SIGNIN: '/api/v1/user/signin',
    USER_PROFILE: '/api/v1/user/profile',
    USER_BULK: '/api/v1/user/bulk',
    USER_UPDATE: '/api/v1/user',
    USER_REQUEST_RESET: '/api/v1/user/request-reset',
    USER_RESET_PASSWORD: '/api/v1/user/reset-password',
    
    // Account endpoints
    ACCOUNT_BALANCE: '/api/v1/account/balance',
    ACCOUNT_TRANSFER: '/api/v1/account/transfer',
    ACCOUNT_TRANSACTIONS: '/api/v1/account/transactions',
    ACCOUNT_TRANSACTIONS_EXPORT: '/api/v1/account/transactions/export',
    
    // Notification endpoints
    NOTIFICATIONS: '/api/v1/notification',
    NOTIFICATIONS_READ: '/api/v1/notification/{id}/read',
    NOTIFICATIONS_READ_ALL: '/api/v1/notification/read-all',
    
    // Recurring transfer endpoints
    RECURRING_TRANSFERS: '/api/v1/recurring',
    RECURRING_TRANSFER_STATUS: '/api/v1/recurring/{id}/status'
  }
};

// Helper function to get full URL
export const getApiUrl = (endpoint) => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Helper function to replace placeholders in endpoints
export const getEndpointUrl = (endpointKey, params = {}) => {
  let endpoint = API_CONFIG.ENDPOINTS[endpointKey];
  
  // Replace placeholders like {id} with actual values
  Object.keys(params).forEach(key => {
    endpoint = endpoint.replace(`{${key}}`, params[key]);
  });
  
  return getApiUrl(endpoint);
};

export default API_CONFIG;
