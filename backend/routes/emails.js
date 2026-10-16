// const express = require('express');
// const { PrismaClient } = require('@prisma/client');
// const { verifyToken, requireRole } = require('../middleware/auth');
// const { logAction } = require('../middleware/audit');
// const { decrypt } = require('../utils/crypto');
// const { sendUserMail, sendSystemMail } = require('../utils/mailer');
// const prisma = new PrismaClient();
// const router = express.Router();

// const autoCategorize = (subject, body, from) => {
//   const text = `${subject} ${body} ${from}`.toLowerCase();
//   if (text.match(/meeting|call|schedul|calendar|invite|zoom|meet\.google|teams/i)) return 'Meetings';
//   if (text.match(/proposal|lead|client|opportunit|interested|quote|follow.?up|deal|contract/i)) return 'Leads';
//   if (text.match(/unsubscribe|winner|prize|click here|free money|lottery|spam/i)) return 'Junk';
//   return 'Work';
// };

// // GET ALL
// router.get('/', verifyToken, requireRole('SUPER_ADMIN'), async (req, res) => {
//   try {
//     const { category, search, unread } = req.query;
//     const where = {};
//     if (category && category !== 'all') where.category = category;
//     if (unread === 'true') where.isRead = false;
//     if (search) {
//       where.OR = [
//         { from: { contains: search, mode: 'insensitive' } },
//         { subject: { contains: search, mode: 'insensitive' } },
//         { body: { contains: search, mode: 'insensitive' } },
//       ];
//     }
//     const emails = await prisma.email.findMany({ where, orderBy: { createdAt: 'desc' } });
//     res.json(emails);
//   } catch (e) {
//     res.status(500).json({ error: e.message });
//   }
// });

// // COUNTS
// router.get('/stats/counts', verifyToken, requireRole('SUPER_ADMIN'), async (req, res) => {
//   try {
//     const [all, work, leads, meetings, junk, unread] = await Promise.all([
//       prisma.email.count(),
//       prisma.email.count({ where: { category: 'Work' } }),
//       prisma.email.count({ where: { category: 'Leads' } }),
//       prisma.email.count({ where: { category: 'Meetings' } }),
//       prisma.email.count({ where: { category: 'Junk' } }),
//       prisma.email.count({ where: { isRead: false } }),
//     ]);
//     res.json({ all, Work: work, Leads: leads, Meetings: meetings, Junk: junk, unread });
//   } catch (e) {
//     res.status(500).json({ error: e.message });
//   }
// });

// // TEMPLATES
// router.get('/templates/all', verifyToken, async (req, res) => {
//   try {
//     const templates = await prisma.emailTemplate.findMany({ orderBy: { createdAt: 'desc' } });
//     res.json(templates);
//   } catch (e) {
//     res.status(500).json({ error: e.message });
//   }
// });

// router.post('/templates', verifyToken, requireRole('SUPER_ADMIN'), async (req, res) => {
//   try {
//     const template = await prisma.emailTemplate.create({ data: req.body });
//     res.status(201).json(template);
//   } catch (e) {
//     res.status(500).json({ error: e.message });
//   }
// });

// router.delete('/templates/:id', verifyToken, requireRole('SUPER_ADMIN'), async (req, res) => {
//   try {
//     await prisma.emailTemplate.delete({ where: { id: req.params.id } });
//     res.json({ message: 'Template deleted' });
//   } catch (e) {
//     res.status(500).json({ error: e.message });
//   }
// });

// // GET SINGLE
// router.get('/:id', verifyToken, requireRole('SUPER_ADMIN'), async (req, res) => {
//   try {
//     const email = await prisma.email.findUnique({ where: { id: req.params.id } });
//     if (!email) return res.status(404).json({ error: 'Email not found' });
//     res.json(email);
//   } catch (e) {
//     res.status(500).json({ error: e.message });
//   }
// });

// // ✅ SEND EMAIL (uses connected user email if available)
// router.post('/', verifyToken, requireRole('SUPER_ADMIN'), async (req, res) => {
//   try {
//     const { to, subject, body, category, leadId, projectId, meetingId } = req.body;

//     const user = await prisma.user.findUnique({ where: { id: req.user.id } });
//     if (!user) return res.status(404).json({ error: 'User not found' });

//     const finalCategory = category || autoCategorize(subject, body, user.email || '');
//     let sendResult = null;
//     let sendError = null;
//     let senderEmail;

