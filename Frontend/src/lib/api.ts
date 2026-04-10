/**
 * API Client Functions
 * Clean interface for pages to call APIs through the handler
 */

import { apiHandler } from '@/mock/handler';
import { ApiResponse } from '@/types/api.types';

// ==================== AUTH ====================

export const authApi = {
  login: (email: string, password: string): Promise<ApiResponse> => {
    return apiHandler('/auth/login', 'POST', { email, password });
  },

  me: (): Promise<ApiResponse> => {
    return apiHandler('/auth/me', 'GET');
  },

  logout: (): void => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('current_user');
    }
  },
};

// ==================== USERS ====================

export const usersApi = {
  getList: (): Promise<ApiResponse> => {
    return apiHandler('/users', 'GET');
  },

  getById: (id: string): Promise<ApiResponse> => {
    return apiHandler(`/users/${id}`, 'GET');
  },

  create: (data: any): Promise<ApiResponse> => {
    return apiHandler('/users', 'POST', data);
  },

  update: (id: string, data: any): Promise<ApiResponse> => {
    return apiHandler(`/users/${id}`, 'PATCH', data);
  },

  delete: (id: string): Promise<ApiResponse> => {
    return apiHandler(`/users/${id}`, 'DELETE');
  },
};

// ==================== PAYMENTS ====================

export const paymentsApi = {
  getList: (queryParams?: Record<string, string>): Promise<ApiResponse> => {
    return apiHandler('/payments', 'GET', undefined, queryParams);
  },

  getById: (id: string): Promise<ApiResponse> => {
    return apiHandler(`/payments/${id}`, 'GET');
  },

  create: (data: any): Promise<ApiResponse> => {
    return apiHandler('/payments', 'POST', data);
  },

  approve: (id: string, data: any): Promise<ApiResponse> => {
    return apiHandler(`/payments/${id}/approve`, 'PATCH', data);
  },
};

// ==================== WITHDRAWALS ====================

export const withdrawalsApi = {
  getList: (queryParams?: Record<string, string>): Promise<ApiResponse> => {
    return apiHandler('/withdrawals', 'GET', undefined, queryParams);
  },

  getById: (id: string): Promise<ApiResponse> => {
    return apiHandler(`/withdrawals/${id}`, 'GET');
  },

  create: (data: any): Promise<ApiResponse> => {
    return apiHandler('/withdrawals', 'POST', data);
  },

  approve: (id: string, data: any): Promise<ApiResponse> => {
    return apiHandler(`/withdrawals/${id}/approve`, 'PATCH', data);
  },
};

// ==================== SAVINGS ====================

export const savingsApi = {
  getMySavings: (): Promise<ApiResponse> => {
    return apiHandler('/savings/me', 'GET');
  },

  getAllSavings: (): Promise<ApiResponse> => {
    return apiHandler('/savings', 'GET');
  },
};

// ==================== PROFILE ====================

export const profileApi = {
  getMyProfile: (): Promise<ApiResponse> => {
    return apiHandler('/profile/me', 'GET');
  },

  updateProfile: (data: any): Promise<ApiResponse> => {
    return apiHandler('/profile/me', 'PATCH', data);
  },
};

// ==================== REPORTS ====================

export const reportsApi = {
  getDaily: (date?: string): Promise<ApiResponse> => {
    return apiHandler('/reports/daily', 'GET', undefined, { date });
  },

  getAngkatan: (angkatan?: string): Promise<ApiResponse> => {
    return apiHandler('/reports/angkatan', 'GET', undefined, { angkatan });
  },

  getSummary: (): Promise<ApiResponse> => {
    return apiHandler('/reports/summary', 'GET');
  },
};
