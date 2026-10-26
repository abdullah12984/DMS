// const OpenAI = require('openai');
// const { PrismaClient } = require('@prisma/client');
// const prisma = new PrismaClient();

// const openai = new OpenAI({
//   apiKey: process.env.GROQ_API_KEY,
//   baseURL: 'https://api.groq.com/openai/v1',
// });

// // 🧠 The Master Function that handles BOTH Tasks and Multiple Leads
// const processEmailWithAI = async (subject, body, from) => {
//   const prompt = `
//     You are an AI assistant for a CRM. Analyze the following email.
//     Extract:
//     1. A main task and its subtasks.
//     2. Any potential leads (companies or contacts mentioned in the text).
    
//     Return ONLY a valid JSON object. Do not add markdown or text.
//     Format required:
//     {
//       "mainTask": "Title of the main task",
//       "deadline": "YYYY-MM-DD (if mentioned, else null)",
//       "priority": "High/Medium/Low",
//       "subtasks": ["subtask 1", "subtask 2"],
//       "leads": [
//         {
//           "companyName": "Company Name",
//           "contactName": "Person Name",
//           "email": "email@company.com (if found, else null)",
//           "description": "Context of the lead"
//         }
//       ]
//     }

//     If no leads are mentioned in the body, return an empty array for leads: [].

//     Email Sender: ${from}
//     Email Subject: ${subject}
//     Email Body: ${body}
//   `;

//   try {
//     const response = await openai.chat.completions.create({
//       messages: [
//         { role: 'system', content: 'You are a helpful assistant designed to output JSON.' },
//         { role: 'user', content: prompt }
//       ],
//             model: 'llama-3.3-70b-versatile', // ✅ New, supported model
//       temperature: 0,
//       response_format: { type: "json_object" }
//     });

//     const content = response.choices[0].message.content;
//     console.log('🤖 AI Raw Response:', content);
//     const aiData = JSON.parse(content);

//     // 1. CREATE MAIN TASK
//     let createdTask = null;
//     if (aiData.mainTask) {
//       createdTask = await prisma.task.create({
//         data: {
//           title: aiData.mainTask,
//           description: `Extracted from email: ${subject}`,
//           priority: aiData.priority || 'Medium',
//           deadline: aiData.deadline ? new Date(aiData.deadline) : null,
//         },
//       });

//       // 2. CREATE SUB-TASKS
//       if (Array.isArray(aiData.subtasks) && aiData.subtasks.length > 0) {
//         for (const sub of aiData.subtasks) {
//           await prisma.task.create({
//             data: {
//               title: sub,
//               parentId: createdTask.id,
//               priority: 'Medium',
//               description: `Extracted from email: ${subject}`,
//             },
//           });
//         }
//       }
//     }

//     // 3. CREATE MULTIPLE LEADS FROM TEXT
//     let createdLeadsCount = 0;
//     if (Array.isArray(aiData.leads) && aiData.leads.length > 0) {
//       for (const lead of aiData.leads) {
//         const leadExists = lead.email ? await prisma.lead.findFirst({ where: { email: lead.email } }) : null;
        
//         if (!leadExists) {
//           await prisma.lead.create({
//             data: {
//               companyName: lead.companyName || 'Unknown Company',
//               contactName: lead.contactName || 'Unknown Contact',
//               email: lead.email || null,
//               description: lead.description || subject,
//               status: 'New Lead',
//             },
//           });
//           createdLeadsCount++;
//         }
//       }
//     }

//     // 4. NOTIFY SUPER ADMINS (Tasks)
//     if (createdTask) {
//       const superAdmins = await prisma.user.findMany({
//         where: { role: 'SUPER_ADMIN', isActive: true },
//         select: { id: true },
//       });

//       for (const sa of superAdmins) {
//         await prisma.notification.create({
//           data: {
//             userId: sa.id,
//             title: '🤖 AI Extracted New Tasks!',
//             message: `Task "${aiData.mainTask}" was created from an email.`,
//             type: 'task_reminder',
//             link: '/superadmin/tasks',
//           },
//         });
//       }
//     }

//     return { createdTask, createdLeadsCount };

