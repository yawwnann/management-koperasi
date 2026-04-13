"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ProtectedRoute } from "@/components/protected-route";
import { reportsApi } from "@/lib/api";
import { formatDate } from "@/lib/api-helpers";
import { Calendar, Users, Wallet, TrendingUp, ArrowUpRight, ArrowDownRight, Filter, Download, Activity } from "lucide-react";

type ReportTab = "daily" | "angkatan" | "summary";

export default function LaporanPage() {
  return (
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <LaporanContent />
    </ProtectedRoute>
  );
}

function LaporanContent() {
  const [activeTab, setActiveTab] = useState<ReportTab>("daily");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [selectedAngkatan, setSelectedAngkatan] = useState("");
  const [dailyReport, setDailyReport] = useState<any>(null);
  const [angkatanReport, setAngkatanReport] = useState<any>(null);
  const [summaryReport, setSummaryReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReport();
  }, [activeTab, selectedDate, selectedAngkatan]);

  async function loadReport() {
    setLoading(true);
    try {
      if (activeTab === "daily") {
        const response = await reportsApi.getDaily(selectedDate);
        if (response.success) setDailyReport(response.data);
      } else if (activeTab === "angkatan") {
        const response = await reportsApi.getAngkatan(selectedAngkatan || undefined);
        if (response.success) setAngkatanReport(response.data);
      } else {
        const response = await reportsApi.getSummary();
        if (response.success) setSummaryReport(response.data);
      }
    } catch (error) {
      console.error("Failed to load report:", error);
    } finally {
      setLoading(false);
    }
  }

  const tabs = [
    { key: "daily" as ReportTab, label: "Laporan Harian", icon: <Calendar className="h-4 w-4" /> },
    { key: "angkatan" as ReportTab, label: "Laporan Angkatan", icon: <Users className="h-4 w-4" /> },
    { key: "summary" as ReportTab, label: "Ringkasan", icon: <Activity className="h-4 w-4" /> },
  ];

  const formatCurrency = (amount: number) => {
    if (isNaN(amount) || amount === undefined || amount === null) return "Rp 0";
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark dark:text-white">Laporan</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Analisis dan laporan transaksi koperasi
          </p>
        </div>
        <nav className="flex items-center gap-2 text-sm">
          <Link href="/" className="text-gray-500 hover:text-primary dark:text-gray-400">
            Dashboard
          </Link>
          <span className="text-gray-400">/</span>
          <span className="font-medium text-primary">Laporan</span>
        </nav>
      </div>

      {/* Tabs */}
      <div className="rounded-xl border border-stroke bg-white p-2 shadow-sm dark:border-strokedark dark:bg-boxdark">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition ${
                activeTab === tab.key
                  ? "bg-primary text-white"
                  : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-xl border border-stroke bg-white p-4 shadow-sm dark:border-strokedark dark:bg-boxdark">
        <div className="flex items-center gap-4">
          <Filter className="h-4 w-4 text-gray-400" />
          {activeTab === "daily" && (
            <div className="flex items-center gap-3">
              <label className="text-sm text-gray-600 dark:text-gray-400">Tanggal:</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="rounded-lg border border-stroke bg-white px-4 py-2 text-sm text-dark outline-none transition focus:border-primary dark:border-strokedark dark:bg-gray-800 dark:text-white dark:focus:border-primary"
              />
            </div>
          )}
          {activeTab === "angkatan" && (
            <div className="flex items-center gap-3">
              <label className="text-sm text-gray-600 dark:text-gray-400">Angkatan:</label>
              <select
                value={selectedAngkatan}
                onChange={(e) => setSelectedAngkatan(e.target.value)}
                className="rounded-lg border border-stroke bg-white px-4 py-2 text-sm text-dark outline-none transition focus:border-primary dark:border-strokedark dark:bg-gray-800 dark:text-white dark:focus:border-primary"
              >
                <option value="">Semua Angkatan</option>
                <option value="2020">2020</option>
                <option value="2021">2021</option>
                <option value="2022">2022</option>
                <option value="2023">2023</option>
                <option value="2024">2024</option>
                <option value="2025">2025</option>
              </select>
            </div>
          )}
          {activeTab === "summary" && (
            <p className="text-sm text-gray-600 dark:text-gray-400">Ringkasan data koperasi secara keseluruhan</p>
          )}
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center rounded-xl border border-stroke bg-white p-12 dark:border-strokedark dark:bg-boxdark">
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            Memuat laporan...
          </div>
        </div>
      ) : (
        <>
          {/* Daily Report */}
          {activeTab === "daily" && dailyReport && (
            <DailyReportContent report={dailyReport} date={selectedDate} formatCurrency={formatCurrency} />
          )}

          {/* Angkatan Report */}
          {activeTab === "angkatan" && angkatanReport && (
            <AngkatanReportContent report={angkatanReport} formatCurrency={formatCurrency} />
          )}

          {/* Summary Report */}
          {activeTab === "summary" && summaryReport && (
            <SummaryReportContent report={summaryReport} formatCurrency={formatCurrency} />
          )}
        </>
      )}
    </div>
  );
}

