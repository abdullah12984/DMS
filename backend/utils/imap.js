// // const { ImapFlow } = require('imapflow');
// // const { simpleParser } = require('mailparser');
// // const { PrismaClient } = require('@prisma/client');
// // const { decrypt } = require('./crypto');
// // const prisma = new PrismaClient();

// // // Categorize email based on keywords
// // const autoCategorize = (subject, body, from) => {
// //   const text = `${subject} ${body} ${from}`.toLowerCase();
// //   if (text.match(/meeting|call|schedul|calendar|invite|zoom|meet\.google|teams/i)) return 'Meetings';
// //   if (text.match(/proposal|lead|client|opportunit|interested|quote|follow.?up|deal|contract/i)) return 'Leads';
// //   if (text.match(/unsubscribe|winner|prize|click here|free money|lottery|spam/i)) return 'Junk';
// //   return 'Work';
// // };

// // let pollingInterval = null;

// // // Start IMAP polling for a user
// // const startIMAPForUser = async (user) => {
// //   if (!user.emailConnected || !user.emailUser || !user.emailPass) {
// //     return;
// //   }

// //   const password = decrypt(user.emailPass);
// //   if (!password) return;

// //   console.log(`🔌 Starting IMAP for ${user.emailUser}...`);

// //   const client = new ImapFlow({
// //     host: user.emailHost || 'imap.gmail.com',
// //     port: 993,
// //     secure: true,
// //     auth: {
// //       user: user.emailUser,
// //       pass: password,
// //     },
// //     logger: false,
// //   });

// //   try {
// //     await client.connect();
// //     console.log(`✅ IMAP connected: ${user.emailUser}`);

// //     const fetchEmails = async () => {
// //       if (!client.usable) return;

// //       let lock;
// //       try {
// //         lock = await client.getMailboxLock('INBOX');
// //         try {
// //           // Fetch UNSEEN emails
// //        const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // last 7 days

// //         for await (const msg of client.fetch(
// //        { since },
// //          { envelope: true, source: true, uid: true }
// //           )) {
// //             try {
// //               const parsed = await simpleParser(msg.source);
// //               const from = parsed.from?.value?.[0]?.address || 'unknown';
// //               const subject = parsed.subject || '(no subject)';
// //               const body = (parsed.text || parsed.html || '').slice(0, 5000);

// //               // Skip if already in DB
// //               const existing = await prisma.email.findFirst({
// //                 where: { from, subject },
// //               });
// //               if (existing) {
// //                 // await client.messageFlagsAdd({ uid: msg.uid }, ['\\Seen'], { uid: true });
// //                 continue;
// //               }

// //               const category = autoCategorize(subject, body, from);

// //               // Save email
// //               await prisma.email.create({
// //                 data: {
// //                   from,
// //                   to: user.emailUser,
// //                   subject,
// //                   body,
// //                   category,
// //                   isRead: false,
// //                 },
// //               });

// //               console.log(`📧 [${user.emailUser}] New: ${subject.slice(0, 40)} → ${category}`);

// //               // Auto-create lead
// //               if (category === 'Leads') {
// //                 const domain = from.split('@')[1]?.split('.')[0] || 'Unknown';
// //                 const companyName = domain.charAt(0).toUpperCase() + domain.slice(1);

// //                 const leadExists = await prisma.lead.findFirst({ where: { email: from } });
// //                 if (!leadExists) {
// //                   await prisma.lead.create({
// //                     data: {
// //                       companyName,
// //                       contactName: from.split('@')[0],
// //                       email: from,
// //                       description: subject,
// //                       status: 'New Lead',
// //                     },
// //                   });
// //                   console.log(`📞 Lead created: ${companyName}`);
// //                 }
// //               }

// //               // Notify user
// //               await prisma.notification.create({
// //                 data: {
// //                   userId: user.id,
// //                   title: `📧 New ${category} Email`,
// //                   message: `${from}: ${subject.slice(0, 50)}`,
// //                   type: 'info',
// //                   link: '/superadmin/emails',
// //                 },
// //               });

