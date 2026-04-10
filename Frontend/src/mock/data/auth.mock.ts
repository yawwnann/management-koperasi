/**
 * Mock data for authentication
 */

import { User, AuthResponse } from '@/types/api.types';

const MOCK_USERS: (User & { password: string; photo?: string })[] = [
  {
    id: 'user-1',
    email: 'admin@kopma.com',
    password: 'admin123',
    name: 'Admin KOPMA',
    role: 'ADMIN',
    angkatan: '2020',
    photo: 'https://placehold.co/200x200/3b82f6/ffffff?text=AK',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'user-2',
    email: 'anggota@kopma.com',
    password: 'anggota123',
    name: 'Anggota KOPMA',
    role: 'ANGGOTA',
    angkatan: '2021',
    photo: 'https://placehold.co/200x200/10b981/ffffff?text=AK',
    isActive: true,
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z',
  },
  {
    id: 'user-3',
    email: 'budi@kopma.com',
    password: 'budi123',
    name: 'Budi Santoso',
    role: 'ANGGOTA',
    angkatan: '2020',
    photo: 'https://placehold.co/200x200/f59e0b/ffffff?text=BS',
    isActive: true,
    createdAt: '2024-01-03T00:00:00Z',
    updatedAt: '2024-01-03T00:00:00Z',
  },
];

let currentUserToken: string | null = null;

/**
 * Handle login with credentials
 */
export function handleLogin(credentials: { email: string; password: string }): 
  | { success: true; data: AuthResponse }
  | { success: false; error: string } {
  const user = MOCK_USERS.find(
    (u) => u.email === credentials.email && u.password === credentials.password
  );

  if (!user) {
    return { success: false, error: 'Invalid email or password' };
  }

  if (!user.isActive) {
    return { success: false, error: 'Account is deactivated' };
  }

  // Generate mock token
  const token = `mock-jwt-token-${user.id}-${Date.now()}`;
  currentUserToken = token;

  // Store in localStorage if in browser
  if (typeof window !== 'undefined') {
    localStorage.setItem('auth_token', token);
    localStorage.setItem('current_user', JSON.stringify(user));
  }

  const { password, ...userWithoutPassword } = user;

  return {
    success: true,
    data: {
      accessToken: token,
      user: userWithoutPassword,
    },
  };
}

/**
 * Handle get current user
 */
export function handleAuthMe(token: string | null): 
  | { success: true; data: User }
  | { success: false; error: string } {
  if (!token || token !== currentUserToken) {
    return { success: false, error: 'Not authenticated' };
  }

  // Get current user from localStorage or find by token
  let currentUser: User | null = null;
  
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('current_user');
    if (stored) {
      currentUser = JSON.parse(stored);
    }
  }

  if (!currentUser) {
    // Extract user ID from token
    const userId = token.replace('mock-jwt-token-', '').split('-')[0];
    const user = MOCK_USERS.find((u) => u.id === userId);
    if (user) {
      const { password, ...userWithoutPassword } = user;
      currentUser = userWithoutPassword;
    }
  }

  if (!currentUser) {
    return { success: false, error: 'User not found' };
  }

  return { success: true, data: currentUser };
}

/**
 * Clear current session
 */
export function logout() {
  currentUserToken = null;
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('current_user');
  }
}
