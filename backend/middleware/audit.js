const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const logAction = async (user, action, target, type = 'info') => {
  try {
    await prisma.auditLog.create({
      data: {
        userId: user?.id || null,
        userName: user?.name || 'System',
        action,
        target,
        type,
      },
    });
  } catch (e) {
    console.error('Audit log failed:', e.message);
  }
};

module.exports = { logAction };