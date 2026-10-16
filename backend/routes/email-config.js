const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { verifyToken } = require('../middleware/auth');
const { encrypt, decrypt } = require('../utils/crypto');
const { testUserSMTP, sendUserMail } = require('../utils/mailer');
const prisma = new PrismaClient();
const router = express.Router();

// Get status
router.get('/status', verifyToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { emailUser: true, emailHost: true, emailConnected: true },
    });
    res.json({
      connected: user?.emailConnected || false,
      emailUser: user?.emailUser || null,
      host: user?.emailHost || 'smtp.gmail.com',
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Save + test
router.post('/setup', verifyToken, async (req, res) => {
  try {
    const { emailUser, emailPass, emailHost, emailPort } = req.body;
    if (!emailUser || !emailPass) {
      return res.status(400).json({ error: 'Email and app password required' });
    }

    // Test credentials first
    try {
      await testUserSMTP(
        emailUser,
        emailPass.replace(/\s/g, ''),
        emailHost || 'smtp.gmail.com',
        emailPort || 587
      );
    } catch (err) {
      return res.status(400).json({
        error: `Could not connect: ${err.message}. Check your email and app password.`,
      });
    }

    // Save encrypted
    await prisma.user.update({
      where: { id: req.user.id },
      data: {
        emailUser,
        emailPass: encrypt(emailPass.replace(/\s/g, '')),
        emailHost: emailHost || 'smtp.gmail.com',
        emailPort: emailPort || 587,
        emailConnected: true,
      },
    });

    res.json({ message: '✅ Email connected successfully!', emailUser });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Disconnect
router.delete('/disconnect', verifyToken, async (req, res) => {
  try {
    await prisma.user.update({
      where: { id: req.user.id },
      data: {
        emailUser: null,
        emailPass: null,
        emailConnected: false,
      },
    });
    res.json({ message: 'Email disconnected' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Send test email
router.post('/test', verifyToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user.emailConnected || !user.emailUser || !user.emailPass) {
      return res.status(400).json({ error: 'Email not connected yet' });
    }

    const password = decrypt(user.emailPass);
    await sendUserMail({
      userEmail: user.emailUser,
      userPass: password,
      userHost: user.emailHost,
      userPort: user.emailPort,
      userName: user.name,
      to: user.emailUser,
      subject: 'DMS Portal Test Email',
      text: `Hi ${user.name}, this test confirms your email is connected to DMS Portal.`,
    });

    res.json({ message: '✅ Test email sent to your inbox!' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;