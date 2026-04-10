/**
 * TypeScript types/interfaces for KOPMA data models
 */

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'ANGGOTA';
  angkatan: string;
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
}

export interface UpdateUserInput {
  email?: string;
  name?: string;
  role?: 'ADMIN' | 'ANGGOTA';
  angkatan?: string;
  isActive?: boolean;
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
  approved: boolean;
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
  approved: boolean;
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
