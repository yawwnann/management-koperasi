"use client";

import {
  Dropdown,
  DropdownContent,
  DropdownTrigger,
} from "@/components/ui/dropdown";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNotifications } from "@/hooks/use-notifications";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useState } from "react";
import { BellIcon } from "./icons";

export function Notification() {
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteAllNotifications,
    allRead,
    isLoading,
  } = useNotifications();

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

  const getNotificationUrl = (notification: any): string => {
    if (notification.type === 'payment') return '/admin/verifikasi-pembayaran';
    if (notification.type === 'withdrawal') return '/admin/verifikasi-penarikan';
    return notification.actionUrl || '';
  };

  const handleNotificationClick = async (id: string) => {
    await markAsRead(id);
    setIsOpen(false);
  };

  const handleMarkAllRead = async () => {
    await markAllAsRead();
  };

  const handleDeleteAll = async () => {
    await deleteAllNotifications();
  };

  return (
    <Dropdown isOpen={isOpen} setIsOpen={(open) => setIsOpen(open)}>
      <DropdownTrigger
        className="grid size-12 place-items-center rounded-full border bg-gray-2 text-dark outline-none hover:text-primary focus-visible:border-primary focus-visible:text-primary dark:border-dark-4 dark:bg-dark-3 dark:text-white dark:focus-visible:border-primary"
        aria-label="View Notifications"
      >
        <span className="relative">
          <BellIcon />

          {unreadCount > 0 && (
            <span
              className={cn(
                "absolute right-0 top-0 z-1 size-2 rounded-full bg-red-light ring-2 ring-gray-2 dark:ring-dark-3",
              )}
            >
              <span className="absolute inset-0 -z-1 animate-ping rounded-full bg-red-light opacity-75" />
            </span>
          )}
        </span>
      </DropdownTrigger>

      <DropdownContent
        align={isMobile ? "end" : "center"}
        className={cn(
          "rounded-xl border border-stroke bg-white shadow-xl dark:border-dark-3 dark:bg-gray-dark",
          "w-[calc(100vw-2rem)] max-w-[26rem] p-3 sm:w-[26rem] sm:p-4",
          isMobile && "fixed right-4 left-4 top-20 w-auto"
        )}
      >
        <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <span className="text-base font-semibold text-dark dark:text-white sm:text-lg">
              Notifikasi
            </span>
            {unreadCount > 0 && (
              <span className="rounded-md bg-primary px-2 py-0.5 text-xs font-semibold text-white">
                {unreadCount} baru
              </span>
            )}
          </div>
          {notifications.length > 0 && (
            <button
              onClick={allRead ? handleDeleteAll : handleMarkAllRead}
              className="self-end text-xs font-medium text-primary transition-colors hover:text-opacity-80 sm:text-sm"
            >
              {allRead ? "Hapus semua" : "Tandai semua dibaca"}
            </button>
          )}
        </div>

        <ul className="custom-scrollbar mb-3 max-h-[60vh] space-y-1.5 overflow-y-auto pr-0.5 sm:mb-4 sm:max-h-[26rem] sm:space-y-2 sm:pr-1">
          {isLoading ? (
            <li className="py-8 text-center text-sm font-medium text-gray-500 dark:text-gray-400">
              Memuat notifikasi...
            </li>
          ) : notifications.length === 0 ? (
            <li className="py-8 text-center text-sm font-medium text-gray-500 dark:text-gray-400">
              Tidak ada notifikasi
            </li>
          ) : (
            notifications.slice(0, 10).map((notification) => (
              <li key={notification.id} role="menuitem">
                <Link
                  href={getNotificationUrl(notification)}
                  onClick={() => handleNotificationClick(notification.id)}
                  className={`flex gap-2.5 rounded-lg p-2.5 outline-none transition-all hover:bg-gray-2 focus-visible:bg-gray-2 dark:hover:bg-dark-3 dark:focus-visible:bg-dark-3 sm:gap-3.5 sm:rounded-xl sm:p-3 ${
                    !notification.isRead
                      ? "bg-gray-1 shadow-sm dark:bg-boxdark-2"
                      : ""
                  }`}
                >
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gray-2 text-base shadow-sm dark:bg-dark-3 sm:size-11 sm:text-xl">
                    {getNotificationIcon(notification.type)}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="mb-0.5 flex items-start justify-between gap-1.5">
                      <strong className="block truncate text-sm font-semibold text-dark dark:text-white sm:text-base">
                        {notification.title}
                      </strong>
                      {!notification.isRead && (
                        <span className="mt-1 size-2 shrink-0 rounded-full bg-primary shadow-sm sm:mt-1.5 sm:size-2.5" />
                      )}
                    </div>
                    <p className="mb-1 line-clamp-2 text-xs leading-snug text-dark-5 dark:text-dark-6 sm:mb-1.5 sm:text-sm">
                      {notification.message}
                    </p>
                    <span className="block text-[10px] font-medium text-gray-400 dark:text-gray-500 sm:text-xs">
                      {formatTime(notification.createdAt)}
                    </span>
                  </div>
                </Link>
              </li>
            ))
          )}
        </ul>

        {notifications.length > 10 && (
          <Link
            href="/settings#notifications"
            onClick={() => setIsOpen(false)}
            className="block rounded-lg border border-primary/20 bg-primary/5 p-2 text-center text-xs font-medium tracking-wide text-primary outline-none transition-colors hover:bg-primary/15 focus:bg-primary/15 sm:p-2.5 sm:text-sm"
          >
            Lihat semua notifikasi
          </Link>
        )}
      </DropdownContent>
    </Dropdown>
  );
}
