const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
require('dotenv').config();

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

const MONTH_MAP = {
  Januari: 1, Februari: 2, Maret: 3, April: 4, Mei: 5, Juni: 6,
  Juli: 7, Agustus: 8, September: 9, Oktober: 10, November: 11, Desember: 12,
};

const DATA = {
  "nama": "Nesya Putri Maghfiroh",
  "nim": "2311010019",
  "prodi": "Ekonomi Pembangunan - Ekonomi dan Bisnis",
  "no_hp": "82225132416",
  "simpanan_wajib": {
    "2023": {
      "Oktober": { "tanggal_bayar": "8/11/2023", "nominal": 10000 },
      "November": { "tanggal_bayar": "8/11/2023", "nominal": 10000 }
    },
    "2024": {
      "Januari": { "tanggal_bayar": "9/6/2024", "nominal": 10000 },
      "Februari": { "tanggal_bayar": "9/6/2024", "nominal": 10000 },
      "Maret": { "tanggal_bayar": "9/6/2024", "nominal": 10000 },
      "April": { "tanggal_bayar": "9/6/2024", "nominal": 10000 },
      "Mei": { "tanggal_bayar": "9/6/2024", "nominal": 10000 },
      "Juni": { "tanggal_bayar": "9/6/2024", "nominal": 10000 },
      "Juli": { "tanggal_bayar": "12/11/2024", "nominal": 10000 },
      "Agustus": { "tanggal_bayar": "12/11/2024", "nominal": 10000 },
      "September": { "tanggal_bayar": "12/11/2024", "nominal": 10000 },
      "Oktober": { "tanggal_bayar": "12/11/2024", "nominal": 10000 },
      "November": { "tanggal_bayar": "12/11/2024", "nominal": 10000 },
      "Desember": { "tanggal_bayar": "9/6/2024", "nominal": 10000 }
    },
    "2025": {
      "Januari": { "tanggal_bayar": "12/11/2024", "nominal": 10000 },
      "Februari": { "tanggal_bayar": "04/05/2025", "nominal": 10000 },
      "Maret": { "tanggal_bayar": "04/05/2025", "nominal": 10000 },
      "April": { "tanggal_bayar": "04/05/2025", "nominal": 10000 },
      "Mei": { "tanggal_bayar": "12/06/2025", "nominal": 10000 },
      "Juni": { "tanggal_bayar": "12/06/2025", "nominal": 10000 },
      "Juli": { "tanggal_bayar": "13/07/2025", "nominal": 10000 },
      "Agustus": { "tanggal_bayar": "02/10/2025", "nominal": 10000 },
      "September": { "tanggal_bayar": "02/10/2025", "nominal": 10000 },
      "Oktober": { "tanggal_bayar": "02/10/2025", "nominal": 10000 }
    },
    "2026": {}
  }
};

function parseDate(dateStr) {
  const parts = dateStr.split('/');
  if (parts.length === 3) {
    return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
  }
  return new Date();
}

async function main() {
  console.log('Mencari user:', DATA.nama);

  const user = await prisma.user.findFirst({
    where: { name: { contains: DATA.nama.split(' ')[0] } },
  });

  if (!user) {
    console.log('User tidak ditemukan, mencari dengan NIM...');
    const userByNim = await prisma.user.findFirst({
      where: { nim: DATA.nim },
    });
    if (!userByNim) {
      console.error('ERROR: User tidak ditemukan! Jalankan seed anggota terlebih dahulu.');
      console.log('Pastikan user dengan nama', DATA.nama, 'atau NIM', DATA.nim, 'sudah ada di database.');
      await prisma.$disconnect();
      process.exit(1);
    }
    console.log('User ditemukan via NIM:', userByNim.name, '-', userByNim.id);
    await seedMandatorySavings(userByNim);
  } else {
    console.log('User ditemukan:', user.name, '-', user.id);
    await seedMandatorySavings(user);
  }

  await prisma.$disconnect();
}

async function seedMandatorySavings(user) {
  const wajib = DATA.simpanan_wajib;
  let totalCreated = 0;

  for (const yearStr of Object.keys(wajib)) {
    const year = parseInt(yearStr);
    const months = wajib[yearStr];

    for (const monthName of Object.keys(months)) {
      const month = MONTH_MAP[monthName];
      if (!month) {
        console.log('  Bulan tidak dikenal:', monthName);
        continue;
      }

      const entry = months[monthName];
      const paidAt = parseDate(entry.tanggal_bayar);

      const existing = await prisma.mandatorySaving.findUnique({
        where: { userId_month_year: { userId: user.id, month, year } },
      });

      if (existing) {
        console.log(`  ${year} ${monthName}: sudah ada, melewati.`);
        continue;
      }

      await prisma.mandatorySaving.create({
        data: {
          userId: user.id,
          month,
          year,
          nominal: entry.nominal,
          status: 'PAID',
          paidAt,
        },
      });

      console.log(`  ${year} ${monthName}: Rp${entry.nominal} (${entry.tanggal_bayar})`);
      totalCreated++;
    }
  }

  console.log(`\nSelesai! ${totalCreated} data simpanan wajib berhasil ditambahkan untuk ${user.name}.`);
}

main().catch((e) => {
  console.error(e);
  prisma.$disconnect();
  process.exit(1);
});
