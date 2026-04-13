/**
 * Comprehensive Database Seeder for KOPMA
 * Creates large amount of test data for all models
 */

const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const bcrypt = require('bcrypt');

// Load environment variables
require('dotenv').config();

// Create adapter for Prisma 7
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
});

// Helper to generate random number in range
const randomBetween = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// Helper to generate random date within range
const randomDate = (start, end) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

// Sample data arrays
const firstNames = [
  'Ahmad', 'Budi', 'Citra', 'Dewi', 'Eko', 'Fajar', 'Gita', 'Hadi', 'Indah', 'Joko',
  'Kartika', 'Lestari', 'Muhammad', 'Ningsih', 'Oscar', 'Putri', 'Qori', 'Rina', 'Sari', 'Tono',
  'Umar', 'Vina', 'Wawan', 'Xena', 'Yoga', 'Zahra', 'Andi', 'Bayu', 'Caca', 'Dian',
  'Erna', 'Farhan', 'Galih', 'Hana', 'Irfan', 'Jasmine', 'Kevin', 'Lina', 'Maya', 'Novan',
  'Olivia', 'Panji', 'Ratna', 'Sandi', 'Tari', 'Upik', 'Vino', 'Wati', 'Yani', 'Zainal'
];

const lastNames = [
  'Pratama', 'Wijaya', 'Saputra', 'Putri', 'Hidayat', 'Nugroho', 'Santoso', 'Purnama', 'Lestari', 'Kusuma',
  'Wibowo', 'Hakim', 'Siregar', 'Susanti', 'Pangestu', 'Utami', 'Firmansyah', 'Maulana', 'Rahayu', 'Setiawan',
  'Baskoro', 'Cahyadi', 'Darmawan', 'Edwards', 'Fauzan', 'Gunawan', 'Handoko', 'Ismail', 'Jaya', 'Kurniawan',
  'Lukman', 'Mahendra', 'Nasution', 'Omar', 'Pranata', 'Rizki', 'Subagyo', 'Tanjung', 'Usman', 'Wahyudi',
  'Yulianto', 'Zulkarnain', 'Adam', 'Bakar', 'Chandra', 'Dewanto', 'Farid', 'Ghani', 'Hasan', 'Ibrahim'
];

const angkatan = ['2020', '2021', '2022', '2023', '2024', '2025'];

const paymentDescriptions = [
  'Simpanan Pokok',
  'Simpanan Wajib Bulan',
  'Simpanan Sukarela',
  'Simpanan Wajib Tahunan',
  'Simpanan Pokok Anggota Baru',
  'Simpanan Tambahan',
  'Simpanan Berjangka',
  'Simpanan Pendidikan',
  'Simpanan Hari Tua',
  'Simpanan Qurban'
];

const withdrawalReasons = [
  'Kebutuhan pendidikan anak',
  'Biaya berobat/medis',
  'Modal usaha',
  'Kebutuhan mendesak',
  'Renovasi rumah',
  'Biaya pernikahan',
  'Investasi properti',
  'Kebutuhan konsumsi',
  'Transportasi',
  'Kebencanaan',
  'Membayar hutang',
  'Biaya perjalanan',
  'Pembelian alat usaha',
  'Biaya kelahiran anak',
  'Kebutuhan lebaran'
];

// Hash password helper
async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

