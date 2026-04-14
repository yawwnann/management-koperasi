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
  const { notifications, unreadCount, markAsRead, markAllAsRead, isLoading } = useNotifications();

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Baru saja";
    if (diffMins < 60) return `${diffMins} menit yang lalu`;
    if (diffHours < 24) return `${diffHours} jam yang lalu`;
    if (diffDays < 7) return `${diffDays} hari yang lalu`;
    return date.toLocaleDateString('id-ID');
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'payment':
        return '💰';
      case 'withdrawal':
        return '💸';
      case 'system':
        return '⚙️';
      default:
        return '🔔';
    }
  };

  const handleNotificationClick = async (id: string) => {
    await markAsRead(id);
    setIsOpen(false);
  };

  const handleMarkAllRead = async () => {
    await markAllAsRead();
  };

  return (
    <Dropdown
      isOpen={isOpen}
      setIsOpen={(open) => setIsOpen(open)}
    >
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
        className="border border-stroke bg-white px-3.5 py-3 shadow-md dark:border-dark-3 dark:bg-gray-dark min-[350px]:min-w-[20rem]"
      >
        <div className="mb-1 flex items-center justify-between px-2 py-1.5">
          <span className="text-lg font-medium text-dark dark:text-white">
            Notifications
          </span>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <span className="rounded-md bg-primary px-[9px] py-0.5 text-xs font-medium text-white">
                {unreadCount} baru
              </span>
            )}
            {notifications.length > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs text-primary hover:underline"
              >
                Tandai semua dibaca
              </button>
            )}
          </div>
        </div>

        <ul className="mb-3 max-h-[23rem] space-y-1.5 overflow-y-auto">
          {isLoading ? (
            <li className="px-2 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
              Memuat notifikasi...
            </li>
          ) : notifications.length === 0 ? (
            <li className="px-2 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
              Tidak ada notifikasi
            </li>
          ) : (
            notifications.slice(0, 10).map((notification) => (
              <li key={notification.id} role="menuitem">
                <Link
                  href={notification.actionUrl || "#"}
                  onClick={() => handleNotificationClick(notification.id)}
                  className={`flex gap-3 rounded-lg px-2 py-2 outline-none hover:bg-gray-2 focus-visible:bg-gray-2 dark:hover:bg-dark-3 dark:focus-visible:bg-dark-3 ${
                    !notification.isRead ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                  }`}
                >
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 text-lg">
                    {getNotificationIcon(notification.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <strong className="block text-sm font-medium text-dark dark:text-white truncate">
                        {notification.title}
                      </strong>
                      {!notification.isRead && (
                        <span className="size-2 shrink-0 rounded-full bg-primary" />
                      )}
                    </div>
                    <p className="truncate text-sm text-dark-5 dark:text-dark-6">
                      {notification.message}
                    </p>
                    <span className="text-xs text-gray-400 dark:text-gray-500">
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
            href="/notifications"
            onClick={() => setIsOpen(false)}
            className="block rounded-lg border border-primary p-2 text-center text-sm font-medium tracking-wide text-primary outline-none transition-colors hover:bg-blue-light-5 focus:bg-blue-light-5 focus:text-primary focus-visible:border-primary dark:border-dark-3 dark:text-dark-6 dark:hover:border-dark-5 dark:hover:bg-dark-3 dark:hover:text-dark-7 dark:focus-visible:border-dark-5 dark:focus-visible:bg-dark-3 dark:focus-visible:text-dark-7"
          >
            Lihat semua notifikasi
          </Link>
        )}
      </DropdownContent>
    </Dropdown>
  );
}
