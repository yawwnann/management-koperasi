/**
 * Mock data for reports
 */

import {
  DailyReport,
  AngkatanReport,
  SystemSummary,
  Payment,
  Withdrawal,
} from "@/types/api.types";
import { MOCK_PAYMENTS, getPaymentsList } from "./payments.mock";
import { MOCK_WITHDRAWALS, getWithdrawalsList } from "./withdrawals.mock";
import { getUsersList } from "./users.mock";
import { getAllSavings } from "./savings.mock";

/**
 * Get daily report
 */
export function getDailyReport(date?: string): DailyReport {
  const reportDate = date || new Date().toISOString().split("T")[0];

  // Filter payments and withdrawals for the date
  const dayPayments = MOCK_PAYMENTS.filter((p) =>
    p.createdAt.startsWith(reportDate),
  );
  const dayWithdrawals = MOCK_WITHDRAWALS.filter((w) =>
    w.createdAt.startsWith(reportDate),
  );

  const approvedPayments = dayPayments.filter((p) => p.status === "APPROVED");
  const approvedWithdrawals = dayWithdrawals.filter(
    (w) => w.status === "APPROVED",
  );
  const pendingPayments = dayPayments.filter((p) => p.status === "PENDING");
  const pendingWithdrawals = dayWithdrawals.filter(
    (w) => w.status === "PENDING",
  );

  const totalPaymentAmount = approvedPayments.reduce(
    (sum, p) => sum + p.nominal,
    0,
  );
  const totalWithdrawalAmount = approvedWithdrawals.reduce(
    (sum, w) => sum + w.nominal,
    0,
  );

  return {
    date: reportDate,
    totalPayments: dayPayments.length,
    totalWithdrawals: dayWithdrawals.length,
    approvedPayments: approvedPayments.length,
    approvedWithdrawals: approvedWithdrawals.length,
    pendingPayments: pendingPayments.length,
    pendingWithdrawals: pendingWithdrawals.length,
    totalPaymentAmount,
    totalWithdrawalAmount,
    payments: dayPayments,
    withdrawals: dayWithdrawals,
  };
}

/**
 * Get angkatan (cohort) report
 */
export function getAngkatanReport(angkatan?: string): AngkatanReport[] {
  const users = getUsersList();
  const savings = getAllSavings();

  // Group by angkatan
  const angkatanGroups: Record<string, typeof users> = {};

  users.forEach((user) => {
    const ang = user.angkatan;
    if (!angkatanGroups[ang]) {
      angkatanGroups[ang] = [];
    }
    angkatanGroups[ang].push(user);
  });

  // If specific angkatan requested, return only that
  if (angkatan && angkatanGroups[angkatan]) {
    const angkatanUsers = angkatanGroups[angkatan];
    const angkatanSavings = savings.filter((s) =>
      angkatanUsers.some((u) => u.id === s.userId),
    );
    const angkatanPayments = MOCK_PAYMENTS.filter((p) =>
      angkatanUsers.some((u) => u.id === p.userId),
    );
    const angkatanWithdrawals = MOCK_WITHDRAWALS.filter((w) =>
      angkatanUsers.some((u) => u.id === w.userId),
    );

    const totalSavings = angkatanSavings.reduce((sum, s) => sum + s.balance, 0);

    return [
      {
        angkatan,
        totalMembers: angkatanUsers.length,
        totalSavings,
        totalPayments: angkatanPayments.length,
        totalWithdrawals: angkatanWithdrawals.length,
        averageSavings:
          angkatanUsers.length > 0 ? totalSavings / angkatanUsers.length : 0,
      },
    ];
  }

  // Return all angkatan
  return Object.keys(angkatanGroups).map((ang) => {
    const angkatanUsers = angkatanGroups[ang];
    const angkatanSavings = savings.filter((s) =>
      angkatanUsers.some((u) => u.id === s.userId),
    );
    const angkatanPayments = MOCK_PAYMENTS.filter((p) =>
      angkatanUsers.some((u) => u.id === p.userId),
    );
    const angkatanWithdrawals = MOCK_WITHDRAWALS.filter((w) =>
      angkatanUsers.some((u) => u.id === w.userId),
    );

    const totalSavings = angkatanSavings.reduce((sum, s) => sum + s.balance, 0);

    return {
      angkatan: ang,
      totalMembers: angkatanUsers.length,
      totalSavings,
      totalPayments: angkatanPayments.length,
      totalWithdrawals: angkatanWithdrawals.length,
      averageSavings:
        angkatanUsers.length > 0 ? totalSavings / angkatanUsers.length : 0,
    };
  });
}

/**
 * Get system summary
 */
export function getSystemSummary(): SystemSummary {
  const users = getUsersList();
  const savings = getAllSavings();
  const payments = MOCK_PAYMENTS;
  const withdrawals = MOCK_WITHDRAWALS;

  const activeUsers = users.filter((u) => u.isActive).length;
  const totalSavings = savings.reduce((sum, s) => sum + s.balance, 0);

  const approvedPayments = payments.filter(
    (p) => p.status === "APPROVED",
  ).length;
  const pendingPayments = payments.filter((p) => p.status === "PENDING").length;
  const rejectedPayments = payments.filter(
    (p) => p.status === "REJECTED",
  ).length;

  const approvedWithdrawals = withdrawals.filter(
    (w) => w.status === "APPROVED",
  ).length;
  const pendingWithdrawals = withdrawals.filter(
    (w) => w.status === "PENDING",
  ).length;
  const rejectedWithdrawals = withdrawals.filter(
    (w) => w.status === "REJECTED",
  ).length;

  return {
    totalUsers: users.length,
    activeUsers,
    totalSavings,
    totalPayments: payments.length,
    totalWithdrawals: withdrawals.length,
    pendingPayments,
    pendingWithdrawals,
    approvedPayments,
    approvedWithdrawals,
    rejectedPayments,
    rejectedWithdrawals,
  };
}
