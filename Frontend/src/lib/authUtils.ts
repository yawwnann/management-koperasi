/**
 * Authentication Utilities
 * Helper functions for token management and authentication checks
 */

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem('auth_token');
};

/**
 * Get current user data from localStorage
 */
export const getCurrentUser = (): any => {
  if (typeof window === 'undefined') return null;
  const userStr = localStorage.getItem('current_user');
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
};

/**
 * Get auth token from localStorage
 */
export const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_token');
};

/**
 * Check if current user has specific role
 */
export const hasRole = (role: string): boolean => {
  const user = getCurrentUser();
  return user?.role === role;
};

/**
 * Check if current user is admin
 */
export const isAdmin = (): boolean => {
  return hasRole('ADMIN');
};

/**
 * Clear all auth data
 */
export const clearAuth = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('current_user');
  }
};

/**
 * Parse JWT token to get expiration time
 */
export const getTokenExpiration = (token: string): Date | null => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(window.atob(base64));
    return payload.exp ? new Date(payload.exp * 1000) : null;
  } catch {
    return null;
  }
};

/**
 * Check if token is expiring soon (within X minutes)
 */
export const isTokenExpiringSoon = (minutes: number = 5): boolean => {
  const token = getAuthToken();
  if (!token) return true;
  
  const expiration = getTokenExpiration(token);
  if (!expiration) return true;
  
  const now = new Date();
  const threshold = new Date(now.getTime() + minutes * 60 * 1000);
  
  return expiration < threshold;
};
