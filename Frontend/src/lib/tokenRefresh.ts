/**
 * Token Refresh Utility
 * Handles automatic token refresh before expiry and on 401 errors
 */

import { authApi } from './api';
import { isAuthenticated, isTokenExpiringSoon, getAuthToken, clearAuth, getCurrentUser } from './authUtils';

let refreshPromise: Promise<any> | null = null;
let refreshTimer: NodeJS.Timeout | null = null;
let isRefreshing = false;

/**
 * Attempt silent refresh on page load when auth_token is missing but
 * middleware let us through (refresh_token cookie exists).
 */
export const attemptSilentRefresh = async (): Promise<boolean> => {
  // Don't try if already authenticated
  if (isAuthenticated()) {
    return true;
  }

  // Try to get a new access token using the refresh token cookie
  console.log('Attempting silent token refresh...');
  try {
    const result = await authApi.refresh();
    if (result?.success) {
      console.log('Silent refresh successful');
      return true;
    }
    return false;
  } catch {
    console.log('Silent refresh failed (no valid session)');
    return false;
  }
};

/**
 * Initialize automatic token refresh
 * Checks token expiry every 30 seconds
 */
export const initTokenRefresh = (): void => {
  // Clear any existing timer
  if (refreshTimer) {
    clearInterval(refreshTimer);
  }

  // Check token every 30 seconds
  refreshTimer = setInterval(() => {
    checkAndRefreshToken();
  }, 30 * 1000);

  // Also check immediately on init
  checkAndRefreshToken();

  console.log('Auto token refresh initialized');
};

/**
 * Stop automatic token refresh
 */
export const stopTokenRefresh = (): void => {
  if (refreshTimer) {
    clearInterval(refreshTimer);
    refreshTimer = null;
  }
};

/**
 * Check if token needs refresh and refresh it
 */
export const checkAndRefreshToken = async (): Promise<boolean> => {
  if (!isAuthenticated()) {
    return false;
  }

  // Check if token is expiring soon (within 5 minutes)
  if (!isTokenExpiringSoon(5)) {
    return false;
  }

  console.log('Token expiring soon, refreshing...');
  
  // Refresh token
  return await refreshToken();
};

/**
 * Handle 401 error - attempt to refresh token
 * This should be called when API returns 401
 */
export const handleAuthError = async (): Promise<boolean> => {
  if (isRefreshing) {
    // Wait for ongoing refresh
    if (refreshPromise) {
      try {
        await refreshPromise;
        return true;
      } catch {
        return false;
      }
    }
  }

  console.log('401 detected, attempting token refresh...');
  return await refreshToken();
};

/**
 * Force refresh the token
 */
export const refreshToken = async (): Promise<boolean> => {
  // If already refreshing, wait for the existing request
  if (refreshPromise) {
    try {
      await refreshPromise;
      return true;
    } catch (error) {
      console.error('Token refresh failed:', error);
      clearAuth();
      return false;
    }
  }

  isRefreshing = true;

  try {
    refreshPromise = authApi.refresh();
    const result = await refreshPromise;

    if (result?.success) {
      console.log('Token refreshed successfully');
      return true;
    } else {
      throw new Error('Refresh failed');
    }
  } catch (error) {
    console.error('Token refresh failed:', error);
    
    // Clear auth data on failure
    clearAuth();
    
    // Redirect to login
    if (typeof window !== 'undefined') {
      window.location.href = '/auth/sign-in';
    }
    
    return false;
  } finally {
    refreshPromise = null;
    isRefreshing = false;
  }
};

/**
 * Wait for any ongoing refresh operation
 */
export const waitForRefresh = async (): Promise<void> => {
  if (refreshPromise) {
    await refreshPromise;
  }
};

/**
 * Cleanup on app unmount
 */
export const cleanup = (): void => {
  stopTokenRefresh();
};
