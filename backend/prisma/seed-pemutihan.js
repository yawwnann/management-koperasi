/**
 * Seed: Akun Testing Pemutihan Simpanan Wajib
 * Membuat 1 akun ANGGOTA yang tidak pernah membayar simpanan wajib
 * selama lebih dari 5 bulan (untuk menguji fitur peringatan pemutihan).
 */

const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const bcrypt = require('bcrypt');

require('dotenv').config();

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('\n🌱 Seed: Akun Testing Pemutihan\n');

  const email = 'test.pemutihan@kopma.com';
  const password = await bcrypt.hash('user123', 10);

  // Hapus akun lama jika ada agar seed bisa diulang
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    await prisma.payment.deleteMany({ where: { userId: existing.id } });
    await prisma.withdrawal.deleteMany({ where: { userId: existing.id } });
    await prisma.saving.deleteMany({ where: { userId: existing.id } });
    await prisma.refreshToken.deleteMany({ where: { userId: existing.id } });
    await prisma.user.delete({ where: { email } });
    console.log('🗑️  Akun lama dihapus.');
  }

  // Buat user baru — di-set createdAt 7 bulan lalu agar threshold terpenuhi
  const sevenMonthsAgo = new Date();
  sevenMonthsAgo.setMonth(sevenMonthsAgo.getMonth() - 7);

  const user = await prisma.user.create({
    data: {
      name: 'Test Pemutihan',
      email,
      password,
      role: 'ANGGOTA',
      angkatan: '2022',
      isActive: true,
      createdAt: sevenMonthsAgo, // bergabung 7 bulan lalu
    },
  });
  console.log(`✅ User dibuat: ${user.email}`);

  // Buat record simpanan (saldo ada, tapi belum pernah bayar wajib)
  await prisma.saving.create({
    data: {
      userId: user.id,
      total: 500000, // Hanya simpanan pokok
    },
  });
  console.log('✅ Saving record dibuat (total: Rp 500.000)');

  // Buat 1 pembayaran SIMPANAN POKOK saja (yang disetujui), 6 bulan lalu.
  // TIDAK ada pembayaran simpanan WAJIB sama sekali — ini yang memicu pemutihan.
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  // Cari admin untuk verifikasi
  const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });

  await prisma.payment.create({
    data: {
      userId: user.id,
      nominal: 500000,
      proofImage: 'https://placehold.co/400x300/3c50e0/ffffff?text=Bukti+Pokok',
      status: 'APPROVED',
      description: 'Simpanan Pokok',
      verifiedBy: admin?.id || null,
      verifiedAt: admin ? sixMonthsAgo : null,
      createdAt: sixMonthsAgo,
    },
  });
  console.log('✅ Pembayaran Simpanan Pokok dibuat (approved, 6 bulan lalu)');
  console.log('⚠️  TIDAK ADA pembayaran Simpanan Wajib — pemutihan alert akan aktif\n');

  console.log('═'.repeat(50));
  console.log('🔐 Kredensial Akun Testing Pemutihan:');
  console.log('   Email    : test.pemutihan@kopma.com');
  console.log('   Password : user123');
  console.log('   Role     : ANGGOTA');
  console.log('   Status   : Belum bayar wajib selama > 5 bulan');
  console.log('═'.repeat(50));
  console.log('\n🎯 Login dengan akun di atas untuk melihat alert pemutihan di dashboard.\n');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
