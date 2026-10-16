const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { verifyToken, requireRole } = require('../middleware/auth');
const { logAction } = require('../middleware/audit');
const prisma = new PrismaClient();
const router = express.Router();

// Get all users
router.get('/', verifyToken, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true, name: true, email: true, role: true,
        isActive: true, department: true, phone: true, createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(users);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Change role
router.put('/:id/role', verifyToken, requireRole('SUPER_ADMIN'), async (req, res) => {
  try {
    const { role } = req.body;
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { role },
    });
    await logAction(req.user, 'Changed role', `${user.name} → ${role}`, 'warning');
    res.json(user);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Update profile
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { name, phone, department } = req.body;
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { name, phone, department },
    });
    res.json(user);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Delete user
router.delete('/:id', verifyToken, requireRole('SUPER_ADMIN'), async (req, res) => {
  try {
    const user = await prisma.user.delete({ where: { id: req.params.id } });
    await logAction(req.user, 'Deleted user', user.email, 'danger');
    res.json({ message: 'User deleted' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;