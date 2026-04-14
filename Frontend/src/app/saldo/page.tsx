"use client";

import React, { useEffect, useState } from "react";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { ProtectedRoute } from "@/components/protected-route";
import { savingsApi, paymentsApi, withdrawalsApi } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/api-helpers";
import { SavingsBreakdown as SavingsBreakdownType, SavingsChartData } from "@/types/api.types";

interface Transaction {
  id: string;
  type: "payment" | "withdrawal";
  description: string;
  amount: number;
  status: string;
  createdAt: string;
}

export default function SaldoPage() {
  return (
    <ProtectedRoute allowedRoles={["ANGGOTA"]}>
      <SaldoContent />
    </ProtectedRoute>
  );
}

function SaldoContent() {
  const [totalBalance, setTotalBalance] = useState(0);
  const [breakdown, setBreakdown] = useState<SavingsBreakdownType | null>(null);
  const [chartData, setChartData] = useState<SavingsChartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [savingsRes, breakdownRes, chartRes, paymentsRes, withdrawalsRes] = await Promise.allSettled([
          savingsApi.getMySavings(),
          savingsApi.getSavingsBreakdown(),
          savingsApi.getSavingsChart(),
          paymentsApi.getList({ limit: "10" }),
          withdrawalsApi.getList({ limit: "10" }),
        ]);

        if (savingsRes.status === "fulfilled" && savingsRes.value.success) {
          setTotalBalance(Number(savingsRes.value.data.total) || 0);
        } else {
          setError("Gagal memuat data simpanan.");
        }

        if (breakdownRes.status === "fulfilled" && breakdownRes.value.success) {
          setBreakdown(breakdownRes.value.data as SavingsBreakdownType);
        }

        if (chartRes.status === "fulfilled" && chartRes.value.success) {
          setChartData(chartRes.value.data as SavingsChartData);
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
            description: p.description || "Pembayaran",
            amount: Number(p.nominal) || 0,
            status: p.status,
            createdAt: p.createdAt,
          })),
          ...withdrawals.map((w: any) => ({
            id: w.id,
            type: "withdrawal" as const,
            description: "Penarikan Dana",
            amount: Number(w.nominal) || 0,
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
      <div className="mx-auto max-w-7xl">
        <div className="mb-6">
          <Breadcrumb pageName="Saldo Saya" />
        </div>
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
      <div className="mx-auto max-w-7xl">
        <div className="mb-6">
          <Breadcrumb pageName="Saldo Saya" />
        </div>
        <div className="rounded-xl border border-red-300 bg-red-50 p-6 dark:border-red-600 dark:bg-red-900/20">
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

  const pokokAmount = breakdown?.breakdown.pokok || 0;
  const wajibAmount = breakdown?.breakdown.wajib || 0;
  const sukarelaAmount = breakdown?.breakdown.sukarela || 0;

  return (
    <div className="mx-auto max-w-7xl">
      {/* Header Section */}
      <div className="mb-6">
        <Breadcrumb pageName="Saldo Saya" />
      </div>

      {/* Balance Card - Gradient */}
      <div className="mb-6 rounded-2xl border border-stroke bg-gradient-to-br from-primary to-primary/80 p-6 shadow-default dark:border-strokedark">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 text-white">
              <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-white/80">Total Saldo Tabungan</p>
              <h2 className="mt-1 text-4xl font-bold text-white">{formatCurrency(totalBalance)}</h2>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-white/80">Status Akun</p>
            <p className="mt-1 text-lg font-semibold text-white">Aktif</p>
          </div>
        </div>
      </div>

      {/* Stats Cards - Breakdown */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Simpanan Pokok */}
        <div className="rounded-xl border border-stroke bg-white p-5 shadow-sm dark:border-strokedark dark:bg-boxdark">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Simpanan Pokok</p>
              <p className="mt-1 text-2xl font-bold text-blue-600 dark:text-blue-400">{formatCurrency(pokokAmount)}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/30">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Simpanan Wajib */}
        <div className="rounded-xl border border-stroke bg-white p-5 shadow-sm dark:border-strokedark dark:bg-boxdark">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Simpanan Wajib</p>
              <p className="mt-1 text-2xl font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(wajibAmount)}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
        </div>

        {/* Simpanan Sukarela */}
        <div className="rounded-xl border border-stroke bg-white p-5 shadow-sm dark:border-strokedark dark:bg-boxdark">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Simpanan Sukarela</p>
              <p className="mt-1 text-2xl font-bold text-violet-600 dark:text-violet-400">{formatCurrency(sukarelaAmount)}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-violet-100 text-violet-600 dark:bg-violet-900/30">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Chart & Transactions Grid */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Left Column - Chart */}
        <div className="xl:col-span-2">
          {chartData && chartData.data.length > 0 && (
            <div className="rounded-xl border border-stroke bg-white p-6 shadow-sm dark:border-strokedark dark:bg-boxdark">
              <h3 className="mb-6 text-lg font-semibold text-dark dark:text-white">Grafik Keuangan (6 Bulan Terakhir)</h3>
              <div className="flex items-end justify-between gap-4">
                {chartData.data.map((item, index) => {
                  const maxValue = Math.max(...chartData.data.map(d => d.balance), 1);
                  const heightPercent = (item.balance / maxValue) * 100;
                  return (
                    <div key={index} className="flex flex-1 flex-col items-center gap-3">
                      <p className="text-xs font-semibold text-dark dark:text-white">{formatCurrency(item.balance)}</p>
                      <div className="w-full flex items-end justify-center" style={{ height: '160px' }}>
                        <div
                          className="w-full max-w-[45px] bg-primary rounded-t transition-all duration-300 hover:bg-primary/80"
                          style={{ height: `${Math.max(heightPercent, 10)}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{item.label}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Recent Transactions */}
        <div className="rounded-xl border border-stroke bg-white shadow-sm dark:border-strokedark dark:bg-boxdark">
          <div className="border-b border-stroke px-6 py-4 dark:border-strokedark">
            <h3 className="text-lg font-semibold text-dark dark:text-white">Transaksi Terakhir</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {transactions.length} transaksi terbaru
            </p>
          </div>

          {transactions.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">Belum ada transaksi</p>
            </div>
          ) : (
            <div className="divide-y divide-stroke dark:divide-strokedark">
              {transactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between px-6 py-4 transition hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${
                      tx.type === "payment"
                        ? "bg-green-100 text-green-600 dark:bg-green-900/30"
                        : "bg-red-100 text-red-600 dark:bg-red-900/30"
                    }`}>
                      {tx.type === "payment" ? (
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                        </svg>
                      ) : (
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-dark dark:text-white">{tx.description}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{formatDate(tx.createdAt)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-semibold ${
                      tx.type === "withdrawal"
                        ? "text-red-600 dark:text-red-400"
                        : "text-green-600 dark:text-green-400"
                    }`}>
                      {tx.type === "withdrawal" ? "-" : "+"}{formatCurrency(tx.amount)}
                    </p>
                    <div className="mt-1">{getStatusBadge(tx.status)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
