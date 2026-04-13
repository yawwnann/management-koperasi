/**
 * Dashboard data fetching functions
 * Fetches data for both ADMIN and ANGGOTA dashboards
 */

import { dashboardApi, savingsApi, paymentsApi, withdrawalsApi } from '@/lib/api';

// Helper function to format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
};

export interface AdminDashboardData {
  totalMembers: number;
  totalSavings: number;
  pendingPayments: number;
  pendingWithdrawals: number;
  approvedPayments: number;
  rejectedPayments: number;
  totalPayments: number;
  totalWithdrawals: number;
  recentActivities: Array<{
    id: string;
    type: 'payment' | 'withdrawal';
    userName: string;
    amount: number;
    status: string;
    createdAt: string;
  }>;
  recentApprovals: Array<{
    id: string;
    type: 'payment' | 'withdrawal';
    userName: string;
    amount: number;
    status: 'APPROVED' | 'REJECTED';
    approvedAt: string;
  }>;
  recentAlerts: Array<{
    id: number;
    type: string;
    message: string;
    detail: string;
    time: string;
    status: 'pending' | 'success' | 'info';
  }>;
  paymentTrend: {
    labels: string[];
    payments: number[];
    withdrawals: number[];
  };
  paymentStatus: {
    approved: number;
    pending: number;
    rejected: number;
  };
  savingsBreakdown: {
    pokok: number;
    wajib: number;
    sukarela: number;
  };
  memberActivity: {
    angkatan: string[];
    members: number[];
    savings: number[];
  };
}

export interface AnggotaDashboardData {
  mySavings: {
    balance: number;
    updatedAt: string;
  } | null;
  lastPayment: {
    id: string;
    amount: number;
    status: string;
    createdAt: string;
  } | null;
  lastWithdrawal: {
    id: string;
    amount: number;
    status: string;
    createdAt: string;
  } | null;
  accountStatus: string;
  paymentHistory: {
    labels: string[];
    amounts: number[];
  };
}

/**
 * Fetch dashboard data for ADMIN role
 * Now uses single endpoint from backend
 */
export async function fetchAdminDashboard(): Promise<AdminDashboardData> {
  const response = await dashboardApi.getAdminDashboard();
  
  if (response.success && response.data) {
    return response.data as AdminDashboardData;
  }
  
  throw new Error('Failed to fetch dashboard data');
}

/**
 * Fetch dashboard data for ANGGOTA role
 */
export async function fetchAnggotaDashboard(): Promise<AnggotaDashboardData> {
  const [savingsResponse, paymentsResponse, withdrawalsResponse] = await Promise.all([
    savingsApi.getMySavings(),
    paymentsApi.getList(),
    withdrawalsApi.getList(),
  ]);

  const mySavings = savingsResponse.success ? (savingsResponse.data as any) : null;

  const payments = paymentsResponse.success ? (paymentsResponse.data as any[]) : [];
  const withdrawals = withdrawalsResponse.success ? (withdrawalsResponse.data as any[]) : [];

  const lastPayment = payments.length > 0 ? payments[0] : null;
  const lastWithdrawal = withdrawals.length > 0 ? withdrawals[0] : null;

  // Generate last 6 months labels
  const months = [];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    months.push(`${monthNames[d.getMonth()]} ${d.getFullYear()}`);
  }

  // Group payments by month for the chart
  const paymentsByMonth = new Array(6).fill(0);
  payments.forEach((payment: any) => {
    const paymentDate = new Date(payment.createdAt);
    for (let i = 0; i < 6; i++) {
      const targetDate = new Date();
      targetDate.setMonth(targetDate.getMonth() - (5 - i));
      if (
        paymentDate.getMonth() === targetDate.getMonth() &&
        paymentDate.getFullYear() === targetDate.getFullYear()
      ) {
        paymentsByMonth[i] += payment.amount;
        break;
      }
    }
  });

  return {
    mySavings: mySavings
      ? {
          balance: mySavings.balance,
          updatedAt: mySavings.updatedAt,
        }
      : null,
    lastPayment: lastPayment
      ? {
          id: lastPayment.id,
          amount: lastPayment.amount,
          status: lastPayment.status,
          createdAt: lastPayment.createdAt,
        }
      : null,
    lastWithdrawal: lastWithdrawal
      ? {
          id: lastWithdrawal.id,
          amount: lastWithdrawal.amount,
          status: lastWithdrawal.status,
          createdAt: lastWithdrawal.createdAt,
        }
      : null,
    accountStatus: mySavings ? 'Active' : 'No Savings Account',
    paymentHistory: {
      labels: months,
      amounts: paymentsByMonth,
    },
  };
}

/**
 * Stub function for chats data (not used in KOPMA)
 */
export async function getChatsData() {
  return [];
}

/**
 * Stub function for overview data (not used in KOPMA)
 */
export async function getOverviewData() {
  return {
    views: { value: 0, percentage: 0, growthRate: 0 },
    profit: { value: 0, percentage: 0, growthRate: 0 },
    products: { value: 0, percentage: 0, growthRate: 0 },
    users: { value: 0, percentage: 0, growthRate: 0 },
  };
}
