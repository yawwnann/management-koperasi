# KOPMA Backend API

Backend API for KOPMA - Digital Cooperative System built with NestJS and Prisma.

## 🚀 Features

- **Authentication**: JWT-based authentication with role-based access control (ANGGOTA/Admin)
- **User Management**: CRUD operations for cooperative members
- **Payment Management**: Submit payments with proof upload, admin verification
- **Withdrawal Management**: Request withdrawals, admin approval with balance validation
- **Savings**: Automatic balance calculation based on approved payments/withdrawals
- **Reports**: Daily reports and per-angkatan (cohort) reports
- **File Upload**: Image upload for payment proofs

## 📋 Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database
- npm or yarn

## 🛠️ Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment**:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and update:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `JWT_SECRET`: A secure random string
   - `PORT`: Server port (default: 3000)

3. **Setup database**:
   ```bash
   # Generate Prisma client
   npm run prisma:generate
   
   # Push schema to database (creates tables)
   npm run prisma:push
   
   # Or run migrations (for production)
   npm run prisma:migrate
   ```

## 🏃 Running the App

```bash
# Development mode
npm run start:dev

# Production mode
npm run build
npm run start:prod

# Debug mode
npm run start:debug
```

## 📚 API Documentation

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/login` | Login user | No |
| GET | `/api/auth/me` | Get current user profile | Yes |

### Users (Admin Only)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/users` | Get all users | Yes (Admin) |
| GET | `/api/users/:id` | Get user by ID | Yes (Admin) |
| POST | `/api/users` | Create new user | Yes (Admin) |
| PATCH | `/api/users/:id` | Update user | Yes (Admin) |
| DELETE | `/api/users/:id` | Deactivate user | Yes (Admin) |

### Payments

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/payments` | Submit payment with proof | Yes |
| GET | `/api/payments` | Get payments (filtered by role) | Yes |
| GET | `/api/payments/:id` | Get payment details | Yes |
| PATCH | `/api/payments/:id/approve` | Approve/reject payment | Yes (Admin) |

### Withdrawals

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/withdrawals` | Request withdrawal | Yes |
| GET | `/api/withdrawals` | Get withdrawals (filtered by role) | Yes |
| GET | `/api/withdrawals/:id` | Get withdrawal details | Yes |
| PATCH | `/api/withdrawals/:id/approve` | Approve/reject withdrawal | Yes (Admin) |

### Savings

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/savings/me` | Get current user savings | Yes |
| GET | `/api/savings` | Get all savings (Admin) | Yes (Admin) |

### Reports (Admin Only)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/reports/daily?date=YYYY-MM-DD` | Daily report | Yes (Admin) |
| GET | `/api/reports/angkatan?angkatan=2024` | Per-angkatan report | Yes (Admin) |
| GET | `/api/reports/summary` | System summary | Yes (Admin) |

## 🔐 Authentication

All protected endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <your_token_here>
```

### Login Request Example

```json
POST /api/auth/login
{
  "email": "admin@kopma.com",
  "password": "password123"
}
```

### Login Response

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "name": "Admin User",
    "email": "admin@kopma.com",
    "role": "ADMIN"
  }
}
```

## 📝 Request Examples

### Create Payment (with file upload)

```
POST /api/payments
Content-Type: multipart/form-data
Authorization: Bearer <token>

Form Data:
- nominal: 100000
- description: "Monthly savings"
- proofImage: <file>
```

### Approve Payment

```json
PATCH /api/payments/:id/approve
Authorization: Bearer <admin_token>

{
  "status": "APPROVED"
}
```

### Create Withdrawal

```json
POST /api/withdrawals
Authorization: Bearer <token>

{
  "nominal": 50000,
  "reason": "Emergency need"
}
```

## 🗄️ Database Schema

### User
- id, name, email, password, role (ANGGOTA/ADMIN), angkatan, isActive, createdAt, updatedAt

### Payment
- id, userId, nominal, proofImage, status (PENDING/APPROVED/REJECTED), description, verifiedBy, verifiedAt, createdAt, updatedAt

### Withdrawal
- id, userId, nominal, reason, status (PENDING/APPROVED/REJECTED), verifiedBy, verifiedAt, createdAt, updatedAt

### Saving
- id, userId, total, updatedAt

## 🔧 Development

```bash
# Open Prisma Studio (Database GUI)
npm run prisma:studio

# Format code
npm run format

# Lint code
npm run lint

# Run tests
npm run test
```

## 📂 Project Structure

```
backend/
├── src/
│   ├── auth/           # Authentication module
│   ├── common/         # Guards, decorators, utilities
│   ├── payments/       # Payment management
│   ├── prisma/         # Prisma service
│   ├── reports/        # Report generation
│   ├── savings/        # Savings management
│   ├── users/          # User management
│   ├── withdrawals/    # Withdrawal management
│   ├── app.module.ts
│   └── main.ts
├── prisma/
│   └── schema.prisma   # Database schema
├── uploads/            # Uploaded files
├── .env                # Environment variables
└── .env.example        # Environment template
```

## 🎯 User Roles

### ANGGOTA (Member)
- Submit payments with proof upload
- Request withdrawals
- View own savings balance
- View own transaction history

### ADMIN
- All ANGGOTA features
- Manage users (create, update, deactivate)
- Approve/reject payments
- Approve/reject withdrawals
- View all reports
- View all savings

## 🚨 Error Handling

All errors return a consistent format:

```json
{
  "statusCode": 400,
  "message": "Error message here",
  "error": "Bad Request"
}
```

## 📌 Important Notes

1. **File Upload**: Only image files (jpeg, jpg, png, gif) are accepted, max 5MB
2. **Balance Calculation**: Automatically updated when payments/withdrawals are approved
3. **Soft Delete**: Users are deactivated instead of deleted
4. **Validation**: All inputs are validated using class-validator

## 🔄 Future Enhancements

- [ ] Email notifications
- [ ] Export to Excel
- [ ] Dashboard with charts/graphs
- [ ] Mobile app support
- [ ] WhatsApp notifications
- [ ] Bulk operations
- [ ] Advanced filtering and pagination

## 📄 License

This project is private and proprietary.
