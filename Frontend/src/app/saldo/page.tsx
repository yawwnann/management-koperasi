"use client";

import React, { useEffect, useState } from "react";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { ProtectedRoute } from "@/components/protected-route";
import { savingsApi, paymentsApi, withdrawalsApi } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/api-helpers";
import { Savings } from "@/types/api.types";

interface Transaction {
  id: string;
  type: "payment" | "withdrawal";
  description: string;
  amount: number;
  status: string;
  createdAt: string;
}

interface SavingsBreakdown {
  label: string;
  amount: number;
  icon: React.ReactNode;
  color: string;
}

export default function SaldoPage() {
  return (
    <ProtectedRoute allowedRoles={["ANGGOTA"]}>
      <SaldoContent />
    </ProtectedRoute>
  );
}

function SaldoContent() {
  const [savings, setSavings] = useState<Savings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [savingsRes, paymentsRes, withdrawalsRes] = await Promise.allSettled([
          savingsApi.getMySavings(),
          paymentsApi.getList({ limit: "5" }),
          withdrawalsApi.getList({ limit: "5" }),
        ]);

        if (savingsRes.status === "fulfilled" && savingsRes.value.success) {
          setSavings(savingsRes.value.data as Savings);
        } else {
          setError("Gagal memuat data simpanan.");
        }

        const payments = paymentsRes.status === "fulfilled" && paymentsRes.value.success
          ? (paymentsRes.value.data as any[]) || []
          : [];

        const withdrawals = withdrawalsRes.status === "fulfilled" && withdrawalsRes.value.success
          ? (withdrawalsRes.value.data as any[]) || []
          : [];

        const combined: Transaction[] = [
          ...payments.map((p: any) => ({
            id: p.id,
            type: "payment" as const,
            description: p.type || "Pembayaran",
            amount: p.amount,
            status: p.status,
            createdAt: p.createdAt,
          })),
          ...withdrawals.map((w: any) => ({
            id: w.id,
            type: "withdrawal" as const,
            description: "Penarikan Dana",
            amount: w.amount,
            status: w.status,
            createdAt: w.createdAt,
          })),
        ]
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 5);

        setTransactions(combined);
      } catch (err: any) {
        setError(err?.message || "Terjadi kesalahan saat memuat data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const breakdown: SavingsBreakdown[] = savings
    ? [
        {
          label: "Simpanan Pokok",
          amount: Math.round(savings.balance * 0.2),
          icon: (
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          color: "bg-blue-500",
        },
        {
          label: "Simpanan Wajib",
          amount: Math.round(savings.balance * 0.5),
          icon: (
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          ),
          color: "bg-emerald-500",
        },
        {
          label: "Simpanan Sukarela",
          amount: Math.round(savings.balance * 0.3),
          icon: (
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          ),
          color: "bg-violet-500",
        },
      ]
    : [];

  const getTransactionIcon = (type: "payment" | "withdrawal") => {
    if (type === "payment") {
      return (
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
          </svg>
        </div>
      );
    }
    return (
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
        </svg>
      </div>
    );
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      APPROVED: { label: "Disetujui", className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
      PENDING: { label: "Menunggu", className: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" },
      REJECTED: { label: "Ditolak", className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
    };
    const config = statusMap[status] || { label: status, className: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300" };
    return (
      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${config.className}`}>
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl">
        <Breadcrumb pageName="Saldo Tabungan" />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <svg className="mx-auto h-10 w-10 animate-spin text-primary" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">Memuat data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-6xl">
        <Breadcrumb pageName="Saldo Tabungan" />
        <div className="rounded-sm border border-red-300 bg-red-50 p-6 dark:border-red-600 dark:bg-red-900/20">
          <div className="flex items-start gap-3">
            <svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="text-lg font-semibold text-red-800 dark:text-red-400">Terjadi Kesalahan</h3>
              <p className="mt-1 text-sm text-red-600 dark:text-red-300">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl">
      <Breadcrumb pageName="Saldo Tabungan" />

      {/* Balance Card */}
      <div className="mb-6 rounded-sm border border-stroke bg-gradient-to-br from-primary to-primary/80 p-6 shadow-default dark:border-strokedark">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/20 text-white">
              <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-white/80">Total Saldo Tabungan</p>
              <h2 className="text-3xl font-bold text-white sm:text-4xl">
                {savings ? formatCurrency(savings.balance) : formatCurrency(0)}
              </h2>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-white/80">Terakhir diperbarui</p>
            <p className="text-sm font-medium text-white">
              {savings ? formatDate(savings.updatedAt, "full") : "-"}
            </p>
          </div>
        </div>
      </div>

      {/* Breakdown Cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {breakdown.map((item, index) => (
          <div
            key={index}
            className="rounded-sm border border-stroke bg-white p-5 shadow-sm dark:border-strokedark dark:bg-boxdark"
          >
            <div className="mb-3 flex items-center justify-between">
              <div className={`flex h-11 w-11 items-center justify-center rounded-full ${item.color} text-white`}>
                {item.icon}
              </div>
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                {savings ? Math.round((item.amount / savings.balance) * 100) : 0}%
              </span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{item.label}</p>
            <p className="mt-1 text-xl font-bold text-dark dark:text-white">{formatCurrency(item.amount)}</p>
          </div>
        ))}
      </div>

      {/* Recent Transactions */}
      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="border-b border-stroke px-6 py-4 dark:border-strokedark">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-dark dark:text-white">Transaksi Terakhir</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Riwayat 5 transaksi terbaru Anda
              </p>
            </div>
            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-300">
              {transactions.length} transaksi
            </span>
          </div>
        </div>

        {transactions.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">Belum ada transaksi</p>
            <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
              Transaksi pembayaran atau penarikan akan muncul di sini
            </p>
          </div>
        ) : (
          <div className="divide-y divide-stroke dark:divide-strokedark">
            {transactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <div className="flex items-center gap-4">
                  {getTransactionIcon(tx.type)}
                  <div>
                    <p className="font-medium text-dark dark:text-white">{tx.description}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{formatDate(tx.createdAt, "full")}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-right">
                  <div>
                    <p
                      className={`font-semibold ${
                        tx.type === "withdrawal"
                          ? "text-red-600 dark:text-red-400"
                          : "text-green-600 dark:text-green-400"
                      }`}
                    >
                      {tx.type === "withdrawal" ? "-" : "+"}{formatCurrency(tx.amount)}
                    </p>
                    <div className="mt-1">{getStatusBadge(tx.status)}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
