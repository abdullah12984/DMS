// const express = require('express');
// const cors = require('cors');
// require('dotenv').config();

// const authRoutes = require('./routes/auth');
// const userRoutes = require('./routes/users');
// const projectRoutes = require('./routes/projects');
// const taskRoutes = require('./routes/tasks');
// const leadRoutes = require('./routes/leads');
// const meetingRoutes = require('./routes/meetings');
// const engagementRoutes = require('./routes/engagements');
// const emailRoutes = require('./routes/emails');
// const notificationRoutes = require('./routes/notifications');
// const auditRoutes = require('./routes/audit');
// const statsRoutes = require('./routes/stats');
// const commentRoutes = require('./routes/comments');
// const emailConfigRoutes = require('./routes/email-config');
// const { startIMAP } = require('./utils/imap');
// const { verifyMailer } = require('./utils/mailer');
// const calendarOAuthRoutes = require('./routes/calendar-oauth');
// const userEmailRoutes = require('./routes/userEmail');
// const analyticsRoutes = require('./routes/analytics');
// const projectNoteRoutes = require('./routes/projectNotes');
// const passwordRoutes = require('./routes/password');
// const profileRoutes = require('./routes/profile');
// const app = express();
// const PORT = process.env.PORT || 5000;

// app.use(cors());
// app.use(express.json());

// // Health check
// app.get('/api/health', (req, res) => res.json({ status: 'DMS Backend running ✅' }));

// // Routes

// app.use('/api/auth', authRoutes);
// app.use('/api/users', userRoutes);
// app.use('/api/projects', projectRoutes);
// app.use('/api/tasks', taskRoutes);
// app.use('/api/leads', leadRoutes);
// app.use('/api/meetings', meetingRoutes);
// app.use('/api/engagements', engagementRoutes);
// app.use('/api/emails', emailRoutes);
// app.use('/api/notifications', notificationRoutes);
// app.use('/api/audit-logs', auditRoutes);
// app.use('/api/stats', statsRoutes);
// app.use('/api/comments', commentRoutes);
// app.use('/api/email-config', emailConfigRoutes);
// app.use('/api/calendar-oauth', calendarOAuthRoutes);
// app.use('/api/users/me/email', userEmailRoutes);
// app.use('/api/analytics', analyticsRoutes);
// app.use('/api/project-notes', projectNoteRoutes);
// app.use('/api/password', passwordRoutes);
// app.use('/api/profile', profileRoutes);
// // Start
// app.listen(PORT, async () => {
//   console.log(`🚀 Server running on http://localhost:${PORT}`);
//   await verifyMailer();
//   await startIMAP();   // ← ADD THIS
//   // ⬇️ Prevent unhandled errors from crashing the server
// process.on('uncaughtException', (err) => {
//   console.error('⚠️  Uncaught Exception:', err.message);
//   // Don't exit — keep server running
// });

// process.on('unhandledRejection', (err) => {
//   console.error('⚠️  Unhandled Rejection:', err?.message || err);
//   // Don't exit — keep server running
// });
// });



const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const projectRoutes = require('./routes/projects');
const taskRoutes = require('./routes/tasks');
const leadRoutes = require('./routes/leads');
const meetingRoutes = require('./routes/meetings');
const engagementRoutes = require('./routes/engagements');
const emailRoutes = require('./routes/emails');
const notificationRoutes = require('./routes/notifications');
const auditRoutes = require('./routes/audit');
const statsRoutes = require('./routes/stats');
const commentRoutes = require('./routes/comments');
const emailConfigRoutes = require('./routes/email-config');
const { startIMAP } = require('./utils/imap');
const { verifyMailer } = require('./utils/mailer');
const calendarOAuthRoutes = require('./routes/calendar-oauth');
const userEmailRoutes = require('./routes/userEmail');
const analyticsRoutes = require('./routes/analytics');
const projectNoteRoutes = require('./routes/projectNotes');
const passwordRoutes = require('./routes/password');
const profileRoutes = require('./routes/profile');

const app = express();
const PORT = process.env.PORT || 5000;

// ⬇️ CORS — allow frontend (Vercel or local)
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    process.env.FRONTEND_URL,
  ].filter(Boolean),
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'DMS Backend running ✅' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/meetings', meetingRoutes);
app.use('/api/engagements', engagementRoutes);
app.use('/api/emails', emailRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/audit-logs', auditRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/email-config', emailConfigRoutes);
app.use('/api/calendar-oauth', calendarOAuthRoutes);
app.use('/api/users/me/email', userEmailRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/project-notes', projectNoteRoutes);
app.use('/api/password', passwordRoutes);
app.use('/api/profile', profileRoutes);

// ⬇️ Global error handlers (prevent crashes)
process.on('uncaughtException', (err) => {
  console.error('⚠️  Uncaught Exception:', err.message);
});

process.on('unhandledRejection', (err) => {
  console.error('⚠️  Unhandled Rejection:', err?.message || err);
});

// ⬇️ VERCEL: export the app as a serverless handler
// ⬇️ LOCAL: start listening as usual
if (process.env.VERCEL) {
  // On Vercel — do NOT call app.listen(); Vercel handles it
  // Background IMAP is also skipped
  console.log('☁️  Running on Vercel — background IMAP disabled');
} else {
  // Local development
  app.listen(PORT, async () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    await verifyMailer();
    await startIMAP(); // background polling works locally
  });
}

module.exports = app;