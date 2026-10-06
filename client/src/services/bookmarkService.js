import api from './api';

const clean = (params) => Object.fromEntries(Object.entries(params).filter(([, v]) => v !== '' && v != null && v !== false));

export const listBookmarks = (params) => api.get('/bookmarks', { params: clean(params) }).then((r) => r.data.data);
export const getStats = () => api.get('/bookmarks/stats').then((r) => r.data.data);
export const getBookmark = (id) => api.get(`/bookmarks/${id}`).then((r) => r.data.data.bookmark);
export const createBookmark = (payload) => api.post('/bookmarks', payload).then((r) => r.data.data.bookmark);
export const updateBookmark = (id, payload) => api.put(`/bookmarks/${id}`, payload).then((r) => r.data.data.bookmark);
export const deleteBookmark = (id) => api.delete(`/bookmarks/${id}`).then((r) => r.data.data);
export const setFavorite = (id, favorite) => api.patch(`/bookmarks/${id}/favorite`, { favorite }).then((r) => r.data.data.bookmark);
export const fetchMetadata = (url) => api.post('/bookmarks/metadata', { url }).then((r) => r.data.data);
// Returns { categories: [{ name, count, custom }], customCategories: string[] }
export const getCategories = () => api.get('/categories').then((r) => r.data.data);
export const addCategory = (name) => api.post('/categories', { name }).then((r) => r.data.data);
export const removeCategory = (name) => api.delete(`/categories/${encodeURIComponent(name)}`).then((r) => r.data.data);
export const exportBookmarks = () => api.get('/bookmarks/export', { responseType: 'blob' }).then((r) => r.data);
