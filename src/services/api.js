import axios from 'axios';

// ── Axios instance ─────────────────────────────────────────────────────────
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api',
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
});

// Attach Sanctum token on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ps-token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Auth ───────────────────────────────────────────────────────────────────
export const authRegister = (data) => api.post('/auth/register', data);
export const authLogin    = (data) => api.post('/auth/login', data);
export const authLogout         = ()     => api.post('/auth/logout');
export const authChangePassword = (data) => api.post('/auth/change-password', data);

// ── Current User ───────────────────────────────────────────────────────────
export const getMe          = ()     => api.get('/users/me');
export const updateMe       = (data) => api.put('/users/me', data);
export const updateSettings = (data) => api.put('/users/me/settings', data);
export const deleteMe       = ()     => api.delete('/users/me');

// ── Posts ──────────────────────────────────────────────────────────────────
export const getPosts   = (params) => api.get('/posts', { params });
export const getPost    = (id)     => api.get(`/posts/${id}`);
export const createPost = (data)   => api.post('/posts', data);
export const updatePost = (id, data) => api.put(`/posts/${id}`, data);
export const deletePost = (id)     => api.delete(`/posts/${id}`);

// ── Reactions ──────────────────────────────────────────────────────────────
export const likePost = (id)           => api.post(`/posts/${id}/like`);
export const votePost = (id, type)     => api.post(`/posts/${id}/vote`, { type });

// ── Comments ───────────────────────────────────────────────────────────────
export const getComments    = (postId)          => api.get(`/posts/${postId}/comments`);
export const addComment     = (postId, body)    => api.post(`/posts/${postId}/comments`, { body });
export const deleteComment  = (postId, commentId) => api.delete(`/posts/${postId}/comments/${commentId}`);

// ── Upload ─────────────────────────────────────────────────────────────────
export const uploadImage = (file) => {
  const fd = new FormData();
  fd.append('image', file);
  return api.post('/upload/image', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
};

// ── Dashboard / Alerts ─────────────────────────────────────────────────────
export const getDashboard = (params) => api.get('/dashboard', { params });
export const getAlerts    = (params) => api.get('/alerts', { params });

// ── Public User ────────────────────────────────────────────────────────────
export const getUser      = (id) => api.get(`/users/${id}`);
export const getUserPosts = (id) => api.get(`/users/${id}/posts`);

export default api;

