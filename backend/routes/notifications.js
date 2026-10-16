const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { verifyToken } = require('../middleware/auth');
const prisma = new PrismaClient();
const router = express.Router();

// Get current user's notifications ONLY
router.get('/', verifyToken, async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.id },   // ✅ STRICT — only this user
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    res.json(notifications);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/count', verifyToken, async (req, res) => {
  try {
    const count = await prisma.notification.count({
      where: { userId: req.user.id, isRead: false },
    });
    res.json({ count });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.put('/:id/read', verifyToken, async (req, res) => {
  try {
    const n = await prisma.notification.update({
      where: { id: req.params.id },
      data: { isRead: true },
    });
    res.json(n);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.put('/read-all', verifyToken, async (req, res) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user.id, isRead: false },
      data: { isRead: true },
    });
    res.json({ message: 'All marked as read' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.delete('/:id', verifyToken, async (req, res) => {
  try {
    await prisma.notification.delete({ where: { id: req.params.id } });
    res.json({ message: 'Deleted' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;