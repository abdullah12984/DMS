const express = require('express');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { PrismaClient } = require('@prisma/client');
const { verifyToken } = require('../middleware/auth');
const { logAction } = require('../middleware/audit');
const { sendSystemMail } = require('../utils/mailer');
const prisma = new PrismaClient();
const router = express.Router();

// Helper: generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Helper: send OTP email
const sendOtpEmail = async (to, otp, purpose) => {
  const title =
    purpose === 'password-reset' ? 'Password Reset Code' : 'Password Change Code';

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; background: #f8fafc; padding: 24px; border-radius: 12px;">
      <div style="background: linear-gradient(135deg, #3b82f6, #8b5cf6); padding: 24px; border-radius: 12px 12px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 22px;">🔐 ${title}</h1>
      </div>
      <div style="background: white; padding: 32px; border-radius: 0 0 12px 12px; text-align: center;">
        <p style="color: #334155; font-size: 15px; margin-bottom: 20px;">
          Your verification code is:
        </p>
        <div style="background: #f1f5f9; padding: 20px; border-radius: 10px; margin: 20px 0;">
          <p style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #3b82f6; margin: 0; font-family: monospace;">
            ${otp}
          </p>
        </div>
        <p style="color: #64748b; font-size: 13px; margin-top: 20px;">
          This code expires in <b>10 minutes</b>. Don't share it with anyone.
        </p>
        <p style="color: #94a3b8; font-size: 11px; margin-top: 24px;">
          If you didn't request this, ignore this email.
        </p>
      </div>
    </div>
  `;

  await sendSystemMail({
    to,
    subject: `🔐 ${title}: ${otp}`,
    text: `Your ${title} is: ${otp}\n\nThis code expires in 10 minutes.`,
    html,
  });
};

// ============ 1. FORGOT PASSWORD — Request OTP ============
router.post('/forgot-request', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email required' });

    const user = await prisma.user.findUnique({ where: { email } });

    // Security: don't reveal if user exists
    if (!user) {
      return res.json({
        message: 'If this email is registered, a reset code was sent.',
      });
    }

    const otp = generateOTP();
    const expires = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        otpCode: otp,
        otpExpiresAt: expires,
        otpPurpose: 'password-reset',
      },
    });

    await sendOtpEmail(user.email, otp, 'password-reset');
    console.log(`📧 Password reset OTP sent to ${user.email}: ${otp}`);

    res.json({
      message: 'If this email is registered, a reset code was sent.',
    });
  } catch (e) {
    console.error('Forgot-request error:', e);
    res.status(500).json({ error: 'Failed to send OTP. Please try again.' });
  }
});

// ============ 2. VERIFY OTP ============
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ error: 'Email and OTP required' });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ error: 'Invalid code' });
    if (!user.otpCode || !user.otpExpiresAt) {
      return res.status(400).json({ error: 'No OTP requested' });
    }
    if (new Date() > user.otpExpiresAt) {
      return res.status(400).json({ error: 'OTP expired' });
    }
    if (user.otpCode !== otp.toString().trim()) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    res.json({ message: 'OTP verified', verified: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ============ 3. RESET PASSWORD (after OTP verify) ============
router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ error: 'All fields required' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be 6+ characters' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (!user.otpCode || user.otpCode !== otp) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }
    if (new Date() > user.otpExpiresAt) {
      return res.status(400).json({ error: 'OTP expired' });
    }

    const hashed = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashed,
        otpCode: null,
        otpExpiresAt: null,
        otpPurpose: null,
      },
    });

    await logAction({ id: user.id, name: user.name }, 'Reset password', user.email, 'warning');

    res.json({ message: '✅ Password reset successfully!' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ============ 4. CHANGE PASSWORD (logged in user) ============
router.post('/change-password', verifyToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Both passwords required' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be 6+ characters' });
    }

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) return res.status(400).json({ error: 'Current password is wrong' });

    const hashed = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashed },
    });

    await logAction(req.user, 'Changed password', user.email, 'warning');

    res.json({ message: '✅ Password changed successfully!' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;