// //               // Mark as seen
// //               // await client.messageFlagsAdd({ uid: msg.uid }, ['\\Seen'], { uid: true });
// //             } catch (parseErr) {
// //               console.error('Parse error:', parseErr.message);
// //             }
// //           }
// //         } finally {
// //           lock.release();
// //         }
// //       } catch (err) {
// //         console.error('IMAP fetch error:', err.message);
// //       }
// //     };

// //     // Initial fetch
// //     await fetchEmails();

// //     // Poll every 60 seconds
// //     pollingInterval = setInterval(fetchEmails, 60 * 1000);
// //   } catch (err) {
// //     console.error(`❌ IMAP error for ${user.emailUser}:`, err.message);
// //   }
// // };

// // // Start IMAP for all users with connected emails
// // const startIMAP = async () => {
// //   try {
// //     const users = await prisma.user.findMany({
// //       where: { emailConnected: true },
// //     });

// //     if (users.length === 0) {
// //       console.log('⚠️  No users with connected email — IMAP not started');
// //       return;
// //     }

// //     for (const user of users) {
// //       await startIMAPForUser(user);
// //     }
// //   } catch (err) {
// //     console.error('IMAP startup error:', err.message);
// //   }
// // };

// // module.exports = { startIMAP, startIMAPForUser };





// const { ImapFlow } = require('imapflow');
// const { simpleParser } = require('mailparser');
// const { PrismaClient } = require('@prisma/client');
// const { decrypt } = require('./crypto');
// const prisma = new PrismaClient();

// const autoCategorize = (subject, body, from) => {
//   const text = `${subject} ${body} ${from}`.toLowerCase();
//   if (text.match(/meeting|call|schedul|calendar|invite|zoom|meet\.google|teams/i)) return 'Meetings';
//   if (text.match(/proposal|lead|client|opportunit|interested|quote|follow.?up|deal|contract/i)) return 'Leads';
//   if (text.match(/unsubscribe|winner|prize|click here|free money|lottery|spam/i)) return 'Junk';
//   return 'Work';
// };

// // Track connected clients
// const clients = {};

// const startIMAPForUser = async (user) => {
//   if (!user.emailConnected || !user.emailUser || !user.emailPass) return;

//   const password = decrypt(user.emailPass);
//   if (!password) return;

//   console.log(`🔌 Starting IMAP for ${user.emailUser}...`);

//   const client = new ImapFlow({
//     host: 'imap.gmail.com',
//     port: 993,
//     secure: true,
//     auth: { user: user.emailUser, pass: password },
//     logger: false,
//     // ⬇️ CRITICAL: prevents crashes on connection reset
//     tls: { rejectUnauthorized: false },
//   });

//   // ⬇️ ATTACH ERROR HANDLER BEFORE CONNECT — this prevents crashes
//   client.on('error', (err) => {
//     console.error(`⚠️  IMAP error for ${user.emailUser}:`, err.message);
//     // Don't throw — just log and let reconnect happen
//   });

//   client.on('close', () => {
//     console.log(`🔒 IMAP closed for ${user.emailUser} — will retry in 60s`);
//     // Schedule reconnect
//     setTimeout(() => {
//       delete clients[user.id];
//       startIMAPForUser(user).catch(() => {});
//     }, 60000);
//   });

//   try {
//     await client.connect();
//     console.log(`✅ IMAP connected: ${user.emailUser}`);
//     clients[user.id] = client;

//     const fetchEmails = async () => {
//       if (!client.usable) return;

//       let lock;
//       try {
//         lock = await client.getMailboxLock('INBOX');
//         try {
//           const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

//           for await (const msg of client.fetch(
//             { since },
//             { envelope: true, source: true, uid: true }
//           )) {
//             try {
//               const parsed = await simpleParser(msg.source);
//               const from = parsed.from?.value?.[0]?.address || 'unknown';
//               const subject = parsed.subject || '(no subject)';
//               const body = (parsed.text || parsed.html || '').slice(0, 5000);

//               const existing = await prisma.email.findFirst({
//                 where: { from, subject },
//               });
//               if (existing) continue;

//               const category = autoCategorize(subject, body, from);