//     if (user.emailConnected && user.emailUser && user.emailPass) {
//       // Send as user
//       senderEmail = user.emailUser;
//       try {
//         const password = decrypt(user.emailPass);
//         sendResult = await sendUserMail({
//           userEmail: user.emailUser,
//           userPass: password,
//           userHost: user.emailHost,
//           userPort: user.emailPort,
//           userName: user.name,
//           to,
//           subject,
//           text: body,
//         });
//         console.log(`📤 [${user.emailUser}] → ${to}`);
//       } catch (err) {
//         sendError = err.message;
//         console.error(`❌ User send failed:`, err.message);
//       }
//     } else {
//       // Fallback: system email
//       senderEmail = process.env.SMTP_USER;
//       try {
//         sendResult = await sendSystemMail({ to, subject, text: body });
//         console.log(`📤 [system] → ${to}`);
//       } catch (err) {
//         sendError = err.message;
//         console.error('❌ System send failed:', err.message);
//       }
//     }

//     const email = await prisma.email.create({
//       data: {
//         from: senderEmail,
//         to,
//         subject,
//         body,
//         category: finalCategory,
//         leadId: leadId || null,
//         projectId: projectId || null,
//         meetingId: meetingId || null,
//       },
//     });

//     await logAction(req.user, 'Sent email', `${subject} → ${to}`, 'info');

//     if (sendError) {
//       return res.status(200).json({
//         ...email,
//         deliveryStatus: 'saved_only',
//         warning: sendError,
//       });
//     }

//     res.status(201).json({
//       ...email,
//       deliveryStatus: 'sent',
//       messageId: sendResult.messageId,
//     });
//   } catch (e) {
//     console.error('Send error:', e);
//     res.status(500).json({ error: e.message });
//   }
// });

// // RECEIVE (simulate incoming)
// router.post('/receive', verifyToken, requireRole('SUPER_ADMIN'), async (req, res) => {
//   try {
//     const { from, subject, body } = req.body;
//     const category = autoCategorize(subject, body, from);

//     const email = await prisma.email.create({
//       data: {
//         from,
//         to: process.env.SMTP_USER || 'superadmin@dms.com',
//         subject,
//         body,
//         category,
//         isRead: false,
//       },
//     });

//     let createdLead = null;
//     if (category === 'Leads') {
//       const emailDomain = from.split('@')[1]?.split('.')[0] || 'Unknown';
//       const companyName = emailDomain.charAt(0).toUpperCase() + emailDomain.slice(1);
//       createdLead = await prisma.lead.create({
//         data: {
//           companyName,
//           contactName: from.split('@')[0],
//           email: from,
//           description: subject,
//           status: 'New Lead',
//         },
//       });
//     }

//     // Notify ONLY Super Admins
// const superAdmins = await prisma.user.findMany({
//      where: { role: 'SUPER_ADMIN', isActive: true },
//      select: { id: true },
// });

// for (const sa of superAdmins) {
//   await prisma.notification.create({
//     data: {
//       userId: sa.id,   // ✅ Specific user
//       title: `📧 New ${category} Email`,
//       message: `${from}: ${subject.slice(0, 50)}`,
//       type: 'info',
//       link: '/superadmin/emails',
//     },
//   });
// }

//     res.status(201).json({ email, lead: createdLead });
//   } catch (e) {
//     res.status(500).json({ error: e.message });
//   }
// });

// // MARK READ
// router.put('/:id/read', verifyToken, async (req, res) => {
//   try {
//     const { isRead } = req.body;
//     const email = await prisma.email.update({
//       where: { id: req.params.id },
//       data: { isRead: isRead !== undefined ? isRead : true },
//     });
//     res.json(email);
//   } catch (e) {
//     res.status(500).json({ error: e.message });
//   }
// });

// // STAR
// router.put('/:id/star', verifyToken, requireRole('SUPER_ADMIN'), async (req, res) => {
//   try {
//     const { isStarred } = req.body;
//     const email = await prisma.email.update({
//       where: { id: req.params.id },
//       data: { isStarred },
//     });
//     res.json(email);
//   } catch (e) {
//     res.status(500).json({ error: e.message });
//   }
// });

