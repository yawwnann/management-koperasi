/**
 * Mock data for savings
 */

import { Savings } from '@/types/api.types';

const MOCK_SAVINGS: Savings[] = [
  {
    id: 'savings-1',
    userId: 'user-1',
    userName: 'Admin KOPMA',
    balance: 5000000,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  },
  {
    id: 'savings-2',
    userId: 'user-2',
    userName: 'Anggota KOPMA',
    balance: 2500000,
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-20T10:00:00Z',
  },
  {
    id: 'savings-3',
    userId: 'user-3',
    userName: 'Budi Santoso',
    balance: 3500000,
    createdAt: '2024-01-03T00:00:00Z',
    updatedAt: '2024-01-21T11:00:00Z',
  },
  {
    id: 'savings-4',
    userId: 'user-4',
    userName: 'Siti Rahma',
    balance: 1800000,
    createdAt: '2024-01-04T00:00:00Z',
    updatedAt: '2024-01-17T14:00:00Z',
  },
  {
    id: 'savings-5',
    userId: 'user-5',
    userName: 'Ahmad Fauzi',
    balance: 4200000,
    createdAt: '2024-01-05T00:00:00Z',
    updatedAt: '2024-01-18T10:30:00Z',
  },
];

/**
 * Get current user's savings (based on token)
 */
export function getMySavings(token: string | null): Savings | null {
  if (!token) {
    return null;
  }

  // Extract user ID from mock token
  const userId = token.replace('mock-jwt-token-', '').split('-')[0];
  
  return MOCK_SAVINGS.find((savings) => savings.userId === userId) || null;
}

/**
 * Get all users' savings
 */
export function getAllSavings(): Savings[] {
  return MOCK_SAVINGS;
}
