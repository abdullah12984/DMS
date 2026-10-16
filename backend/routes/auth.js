const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const { sendSystemMail } = require('../utils/mailer');
const { logAction } = require('../middleware/audit');
const prisma = new PrismaClient();
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'dms_super_secret_key_change_this';

// ============ LOGIN ============
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    if (!user.isActive) return res.status(403).json({ error: 'Account pending approval' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// // ============ REGISTER ============
// router.post('/register', async (req, res) => {
//   const { name, email, password, role } = req.body;
//   try {
//     if (role === 'SUPER_ADMIN') {
//       return res.status(403).json({ error: 'Cannot register as Super Admin' });
//     }

//     const existing = await prisma.user.findUnique({ where: { email } });
//     if (existing) return res.status(400).json({ error: 'Email already registered' });

//     const hashed = await bcrypt.hash(password, 10);

//     const user = await prisma.user.create({
//       data: {
//         name,
//         email,
//         password: hashed,
//         role: role || 'INTERN',
//         isActive: false,
//       },
//     });

//     // 🔔 Notify ONLY Super Admins (their personal userIds)
//     const superAdmins = await prisma.user.findMany({
//       where: { role: 'SUPER_ADMIN', isActive: true },
//       select: { id: true },
//     });

//     for (const sa of superAdmins) {
//       await prisma.notification.create({
//         data: {
//           userId: sa.id,   // ✅ PERSONAL — only this SA sees it
//           title: '🔔 New Registration Request',
//           message: `${name} (${email}) requested ${role} access`,
//           type: 'user',
//           link: '/superadmin/registrations',
//         },
//       });
//     }

//     console.log(`✅ Registration: ${name} (${email}) → notified ${superAdmins.length} admin(s)`);

//     res.status(201).json({
//       message: 'Registration submitted. Wait for Super Admin approval.',
//       user: { id: user.id, email: user.email, role: user.role },
//     });
//   } catch (e) {
//     console.error('Register error:', e);
//     res.status(500).json({ error: e.message });
//   }
// });
// ============ REGISTER — Step 1: Create + Send OTP ============
router.post('/register', async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    if (role === 'SUPER_ADMIN') {
      return res.status(403).json({ error: 'Cannot register as Super Admin' });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ error: 'Email already registered' });
    }

  const hashed = await bcrypt.hash(password, 10);
const otp = Math.floor(100000 + Math.random() * 900000).toString();
const expires = new Date(Date.now() + 10 * 60 * 1000);

// ✅ Convert role to uppercase enum value
const normalizedRole = (role || 'INTERN').toUpperCase();

await prisma.user.create({
  data: {
    name,
    email,
    password: hashed,
    role: normalizedRole,     // ← uppercase
    isActive: false,
    otpCode: otp,
    otpExpiresAt: expires,
    otpPurpose: 'email-verify',
  },
});
    // Send OTP email
    try {
      await sendSystemMail({
        to: email,
        subject: `🔐 Verify Your Email: ${otp}`,
        text: `Your verification code is: ${otp}\n\nExpires in 10 minutes.`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px;">
            <div style="background: linear-gradient(135deg, #3b82f6, #8b5cf6); padding: 20px; border-radius: 12px 12px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 22px;">🔐 Verify Your Email</h1>
            </div>
            <div style="background: white; padding: 30px; border: 1px solid #e2e8f0; border-radius: 0 0 12px 12px; text-align: center;">
              <p style="color: #334155;">Your verification code:</p>
              <p style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #3b82f6; margin: 20px 0; font-family: monospace;">${otp}</p>
              <p style="color: #64748b; font-size: 13px;">Expires in 10 minutes.</p>
            </div>
          </div>
        `,
      });
      console.log(`📧 Registration OTP for ${email}: ${otp}`);
    } catch (err) {
      console.error('OTP email failed:', err.message);
      return res.status(500).json({ error: 'Failed to send verification email' });
    }

    res.status(201).json({
      message: `✅ Verification code sent to ${email}`,
      email,
      requiresVerification: true,
    });
  } catch (e) {
    console.error('Register error:', e);
    res.status(500).json({ error: e.message });
  }
});

// ============ REGISTER — Step 2: Verify OTP + Notify SA ============
router.post('/verify-email', async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) return res.status(400).json({ error: 'Email and OTP required' });

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (!user.otpCode || !user.otpExpiresAt) {
      return res.status(400).json({ error: 'No OTP requested' });
    }
    if (new Date() > user.otpExpiresAt) {
      return res.status(400).json({ error: 'OTP expired. Please register again.' });
    }
    if (user.otpCode !== otp.toString().trim()) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        otpCode: null,
        otpExpiresAt: null,
        otpPurpose: null,
      },
    });

    // Notify Super Admins
    const superAdmins = await prisma.user.findMany({
      where: { role: 'SUPER_ADMIN', isActive: true },
      select: { id: true },
    });

    for (const sa of superAdmins) {
      await prisma.notification.create({
        data: {
          userId: sa.id,
          title: '🔔 New Registration Request',
          message: `${user.name} (${email}) requested ${user.role} access`,
          type: 'user',
          link: '/superadmin/registrations',
        },
      });
    }

    res.json({
      message: '✅ Email verified! Waiting for Super Admin approval.',
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ============ RESEND REGISTRATION OTP ============
router.post('/resend-verify-otp', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email required' });

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: { otpCode: otp, otpExpiresAt: expires, otpPurpose: 'email-verify' },
    });

    await sendSystemMail({
      to: email,
      subject: `🔐 Your Verification Code: ${otp}`,
      text: `Your verification code is: ${otp}`,
    });

    console.log(`📧 Resent registration OTP to ${email}: ${otp}`);
    res.json({ message: '✅ New code sent' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});



// ============ PENDING USERS ============
router.get('/pending', async (req, res) => {
  try {
    const pending = await prisma.user.findMany({
      where: { isActive: false },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(pending);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ============ APPROVE — Notify ONLY the approved user ============
router.put('/approve/:id', async (req, res) => {
  try {
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { isActive: true },
    });

    await logAction(req.user, 'Approved registration', user.name, 'info');

    // 🔔 Notify ONLY the approved user
    await prisma.notification.create({
      data: {
        userId: user.id,   // ✅ PERSONAL
        title: '✅ Registration Approved',
        message: 'Welcome to DMS Portal! You can now log in.',
        type: 'success',
        link: '/',
      },
    });

    res.json({ message: 'User approved', user });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ============ REJECT ============
router.delete('/reject/:id', async (req, res) => {
  try {
    const user = await prisma.user.delete({ where: { id: req.params.id } });
    await logAction(req.user, 'Rejected registration', user.email, 'danger');
    res.json({ message: 'User rejected' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;