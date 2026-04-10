/**
 * Mock profile data for ADMIN and ANGGOTA users
 * This provides placeholder profile data for the profile page
 */

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'ANGGOTA';
  angkatan: string;
  profilePhoto: string;
  coverPhoto: string;
  bio: string;
  phone?: string;
  address?: string;
  joinDate: string;
  isActive: boolean;
}

// Placeholder profile data for admin
export const ADMIN_PROFILE: UserProfile = {
  id: 'user-1',
  name: 'Admin KOPMA',
  email: 'admin@kopma.com',
  role: 'ADMIN',
  angkatan: '2020',
  profilePhoto: 'https://placehold.co/200x200/3b82f6/ffffff?text=AK',
  coverPhoto: 'https://placehold.co/970x260/3b82f6/ffffff?text=Cover+Photo',
  bio: 'Administrator KOPMA. Bertanggung jawab untuk mengelola sistem dan memverifikasi transaksi.',
  phone: '+62 812-3456-7890',
  address: 'Jakarta, Indonesia',
  joinDate: '2024-01-01T00:00:00Z',
  isActive: true,
};

// Placeholder profile data for anggota
export const ANGGOTA_PROFILE: UserProfile = {
  id: 'user-2',
  name: 'Ahmad Subandi',
  email: 'ahmad@kopma.com',
  role: 'ANGGOTA',
  angkatan: '2021',
  profilePhoto: 'https://placehold.co/200x200/10b981/ffffff?text=AS',
  coverPhoto: 'https://placehold.co/970x260/10b981/ffffff?text=Cover+Photo',
  bio: 'Anggota KOPMA Angkatan 2021. Aktif dalam kegiatan simpan pinjam koperasi.',
  phone: '+62 813-4567-8901',
  address: 'Bandung, Indonesia',
  joinDate: '2024-02-15T00:00:00Z',
  isActive: true,
};

// Map user ID to their profile
const PROFILE_MAP: Record<string, UserProfile> = {
  'user-1': ADMIN_PROFILE,
  'user-2': ANGGOTA_PROFILE,
  'user-3': {
    ...ANGGOTA_PROFILE,
    id: 'user-3',
    name: 'Siti Aminah',
    email: 'siti@kopma.com',
    profilePhoto: 'https://placehold.co/200x200/f59e0b/ffffff?text=SA',
    coverPhoto: 'https://placehold.co/970x260/f59e0b/ffffff?text=Cover+Photo',
  },
};

/**
 * Get profile data by user ID
 */
export function getProfileByUserId(userId: string): UserProfile | null {
  return PROFILE_MAP[userId] || null;
}

/**
 * Update profile data (mock implementation)
 */
export function updateProfile(userId: string, updates: Partial<UserProfile>): UserProfile | null {
  const profile = PROFILE_MAP[userId];
  if (!profile) {
    return null;
  }

  // Update the profile with new data
  PROFILE_MAP[userId] = {
    ...profile,
    ...updates,
    updatedAt: new Date().toISOString(),
  } as UserProfile;

  return PROFILE_MAP[userId];
}
