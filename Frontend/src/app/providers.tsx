"use client";

import { SidebarProvider } from "@/components/Layouts/sidebar/sidebar-context";
import { ThemeProvider } from "next-themes";
import { useEffect } from "react";
import { initTokenRefresh } from "@/lib/tokenRefresh";

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize automatic token refresh
    initTokenRefresh();
  }, []);

  return (
    <ThemeProvider defaultTheme="light" attribute="class">
      <SidebarProvider>{children}</SidebarProvider>
    </ThemeProvider>
  );
}
