// const express = require('express');
// const { PrismaClient } = require('@prisma/client');
// const { verifyToken, requireRole } = require('../middleware/auth');
// const { pushMeetingToGoogle, updateGoogleEvent, deleteGoogleEvent } = require('../utils/googleCalendar');
// const { sendSystemMail, sendUserMail } = require('../utils/mailer');
// const prisma = new PrismaClient();
// const router = express.Router();
// const { decrypt } = require('../utils/crypto');
// // ========== HELPERS ==========

// const buildGoogleCalendarLink = (meeting) => {
//   const start = new Date(meeting.date);
//   if (meeting.time) {
//     const [h, m] = meeting.time.split(':').map(Number);
//     start.setHours(h, m, 0, 0);
//   }
//   const end = new Date(start.getTime() + 60 * 60 * 1000);
//   const fmt = (d) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

//   const params = new URLSearchParams({
//     action: 'TEMPLATE',
//     text: meeting.title || 'Meeting',
//     dates: `${fmt(start)}/${fmt(end)}`,
//     details: (meeting.description || '') +
//              (meeting.link ? `\n\nJoin: ${meeting.link}` : '') +
//              `\n\n— Scheduled from DMS Portal`,
//     location: meeting.location || '',
//     ctz: 'Asia/Karachi',
//   });

//   return `https://calendar.google.com/calendar/render?${params.toString()}`;
// };

// // Format meeting email
// const formatMeetingEmail = (meeting, meetLink, recipientName) => {
//   const dateStr = new Date(meeting.date).toLocaleDateString('en-US', {
//     weekday: 'long',
//     year: 'numeric',
//     month: 'long',
//     day: 'numeric',
//   });

//   const timeStr = meeting.time || 'TBD';

//   return {
//     subject: `📅 Meeting Invitation: ${meeting.title}`,
//     text: `Hi ${recipientName || 'there'},

// You're invited to a meeting.

// Meeting: ${meeting.title}
// Date: ${dateStr}
// Time: ${timeStr}
// ${meeting.location ? `Location: ${meeting.location}\n` : ''}${meetLink ? `\n📹 Join Google Meet:\n${meetLink}\n` : ''}${meeting.description ? `\nDescription:\n${meeting.description}\n` : ''}
// Looking forward to seeing you there!

// — DMS Portal`,
//     html: `
//       <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 24px; border-radius: 12px;">
//         <div style="background: linear-gradient(135deg, #3b82f6, #8b5cf6); padding: 24px; border-radius: 12px 12px 0 0; text-align: center;">
//           <h1 style="color: white; margin: 0; font-size: 24px;">📅 Meeting Invitation</h1>
//         </div>
//         <div style="background: white; padding: 32px; border-radius: 0 0 12px 12px;">
//           <p style="color: #334155; font-size: 16px;">Hi <strong>${recipientName || 'there'}</strong>,</p>
//           <p style="color: #334155; font-size: 16px;">You're invited to a meeting:</p>
//           <h2 style="color: #1e293b; margin: 20px 0; font-size: 20px;">${meeting.title}</h2>
//           <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
//             <tr>
//               <td style="padding: 8px 0; color: #64748b; font-size: 14px;">📅 Date</td>
//               <td style="padding: 8px 0; color: #1e293b; font-size: 14px; font-weight: 600;">${dateStr}</td>
//             </tr>
//             <tr>
//               <td style="padding: 8px 0; color: #64748b; font-size: 14px;">⏰ Time</td>
//               <td style="padding: 8px 0; color: #1e293b; font-size: 14px; font-weight: 600;">${timeStr} (PKT)</td>
//             </tr>
//             ${meeting.location ? `<tr><td style="padding: 8px 0; color: #64748b; font-size: 14px;">📍 Location</td><td style="padding: 8px 0; color: #1e293b; font-size: 14px; font-weight: 600;">${meeting.location}</td></tr>` : ''}
//           </table>
//           ${meetLink ? `
//             <div style="text-align: center; margin: 28px 0;">
//               <a href="${meetLink}" style="display: inline-block; background: linear-gradient(135deg, #3b82f6, #2563eb); color: white; padding: 14px 32px; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 15px;">
//                 📹 Join Google Meet
//               </a>
//               <p style="color: #94a3b8; font-size: 12px; margin-top: 12px;">Or copy this link: <a href="${meetLink}" style="color: #3b82f6;">${meetLink}</a></p>
//             </div>
//           ` : ''}
//           ${meeting.description ? `<div style="background: #f1f5f9; padding: 16px; border-radius: 8px; margin-top: 20px;"><p style="margin: 0; color: #475569; font-size: 14px;"><strong>Description:</strong><br>${meeting.description}</p></div>` : ''}
//           <p style="color: #94a3b8; font-size: 12px; margin-top: 32px; text-align: center;">Sent from DMS Portal</p>
//         </div>
//       </div>
//     `,
//   };
// };

