const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { verifyToken } = require('../middleware/auth');
const { logAction } = require('../middleware/audit');
const prisma = new PrismaClient();
const router = express.Router();

// GET all notes for a project
router.get('/project/:projectId', verifyToken, async (req, res) => {
  try {
    const notes = await prisma.projectNote.findMany({
      where: { projectId: req.params.projectId },
      include: {
        author: { select: { id: true, name: true, role: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(notes);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// CREATE note
router.post('/project/:projectId', verifyToken, async (req, res) => {
  try {
    const { content } = req.body;
    if (!content?.trim()) return res.status(400).json({ error: 'Content required' });

    const note = await prisma.projectNote.create({
      data: {
        content: content.trim(),
        projectId: req.params.projectId,
        authorId: req.user.id,
      },
      include: {
        author: { select: { id: true, name: true, role: true } },
      },
    });

    // Notify project manager + team
    try {
      const project = await prisma.project.findUnique({
        where: { id: req.params.projectId },
        select: {
          name: true, managerId: true, team: { select: { id: true } },
        },
      });

      const recipientIds = new Set();
      if (project?.managerId && project.managerId !== req.user.id) {
        recipientIds.add(project.managerId);
      }
      project?.team?.forEach(t => {
        if (t.id !== req.user.id) recipientIds.add(t.id);
      });

      for (const uid of recipientIds) {
        await prisma.notification.create({
          data: {
            userId: uid,
            title: '📝 New Project Note',
            message: `${req.user.name}: ${content.slice(0, 50)}${content.length > 50 ? '...' : ''}`,
            type: 'project',
            link: `/superadmin/projects/${req.params.projectId}`,
          },
        });
      }
    } catch (err) {
      console.error('Notify failed:', err.message);
    }

    await logAction(req.user, 'Added project note', note.projectId, 'info');

    res.status(201).json(note);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// UPDATE note (author or SA only)
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { content } = req.body;
    const existing = await prisma.projectNote.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: 'Note not found' });

    if (existing.authorId !== req.user.id && req.user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const note = await prisma.projectNote.update({
      where: { id: req.params.id },
      data: { content: content.trim() },
      include: {
        author: { select: { id: true, name: true, role: true } },
      },
    });

    res.json(note);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// DELETE note
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const existing = await prisma.projectNote.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: 'Note not found' });

    if (existing.authorId !== req.user.id && req.user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await prisma.projectNote.delete({ where: { id: req.params.id } });
    res.json({ message: 'Note deleted' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;