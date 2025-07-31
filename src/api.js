const API_URL = "https://aibuddies-backend.onrender.com"; // Your live backend URL

const api = {
  async request(endpoint, options = {}) {
    const { body, ...customConfig } = options;
    const headers = { 'Content-Type': 'application/json' };
    const token = localStorage.getItem('accessToken');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
      method: options.method || (body ? 'POST' : 'GET'),
      ...customConfig,
      headers: { ...headers, ...customConfig.headers },
    };
    if (body) config.body = JSON.stringify(body);

    try {
      const response = await fetch(`${API_URL}${endpoint}`, config);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }
      if (response.status === 204) return null;
      return await response.json();
    } catch (error) {
      console.error('API request error:', error);
      throw error;
    }
  },
  login: (credentials) => api.request('/users/login', { body: credentials }),
  signup: (userData) => api.request('/users/signup', { body: userData }),
  getMe: () => api.request('/users/me'),
  repurposeText: (data) => api.request('/tools/repurpose-text', { body: data }),
  generatePrompt: (data) => api.request('/tools/generate-prompt', { body: data }),
  generateCaption: (data) => api.request('/tools/generate-caption', { body: data }),
};

export default api;