async function main() {
  console.log('🌱 Starting comprehensive database seeding...\n');

  // Clean existing data
  console.log('🗑️  Cleaning existing data...');
  await prisma.refreshToken.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.withdrawal.deleteMany();
  await prisma.saving.deleteMany();
  await prisma.user.deleteMany();
  console.log('✅ Existing data cleaned\n');

  // ==================== CREATE USERS ====================
  console.log('👥 Creating users...');
  
  const users = [];
  
  // Create Admin users (3 admins)
  const adminCount = 3;
  for (let i = 0; i < adminCount; i++) {
    const firstName = firstNames[i];
    const lastName = lastNames[i];
    const name = `${firstName} ${lastName}`;
    const email = `admin${i + 1}@kopma.com`;
    const password = await hashPassword('admin123');
    
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password,
        role: 'ADMIN',
        angkatan: angkatan[Math.floor(Math.random() * angkatan.length)],
        photo: i === 0 ? 'https://placehold.co/150x150/5750F1/ffffff?text=AP' : null,
        isActive: true,
      }
    });
    users.push(user);
    console.log(`   ✓ Created Admin: ${email}`);
  }

  // Create Anggota users (50 members)
  const anggotaCount = 50;
  for (let i = 0; i < anggotaCount; i++) {
    const firstName = firstNames[i % firstNames.length];
    const lastName = lastNames[i % lastNames.length];
    const name = `${firstName} ${lastName}`;
    const email = `user${i + 1}@kopma.com`;
    const password = await hashPassword('user123');
    const userAngkatan = angkatan[Math.floor(Math.random() * angkatan.length)];
    
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password,
        role: 'ANGGOTA',
        angkatan: userAngkatan,
        photo: i % 5 === 0 ? `https://placehold.co/150x150/5750F1/ffffff?text=${firstName[0]}${lastName[0]}` : null,
        isActive: i < 48, // 2 users inactive
      }
    });
    users.push(user);
  }
  console.log(`   ✓ Created ${adminCount} admins and ${anggotaCount} members\n`);

  // ==================== CREATE SAVINGS ====================
  console.log('💰 Creating savings records...');
  
  const anggotaUsers = users.filter(u => u.role === 'ANGGOTA');
  const savingsRecords = [];
  
  for (const user of anggotaUsers) {
    const total = (randomBetween(500000, 50000000)).toFixed(2);
    
    const saving = await prisma.saving.create({
      data: {
        userId: user.id,
        total: parseFloat(total),
      }
    });
    savingsRecords.push(saving);
  }
  console.log(`   ✓ Created ${savingsRecords.length} savings records\n`);

  // ==================== CREATE PAYMENTS ====================
  console.log('💳 Creating payments...');
  
  const payments = [];
  const statuses = ['PENDING', 'APPROVED', 'REJECTED'];
  const adminUsers = users.filter(u => u.role === 'ADMIN');
  
  // Create 200 payments
  const paymentCount = 200;
  for (let i = 0; i < paymentCount; i++) {
    const user = anggotaUsers[Math.floor(Math.random() * anggotaUsers.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const nominal = randomBetween(100000, 5000000);
    const description = paymentDescriptions[Math.floor(Math.random() * paymentDescriptions.length)];
    const createdAt = randomDate(new Date('2024-01-01'), new Date('2026-04-11'));
    
    const verifier = status !== 'PENDING' 
      ? adminUsers[Math.floor(Math.random() * adminUsers.length)]
      : null;
    
    const payment = await prisma.payment.create({
      data: {
        userId: user.id,
        nominal: nominal.toFixed(2),
        proofImage: `https://placehold.co/400x300/10B981/ffffff?text=Proof+${i + 1}`,
        status,
        description,
        verifiedBy: verifier?.id || null,
        verifiedAt: verifier ? randomDate(createdAt, new Date()) : null,
        createdAt,
      }
    });
    payments.push(payment);
  }
  console.log(`   ✓ Created ${paymentCount} payments`);
  console.log(`      - PENDING: ${payments.filter(p => p.status === 'PENDING').length}`);
  console.log(`      - APPROVED: ${payments.filter(p => p.status === 'APPROVED').length}`);
  console.log(`      - REJECTED: ${payments.filter(p => p.status === 'REJECTED').length}\n`);

  // ==================== CREATE WITHDRAWALS ====================
  console.log('💸 Creating withdrawals...');
  
  const withdrawals = [];
  
  // Create 100 withdrawals
  const withdrawalCount = 100;
  for (let i = 0; i < withdrawalCount; i++) {
    const user = anggotaUsers[Math.floor(Math.random() * anggotaUsers.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const nominal = randomBetween(500000, 10000000);
    const reason = withdrawalReasons[Math.floor(Math.random() * withdrawalReasons.length)];
    const createdAt = randomDate(new Date('2024-01-01'), new Date('2026-04-11'));
    
    const verifier = status !== 'PENDING'
      ? adminUsers[Math.floor(Math.random() * adminUsers.length)]
      : null;
    
    const withdrawal = await prisma.withdrawal.create({
      data: {
        userId: user.id,
        nominal: nominal.toFixed(2),
        reason,
        status,
        verifiedBy: verifier?.id || null,
        verifiedAt: verifier ? randomDate(createdAt, new Date()) : null,
        createdAt,
      }
    });
    withdrawals.push(withdrawal);
  }
  console.log(`   ✓ Created ${withdrawalCount} withdrawals`);
  console.log(`      - PENDING: ${withdrawals.filter(w => w.status === 'PENDING').length}`);
  console.log(`      - APPROVED: ${withdrawals.filter(w => w.status === 'APPROVED').length}`);
  console.log(`      - REJECTED: ${withdrawals.filter(w => w.status === 'REJECTED').length}\n`);

  // ==================== CREATE REFRESH TOKENS ====================
  console.log('🔑 Creating refresh tokens...');
  
  const refreshTokens = [];
  
  // Create 20 refresh tokens for testing
  const refreshTokenCount = 20;
  for (let i = 0; i < refreshTokenCount; i++) {
    const user = users[Math.floor(Math.random() * users.length)];
    const expiresAt = randomDate(new Date(), new Date('2026-05-11'));
    
    const refreshToken = await prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: `hashed_token_${i + 1}_${Date.now()}`,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0',
        expiresAt,
        revokedAt: i < 5 ? randomDate(new Date(), new Date()) : null, // 5 revoked tokens
        createdAt: randomDate(new Date('2026-03-01'), new Date()),
      }
    });
    refreshTokens.push(refreshToken);
  }
  console.log(`   ✓ Created ${refreshTokenCount} refresh tokens\n`);

  // ==================== PRINT SUMMARY ====================
  console.log('📊 Database Seeding Summary:');
  console.log('═'.repeat(50));
  const finalUsers = await prisma.user.count();
  const finalSavings = await prisma.saving.count();
  const finalPayments = await prisma.payment.count();
  const finalWithdrawals = await prisma.withdrawal.count();
  const finalRefreshTokens = await prisma.refreshToken.count();
  
  console.log(`   Users:           ${finalUsers}`);
  console.log(`      - Admins:     ${users.filter(u => u.role === 'ADMIN').length}`);
  console.log(`      - Members:    ${users.filter(u => u.role === 'ANGGOTA').length}`);
  console.log(`   Savings:         ${finalSavings}`);
  console.log(`   Payments:        ${finalPayments}`);
  console.log(`   Withdrawals:     ${finalWithdrawals}`);
  console.log(`   Refresh Tokens:  ${finalRefreshTokens}`);
  console.log('═'.repeat(50));
  console.log('\n✅ Database seeding completed successfully!\n');
  
  console.log('🔐 Default Login Credentials:');
  console.log('═'.repeat(50));
  console.log('   Admin 1: admin1@kopma.com / admin123');
  console.log('   Admin 2: admin2@kopma.com / admin123');
  console.log('   Admin 3: admin3@kopma.com / admin123');
  console.log('   Member:  user1@kopma.com / user123');
  console.log('   (and so on: user2@kopma.com, user3@kopma.com, etc.)');
  console.log('═'.repeat(50));
  console.log('\n💡 Testing Tips:');
  console.log('   - Use Prisma Studio: npm run prisma:studio');
  console.log('   - Filter payments by status to test approval flow');
  console.log('   - Test login with any user credentials above');
  console.log('   - Some users are inactive (user49, user50) for testing');
  console.log('\n');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
