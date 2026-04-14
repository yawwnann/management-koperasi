"use client";

import { useIsMobile } from "@/hooks/use-mobile";
import { createContext, useContext, useEffect, useState } from "react";

type SidebarState = "expanded" | "collapsed";

type SidebarContextType = {
  state: SidebarState;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  isMobile: boolean;
  toggleSidebar: () => void;
};

const SidebarContext = createContext<SidebarContextType | null>(null);

export function useSidebarContext() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebarContext must be used within a SidebarProvider");
  }
  return context;
}

export function SidebarProvider({
  children,
  defaultOpen = true,
}: {
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const isMobile = useIsMobile();
  // Initialize based on screen size
  const [isOpen, setIsOpen] = useState(() => {
    if (typeof window === 'undefined') return true;
    return window.innerWidth >= 850 ? true : false;
  });

  useEffect(() => {
    // On desktop, always keep sidebar open
    // On mobile/tablet, allow toggle (start closed)
    if (window.innerWidth >= 850) {
      setIsOpen(true);
    }
  }, [isMobile]);

  function toggleSidebar() {
    // Only allow toggle on mobile/tablet
    if (window.innerWidth < 850) {
      setIsOpen((prev) => !prev);
    }
  }

  return (
    <SidebarContext.Provider
      value={{
        state: isOpen ? "expanded" : "collapsed",
        isOpen,
        setIsOpen,
        isMobile,
        toggleSidebar,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}