// // Send email to one recipient
// const sendMeetingEmail = async (to, recipientName, meeting, meetLink) => {
//   try {
//     const emailContent = formatMeetingEmail(meeting, meetLink, recipientName);
//     await sendSystemMail({
//       to,
//       subject: emailContent.subject,
//       text: emailContent.text,
//       html: emailContent.html,
//     });
//     console.log(`📧 Meeting invite sent to ${to}`);
//   } catch (err) {
//     console.error(`Email to ${to} failed:`, err.message);
//   }
// };

// // ========== ROUTES ==========

// // GET ALL
// router.get('/', verifyToken, async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const isSuperAdmin = req.user.role === 'SUPER_ADMIN';

//     // Users see:
//     // 1. Meetings they created (Super Admin only)
//     // 2. Meetings where they're a participant
//     const meetings = await prisma.meeting.findMany({
//       where: {
//         OR: [
//           isSuperAdmin ? { createdById: userId } : {},
//           { participants: { some: { id: userId } } },
//         ].filter(obj => Object.keys(obj).length > 0),
//       },
//       include: { participants: { select: { id: true, name: true, email: true } } },
//       orderBy: { date: 'asc' },
//     });

//     const enriched = meetings.map((m) => ({
//       ...m,
//       googleCalendarLink: buildGoogleCalendarLink(m),
//     }));

//     res.json(enriched);
//   } catch (e) {
//     res.status(500).json({ error: e.message });
//   }
// });

// // GET SINGLE
// router.get('/:id', verifyToken, async (req, res) => {
//   try {
//     const meeting = await prisma.meeting.findUnique({
//       where: { id: req.params.id },
//       include: { participants: { select: { id: true, name: true, email: true } } },
//     });
//     if (!meeting) return res.status(404).json({ error: 'Meeting not found' });

//     // Access check
//     const userId = req.user.id;
//     const isSuperAdmin = req.user.role === 'SUPER_ADMIN';
//     const isCreator = meeting.createdById === userId;
//     const isParticipant = meeting.participants.some(p => p.id === userId);

//     if (!isSuperAdmin && !isCreator && !isParticipant) {
//       return res.status(403).json({ error: 'Access denied' });
//     }

//     res.json({
//       ...meeting,
//       googleCalendarLink: buildGoogleCalendarLink(meeting),
//     });
//   } catch (e) {
//     res.status(500).json({ error: e.message });
//   }
// });
// // CREATE
// router.post('/', verifyToken, requireRole('SUPER_ADMIN'), async (req, res) => {
//   try {
//     const {
//       title, description, date, time, location, client,
//       projectId, leadId, participants, externalEmails,
//     } = req.body;

//     const meeting = await prisma.meeting.create({
//       data: {
//         title, description, time, location, client,
//         date: new Date(date),
//         projectId: projectId || null,
//         leadId: leadId || null,
//         createdById: req.user.id,
//         participants: participants ? { connect: participants.map(id => ({ id })) } : undefined,
//       },
//       include: { participants: true },
//     });

//     let meetLink = null;

//     // Push to Google Calendar (uses Super Admin's connected Google account)
//     const hostUser = await prisma.user.findUnique({ where: { id: req.user.id } });

