require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  try {
    const result = await prisma.$queryRaw`SELECT 1+1 as result`;
    console.log('✅ DB Connected:', result);
    
    const userCount = await prisma.user.count();
    console.log(`✅ Users in DB: ${userCount}`);
    
    process.exit(0);
  } catch (e) {
    console.error('❌ Error:', e.message);
    process.exit(1);
  }
}

test();