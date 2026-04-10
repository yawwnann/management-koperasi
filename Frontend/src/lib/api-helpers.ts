/**
 * API Helper Utilities
 * Common utilities for working with API responses
 */

import { ApiResponse } from '@/types/api.types';

/**
 * Safely extract data from API response
 * Returns null if response is not successful
 */
export function getDataFromResponse<T>(response: ApiResponse): T | null {
  if (!response.success) {
    return null;
  }
  return response.data as T;
}

/**
 * Get error message from API response
 * Returns empty string if response is successful
 */
export function getErrorFromResponse(response: ApiResponse): string {
  if (response.success) {
    return '';
  }
  return (response.data as any)?.message || 'An error occurred';
}

/**
 * Check if user is authenticated based on token in localStorage
 */
export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  return !!localStorage.getItem('auth_token');
}

/**
 * Get current user from localStorage
 */
export function getCurrentUser(): any | null {
  if (typeof window === 'undefined') {
    return null;
  }
  const userStr = localStorage.getItem('current_user');
  if (!userStr) {
    return null;
  }
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}

/**
 * Check if current user has admin role
 */
export function isAdmin(): boolean {
  const user = getCurrentUser();
  return user?.role === 'ADMIN';
}

/**
 * Format currency amount to Indonesian Rupiah
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format date to Indonesian locale
 */
export function formatDate(date: string | Date, format: 'full' | 'short' = 'short'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  if (format === 'full') {
    return d.toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }
  
  return d.toLocaleDateString('id-ID', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

/**
 * Format datetime to Indonesian locale
 */
export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  return d.toLocaleDateString('id-ID', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Get status badge color based on status
 */
export function getStatusColor(status: string): string {
  switch (status.toUpperCase()) {
    case 'APPROVED':
    case 'ACTIVE':
    case 'SUCCESS':
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
    case 'PENDING':
    case 'PROCESSING':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
    case 'REJECTED':
    case 'INACTIVE':
    case 'FAILED':
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  }
}

/**
 * Translate status text to Indonesian
 */
export function translateStatus(status: string): string {
  switch (status.toUpperCase()) {
    case 'APPROVED':
      return 'Disetujui';
    case 'PENDING':
      return 'Menunggu';
    case 'REJECTED':
      return 'Ditolak';
    case 'ACTIVE':
      return 'Aktif';
    case 'INACTIVE':
      return 'Tidak Aktif';
    case 'ADMIN':
      return 'Administrator';
    case 'ANGGOTA':
      return 'Anggota';
    default:
      return status;
  }
}

/**
 * Create query string from object
 */
export function createQueryString(params: Record<string, string | undefined>): string {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      searchParams.set(key, value);
    }
  });
  
  return searchParams.toString();
}

/**
 * Debounce function for search inputs
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}
