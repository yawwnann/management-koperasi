/**
 * TypeScript types/interfaces for KOPMA data models
 */

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'ANGGOTA';
  angkatan: string;
  nim?: string; // Nomor Induk Mahasiswa
  fakultas?: string; // Fakultas
  prodi?: string; // Program Studi/Jurusan
  birthDate?: string; // Tanggal Lahir (YYYY-MM-DD)
  address?: string; // Alamat
  photo?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserInput {
  email: string;
  name: string;
  role?: 'ADMIN' | 'ANGGOTA';
  angkatan: string;
  nim?: string;
  fakultas?: string;
  prodi?: string;
  birthDate?: string;
  address?: string;
}

export interface UpdateUserInput {
  email?: string;
  name?: string;
  role?: 'ADMIN' | 'ANGGOTA';
  angkatan?: string;
  nim?: string;
  fakultas?: string;
  prodi?: string;
  birthDate?: string;
  address?: string;
  isActive?: boolean;
}

export interface FakultasData {
  nama: string;
  jurusan: string[];
}

export interface FakultasResponse {
  universitas: string;
  fakultas: FakultasData[];
}

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface Payment {
  id: string;
  userId: string;
  userName: string;
  amount: number;
  type: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  proofUrl?: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePaymentInput {
  amount: number;
  type: string;
}

export interface ApprovePaymentInput {
  status: 'APPROVED' | 'REJECTED';
  rejectionReason?: string;
}

export interface Withdrawal {
  id: string;
  userId: string;
  userName: string;
  amount: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWithdrawalInput {
  amount: number;
}

export interface ApproveWithdrawalInput {
  status: 'APPROVED' | 'REJECTED';
  rejectionReason?: string;
}

export interface Savings {
  id: string;
  userId: string;
  userName: string;
  balance: number;
  createdAt: string;
  updatedAt: string;
}

export interface SavingsBreakdown {
  total: number;
  breakdown: {
    pokok: number;
    wajib: number;
    sukarela: number;
  };
  details: Array<{
    type: string;
    amount: number;
  }>;
}

export interface SavingsChartData {
  labels: string[];
  data: Array<{
    label: string;
    balance: number;
  }>;
}

export interface UserDashboardData {
  user: {
    name: string;
    email: string;
    angkatan: string;
    memberSince: string;
  };
  totalBalance: number;
  pendingPayments: number;
  approvedPayments: number;
  rejectedPayments: number;
  pendingWithdrawals: number;
  approvedWithdrawals: number;
  recentActivities: Array<{
    id: string;
    type: 'payment' | 'withdrawal';
    amount: number;
    status: string;
    createdAt: string;
    description?: string;
  }>;
  savingsBreakdown: {
    pokok: number;
    wajib: number;
    sukarela: number;
  };
  paymentTrend: {
    labels: string[];
    payments: number[];
    withdrawals: number[];
  };
}

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

export interface DailyReport {
  date: string;
  totalPayments: number;
  totalWithdrawals: number;
  approvedPayments: number;
  approvedWithdrawals: number;
  pendingPayments: number;
  pendingWithdrawals: number;
  totalPaymentAmount: number;
  totalWithdrawalAmount: number;
  payments: Payment[];
  withdrawals: Withdrawal[];
}

export interface AngkatanReport {
  angkatan: string;
  totalMembers: number;
  totalSavings: number;
  totalPayments: number;
  totalWithdrawals: number;
  averageSavings: number;
}

export interface SystemSummary {
  totalUsers: number;
  activeUsers: number;
  totalSavings: number;
  totalPayments: number;
  totalWithdrawals: number;
  pendingPayments: number;
  pendingWithdrawals: number;
  approvedPayments: number;
  approvedWithdrawals: number;
  rejectedPayments: number;
  rejectedWithdrawals: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ApiError {
  success: false;
  error: {
    message: string;
    statusCode: number;
    details?: any;
  };
}