//     try {
//       if (hostUser?.googleCalendarConnected && hostUser.googleCalendarRefreshToken) {
//         const gEvent = await pushMeetingToGoogle(hostUser.googleCalendarRefreshToken, meeting);
//         meetLink = gEvent.hangoutLink || gEvent.conferenceData?.entryPoints?.[0]?.uri || null;

//         await prisma.meeting.update({
//           where: { id: meeting.id },
//           data: { googleEventId: gEvent.id, link: meetLink || meeting.link },
//         });
//         meeting.googleEventId = gEvent.id;
//         meeting.link = meetLink || meeting.link;
//       }
//     } catch (err) {
//       console.error('Google push failed:', err.message);
//     }

//     // ===== SEND EMAILS =====

//     // 1. To DMS users (use notificationEmail if set, else login email)
//     if (participants && participants.length > 0) {
//       const participantUsers = await prisma.user.findMany({
//         where: { id: { in: participants } },
//         select: { id: true, name: true, email: true, notificationEmail: true },
//       });

//       for (const p of participantUsers) {
//         const toEmail = p.notificationEmail || p.email;
//         await sendMeetingEmail(toEmail, p.name, meeting, meetLink, hostUser);

//         // In-app notification
//         await prisma.notification.create({
//           data: {
//             userId: p.id,
//             title: '📅 New Meeting Invitation',
//             message: `${title} — ${new Date(date).toLocaleDateString()}`,
//             type: 'meeting',
//             link: '/viewer/dashboard',
//           },
//         });
//       }
//     }

//     // 2. To external emails (not DMS users)
//     if (externalEmails && Array.isArray(externalEmails) && externalEmails.length > 0) {
//       for (const email of externalEmails) {
//         if (!email || !email.trim()) continue;
//         await sendMeetingEmail(email.trim(), 'there', meeting, meetLink, hostUser);
//       }
//     }

//     // 3. Host confirmation
//     try {
//       if (hostUser?.emailConnected && hostUser.emailUser && hostUser.emailPass) {
//         const password = decrypt(hostUser.emailPass);
//         const hostContent = formatMeetingEmail(meeting, meetLink, hostUser.name);
//         await sendUserMail({
//           userEmail: hostUser.emailUser,
//           userPass: password,
//           userHost: hostUser.emailHost,
//           userPort: hostUser.emailPort,
//           userName: hostUser.name,
//           to: hostUser.emailUser,
//           subject: `✅ Meeting Confirmed: ${meeting.title}`,
//           text: `Meeting "${meeting.title}" created. Invites sent to ${(participants?.length || 0) + (externalEmails?.length || 0)} recipient(s).`,
//           html: hostContent.html,
//         });
//       }
//     } catch (err) {
//       console.error('Host email failed:', err.message);
//     }

//     res.status(201).json({ ...meeting, googleCalendarLink: buildGoogleCalendarLink(meeting) });
//   } catch (e) {
//     console.error(e);
//     res.status(500).json({ error: e.message });
//   }
// });

// // UPDATE
// router.put('/:id', verifyToken, requireRole('SUPER_ADMIN'), async (req, res) => {
//   try {
//     const meeting = await prisma.meeting.update({
//       where: { id: req.params.id },
//       data: req.body,
//     });

//     try {
//       const updater = await prisma.user.findUnique({ where: { id: req.user.id } });
//       const existing = await prisma.meeting.findUnique({ where: { id: req.params.id } });
//       if (updater?.googleCalendarConnected && existing?.googleEventId) {
//         await updateGoogleEvent(
//           updater.googleCalendarRefreshToken,
//           existing.googleEventId,
//           meeting
//         );
//         console.log(`📅 Updated Google Calendar: ${meeting.title}`);
//       }
//     } catch (err) {
//       console.error('Google update failed:', err.message);
//     }

//     res.json({
//       ...meeting,
//       googleCalendarLink: buildGoogleCalendarLink(meeting),
//     });
//   } catch (e) {
//     res.status(500).json({ error: e.message });
//   }
// });

