import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

async function main() {
  console.log('🌱 Starting database seeding...');

  // Check if admin already exists
  const existingAdmin = await prisma.user.findUnique({
    where: { email: 'admin@kopma.com' },
  });

  if (existingAdmin) {
    console.log('✅ Admin user already exists');
    return;
  }

  // Hash password
  const hashedPassword = await bcrypt.hash('admin123', 10);

  // Create admin user
  const admin = await prisma.user.create({
    data: {
      name: 'Admin KOPMA',
      email: 'admin@kopma.com',
      password: hashedPassword,
      role: 'ADMIN',
      angkatan: '2024',
    },
  });

  // Create savings for admin
  await prisma.saving.create({
    data: {
      userId: admin.id,
      total: 0,
    },
  });

  console.log('✅ Admin user created successfully');
  console.log('📧 Email: admin@kopma.com');
  console.log('🔑 Password: admin123');
  console.log('⚠️  Please change the password after first login!');

  // Create sample member
  const existingMember = await prisma.user.findUnique({
    where: { email: 'member@kopma.com' },
  });

  if (!existingMember) {
    const memberPassword = await bcrypt.hash('member123', 10);
    const member = await prisma.user.create({
      data: {
        name: 'Anggota Contoh',
        email: 'member@kopma.com',
        password: memberPassword,
        role: 'ANGGOTA',
        angkatan: '2024',
      },
    });

    await prisma.saving.create({
      data: {
        userId: member.id,
        total: 0,
      },
    });

    console.log('✅ Sample member created');
    console.log('📧 Email: member@kopma.com');
    console.log('🔑 Password: member123');
  }

  console.log('🎉 Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
