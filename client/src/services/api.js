import axios from 'axios';

export const TOKEN_KEY = 'vault-token';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 20000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// An expired/invalid token for a logged-in user -> tell AuthContext to log out.
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && localStorage.getItem(TOKEN_KEY)) {
      localStorage.removeItem(TOKEN_KEY);
      window.dispatchEvent(new Event('vault:unauthorized'));
    }
    return Promise.reject(err);
  }
);

// Turns any error into a friendly message (never raw server output).
export const getErrorMessage = (err, fallback = 'Something went wrong. Please try again.') => {
  const message = err?.response?.data?.message;
  if (typeof message === 'string' && message) return message;
  if (err?.code === 'ECONNABORTED') return 'The request timed out. Please try again.';
  if (err?.request && !err.response) return 'Cannot reach the server. Check your connection and try again.';
  return fallback;
};

export const getErrorCode = (err) => err?.response?.data?.code;

export default api;
