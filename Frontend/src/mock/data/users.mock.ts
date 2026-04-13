/**
 * Mock data for users
 */

import { User, CreateUserInput, UpdateUserInput } from "@/types/api.types";

let MOCK_USERS: User[] = [
  {
    id: "user-1",
    email: "admin@kopma.com",
    name: "Admin KOPMA",
    role: "ADMIN",
    angkatan: "2020",
    photo: "https://placehold.co/png/200x200/3b82f6/ffffff?text=AK",
    isActive: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "user-2",
    email: "anggota@kopma.com",
    name: "Anggota KOPMA",
    role: "ANGGOTA",
    angkatan: "2021",
    photo: "https://placehold.co/png/200x200/10b981/ffffff?text=AK",
    isActive: true,
    createdAt: "2024-01-02T00:00:00Z",
    updatedAt: "2024-01-02T00:00:00Z",
  },
  {
    id: "user-3",
    email: "budi@kopma.com",
    name: "Budi Santoso",
    role: "ANGGOTA",
    angkatan: "2020",
    photo: "https://placehold.co/png/200x200/f59e0b/ffffff?text=BS",
    isActive: true,
    createdAt: "2024-01-03T00:00:00Z",
    updatedAt: "2024-01-03T00:00:00Z",
  },
  {
    id: "user-4",
    email: "siti@kopma.com",
    name: "Siti Rahma",
    role: "ANGGOTA",
    angkatan: "2022",
    photo: "https://placehold.co/png/200x200/ec4899/ffffff?text=SR",
    isActive: true,
    createdAt: "2024-01-04T00:00:00Z",
    updatedAt: "2024-01-04T00:00:00Z",
  },
  {
    id: "user-5",
    email: "ahmad@kopma.com",
    name: "Ahmad Fauzi",
    role: "ANGGOTA",
    angkatan: "2021",
    photo: "https://placehold.co/png/200x200/8b5cf6/ffffff?text=AF",
    isActive: true,
    createdAt: "2024-01-05T00:00:00Z",
    updatedAt: "2024-01-05T00:00:00Z",
  },
];

/**
 * Get all users
 */
export function getUsersList(): User[] {
  return MOCK_USERS;
}

/**
 * Get user by ID
 */
export function getUserById(id: string): User | null {
  return MOCK_USERS.find((user) => user.id === id) || null;
}

/**
 * Create new user
 */
export function createUser(
  input: CreateUserInput,
): { success: true; data: User } | { success: false; error: string } {
  // Check if email already exists
  const existingUser = MOCK_USERS.find((u) => u.email === input.email);
  if (existingUser) {
    return { success: false, error: "Email already exists" };
  }

  const newUser: User = {
    id: `user-${Date.now()}`,
    email: input.email,
    name: input.name,
    role: input.role || "ANGGOTA",
    angkatan: input.angkatan,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  MOCK_USERS.push(newUser);

  return { success: true, data: newUser };
}

/**
 * Update user
 */
export function updateUser(
  id: string,
  input: UpdateUserInput,
): { success: true; data: User } | { success: false; error: string } {
  const userIndex = MOCK_USERS.findIndex((u) => u.id === id);

  if (userIndex === -1) {
    return { success: false, error: "User not found" };
  }

  // Check email uniqueness if email is being updated
  if (input.email && input.email !== MOCK_USERS[userIndex].email) {
    const existingUser = MOCK_USERS.find((u) => u.email === input.email);
    if (existingUser) {
      return { success: false, error: "Email already exists" };
    }
  }

  const updatedUser = {
    ...MOCK_USERS[userIndex],
    ...input,
    updatedAt: new Date().toISOString(),
  };

  MOCK_USERS[userIndex] = updatedUser;

  return { success: true, data: updatedUser };
}

/**
 * Delete user (soft delete - set isActive to false)
 */
export function deleteUser(
  id: string,
): { success: true; data: null } | { success: false; error: string } {
  const userIndex = MOCK_USERS.findIndex((u) => u.id === id);

  if (userIndex === -1) {
    return { success: false, error: "User not found" };
  }

  MOCK_USERS[userIndex] = {
    ...MOCK_USERS[userIndex],
    isActive: false,
    updatedAt: new Date().toISOString(),
  };

  return { success: true, data: null };
}
