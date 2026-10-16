const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { verifyToken, requireRole } = require('../middleware/auth');
const { logAction } = require('../middleware/audit');
const prisma = new PrismaClient();
const router = express.Router();

router.get('/', verifyToken, async (req, res) => {
  try {
    const leads = await prisma.lead.findMany({
      include: { assignedTo: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(leads);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/:id', verifyToken, async (req, res) => {
  try {
    const lead = await prisma.lead.findUnique({
      where: { id: req.params.id },
      include: { assignedTo: { select: { id: true, name: true } } },
    });
    if (!lead) return res.status(404).json({ error: 'Lead not found' });
    res.json(lead);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/', verifyToken, requireRole('SUPER_ADMIN'), async (req, res) => {
  try {
    const { companyName, contactName, email, phone, source, description, status, nextFollowUp, assignedToId } = req.body;
    const lead = await prisma.lead.create({
      data: {
        companyName, contactName, email, phone, source, description,
        status: status || 'New Lead',
        nextFollowUp: nextFollowUp ? new Date(nextFollowUp) : null,
        assignedToId: assignedToId || null,
      },
    });

    await logAction(req.user, 'Created lead', companyName, 'success');
    await prisma.notification.create({
      data: {
        title: 'New Lead Added',
        message: `${companyName} was added`,
        type: 'lead',
      },
    });

    res.status(201).json(lead);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.put('/:id', verifyToken, requireRole('SUPER_ADMIN'), async (req, res) => {
  try {
    const lead = await prisma.lead.update({
      where: { id: req.params.id },
      data: req.body,
    });
    await logAction(req.user, 'Updated lead', lead.companyName, 'purple');
    res.json(lead);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.put('/:id/status', verifyToken, requireRole('SUPER_ADMIN'), async (req, res) => {
  try {
    const { status } = req.body;
    const lead = await prisma.lead.update({
      where: { id: req.params.id },
      data: { status, lastContact: new Date() },
    });
    await logAction(req.user, 'Updated lead status', `${lead.companyName} → ${status}`, 'warning');

    if (status === 'Won') {
      await prisma.notification.create({
        data: {
          title: '🎉 Lead Won!',
          message: `${lead.companyName} — create the project!`,
          type: 'lead',
        },
      });
    }
    res.json(lead);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;