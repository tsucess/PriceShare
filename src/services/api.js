import axios from 'axios';

// ── Environment variables ──────────────────────────────────────────────────
const API_URL     = process.env.REACT_APP_API_URL     || 'http://localhost:8000/api';
const TOKEN_KEY   = process.env.REACT_APP_TOKEN_KEY   || 'ps-token';
const API_TIMEOUT = Number(process.env.REACT_APP_API_TIMEOUT) || 10000;

// ── Axios instance ─────────────────────────────────────────────────────────
const api = axios.create({
  baseURL: API_URL,
  timeout: API_TIMEOUT,
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
});

// Attach Sanctum Bearer token on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
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

// ── Public Taxonomy ─────────────────────────────────────────────────────────
export const getCategories = () => api.get('/categories');
export const getTags       = () => api.get('/tags');

// ── Admin ──────────────────────────────────────────────────────────────────
export const adminGetStats = () => api.get('/admin/stats');

// Admin – Users
export const adminListUsers       = (params)     => api.get('/admin/users', { params });
export const adminShowUser        = (id)         => api.get(`/admin/users/${id}`);
export const adminEditUser        = (id, data)   => api.put(`/admin/users/${id}`, data);
export const adminBanUser         = (id, reason) => api.post(`/admin/users/${id}/ban`, { reason });
export const adminUnbanUser       = (id)         => api.post(`/admin/users/${id}/unban`);
export const adminPromoteUser     = (id)         => api.post(`/admin/users/${id}/promote`);
export const adminDemoteUser      = (id)         => api.post(`/admin/users/${id}/demote`);
export const adminShadowBanUser   = (id)         => api.post(`/admin/users/${id}/shadow-ban`);
export const adminUnshadowBanUser = (id)         => api.post(`/admin/users/${id}/unshadow-ban`);
export const adminDeleteUser      = (id)         => api.delete(`/admin/users/${id}`);

// Admin – Posts
export const adminListPosts  = (params)    => api.get('/admin/posts', { params });
export const adminEditPost   = (id, data)  => api.put(`/admin/posts/${id}`, data);
export const adminFlagPost   = (id)        => api.post(`/admin/posts/${id}/flag`);
export const adminUnflagPost = (id)        => api.post(`/admin/posts/${id}/unflag`);
export const adminHidePost   = (id, reason) => api.post(`/admin/posts/${id}/hide`, { reason });
export const adminUnhidePost = (id)        => api.post(`/admin/posts/${id}/unhide`);
export const adminDeletePost = (id)        => api.delete(`/admin/posts/${id}`);

// Admin – Comments
export const adminListComments  = (params) => api.get('/admin/comments', { params });
export const adminDeleteComment = (id)     => api.delete(`/admin/comments/${id}`);

// Admin – Price Alerts
export const adminListAlerts   = (params)     => api.get('/admin/alerts', { params });
export const adminCreateAlert  = (data)       => api.post('/admin/alerts', data);
export const adminUpdateAlert  = (id, data)   => api.put(`/admin/alerts/${id}`, data);
export const adminDeleteAlert  = (id)         => api.delete(`/admin/alerts/${id}`);

// Admin – Categories
export const adminListCategories   = ()          => api.get('/admin/categories');
export const adminCreateCategory   = (data)      => api.post('/admin/categories', data);
export const adminUpdateCategory   = (id, data)  => api.put(`/admin/categories/${id}`, data);
export const adminDeleteCategory   = (id)        => api.delete(`/admin/categories/${id}`);

// Admin – Tags
export const adminListTags   = ()          => api.get('/admin/tags');
export const adminCreateTag  = (data)      => api.post('/admin/tags', data);
export const adminUpdateTag  = (id, data)  => api.put(`/admin/tags/${id}`, data);
export const adminDeleteTag  = (id)        => api.delete(`/admin/tags/${id}`);

export default api;

