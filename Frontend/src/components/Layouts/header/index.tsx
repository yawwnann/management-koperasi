"use client";

import { SearchIcon } from "@/assets/icons";
import { getCurrentUser } from "@/lib/api-helpers";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useSidebarContext } from "../sidebar/sidebar-context";
import { MenuIcon } from "./icons";
import { Notification } from "./notification";
import { ThemeToggleSwitch } from "./theme-toggle";
import { UserInfo } from "./user-info";

export function Header() {
  const { toggleSidebar, isMobile } = useSidebarContext();
  const pathname = usePathname();
  const [pageTitle, setPageTitle] = useState("Dashboard");
  const [userRole, setUserRole] = useState<"ADMIN" | "ANGGOTA" | null>(null);

  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      setUserRole(user.role);
    }
  }, []);

  useEffect(() => {
    // Set page title based on pathname
    const pathParts = pathname.split("/").filter(Boolean);
    if (pathParts.length === 0) {
      setPageTitle("Dashboard");
    } else {
      const title = pathParts[pathParts.length - 1]
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
      setPageTitle(title);
    }
  }, [pathname]);

  return (
    <header className="sticky top-0 z-30 flex w-full max-w-full items-center justify-between overflow-x-clip border-b border-stroke bg-white px-3 py-3 shadow-1 dark:border-stroke-dark dark:bg-gray-dark sm:px-4 md:px-5 2xl:px-10">
      <button
        onClick={toggleSidebar}
        className="shrink-0 rounded-lg border px-1.5 py-1 dark:border-stroke-dark dark:bg-[#020D1A] hover:dark:bg-[#FFFFFF1A] min-[850px]:hidden"
      >
        <MenuIcon />
        <span className="sr-only">Toggle Sidebar</span>
      </button>

      {isMobile && (
        <Link
          href={"/"}
          className="ml-2 flex shrink-0 items-center gap-2 max-[430px]:hidden min-[375px]:ml-4"
        >
          <Image
            src={"/new-logo.PNG"}
            width={36}
            height={36}
            alt="KOPMA"
            className="object-contain"
          />
          <span className="hidden text-sm font-bold text-dark dark:text-white min-[500px]:inline">
            KopmaPay
          </span>
        </Link>
      )}

      <div className="max-xl:hidden">
        <div className="flex items-center gap-2">
          <h1 className="mb-0.5 text-heading-5 font-bold text-dark dark:text-white">
            {pageTitle}
          </h1>
          {userRole && (
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                userRole === "ADMIN"
                  ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                  : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
              }`}
            >
              {userRole === "ADMIN" ? "Administrator" : "Anggota"}
            </span>
          )}
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {userRole === "ADMIN"
            ? "Sistem Manajemen Koperasi Digital"
            : "KOPMA UAD - Koperasi Digital"}
        </p>
      </div>

      <div className="flex min-w-0 items-center justify-end gap-2 min-[375px]:gap-3">
        <div className="hidden min-[390px]:block">
          <ThemeToggleSwitch />
        </div>

        <Notification />

        <div className="shrink-0">
          <UserInfo />
        </div>
      </div>
    </header>
  );
}
