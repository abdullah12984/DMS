const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { verifyToken } = require('../middleware/auth');
const prisma = new PrismaClient();
const router = express.Router();

// Weekly + Monthly progress data
router.get('/progress', verifyToken, async (req, res) => {
  try {
    // Last 8 weeks
    const weeks = [];
    for (let i = 7; i >= 0; i--) {
      const end = new Date();
      end.setDate(end.getDate() - i * 7);
      const start = new Date(end);
      start.setDate(start.getDate() - 7);

      const [created, completed] = await Promise.all([
        prisma.task.count({
          where: { createdAt: { gte: start, lte: end } },
        }),
        prisma.task.count({
          where: {
            status: 'Completed',
            completedAt: { gte: start, lte: end },
          },
        }),
      ]);

      weeks.push({
        label: `W${8 - i}`,
        created,
        completed,
      });
    }

    // Current month data
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [tasksThisMonth, completedThisMonth, projectsThisMonth] = await Promise.all([
      prisma.task.count({ where: { createdAt: { gte: monthStart } } }),
      prisma.task.count({
        where: { status: 'Completed', completedAt: { gte: monthStart } },
      }),
      prisma.project.count({ where: { createdAt: { gte: monthStart } } }),
    ]);

    // Task status breakdown (for pie chart)
    const [notStarted, inProgress, onHold, completed, cancelled] = await Promise.all([
      prisma.task.count({ where: { status: 'Not Started' } }),
      prisma.task.count({ where: { status: 'In Progress' } }),
      prisma.task.count({ where: { status: 'On Hold' } }),
      prisma.task.count({ where: { status: 'Completed' } }),
      prisma.task.count({ where: { status: 'Cancelled' } }),
    ]);

    // Project type breakdown (for pie chart)
    const [active, internal, training, product] = await Promise.all([
      prisma.project.count({ where: { type: 'Active' } }),
      prisma.project.count({ where: { type: 'Internal' } }),
      prisma.project.count({ where: { type: 'Training' } }),
      prisma.project.count({ where: { type: 'Product' } }),
    ]);

    res.json({
      weekly: weeks,
      monthly: {
        label: now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        tasksCreated: tasksThisMonth,
        tasksCompleted: completedThisMonth,
        projectsCreated: projectsThisMonth,
      },
      taskStatus: [
        { name: 'Not Started', value: notStarted, color: '#94a3b8' },
        { name: 'In Progress', value: inProgress, color: '#3b82f6' },
        { name: 'On Hold', value: onHold, color: '#f59e0b' },
        { name: 'Completed', value: completed, color: '#10b981' },
        { name: 'Cancelled', value: cancelled, color: '#ef4444' },
      ].filter((item) => item.value > 0),
      projectTypes: [
        { name: 'Active', value: active, color: '#10b981' },
        { name: 'Internal', value: internal, color: '#3b82f6' },
        { name: 'Training', value: training, color: '#f59e0b' },
        { name: 'Product', value: product, color: '#8b5cf6' },
      ].filter((item) => item.value > 0),
    });
  } catch (e) {
    console.error('Analytics error:', e);
    res.status(500).json({ error: e.message });
  }
});


// Task completion per user
router.get('/user-tasks', verifyToken, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        role: true,
        tasks: {
          select: { status: true },
        },
      },
    });

    const stats = users
      .map((u) => {
        const total = u.tasks.length;
        const completed = u.tasks.filter((t) => t.status === 'Completed').length;
        const inProgress = u.tasks.filter((t) => t.status === 'In Progress').length;
        const pending = u.tasks.filter(
          (t) => t.status === 'Not Started' || t.status === 'On Hold'
        ).length;

        return {
          id: u.id,
          name: u.name.split(' ')[0],  // first name for cleaner chart
          fullName: u.name,
          role: u.role,
          total,
          completed,
          inProgress,
          pending,
        };
      })
      .filter((u) => u.total > 0)  // only show users with tasks
      .sort((a, b) => b.completed - a.completed);  // most completions first

    res.json(stats);
  } catch (e) {
    console.error('User tasks error:', e);
    res.status(500).json({ error: e.message });
  }
});
module.exports = router;