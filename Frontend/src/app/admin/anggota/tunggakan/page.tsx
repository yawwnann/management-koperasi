"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ProtectedRoute } from "@/components/protected-route";
import { usersApi } from "@/lib/api";
import { User as UserIcon, AlertTriangle } from "lucide-react";

interface DelinquentUser {
  id: string;
  name: string;
  email: string;
  angkatan: string;
  nim: string | null;
  fakultas: string | null;
  prodi: string | null;
  phone: string | null;
  photo: string | null;
  lastPaymentDate: string | null;
  monthsWithoutPayment: number;
}

export default function TunggakanPage() {
  return (
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <TunggakanContent />
    </ProtectedRoute>
  );
}

function TunggakanContent() {
  const [delinquentUsers, setDelinquentUsers] = useState<DelinquentUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    loadDelinquentUsers();
  }, []);

  async function loadDelinquentUsers() {
    setLoading(true);
    try {
      const response = await usersApi.getDelinquentUsers();
      if (response.success && Array.isArray(response.data)) {
        setDelinquentUsers(response.data);
      }
    } catch (error) {
      console.error("Failed to load delinquent users:", error);
      setMessage({
        type: "error",
        text: "Gagal memuat data anggota dengan tunggakan.",
      });
    } finally {
      setLoading(false);
    }
  }

  // Pagination & Filtering
  const filteredUsers = delinquentUsers.filter((user) => {
    if (!searchQuery) return true;
    const lowerQuery = searchQuery.toLowerCase();
    return (
      user.name?.toLowerCase().includes(lowerQuery) ||
      user.email?.toLowerCase().includes(lowerQuery) ||
      user.nim?.toLowerCase().includes(lowerQuery) ||
      user.phone?.toLowerCase().includes(lowerQuery) ||
      user.angkatan?.toLowerCase().includes(lowerQuery)
    );
  });

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage,
  );

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Belum pernah bayar";
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="mx-auto">
      {/* Breadcrumb */}
      <div className="mb-6 flex items-center justify-between">
        <nav className="flex items-center gap-2 text-sm">
          <Link
            href="/"
            className="font-medium text-gray-500 hover:text-primary dark:text-gray-400"
          >
            Dashboard
          </Link>
          <span className="text-gray-400">/</span>
          <Link
            href="/admin/anggota"
            className="font-medium text-gray-500 hover:text-primary dark:text-gray-400"
          >
            Manajemen Anggota
          </Link>
          <span className="text-gray-400">/</span>
          <span className="font-medium text-primary">
            Tunggakan Simpanan Wajib
          </span>
        </nav>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`mb-4 rounded-md border p-4 ${
            message.type === "success"
              ? "border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
              : "border-red-300 bg-red-50 text-red-700 dark:border-red-600 dark:bg-red-900/20 dark:text-red-400"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Alert Banner */}
      <div className="mb-6 flex items-start gap-3 rounded-lg border border-red-300 bg-red-50 p-4 dark:border-red-600 dark:bg-red-900/20">
        <AlertTriangle className="h-5 w-5 flex-shrink-0 text-red-600 dark:text-red-400" />
        <div>
          <h4 className="font-semibold text-red-700 dark:text-red-400">
            Peringatan Tunggakan
          </h4>
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            Daftar anggota yang belum membayar simpanan wajib selama 5 bulan
            berturut-turut atau lebih. Segera lakukan tindak lanjut untuk
            mengingatkan anggota yang bersangkutan.
          </p>
        </div>
      </div>

      {/* Header */}
      <div className="mb-6 flex flex-col items-start justify-between gap-4 rounded-lg bg-white p-4 shadow-sm dark:bg-boxdark sm:flex-row sm:items-center">
        <div>
          <h3 className="text-base font-semibold text-dark dark:text-white">
            Anggota dengan Tunggakan Simpanan Wajib
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Total: {filteredUsers.length} anggota{" "}
            {searchQuery && `dari ${delinquentUsers.length}`}
          </p>
        </div>
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Cari nama, email, nim..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              className="dark:bg-form-input w-full rounded-lg border border-stroke bg-transparent py-2 pl-10 pr-4 outline-none focus:border-primary focus-visible:shadow-none dark:border-strokedark sm:w-64"
            />
          </div>
          <Link
            href="/admin/anggota"
            className="inline-flex flex-shrink-0 items-center justify-center rounded-lg border border-stroke bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-strokedark dark:bg-boxdark dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Kembali ke Daftar Anggota
          </Link>
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
                  Foto
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Nama
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  NIM
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Angkatan
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Fakultas
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Telepon
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Pembayaran Terakhir
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Bulan Tunggakan
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={9}
                    className="px-4 py-8 text-center text-gray-500 dark:text-gray-400"
                  >
                    <div className="flex items-center justify-center">
                      <svg
                        className="mr-2 h-5 w-5 animate-spin"
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
                      Memuat data...
                    </div>
                  </td>
                </tr>
              ) : paginatedUsers.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="px-4 py-8 text-center text-gray-500 dark:text-gray-400"
                  >
                    <div className="flex flex-col items-center justify-center">
                      <svg
                        className="mb-2 h-12 w-12 text-blue-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <p className="font-medium">Tidak ada tunggakan!</p>
                      <p className="text-sm">
                        Semua anggota telah membayar simpanan wajib dengan
                        lancar.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((user, index) => (
                  <tr
                    key={user.id}
                    className="border-b border-stroke transition hover:bg-gray-50 dark:border-strokedark dark:hover:bg-gray-700/50"
                  >
                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                      {(page - 1) * itemsPerPage + index + 1}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-primary/10">
                        {user.photo ? (
                          <img
                            src={user.photo}
                            alt={user.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <UserIcon className="h-5 w-5 text-primary" />
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-dark dark:text-white">
                      {user.name}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {user.nim || "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {user.angkatan}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {user.fakultas || "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {user.phone || "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {formatDate(user.lastPaymentDate)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                          user.monthsWithoutPayment >= 12
                            ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                            : user.monthsWithoutPayment >= 8
                              ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
                              : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                        }`}
                      >
                        <AlertTriangle className="mr-1 h-3 w-3" />
                        {user.monthsWithoutPayment} bulan
                      </span>
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

      {/* Summary Statistics */}
      {!loading && delinquentUsers.length > 0 && (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-900/20">
            <p className="text-xs font-medium text-yellow-600 dark:text-yellow-400">
              Tunggakan 5-7 Bulan
            </p>
            <p className="mt-1 text-2xl font-bold text-yellow-700 dark:text-yellow-400">
              {
                delinquentUsers.filter(
                  (u) =>
                    u.monthsWithoutPayment >= 5 && u.monthsWithoutPayment < 8,
                ).length
              }
            </p>
            <p className="mt-1 text-xs text-yellow-600 dark:text-yellow-400">
              anggota
            </p>
          </div>
          <div className="rounded-lg border border-orange-200 bg-orange-50 p-4 dark:border-orange-800 dark:bg-orange-900/20">
            <p className="text-xs font-medium text-orange-600 dark:text-orange-400">
              Tunggakan 8-11 Bulan
            </p>
            <p className="mt-1 text-2xl font-bold text-orange-700 dark:text-orange-400">
              {
                delinquentUsers.filter(
                  (u) =>
                    u.monthsWithoutPayment >= 8 && u.monthsWithoutPayment < 12,
                ).length
              }
            </p>
            <p className="mt-1 text-xs text-orange-600 dark:text-orange-400">
              anggota
            </p>
          </div>
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
            <p className="text-xs font-medium text-red-600 dark:text-red-400">
              Tunggakan ≥ 12 Bulan
            </p>
            <p className="mt-1 text-2xl font-bold text-red-700 dark:text-red-400">
              {
                delinquentUsers.filter((u) => u.monthsWithoutPayment >= 12)
                  .length
              }
            </p>
            <p className="mt-1 text-xs text-red-600 dark:text-red-400">
              anggota
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
