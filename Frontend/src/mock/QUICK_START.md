/**
 * Quick Start Guide
 * How to use the Mock API System
 */

/*
===========================================
1. SETUP ENVIRONMENT VARIABLES
===========================================

Create .env.local file in project root:

NEXT_PUBLIC_MOCK=true
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api
NEXT_PUBLIC_DEMO_USER_MAIL=admin@kopma.com
NEXT_PUBLIC_DEMO_USER_PASS=admin123


===========================================
2. LOGIN EXAMPLE (Already Implemented)
===========================================

The sign-in form now uses the mock system:

import { authApi } from '@/lib/api';

const handleLogin = async (email: string, password: string) => {
  const response = await authApi.login(email, password);
  
  if (response.success) {
    // Success - redirect or update UI
    router.push('/');
  } else {
    // Show error
    setError(response.error?.message);
  }
};

Test Credentials:
- Admin: admin@kopma.com / admin123
- Member: anggota@kopma.com / anggota123


===========================================
3. FETCH DATA IN SERVER COMPONENT
===========================================

// In your page.tsx (server component)
import { usersApi } from '@/lib/api';

export default async function UsersPage() {
  const response = await usersApi.getList();
  
  if (!response.success) {
    return <div>Error: {response.error?.message}</div>;
  }
  
  const users = response.data;
  
  return (
    <div>
      {users.map(user => (
        <div key={user.id}>{user.name}</div>
      ))}
    </div>
  );
}


===========================================
4. FETCH DATA IN CLIENT COMPONENT
===========================================

// In your client component
"use client";
import { useState, useEffect } from 'react';
import { paymentsApi } from '@/lib/api';

export default function PaymentsList() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPayments() {
      const response = await paymentsApi.getList();
      if (response.success) {
        setPayments(response.data);
      }
      setLoading(false);
    }
    loadPayments();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {payments.map(p => (
        <div key={p.id}>
          {p.userName} - Rp {p.amount.toLocaleString()}
        </div>
      ))}
    </div>
  );
}


===========================================
5. CREATE DATA EXAMPLE
===========================================

import { paymentsApi } from '@/lib/api';

const handleCreatePayment = async () => {
  const response = await paymentsApi.create({
    amount: 1000000,
    type: 'Simpanan Wajib'
  });
  
  if (response.success) {
    console.log('Created:', response.data);
  }
};


===========================================
6. APPROVE/REJECT EXAMPLE
===========================================

import { paymentsApi } from '@/lib/api';

const handleApprove = async (paymentId: string) => {
  const response = await paymentsApi.approve(paymentId, {
    approved: true
  });
  
  if (response.success) {
    console.log('Approved!');
  }
};

const handleReject = async (paymentId: string) => {
  const response = await paymentsApi.approve(paymentId, {
    approved: false,
    rejectionReason: 'Bukti tidak jelas'
  });
  
  if (response.success) {
    console.log('Rejected');
  }
};


===========================================
7. USING HELPERS
===========================================

import { 
  formatCurrency, 
  formatDate, 
  getStatusColor,
  translateStatus,
  isAuthenticated,
  isAdmin 
} from '@/lib/api-helpers';

// Format currency
formatCurrency(1000000); // "Rp 1.000.000"

// Format date
formatDate('2024-01-15'); // "15/01/2024"
formatDate('2024-01-15', 'full'); // "Senin, 15 Januari 2024"

// Status styling
getStatusColor('APPROVED'); // "bg-green-100 text-green-800..."
getStatusColor('PENDING'); // "bg-yellow-100 text-yellow-800..."

// Translate status
translateStatus('APPROVED'); // "Disetujui"
translateStatus('PENDING'); // "Menunggu"


===========================================
8. PROTECTED ROUTES
===========================================

// In middleware.ts or layout.tsx
import { isAuthenticated, isAdmin } from '@/lib/api-helpers';

// Check authentication
if (!isAuthenticated()) {
  // Redirect to login
  return redirect('/auth/sign-in');
}

// Check admin access
if (!isAdmin()) {
  // Redirect to unauthorized
  return redirect('/unauthorized');
}


===========================================
9. SWITCHING TO REAL API
===========================================

When backend is ready, simply change .env.local:

NEXT_PUBLIC_MOCK=false

That's it! No code changes needed.
All API calls will automatically use the real backend.


===========================================
10. AVAILABLE ENDPOINTS
===========================================

Auth:
- authApi.login(email, password)
- authApi.me()
- authApi.logout()

Users (Admin):
- usersApi.getList()
- usersApi.getById(id)
- usersApi.create(data)
- usersApi.update(id, data)
- usersApi.delete(id)

Payments:
- paymentsApi.getList(queryParams?)
- paymentsApi.getById(id)
- paymentsApi.create(data)
- paymentsApi.approve(id, data)

Withdrawals:
- withdrawalsApi.getList(queryParams?)
- withdrawalsApi.getById(id)
- withdrawalsApi.create(data)
- withdrawalsApi.approve(id, data)

Savings:
- savingsApi.getMySavings()
- savingsApi.getAllSavings()

Reports (Admin):
- reportsApi.getDaily(date?)
- reportsApi.getAngkatan(angkatan?)
- reportsApi.getSummary()


===========================================
TROUBLESHOOTING
===========================================

Q: Mock data not working?
A: Make sure NEXT_PUBLIC_MOCK=true in .env.local and restart dev server

Q: Getting authentication errors?
A: Check that you're using correct credentials (see test credentials above)

Q: How to clear session?
A: Call authApi.logout() or clear localStorage manually

Q: Want to see handler logs?
A: Check browser console for [API Handler] logs


===========================================
FILE STRUCTURE
===========================================

src/
├── lib/
│   ├── apiConfig.ts          # All endpoints config
│   ├── api.ts                # API client functions (USE THIS)
│   └── api-helpers.ts        # Helper utilities
├── mock/
│   ├── index.ts              # Mock exports
│   ├── handler.ts            # Request router
│   ├── README.md             # Full documentation
│   └── data/
│       ├── auth.mock.ts
│       ├── users.mock.ts
│       ├── payments.mock.ts
│       ├── withdrawals.mock.ts
│       ├── savings.mock.ts
│       └── reports.mock.ts
├── types/
│   └── api.types.ts          # TypeScript types
└── examples/
    └── api-usage-example.ts  # Usage examples


===========================================
NEXT STEPS
===========================================

1. ✅ System sudah siap digunakan
2. ✅ Login page sudah terintegrasi
3. ✅ Mock data tersedia untuk semua endpoint
4. ✅ Tinggal panggil API di halaman lain sesuai kebutuhan

Untuk integrasi ke halaman lain:
- Import dari '@/lib/api'
- Panggil fungsi sesuai kebutuhan
- Handle response.success dan response.error
- Done! 🎉

*/