// Daily Report Content Component
function DailyReportContent({ report, date, formatCurrency }: { report: any; date: string; formatCurrency: (v: number) => string }) {
  const combinedTransactions = () => {
    if (!report) return [];
    const payments = (report.payments?.data || []).map((p: any) => ({ ...p, _type: "PEMBAYARAN" }));
    const withdrawals = (report.withdrawals?.data || []).map((w: any) => ({ ...w, _type: "PENARIKAN" }));
    return [...payments, ...withdrawals].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  };

  const transactions = combinedTransactions();

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-stroke bg-white p-5 shadow-sm dark:border-strokedark dark:bg-boxdark">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Kas Masuk</p>
              <p className="mt-1 text-2xl font-bold text-green-600 dark:text-green-400">{formatCurrency(report.payments?.totalApproved || 0)}</p>
              <p className="mt-1 text-xs text-gray-500">{report.payments?.count || 0} transaksi disetujui</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 dark:bg-green-900/30">
              <ArrowUpRight className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-stroke bg-white p-5 shadow-sm dark:border-strokedark dark:bg-boxdark">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Kas Keluar</p>
              <p className="mt-1 text-2xl font-bold text-red-600 dark:text-red-400">{formatCurrency(report.withdrawals?.totalApproved || 0)}</p>
              <p className="mt-1 text-xs text-gray-500">{report.withdrawals?.count || 0} transaksi disetujui</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-100 dark:bg-red-900/30">
              <ArrowDownRight className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-stroke bg-white p-5 shadow-sm dark:border-strokedark dark:bg-boxdark">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Net Balance</p>
              <p className="mt-1 text-2xl font-bold text-blue-600 dark:text-blue-400">{formatCurrency(report.netTotal || 0)}</p>
              <p className="mt-1 text-xs text-gray-500">{formatDate(date)}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/30">
              <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="rounded-xl border border-stroke bg-white shadow-sm dark:border-strokedark dark:bg-boxdark">
        <div className="flex items-center justify-between border-b border-stroke px-6 py-4 dark:border-strokedark">
          <h3 className="text-lg font-semibold text-dark dark:text-white">Transaksi</h3>
          <button className="flex items-center gap-2 rounded-lg border border-stroke px-4 py-2 text-sm text-gray-600 transition hover:bg-gray-100 dark:border-strokedark dark:text-gray-400 dark:hover:bg-gray-700">
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-stroke dark:border-strokedark">
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Pengguna</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Tipe</th>
                <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Nominal</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Waktu</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stroke dark:divide-strokedark">
              {transactions.length > 0 ? (
                transactions.map((t: any, index: number) => (
                  <tr key={`${t._type}-${t.id}`} className="transition hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-dark dark:text-white">{t.user?.name || "Unknown"}</p>
                      <p className="text-xs text-gray-500">{t.user?.email || "-"}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                        t._type === "PEMBAYARAN"
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                      }`}>
                        {t._type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-sm font-semibold text-dark dark:text-white">{formatCurrency(Number(t.nominal))}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {new Date(t.createdAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                        t.status === "APPROVED"
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : t.status === "PENDING"
                            ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                            : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                      }`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${
                          t.status === "APPROVED" ? "bg-green-500" : t.status === "PENDING" ? "bg-yellow-500" : "bg-red-500"
                        }`} />
                        {t.status === "APPROVED" ? "Disetujui" : t.status === "PENDING" ? "Pending" : "Ditolak"}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    <Calendar className="mx-auto mb-2 h-8 w-8 opacity-40" />
                    <p className="font-medium">Tidak ada transaksi</p>
                    <p className="text-sm">Belum ada transaksi pada tanggal ini</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Angkatan Report Content Component
function AngkatanReportContent({ report, formatCurrency }: { report: any; formatCurrency: (v: number) => string }) {
  const angkatanList = Array.isArray(report) ? report : report ? [report] : [];

  return (
    <div className="space-y-6">
      {angkatanList.length > 0 ? (
        angkatanList.map((ar: any, index: number) => (
          <div key={ar.angkatan || index} className="rounded-xl border border-stroke bg-white shadow-sm dark:border-strokedark dark:bg-boxdark">
            <div className="border-b border-stroke px-6 py-4 dark:border-strokedark">
              <h3 className="text-lg font-semibold text-dark dark:text-white">
                Angkatan {ar.angkatan || "Tidak Diketahui"}
              </h3>
            </div>
            <div className="p-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-lg border border-stroke bg-gray-50 p-4 dark:border-strokedark dark:bg-gray-800/50">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Anggota</p>
                  <p className="mt-1 text-2xl font-bold text-blue-600 dark:text-blue-400">{ar.totalMembers || 0}</p>
                </div>
                <div className="rounded-lg border border-stroke bg-gray-50 p-4 dark:border-strokedark dark:bg-gray-800/50">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Simpanan</p>
                  <p className="mt-1 text-2xl font-bold text-green-600 dark:text-green-400">{formatCurrency(ar.totalSavings || 0)}</p>
                </div>
                <div className="rounded-lg border border-stroke bg-gray-50 p-4 dark:border-strokedark dark:bg-gray-800/50">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Kas Masuk</p>
                  <p className="mt-1 text-2xl font-bold text-gray-700 dark:text-gray-300">{formatCurrency(ar.totalPayments || 0)}</p>
                </div>
                <div className="rounded-lg border border-stroke bg-gray-50 p-4 dark:border-strokedark dark:bg-gray-800/50">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Rata-rata</p>
                  <p className="mt-1 text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {formatCurrency((ar.totalSavings || 0) / (ar.totalMembers || 1))}
                  </p>
                </div>
              </div>

              {/* Members Table */}
              {ar.members && ar.members.length > 0 && (
                <div className="mt-6">
                  <h4 className="mb-4 text-sm font-semibold text-dark dark:text-white">Daftar Anggota</h4>
                  <div className="overflow-hidden rounded-lg border border-stroke dark:border-strokedark">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-stroke bg-gray-50 dark:border-strokedark dark:bg-gray-800">
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">Nama</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">Email</th>
                          <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400">Saldo</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stroke dark:divide-strokedark">
                        {ar.members.map((m: any) => (
                          <tr key={m.id} className="transition hover:bg-gray-50 dark:hover:bg-gray-800/50">
                            <td className="px-4 py-3 text-sm text-dark dark:text-white">{m.name}</td>
                            <td className="px-4 py-3 text-sm text-gray-500">{m.email}</td>
                            <td className="px-4 py-3 text-right text-sm font-semibold text-green-600 dark:text-green-400">
                              {formatCurrency(m.savings || 0)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))
      ) : (
        <div className="rounded-xl border border-stroke bg-white p-12 text-center dark:border-strokedark dark:bg-boxdark">
          <Users className="mx-auto mb-2 h-8 w-8 opacity-40" />
          <p className="font-medium text-gray-500 dark:text-gray-400">Tidak ada data angkatan</p>
        </div>
      )}
    </div>
  );
}

// Summary Report Content Component
function SummaryReportContent({ report, formatCurrency }: { report: any; formatCurrency: (v: number) => string }) {
  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border border-stroke bg-white p-5 shadow-sm dark:border-strokedark dark:bg-boxdark">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/30">
              <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Pengguna</p>
              <p className="mt-1 text-2xl font-bold text-dark dark:text-white">{report.totalUsers || 0}</p>
              <p className="mt-1 text-xs text-gray-500">{report.totalAnggota || 0} anggota aktif</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-stroke bg-white p-5 shadow-sm dark:border-strokedark dark:bg-boxdark">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 dark:bg-green-900/30">
              <Wallet className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Simpanan</p>
              <p className="mt-1 text-2xl font-bold text-dark dark:text-white">{formatCurrency(report.totalSavings || 0)}</p>
              <p className="mt-1 text-xs text-gray-500">Kumulatif saldo anggota</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-stroke bg-white p-5 shadow-sm dark:border-strokedark dark:bg-boxdark">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-100 dark:bg-yellow-900/30">
              <Activity className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Pending Actions</p>
              <p className="mt-1 text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {(report.pendingPayments || 0) + (report.pendingWithdrawals || 0)}
              </p>
              <p className="mt-1 text-xs text-gray-500">
                {report.pendingPayments || 0} pembayaran / {report.pendingWithdrawals || 0} penarikan
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction Summary */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-stroke bg-white p-5 shadow-sm dark:border-strokedark dark:bg-boxdark">
          <h4 className="mb-4 text-sm font-semibold text-dark dark:text-white">Ringkasan Pembayaran</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-400">Total Pembayaran</span>
              <span className="text-sm font-semibold text-dark dark:text-white">{report.totalPayments || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-400">Disetujui</span>
              <span className="text-sm font-semibold text-green-600 dark:text-green-400">{report.approvedPayments || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-400">Pending</span>
              <span className="text-sm font-semibold text-yellow-600 dark:text-yellow-400">{report.pendingPayments || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-400">Ditolak</span>
              <span className="text-sm font-semibold text-red-600 dark:text-red-400">{report.rejectedPayments || 0}</span>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-stroke bg-white p-5 shadow-sm dark:border-strokedark dark:bg-boxdark">
          <h4 className="mb-4 text-sm font-semibold text-dark dark:text-white">Ringkasan Penarikan</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-400">Total Penarikan</span>
              <span className="text-sm font-semibold text-dark dark:text-white">{report.totalWithdrawals || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-400">Disetujui</span>
              <span className="text-sm font-semibold text-green-600 dark:text-green-400">{report.approvedWithdrawals || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-400">Pending</span>
              <span className="text-sm font-semibold text-yellow-600 dark:text-yellow-400">{report.pendingWithdrawals || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-400">Ditolak</span>
              <span className="text-sm font-semibold text-red-600 dark:text-red-400">{report.rejectedWithdrawals || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
