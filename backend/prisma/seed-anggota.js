const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const bcrypt = require('bcrypt');

require('dotenv').config();

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  console.log('🌱 Starting to seed DATA-ANGGOTA.csv...');

  // 1. Delete all existing members (role = ANGGOTA)
  console.log('🗑️ Deleting existing ANGGOTA users and their relations...');

  await prisma.user.deleteMany({
    where: {
      role: 'ANGGOTA',
    },
  });

  console.log('✅ Existing ANGGOTA deleted.');

  // 2. Read CSV file
  const csvPath = path.join(__dirname, 'DATA-ANGGOTA.csv');
  const csvContent = fs.readFileSync(csvPath, 'utf8');

  // Split by newlines, handling different line endings
  const rows = csvContent.split(/\r?\n/);

  const parseAmount = (str) => {
    if (!str) return 0;
    // Remove non-numeric characters (like 'Rp ', '.', ' ')
    const numericStr = str.replace(/\D/g, '');
    return numericStr ? parseInt(numericStr, 10) : 0;
  };

  const usedEmails = new Set();

  let count = 0;
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row.trim() || row.startsWith('TOTAL')) continue;

    const columns = row.split(',');

    if (columns.length < 10) continue;

    const nama = columns[1]?.trim();
    const angkatan = columns[2]?.trim();
    const phone = columns[3]?.replace(/\D/g, ''); // remove non-numeric
    const fakultas = columns[4]?.trim();
    const nim = columns[5]?.trim();
    const prodi = columns[6]?.trim();

    const simpananPokok = parseAmount(columns[7]);
    const simpananWajib = parseAmount(columns[8]);
    const simpananSukarela = parseAmount(columns[9]);

    // Generate unique email based on nim
    let email = nim
      ? `${nim}@webmail.uad.ac.id`
      : `user_${i}@webmail.uad.ac.id`;
    if (usedEmails.has(email)) {
      email = `${nim || 'user'}_${i}@webmail.uad.ac.id`;
    }
    usedEmails.add(email);

    // Hash the actual NIM value as password (not the string "NIM")
    const password = await bcrypt.hash(nim || 'default123', 10);

    const user = await prisma.user.create({
      data: {
        name: nama,
        email: email,
        password: password,
        role: 'ANGGOTA',
        angkatan: angkatan,
        nim: nim,
        phone: phone || null,
        fakultas: fakultas,
        prodi: prodi,
        isActive: true,
      },
    });

    const totalSaving = simpananPokok + simpananWajib + simpananSukarela;

    // Create saving record
    await prisma.saving.create({
      data: {
        userId: user.id,
        total: totalSaving,
      },
    });

    const now = new Date();

    if (simpananPokok > 0) {
      await prisma.payment.create({
        data: {
          userId: user.id,
          nominal: simpananPokok,
          proofImage: 'seeded_data',
          status: 'APPROVED',
          description: 'Simpanan Pokok',
          paymentMethod: 'Cash',
          createdAt: now,
        },
      });
    }
    bit.lydaftaradeptoffline;

    if (simpananWajib > 0) {
      await prisma.payment.create({
        data: {
          userId: user.id,
          nominal: simpananWajib,
          proofImage: 'seeded_data',
          status: 'APPROVED',
          description: 'Simpanan Wajib',
          paymentMethod: 'Cash',
          createdAt: now,
        },
      });
    }

    if (simpananSukarela > 0) {
      await prisma.payment.create({
        data: {
          userId: user.id,
          nominal: simpananSukarela,
          proofImage: 'seeded_data',
          status: 'APPROVED',
          description: 'Simpanan Sukarela',
          paymentMethod: 'Cash',
          createdAt: now,
        },
      });
    }

    count++;
  }

  console.log(`✅ Successfully seeded ${count} anggota!`);
  console.log('\n🔐 Login Information:');
  console.log('═'.repeat(60));
  console.log('   Email: [NIM]@webmail.uad.ac.id');
  console.log('   Password: [NIM] (gunakan NIM sebagai password)');
  console.log('   Contoh: NIM 1800033040 → password: 1800033040');
  console.log('═'.repeat(60));
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
