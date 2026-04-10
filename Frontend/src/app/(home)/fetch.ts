/**
 * Dashboard data fetching functions
 * Fetches data for both ADMIN and ANGGOTA dashboards
 */

import { reportsApi, savingsApi, paymentsApi, withdrawalsApi, usersApi } from '@/lib/api';

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
 */
export async function fetchAdminDashboard(): Promise<AdminDashboardData> {
  const [summaryResponse, savingsResponse, paymentsResponse, withdrawalsResponse, usersResponse] = await Promise.all([
    reportsApi.getSummary(),
    savingsApi.getAllSavings(),
    paymentsApi.getList(),
    withdrawalsApi.getList(),
    usersApi.getList(),
  ]);

  const totalSavings = savingsResponse.success
    ? (savingsResponse.data as any[]).reduce((sum, s) => sum + s.balance, 0)
    : 0;

  const payments = paymentsResponse.success ? (paymentsResponse.data as any[]) : [];
  const withdrawals = withdrawalsResponse.success ? (withdrawalsResponse.data as any[]) : [];
  const users = usersResponse.success ? (usersResponse.data as any[]) : [];

  const approvedPayments = payments.filter((p: any) => p.status === 'APPROVED');
  const pendingPayments = payments.filter((p: any) => p.status === 'PENDING');
  const rejectedPayments = payments.filter((p: any) => p.status === 'REJECTED');

  const totalPaymentAmount = approvedPayments.reduce((sum: number, p: any) => sum + p.amount, 0);
  const totalWithdrawalAmount = withdrawals
    .filter((w: any) => w.status === 'APPROVED')
    .reduce((sum: number, w: any) => sum + w.amount, 0);

  // Generate last 6 months labels
  const months = [];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    months.push(`${monthNames[d.getMonth()]} ${d.getFullYear()}`);
  }

  // Group payments and withdrawals by month
  const paymentsByMonth = new Array(6).fill(0);
  const withdrawalsByMonth = new Array(6).fill(0);

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

  withdrawals.forEach((withdrawal: any) => {
    const withdrawalDate = new Date(withdrawal.createdAt);
    for (let i = 0; i < 6; i++) {
      const targetDate = new Date();
      targetDate.setMonth(targetDate.getMonth() - (5 - i));
      if (
        withdrawalDate.getMonth() === targetDate.getMonth() &&
        withdrawalDate.getFullYear() === targetDate.getFullYear()
      ) {
        withdrawalsByMonth[i] += withdrawal.amount;
        break;
      }
    }
  });

  // Calculate savings breakdown (simulated based on total)
  const savingsBreakdown = {
    pokok: Math.round(totalSavings * 0.2),
    wajib: Math.round(totalSavings * 0.5),
    sukarela: Math.round(totalSavings * 0.3),
  };

  // Calculate member activity by angkatan
  const angkatanMap = new Map<string, { members: number; savings: number }>();
  users.forEach((user: any) => {
    const angkatan = user.angkatan || 'Lainnya';
    if (!angkatanMap.has(angkatan)) {
      angkatanMap.set(angkatan, { members: 0, savings: 0 });
    }
    const current = angkatanMap.get(angkatan)!;
    current.members += 1;
  });

  // Add some savings data
  if (savingsResponse.success) {
    (savingsResponse.data as any[]).forEach((saving: any) => {
      const user = users.find((u: any) => u.id === saving.userId);
      if (user) {
        const angkatan = user.angkatan || 'Lainnya';
        const current = angkatanMap.get(angkatan);
        if (current) {
          current.savings += saving.balance;
        }
      }
    });
  }

  const angkatanData = Array.from(angkatanMap.entries()).map(([angkatan, data]) => ({
    angkatan,
    ...data,
  }));

  // Get recent activities (last 5 payments + withdrawals combined, sorted by date)
  const recentActivities = [...payments, ...withdrawals]
    .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)
    .map((item: any) => ({
      id: item.id,
      type: (item.type ? 'payment' : 'withdrawal') as 'payment' | 'withdrawal',
      userName: item.user?.name || 'Unknown',
      amount: item.amount,
      status: item.status,
      createdAt: item.createdAt,
    }));

  // Get recent approvals (last 5 approved or rejected transactions)
  const recentApprovals = [...approvedPayments, ...rejectedPayments, ...withdrawals.filter((w: any) => w.status === 'APPROVED' || w.status === 'REJECTED')]
    .sort((a: any, b: any) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5)
    .map((item: any) => ({
      id: item.id,
      type: (item.type ? 'payment' : 'withdrawal') as 'payment' | 'withdrawal',
      userName: item.user?.name || 'Unknown',
      amount: item.amount,
      status: item.status as 'APPROVED' | 'REJECTED',
      approvedAt: item.updatedAt,
    }));

  // Generate recent alerts (mock data for now, can be replaced with real notifications later)
  const pendingWithdrawalsCount = withdrawals.filter((w: any) => w.status === 'PENDING').length;
  const pendingWithdrawal = withdrawals.find((w: any) => w.status === 'PENDING');

  const recentAlerts = [
    {
      id: 1,
      type: "penarikan",
      message: "Penarikan Tertunda",
      detail: pendingWithdrawal ? `Rp ${formatCurrency(pendingWithdrawal.amount)} menunggu verifikasi` : "Tidak ada penarikan tertunda",
      time: "Baru saja",
      status: "pending" as const,
    },
    {
      id: 2,
      type: "member",
      message: "Pendaftaran Anggota Baru",
      detail: users.length > 0 ? `${users[users.length - 1]?.name || 'Anggota'} telah bergabung ke KOPMA` : "Belum ada anggota baru",
      time: "2 jam yang lalu",
      status: "success" as const,
    },
    {
      id: 3,
      type: "report",
      message: "Laporan Bulanan Tersedia",
      detail: "Laporan keuangan untuk bulan ini telah dibuat",
      time: "5 jam yang lalu",
      status: "info" as const,
    },
  ];

  return {
    totalMembers: users.length || 0,
    totalSavings,
    pendingPayments: pendingPayments.length || 0,
    pendingWithdrawals: withdrawals.filter((w: any) => w.status === 'PENDING').length || 0,
    approvedPayments: approvedPayments.length || 0,
    rejectedPayments: rejectedPayments.length || 0,
    totalPayments: payments.length || 0,
    totalWithdrawals: withdrawals.length || 0,
    recentActivities,
    recentApprovals,
    recentAlerts,
    paymentTrend: {
      labels: months,
      payments: paymentsByMonth,
      withdrawals: withdrawalsByMonth,
    },
    paymentStatus: {
      approved: approvedPayments.length || 0,
      pending: pendingPayments.length || 0,
      rejected: rejectedPayments.length || 0,
    },
    savingsBreakdown,
    memberActivity: {
      angkatan: angkatanData.map((a) => a.angkatan),
      members: angkatanData.map((a) => a.members),
      savings: angkatanData.map((a) => a.savings),
    },
  };
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
