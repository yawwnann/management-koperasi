"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { ProtectedRoute } from "@/components/protected-route";
import { paymentsApi } from "@/lib/api";
import { formatDate } from "@/lib/api-helpers";
import type { Payment } from "@/types/api.types";

type StatusFilter = "ALL" | "PENDING" | "APPROVED" | "REJECTED";

export default function RiwayatPembayaranPage() {
  return (
    <ProtectedRoute allowedRoles={["ANGGOTA"]}>
      <RiwayatPembayaranContent />
    </ProtectedRoute>
  );
}

function RiwayatPembayaranContent() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    loadPayments();
  }, []);

  async function loadPayments() {
    setLoading(true);
    try {
      const response = await paymentsApi.getList();
      if (response.success && Array.isArray(response.data)) {
        setPayments(response.data);
      }
    } catch (error) {
      console.error("Failed to load payments:", error);
      setMessage({ type: "error", text: "Gagal memuat data pembayaran." });
    } finally {
      setLoading(false);
    }
  }

  const filteredPayments = statusFilter === "ALL"
    ? payments
    : payments.filter((p) => p.status === statusFilter);

  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);
  const paginatedPayments = filteredPayments.slice((page - 1) * itemsPerPage, page * itemsPerPage);

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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="mx-auto max-w-7xl">
      <Breadcrumb pageName="Riwayat Pembayaran" />

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

      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-dark dark:text-white">Riwayat Pembayaran</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Total: {payments.length} pembayaran
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
            <option value="ALL">Semua Status</option>
            <option value="PENDING">Menunggu</option>
            <option value="APPROVED">Disetujui</option>
            <option value="REJECTED">Ditolak</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-sm border border-yellow-300 bg-yellow-50 p-4 shadow-default dark:border-yellow-600 dark:bg-yellow-900/20">
          <p className="text-sm text-yellow-700 dark:text-yellow-400">Menunggu Verifikasi</p>
          <p className="mt-1 text-2xl font-bold text-yellow-800 dark:text-yellow-300">
            {payments.filter((p) => p.status === "PENDING").length}
          </p>
        </div>
        <div className="rounded-sm border border-green-300 bg-green-50 p-4 shadow-default dark:border-green-600 dark:bg-green-900/20">
          <p className="text-sm text-green-700 dark:text-green-400">Disetujui</p>
          <p className="mt-1 text-2xl font-bold text-green-800 dark:text-green-300">
            {payments.filter((p) => p.status === "APPROVED").length}
          </p>
        </div>
        <div className="rounded-sm border border-red-300 bg-red-50 p-4 shadow-default dark:border-red-600 dark:bg-red-900/20">
          <p className="text-sm text-red-700 dark:text-red-400">Ditolak</p>
          <p className="mt-1 text-2xl font-bold text-red-800 dark:text-red-300">
            {payments.filter((p) => p.status === "REJECTED").length}
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
                  Jenis Pembayaran
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Jumlah
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Tanggal
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                    <div className="flex items-center justify-center">
                      <svg className="mr-2 h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Memuat data...
                    </div>
                  </td>
                </tr>
              ) : paginatedPayments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                    Tidak ada data pembayaran.
                  </td>
                </tr>
              ) : (
                paginatedPayments.map((payment, index) => (
                  <tr
                    key={payment.id}
                    className="border-b border-stroke transition hover:bg-gray-50 dark:border-strokedark dark:hover:bg-gray-700/50"
                  >
                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                      {(page - 1) * itemsPerPage + index + 1}
                    </td>
                    <td className="px-4 py-3">
                      {getTypeBadge(payment.type)}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-dark dark:text-white">
                      {formatCurrency(payment.amount)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {formatDate(payment.createdAt, "full")}
                    </td>
                    <td className="px-4 py-3">
                      {getStatusBadge(payment.status)}
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
    </div>
  );
}
