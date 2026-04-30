"use client";

import { Logo } from "@/components/logo";
import { cn } from "@/lib/utils";
import { getCurrentUser } from "@/lib/api-helpers";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { NAV_DATA } from "./data";
import { ArrowLeftIcon } from "./icons";
import { MenuItem } from "./menu-item";
import { useSidebarContext } from "./sidebar-context";

export function Sidebar() {
  const pathname = usePathname();
  const { setIsOpen, isOpen, isMobile, toggleSidebar } = useSidebarContext();
  const [userRole, setUserRole] = useState<"ADMIN" | "ANGGOTA" | null>(null);

  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      setUserRole(user.role);
    }
  }, []);

  // Filter NAV_DATA based on user role
  const filteredNavData = NAV_DATA.map((section) => ({
    ...section,
    items: section.items
      .filter((item) => {
        // Check if user has role access
        return item.roles ? item.roles.includes(userRole!) : true;
      })
      .filter((item) => item.url), // Only include items with URLs (flat menu)
  })).filter((section) => section.items.length > 0);

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          "overflow-hidden border-r border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-dark",
          isMobile
            ? "fixed bottom-0 left-0 top-0 z-50 w-[290px] transition-transform duration-300 ease-linear"
            : "sticky top-0 h-screen w-[290px] shrink-0",
          !isOpen && isMobile && "-translate-x-full",
        )}
        aria-label="Main navigation"
        aria-hidden={!isOpen}
        inert={!isOpen}
        suppressHydrationWarning
      >
        <div className="flex h-full flex-col pl-[25px] pr-[7px]">
          <div className="relative pr-4.5">
            <Link
              href={"/"}
              onClick={() => isMobile && toggleSidebar()}
              className="block"
            >
              <Logo />
            </Link>

            {/* Close button for mobile */}
            {isMobile && isOpen && (
              <button
                onClick={toggleSidebar}
                className="absolute right-4.5 top-1/2 -translate-y-1/2"
              >
                <span className="sr-only">Close Menu</span>
                <ArrowLeftIcon className="size-7" />
              </button>
            )}
          </div>

          {/* Navigation */}
          <div className="custom-scrollbar mt-6 flex-1 overflow-y-auto pr-3 min-[850px]:mt-4">
            {filteredNavData.map((section) => (
              <div key={section.label} className="mb-6">
                <h2 className="mb-5 whitespace-nowrap text-sm font-medium text-dark-4 dark:text-dark-6">
                  {section.label}
                </h2>

                <nav role="navigation" aria-label={section.label}>
                  <ul className="space-y-2">
                    {section.items.map((item) => (
                      <li key={item.title}>
                        <MenuItem
                          as="link"
                          href={item.url}
                          isActive={pathname === item.url}
                          className="flex items-center gap-3 whitespace-nowrap py-3"
                        >
                          <item.icon
                            className="size-6 shrink-0"
                            aria-hidden="true"
                          />
                          <span>{item.title}</span>
                        </MenuItem>
                      </li>
                    ))}
                  </ul>
                </nav>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </>
  );
}
