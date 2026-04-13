# 🌱 Database Seeder Documentation

## Overview

Comprehensive database seeder untuk KOPMA Backend yang menghasilkan data testing dalam jumlah besar.

## Data yang Di-generate

| Model | Jumlah | Keterangan |
|-------|--------|------------|
| **Users** | 53 | 3 Admins + 50 Members |
| **Savings** | 50 | 1 per member |
| **Payments** | 200 | Mix of PENDING/APPROVED/REJECTED |
| **Withdrawals** | 100 | Mix of PENDING/APPROVED/REJECTED |
| **Refresh Tokens** | 20 | 5 revoked, 15 active |

## Login Credentials

### Admin Accounts
| Email | Password | Role | Status |
|-------|----------|------|--------|
| admin1@kopma.com | admin123 | ADMIN | Active |
| admin2@kopma.com | admin123 | ADMIN | Active |
| admin3@kopma.com | admin123 | ADMIN | Active |

### Member Accounts (50 users)
| Email Pattern | Password | Role | Status |
|---------------|----------|------|--------|
| user1@kopma.com | user123 | ANGGOTA | Active |
| user2@kopma.com | user123 | ANGGOTA | Active |
| ... | ... | ... | ... |
| user48@kopma.com | user123 | ANGGOTA | Active |
| user49@kopma.com | user123 | ANGGOTA | **Inactive** |
| user50@kopma.com | user123 | ANGGOTA | **Inactive** |

## Payment Distribution

- **PENDING**: ~60 payments (menunggu approval)
- **APPROVED**: ~67 payments (sudah disetujui, saldo sudah bertambah)
- **REJECTED**: ~73 payments (ditolak)

## Withdrawal Distribution

- **PENDING**: ~27 withdrawals (menunggu approval)
- **APPROVED**: ~40 withdrawals (sudah disetujui, saldo sudah berkurang)
- **REJECTED**: ~33 withdrawals (ditolak)

## Data Characteristics

### Users
- Names: Kombinasi nama Indonesia yang realistis
- Angkatan: Random distribution antara 2020-2025
- Photos: ~20% users memiliki photo URL
- Active Status: 48 aktif, 2 inactive (user49, user50)

### Payments
- Nominal: Rp 100,000 - Rp 5,000,000
- Types: 
  - Simpanan Pokok
  - Simpanan Wajib
  - Simpanan Sukarela
  - Dan lainnya
- Proof Images: URL placeholder untuk semua payments
- Verifiers: Random admin untuk approved/rejected payments
- Dates: Random antara Jan 2024 - Apr 2026

### Withdrawals
- Nominal: Rp 500,000 - Rp 10,000,000
- Reasons: 15 different realistic reasons
- Verifiers: Random admin untuk approved/rejected withdrawals
- Dates: Random antara Jan 2024 - Apr 2026

### Savings
- Balance: Rp 500,000 - Rp 50,000,000 per user
- Auto-created saat user dibuat

### Refresh Tokens
- 20 tokens untuk testing
- 5 tokens sudah di-revoke (untuk testing security)
- 15 tokens masih active
- User Agent: Chrome browser simulation
- Expiry: Random dates

## How to Run

### Full Seed (Cleans & Re-creates all data)

```bash
npm run prisma:seed
```

atau

```bash
node -r dotenv/config prisma/seed.js
```

### View Data with Prisma Studio

```bash
npm run prisma:studio
```

Lalu buka http://localhost:5555

## Reset Database

Jika ingin mereset database ke keadaan kosong:

```bash
# Drop and recreate database
npx prisma migrate reset

# Or just push schema without migrations
npx prisma db push

# Then run seeder
npm run prisma:seed
```

## Testing Scenarios

### 1. Login Testing
```bash
# Test admin login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin1@kopma.com","password":"admin123"}'

# Test member login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user1@kopma.com","password":"user123"}'

# Test inactive account (should fail)
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user49@kopma.com","password":"user123"}'
```

### 2. Payment Approval Testing
```bash
# Login as admin, then approve a pending payment
# Check Prisma Studio for pending payment IDs
```

### 3. Dashboard Testing
- Admin dapat melihat 200 payments dan 100 withdrawals
- Filter by status untuk testing approval workflow
- Reports akan memiliki data yang cukup untuk di-test

### 4. Savings Testing
- 50 users dengan varying savings balances
- Test viewing savings by admin
- Test savings balance updates after payment approval/withdrawal approval

## Customization

Jika ingin mengubah jumlah data, edit variabel di `seed.js`:

```javascript
const adminCount = 3;          // Jumlah admin
const anggotaCount = 50;       // Jumlah members
const paymentCount = 200;      // Jumlah payments
const withdrawalCount = 100;   // Jumlah withdrawals
const refreshTokenCount = 20;  // Jumlah refresh tokens
```

## Important Notes

1. **Passwords**: Semua password di-hash menggunakan bcrypt dengan cost 10
2. **Relations**: Semua foreign keys valid dan ter-relasi dengan benar
3. **Timestamps**: Created/updated at timestamps realistic
4. **Cascade Delete**: Jika user dihapus, related data ikut terhapus
5. **Status Distribution**: Random tapi proporsional untuk testing realistik

## Troubleshooting

### Error: Database connection failed
- Pastikan PostgreSQL running
- Cek DATABASE_URL di .env file
- Pastikan database 'kopma' sudah dibuat

### Error: Prisma Client
- Run `npm install` untuk memastikan semua dependencies
- Run `npx prisma generate` untuk regenerate Prisma Client
- Run `npx prisma db push` untuk sync schema

### Data tidak muncul di Prisma Studio
- Refresh browser
- Pastikan seed berhasil (lihat output "✅ Database seeding completed successfully!")
- Cek koneksi database di Prisma Studio

## Performance

Seeder ini membutuhkan waktu sekitar **5-15 detik** untuk menyelesaikan seeding, tergantung:
- Kecepatan database
- Spesifikasi komputer
- Jumlah data yang di-generate

## Next Steps After Seeding

1. Test login dengan credentials yang tersedia
2. Buka Prisma Studio untuk eksplorasi data
3. Test API endpoints dengan Postman/Thunder Client
4. Test approval workflows
5. Test reporting dengan data yang ada

---

**Happy Testing!** 🚀
