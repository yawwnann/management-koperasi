"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ProtectedRoute } from "@/components/protected-route";
import { withdrawalsApi } from "@/lib/api";
import { formatDate } from "@/lib/api-helpers";
import type { Withdrawal } from "@/types/api.types";

type StatusFilter = "ALL" | "PENDING" | "APPROVED" | "REJECTED";

export default function VerifikasiPenarikanPage() {
  return (
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <VerifikasiPenarikanContent />
    </ProtectedRoute>
  );
}

function VerifikasiPenarikanContent() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("PENDING");
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<Withdrawal | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
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
        setWithdrawals(response.data);
      }
    } catch (error) {
      console.error("Failed to load withdrawals:", error);
      setMessage({ type: "error", text: "Gagal memuat data penarikan." });
    } finally {
      setLoading(false);
    }
  }

  const handleApprove = useCallback(async (withdrawal: Withdrawal) => {
    setSelectedWithdrawal(withdrawal);
    setRejectionReason("");
    setShowModal(true);
  }, []);

  const handleReject = useCallback(async (withdrawal: Withdrawal) => {
    setSelectedWithdrawal(withdrawal);
    setRejectionReason("");
    setShowModal(true);
  }, []);

  const handleSubmitVerification = useCallback(async () => {
    if (!selectedWithdrawal) return;

    setProcessing(true);
    try {
      await withdrawalsApi.approve(selectedWithdrawal.id, {
        approved: true,
        rejectionReason: rejectionReason || undefined,
      });

      setMessage({ type: "success", text: "Penarikan berhasil diverifikasi." });
      setShowModal(false);
      setSelectedWithdrawal(null);
      loadWithdrawals();
    } catch (error: any) {
      setMessage({ type: "error", text: error?.message || "Gagal memverifikasi penarikan." });
    } finally {
      setProcessing(false);
    }
  }, [selectedWithdrawal, rejectionReason]);

  const handleRejectSubmit = useCallback(async () => {
    if (!selectedWithdrawal) return;

    setProcessing(true);
    try {
      await withdrawalsApi.approve(selectedWithdrawal.id, {
        approved: false,
        rejectionReason: rejectionReason || "Tidak ada alasan",
      });

      setMessage({ type: "success", text: "Penarikan berhasil ditolak." });
      setShowModal(false);
      setSelectedWithdrawal(null);
      loadWithdrawals();
    } catch (error: any) {
      setMessage({ type: "error", text: error?.message || "Gagal menolak penarikan." });
    } finally {
      setProcessing(false);
    }
  }, [selectedWithdrawal, rejectionReason]);

  const filteredWithdrawals = statusFilter === "ALL"
    ? withdrawals
    : withdrawals.filter((w) => w.status === statusFilter);

  const totalPages = Math.ceil(filteredWithdrawals.length / itemsPerPage);
  const paginatedWithdrawals = filteredWithdrawals.slice((page - 1) * itemsPerPage, page * itemsPerPage);

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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
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
          <span className="font-medium text-primary">Verifikasi Penarikan</span>
        </nav>
      </div>

      {/* Stats Cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg bg-white p-4 shadow-sm dark:bg-boxdark">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Penarikan</p>
          <p className="text-2xl font-bold text-dark dark:text-white">{withdrawals.length}</p>
        </div>
        <div className="rounded-lg bg-white p-4 shadow-sm dark:bg-boxdark">
          <p className="text-sm text-gray-500 dark:text-gray-400">Menunggu</p>
          <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
            {withdrawals.filter((w) => w.status === "PENDING").length}
          </p>
        </div>
        <div className="rounded-lg bg-white p-4 shadow-sm dark:bg-boxdark">
          <p className="text-sm text-gray-500 dark:text-gray-400">Disetujui</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
            {withdrawals.filter((w) => w.status === "APPROVED").length}
          </p>
        </div>
        <div className="rounded-lg bg-white p-4 shadow-sm dark:bg-boxdark">
          <p className="text-sm text-gray-500 dark:text-gray-400">Ditolak</p>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">
            {withdrawals.filter((w) => w.status === "REJECTED").length}
          </p>
        </div>
      </div>

      {/* Filter */}
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

      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-dark dark:text-white">Daftar Penarikan</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Total: {withdrawals.length} penarikan
          </p>
        </div>
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as StatusFilter);
              setPage(1);
            }}
            className="rounded-lg border border-stroke bg-white px-4 py-2 text-sm text-dark outline-none transition focus:border-primary dark:border-strokedark dark:text-white dark:focus:border-primary"
          >
            <option value="ALL">Semua</option>
            <option value="PENDING">Menunggu</option>
            <option value="APPROVED">Disetujui</option>
            <option value="REJECTED">Ditolak</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="rounded-sm border border-stroke bg-white p-4 shadow-default dark:border-strokedark dark:bg-boxdark">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total</p>
          <p className="mt-1 text-2xl font-bold text-dark dark:text-white">{withdrawals.length}</p>
        </div>
        <div className="rounded-sm border border-yellow-300 bg-yellow-50 p-4 shadow-default dark:border-yellow-600 dark:bg-yellow-900/20">
          <p className="text-sm text-yellow-700 dark:text-yellow-400">Menunggu</p>
          <p className="mt-1 text-2xl font-bold text-yellow-800 dark:text-yellow-300">
            {withdrawals.filter((w) => w.status === "PENDING").length}
          </p>
        </div>
        <div className="rounded-sm border border-green-300 bg-green-50 p-4 shadow-default dark:border-green-600 dark:bg-green-900/20">
          <p className="text-sm text-green-700 dark:text-green-400">Disetujui</p>
          <p className="mt-1 text-2xl font-bold text-green-800 dark:text-green-300">
            {withdrawals.filter((w) => w.status === "APPROVED").length}
          </p>
        </div>
        <div className="rounded-sm border border-red-300 bg-red-50 p-4 shadow-default dark:border-red-600 dark:bg-red-900/20">
          <p className="text-sm text-red-700 dark:text-red-400">Ditolak</p>
          <p className="mt-1 text-2xl font-bold text-red-800 dark:text-red-300">
            {withdrawals.filter((w) => w.status === "REJECTED").length}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="border-b border-stroke bg-gray-50 dark:border-strokedark dark:bg-gray-800">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  No
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Anggota
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Jumlah
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Tanggal Request
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Status
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                    <div className="flex items-center justify-center">
                      <svg className="mr-2 h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Memuat data...
                    </div>
                  </td>
                </tr>
              ) : paginatedWithdrawals.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                    Tidak ada data penarikan.
                  </td>
                </tr>
              ) : (
                paginatedWithdrawals.map((withdrawal, index) => (
                  <tr
                    key={withdrawal.id}
                    className="border-b border-stroke transition hover:bg-gray-50 dark:border-strokedark dark:hover:bg-gray-700/50"
                  >
                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                      {(page - 1) * itemsPerPage + index + 1}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-dark dark:text-white">
                      {withdrawal.userName}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-dark dark:text-white">
                      {formatCurrency(withdrawal.amount)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {formatDate(withdrawal.createdAt, "full")}
                    </td>
                    <td className="px-4 py-3">
                      {getStatusBadge(withdrawal.status)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        {withdrawal.status === "PENDING" ? (
                          <>
                            <button
                              onClick={() => handleApprove(withdrawal)}
                              className="rounded-md bg-green-500 px-3 py-1 text-xs font-medium text-white transition hover:bg-green-600"
                            >
                              Setujui
                            </button>
                            <button
                              onClick={() => handleReject(withdrawal)}
                              className="rounded-md bg-red-500 px-3 py-1 text-xs font-medium text-white transition hover:bg-red-600"
                            >
                              Tolak
                            </button>
                          </>
                        ) : (
                          <span className="text-xs text-gray-400">
                            {withdrawal.status === "APPROVED" ? "Sudah disetujui" : "Sudah ditolak"}
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-stroke px-4 py-3 dark:border-strokedark">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Halaman {page} dari {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-md border border-stroke px-3 py-1 text-sm text-gray-600 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-strokedark dark:text-gray-400 dark:hover:bg-gray-700"
              >
                Sebelumnya
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`rounded-md border px-3 py-1 text-sm transition ${
                    p === page
                      ? "border-primary bg-primary text-white"
                      : "border-stroke text-gray-600 hover:bg-gray-100 dark:border-strokedark dark:text-gray-400 dark:hover:bg-gray-700"
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="rounded-md border border-stroke px-3 py-1 text-sm text-gray-600 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-strokedark dark:text-gray-400 dark:hover:bg-gray-700"
              >
                Selanjutnya
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Verification Modal */}
      {showModal && selectedWithdrawal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-boxdark">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-dark dark:text-white">Verifikasi Penarikan</h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedWithdrawal(null);
                  setRejectionReason("");
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Withdrawal Details */}
            <div className="mb-4 rounded-md bg-gray-50 p-4 dark:bg-gray-800">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Anggota:</span>
                  <span className="font-medium text-dark dark:text-white">{selectedWithdrawal.userName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Jumlah:</span>
                  <span className="font-semibold text-dark dark:text-white">
                    {formatCurrency(selectedWithdrawal.amount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Tanggal:</span>
                  <span className="text-dark dark:text-white">{formatDate(selectedWithdrawal.createdAt, "full")}</span>
                </div>
              </div>
            </div>

            {/* Rejection Reason */}
            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium text-dark dark:text-white" htmlFor="rejectionReason">
                Alasan Penolakan (Opsional)
              </label>
              <textarea
                id="rejectionReason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Masukkan alasan penolakan..."
                rows={3}
                className="w-full rounded-lg border border-stroke bg-transparent px-4 py-2.5 text-dark outline-none transition focus:border-primary dark:border-strokedark dark:text-white dark:focus:border-primary"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedWithdrawal(null);
                  setRejectionReason("");
                }}
                className="rounded-lg border border-stroke px-4 py-2 font-medium text-gray-600 transition hover:bg-gray-100 dark:border-strokedark dark:text-gray-400 dark:hover:bg-gray-700"
                disabled={processing}
              >
                Batal
              </button>
              <button
                onClick={handleSubmitVerification}
                className="rounded-lg bg-green-500 px-4 py-2 font-medium text-white transition hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-70"
                disabled={processing}
              >
                {processing ? "Memproses..." : "Setujui"}
              </button>
              <button
                onClick={handleRejectSubmit}
                className="rounded-lg bg-red-500 px-4 py-2 font-medium text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-70"
                disabled={processing}
              >
                {processing ? "Memproses..." : "Tolak"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
