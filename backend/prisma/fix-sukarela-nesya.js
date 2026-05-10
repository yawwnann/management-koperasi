const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
require('dotenv').config();
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const p = new PrismaClient({ adapter });

const USER_ID = 'dce70e96-9abb-4e6c-9fc1-2ea194303a3d';

async function main() {
  // Hapus semua voluntary saving untuk user ini
  const deleted = await p.voluntarySaving.deleteMany({
    where: { userId: USER_ID },
  });
  console.log(`Deleted ${deleted.count} voluntary savings`);

  // Buat ulang hanya 1 record yang benar
  await p.voluntarySaving.create({
    data: {
      userId: USER_ID,
      nominal: 13175,
    },
  });
  console.log('Created voluntary saving: Rp13.175 (06/02/2026)');

  // Update total savings
  const msSum = await p.mandatorySaving.aggregate({
    where: { userId: USER_ID },
    _sum: { nominal: true },
  });
  const totalWajib = Number(msSum._sum.nominal || 0);
  const totalAll = totalWajib + 13175;

  await p.saving.upsert({
    where: { userId: USER_ID },
    update: { total: totalAll },
    create: { userId: USER_ID, total: totalAll },
  });

  console.log(`Total wajib: Rp${totalWajib}`);
  console.log(`Total sukarela: Rp13.175`);
  console.log(`Total semua: Rp${totalAll}`);

  await p.$disconnect();
}

main().catch((e) => { console.error(e); p.$disconnect(); });