// // DELETE
// router.delete('/:id', verifyToken, requireRole('SUPER_ADMIN'), async (req, res) => {
//   try {
//     try {
//       const deleter = await prisma.user.findUnique({ where: { id: req.user.id } });
//       const existing = await prisma.meeting.findUnique({ where: { id: req.params.id } });
//       if (deleter?.googleCalendarConnected && existing?.googleEventId) {
//         await deleteGoogleEvent(deleter.googleCalendarRefreshToken, existing.googleEventId);
//         console.log(`📅 Deleted from Google Calendar: ${existing.title}`);
//       }
//     } catch (err) {
//       console.error('Google delete failed:', err.message);
//     }

//     await prisma.meeting.delete({ where: { id: req.params.id } });
//     res.json({ message: 'Meeting deleted' });
//   } catch (e) {
//     res.status(500).json({ error: e.message });
//   }
// });

// module.exports = router;













const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { verifyToken, requireRole } = require('../middleware/auth');
const { pushMeetingToGoogle, updateGoogleEvent, deleteGoogleEvent } = require('../utils/googleCalendar');
const { sendSystemMail, sendUserMail } = require('../utils/mailer');
const { decrypt } = require('../utils/crypto');
const prisma = new PrismaClient();
const router = express.Router();

// ========== HELPERS ==========

const buildGoogleCalendarLink = (meeting) => {
  const start = new Date(meeting.date);
  if (meeting.time) {
    const [h, m] = meeting.time.split(':').map(Number);
    start.setHours(h, m, 0, 0);
  }
  const end = new Date(start.getTime() + 60 * 60 * 1000);
  const fmt = (d) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: meeting.title || 'Meeting',
    dates: `${fmt(start)}/${fmt(end)}`,
    details: (meeting.description || '') +
             (meeting.link ? `\n\nJoin: ${meeting.link}` : '') +
             `\n\n— Scheduled from DMS Portal`,
    location: meeting.location || '',
    ctz: 'Asia/Karachi',
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
};