// // CATEGORY
// router.put('/:id/category', verifyToken, requireRole('SUPER_ADMIN'), async (req, res) => {
//   try {
//     const { category } = req.body;
//     const email = await prisma.email.update({
//       where: { id: req.params.id },
//       data: { category },
//     });
//     res.json(email);
//   } catch (e) {
//     res.status(500).json({ error: e.message });
//   }
// });

// // DELETE
// router.delete('/:id', verifyToken, requireRole('SUPER_ADMIN'), async (req, res) => {
//   try {
//     await prisma.email.delete({ where: { id: req.params.id } });
//     res.json({ message: 'Email deleted' });
//   } catch (e) {
//     res.status(500).json({ error: e.message });
//   }
// });

// module.exports = router;



const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { verifyToken, requireRole } = require('../middleware/auth');
const { logAction } = require('../middleware/audit');
const { decrypt } = require('../utils/crypto');
const { sendUserMail, sendSystemMail } = require('../utils/mailer');
const { fetchUserEmails } = require('../utils/imap');
const prisma = new PrismaClient();
const router = express.Router();

const autoCategorize = (subject, body, from) => {
  const text = `${subject} ${body} ${from}`.toLowerCase();
  if (text.match(/meeting|call|schedul|calendar|invite|zoom|meet\.google|teams/i)) return 'Meetings';
  if (text.match(/proposal|lead|client|opportunit|interested|quote|follow.?up|deal|contract/i)) return 'Leads';
  if (text.match(/unsubscribe|winner|prize|click here|free money|lottery|spam/i)) return 'Junk';
  return 'Work';
};

