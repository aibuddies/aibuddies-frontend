// Prefer env; fall back to your Render URL
const API_URL = process.env.REACT_APP_API_URL || "https://aibuddies-backend.onrender.com/api";

const api = {
  async request(endpoint, options = {}) {
    const { body, ...custom } = options;
    const headers = { 'Content-Type': 'application/json' };
    const token = localStorage.getItem('accessToken');
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const config = {
      method: options.method || (body ? 'POST' : 'GET'),
      ...custom,
      headers: { ...headers, ...custom.headers },
    };

    if (body) {
      // IMPORTANT: backend expects JSON for ALL endpoints, including /users/login
      config.body = JSON.stringify(body);
    }

    const res = await fetch(`${API_URL}${endpoint}`, config);
    if (!res.ok) {
      let detail = `HTTP ${res.status}`;
      try { detail = (await res.json()).detail || detail; } catch (_) {}
      throw new Error(detail);
    }
    if (res.status === 204) return null;
    return res.json();
  },

  login: (credentials) => api.request('/users/login', { body: credentials }),
  signup: (userData) => api.request('/users/signup', { body: userData }),
  getMe: () => api.request('/users/me'),
  verifyEmail: (token) => api.request(`/users/verify-email/${token}`),

  repurposeText: (data) => api.request('/tools/repurpose-text', { body: data }),
  generatePrompt: (data) => api.request('/tools/generate-prompt', { body: data }),
  generateCaption: (data) => api.request('/tools/generate-caption', { body: data }),
};

export default api;
