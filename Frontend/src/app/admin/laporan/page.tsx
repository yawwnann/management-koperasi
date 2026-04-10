"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ProtectedRoute } from "@/components/protected-route";
import { reportsApi } from "@/lib/api";
import { formatDate } from "@/lib/api-helpers";
import type { DailyReport, AngkatanReport, SystemSummary } from "@/types/api.types";

type ReportTab = "daily" | "angkatan" | "summary";

export default function LaporanPage() {
  return (
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <LaporanContent />
    </ProtectedRoute>
  );
}

function LaporanContent() {
  const [activeTab, setActiveTab] = useState<ReportTab>("summary");
  const [dailyReport, setDailyReport] = useState<DailyReport | null>(null);
  const [angkatanReport, setAngkatanReport] = useState<AngkatanReport[]>([]);
  const [systemSummary, setSystemSummary] = useState<SystemSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    loadReport();
  }, [activeTab, selectedDate]);

  async function loadReport() {
    setLoading(true);
    try {
      if (activeTab === "daily") {
        const response = await reportsApi.getDaily(selectedDate);
        if (response.success) {
          setDailyReport(response.data as DailyReport);
        }
      } else if (activeTab === "angkatan") {
        const response = await reportsApi.getAngkatan();
        if (response.success) {
          setAngkatanReport(response.data as AngkatanReport[]);
        }
      } else if (activeTab === "summary") {
        const response = await reportsApi.getSummary();
        if (response.success) {
          setSystemSummary(response.data as SystemSummary);
        }
      }
    } catch (error) {
      console.error("Failed to load report:", error);
      setMessage({ type: "error", text: "Gagal memuat data laporan." });
    } finally {
      setLoading(false);
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
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

  const getTypeBadge = (type: string) => {
    const typeColors: Record<string, string> = {
      "Simpanan Pokok": "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
      "Simpanan Wajib": "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
      "Simpanan Sukarela": "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
    };
    const color = typeColors[type] || "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300";
    return (
      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${color}`}>
        {type}
      </span>
    );
  };

  return (
    <div className="mx-auto max-w-7xl">
      {/* Breadcrumb - compact version without title */}
      <div className="mb-6 flex items-center justify-between">
        <nav className="flex items-center gap-2 text-sm">
          <Link href="/" className="font-medium text-gray-500 hover:text-primary dark:text-gray-400">
            Dashboard
          </Link>
          <span className="text-gray-400">/</span>
          <span className="font-medium text-primary">Laporan</span>
        </nav>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`mb-4 rounded-md border p-4 ${
            message.type === "success"
              ? "border-green-300 bg-green-50 text-green-700 dark:border-green-600 dark:bg-green-900/20 dark:text-green-400"
              : "border-red-300 bg-red-50 text-red-700 dark:border-red-600 dark:bg-red-900/20 dark:text-red-400"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Tabs */}
      <div className="mb-6 rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="flex border-b border-stroke dark:border-strokedark">
          <button
            onClick={() => setActiveTab("summary")}
            className={`flex-1 px-6 py-4 text-sm font-medium transition ${
              activeTab === "summary"
                ? "border-b-2 border-primary bg-primary/5 text-primary dark:text-primary"
                : "text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800"
            }`}
          >
            Ringkasan Sistem
          </button>
          <button
            onClick={() => setActiveTab("daily")}
            className={`flex-1 px-6 py-4 text-sm font-medium transition ${
              activeTab === "daily"
                ? "border-b-2 border-primary bg-primary/5 text-primary dark:text-primary"
                : "text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800"
            }`}
          >
            Laporan Harian
          </button>
          <button
            onClick={() => setActiveTab("angkatan")}
            className={`flex-1 px-6 py-4 text-sm font-medium transition ${
              activeTab === "angkatan"
                ? "border-b-2 border-primary bg-primary/5 text-primary dark:text-primary"
                : "text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800"
            }`}
          >
            Laporan per Angkatan
          </button>
        </div>

        {/* Summary Report */}
        {activeTab === "summary" && (
          <div className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <svg className="h-8 w-8 animate-spin text-primary" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span className="ml-3 text-gray-600 dark:text-gray-400">Memuat data...</span>
              </div>
            ) : systemSummary ? (
              <div className="space-y-6">
                {/* Overview Stats */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="rounded-lg border border-stroke bg-gradient-to-br from-blue-500 to-blue-600 p-6 text-white shadow-lg">
                    <p className="text-sm text-blue-100">Total Anggota</p>
                    <p className="mt-2 text-3xl font-bold">{systemSummary.totalUsers}</p>
                    <p className="mt-1 text-xs text-blue-100">Aktif: {systemSummary.activeUsers}</p>
                  </div>
                  <div className="rounded-lg border border-stroke bg-gradient-to-br from-green-500 to-green-600 p-6 text-white shadow-lg">
                    <p className="text-sm text-green-100">Total Simpanan</p>
                    <p className="mt-2 text-3xl font-bold">{formatCurrency(systemSummary.totalSavings)}</p>
                  </div>
                  <div className="rounded-lg border border-stroke bg-gradient-to-br from-purple-500 to-purple-600 p-6 text-white shadow-lg">
                    <p className="text-sm text-purple-100">Total Transaksi</p>
                    <p className="mt-2 text-3xl font-bold">
                      {systemSummary.totalPayments + systemSummary.totalWithdrawals}
                    </p>
                    <p className="mt-1 text-xs text-purple-100">
                      {systemSummary.totalPayments} pembayaran, {systemSummary.totalWithdrawals} penarikan
                    </p>
                  </div>
                  <div className="rounded-lg border border-stroke bg-gradient-to-br from-orange-500 to-orange-600 p-6 text-white shadow-lg">
                    <p className="text-sm text-orange-100">Menunggu Verifikasi</p>
                    <p className="mt-2 text-3xl font-bold">
                      {systemSummary.pendingPayments + systemSummary.pendingWithdrawals}
                    </p>
                    <p className="mt-1 text-xs text-orange-100">
                      {systemSummary.pendingPayments} pembayaran, {systemSummary.pendingWithdrawals} penarikan
                    </p>
                  </div>
                </div>

                {/* Payment Stats */}
                <div className="rounded-lg border border-stroke p-6 dark:border-strokedark">
                  <h3 className="mb-4 text-lg font-semibold text-dark dark:text-white">Statistik Pembayaran</h3>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="rounded-md bg-green-50 p-4 dark:bg-green-900/20">
                      <p className="text-sm text-green-700 dark:text-green-400">Disetujui</p>
                      <p className="mt-1 text-2xl font-bold text-green-800 dark:text-green-300">
                        {systemSummary.approvedPayments}
                      </p>
                    </div>
                    <div className="rounded-md bg-yellow-50 p-4 dark:bg-yellow-900/20">
                      <p className="text-sm text-yellow-700 dark:text-yellow-400">Menunggu</p>
                      <p className="mt-1 text-2xl font-bold text-yellow-800 dark:text-yellow-300">
                        {systemSummary.pendingPayments}
                      </p>
                    </div>
                    <div className="rounded-md bg-red-50 p-4 dark:bg-red-900/20">
                      <p className="text-sm text-red-700 dark:text-red-400">Ditolak</p>
                      <p className="mt-1 text-2xl font-bold text-red-800 dark:text-red-300">
                        {systemSummary.rejectedPayments}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Withdrawal Stats */}
                <div className="rounded-lg border border-stroke p-6 dark:border-strokedark">
                  <h3 className="mb-4 text-lg font-semibold text-dark dark:text-white">Statistik Penarikan</h3>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="rounded-md bg-green-50 p-4 dark:bg-green-900/20">
                      <p className="text-sm text-green-700 dark:text-green-400">Disetujui</p>
                      <p className="mt-1 text-2xl font-bold text-green-800 dark:text-green-300">
                        {systemSummary.approvedWithdrawals}
                      </p>
                    </div>
                    <div className="rounded-md bg-yellow-50 p-4 dark:bg-yellow-900/20">
                      <p className="text-sm text-yellow-700 dark:text-yellow-400">Menunggu</p>
                      <p className="mt-1 text-2xl font-bold text-yellow-800 dark:text-yellow-300">
                        {systemSummary.pendingWithdrawals}
                      </p>
                    </div>
                    <div className="rounded-md bg-red-50 p-4 dark:bg-red-900/20">
                      <p className="text-sm text-red-700 dark:text-red-400">Ditolak</p>
                      <p className="mt-1 text-2xl font-bold text-red-800 dark:text-red-300">
                        {systemSummary.rejectedWithdrawals}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-gray-500 dark:text-gray-400">
                Tidak ada data ringkasan.
              </div>
            )}
          </div>
        )}

        {/* Daily Report */}
        {activeTab === "daily" && (
          <div className="p-6">
            {/* Date Picker */}
            <div className="mb-4 flex items-center gap-4">
              <label className="text-sm font-medium text-dark dark:text-white" htmlFor="date">
                Tanggal:
              </label>
              <input
                id="date"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="rounded-lg border border-stroke px-4 py-2 text-dark outline-none transition focus:border-primary dark:border-strokedark dark:text-white dark:focus:border-primary"
              />
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <svg className="h-8 w-8 animate-spin text-primary" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span className="ml-3 text-gray-600 dark:text-gray-400">Memuat data...</span>
              </div>
            ) : dailyReport ? (
              <div className="space-y-6">
                {/* Daily Stats */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="rounded-lg border border-stroke bg-white p-4 shadow-default dark:border-strokedark dark:bg-boxdark">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Pembayaran</p>
                    <p className="mt-1 text-2xl font-bold text-dark dark:text-white">{dailyReport.totalPayments}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      Disetujui: {dailyReport.approvedPayments} | Menunggu: {dailyReport.pendingPayments}
                    </p>
                  </div>
                  <div className="rounded-lg border border-stroke bg-white p-4 shadow-default dark:border-strokedark dark:bg-boxdark">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Penarikan</p>
                    <p className="mt-1 text-2xl font-bold text-dark dark:text-white">{dailyReport.totalWithdrawals}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      Disetujui: {dailyReport.approvedWithdrawals} | Menunggu: {dailyReport.pendingWithdrawals}
                    </p>
                  </div>
                  <div className="rounded-lg border border-green-300 bg-green-50 p-4 shadow-default dark:border-green-600 dark:bg-green-900/20">
                    <p className="text-sm text-green-700 dark:text-green-400">Total Masuk</p>
                    <p className="mt-1 text-2xl font-bold text-green-800 dark:text-green-300">
                      {formatCurrency(dailyReport.totalPaymentAmount)}
                    </p>
                  </div>
                  <div className="rounded-lg border border-red-300 bg-red-50 p-4 shadow-default dark:border-red-600 dark:bg-red-900/20">
                    <p className="text-sm text-red-700 dark:text-red-400">Total Keluar</p>
                    <p className="mt-1 text-2xl font-bold text-red-800 dark:text-red-300">
                      {formatCurrency(dailyReport.totalWithdrawalAmount)}
                    </p>
                  </div>
                </div>

                {/* Payments Table */}
                {dailyReport.payments.length > 0 && (
                  <div className="rounded-lg border border-stroke p-6 dark:border-strokedark">
                    <h3 className="mb-4 text-lg font-semibold text-dark dark:text-white">Daftar Pembayaran</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full table-auto">
                        <thead>
                          <tr className="border-b border-stroke bg-gray-50 dark:border-strokedark dark:bg-gray-800">
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Anggota</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Jenis</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Jumlah</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {dailyReport.payments.map((payment) => (
                            <tr key={payment.id} className="border-b border-stroke dark:border-strokedark">
                              <td className="px-4 py-3 text-sm text-dark dark:text-white">{payment.userName}</td>
                              <td className="px-4 py-3">{getTypeBadge(payment.type)}</td>
                              <td className="px-4 py-3 text-sm font-semibold text-dark dark:text-white">
                                {formatCurrency(payment.amount)}
                              </td>
                              <td className="px-4 py-3">{getStatusBadge(payment.status)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Withdrawals Table */}
                {dailyReport.withdrawals.length > 0 && (
                  <div className="rounded-lg border border-stroke p-6 dark:border-strokedark">
                    <h3 className="mb-4 text-lg font-semibold text-dark dark:text-white">Daftar Penarikan</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full table-auto">
                        <thead>
                          <tr className="border-b border-stroke bg-gray-50 dark:border-strokedark dark:bg-gray-800">
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Anggota</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Jumlah</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {dailyReport.withdrawals.map((withdrawal) => (
                            <tr key={withdrawal.id} className="border-b border-stroke dark:border-strokedark">
                              <td className="px-4 py-3 text-sm text-dark dark:text-white">{withdrawal.userName}</td>
                              <td className="px-4 py-3 text-sm font-semibold text-dark dark:text-white">
                                {formatCurrency(withdrawal.amount)}
                              </td>
                              <td className="px-4 py-3">{getStatusBadge(withdrawal.status)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {dailyReport.payments.length === 0 && dailyReport.withdrawals.length === 0 && (
                  <div className="rounded-lg border border-stroke p-12 text-center dark:border-strokedark">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                      Tidak ada transaksi pada tanggal {formatDate(selectedDate, "full")}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-12 text-center text-gray-500 dark:text-gray-400">
                Tidak ada data laporan harian.
              </div>
            )}
          </div>
        )}

        {/* Angkatan Report */}
        {activeTab === "angkatan" && (
          <div className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <svg className="h-8 w-8 animate-spin text-primary" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span className="ml-3 text-gray-600 dark:text-gray-400">Memuat data...</span>
              </div>
            ) : angkatanReport.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full table-auto">
                  <thead>
                    <tr className="border-b border-stroke bg-gray-50 dark:border-strokedark dark:bg-gray-800">
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                        Angkatan
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                        Total Anggota
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                        Total Simpanan
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                        Rata-rata Simpanan
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                        Pembayaran
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                        Penarikan
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {angkatanReport.map((report, index) => (
                      <tr
                        key={report.angkatan}
                        className={`border-b border-stroke transition hover:bg-gray-50 dark:border-strokedark dark:hover:bg-gray-700/50 ${
                          index % 2 === 0 ? "bg-white dark:bg-boxdark" : "bg-gray-50 dark:bg-gray-800/50"
                        }`}
                      >
                        <td className="px-4 py-3 text-sm font-semibold text-dark dark:text-white">
                          {report.angkatan}
                        </td>
                        <td className="px-4 py-3 text-sm text-dark dark:text-white">{report.totalMembers}</td>
                        <td className="px-4 py-3 text-sm font-semibold text-dark dark:text-white">
                          {formatCurrency(report.totalSavings)}
                        </td>
                        <td className="px-4 py-3 text-sm text-dark dark:text-white">
                          {formatCurrency(report.averageSavings)}
                        </td>
                        <td className="px-4 py-3 text-sm text-dark dark:text-white">{report.totalPayments}</td>
                        <td className="px-4 py-3 text-sm text-dark dark:text-white">{report.totalWithdrawals}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-stroke bg-gray-100 dark:border-strokedark dark:bg-gray-800">
                      <td className="px-4 py-3 text-sm font-bold text-dark dark:text-white">Total</td>
                      <td className="px-4 py-3 text-sm font-bold text-dark dark:text-white">
                        {angkatanReport.reduce((sum, r) => sum + r.totalMembers, 0)}
                      </td>
                      <td className="px-4 py-3 text-sm font-bold text-dark dark:text-white">
                        {formatCurrency(angkatanReport.reduce((sum, r) => sum + r.totalSavings, 0))}
                      </td>
                      <td className="px-4 py-3 text-sm font-bold text-dark dark:text-white">
                        {formatCurrency(
                          angkatanReport.reduce((sum, r) => sum + r.averageSavings, 0) / angkatanReport.length
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm font-bold text-dark dark:text-white">
                        {angkatanReport.reduce((sum, r) => sum + r.totalPayments, 0)}
                      </td>
                      <td className="px-4 py-3 text-sm font-bold text-dark dark:text-white">
                        {angkatanReport.reduce((sum, r) => sum + r.totalWithdrawals, 0)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            ) : (
              <div className="py-12 text-center text-gray-500 dark:text-gray-400">
                Tidak ada data laporan per angkatan.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