const formatMeetingEmail = (meeting, meetLink, recipientName) => {
  const dateStr = new Date(meeting.date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const timeStr = meeting.time || 'TBD';

  return {
    subject: `📅 Meeting Invitation: ${meeting.title}`,
    text: `Hi ${recipientName || 'there'},

You're invited to a meeting.

Meeting: ${meeting.title}
Date: ${dateStr}
Time: ${timeStr}
${meeting.location ? `Location: ${meeting.location}\n` : ''}${meetLink ? `\n📹 Join Google Meet:\n${meetLink}\n` : ''}${meeting.description ? `\nDescription:\n${meeting.description}\n` : ''}
Looking forward to seeing you there!

— DMS Portal`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 24px; border-radius: 12px;">
        <div style="background: linear-gradient(135deg, #3b82f6, #8b5cf6); padding: 24px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">📅 Meeting Invitation</h1>
        </div>
        <div style="background: white; padding: 32px; border-radius: 0 0 12px 12px;">
          <p style="color: #334155; font-size: 16px;">Hi <strong>${recipientName || 'there'}</strong>,</p>
          <p style="color: #334155; font-size: 16px;">You're invited to a meeting:</p>
          <h2 style="color: #1e293b; margin: 20px 0; font-size: 20px;">${meeting.title}</h2>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-size: 14px;">📅 Date</td>
              <td style="padding: 8px 0; color: #1e293b; font-size: 14px; font-weight: 600;">${dateStr}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-size: 14px;">⏰ Time</td>
              <td style="padding: 8px 0; color: #1e293b; font-size: 14px; font-weight: 600;">${timeStr} (PKT)</td>
            </tr>
            ${meeting.location ? `<tr><td style="padding: 8px 0; color: #64748b; font-size: 14px;">📍 Location</td><td style="padding: 8px 0; color: #1e293b; font-size: 14px; font-weight: 600;">${meeting.location}</td></tr>` : ''}
          </table>
          ${meetLink ? `
            <div style="text-align: center; margin: 28px 0;">
              <a href="${meetLink}" style="display: inline-block; background: linear-gradient(135deg, #3b82f6, #2563eb); color: white; padding: 14px 32px; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 15px;">
                📹 Join Google Meet
              </a>
              <p style="color: #94a3b8; font-size: 12px; margin-top: 12px;">Or copy this link: <a href="${meetLink}" style="color: #3b82f6;">${meetLink}</a></p>
            </div>
          ` : ''}
          ${meeting.description ? `<div style="background: #f1f5f9; padding: 16px; border-radius: 8px; margin-top: 20px;"><p style="margin: 0; color: #475569; font-size: 14px;"><strong>Description:</strong><br>${meeting.description}</p></div>` : ''}
          <p style="color: #94a3b8; font-size: 12px; margin-top: 32px; text-align: center;">Sent from DMS Portal</p>
        </div>
      </div>
    `,
  };
};

const sendMeetingEmail = async (to, recipientName, meeting, meetLink) => {
  try {
    const emailContent = formatMeetingEmail(meeting, meetLink, recipientName);
    await sendSystemMail({
      to,
      subject: emailContent.subject,
      text: emailContent.text,
      html: emailContent.html,
    });
    console.log(`📧 Meeting invite sent to ${to}`);
  } catch (err) {
    console.error(`Email to ${to} failed:`, err.message);
  }
};

// ========== ROUTES ==========

// GET ALL — filtered by user
router.get('/', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const isSuperAdmin = req.user.role === 'SUPER_ADMIN';

    const meetings = await prisma.meeting.findMany({
      where: {
        OR: [
          isSuperAdmin ? { createdById: userId } : {},
          { participants: { some: { id: userId } } },
        ].filter(obj => Object.keys(obj).length > 0),
      },
      include: { participants: { select: { id: true, name: true, email: true } } },
      orderBy: { date: 'asc' },
    });

    const enriched = meetings.map((m) => ({
      ...m,
      googleCalendarLink: buildGoogleCalendarLink(m),
    }));

    res.json(enriched);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET SINGLE — access check
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const meeting = await prisma.meeting.findUnique({
      where: { id: req.params.id },
      include: { participants: { select: { id: true, name: true, email: true } } },
    });
    if (!meeting) return res.status(404).json({ error: 'Meeting not found' });

    const userId = req.user.id;
    const isSuperAdmin = req.user.role === 'SUPER_ADMIN';
    const isCreator = meeting.createdById === userId;
    const isParticipant = meeting.participants.some(p => p.id === userId);

    if (!isSuperAdmin && !isCreator && !isParticipant) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({
      ...meeting,
      googleCalendarLink: buildGoogleCalendarLink(meeting),
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// CREATE
router.post('/', verifyToken, requireRole('SUPER_ADMIN'), async (req, res) => {
  try {
    const {
      title, description, date, time, location, client,
      projectId, leadId, participants, externalEmails,
    } = req.body;

    const meeting = await prisma.meeting.create({
      data: {
        title, description, time, location, client,
        date: new Date(date),
        projectId: projectId || null,
        leadId: leadId || null,
        createdById: req.user.id,
        participants: participants ? { connect: participants.map(id => ({ id })) } : undefined,
      },
      include: { participants: true },
    });

    let meetLink = null;

    // Push to host's Google Calendar
    const hostUser = await prisma.user.findUnique({ where: { id: req.user.id } });

    try {
      if (hostUser?.googleCalendarConnected && hostUser.googleCalendarRefreshToken) {
        const gEvent = await pushMeetingToGoogle(hostUser.googleCalendarRefreshToken, meeting);
        meetLink = gEvent.hangoutLink || gEvent.conferenceData?.entryPoints?.[0]?.uri || null;

        await prisma.meeting.update({
          where: { id: meeting.id },
          data: { googleEventId: gEvent.id, link: meetLink || meeting.link },
        });
        meeting.googleEventId = gEvent.id;
        meeting.link = meetLink || meeting.link;
        console.log(`📅 Google Calendar event: ${meeting.title}`);
        if (meetLink) console.log(`📹 Meet link: ${meetLink}`);
      }
    } catch (err) {
      console.error('Google push failed:', err.message);
    }

    // ✅ PUSH TO ALL PARTICIPANTS' GOOGLE CALENDARS
    if (participants && participants.length > 0) {
      const participantsWithCal = await prisma.user.findMany({
        where: {
          id: { in: participants },
          googleCalendarConnected: true,
          googleCalendarRefreshToken: { not: null },
        },
        select: { id: true, name: true, googleCalendarRefreshToken: true },
      });

      for (const p of participantsWithCal) {
        if (p.id === req.user.id) continue; // skip host (already pushed)

        try {
          await pushMeetingToGoogle(p.googleCalendarRefreshToken, meeting);
          console.log(`📅 Pushed to ${p.name}'s Google Calendar`);
        } catch (err) {
          console.error(`📅 Failed for ${p.name}:`, err.message);
        }
      }
    }

    // ===== SEND EMAILS =====

    // 1. To DMS users
    if (participants && participants.length > 0) {
      const participantUsers = await prisma.user.findMany({
        where: { id: { in: participants } },
        select: { id: true, name: true, email: true, notificationEmail: true },
      });

      for (const p of participantUsers) {
        const toEmail = p.notificationEmail || p.email;
        await sendMeetingEmail(toEmail, p.name, meeting, meetLink);

        await prisma.notification.create({
          data: {
            userId: p.id,
            title: '📅 New Meeting Invitation',
            message: `${title} — ${new Date(date).toLocaleDateString()}`,
            type: 'meeting',
            link: '/superadmin/calendar',
          },
        });
      }
    }

    // 2. To external emails
    if (externalEmails && Array.isArray(externalEmails) && externalEmails.length > 0) {
      for (const email of externalEmails) {
        if (!email || !email.trim()) continue;
        await sendMeetingEmail(email.trim(), 'there', meeting, meetLink);
      }
    }

    // 3. Host confirmation
    try {
      if (hostUser?.emailConnected && hostUser.emailUser && hostUser.emailPass) {
        const password = decrypt(hostUser.emailPass);
        const hostContent = formatMeetingEmail(meeting, meetLink, hostUser.name);
        await sendUserMail({
          userEmail: hostUser.emailUser,
          userPass: password,
          userHost: hostUser.emailHost,
          userPort: hostUser.emailPort,
          userName: hostUser.name,
          to: hostUser.emailUser,
          subject: `✅ Meeting Confirmed: ${meeting.title}`,
          text: `Meeting "${meeting.title}" created. Invites sent to ${(participants?.length || 0) + (externalEmails?.length || 0)} recipient(s).`,
          html: hostContent.html,
        });
      }
    } catch (err) {
      console.error('Host email failed:', err.message);
    }

    res.status(201).json({ ...meeting, googleCalendarLink: buildGoogleCalendarLink(meeting) });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