//   } catch (error) {
//     console.error('🤖 AI Processing failed:', error.message);
//     return null;
//   }
// };

// module.exports = { processEmailWithAI };

const OpenAI = require('openai');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const openai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1',
});

const processEmailWithAI = async (subject, body, from) => {
  const prompt = `
    You are an AI assistant for a CRM. Analyze the following email.
    Extract:
    1. A main task and its subtasks.
    2. Any potential leads (companies or contacts mentioned in the text).
    
    Return ONLY a valid JSON object. Do not add markdown or text.
    Format required:
    {
      "mainTask": "Title of the main task",
      "deadline": "YYYY-MM-DD (if mentioned, else null)",
      "priority": "High/Medium/Low",
      "subtasks": ["subtask 1", "subtask 2"],
      "leads": [
        {
          "companyName": "Company Name",
          "contactName": "Person Name",
          "email": "email@company.com (if found, else null)",
          "description": "Context of the lead"
        }
      ]
    }

    If no leads are mentioned in the body, return an empty array for leads: [].

    Email Sender: ${from}
    Email Subject: ${subject}
    Email Body: ${body}
  `;

  try {
    console.log('🧠 Asking Groq to analyze email...');
    const response = await openai.chat.completions.create({
      messages: [
        { role: 'system', content: 'You are a helpful assistant designed to output JSON.' },
        { role: 'user', content: prompt }
      ],
     model: 'openai/gpt-oss-120b',  // 🚀 UPDATED MODEL ID
      temperature: 0,
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content;
    console.log('🤖 AI Raw Response:', content);
    const aiData = JSON.parse(content);

    // 1. CREATE MAIN TASK
    let createdTask = null;
    if (aiData.mainTask) {
      console.log(`📝 Creating Task: ${aiData.mainTask}`);
      createdTask = await prisma.task.create({
        data: {
          title: aiData.mainTask,
          description: `Extracted from email: ${subject}`,
          priority: aiData.priority || 'Medium',
          deadline: aiData.deadline ? new Date(aiData.deadline) : null,
          status: 'Not Started',
          progress: 0,
        },
      });

      // 2. CREATE SUB-TASKS
      if (Array.isArray(aiData.subtasks) && aiData.subtasks.length > 0) {
        for (const sub of aiData.subtasks) {
          console.log(`📝 Creating Subtask: ${sub}`);
          await prisma.task.create({
            data: {
              title: sub,
              parentId: createdTask.id,
              priority: 'Medium',
              description: `Extracted from email: ${subject}`,
              status: 'Not Started',
              progress: 0,
            },
          });
        }
      }
    }

    // 3. CREATE MULTIPLE LEADS FROM TEXT
    let createdLeadsCount = 0;
    if (Array.isArray(aiData.leads) && aiData.leads.length > 0) {
      for (const lead of aiData.leads) {
        console.log(`🤝 Creating Lead: ${lead.companyName}`);
        const leadExists = lead.email ? await prisma.lead.findFirst({ where: { email: lead.email } }) : null;
        
        if (!leadExists) {
          await prisma.lead.create({
            data: {
              companyName: lead.companyName || 'Unknown Company',
              contactName: lead.contactName || 'Unknown Contact',
              email: lead.email || null,
              description: lead.description || subject,
              status: 'New Lead',
            },
          });
          createdLeadsCount++;
        }
      }
    }

    // 4. NOTIFY SUPER ADMINS
    if (createdTask) {
      const superAdmins = await prisma.user.findMany({
        where: { role: 'SUPER_ADMIN', isActive: true },
        select: { id: true },
      });

      for (const sa of superAdmins) {
        await prisma.notification.create({
          data: {
            userId: sa.id,
            title: '🤖 AI Extracted New Tasks!',
            message: `Task "${aiData.mainTask}" was created from an email.`,
            type: 'task_reminder',
            link: '/superadmin/tasks',
          },
        });
      }
    }

    return { createdTask, createdLeadsCount };

  } catch (error) {
    console.error('🤖 AI Processing failed:', error.message);
    return null;
  }
};

module.exports = { processEmailWithAI };