"use client";

import { useState, useEffect } from "react";
import { Clock, MapPin, Monitor, Smartphone, Tablet, ChevronLeft, ChevronRight, LogOut, AlertCircle } from "lucide-react";

export function SessionsTab() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 });

  useEffect(() => {
    loadSessions();
  }, [page]);

  async function loadSessions() {
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000/api"}/auth/login-history?page=${page}&limit=10`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
        }
      );

      const data = await response.json();

      if (data.success && data.data) {
        setSessions(data.data.history || []);
        setPagination(data.data.pagination || { total: 0, page: 1, limit: 10, totalPages: 1 });
      }
    } catch (error) {
      console.error("Failed to load sessions:", error);
    } finally {
      setLoading(false);
    }
  }

  const getDeviceIcon = (device: string) => {
    switch (device?.toLowerCase()) {
      case "mobile":
        return <Smartphone className="h-5 w-5" />;
      case "tablet":
        return <Tablet className="h-5 w-5" />;
      default:
        return <Monitor className="h-5 w-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    return status === "SUCCESS"
      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
      : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Baru saja";
    if (diffMins < 60) return `${diffMins} menit yang lalu`;
    if (diffHours < 24) return `${diffHours} jam yang lalu`;
    if (diffDays < 7) return `${diffDays} hari yang lalu`;
    return date.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
  };

  return (
    <div className="space-y-6">
      {/* Info Card */}
      <div className="rounded-xl border border-stroke bg-white p-4 shadow-sm dark:border-strokedark dark:bg-boxdark">
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-500" />
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <p className="font-medium text-dark dark:text-white">Riwayat Login</p>
            <p className="mt-1">
              Berikut adalah daftar perangkat dan lokasi yang pernah digunakan untuk login ke akun Anda.
              Jika Anda melihat aktivitas yang mencurigakan, segera ubah password Anda.
            </p>
          </div>
        </div>
      </div>

      {/* Sessions List */}
      <div className="rounded-xl border border-stroke bg-white shadow-sm dark:border-strokedark dark:bg-boxdark">
        <div className="border-b border-stroke px-6 py-4 dark:border-strokedark">
          <h3 className="text-lg font-semibold text-dark dark:text-white">Sesi Login</h3>
        </div>

        {loading ? (
          <div className="flex items-center justify-center p-12">
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              Memuat sesi...
            </div>
          </div>
        ) : sessions.length > 0 ? (
          <>
            <div className="divide-y divide-stroke dark:divide-strokedark">
              {sessions.map((session) => (
                <div key={session.id} className="flex items-start gap-4 p-6 transition hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  {/* Device Icon */}
                  <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl ${
                    session.status === "SUCCESS"
                      ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                      : "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                  }`}>
                    {getDeviceIcon(session.device)}
                  </div>

                  {/* Session Info */}
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium text-dark dark:text-white">
                        {session.browser} {session.browserVersion && `v${session.browserVersion}`}
                      </p>
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${getStatusColor(session.status)}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${
                          session.status === "SUCCESS" ? "bg-green-500" : "bg-red-500"
                        }`} />
                        {session.status === "SUCCESS" ? "Berhasil" : "Gagal"}
                      </span>
                    </div>

                    <div className="mt-1 flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        {session.os} {session.osVersion}
                      </span>
                      {session.city && session.country && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {session.city}, {session.country}
                        </span>
                      )}
                    </div>

                    <div className="mt-2 flex items-center gap-4 text-xs text-gray-400 dark:text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {formatDate(session.createdAt)}
                      </span>
                      <span>IP: {session.ipAddress}</span>
                    </div>

                    {session.status === "FAILED" && session.failureReason && (
                      <p className="mt-2 text-xs text-red-500 dark:text-red-400">
                        Alasan: {session.failureReason}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-stroke px-6 py-4 dark:border-strokedark">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Menampilkan {(page - 1) * pagination.limit + 1}–{Math.min(page * pagination.limit, pagination.total)} dari {pagination.total} sesi
                </p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="rounded-lg p-2 text-gray-600 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 dark:text-gray-400 dark:hover:bg-gray-700"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    const p = Math.max(1, Math.min(page - 2, pagination.totalPages - 4)) + i;
                    if (p > pagination.totalPages) return null;
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
                    onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                    disabled={page === pagination.totalPages}
                    className="rounded-lg p-2 text-gray-600 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 dark:text-gray-400 dark:hover:bg-gray-700"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center p-12 text-gray-500 dark:text-gray-400">
            <Clock className="mb-2 h-12 w-12 opacity-40" />
            <p className="font-medium">Belum ada riwayat login</p>
            <p className="text-sm">Riwayat login akan muncul setelah Anda login</p>
          </div>
        )}
      </div>
    </div>
  );
}
