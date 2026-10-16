const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { verifyToken, requireRole } = require('../middleware/auth');
const { logAction } = require('../middleware/audit');
const prisma = new PrismaClient();
const router = express.Router();

// All tasks
router.get('/', verifyToken, async (req, res) => {
  try {
    const tasks = await prisma.task.findMany({
      include: {
        assignee: { select: { id: true, name: true, email: true } },
        project: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(tasks);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// My tasks
router.get('/my', verifyToken, async (req, res) => {
  try {
    const tasks = await prisma.task.findMany({
      where: { assigneeId: req.user.id },
      include: {
        project: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(tasks);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Task detail
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const task = await prisma.task.findUnique({
      where: { id: req.params.id },
      include: {
        assignee: { select: { id: true, name: true, email: true } },
        project: { select: { id: true, name: true } },
      },
    });
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json(task);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Create
router.post('/', verifyToken, requireRole('SUPER_ADMIN', 'ADMIN', 'MANAGER'), async (req, res) => {
  try {
    const { title, description, status, priority, deadline, startDate, assigneeId, projectId } = req.body;
    const task = await prisma.task.create({
      data: {
        title, description,
        status: status || 'Not Started',
        priority: priority || 'Medium',
        deadline: deadline ? new Date(deadline) : null,
        startDate: startDate ? new Date(startDate) : null,
        assigneeId: assigneeId || null,
        projectId: projectId || null,
      },
      include: { assignee: true, project: true },
    });

    await logAction(req.user, 'Created task', title, 'success');

    if (assigneeId) {
      await prisma.notification.create({
        data: {
          userId: assigneeId,
          title: 'New Task Assigned',
          message: `"${title}" assigned to you`,
          type: 'task',
          link: '/intern/tasks',
        },
      });
    }

    res.status(201).json(task);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Update
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const data = { ...req.body };
    if (data.completedAt === undefined && data.status === 'Completed') {
      data.completedAt = new Date();
      data.progress = 100;
    }
    const task = await prisma.task.update({
      where: { id: req.params.id },
      data,
    });
    await logAction(req.user, 'Updated task', task.title, 'purple');
    res.json(task);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Delete
router.delete('/:id', verifyToken, requireRole('SUPER_ADMIN', 'ADMIN'), async (req, res) => {
  try {
    const task = await prisma.task.delete({ where: { id: req.params.id } });
    await logAction(req.user, 'Deleted task', task.title, 'danger');
    res.json({ message: 'Task deleted' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;