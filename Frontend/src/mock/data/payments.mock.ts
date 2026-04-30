/**
 * Mock data for payments
 */

import {
  Payment,
  CreatePaymentInput,
  ApprovePaymentInput,
} from "@/types/api.types";

function monthsAgoISO(monthsAgo: number, day: number, hour: number): string {
  const d = new Date();
  d.setMonth(d.getMonth() - monthsAgo);
  d.setDate(day);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
}

export let MOCK_PAYMENTS: Payment[] = [
  {
    id: "payment-1",
    userId: "user-2",
    userName: "Anggota KOPMA",
    nominal: 500000,
    type: "Simpanan Pokok",
    paymentMethod: "Bank Transfer",
    status: "APPROVED",
    proofUrl: "/mock/proof-payment-1.jpg",
    approvedBy: "user-1",
    approvedAt: monthsAgoISO(5, 15, 10),
    createdAt: monthsAgoISO(5, 15, 9),
    updatedAt: monthsAgoISO(5, 15, 10),
  },
  {
    id: "payment-2",
    userId: "user-3",
    userName: "Budi Santoso",
    nominal: 1000000,
    type: "Simpanan Wajib",
    paymentMethod: "QRIS",
    status: "APPROVED",
    proofUrl: "/mock/proof-payment-2.jpg",
    approvedBy: "user-1",
    approvedAt: monthsAgoISO(4, 16, 11),
    createdAt: monthsAgoISO(4, 16, 8),
    updatedAt: monthsAgoISO(4, 16, 11),
  },
  {
    id: "payment-3",
    userId: "user-4",
    userName: "Siti Rahma",
    nominal: 750000,
    type: "Simpanan Sukarela",
    paymentMethod: "Cash",
    status: "PENDING",
    proofUrl: "/mock/proof-payment-3.jpg",
    createdAt: monthsAgoISO(3, 17, 14),
    updatedAt: monthsAgoISO(3, 17, 14),
  },
  {
    id: "payment-4",
    userId: "user-5",
    userName: "Ahmad Fauzi",
    nominal: 2000000,
    type: "Simpanan Pokok",
    paymentMethod: "Bank Transfer",
    status: "PENDING",
    proofUrl: "/mock/proof-payment-4.jpg",
    createdAt: monthsAgoISO(2, 18, 10),
    updatedAt: monthsAgoISO(2, 18, 10),
  },
  {
    id: "payment-5",
    userId: "user-2",
    userName: "Anggota KOPMA",
    nominal: 300000,
    type: "Simpanan Wajib",
    paymentMethod: "QRIS",
    status: "REJECTED",
    proofUrl: "/mock/proof-payment-5.jpg",
    approvedBy: "user-1",
    approvedAt: monthsAgoISO(1, 19, 9),
    rejectionReason: "Bukti transfer tidak jelas",
    createdAt: monthsAgoISO(1, 19, 8),
    updatedAt: monthsAgoISO(1, 19, 9),
  },
];

/**
 * Get all payments (filtered by user if userId is provided)
 */
export function getPaymentsList(
  queryParams?: Record<string, string>,
): Payment[] {
  let payments = MOCK_PAYMENTS;

  if (queryParams?.userId) {
    payments = payments.filter((p) => p.userId === queryParams.userId);
  }

  return payments;
}

/**
 * Get payment by ID
 */
export function getPaymentById(id: string): Payment | null {
  return MOCK_PAYMENTS.find((payment) => payment.id === id) || null;
}

/**
 * Create new payment
 */
export function createPayment(
  input: CreatePaymentInput & { userId?: string; userName?: string },
): { success: true; data: Payment } | { success: false; error: string } {
  const newPayment: Payment = {
    id: `payment-${Date.now()}`,
    userId: input.userId || "user-2",
    userName: input.userName || "Anggota KOPMA",
    nominal: input.amount,
    type: input.type,
    paymentMethod: input.paymentMethod,
    status: "PENDING",
    proofUrl: "/mock/proof-new-payment.jpg",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  MOCK_PAYMENTS.push(newPayment);

  return { success: true, data: newPayment };
}

/**
 * Approve or reject payment
 */
export function approvePayment(
  id: string,
  input: ApprovePaymentInput,
): { success: true; data: Payment } | { success: false; error: string } {
  const paymentIndex = MOCK_PAYMENTS.findIndex((p) => p.id === id);

  if (paymentIndex === -1) {
    return { success: false, error: "Payment not found" };
  }

  const payment = MOCK_PAYMENTS[paymentIndex];

  if (payment.status !== "PENDING") {
    return { success: false, error: "Payment already processed" };
  }

  const updatedPayment: Payment = {
    ...payment,
    status: input.status,
    approvedBy: "user-1",
    approvedAt: new Date().toISOString(),
    rejectionReason: input.rejectionReason,
    updatedAt: new Date().toISOString(),
  };

  MOCK_PAYMENTS[paymentIndex] = updatedPayment;

  return { success: true, data: updatedPayment };
}
