const { execSync } = require('child_process');
const bcrypt = require('bcrypt');

async function seed() {
  console.log('🌱 Starting database seeding...\n');

  try {
    // Check if admin exists
    const checkResult = execSync(
      `psql -U postgres -d kopma_db -t -c "SELECT COUNT(*) FROM users WHERE email = 'admin@kopma.com';"`,
      { encoding: 'utf8' }
    ).trim();

    if (parseInt(checkResult) > 0) {
      console.log('✅ Admin user already exists\n');
    } else {
      // Create admin
      const adminPassword = await bcrypt.hash('admin123', 10);
      execSync(
        `psql -U postgres -d kopma_db -c "INSERT INTO users (id, name, email, password, role, angkatan, \\"isActive\\", \\"createdAt\\", \\"updatedAt\\") VALUES (gen_random_uuid(), 'Admin KOPMA', 'admin@kopma.com', '${adminPassword}', 'ADMIN', '2024', true, NOW(), NOW());"`,
        { encoding: 'utf8' }
      );
      console.log('✅ Admin user created');
      console.log('   Email: admin@kopma.com');
      console.log('   Password: admin123\n');
    }

    // Check if member exists
    const memberCheck = execSync(
      `psql -U postgres -d kopma_db -t -c "SELECT COUNT(*) FROM users WHERE email = 'member@kopma.com';"`,
      { encoding: 'utf8' }
    ).trim();

    if (parseInt(memberCheck) > 0) {
      console.log('✅ Sample member already exists\n');
    } else {
      const memberPassword = await bcrypt.hash('member123', 10);
      execSync(
        `psql -U postgres -d kopma_db -c "INSERT INTO users (id, name, email, password, role, angkatan, \\"isActive\\", \\"createdAt\\", \\"updatedAt\\") VALUES (gen_random_uuid(), 'Anggota Contoh', 'member@kopma.com', '${memberPassword}', 'ANGGOTA', '2024', true, NOW(), NOW());"`,
        { encoding: 'utf8' }
      );
      console.log('✅ Sample member created');
      console.log('   Email: member@kopma.com');
      console.log('   Password: member123\n');
    }

    // Create savings for users without
    execSync(
      `psql -U postgres -d kopma_db -c "INSERT INTO savings (id, \\"userId\\", total, \\"updatedAt\\") SELECT gen_random_uuid(), id, 0, NOW() FROM users WHERE id NOT IN (SELECT \\"userId\\" FROM savings);"`,
      { encoding: 'utf8' }
    );

    console.log('⚠️  Please change passwords after first login!\n');
    console.log('🎉 Seeding completed successfully!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n💡 Make sure PostgreSQL is running and psql is in your PATH');
    process.exit(1);
  }
}

seed();
