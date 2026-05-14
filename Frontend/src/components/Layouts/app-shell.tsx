"use client";

import { Header } from "@/components/Layouts/header";
import { Sidebar } from "@/components/Layouts/sidebar";
import { AnnouncementPopup } from "@/components/AnnouncementPopup";
import type { PropsWithChildren } from "react";
import { usePathname } from "next/navigation";

export function AppShell({ children }: PropsWithChildren) {
  const pathname = usePathname();
  const isAuthRoute = pathname.startsWith("/auth");

  if (isAuthRoute) {
    return (
      <main className="min-h-screen bg-gray-2 p-4 dark:bg-[#020d1a] md:p-6 2xl:p-10">
        {children}
      </main>
    );
  }

  return (
    <div className="min-h-screen overflow-x-hidden min-[850px]:pl-[290px]">
      <Sidebar />

      <div className="min-w-0 bg-gray-2 dark:bg-[#020d1a]">
        <Header />

        <main className="mx-auto w-full max-w-screen-2xl overflow-hidden p-4 md:p-6 2xl:p-10">
          {children}
        </main>
      </div>

      {/* Global popup — muncul saat ada pengumuman aktif setelah login */}
      <AnnouncementPopup />
    </div>
  );
}
