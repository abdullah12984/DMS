const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { verifyToken, requireRole } = require('../middleware/auth');
const prisma = new PrismaClient();
const router = express.Router();

router.get('/', verifyToken, async (req, res) => {
  try {
    const engagements = await prisma.engagement.findMany({
      include: { project: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(engagements);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/:id', verifyToken, async (req, res) => {
  try {
    const engagement = await prisma.engagement.findUnique({
      where: { id: req.params.id },
      include: { project: true },
    });
    if (!engagement) return res.status(404).json({ error: 'Engagement not found' });
    res.json(engagement);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/', verifyToken, requireRole('SUPER_ADMIN', 'ADMIN', 'MANAGER'), async (req, res) => {
  try {
    const engagement = await prisma.engagement.create({ data: req.body });
    res.status(201).json(engagement);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.put('/:id', verifyToken, requireRole('SUPER_ADMIN', 'ADMIN', 'MANAGER'), async (req, res) => {
  try {
    const engagement = await prisma.engagement.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(engagement);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;