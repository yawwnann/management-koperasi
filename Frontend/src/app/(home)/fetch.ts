/**
 * Dashboard data fetching functions
 * Fetches data for both ADMIN and ANGGOTA dashboards
 */

import { dashboardApi, savingsApi, paymentsApi, withdrawalsApi } from '@/lib/api';
import { AdminDashboardData, UserDashboardData } from '@/types/api.types';

// Helper function to format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
};

// Re-export AdminDashboardData for use in page.tsx
export type { AdminDashboardData };

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
  const response = await dashboardApi.getDashboard();

  if (response.success && response.data) {
    return response.data as AdminDashboardData;
  }

  throw new Error('Failed to fetch admin dashboard data');
}

/**
 * Fetch dashboard data for ANGGOTA role
 * Now uses new unified /api/dashboard endpoint
 */
export async function fetchAnggotaDashboard(): Promise<UserDashboardData> {
  const response = await dashboardApi.getDashboard();

  if (response.success && response.data) {
    return response.data as UserDashboardData;
  }

  throw new Error('Failed to fetch user dashboard data');
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
