const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { verifyToken } = require('../middleware/auth');
const prisma = new PrismaClient();
const router = express.Router();

// Get current user's notification email
router.get('/', verifyToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { email: true, notificationEmail: true, name: true },
    });
    res.json(user);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Update notification email
router.put('/', verifyToken, async (req, res) => {
  try {
    const { notificationEmail } = req.body;

    // Validate email
    if (notificationEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(notificationEmail)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    await prisma.user.update({
      where: { id: req.user.id },
      data: { notificationEmail: notificationEmail || null },
    });

    res.json({ message: '✅ Notification email saved!', notificationEmail });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;