//               await prisma.email.create({
//                 data: {
//                   from,
//                   to: user.emailUser,
//                   subject,
//                   body,
//                   category,
//                   isRead: false,
//                 },
//               });

//               console.log(`📧 [${user.emailUser}] ${subject.slice(0, 40)} → ${category}`);

//               if (category === 'Leads') {
//                 const domain = from.split('@')[1]?.split('.')[0] || 'Unknown';
//                 const companyName = domain.charAt(0).toUpperCase() + domain.slice(1);

//                 const leadExists = await prisma.lead.findFirst({ where: { email: from } });
//                 if (!leadExists) {
//                   await prisma.lead.create({
//                     data: {
//                       companyName,
//                       contactName: from.split('@')[0],
//                       email: from,
//                       description: subject,
//                       status: 'New Lead',
//                     },
//                   });
//                   console.log(`📞 Lead created: ${companyName}`);
//                 }
//               }

//               await prisma.notification.create({
//                 data: {
//                   userId: user.id,
//                   title: `📧 New ${category} Email`,
//                   message: `${from}: ${subject.slice(0, 50)}`,
//                   type: 'info',
//                   link: '/superadmin/emails',
//                 },
//               });
//             } catch (parseErr) {
//               // Ignore individual email parse errors
//             }
//           }
//         } finally {
//           try { lock.release(); } catch {}
//         }
//       } catch (err) {
//         // Don't crash — just log
//         console.error(`IMAP fetch error for ${user.emailUser}:`, err.message);
//       }
//     };

//     // Initial fetch
//     await fetchEmails();

//     // Poll every 60 seconds
//     setInterval(() => {
//       if (clients[user.id]?.usable) {
//         fetchEmails().catch(() => {});
//       }
//     }, 60 * 1000);
//   } catch (err) {
//     console.error(`❌ IMAP connection failed for ${user.emailUser}:`, err.message);
//     // Don't crash — retry in 60s
//     setTimeout(() => startIMAPForUser(user).catch(() => {}), 60000);
//   }
// };

// const startIMAP = async () => {
//   try {
//     const users = await prisma.user.findMany({
//       where: { emailConnected: true },
//     });

//     if (users.length === 0) {
//       console.log('⚠️  No users with connected email — IMAP not started');
//       return;
//     }

//     for (const user of users) {
//       // Don't await — run in background so one failure doesn't block others
//       startIMAPForUser(user).catch(() => {});
//     }
//   } catch (err) {
//     console.error('IMAP startup error:', err.message);
//   }
// };

// module.exports = { startIMAP, startIMAPForUser };




const { ImapFlow } = require('imapflow');
const { simpleParser } = require('mailparser');
const { PrismaClient } = require('@prisma/client');
const { decrypt } = require('./crypto');
const prisma = new PrismaClient();

const autoCategorize = (subject, body, from) => {
  const text = `${subject} ${body} ${from}`.toLowerCase();
  if (text.match(/meeting|call|schedul|calendar|invite|zoom|meet\.google|teams/i)) return 'Meetings';
  if (text.match(/proposal|lead|client|opportunit|interested|quote|follow.?up|deal|contract/i)) return 'Leads';
  if (text.match(/unsubscribe|winner|prize|click here|free money|lottery|spam/i)) return 'Junk';
  return 'Work';
};

