const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
require('dotenv').config();
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const p = new PrismaClient({ adapter });

const USER_ID = 'dce70e96-9abb-4e6c-9fc1-2ea194303a3d';

async function main() {
  // 1. Check existing approved payments with sukarela description
  const allPayments = await p.payment.findMany({
    where: { userId: USER_ID, status: 'APPROVED' },
    select: { id: true, nominal: true, createdAt: true, description: true },
  });
  const sukarelaPayments = allPayments.filter((pay) => {
    const desc = (pay.description || '').toLowerCase();
    return !desc.includes('wajib') && !desc.includes('pokok');
  });

  console.log(`Found ${sukarelaPayments.length} existing sukarela payments`);

  for (const pay of sukarelaPayments) {
    const existing = await p.voluntarySaving.findUnique({
      where: { paymentId: pay.id },
    });
    if (!existing) {
      await p.voluntarySaving.create({
        data: {
          userId: USER_ID,
          nominal: pay.nominal,
          paymentId: pay.id,
        },
      });
      console.log(`  Created VoluntarySaving from payment ${pay.id}: Rp${Number(pay.nominal)}`);
    }
  }

  // 2. Create sample sukarela records for demo
  const sampleData = [
    { nominal: 50000, date: '2024-01-15' },
    { nominal: 75000, date: '2024-03-20' },
    { nominal: 100000, date: '2024-06-10' },
    { nominal: 50000, date: '2024-09-05' },
    { nominal: 150000, date: '2025-02-14' },
    { nominal: 100000, date: '2025-05-22' },
    { nominal: 50000, date: '2025-08-18' },
    { nominal: 75000, date: '2025-10-01' },
  ];

  for (const s of sampleData) {
    await p.voluntarySaving.create({
      data: {
        userId: USER_ID,
        nominal: s.nominal,
      },
    });
    console.log(`  Created sample VoluntarySaving: Rp${s.nominal} (${s.date})`);
  }

  // 3. Update total savings
  const msSum = await p.mandatorySaving.aggregate({
    where: { userId: USER_ID },
    _sum: { nominal: true },
  });
  const vsSum = await p.voluntarySaving.aggregate({
    where: { userId: USER_ID },
    _sum: { nominal: true },
  });
  const totalWajib = Number(msSum._sum.nominal || 0);
  const totalSukarela = Number(vsSum._sum.nominal || 0);
  const totalAll = totalWajib + totalSukarela;

  await p.saving.upsert({
    where: { userId: USER_ID },
    update: { total: totalAll },
    create: { userId: USER_ID, total: totalAll },
  });

  console.log(`\nTotal wajib: Rp${totalWajib}`);
  console.log(`Total sukarela: Rp${totalSukarela}`);
  console.log(`Total semua: Rp${totalAll}`);

  await p.$disconnect();
}

main().catch((e) => { console.error(e); p.$disconnect(); });