// UPDATE
router.put('/:id', verifyToken, requireRole('SUPER_ADMIN'), async (req, res) => {
  try {
    const meeting = await prisma.meeting.update({
      where: { id: req.params.id },
      data: req.body,
    });

    try {
      const updater = await prisma.user.findUnique({ where: { id: req.user.id } });
      const existing = await prisma.meeting.findUnique({ where: { id: req.params.id } });
      if (updater?.googleCalendarConnected && existing?.googleEventId) {
        await updateGoogleEvent(
          updater.googleCalendarRefreshToken,
          existing.googleEventId,
          meeting
        );
        console.log(`📅 Updated Google Calendar: ${meeting.title}`);
      }
    } catch (err) {
      console.error('Google update failed:', err.message);
    }

    res.json({
      ...meeting,
      googleCalendarLink: buildGoogleCalendarLink(meeting),
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// DELETE
router.delete('/:id', verifyToken, requireRole('SUPER_ADMIN'), async (req, res) => {
  try {
    try {
      const deleter = await prisma.user.findUnique({ where: { id: req.user.id } });
      const existing = await prisma.meeting.findUnique({ where: { id: req.params.id } });
      if (deleter?.googleCalendarConnected && existing?.googleEventId) {
        await deleteGoogleEvent(deleter.googleCalendarRefreshToken, existing.googleEventId);
        console.log(`📅 Deleted from Google Calendar: ${existing.title}`);
      }
    } catch (err) {
      console.error('Google delete failed:', err.message);
    }

    await prisma.meeting.delete({ where: { id: req.params.id } });
    res.json({ message: 'Meeting deleted' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;