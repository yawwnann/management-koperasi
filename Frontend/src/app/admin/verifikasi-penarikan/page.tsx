"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ProtectedRoute } from "@/components/protected-route";
import { withdrawalsApi } from "@/lib/api";
import { formatDate } from "@/lib/api-helpers";
import {
  Check,
  X,
  Clock,
  FileText,
  Filter,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

type StatusFilter = "ALL" | "PENDING" | "APPROVED" | "REJECTED";

export default function VerifikasiPenarikanPage() {
  return (
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <VerifikasiPenarikanContent />
    </ProtectedRoute>
  );
}

function VerifikasiPenarikanContent() {
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("PENDING");
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<any | null>(
    null,
  );
  const [showModal, setShowModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    loadWithdrawals();
  }, [statusFilter]);

  async function loadWithdrawals() {
    setLoading(true);
    try {
      const response = await withdrawalsApi.getList();
      if (response.success && Array.isArray(response.data)) {
        const transformedWithdrawals = response.data.map((withdrawal: any) => ({
          id: withdrawal.id,
          userId: withdrawal.userId,
          userName: withdrawal.user?.name || "Unknown",
          userAvatar: withdrawal.user?.name?.charAt(0).toUpperCase() || "U",
          nominal: Number(withdrawal.nominal) || 0,
          amount: Number(withdrawal.nominal) || 0,
          reason: withdrawal.reason || "-",
          status: withdrawal.status,
          createdAt: withdrawal.createdAt,
          updatedAt: withdrawal.updatedAt,
        }));
        setWithdrawals(transformedWithdrawals);
      }
    } catch (error) {
      console.error("Failed to load withdrawals:", error);
      setMessage({ type: "error", text: "Gagal memuat data penarikan." });
    } finally {
      setLoading(false);
    }
  }

  const handleApprove = useCallback(async (withdrawal: any) => {
    setSelectedWithdrawal(withdrawal);
    setRejectionReason("");
    setShowModal(true);
  }, []);

  const handleReject = useCallback(async (withdrawal: any) => {
    setSelectedWithdrawal(withdrawal);
    setRejectionReason("");
    setShowModal(true);
  }, []);

  const handleSubmitVerification = useCallback(async () => {
    if (!selectedWithdrawal) return;

    setProcessing(true);
    try {
      await withdrawalsApi.approve(selectedWithdrawal.id, {
        status: "APPROVED",
        rejectionReason: rejectionReason || undefined,
      });

      setMessage({ type: "success", text: "Penarikan berhasil diverifikasi." });
      setShowModal(false);
      setSelectedWithdrawal(null);
      loadWithdrawals();
    } catch (error: any) {
      setMessage({
        type: "error",
        text: error?.message || "Gagal memverifikasi penarikan.",
      });
    } finally {
      setProcessing(false);
    }
  }, [selectedWithdrawal, rejectionReason]);

  const handleRejectSubmit = useCallback(async () => {
    if (!selectedWithdrawal) return;

    setProcessing(true);
    try {
      await withdrawalsApi.approve(selectedWithdrawal.id, {
        status: "REJECTED",
        rejectionReason: rejectionReason || "Tidak ada alasan",
      });

      setMessage({ type: "success", text: "Penarikan berhasil ditolak." });
      setShowModal(false);
      setSelectedWithdrawal(null);
      loadWithdrawals();
    } catch (error: any) {
      setMessage({
        type: "error",
        text: error?.message || "Gagal menolak penarikan.",
      });
    } finally {
      setProcessing(false);
    }
  }, [selectedWithdrawal, rejectionReason]);

  const filteredWithdrawals =
    statusFilter === "ALL"
      ? withdrawals
      : withdrawals.filter((w) => w.status === statusFilter);
  const totalPages = Math.ceil(filteredWithdrawals.length / itemsPerPage);
  const paginatedWithdrawals = filteredWithdrawals.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage,
  );

  const stats = [
    {
      label: "Total Penarikan",
      value: withdrawals.length,
      icon: <FileText className="h-5 w-5" />,
      color: "bg-blue-500",
      bgColor: "bg-blue-100 dark:bg-blue-900/30",
      textColor: "text-blue-600 dark:text-blue-400",
    },
    {
      label: "Menunggu Verifikasi",
      value: withdrawals.filter((w) => w.status === "PENDING").length,
      icon: <Clock className="h-5 w-5" />,
      color: "bg-yellow-500",
      bgColor: "bg-yellow-100 dark:bg-yellow-900/30",
      textColor: "text-yellow-600 dark:text-yellow-400",
    },
    {
      label: "Disetujui",
      value: withdrawals.filter((w) => w.status === "APPROVED").length,
      icon: <Check className="h-5 w-5" />,
      color: "bg-blue-500",
      bgColor: "bg-blue-100 dark:bg-blue-900/30",
      textColor: "text-blue-600 dark:text-blue-400",
    },
    {
      label: "Ditolak",
      value: withdrawals.filter((w) => w.status === "REJECTED").length,
      icon: <X className="h-5 w-5" />,
      color: "bg-red-500",
      bgColor: "bg-red-100 dark:bg-red-900/30",
      textColor: "text-red-600 dark:text-red-400",
    },
  ];

  const tabs = [
    { key: "ALL", label: "Semua", count: withdrawals.length },
    {
      key: "PENDING",
      label: "Menunggu",
      count: withdrawals.filter((w) => w.status === "PENDING").length,
    },
    {
      key: "APPROVED",
      label: "Disetujui",
      count: withdrawals.filter((w) => w.status === "APPROVED").length,
    },
    {
      key: "REJECTED",
      label: "Ditolak",
      count: withdrawals.filter((w) => w.status === "REJECTED").length,
    },
  ];

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "PENDING":
        return {
          label: "Menunggu",
          bg: "bg-yellow-100 dark:bg-yellow-900/30",
          text: "text-yellow-700 dark:text-yellow-400",
          dot: "bg-yellow-500",
        };
      case "APPROVED":
        return {
          label: "Disetujui",
          bg: "bg-blue-100 dark:bg-blue-900/30",
          text: "text-blue-700 dark:text-blue-400",
          dot: "bg-blue-500",
        };
      case "REJECTED":
        return {
          label: "Ditolak",
          bg: "bg-red-100 dark:bg-red-900/30",
          text: "text-red-700 dark:text-red-400",
          dot: "bg-red-500",
        };
      default:
        return {
          label: status,
          bg: "bg-gray-100 dark:bg-gray-700",
          text: "text-gray-700 dark:text-gray-300",
          dot: "bg-gray-500",
        };
    }
  };

  const formatCurrency = (amount: number) => {
    if (isNaN(amount) || amount === undefined || amount === null) return "Rp 0";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark dark:text-white">
            Verifikasi Penarikan
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Kelola dan verifikasi penarikan dana anggota koperasi
          </p>
        </div>
        <nav className="flex items-center gap-2 text-sm">
          <Link
            href="/"
            className="text-gray-500 hover:text-primary dark:text-gray-400"
          >
            Dashboard
          </Link>
          <span className="text-gray-400">/</span>
          <span className="font-medium text-primary">Verifikasi Penarikan</span>
        </nav>
      </div>

      {/* Alert Message */}
      {message && (
        <div
          className={`flex items-center gap-3 rounded-lg border p-4 ${
            message.type === "success"
              ? "border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
              : "border-red-300 bg-red-50 text-red-700 dark:border-red-600 dark:bg-red-900/20 dark:text-red-400"
          }`}
        >
          <span className="text-sm font-medium">{message.text}</span>
          <button
            onClick={() => setMessage(null)}
            className="ml-auto text-current opacity-60 hover:opacity-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-stroke bg-white p-5 shadow-sm dark:border-strokedark dark:bg-boxdark"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {stat.label}
                </p>
                <p className={`mt-2 text-3xl font-bold ${stat.textColor}`}>
                  {stat.value}
                </p>
              </div>
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.bgColor} ${stat.textColor}`}
              >
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs & Table */}
      <div className="rounded-xl border border-stroke bg-white shadow-sm dark:border-strokedark dark:bg-boxdark">
        {/* Tabs */}
        <div className="border-b border-stroke px-6 pt-6 dark:border-strokedark">
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => {
                  setStatusFilter(tab.key as StatusFilter);
                  setPage(1);
                }}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${
                  statusFilter === tab.key
                    ? "bg-primary text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                }`}
              >
                {tab.label}
                <span
                  className={`rounded-full px-2 py-0.5 text-xs ${
                    statusFilter === tab.key
                      ? "bg-white/20 text-white"
                      : "bg-gray-200 text-gray-600 dark:bg-gray-600 dark:text-gray-300"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-stroke dark:border-strokedark">
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Anggota
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Jumlah
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Jenis
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Alasan
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Tanggal
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Status
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stroke dark:divide-strokedark">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center gap-2 text-gray-500 dark:text-gray-400">
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                      Memuat data...
                    </div>
                  </td>
                </tr>
              ) : paginatedWithdrawals.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-12 text-center text-gray-500 dark:text-gray-400"
                  >
                    <Filter className="mx-auto mb-2 h-8 w-8 opacity-40" />
                    <p className="font-medium">Tidak ada data penarikan</p>
                    <p className="text-sm">
                      Belum ada penarikan dengan filter ini
                    </p>
                  </td>
                </tr>
              ) : (
                paginatedWithdrawals.map((withdrawal) => {
                  const statusConfig = getStatusConfig(withdrawal.status);
                  return (
                    <tr
                      key={withdrawal.id}
                      className="transition hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                            {withdrawal.userAvatar}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-dark dark:text-white">
                              {withdrawal.userName}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              ID: {withdrawal.id.slice(0, 8)}...
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-semibold text-dark dark:text-white">
                          {formatCurrency(withdrawal.nominal)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {withdrawal.paymentMethod === "Cash"
                            ? "Tunai"
                            : "Transfer Bank"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="line-clamp-1 max-w-xs text-sm text-gray-600 dark:text-gray-400">
                          {withdrawal.reason}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {formatDate(withdrawal.createdAt, "full")}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${statusConfig.dot}`}
                          />
                          {statusConfig.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          {withdrawal.status === "PENDING" ? (
                            <>
                              <button
                                onClick={() => handleApprove(withdrawal)}
                                className="flex items-center gap-1.5 rounded-lg bg-blue-500 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-blue-600"
                              >
                                <Check className="h-3.5 w-3.5" />
                                Setujui
                              </button>
                              <button
                                onClick={() => handleReject(withdrawal)}
                                className="flex items-center gap-1.5 rounded-lg bg-red-500 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-red-600"
                              >
                                <X className="h-3.5 w-3.5" />
                                Tolak
                              </button>
                            </>
                          ) : (
                            <span className="text-xs text-gray-400">
                              {withdrawal.status === "APPROVED"
                                ? "Sudah disetujui"
                                : "Sudah ditolak"}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-stroke px-6 py-4 dark:border-strokedark">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Menampilkan {(page - 1) * itemsPerPage + 1}–
              {Math.min(page * itemsPerPage, filteredWithdrawals.length)} dari{" "}
              {filteredWithdrawals.length} data
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-lg p-2 text-gray-600 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 dark:text-gray-400 dark:hover:bg-gray-700"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
                if (p > totalPages) return null;
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium transition ${
                      p === page
                        ? "bg-primary text-white"
                        : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                    }`}
                  >
                    {p}
                  </button>
                );
              })}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="rounded-lg p-2 text-gray-600 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 dark:text-gray-400 dark:hover:bg-gray-700"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Verification Modal */}
      {showModal && selectedWithdrawal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-boxdark">
            {/* Modal Header */}
            <div className="border-b border-stroke bg-gray-50 px-6 py-4 dark:border-strokedark dark:bg-gray-800">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-dark dark:text-white">
                  Verifikasi Penarikan
                </h3>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setSelectedWithdrawal(null);
                    setRejectionReason("");
                  }}
                  className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-200 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {/* Withdrawal Info Card */}
              <div className="mb-6 rounded-xl border border-stroke bg-gray-50 p-4 dark:border-strokedark dark:bg-gray-800/50">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Anggota</p>
                    <p className="mt-1 font-medium text-dark dark:text-white">
                      {selectedWithdrawal.userName}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Jumlah</p>
                    <p className="mt-1 text-lg font-bold text-dark dark:text-white">
                      {formatCurrency(selectedWithdrawal.nominal)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">
                      Jenis Simpanan
                    </p>
                    <p className="mt-1 font-medium text-dark dark:text-white">
                      Simpanan {selectedWithdrawal.savingType}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">
                      Tanggal Request
                    </p>
                    <p className="mt-1 font-medium text-dark dark:text-white">
                      {formatDate(selectedWithdrawal.createdAt, "full")}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-gray-500 dark:text-gray-400">
                      Alasan Penarikan
                    </p>
                    <p className="mt-1 font-medium text-dark dark:text-white">
                      {selectedWithdrawal.reason}
                    </p>
                  </div>
                </div>
              </div>

              {/* Rejection Reason */}
              <div>
                <label className="mb-2 block text-sm font-medium text-dark dark:text-white">
                  Alasan Penolakan{" "}
                  <span className="text-gray-400">(opsional)</span>
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Masukkan alasan penolakan..."
                  rows={3}
                  className="w-full rounded-xl border border-stroke bg-white px-4 py-3 text-sm text-dark outline-none transition focus:border-primary dark:border-strokedark dark:bg-gray-800 dark:text-white dark:focus:border-primary"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 border-t border-stroke bg-gray-50 px-6 py-4 dark:border-strokedark dark:bg-gray-800">
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedWithdrawal(null);
                  setRejectionReason("");
                }}
                className="rounded-xl px-5 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-700"
                disabled={processing}
              >
                Batal
              </button>
              <button
                onClick={handleSubmitVerification}
                className="flex items-center gap-2 rounded-xl bg-blue-500 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={processing}
              >
                <Check className="h-4 w-4" />
                {processing ? "Memproses..." : "Setujui"}
              </button>
              <button
                onClick={handleRejectSubmit}
                className="flex items-center gap-2 rounded-xl bg-red-500 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={processing}
              >
                <X className="h-4 w-4" />
                {processing ? "Memproses..." : "Tolak"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
