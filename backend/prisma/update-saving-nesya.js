const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
require('dotenv').config();
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const p = new PrismaClient({ adapter });

async function main() {
  const r = await p.mandatorySaving.aggregate({
    where: { userId: 'dce70e96-9abb-4e6c-9fc1-2ea194303a3d' },
    _sum: { nominal: true },
  });
  const total = Number(r._sum.nominal);
  console.log('Total simpanan wajib:', total);

  await p.saving.upsert({
    where: { userId: 'dce70e96-9abb-4e6c-9fc1-2ea194303a3d' },
    update: { total: { increment: total } },
    create: { userId: 'dce70e96-9abb-4e6c-9fc1-2ea194303a3d', total },
  });
  console.log('Saving.total updated');
  await p.$disconnect();
}

main();
