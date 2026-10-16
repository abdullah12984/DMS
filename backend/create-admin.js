const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const hashed = await bcrypt.hash('SuperAdmin@123', 10);
  await prisma.user.create({
    data: {
      name: 'Super Admin',
      email: 'superadmin@dms.com',
      password: hashed,
      role: 'SUPER_ADMIN',
      isActive: true,
      department: 'Management',
    },
  });
  console.log('✅ Super Admin created');
}

main().catch(console.error).finally(() => prisma.$disconnect());