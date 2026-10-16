const nodemailer = require('nodemailer');

// ============ SYSTEM MAILER (from .env) ============
const systemTransporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const verifyMailer = async () => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log('⚠️  System email not configured');
    return false;
  }
  try {
    await systemTransporter.verify();
    console.log('✅ System email server ready');
    return true;
  } catch (err) {
    console.error('❌ System email error:', err.message);
    return false;
  }
};

// ============ SYSTEM SEND ============
const sendSystemMail = async ({ to, subject, text, html }) => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return { skipped: true };
  }
  const info = await systemTransporter.sendMail({
    from: `"${process.env.SMTP_FROM_NAME || 'DMS Portal'}" <${process.env.SMTP_USER}>`,
    to,
    subject,
    text,
    html: html || text.replace(/\n/g, '<br>'),
  });
  return { messageId: info.messageId, response: info.response };
};

// ============ USER SEND (their own Gmail) ============
const sendUserMail = async ({
  userEmail,
  userPass,
  userHost,
  userPort,
  userName,
  to,
  subject,
  text,
  html,
}) => {
  if (!userEmail || !userPass) throw new Error('User SMTP not configured');

  const transporter = nodemailer.createTransport({
    host: userHost || 'smtp.gmail.com',
    port: userPort || 587,
    secure: false,
    auth: { user: userEmail, pass: userPass },
  });

  const info = await transporter.sendMail({
    from: `"${userName || userEmail}" <${userEmail}>`,
    to,
    subject,
    text,
    html: html || text.replace(/\n/g, '<br>'),
  });

  return { messageId: info.messageId, response: info.response, sender: userEmail };
};

// ============ TEST USER SMTP ============
const testUserSMTP = async (userEmail, userPass, userHost, userPort) => {
  const t = nodemailer.createTransport({
    host: userHost || 'smtp.gmail.com',
    port: userPort || 587,
    secure: false,
    auth: { user: userEmail, pass: userPass },
  });
  await t.verify();
  return true;
};

module.exports = { verifyMailer, sendSystemMail, sendUserMail, testUserSMTP };