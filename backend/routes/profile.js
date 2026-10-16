const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { verifyToken } = require('../middleware/auth');
const prisma = new PrismaClient();
const router = express.Router();

// Get current user with real stats
router.get('/', verifyToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        department: true,
        
        createdAt: true,
        _count: {
          select: {
            tasks: true,          // assigned tasks
            projects: true,       // projects managing
            teamProjects: true,   // team memberships
          },
        },
      },
    });

    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json(user);
  } catch (e) {
    console.error('Profile GET error:', e);
    res.status(500).json({ error: e.message });
  }
});

// Update own profile
router.put('/', verifyToken, async (req, res) => {
  try {
    const { name, phone, department, email } = req.body;

    const data = {};
    if (name !== undefined) data.name = name;
    if (phone !== undefined) data.phone = phone;
    if (department !== undefined) data.department = department;

    // Email change — check uniqueness
    if (email !== undefined && email !== req.user.email) {
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        return res.status(400).json({ error: 'Email already in use' });
      }
      data.email = email;
    }

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data,
      select: {
        id: true, name: true, email: true, role: true,
        phone: true, department: true,
      },
    });

    res.json({ message: '✅ Profile updated', user });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;