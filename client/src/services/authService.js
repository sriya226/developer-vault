import api from './api';

export const register = (payload) => api.post('/auth/register', payload).then((r) => r.data.data);
export const login = (payload) => api.post('/auth/login', payload).then((r) => r.data.data);
export const getMe = () => api.get('/auth/me').then((r) => r.data.data.user);
export const updateProfile = (payload) => api.put('/users/profile', payload).then((r) => r.data.data.user);
