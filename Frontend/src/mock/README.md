# Mock System Documentation

## Overview
This mock system allows frontend development without requiring a running backend API. It routes requests through a handler that checks the `NEXT_PUBLIC_MOCK` environment variable to determine whether to return mock data or call the real API.

## Architecture

```
Pages/Components
    ↓
API Client Functions (src/lib/api.ts)
    ↓
API Handler (src/mock/handler.ts)
    ↓
┌─────────────────┬─────────────────┐
│  NEXT_PUBLIC    │  NEXT_PUBLIC    │
│  _MOCK=true     │  _MOCK=false    │
│        ↓        │        ↓        │
│  Mock Data      │  Real API       │
│  (src/mock/)    │  (Backend)      │
└─────────────────┴─────────────────┘
```

## File Structure

```
src/
├── lib/
│   ├── apiConfig.ts          # All API endpoints configuration
│   └── api.ts                # API client functions (use this in pages)
├── mock/
│   ├── index.ts              # Mock exports
│   ├── handler.ts            # Request handler with routing logic
│   └── data/
│       ├── auth.mock.ts      # Authentication mock data
│       ├── users.mock.ts     # Users mock data
│       ├── payments.mock.ts  # Payments mock data
│       ├── withdrawals.mock.ts # Withdrawals mock data
│       ├── savings.mock.ts   # Savings mock data
│       └── reports.mock.ts   # Reports mock data
└── types/
    └── api.types.ts          # TypeScript interfaces
```

## Setup

### 1. Environment Variable

Create a `.env.local` file in the project root:

```env
# Set to 'true' to use mock data, 'false' to use real API
NEXT_PUBLIC_MOCK=true

# Backend API URL (used when NEXT_PUBLIC_MOCK=false)
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api
```

### 2. Usage in Pages/Components

Import the API client functions from `@/lib/api`:

```typescript
import { authApi, usersApi, paymentsApi } from '@/lib/api';

// Example: Login
const handleLogin = async (email: string, password: string) => {
  const response = await authApi.login(email, password);
  
  if (response.success) {
    console.log('Login successful', response.data);
    // Store token and redirect
  } else {
    console.error('Login failed', response.error);
  }
};

// Example: Get users list
const loadUsers = async () => {
  const response = await usersApi.getList();
  
  if (response.success) {
    setUsers(response.data);
  }
};

// Example: Create payment
const handleCreatePayment = async (amount: number, type: string) => {
  const response = await paymentsApi.create({ amount, type });
  
  if (response.success) {
    console.log('Payment created', response.data);
  }
};
```

## Available API Functions

### Authentication (`authApi`)
- `login(email, password)` - Login user
- `me()` - Get current user
- `logout()` - Clear session

### Users (`usersApi`) - Admin Only
- `getList()` - Get all users
- `getById(id)` - Get single user
- `create(data)` - Create new user
- `update(id, data)` - Update user
- `delete(id)` - Deactivate user

### Payments (`paymentsApi`)
- `getList(queryParams?)` - Get payments list
- `getById(id)` - Get single payment
- `create(data)` - Create payment
- `approve(id, data)` - Approve/reject payment

### Withdrawals (`withdrawalsApi`)
- `getList(queryParams?)` - Get withdrawals list
- `getById(id)` - Get single withdrawal
- `create(data)` - Create withdrawal
- `approve(id, data)` - Approve/reject withdrawal

### Savings (`savingsApi`)
- `getMySavings()` - Get current user savings
- `getAllSavings()` - Get all users savings (Admin)

### Reports (`reportsApi`) - Admin Only
- `getDaily(date?)` - Get daily report
- `getAngkatan(angkatan?)` - Get cohort report
- `getSummary()` - Get system summary

## Mock Data Credentials

Use these credentials for testing:

### Admin Account
- **Email:** admin@kopma.com
- **Password:** admin123
- **Role:** ADMIN

### Member Account
- **Email:** anggota@kopma.com
- **Password:** anggota123
- **Role:** ANGGOTA

## Mock Data Details

The mock system includes realistic data for:
- **5 Users** (1 admin, 4 members from different cohorts)
- **5 Payments** (2 approved, 2 pending, 1 rejected)
- **5 Withdrawals** (2 approved, 2 pending, 1 rejected)
- **5 Savings accounts** (varying balances)
- **Reports** (auto-generated from transaction data)

## Switching Between Mock and Real API

To switch from mock to real API:

1. Change `.env.local`:
   ```env
   NEXT_PUBLIC_MOCK=false
   ```

2. Restart the development server:
   ```bash
   npm run dev
   ```

3. Ensure the backend is running on the configured API URL

## Benefits of This Architecture

✅ **Centralized endpoint management** - All URLs in one place (`apiConfig.ts`)  
✅ **Easy switching** - One environment variable toggles mock/real API  
✅ **Type safety** - Full TypeScript support with interfaces  
✅ **Realistic testing** - Mock data mirrors real API responses  
✅ **No code changes** - Same API calls work for both modes  
✅ **Maintainable** - Clean separation of concerns  

## Adding New Endpoints

1. **Add to `apiConfig.ts`:**
   ```typescript
   NEW_RESOURCE: {
     LIST: { path: '/new-resource', method: 'GET' as const, requiresAuth: true },
     CREATE: { path: '/new-resource', method: 'POST' as const, requiresAuth: true },
   }
   ```

2. **Create mock data file:** `src/mock/data/new-resource.mock.ts`

3. **Export from `src/mock/index.ts`:**
   ```typescript
   export * from './data/new-resource.mock';
   ```

4. **Add handler functions in `src/mock/handler.ts`**

5. **Add API client in `src/lib/api.ts`:**
   ```typescript
   export const newResourceApi = {
     getList: (): Promise<ApiResponse> => {
       return apiHandler('/new-resource', 'GET');
     },
   };
   ```

## Error Handling

All API calls return a consistent response structure:

```typescript
// Success response
{
  success: true,
  data: T,
  message?: string
}

// Error response
{
  success: false,
  error: {
    message: string,
    statusCode: number,
    details?: any
  }
}
```

Always check `response.success` before accessing `response.data`.

## Notes

- Mock mode adds a 500ms delay to simulate network latency
- Authentication state is stored in `localStorage`
- Mock tokens are generated per session
- All monetary values are in Indonesian Rupiah (IDR)
