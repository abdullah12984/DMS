// const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const BASE_URL = import.meta.env.PROD
  ? 'https://dms-ylv6.vercel.app/api'
  : 'http://localhost:5000/api';
const getToken = () => localStorage.getItem('dms_token');

const request = async (endpoint, options = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    ...(getToken() && { Authorization: `Bearer ${getToken()}` }),
    ...options.headers,
  };
  const res = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
};

export const api = {
  // Auth
  login: (email, password) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  register: (userData) =>
    request('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
  getPendingUsers: () => request('/auth/pending'),
  approveUser: (id) => request(`/auth/approve/${id}`, { method: 'PUT' }),
  rejectUser: (id) => request(`/auth/reject/${id}`, { method: 'DELETE' }),

  // Users
  getUsers: () => request('/users'),
  updateUserRole: (id, role) =>
    request(`/users/${id}/role`, { method: 'PUT', body: JSON.stringify({ role }) }),
  updateUser: (id, data) =>
    request(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteUser: (id) => request(`/users/${id}`, { method: 'DELETE' }),

 // Email
getEmails: (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return request(`/emails${query ? `?${query}` : ''}`);
},
getEmail: (id) => request(`/emails/${id}`),
getEmailCounts: () => request('/emails/stats/counts'),
sendEmail: (data) => request('/emails', { method: 'POST', body: JSON.stringify(data) }),
receiveEmail: (data) => request('/emails/receive', { method: 'POST', body: JSON.stringify(data) }),
markEmailRead: (id, isRead = true) => request(`/emails/${id}/read`, { method: 'PUT', body: JSON.stringify({ isRead }) }),
starEmail: (id, isStarred) => request(`/emails/${id}/star`, { method: 'PUT', body: JSON.stringify({ isStarred }) }),
updateEmailCategory: (id, category) => request(`/emails/${id}/category`, { method: 'PUT', body: JSON.stringify({ category }) }),
deleteEmail: (id) => request(`/emails/${id}`, { method: 'DELETE' }),
getEmailTemplates: () => request('/emails/templates/all'),
createEmailTemplate: (data) => request('/emails/templates', { method: 'POST', body: JSON.stringify(data) }),
deleteEmailTemplate: (id) => request(`/emails/templates/${id}`, { method: 'DELETE' }),
  // Projects
  getProjects: () => request('/projects'),
  getProject: (id) => request(`/projects/${id}`),
  createProject: (data) => request('/projects', { method: 'POST', body: JSON.stringify(data) }),
  updateProject: (id, data) => request(`/projects/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteProject: (id) => request(`/projects/${id}`, { method: 'DELETE' }),

  // Tasks
  getTasks: () => request('/tasks'),
  getMyTasks: () => request('/tasks/my'),
  getTask: (id) => request(`/tasks/${id}`),
  createTask: (data) => request('/tasks', { method: 'POST', body: JSON.stringify(data) }),
  updateTask: (id, data) => request(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteTask: (id) => request(`/tasks/${id}`, { method: 'DELETE' }),

  // Leads
  getLeads: () => request('/leads'),
  getLead: (id) => request(`/leads/${id}`),
  createLead: (data) => request('/leads', { method: 'POST', body: JSON.stringify(data) }),
  updateLead: (id, data) => request(`/leads/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  updateLeadStatus: (id, status) =>
    request(`/leads/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),

  // Meetings
  getMeetings: () => request('/meetings'),
  createMeeting: (data) => request('/meetings', { method: 'POST', body: JSON.stringify(data) }),
  updateMeeting: (id, data) => request(`/meetings/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteMeeting: (id) => request(`/meetings/${id}`, { method: 'DELETE' }),

  // Engagements
  getEngagements: () => request('/engagements'),
  getEngagement: (id) => request(`/engagements/${id}`),
  createEngagement: (data) => request('/engagements', { method: 'POST', body: JSON.stringify(data) }),
  updateEngagement: (id, data) => request(`/engagements/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  // Notifications
  getNotifications: () => request('/notifications'),
  markNotificationRead: (id) => request(`/notifications/${id}/read`, { method: 'PUT' }),
  markAllNotificationsRead: () => request('/notifications/read-all', { method: 'PUT' }),

  // Audit
  getAuditLogs: () => request('/audit-logs'),

  // Email Config
getEmailConfigStatus: () => request('/email-config/status'),
setupEmailConfig: (data) => request('/email-config/setup', { method: 'POST', body: JSON.stringify(data) }),
testEmailConfig: () => request('/email-config/test', { method: 'POST' }),
disconnectEmailConfig: () => request('/email-config/disconnect', { method: 'DELETE' }),


  // Comments
getTaskComments: (taskId) => request(`/comments/task/${taskId}`),
addComment: (data) => request('/comments', { method: 'POST', body: JSON.stringify(data) }),
deleteComment: (id) => request(`/comments/${id}`, { method: 'DELETE' }),

  // Stats
  getDashboardStats: () => request('/stats/dashboard'),
  getProgressStats: () => request('/stats/progress'),
  getResourceStats: () => request('/stats/resources'),

  getCalendarStatus: () => request('/calendar-oauth/status'),
disconnectCalendar: () => request('/calendar-oauth/disconnect', { method: 'DELETE' }),
getGoogleEvents: () => request('/calendar-oauth/events'),

getMyNotificationEmail: () => request('/users/me/email'),
updateMyNotificationEmail: (email) => request('/users/me/email', { method: 'PUT', body: JSON.stringify({ notificationEmail: email }) }),

getAnalytics: () => request('/analytics/progress'),

getProjectNotes: (projectId) => request(`/project-notes/project/${projectId}`),
addProjectNote: (projectId, content) => request(`/project-notes/project/${projectId}`, { method: 'POST', body: JSON.stringify({ content }) }),
updateProjectNote: (id, content) => request(`/project-notes/${id}`, { method: 'PUT', body: JSON.stringify({ content }) }),
deleteProjectNote: (id) => request(`/project-notes/${id}`, { method: 'DELETE' }),

getUserTaskStats: () => request('/analytics/user-tasks'),



// Password / OTP
forgotPassword: (email) => request('/password/forgot-request', { method: 'POST', body: JSON.stringify({ email }) }),
verifyOtp: (email, otp) => request('/password/verify-otp', { method: 'POST', body: JSON.stringify({ email, otp }) }),
resetPassword: (email, otp, newPassword) => request('/password/reset-password', { method: 'POST', body: JSON.stringify({ email, otp, newPassword }) }),
changePassword: (currentPassword, newPassword) => request('/password/change-password', { method: 'POST', body: JSON.stringify({ currentPassword, newPassword }) }),






verifyEmail: (email, otp) => request('/auth/verify-email', { method: 'POST', body: JSON.stringify({ email, otp }) }),
resendVerifyOtp: (email) => request('/auth/resend-verify-otp', { method: 'POST', body: JSON.stringify({ email }) }),

getMyProfile: () => request('/profile'),
updateMyProfile: (data) => request('/profile', { method: 'PUT', body: JSON.stringify(data) }),


fetchEmailsNow: () => request('/emails/fetch-now', { method: 'POST' }),

};