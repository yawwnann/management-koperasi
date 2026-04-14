"use client";

import React, { useState } from "react";
import { useNotifications } from "@/hooks/use-notifications";
import Link from "next/link";
import { Bell } from "lucide-react";

export function NotificationsTab() {
  const { notifications, isLoading, markAsRead, markAllAsRead, unreadCount } =
    useNotifications();

  const formatTime = (dateString: string) => {
    try {
      if (!dateString) return "Tidak diketahui";
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Tidak diketahui";

      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 1) return "Baru saja";
      if (diffMins < 60) return `${diffMins} menit yang lalu`;
      if (diffHours < 24) return `${diffHours} jam yang lalu`;
      if (diffDays < 7) return `${diffDays} hari yang lalu`;
      return date.toLocaleDateString("id-ID");
    } catch {
      return "Tidak diketahui";
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "payment":
        return "💰";
      case "withdrawal":
        return "💸";
      case "system":
        return "⚙️";
      default:
        return "🔔";
    }
  };

  return (
    <div className="rounded-[10px] border border-stroke bg-white shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card">
      <div className="flex items-center justify-between border-b border-stroke px-7 py-4 dark:border-dark-3">
        <h3 className="font-medium text-dark dark:text-white">
          Riwayat Notifikasi
        </h3>
        <div className="flex items-center gap-4">
          {unreadCount > 0 && (
            <span className="rounded-md bg-primary px-2.5 py-0.5 text-xs font-semibold text-white">
              {unreadCount} belum dibaca
            </span>
          )}
          {notifications.length > 0 && (
            <button
              onClick={() => markAllAsRead()}
              className="text-sm font-medium text-primary transition-colors hover:text-opacity-80"
            >
              Tandai semua dibaca
            </button>
          )}
        </div>
      </div>
      <div className="p-7">
        <div className="flex flex-col gap-4">
          {isLoading ? (
            <div className="py-6 text-center text-sm text-gray-500">
              Memuat data...
            </div>
          ) : notifications.length === 0 ? (
            <div className="py-6 text-center text-sm text-gray-500">
              Tidak ada notifikasi
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`flex items-center justify-between rounded-xl border p-4 transition-all ${
                  !notification.isRead
                    ? "border-primary/20 bg-gray-1 shadow-sm dark:border-primary/20 dark:bg-dark-2"
                    : "border-stroke bg-white dark:border-dark-3 dark:bg-gray-dark"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gray-2 text-xl dark:bg-dark-3">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h5 className="text-base font-semibold text-dark dark:text-white">
                        {notification.title}
                      </h5>
                      {!notification.isRead && (
                        <span className="inline-block h-2 w-2 rounded-full bg-primary"></span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-dark-5 dark:text-dark-6">
                      {notification.message}
                    </p>
                    <span className="mt-2 block text-xs font-medium text-gray-400 dark:text-gray-500">
                      {formatTime(notification.createdAt)}
                    </span>
                  </div>
                </div>

                <div className="ml-4 flex flex-shrink-0 flex-col items-end gap-2">
                  {notification.actionUrl && (
                    <Link
                      href={notification.actionUrl}
                      className="rounded-md border border-stroke px-4 py-1.5 text-sm font-medium text-dark hover:bg-gray-2 dark:border-dark-3 dark:text-white dark:hover:bg-dark-3"
                    >
                      Detail
                    </Link>
                  )}
                  {!notification.isRead && (
                    <button
                      onClick={() => markAsRead(notification.id)}
                      className="text-xs text-primary hover:underline"
                    >
                      Tandai dibaca
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
