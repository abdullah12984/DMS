const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { verifyToken } = require('../middleware/auth');
const prisma = new PrismaClient();
const router = express.Router();

// Get comments for a task
router.get('/task/:taskId', verifyToken, async (req, res) => {
  try {
    const comments = await prisma.comment.findMany({
      where: { taskId: req.params.taskId },
      include: { user: { select: { id: true, name: true, role: true } } },
      orderBy: { createdAt: 'asc' },
    });
    res.json(comments);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Create comment
router.post('/', verifyToken, async (req, res) => {
  try {
    const { content, taskId } = req.body;
    if (!content || !taskId) return res.status(400).json({ error: 'content and taskId required' });

    const comment = await prisma.comment.create({
      data: {
        content,
        taskId,
        userId: req.user.id,
      },
      include: { user: { select: { id: true, name: true, role: true } } },
    });

    // Notify assignee (if not the commenter)
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { assignee: { select: { id: true } } },
    });

    if (task?.assigneeId && task.assigneeId !== req.user.id) {
      await prisma.notification.create({
        data: {
          userId: task.assigneeId,
          title: '💬 New Comment',
          message: `${req.user.name}: ${content.slice(0, 60)}${content.length > 60 ? '...' : ''}`,
          type: 'task',
          link: `/intern/tasks/${taskId}`,
        },
      });
    }

    res.status(201).json(comment);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Delete comment (only author or super admin)
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const comment = await prisma.comment.findUnique({ where: { id: req.params.id } });
    if (!comment) return res.status(404).json({ error: 'Comment not found' });

    if (comment.userId !== req.user.id && req.user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await prisma.comment.delete({ where: { id: req.params.id } });
    res.json({ message: 'Comment deleted' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;