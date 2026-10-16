// const express = require('express');
// const { PrismaClient } = require('@prisma/client');
// const { verifyToken, requireRole } = require('../middleware/auth');
// const { logAction } = require('../middleware/audit');
// const prisma = new PrismaClient();
// const router = express.Router();

// router.get('/', verifyToken, async (req, res) => {
//   try {
//     const projects = await prisma.project.findMany({
//       include: {
//         manager: { select: { id: true, name: true, email: true } },
//         team: { select: { id: true, name: true, role: true, email: true } },
//         tasks: true,
//       },
//       orderBy: { createdAt: 'desc' },
//     });
//     res.json(projects);
//   } catch (e) {
//     res.status(500).json({ error: e.message });
//   }
// });

// router.get('/:id', verifyToken, async (req, res) => {
//   try {
//     const project = await prisma.project.findUnique({
//       where: { id: req.params.id },
//       include: {
//         manager: { select: { id: true, name: true, email: true } },
//         tasks: {
//           include: { assignee: { select: { id: true, name: true } } },
//         },
//       },
//     });
//     if (!project) return res.status(404).json({ error: 'Project not found' });
//     res.json(project);
//   } catch (e) {
//     res.status(500).json({ error: e.message });
//   }
// });

// router.post('/', verifyToken, requireRole('SUPER_ADMIN', 'ADMIN'), async (req, res) => {
//   try {
//     const {
//       name, description, client, type, status, progress,
//       startDate, endDate, managerId, priority, teamIds,
//     } = req.body;

//     const project = await prisma.project.create({
//       data: {
//         name, description, client,
//         type: type || 'Internal',
//         status: status || 'Not Started',
//         progress: progress || 0,
//         priority: priority || 'Medium',
//         startDate: startDate ? new Date(startDate) : null,
//         endDate: endDate ? new Date(endDate) : null,
//         managerId: managerId || null,
//         team: teamIds ? { connect: teamIds.map(id => ({ id })) } : undefined,
//       },
//       include: {
//         manager: { select: { id: true, name: true } },
//         team: { select: { id: true, name: true, role: true } },
//       },
//     });

//     await logAction(req.user, 'Created project', name, 'success');

//     // Notify manager
//     if (managerId) {
//       await prisma.notification.create({
//         data: {
//           userId: managerId,
//           title: '📁 New Project Assigned',
//           message: `You are the manager for: ${name}`,
//           type: 'project',
//           link: `/manager/projects/${project.id}`,
//         },
//       });
//     }

//     // Notify team members
//     if (teamIds && teamIds.length > 0) {
//       for (const memberId of teamIds) {
//         if (memberId === managerId) continue;
//         await prisma.notification.create({
//           data: {
//             userId: memberId,
//             title: '👥 Added to Project Team',
//             message: `You were added to: ${name}`,
//             type: 'project',
//             link: `/intern/tasks`,
//           },
//         });
//       }
//     }

//     res.status(201).json(project);
//   } catch (e) {
//     res.status(500).json({ error: e.message });
//   }
// });

// router.put('/:id', verifyToken, requireRole('SUPER_ADMIN', 'ADMIN', 'MANAGER'), async (req, res) => {
//   try {
//     const { teamIds, ...rest } = req.body;

//     const data = { ...rest };
//     if (data.startDate) data.startDate = new Date(data.startDate);
//     if (data.endDate) data.endDate = new Date(data.endDate);

//     if (teamIds !== undefined) {
//       data.team = { set: teamIds.map(id => ({ id })) };
//     }

//     const project = await prisma.project.update({
//       where: { id: req.params.id },
//       data,
//       include: {
//         manager: { select: { id: true, name: true } },
//         team: { select: { id: true, name: true, role: true } },
//       },
//     });

//     await logAction(req.user, 'Updated project', project.name, 'purple');
//     res.json(project);
//   } catch (e) {
//     res.status(500).json({ error: e.message });
//   }
// });

// router.delete('/:id', verifyToken, requireRole('SUPER_ADMIN'), async (req, res) => {
//   try {
//     const project = await prisma.project.delete({ where: { id: req.params.id } });
//     await logAction(req.user, 'Deleted project', project.name, 'danger');
//     res.json({ message: 'Project deleted' });
//   } catch (e) {
//     res.status(500).json({ error: e.message });
//   }
// });

// module.exports = router;




const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { verifyToken, requireRole } = require('../middleware/auth');
const { logAction } = require('../middleware/audit');
const prisma = new PrismaClient();
const router = express.Router();

// ============ GET ALL ============
router.get('/', verifyToken, async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      include: {
        manager: { select: { id: true, name: true, email: true } },
        team: { select: { id: true, name: true, role: true, email: true } },
        tasks: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(projects);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ============ GET SINGLE ============
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: req.params.id },
      include: {
        manager: { select: { id: true, name: true, email: true } },
        team: { select: { id: true, name: true, role: true, email: true } },
        tasks: {
          include: { assignee: { select: { id: true, name: true } } },
        },
      },
    });
    if (!project) return res.status(404).json({ error: 'Project not found' });
    res.json(project);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ============ CREATE PROJECT (+ AUTO-CREATE ENGAGEMENT) ============
