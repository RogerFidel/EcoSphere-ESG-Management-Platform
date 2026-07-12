import axios from 'axios';

const api = axios.create({
  baseURL: '/api/v1',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor — attach token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('gq_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor — handle 401
api.interceptors.response.use(
  (res) => res.data,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('gq_token');
      localStorage.removeItem('gq_user');
      window.location.href = '/login';
    }
    const message = err.response?.data?.error || err.response?.data?.message || err.message || 'Something went wrong';
    return Promise.reject(new Error(message));
  }
);

// ─── Auth ────────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
  changePassword: (data) => api.post('/auth/change-password', data),
};

// ─── Users ───────────────────────────────────────────────────────────────────
export const usersAPI = {
  getAll: (params) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  update: (id, data) => api.patch(`/users/${id}`, data),
  getXPHistory: (id, params) => api.get(`/users/${id}/xp-history`, { params }),
  getBadges: (id) => api.get(`/users/${id}/badges`),
  getAchievements: (id, params) => api.get(`/users/${id}/achievements`, { params }),
  getMilestones: (id) => api.get(`/users/${id}/milestones`),
  awardXP: (id, data) => api.post(`/users/${id}/award-xp`, data),
};

// ─── ESG Actions ─────────────────────────────────────────────────────────────
export const esgAPI = {
  getAll: (params) => api.get('/esg-actions', { params }),
  create: (data) => api.post('/esg-actions', data),
  getSummary: () => api.get('/esg-actions/summary'),
  verify: (id) => api.patch(`/esg-actions/${id}/verify`),
  delete: (id) => api.delete(`/esg-actions/${id}`),
};

// ─── Badges ───────────────────────────────────────────────────────────────────
export const badgesAPI = {
  getAll: (params) => api.get('/badges', { params }),
  getById: (id) => api.get(`/badges/${id}`),
  create: (data) => api.post('/badges', data),
  award: (id, data) => api.post(`/badges/${id}/award`, data),
  update: (id, data) => api.patch(`/badges/${id}`, data),
};

// ─── Rewards ──────────────────────────────────────────────────────────────────
export const rewardsAPI = {
  getAll: (params) => api.get('/rewards', { params }),
  getById: (id) => api.get(`/rewards/${id}`),
  create: (data) => api.post('/rewards', data),
  redeem: (id) => api.post(`/rewards/${id}/redeem`),
  getMyRedemptions: (params) => api.get('/rewards/my/redemptions', { params }),
  updateRedemption: (id, data) => api.patch(`/rewards/redemptions/${id}`, data),
  update: (id, data) => api.patch(`/rewards/${id}`, data),
};

// ─── Challenges ──────────────────────────────────────────────────────────────
export const challengesAPI = {
  getAll: (params) => api.get('/challenges', { params }),
  getById: (id) => api.get(`/challenges/${id}`),
  create: (data) => api.post('/challenges', data),
  join: (id) => api.post(`/challenges/${id}/join`),
  leave: (id) => api.post(`/challenges/${id}/leave`),
  updateProgress: (id, data) => api.patch(`/challenges/${id}/progress`, data),
  update: (id, data) => api.patch(`/challenges/${id}`, data),
  cancel: (id) => api.delete(`/challenges/${id}`),
};

// ─── Leaderboards ─────────────────────────────────────────────────────────────
export const leaderboardsAPI = {
  getGlobal: (params) => api.get('/leaderboards/global', { params }),
  getDepartment: () => api.get('/leaderboards/department'),
  getMonthly: (params) => api.get('/leaderboards/monthly', { params }),
  getMyRank: () => api.get('/leaderboards/my-rank'),
};

// ─── Notifications ────────────────────────────────────────────────────────────
export const notificationsAPI = {
  getAll: (params) => api.get('/notifications', { params }),
  markRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch('/notifications/read-all'),
  delete: (id) => api.delete(`/notifications/${id}`),
  clearAll: () => api.delete('/notifications/clear-all'),
  sendComplianceAlert: (data) => api.post('/notifications/send-compliance-alert', data),
  sendPolicyReminder: (data) => api.post('/notifications/send-policy-reminder', data),
};

// ─── AI ───────────────────────────────────────────────────────────────────────
export const aiAPI = {
  getMyInsights: (params) => api.get('/ai/insights/me', { params }),
  getCarbonReduction: () => api.get('/ai/carbon-reduction'),
  getESGInsights: () => api.get('/ai/esg-insights'),
  getPersonalScore: () => api.get('/ai/personal-score'),
  getRecommendations: () => api.get('/ai/recommendations'),
  getGoalPrediction: (challengeId) => api.get(`/ai/goal-prediction/${challengeId}`),
  getDepartmentPrediction: (deptId) => api.get(`/ai/department-prediction/${deptId}`),
  getDepartmentComparison: () => api.get('/ai/department-comparison'),
  getRiskAlerts: (deptId) => api.get(`/ai/risk-alerts/${deptId}`),
  sendFeedback: (id, feedback) => api.patch(`/ai/insights/${id}/feedback`, { feedback }),
  markRead: (id) => api.patch(`/ai/insights/${id}/read`),
};

// ─── Departments ─────────────────────────────────────────────────────────────
export const departmentsAPI = {
  getAll: () => api.get('/departments'),
  getById: (id) => api.get(`/departments/${id}`),
  create: (data) => api.post('/departments', data),
  getCompetition: (id) => api.get(`/departments/${id}/competition`),
};

// ─── Achievements ─────────────────────────────────────────────────────────────
export const achievementsAPI = {
  getMine: (params) => api.get('/achievements/me', { params }),
  getRecent: () => api.get('/achievements/me/recent'),
};

// ─── Admin ────────────────────────────────────────────────────────────────────
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getAnalytics: (params) => api.get('/admin/analytics/esg-trends', { params }),
  broadcast: (data) => api.post('/admin/broadcast', data),
  updateUser: (id, data) => api.patch(`/admin/users/${id}`, data),
  getAIInsights: (params) => api.get('/admin/ai-insights', { params }),
};

export default api;
