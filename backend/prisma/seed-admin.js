const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const bcrypt = require('bcrypt');
require('dotenv').config();

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding Admin Account...');

  const adminPassword = await bcrypt.hash('admin123', 10);
  
  const admin = await prisma.user.upsert({
    where: { email: 'yawwnan01@gmail.com' },
    update: {
      password: adminPassword,
      role: 'ADMIN',
      isActive: true,
    },
    create: {
      name: 'Yayang A. W. N.',
      email: 'yawwnan01@gmail.com',
      password: adminPassword,
      role: 'ADMIN',
      isActive: true,
    },
  });

  console.log('✅ Admin account seeded successfully!');
  console.log('Email:', admin.email);
  console.log('Password: admin123');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding admin:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
