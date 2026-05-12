const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');

require('dotenv').config();

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  const target = await prisma.user.findUnique({ where: { email: 'yawwnan01@gmail.com' } });

  if (!target) {
    console.error('ERROR: yawwnan01@gmail.com tidak ditemukan di database.');
    console.error('Buat user tersebut terlebih dahulu, lalu jalankan ulang script ini.');
    process.exit(1);
  }

  if (target.role !== 'ADMIN') {
    await prisma.user.update({ where: { id: target.id }, data: { role: 'ADMIN' } });
    console.log(`Promoted ${target.email} to ADMIN`);
  } else {
    console.log(`${target.email} already ADMIN`);
  }

  const result = await prisma.user.updateMany({
    where: { role: 'ADMIN', NOT: { id: target.id } },
    data: { role: 'ANGGOTA' },
  });

  console.log(`Demoted ${result.count} admin(s) to ANGGOTA`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
