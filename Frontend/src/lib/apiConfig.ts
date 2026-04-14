/**
 * API Configuration
 * Centralized endpoint definitions for easy maintenance
 */

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api';

export const ENDPOINTS = {
  // Health Check
  HEALTH: {
    path: '/',
    method: 'GET' as const,
    requiresAuth: false,
  },

  // Authentication
  AUTH: {
    LOGIN: {
      path: '/auth/login',
      method: 'POST' as const,
      requiresAuth: false,
    },
    ME: {
      path: '/auth/me',
      method: 'GET' as const,
      requiresAuth: true,
    },
  },

  // Users (Admin Only)
  USERS: {
    LIST: {
      path: '/users',
      method: 'GET' as const,
      requiresAuth: true,
      requiresAdmin: true,
    },
    GET: (id: string) => ({
      path: `/users/${id}`,
      method: 'GET' as const,
      requiresAuth: true,
      requiresAdmin: true,
    }),
    CREATE: {
      path: '/users',
      method: 'POST' as const,
      requiresAuth: true,
      requiresAdmin: true,
    },
    UPDATE: (id: string) => ({
      path: `/users/${id}`,
      method: 'PATCH' as const,
      requiresAuth: true,
      requiresAdmin: true,
    }),
    DELETE: (id: string) => ({
      path: `/users/${id}`,
      method: 'DELETE' as const,
      requiresAuth: true,
      requiresAdmin: true,
    }),
  },

  // Payments
  PAYMENTS: {
    CREATE: {
      path: '/payments',
      method: 'POST' as const,
      requiresAuth: true,
    },
    LIST: {
      path: '/payments',
      method: 'GET' as const,
      requiresAuth: true,
    },
    GET: (id: string) => ({
      path: `/payments/${id}`,
      method: 'GET' as const,
      requiresAuth: true,
    }),
    APPROVE: (id: string) => ({
      path: `/payments/${id}/approve`,
      method: 'PATCH' as const,
      requiresAuth: true,
      requiresAdmin: true,
    }),
  },

  // Withdrawals
  WITHDRAWALS: {
    CREATE: {
      path: '/withdrawals',
      method: 'POST' as const,
      requiresAuth: true,
    },
    LIST: {
      path: '/withdrawals',
      method: 'GET' as const,
      requiresAuth: true,
    },
    GET: (id: string) => ({
      path: `/withdrawals/${id}`,
      method: 'GET' as const,
      requiresAuth: true,
    }),
    APPROVE: (id: string) => ({
      path: `/withdrawals/${id}/approve`,
      method: 'PATCH' as const,
      requiresAuth: true,
      requiresAdmin: true,
    }),
  },

  // Savings
  SAVINGS: {
    ME: {
      path: '/savings/me',
      method: 'GET' as const,
      requiresAuth: true,
    },
    BREAKDOWN: {
      path: '/savings/me/breakdown',
      method: 'GET' as const,
      requiresAuth: true,
    },
    CHART: {
      path: '/savings/me/chart',
      method: 'GET' as const,
      requiresAuth: true,
    },
    LIST: {
      path: '/savings',
      method: 'GET' as const,
      requiresAuth: true,
    },
  },

  // Dashboard (role-aware: ADMIN gets full data, ANGGOTA gets personal data)
  DASHBOARD: {
    ME: {
      path: '/dashboard',
      method: 'GET' as const,
      requiresAuth: true,
    },
  },
  REPORTS: {
    DAILY: (date?: string) => ({
      path: '/reports/daily' + (date ? `?date=${date}` : ''),
      method: 'GET' as const,
      requiresAuth: true,
      requiresAdmin: true,
    }),
    ANGKATAN: (angkatan?: string) => ({
      path: '/reports/angkatan' + (angkatan ? `?angkatan=${angkatan}` : ''),
      method: 'GET' as const,
      requiresAuth: true,
      requiresAdmin: true,
    }),
    SUMMARY: {
      path: '/reports/summary',
      method: 'GET' as const,
      requiresAuth: true,
      requiresAdmin: true,
    },
  },
} as const;

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface EndpointConfig {
  path: string;
  method: HttpMethod;
  requiresAuth?: boolean;
  requiresAdmin?: boolean;
}
