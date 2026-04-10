"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ProtectedRoute } from "@/components/protected-route";
import { savingsApi } from "@/lib/api";
import type { Saving } from "@/types/api.types";

export default function KeuanganPage() {
  return (
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <KeuanganContent />
    </ProtectedRoute>
  );
}

function KeuanganContent() {
  const [savings, setSavings] = useState<Saving[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    loadSavings();
  }, []);

  async function loadSavings() {
    setLoading(true);
    try {
      const response = await savingsApi.getAllSavings();
      if (response.success && Array.isArray(response.data)) {
        setSavings(response.data);
      }
    } catch (error) {
      console.error("Failed to load savings:", error);
      setMessage({ type: "error", text: "Gagal memuat data keuangan." });
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

  const totalSavings = savings.reduce((sum, s) => sum + (s.total || 0), 0);

  return (
    <div className="mx-auto max-w-7xl">
      {/* Breadcrumb - compact version without title */}
      <div className="mb-6 flex items-center justify-between">
        <nav className="flex items-center gap-2 text-sm">
          <Link href="/" className="font-medium text-gray-500 hover:text-primary dark:text-gray-400">
            Dashboard
          </Link>
          <span className="text-gray-400">/</span>
          <span className="font-medium text-primary">Keuangan</span>
        </nav>
      </div>

      {/* Stats Cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg bg-white p-4 shadow-sm dark:bg-boxdark">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Anggota</p>
          <p className="text-2xl font-bold text-dark dark:text-white">{savings.length}</p>
        </div>
        <div className="rounded-lg bg-white p-4 shadow-sm dark:bg-boxdark">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Simpanan</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
            {formatCurrency(totalSavings)}
          </p>
        </div>
        <div className="rounded-lg bg-white p-4 shadow-sm dark:bg-boxdark">
          <p className="text-sm text-gray-500 dark:text-gray-400">Rata-rata per Anggota</p>
          <p className="text-2xl font-bold text-primary dark:text-primary">
            {savings.length > 0 ? formatCurrency(totalSavings / savings.length) : formatCurrency(0)}
          </p>
        </div>
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

      {/* Header */}
      <div className="mb-6 rounded-lg bg-white p-4 shadow-sm dark:bg-boxdark">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-dark dark:text-white">Data Simpanan Anggota</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Total simpanan dari semua anggota
            </p>
          </div>
          <button
            onClick={loadSavings}
            className="inline-flex items-center justify-center rounded-lg border border-stroke px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100 dark:border-strokedark dark:text-gray-400 dark:hover:bg-gray-700"
          >
            <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
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
                  Nama Anggota
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Email
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Angkatan
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Total Simpanan
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
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                      </svg>
                      Memuat data...
                    </div>
                  </td>
                </tr>
              ) : savings.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                    Belum ada data simpanan.
                  </td>
                </tr>
              ) : (
                savings.map((saving, index) => (
                  <tr
                    key={saving.userId}
                    className="border-b border-stroke transition hover:bg-gray-50 dark:border-strokedark dark:hover:bg-gray-700/50"
                  >
                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                      {index + 1}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-dark dark:text-white">
                      {saving.user?.name || "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {saving.user?.email || "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {saving.user?.angkatan || "-"}
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-semibold text-green-600 dark:text-green-400">
                      {formatCurrency(saving.total || 0)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {savings.length > 0 && (
              <tfoot>
                <tr className="border-t border-stroke bg-gray-50 dark:border-strokedark dark:bg-gray-800">
                  <td colSpan={4} className="px-4 py-3 text-sm font-semibold text-dark dark:text-white">
                    TOTAL
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-bold text-green-600 dark:text-green-400">
                    {formatCurrency(totalSavings)}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
}
