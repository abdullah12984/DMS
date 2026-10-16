const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { verifyToken } = require('../middleware/auth');
const prisma = new PrismaClient();
const router = express.Router();

router.get('/dashboard', verifyToken, async (req, res) => {
  try {
    const [
      totalUsers, pendingUsers, totalProjects, activeProjects,
      completedProjects, totalTasks, totalLeads, unreadNotifications,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isActive: false } }),
      prisma.project.count(),
      prisma.project.count({ where: { status: 'In Progress' } }),
      prisma.project.count({ where: { status: 'Completed' } }),
      prisma.task.count(),
      prisma.lead.count(),
      prisma.notification.count({ where: { isRead: false } }),
    ]);

    const availableUsers = await prisma.user.count({
      where: {
        isActive: true,
        tasks: { none: { status: { not: 'Completed' } } },
      },
    });

    res.json({
      totalUsers,
      pendingUsers,
      totalProjects,
      activeProjects,
      completedProjects,
      totalTasks,
      totalLeads,
      availableUsers,
      busyUsers: totalUsers - availableUsers,
      unreadNotifications,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/progress', verifyToken, async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      select: { id: true, name: true, progress: true, status: true, type: true },
    });

    const byStatus = {
      'Not Started': 0,
      'In Progress': 0,
      'On Hold': 0,
      'Completed': 0,
      'Cancelled': 0,
    };
    projects.forEach(p => {
      if (byStatus[p.status] !== undefined) byStatus[p.status]++;
    });

    const byType = { Active: 0, Internal: 0, Training: 0, Product: 0 };
    projects.forEach(p => {
      if (byType[p.type] !== undefined) byType[p.type]++;
    });

    const avgProgress = projects.length > 0
      ? Math.round(projects.reduce((s, p) => s + p.progress, 0) / projects.length)
      : 0;

    res.json({
      total: projects.length,
      avgProgress,
      byStatus,
      byType,
      projects: projects.slice(0, 10),
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/resources', verifyToken, async (req, res) => {
  try {
    // Only MANAGER, ADMIN, INTERN can be "resources" (they get assigned work)
    const users = await prisma.user.findMany({
      where: {
        isActive: true,
        role: { in: ['MANAGER', 'ADMIN', 'INTERN'] },   // ← excludes SUPER_ADMIN, VIEWER
      },
      select: {
        id: true,
        name: true,
        role: true,
        tasks: {
          where: { status: { not: 'Completed' } },
          select: { id: true },
        },
      },
    });

    const resources = users.map(u => ({
      id: u.id,
      name: u.name,
      role: u.role,
      activeTasks: u.tasks.length,
      status: u.tasks.length > 0 ? 'Busy' : 'Available',
      utilization: Math.min(100, u.tasks.length * 20),
    }));

    res.json({
      total: users.length,
      available: resources.filter(r => r.status === 'Available').length,
      busy: resources.filter(r => r.status === 'Busy').length,
      resources,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;