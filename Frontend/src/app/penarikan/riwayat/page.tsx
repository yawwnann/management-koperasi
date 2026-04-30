"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { ProtectedRoute } from "@/components/protected-route";
import { withdrawalsApi } from "@/lib/api";
import { formatDate } from "@/lib/api-helpers";

type StatusFilter = "ALL" | "PENDING" | "APPROVED" | "REJECTED";

export default function RiwayatPenarikanPage() {
  return (
    <ProtectedRoute allowedRoles={["ANGGOTA"]}>
      <RiwayatPenarikanContent />
    </ProtectedRoute>
  );
}

function RiwayatPenarikanContent() {
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [page, setPage] = useState(1);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<any>(null);
  const itemsPerPage = 10;

  useEffect(() => {
    loadWithdrawals();
  }, [statusFilter]);

  async function loadWithdrawals() {
    setLoading(true);
    try {
      const queryParams: Record<string, string> = {};
      if (statusFilter !== "ALL") {
        queryParams.status = statusFilter;
      }

      const response = await withdrawalsApi.getList(queryParams);
      if (response.success && Array.isArray(response.data)) {
        // Map backend data to frontend format
        const mappedWithdrawals = response.data.map((w: any) => ({
          id: w.id,
          amount: Number(w.nominal) || 0,
          reason: w.reason || "-",
          status: w.status,
          createdAt: w.createdAt,
          user: w.user,
          verifiedAt: w.verifiedAt,
        }));
        setWithdrawals(mappedWithdrawals);
        setPage(1);
      }
    } catch (error) {
      console.error("Failed to load withdrawals:", error);
      setMessage({ type: "error", text: "Gagal memuat data penarikan." });
    } finally {
      setLoading(false);
    }
  }

  const handleViewDetail = (withdrawal: any) => {
    setSelectedWithdrawal(withdrawal);
    setShowDetail(true);
  };

  const handleCloseDetail = () => {
    setShowDetail(false);
    setSelectedWithdrawal(null);
  };

  const filteredWithdrawals =
    statusFilter === "ALL"
      ? withdrawals
      : withdrawals.filter((w) => w.status === statusFilter);

  const totalPages = Math.ceil(filteredWithdrawals.length / itemsPerPage);
  const paginatedWithdrawals = filteredWithdrawals.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage,
  );

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      APPROVED: {
        label: "Disetujui",
        className:
          "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
      },
      PENDING: {
        label: "Menunggu",
        className:
          "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
      },
      REJECTED: {
        label: "Ditolak",
        className:
          "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
      },
    };
    const config = statusMap[status] || {
      label: status,
      className:
        "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
    };
    return (
      <span
        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${config.className}`}
      >
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
    <div className="mx-auto">
      {/* Header Section */}
      <div className="mb-6">
        <Breadcrumb pageName="Riwayat Penarikan" />
      </div>

      {/* Message */}
      {message && (
        <div
          className={`mb-6 rounded-lg border p-4 ${
            message.type === "success"
              ? "border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
              : "border-red-300 bg-red-50 text-red-700 dark:border-red-600 dark:bg-red-900/20 dark:text-red-400"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Stats Cards - Modern Style */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Penarikan */}
        <div className="rounded-xl border border-stroke bg-white p-5 shadow-sm dark:border-strokedark dark:bg-boxdark">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Total Penarikan
              </p>
              <p className="mt-1 text-3xl font-bold text-primary">
                {withdrawals.length}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 text-primary dark:bg-blue-900/30">
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Menunggu */}
        <div className="rounded-xl border border-stroke bg-white p-5 shadow-sm dark:border-strokedark dark:bg-boxdark">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Menunggu Verifikasi
              </p>
              <p className="mt-1 text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                {withdrawals.filter((w) => w.status === "PENDING").length}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30">
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Disetujui */}
        <div className="rounded-xl border border-stroke bg-white p-5 shadow-sm dark:border-strokedark dark:bg-boxdark">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Disetujui
              </p>
              <p className="mt-1 text-3xl font-bold text-blue-600 dark:text-blue-400">
                {withdrawals.filter((w) => w.status === "APPROVED").length}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/30">
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Ditolak */}
        <div className="rounded-xl border border-stroke bg-white p-5 shadow-sm dark:border-strokedark dark:bg-boxdark">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Ditolak
              </p>
              <p className="mt-1 text-3xl font-bold text-red-600 dark:text-red-400">
                {withdrawals.filter((w) => w.status === "REJECTED").length}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-100 text-red-600 dark:bg-red-900/30">
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Table Card */}
      <div className="rounded-xl border border-stroke bg-white shadow-sm dark:border-strokedark dark:bg-boxdark">
        {/* Table Header with Tabs */}
        <div className="border-b border-stroke p-4 dark:border-strokedark">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setStatusFilter("ALL")}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                statusFilter === "ALL"
                  ? "bg-primary text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              }`}
            >
              Semua{" "}
              <span className="ml-1 text-xs opacity-75">
                {withdrawals.length}
              </span>
            </button>
            <button
              onClick={() => setStatusFilter("PENDING")}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                statusFilter === "PENDING"
                  ? "bg-yellow-500 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              }`}
            >
              Menunggu{" "}
              <span className="ml-1 text-xs opacity-75">
                {withdrawals.filter((w) => w.status === "PENDING").length}
              </span>
            </button>
            <button
              onClick={() => setStatusFilter("APPROVED")}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                statusFilter === "APPROVED"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              }`}
            >
              Disetujui{" "}
              <span className="ml-1 text-xs opacity-75">
                {withdrawals.filter((w) => w.status === "APPROVED").length}
              </span>
            </button>
            <button
              onClick={() => setStatusFilter("REJECTED")}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                statusFilter === "REJECTED"
                  ? "bg-red-500 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              }`}
            >
              Ditolak{" "}
              <span className="ml-1 text-xs opacity-75">
                {withdrawals.filter((w) => w.status === "REJECTED").length}
              </span>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-stroke bg-gray-50 dark:border-strokedark dark:bg-gray-800">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Jumlah
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Jenis
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Alasan
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Tanggal
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Status
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stroke dark:divide-strokedark">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center">
                    <div className="flex items-center justify-center">
                      <svg
                        className="mr-2 h-5 w-5 animate-spin text-primary"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                      </svg>
                      <span className="text-gray-500 dark:text-gray-400">
                        Memuat data...
                      </span>
                    </div>
                  </td>
                </tr>
              ) : filteredWithdrawals.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <svg
                        className="mb-3 h-12 w-12 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                      </svg>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Tidak ada data penarikan
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedWithdrawals.map((withdrawal) => (
                  <tr
                    key={withdrawal.id}
                    className="transition hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  >
                    <td className="px-4 py-4">
                      <p className="font-semibold text-dark dark:text-white">
                        {formatCurrency(withdrawal.amount)}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {withdrawal.savingType}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {withdrawal.reason}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {formatDate(withdrawal.createdAt)}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      {getStatusBadge(withdrawal.status)}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleViewDetail(withdrawal)}
                          className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-primary dark:hover:bg-gray-700 dark:hover:text-primary"
                          title="Lihat Detail"
                        >
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                        </button>
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
              Menampilkan {(page - 1) * itemsPerPage + 1} -{" "}
              {Math.min(page * itemsPerPage, filteredWithdrawals.length)} dari{" "}
              {filteredWithdrawals.length} data
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-lg border border-stroke px-3 py-1 text-sm text-gray-600 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-strokedark dark:text-gray-400 dark:hover:bg-gray-700"
              >
                Sebelumnya
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`rounded-lg border px-3 py-1 text-sm transition ${
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
                className="rounded-lg border border-stroke px-3 py-1 text-sm text-gray-600 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-strokedark dark:text-gray-400 dark:hover:bg-gray-700"
              >
                Selanjutnya
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetail && selectedWithdrawal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-stroke bg-white shadow-xl dark:border-strokedark dark:bg-boxdark">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-stroke px-6 py-4 dark:border-strokedark">
              <h3 className="text-lg font-semibold text-dark dark:text-white">
                Detail Penarikan
              </h3>
              <button
                onClick={handleCloseDetail}
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-dark dark:hover:bg-gray-700 dark:hover:text-white"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {/* Withdrawal Info */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Jumlah Penarikan
                    </p>
                    <p className="mt-1 text-lg font-bold text-primary">
                      {formatCurrency(selectedWithdrawal.amount)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Status
                    </p>
                    <div className="mt-1">
                      {getStatusBadge(selectedWithdrawal.status)}
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Jenis Simpanan
                  </p>
                  <p className="mt-1 font-medium text-dark dark:text-white">
                    Simpanan {selectedWithdrawal.savingType}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Alasan Penarikan
                  </p>
                  <p className="mt-1 font-medium text-dark dark:text-white">
                    {selectedWithdrawal.reason}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Tanggal Request
                    </p>
                    <p className="mt-1 font-medium text-dark dark:text-white">
                      {formatDate(selectedWithdrawal.createdAt)}
                    </p>
                  </div>
                  {selectedWithdrawal.verifiedAt && (
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Tanggal Verifikasi
                      </p>
                      <p className="mt-1 font-medium text-dark dark:text-white">
                        {formatDate(selectedWithdrawal.verifiedAt)}
                      </p>
                    </div>
                  )}
                </div>

                {selectedWithdrawal.user && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Nama Anggota
                    </p>
                    <p className="mt-1 font-medium text-dark dark:text-white">
                      {selectedWithdrawal.user.name}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end border-t border-stroke px-6 py-4 dark:border-strokedark">
              <button
                onClick={handleCloseDetail}
                className="rounded-lg border border-stroke bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-strokedark dark:bg-boxdark dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