// ============================================================
// ONE-TIME FETCH — used by manual Refresh button (Vercel safe)
// ============================================================
const fetchUserEmails = async (userId) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error('User not found');
  if (!user.emailConnected || !user.emailUser || !user.emailPass) {
    throw new Error('Email not connected. Connect your email in Settings first.');
  }

  const password = decrypt(user.emailPass);
  if (!password) throw new Error('Failed to decrypt email credentials');

  console.log(`🔌 Manual IMAP fetch for ${user.emailUser}...`);

  const client = new ImapFlow({
    host: 'imap.gmail.com',
    port: 993,
    secure: true,
    auth: { user: user.emailUser, pass: password },
    logger: false,
    tls: { rejectUnauthorized: false },
  });

  let fetchedCount = 0;
  let leadCount = 0;

  try {
    await client.connect();

    const lock = await client.getMailboxLock('INBOX');
    try {
      const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // last 7 days

      for await (const msg of client.fetch(
        { since },
        { envelope: true, source: true, uid: true }
      )) {
        try {
          const parsed = await simpleParser(msg.source);
          const from = parsed.from?.value?.[0]?.address || 'unknown';
          const subject = parsed.subject || '(no subject)';
          const body = (parsed.text || parsed.html || '').slice(0, 5000);

          const existing = await prisma.email.findFirst({
            where: { from, subject },
          });
          if (existing) continue;

          const category = autoCategorize(subject, body, from);

          await prisma.email.create({
            data: {
              from,
              to: user.emailUser,
              subject,
              body,
              category,
              isRead: false,
            },
          });
          fetchedCount++;

          console.log(`📧 [${user.emailUser}] ${subject.slice(0, 40)} → ${category}`);

          // Auto-create lead
          if (category === 'Leads') {
            const domain = from.split('@')[1]?.split('.')[0] || 'Unknown';
            const companyName = domain.charAt(0).toUpperCase() + domain.slice(1);

            const leadExists = await prisma.lead.findFirst({ where: { email: from } });
            if (!leadExists) {
              await prisma.lead.create({
                data: {
                  companyName,
                  contactName: from.split('@')[0],
                  email: from,
                  description: subject,
                  status: 'New Lead',
                },
              });
              leadCount++;
              console.log(`📞 Lead created: ${companyName}`);
            }
          }

          // Notify user
          await prisma.notification.create({
            data: {
              userId: user.id,
              title: `📧 New ${category} Email`,
              message: `${from}: ${subject.slice(0, 50)}`,
              type: 'info',
              link: '/superadmin/emails',
            },
          });
        } catch (parseErr) {
          // Skip individual parse errors
          console.error('Parse error:', parseErr.message);
        }
      }
    } finally {
      try { lock.release(); } catch {}
    }
  } finally {
    try { await client.logout(); } catch {}
  }

  console.log(`✅ Manual fetch complete: ${fetchedCount} emails, ${leadCount} leads`);

  return {
    fetched: fetchedCount,
    leadsCreated: leadCount,
    checked: 'last 7 days',
    email: user.emailUser,
  };
};

// ============================================================
// BACKGROUND POLLING — for local development only
// (Vercel will NOT run this, disabled in prod)
// ============================================================
const startIMAPForUser = async (user) => {
  if (!user.emailConnected || !user.emailUser || !user.emailPass) return;

  const password = decrypt(user.emailPass);
  if (!password) return;

  console.log(`🔌 Starting background IMAP for ${user.emailUser}...`);

  const client = new ImapFlow({
    host: 'imap.gmail.com',
    port: 993,
    secure: true,
    auth: { user: user.emailUser, pass: password },
    logger: false,
    tls: { rejectUnauthorized: false },
  });

  client.on('error', (err) => {
    console.error(`⚠️  IMAP error for ${user.emailUser}:`, err.message);
  });

  try {
    await client.connect();
    console.log(`✅ Background IMAP connected: ${user.emailUser}`);

    setInterval(async () => {
      try {
        await fetchUserEmails(user.id);
      } catch (e) {
        console.error('Background fetch error:', e.message);
      }
    }, 5 * 60 * 1000); // every 5 minutes
  } catch (err) {
    console.error(`❌ IMAP connect failed:`, err.message);
  }
};

const startIMAP = async () => {
  // ⚠️ Skip on Vercel — background processes are not supported
  if (process.env.VERCEL) {
    console.log('⏭️  Skipping background IMAP (running on Vercel — use manual refresh)');
    return;
  }

  try {
    const users = await prisma.user.findMany({ where: { emailConnected: true } });
    if (users.length === 0) {
      console.log('⚠️  No users with connected email');
      return;
    }
    for (const user of users) {
      startIMAPForUser(user).catch(() => {});
    }
  } catch (err) {
    console.error('IMAP startup error:', err.message);
  }
};

module.exports = { startIMAP, startIMAPForUser, fetchUserEmails };