// GET ALL
router.get('/', verifyToken, requireRole('SUPER_ADMIN'), async (req, res) => {
  try {
    const { category, search, unread } = req.query;
    const where = {};
    if (category && category !== 'all') where.category = category;
    if (unread === 'true') where.isRead = false;
    if (search) {
      where.OR = [
        { from: { contains: search, mode: 'insensitive' } },
        { subject: { contains: search, mode: 'insensitive' } },
        { body: { contains: search, mode: 'insensitive' } },
      ];
    }
    const emails = await prisma.email.findMany({ where, orderBy: { createdAt: 'desc' } });
    res.json(emails);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// COUNTS
router.get('/stats/counts', verifyToken, requireRole('SUPER_ADMIN'), async (req, res) => {
  try {
    const [all, work, leads, meetings, junk, unread] = await Promise.all([
      prisma.email.count(),
      prisma.email.count({ where: { category: 'Work' } }),
      prisma.email.count({ where: { category: 'Leads' } }),
      prisma.email.count({ where: { category: 'Meetings' } }),
      prisma.email.count({ where: { category: 'Junk' } }),
      prisma.email.count({ where: { isRead: false } }),
    ]);
    res.json({ all, Work: work, Leads: leads, Meetings: meetings, Junk: junk, unread });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ✅ MANUAL FETCH — Refresh Inbox button
// Placed BEFORE /:id to avoid route conflicts
router.post('/fetch-now', verifyToken, requireRole('SUPER_ADMIN'), async (req, res) => {
  try {
    const result = await fetchUserEmails(req.user.id);
    await logAction(req.user, 'Manual email fetch', `${result.fetched} emails`, 'info');

    res.json({
      message: `✅ Fetched ${result.fetched} new email${result.fetched !== 1 ? 's' : ''}${result.leadsCreated > 0 ? ` (${result.leadsCreated} new lead${result.leadsCreated !== 1 ? 's' : ''})` : ''}`,
      ...result,
    });
  } catch (e) {
    console.error('Manual fetch failed:', e.message);
    res.status(500).json({ error: e.message });
  }
});

// TEMPLATES
router.get('/templates/all', verifyToken, async (req, res) => {
  try {
    const templates = await prisma.emailTemplate.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(templates);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/templates', verifyToken, requireRole('SUPER_ADMIN'), async (req, res) => {
  try {
    const template = await prisma.emailTemplate.create({ data: req.body });
    res.status(201).json(template);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.delete('/templates/:id', verifyToken, requireRole('SUPER_ADMIN'), async (req, res) => {
  try {
    await prisma.emailTemplate.delete({ where: { id: req.params.id } });
    res.json({ message: 'Template deleted' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET SINGLE
router.get('/:id', verifyToken, requireRole('SUPER_ADMIN'), async (req, res) => {
  try {
    const email = await prisma.email.findUnique({ where: { id: req.params.id } });
    if (!email) return res.status(404).json({ error: 'Email not found' });
    res.json(email);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// SEND EMAIL
router.post('/', verifyToken, requireRole('SUPER_ADMIN'), async (req, res) => {
  try {
    const { to, subject, body, category, leadId, projectId, meetingId } = req.body;

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const finalCategory = category || autoCategorize(subject, body, user.email || '');
    let sendResult = null;
    let sendError = null;
    let senderEmail;

    if (user.emailConnected && user.emailUser && user.emailPass) {
      senderEmail = user.emailUser;
      try {
        const password = decrypt(user.emailPass);
        sendResult = await sendUserMail({
          userEmail: user.emailUser,
          userPass: password,
          userHost: user.emailHost,
          userPort: user.emailPort,
          userName: user.name,
          to,
          subject,
          text: body,
        });
        console.log(`📤 [${user.emailUser}] → ${to}`);
      } catch (err) {
        sendError = err.message;
        console.error(`❌ User send failed:`, err.message);
      }
    } else {
      senderEmail = process.env.SMTP_USER;
      try {
        sendResult = await sendSystemMail({ to, subject, text: body });
        console.log(`📤 [system] → ${to}`);
      } catch (err) {
        sendError = err.message;
        console.error('❌ System send failed:', err.message);
      }
    }

    const email = await prisma.email.create({
      data: {
        from: senderEmail,
        to,
        subject,
        body,
        category: finalCategory,
        leadId: leadId || null,
        projectId: projectId || null,
        meetingId: meetingId || null,
      },
    });

    await logAction(req.user, 'Sent email', `${subject} → ${to}`, 'info');

    if (sendError) {
      return res.status(200).json({
        ...email,
        deliveryStatus: 'saved_only',
        warning: sendError,
      });
    }

    res.status(201).json({
      ...email,
      deliveryStatus: 'sent',
      messageId: sendResult.messageId,
    });
  } catch (e) {
    console.error('Send error:', e);
    res.status(500).json({ error: e.message });
  }
});

// RECEIVE (simulate incoming)
router.post('/receive', verifyToken, requireRole('SUPER_ADMIN'), async (req, res) => {
  try {
    const { from, subject, body } = req.body;
    const category = autoCategorize(subject, body, from);

    const email = await prisma.email.create({
      data: {
        from,
        to: process.env.SMTP_USER || 'superadmin@dms.com',
        subject,
        body,
        category,
        isRead: false,
      },
    });

    let createdLead = null;
    if (category === 'Leads') {
      const emailDomain = from.split('@')[1]?.split('.')[0] || 'Unknown';
      const companyName = emailDomain.charAt(0).toUpperCase() + emailDomain.slice(1);
      createdLead = await prisma.lead.create({
        data: {
          companyName,
          contactName: from.split('@')[0],
          email: from,
          description: subject,
          status: 'New Lead',
        },
      });
    }

    const superAdmins = await prisma.user.findMany({
      where: { role: 'SUPER_ADMIN', isActive: true },
      select: { id: true },
    });

    for (const sa of superAdmins) {
      await prisma.notification.create({
        data: {
          userId: sa.id,
          title: `📧 New ${category} Email`,
          message: `${from}: ${subject.slice(0, 50)}`,
          type: 'info',
          link: '/superadmin/emails',
        },
      });
    }

    res.status(201).json({ email, lead: createdLead });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// MARK READ
router.put('/:id/read', verifyToken, async (req, res) => {
  try {
    const { isRead } = req.body;
    const email = await prisma.email.update({
      where: { id: req.params.id },
      data: { isRead: isRead !== undefined ? isRead : true },
    });
    res.json(email);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// STAR
router.put('/:id/star', verifyToken, requireRole('SUPER_ADMIN'), async (req, res) => {
  try {
    const { isStarred } = req.body;
    const email = await prisma.email.update({
      where: { id: req.params.id },
      data: { isStarred },
    });
    res.json(email);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// CATEGORY
router.put('/:id/category', verifyToken, requireRole('SUPER_ADMIN'), async (req, res) => {
  try {
    const { category } = req.body;
    const email = await prisma.email.update({
      where: { id: req.params.id },
      data: { category },
    });
    res.json(email);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// DELETE
router.delete('/:id', verifyToken, requireRole('SUPER_ADMIN'), async (req, res) => {
  try {
    await prisma.email.delete({ where: { id: req.params.id } });
    res.json({ message: 'Email deleted' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;