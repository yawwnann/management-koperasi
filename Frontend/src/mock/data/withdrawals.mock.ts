/**
 * Mock data for withdrawals
 */

import {
  Withdrawal,
  CreateWithdrawalInput,
  ApproveWithdrawalInput,
} from "@/types/api.types";

function monthsAgoISO(monthsAgo: number, day: number, hour: number): string {
  const d = new Date();
  d.setMonth(d.getMonth() - monthsAgo);
  d.setDate(day);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
}

export let MOCK_WITHDRAWALS: Withdrawal[] = [
  {
    id: "withdrawal-1",
    userId: "user-2",
    userName: "Anggota KOPMA",
    nominal: 200000,
    status: "APPROVED",
    approvedBy: "user-1",
    approvedAt: monthsAgoISO(5, 20, 10),
    createdAt: monthsAgoISO(5, 20, 9),
    updatedAt: monthsAgoISO(5, 20, 10),
  },
  {
    id: "withdrawal-2",
    userId: "user-3",
    userName: "Budi Santoso",
    nominal: 500000,
    status: "APPROVED",
    approvedBy: "user-1",
    approvedAt: monthsAgoISO(4, 21, 11),
    createdAt: monthsAgoISO(4, 21, 8),
    updatedAt: monthsAgoISO(4, 21, 11),
  },
  {
    id: "withdrawal-3",
    userId: "user-4",
    userName: "Siti Rahma",
    nominal: 300000,
    status: "PENDING",
    createdAt: monthsAgoISO(3, 22, 14),
    updatedAt: monthsAgoISO(3, 22, 14),
  },
  {
    id: "withdrawal-4",
    userId: "user-5",
    userName: "Ahmad Fauzi",
    nominal: 1000000,
    status: "PENDING",
    createdAt: monthsAgoISO(2, 23, 10),
    updatedAt: monthsAgoISO(2, 23, 10),
  },
  {
    id: "withdrawal-5",
    userId: "user-2",
    userName: "Anggota KOPMA",
    nominal: 150000,
    status: "REJECTED",
    approvedBy: "user-1",
    approvedAt: monthsAgoISO(1, 24, 9),
    rejectionReason: "Saldo tidak mencukupi",
    createdAt: monthsAgoISO(1, 24, 8),
    updatedAt: monthsAgoISO(1, 24, 9),
  },
];

/**
 * Get all withdrawals (filtered by user if userId is provided)
 */
export function getWithdrawalsList(
  queryParams?: Record<string, string>,
): Withdrawal[] {
  let withdrawals = MOCK_WITHDRAWALS;

  if (queryParams?.userId) {
    withdrawals = withdrawals.filter((w) => w.userId === queryParams.userId);
  }

  return withdrawals;
}

/**
 * Get withdrawal by ID
 */
export function getWithdrawalById(id: string): Withdrawal | null {
  return MOCK_WITHDRAWALS.find((withdrawal) => withdrawal.id === id) || null;
}

/**
 * Create new withdrawal
 */
export function createWithdrawal(
  input: CreateWithdrawalInput & { userId?: string; userName?: string },
): { success: true; data: Withdrawal } | { success: false; error: string } {
  const newWithdrawal: Withdrawal = {
    id: `withdrawal-${Date.now()}`,
    userId: input.userId || "user-2",
    userName: input.userName || "Anggota KOPMA",
    nominal: input.amount,
    status: "PENDING",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  MOCK_WITHDRAWALS.push(newWithdrawal);

  return { success: true, data: newWithdrawal };
}

/**
 * Approve or reject withdrawal
 */
export function approveWithdrawal(
  id: string,
  input: ApproveWithdrawalInput,
): { success: true; data: Withdrawal } | { success: false; error: string } {
  const withdrawalIndex = MOCK_WITHDRAWALS.findIndex((w) => w.id === id);

  if (withdrawalIndex === -1) {
    return { success: false, error: "Withdrawal not found" };
  }

  const withdrawal = MOCK_WITHDRAWALS[withdrawalIndex];

  if (withdrawal.status !== "PENDING") {
    return { success: false, error: "Withdrawal already processed" };
  }

  const updatedWithdrawal: Withdrawal = {
    ...withdrawal,
    status: input.status,
    approvedBy: "user-1",
    approvedAt: new Date().toISOString(),
    rejectionReason: input.rejectionReason,
    updatedAt: new Date().toISOString(),
  };

  MOCK_WITHDRAWALS[withdrawalIndex] = updatedWithdrawal;

  return { success: true, data: updatedWithdrawal };
}
