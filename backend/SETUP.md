# 🚀 Quick Setup Guide - KOPMA Backend

## Step-by-Step Setup

### 1. Database Setup

Make sure you have PostgreSQL installed and running. Create a new database:

```sql
CREATE DATABASE kopma;
```

### 2. Configure Environment

Edit the `.env` file and update the database connection:

```env
DATABASE_URL="postgresql://YOUR_USERNAME:YOUR_PASSWORD@localhost:5432/kopma?schema=public"
```

Replace:
- `YOUR_USERNAME` with your PostgreSQL username (default: postgres)
- `YOUR_PASSWORD` with your PostgreSQL password

### 3. Install Dependencies (if not done)

```bash
npm install
```

### 4. Setup Database

```bash
# Generate Prisma Client
npm run prisma:generate

# Push schema to database (creates tables)
npm run prisma:push
```

When prompted, type `y` to confirm.

### 5. Seed Database (Create Initial Users)

```bash
npm run prisma:seed
```

This will create:
- **Admin User**: admin@kopma.com / admin123
- **Sample Member**: member@kopma.com / member123

⚠️ **IMPORTANT**: Change these passwords after first login!

### 6. Start the Server

```bash
# Development mode (with auto-reload)
npm run start:dev
```

The server will start on `http://localhost:3000`

### 7. Test the API

Test login with Postman or curl:

```bash
# Login as admin
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@kopma.com","password":"admin123"}'
```

## 🎯 Next Steps

1. Change default passwords
2. Create more users via `/api/users` endpoint (requires admin token)
3. Start testing payment submissions
4. Open Prisma Studio to view database: `npm run prisma:studio`

## 🛠️ Useful Commands

```bash
# View database in browser
npm run prisma:studio

# Regenerate Prisma Client
npm run prisma:generate

# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Format code
npm run format

# Lint code
npm run lint
```

## ❓ Troubleshooting

### Database Connection Error
- Check PostgreSQL is running
- Verify DATABASE_URL in .env
- Ensure database exists

### Port Already in Use
- Change PORT in .env to another port (e.g., 3001)

### Prisma Errors
- Run `npm run prisma:generate`
- Check schema with `npx prisma validate`

## 📝 Default API Endpoints

- **Login**: POST http://localhost:3000/api/auth/login
- **Get Profile**: GET http://localhost:3000/api/auth/me
- **Users**: GET http://localhost:3000/api/users (Admin only)
- **Payments**: GET http://localhost:3000/api/payments

Remember to add `Authorization: Bearer <token>` header for protected endpoints!
