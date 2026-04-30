"use client";

import { useEffect, useState, useCallback } from "react";
import { announcementsApi } from "@/lib/api";
import { X, ChevronLeft, ChevronRight, Megaphone } from "lucide-react";

interface Announcement {
  id: string;
  title: string;
  message: string;
  startDate: string;
  endDate: string;
}

/**
 * Returns a stable key for the current login session.
 * We use the first 20 chars of the JWT token (which changes on every login)
 * so the popup resets correctly after logout + login.
 */
function getLoginSessionKey(): string | null {
  if (typeof window === "undefined") return null;
  const token = localStorage.getItem("auth_token");
  if (!token) return null;
  // Use a slice of the token as a stable-per-login identifier
  return `kopma_popup_${token.slice(-20)}`;
}

export function AnnouncementPopup() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    async function fetchAndShow() {
      try {
        // Popup hanya untuk ANGGOTA, bukan ADMIN
        const userStr = localStorage.getItem("current_user");
        if (userStr) {
          const user = JSON.parse(userStr);
          if (user?.role === "ADMIN") return;
        }

        // Check if popup was already shown in this login session
        const sessionKey = getLoginSessionKey();
        if (!sessionKey) return; // Not logged in
        if (sessionStorage.getItem(sessionKey) === "shown") return;

        const res = await announcementsApi.getActive();
        if (!res.success || !res.data || res.data.length === 0) return;

        const all: Announcement[] = res.data;
        if (all.length === 0) return;

        setAnnouncements(all);
        setCurrentIndex(0);
        setIsVisible(true);

        // Mark as shown for this login session only
        sessionStorage.setItem(sessionKey, "shown");
      } catch {
        // Silently ignore errors (e.g. not logged in yet)
      }
    }

    fetchAndShow();
  }, []);

  const handleClose = useCallback(() => {
    setIsVisible(false);
  }, []);

  const handlePrev = useCallback(() => {
    setCurrentIndex((i) => Math.max(0, i - 1));
  }, []);

  const handleNext = useCallback(() => {
    setCurrentIndex((i) => Math.min(announcements.length - 1, i + 1));
  }, [announcements.length]);

  if (!isVisible || announcements.length === 0) return null;

  const current = announcements[currentIndex];
  const total = announcements.length;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}
    >
      <div
        className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl dark:bg-boxdark"
        style={{ animation: "popupSlideIn 0.3s ease" }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 rounded-t-2xl bg-gradient-to-r from-primary to-primary/80 px-6 py-4">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-white/20">
            <Megaphone className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-white/70 uppercase tracking-wide">
              Pengumuman
            </p>
            <h2 className="truncate text-lg font-bold text-white leading-tight">
              {current.title}
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 transition"
            aria-label="Tutup"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300 whitespace-pre-line">
            {current.message}
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-stroke px-6 py-4 dark:border-strokedark">
          {/* Slide dots + arrows */}
          {total > 1 ? (
            <div className="flex items-center gap-3">
              <button
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-stroke text-gray-500 hover:bg-gray-50 disabled:opacity-30 dark:border-strokedark dark:hover:bg-gray-800"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <div className="flex gap-1.5">
                {announcements.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentIndex(i)}
                    className={`h-2 rounded-full transition-all ${
                      i === currentIndex
                        ? "w-5 bg-primary"
                        : "w-2 bg-gray-300 dark:bg-gray-600"
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={handleNext}
                disabled={currentIndex === total - 1}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-stroke text-gray-500 hover:bg-gray-50 disabled:opacity-30 dark:border-strokedark dark:hover:bg-gray-800"
              >
                <ChevronRight className="h-4 w-4" />
              </button>

              <span className="text-xs text-gray-400">
                {currentIndex + 1} / {total}
              </span>
            </div>
          ) : (
            <span className="text-xs text-gray-400">
              {new Date(current.startDate).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
          )}

          <button
            onClick={handleClose}
            className="rounded-lg bg-primary px-5 py-2 text-sm font-medium text-white hover:bg-primary/90 transition"
          >
            Mengerti
          </button>
        </div>
      </div>

      <style>{`
        @keyframes popupSlideIn {
          from { opacity: 0; transform: translateY(-20px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