router.post('/', verifyToken, requireRole('SUPER_ADMIN', 'ADMIN'), async (req, res) => {
  try {
    const {
      name, description, client, type, status, progress,
      startDate, endDate, managerId, priority, teamIds,
    } = req.body;

    // 1. Create project
    const project = await prisma.project.create({
      data: {
        name, description, client,
        type: type || 'Internal',
        status: status || 'Not Started',
        progress: progress || 0,
        priority: priority || 'Medium',
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        managerId: managerId || null,
        team: teamIds ? { connect: teamIds.map((id) => ({ id })) } : undefined,
      },
      include: {
        manager: { select: { id: true, name: true } },
        team: { select: { id: true, name: true, role: true } },
      },
    });

    await logAction(req.user, 'Created project', name, 'success');

    // 2. AUTO-CREATE ENGAGEMENT SHEET
       try {
      await prisma.engagement.create({
        data: {
          name: `${name} — Engagement`,
          client: client || 'Internal',
          type: type || 'Internal',
          projectId: project.id,
          managerId: managerId || null,
          startDate: startDate ? new Date(startDate) : null,
          endDate: endDate ? new Date(endDate) : null,
          progress: progress || 0,
          status: status || 'Not Started',
          scope: description || `Development work for ${name}`,
          objectives: `Deliver ${name} on schedule\nEnsure quality standards\nMeet client expectations`,
          resources: `${type || 'Internal'} project resources\nAssigned team and manager\nStandard tooling`,
          notes: `Auto-generated engagement sheet for project "${name}"`,
        },
      });
      console.log(`📋 Engagement auto-created for: ${name}`);
    } catch (err) {
      console.error('Engagement auto-create failed:', err.message);
    }

    // 3. Notify manager
    if (managerId) {
      await prisma.notification.create({
        data: {
          userId: managerId,
          title: '📁 New Project Assigned',
          message: `You are the manager for: ${name}`,
          type: 'project',
          link: `/manager/projects/${project.id}`,
        },
      });
    }

    // 4. Notify team members
    if (teamIds && teamIds.length > 0) {
      for (const memberId of teamIds) {
        if (memberId === managerId) continue;
        await prisma.notification.create({
          data: {
            userId: memberId,
            title: '👥 Added to Project Team',
            message: `You were added to: ${name}`,
            type: 'project',
            link: `/intern/tasks`,
          },
        });
      }
    }

    res.status(201).json(project);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ============ UPDATE PROJECT (+ SYNC ENGAGEMENT) ============
router.put('/:id', verifyToken, requireRole('SUPER_ADMIN', 'ADMIN', 'MANAGER'), async (req, res) => {
  try {
    const { teamIds, ...rest } = req.body;

    const data = { ...rest };
    if (data.startDate) data.startDate = new Date(data.startDate);
    if (data.endDate) data.endDate = new Date(data.endDate);

    if (teamIds !== undefined) {
      data.team = { set: teamIds.map((id) => ({ id })) };
    }

    const project = await prisma.project.update({
      where: { id: req.params.id },
      data,
      include: {
        manager: { select: { id: true, name: true } },
        team: { select: { id: true, name: true, role: true } },
      },
    });

    await logAction(req.user, 'Updated project', project.name, 'purple');

    // SYNC ENGAGEMENT
    try {
      await prisma.engagement.updateMany({
        where: { projectId: project.id },
        data: {
          name: `${project.name} — Engagement`,
          client: project.client || 'Internal',
          type: project.type,
          managerId: project.managerId,
          startDate: project.startDate,
          endDate: project.endDate,
          progress: project.progress,
          status: project.status,
        },
      });
      console.log(`📋 Engagement synced for: ${project.name}`);
    } catch (err) {
      console.error('Engagement sync failed:', err.message);
    }

    res.json(project);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ============ DELETE PROJECT (+ DELETE ENGAGEMENT) ============
router.delete('/:id', verifyToken, requireRole('SUPER_ADMIN'), async (req, res) => {
  try {
    // DELETE RELATED ENGAGEMENT FIRST
    try {
      const result = await prisma.engagement.deleteMany({
        where: { projectId: req.params.id },
      });
      if (result.count > 0) {
        console.log(`📋 Deleted ${result.count} engagement(s) for project`);
      }
    } catch (err) {
      console.error('Engagement delete failed:', err.message);
    }

    // Now delete the project
    const project = await prisma.project.delete({ where: { id: req.params.id } });
    await logAction(req.user, 'Deleted project', project.name, 'danger');

    res.json({ message: 'Project deleted' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;