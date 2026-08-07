// src/services/api.js
// ─────────────────────────────────────────────
//  Central API helper – every request goes through here.
//  Automatically attaches the JWT token from localStorage.
// ─────────────────────────────────────────────

const BASE_URL = process.env.REACT_APP_API_URL || 'https://gamified-learning-platform-4b3f.onrender.com/api';

// ── Helper: build headers ────────────────────
const getHeaders = () => {
  const token = localStorage.getItem('levelup_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

// ── Core request function ────────────────────
const request = async (method, endpoint, body = null) => {
  const config = {
    method,
    headers: getHeaders(),
  };
  if (body) config.body = JSON.stringify(body);

  const res  = await fetch(`${BASE_URL}${endpoint}`, config);
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || data.message || 'Something went wrong');
  }
  return data;
};

// ── Shorthand methods ────────────────────────
export const api = {
  get:    (endpoint)        => request('GET',    endpoint),
  post:   (endpoint, body)  => request('POST',   endpoint, body),
  put:    (endpoint, body)  => request('PUT',    endpoint, body),
  delete: (endpoint)        => request('DELETE', endpoint),
};

// ── Auth ─────────────────────────────────────
export const authAPI = {
  register:       (data)  => api.post('/auth/register',        data),
  login:          (data)  => api.post('/auth/login',           data),
  googleLogin:    (credential) => api.post('/auth/google',     { credential }),
  getMe:          ()      => api.get ('/auth/me'),
  updateProfile:  (data)  => api.put ('/auth/update',          data),
  changePassword: (data)  => api.put ('/auth/change-password', data),
  setFocusAreas:  (focusAreas) => api.put('/auth/focus-areas', { focusAreas }),
};

// ── Posts ────────────────────────────────────
export const postAPI = {
  getAll:        (tag, page) => api.get(`/posts?tag=${tag || ''}&page=${page || 1}`),
  getOne:        (id)        => api.get(`/posts/${id}`),
  create:        (data)      => api.post('/posts', data),
  delete:        (id)        => api.delete(`/posts/${id}`),
  like:          (id)        => api.put(`/posts/${id}/like`),
  addComment:    (id, data)  => api.post(`/posts/${id}/comments`, data),
  deleteComment: (id, cId)   => api.delete(`/posts/${id}/comments/${cId}`),
};

// ── Users ────────────────────────────────────
export const userAPI = {
  getAll:        (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return api.get(`/users?${q}`);
  },
  getLeaderboard: ()     => api.get('/users/leaderboard'),
  getProfile:     (id)   => api.get(`/users/${id}`),
  getUserPosts:   (id)   => api.get(`/users/${id}/posts`),
  follow:         (id)   => api.put(`/users/${id}/follow`),
};

// ── Messages ─────────────────────────────────
export const messageAPI = {
  getConversations: ()       => api.get('/messages'),
  getMessages:      (userId) => api.get(`/messages/${userId}`),
  sendMessage:      (userId, data) => api.post(`/messages/${userId}`, data),
};

// ── Learning Goals ───────────────────────────
export const goalAPI = {
  getAll:         (status)        => api.get(`/goals${status ? `?status=${status}` : ''}`),
  getOne:         (id)            => api.get(`/goals/${id}`),
  create:         (data)          => api.post('/goals', data),
  update:         (id, data)      => api.put(`/goals/${id}`, data),
  updateProgress: (id, data)      => api.put(`/goals/${id}/progress`, data),
  abandon:        (id)            => api.put(`/goals/${id}/abandon`),
  delete:         (id)            => api.delete(`/goals/${id}`),
};

// ── Daily Tasks ───────────────────────────────
export const taskAPI = {
  getToday:    ()     => api.get('/tasks/today'),
  getHistory:  ()     => api.get('/tasks/history'),
  toggle:      (id)   => api.put(`/tasks/${id}/complete`),
};

// ── Learning Roadmaps ─────────────────────────
export const roadmapAPI = {
  getAll:      (category)        => api.get(`/roadmaps${category ? `?category=${category}` : ''}`),
  getOne:      (id)              => api.get(`/roadmaps/${id}`),
  getMine:     ()                => api.get('/roadmaps/mine'),
  start:       (id)              => api.post(`/roadmaps/${id}/start`),
  toggleStep:  (id, stepId)      => api.put(`/roadmaps/${id}/steps/${stepId}/toggle`),
  leave:       (id)              => api.delete(`/roadmaps/${id}/leave`),
};

// ── Daily Quiz Challenge ──────────────────────
export const quizAPI = {
  getToday:       ()        => api.get('/quiz/today'),
  submit:         (answers) => api.post('/quiz/submit', { answers }),
  getHistory:     ()        => api.get('/quiz/history'),
  getLeaderboard: ()        => api.get('/quiz/leaderboard'),
};

// ── Pomodoro Timer ─────────────────────────────
export const pomodoroAPI = {
  complete:  (data) => api.post('/pomodoro/complete', data),
  getToday:  ()      => api.get('/pomodoro/today'),
  getStats:  ()      => api.get('/pomodoro/stats'),
};

// ── Weekly Reports ─────────────────────────────
export const reportAPI = {
  getWeekly:  () => api.get('/reports/weekly'),
  getMonthly: () => api.get('/reports/monthly'),
};

// ── Nova AI Chat ────────────────────────────────
export const novaAPI = {
  chat:        (message, history) => api.post('/nova/chat', { message, history }),
  getDailyTip: ()                 => api.get('/nova/daily-tip'),
};
