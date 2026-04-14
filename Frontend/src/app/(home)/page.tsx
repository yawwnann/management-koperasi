"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getCurrentUser, formatCurrency, formatDate } from "@/lib/api-helpers";
import {
  fetchAdminDashboard,
  fetchAnggotaDashboard,
  type AdminDashboardData,
} from "./fetch";
import { UserDashboardData } from "@/types/api.types";
import { PaymentTrendChart } from "@/components/Charts/payment-trend";
import { PaymentStatusChart } from "@/components/Charts/payment-status";
import { SavingsBreakdownChart } from "@/components/Charts/savings-breakdown";
import { MemberActivityChart } from "@/components/Charts/member-activity";
import { PaymentHistoryChart } from "@/components/Charts/payment-history";

type UserRole = "ADMIN" | "ANGGOTA" | null;

function AdminDashboard({ userName }: { userName: string }) {
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const result = await fetchAdminDashboard();
        setData(result);
      } catch (error) {
        console.error("Failed to fetch admin dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 xl:grid-cols-4 2xl:gap-7.5">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="animate-pulse rounded-2xl border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700" />
            <div className="mt-4 h-4 w-24 rounded bg-gray-200 dark:bg-gray-700" />
            <div className="mt-2 h-8 w-32 rounded bg-gray-200 dark:bg-gray-700" />
          </div>
        ))}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-2xl border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
        <p className="text-red-500">Failed to load dashboard data.</p>
      </div>
    );
  }

  const cards = [
    {
      title: "Total Anggota",
      value: data.totalMembers.toString(),
      icon: (
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
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      ),
      color: "bg-blue-500",
      bgColor: "bg-blue-100 dark:bg-blue-900/30",
      textColor: "text-blue-500",
    },
    {
      title: "Total Simpanan",
      value: formatCurrency(data.totalSavings),
      icon: (
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
            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      color: "bg-green-500",
      bgColor: "bg-green-100 dark:bg-green-900/30",
      textColor: "text-green-500",
    },
    {
      title: "Pembayaran Pending",
      value: data.pendingPayments.toString(),
      icon: (
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
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
          />
        </svg>
      ),
      color: "bg-yellow-500",
      bgColor: "bg-yellow-100 dark:bg-yellow-900/30",
      textColor: "text-yellow-500",
    },
    {
      title: "Penarikan Pending",
      value: data.pendingWithdrawals.toString(),
      icon: (
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
      ),
      color: "bg-orange-500",
      bgColor: "bg-orange-100 dark:bg-orange-900/30",
      textColor: "text-orange-500",
    },
    {
      title: "Aktivitas Terbaru",
      value: data.recentActivities?.length.toString() || "0",
      subtitle:
        data.recentActivities?.length > 0
          ? `${data.recentActivities.length} transaksi terbaru`
          : "Belum ada aktivitas",
      icon: (
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
      ),
      color: "bg-purple-500",
      bgColor: "bg-purple-100 dark:bg-purple-900/30",
      textColor: "text-purple-500",
    },
    {
      title: "Approval Terbaru",
      value: data.recentApprovals?.length.toString() || "0",
      subtitle:
        data.recentApprovals?.length > 0
          ? `${data.recentApprovals.length} transaksi diverifikasi`
          : "Belum ada approval",
      icon: (
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
      ),
      color: "bg-teal-500",
      bgColor: "bg-teal-100 dark:bg-teal-900/30",
      textColor: "text-teal-500",
    },
  ];

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-black dark:text-white">
          Welcome back, {userName}!
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Here&apos;s an overview of your KOPMA cooperative system.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 xl:grid-cols-3 2xl:gap-7.5">
        {cards.map((card) => (
          <div
            key={card.title}
            className="rounded-2xl border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark"
          >
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-full ${card.bgColor} ${card.textColor}`}
            >
              {card.icon}
            </div>
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {card.title}
              </p>
              <p className="mt-1 text-2xl font-bold text-black dark:text-white">
                {card.value}
              </p>
              {card.subtitle && (
                <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                  {card.subtitle}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Charts and Alerts Section */}
      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Left Column - Charts */}
        <div className="space-y-6 xl:col-span-2">
          {/* Payment Trend Chart */}
          <PaymentTrendChart data={data.paymentTrend} />

          {/* Charts Grid */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <PaymentStatusChart data={data.paymentStatus} />
            <SavingsBreakdownChart data={data.savingsBreakdown} />
          </div>
        </div>

        {/* Right Column - Recent Alerts & Activities (Equal Height) */}
        <div className="flex flex-col gap-6">
          {/* Recent Alerts */}
          <div className="flex h-[485px] flex-col rounded-2xl border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="mb-4 flex flex-shrink-0 items-center justify-between">
              <h3 className="text-lg font-semibold text-dark dark:text-white">
                Pemberitahuan Terbaru
              </h3>
              <Link
                href="/settings#notifications"
                className="flex-shrink-0 text-sm text-primary hover:underline"
              >
                Lihat Semua
              </Link>
            </div>
            <div className="custom-scrollbar flex-1 space-y-4 overflow-y-auto pr-2">
              {data.recentAlerts.map(
                (alert: {
                  id: number;
                  type: string;
                  message: string;
                  detail: string;
                  time: string;
                  status: "pending" | "success" | "info";
                }) => (
                  <div
                    key={alert.id}
                    className="flex items-start gap-3 rounded-xl border border-stroke p-4 dark:border-strokedark"
                  >
                    <div
                      className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${
                        alert.status === "pending"
                          ? "bg-red-100 text-red-500 dark:bg-red-900/30"
                          : alert.status === "success"
                            ? "bg-green-100 text-green-500 dark:bg-green-900/30"
                            : "bg-blue-100 text-blue-500 dark:bg-blue-900/30"
                      }`}
                    >
                      {alert.status === "pending" ? (
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
                            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      ) : alert.status === "success" ? (
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
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      ) : (
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
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-dark dark:text-white">
                        {alert.message}
                      </p>
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        {alert.detail}
                      </p>
                      <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
                        {alert.time}
                      </p>
                      <div className="mt-2 flex gap-2">
                        {alert.status === "pending" && (
                          <>
                            <Link
                              href={
                                alert.type === "penarikan"
                                  ? "/admin/verifikasi-penarikan"
                                  : "/admin/verifikasi-pembayaran"
                              }
                              className="block rounded-lg bg-green-500 px-3 py-1 text-center text-xs font-medium text-white hover:bg-green-600"
                            >
                              Setujui
                            </Link>
                            <Link
                              href={
                                alert.type === "penarikan"
                                  ? "/admin/verifikasi-penarikan"
                                  : "/admin/verifikasi-pembayaran"
                              }
                              className="block rounded-lg bg-gray-100 px-3 py-1 text-center text-xs font-medium text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300"
                            >
                              Detail
                            </Link>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ),
              )}
            </div>
          </div>

          {/* Aktivitas Terbaru */}
          {data.recentActivities && data.recentActivities.length > 0 && (
            <div className="flex h-[465px] flex-col rounded-2xl border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
              <div className="mb-4 flex flex-shrink-0 items-center justify-between">
                <h3 className="text-lg font-semibold text-dark dark:text-white">
                  Aktivitas Terbaru
                </h3>
                <span className="flex-shrink-0 text-sm text-gray-500 dark:text-gray-400">
                  {data.recentActivities.length} transaksi
                </span>
              </div>
              <div className="custom-scrollbar flex-1 space-y-3 overflow-y-auto pr-2">
                {data.recentActivities.map(
                  (activity: {
                    id: string;
                    type: "payment" | "withdrawal";
                    amount: number;
                    status: string;
                    createdAt: string;
                    description?: string;
                  }) => (
                    <div
                      key={activity.id}
                      className="flex items-start justify-between rounded-xl border border-stroke p-4 hover:bg-gray-50 dark:border-strokedark dark:hover:bg-gray-800/50"
                    >
                      <div className="flex flex-1 items-start gap-3">
                        <div
                          className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${
                            activity.type === "payment"
                              ? "bg-blue-100 text-blue-500 dark:bg-blue-900/30"
                              : "bg-orange-100 text-orange-500 dark:bg-orange-900/30"
                          }`}
                        >
                          {activity.type === "payment" ? (
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
                                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                              />
                            </svg>
                          ) : (
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
                                d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                              />
                            </svg>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-dark dark:text-white">
                            {activity.type === "payment"
                              ? "Setoran"
                              : "Penarikan"}
                          </p>
                          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            {activity.type === "payment"
                              ? "Pembayaran"
                              : "Penarikan"}{" "}
                            • {formatDate(activity.createdAt)}
                          </p>
                        </div>
                      </div>
                      <div className="ml-4 text-right">
                        <p className="text-sm font-bold text-dark dark:text-white">
                          {formatCurrency(activity.amount)}
                        </p>
                        <span
                          className={`mt-1 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                            activity.status === "PENDING"
                              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                              : activity.status === "APPROVED"
                                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                          }`}
                        >
                          {activity.status === "PENDING"
                            ? "Pending"
                            : activity.status === "APPROVED"
                              ? "Disetujui"
                              : "Ditolak"}
                        </span>
                      </div>
                    </div>
                  ),
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Approval Terbaru - Full Width */}
      {data.recentApprovals && data.recentApprovals.length > 0 && (
        <div className="mt-6 rounded-2xl border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-dark dark:text-white">
              Approval Terbaru
            </h3>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {data.recentApprovals.length} transaksi diverifikasi
            </span>
          </div>
          <div className="space-y-3">
            {data.recentApprovals.map(
              (approval: {
                id: string;
                type: "payment" | "withdrawal";
                userName: string;
                amount: number;
                status: "APPROVED" | "REJECTED";
                approvedAt: string;
              }) => (
                <div
                  key={approval.id}
                  className="flex items-start justify-between rounded-xl border border-stroke p-4 hover:bg-gray-50 dark:border-strokedark dark:hover:bg-gray-800/50"
                >
                  <div className="flex flex-1 items-start gap-3">
                    <div
                      className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${
                        approval.status === "APPROVED"
                          ? "bg-green-100 text-green-500 dark:bg-green-900/30"
                          : "bg-red-100 text-red-500 dark:bg-red-900/30"
                      }`}
                    >
                      {approval.status === "APPROVED" ? (
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
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      ) : (
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
                            d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-dark dark:text-white">
                        {approval.userName}
                      </p>
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        {approval.type === "payment"
                          ? "Pembayaran"
                          : "Penarikan"}{" "}
                        • {formatDate(approval.approvedAt)}
                      </p>
                    </div>
                  </div>
                  <div className="ml-4 text-right">
                    <p className="text-sm font-bold text-dark dark:text-white">
                      {formatCurrency(approval.amount)}
                    </p>
                    <span
                      className={`mt-1 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        approval.status === "APPROVED"
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                      }`}
                    >
                      {approval.status === "APPROVED" ? "Disetujui" : "Ditolak"}
                    </span>
                  </div>
                </div>
              ),
            )}
          </div>
        </div>
      )}

      {/* Member Activity Chart */}
      <div className="mt-6">
        <MemberActivityChart data={data.memberActivity} />
      </div>
    </>
  );
}

function AnggotaDashboard({ userName }: { userName: string }) {
  const [data, setData] = useState<UserDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const result = await fetchAnggotaDashboard();
        setData(result);
      } catch (err) {
        console.error("Failed to fetch anggota dashboard data:", err);
        setError("Gagal memuat data dashboard");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 xl:grid-cols-4 2xl:gap-7.5">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="animate-pulse rounded-2xl border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700" />
            <div className="mt-4 h-4 w-24 rounded bg-gray-200 dark:bg-gray-700" />
            <div className="mt-2 h-8 w-32 rounded bg-gray-200 dark:bg-gray-700" />
          </div>
        ))}
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-2xl border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="flex items-center gap-3">
          <svg
            className="h-6 w-6 text-red-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div>
            <p className="text-lg font-semibold text-red-500">
              Terjadi Kesalahan
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {error || "Gagal memuat data dashboard."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      PENDING:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
      APPROVED:
        "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      REJECTED: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    };
    const statusLabels: Record<string, string> = {
      PENDING: "Menunggu",
      APPROVED: "Disetujui",
      REJECTED: "Ditolak",
    };
    const color =
      statusColors[status] ||
      "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    const label = statusLabels[status] || status;

    return (
      <span
        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${color}`}
      >
        {label}
      </span>
    );
  };

  const cards = [
    {
      title: "Total Saldo",
      value: formatCurrency(data.totalBalance),
      icon: (
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
            d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
          />
        </svg>
      ),
      bgColor: "bg-blue-100 dark:bg-blue-900/30",
      textColor: "text-blue-500",
    },
    {
      title: "Pembayaran Pending",
      value: data.pendingPayments.toString(),
      icon: (
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
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
      ),
      bgColor: "bg-yellow-100 dark:bg-yellow-900/30",
      textColor: "text-yellow-500",
    },
    {
      title: "Penarikan Pending",
      value: data.pendingWithdrawals.toString(),
      icon: (
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
      ),
      bgColor: "bg-orange-100 dark:bg-orange-900/30",
      textColor: "text-orange-500",
    },
    {
      title: "Transaksi Disetujui",
      value: `${data.approvedPayments + data.approvedWithdrawals}`,
      icon: (
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
      ),
      bgColor: "bg-green-100 dark:bg-green-900/30",
      textColor: "text-green-500",
    },
  ];

  // Transform recent activities to match admin dashboard format
  const recentActivities = data.recentActivities
    .slice(0, 5)
    .map((activity) => ({
      ...activity,
      userName: data.user.name,
    }));

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-black dark:text-white">
          Welcome back, {userName}!
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Here&apos;s an overview of your KOPMA account.
        </p>
      </div>

      {/* Stats Cards - Same as Admin */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 xl:grid-cols-4 2xl:gap-7.5">
        {cards.map((card) => (
          <div
            key={card.title}
            className="rounded-2xl border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark"
          >
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-full ${card.bgColor} ${card.textColor}`}
            >
              {card.icon}
            </div>
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {card.title}
              </p>
              <p className="mt-1 text-2xl font-bold text-black dark:text-white">
                {card.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts and Activities Section - Same Layout as Admin */}
      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Left Column - Charts */}
        <div className="space-y-6 xl:col-span-2">
          {/* Payment Trend Chart */}
          <PaymentTrendChart data={data.paymentTrend} />

          {/* Savings Breakdown Chart */}
          <div className="rounded-2xl border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
            <h3 className="mb-4 text-lg font-semibold text-dark dark:text-white">
              Breakdown Simpanan
            </h3>
            <SavingsBreakdownChart data={data.savingsBreakdown} />
          </div>
        </div>

        {/* Right Column - Recent Activities */}
        <div className="flex flex-col gap-6">
          {/* Aktivitas Terbaru */}
          {recentActivities.length > 0 && (
            <div className="flex h-[465px] flex-col rounded-2xl border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
              <div className="mb-4 flex flex-shrink-0 items-center justify-between">
                <h3 className="text-lg font-semibold text-dark dark:text-white">
                  Aktivitas Terbaru
                </h3>
                <span className="flex-shrink-0 text-sm text-gray-500 dark:text-gray-400">
                  {recentActivities.length} transaksi
                </span>
              </div>
              <div className="custom-scrollbar flex-1 space-y-3 overflow-y-auto pr-2">
                {recentActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start justify-between rounded-xl border border-stroke p-4 hover:bg-gray-50 dark:border-strokedark dark:hover:bg-gray-800/50"
                  >
                    <div className="flex flex-1 items-start gap-3">
                      <div
                        className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${
                          activity.type === "payment"
                            ? "bg-blue-100 text-blue-500 dark:bg-blue-900/30"
                            : "bg-orange-100 text-orange-500 dark:bg-orange-900/30"
                        }`}
                      >
                        {activity.type === "payment" ? (
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
                              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                            />
                          </svg>
                        ) : (
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
                              d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                            />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-dark dark:text-white">
                          {activity.userName}
                        </p>
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          {activity.type === "payment"
                            ? "Pembayaran"
                            : "Penarikan"}{" "}
                          • {formatDate(activity.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="ml-4 text-right">
                      <p className="text-sm font-bold text-dark dark:text-white">
                        {formatCurrency(activity.amount)}
                      </p>
                      <span
                        className={`mt-1 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                          activity.status === "PENDING"
                            ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                            : activity.status === "APPROVED"
                              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                              : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                        }`}
                      >
                        {activity.status === "PENDING"
                          ? "Pending"
                          : activity.status === "APPROVED"
                            ? "Disetujui"
                            : "Ditolak"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default function HomePage() {
  const router = useRouter();
  const [role, setRole] = useState<UserRole>(null);
  const [userName, setUserName] = useState<string>("");

  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      setRole(user.role);
      setUserName(user.name || "User");
    } else {
      // Redirect to login if not authenticated
      router.push("/auth/sign-in");
      router.refresh();
    }
  }, []);

  if (!role) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-primary"></div>
          <p className="text-gray-500 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return role === "ADMIN" ? (
    <AdminDashboard userName={userName} />
  ) : (
    <AnggotaDashboard userName={userName} />
  );
}
