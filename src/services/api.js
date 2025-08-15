import axios from 'axios';

const API_BASE_URL = 'https://aibuddies-backend.onrender.com';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// Request interceptor to add auth token
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Handle token expiration
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default {
  // Auth endpoints
  signup: (data) => api.post('/api/users/signup', data),
  login: (data) => api.post('/api/users/login', data),
  verifyEmail: (token) => api.get(`/api/users/verify-email/${token}`),
  getProfile: () => api.get('/api/users/me'),
  claimReward: () => api.post('/api/users/claim-ad-reward'),

  // Tool endpoints
  repurposeText: (data) => api.post('/api/tools/repurpose-text', data),
  generatePrompt: (data) => api.post('/api/tools/generate-prompt', data),
  generateCaption: (data) => api.post('/api/tools/generate-caption', data),
  generateImage: (data) => api.post('/api/tools/generate-image', data),

  // Payment endpoints
  getCreditPlans: () => api.get('/api/payments/plans'),
  createOrder: (planId) => api.post('/api/payments/create-order', { plan_id: planId }),
  verifyPayment: (data) => api.post('/api/payments/verify-signature', data),
};
