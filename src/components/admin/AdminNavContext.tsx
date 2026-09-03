"use client";

import React, { createContext, useContext, useState } from "react";

interface AdminNavContextType {
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
  toggleMobileNav: () => void;
  closeMobileNav: () => void;
}

const AdminNavContext = createContext<AdminNavContextType>({
  isMobileOpen: false,
  setIsMobileOpen: () => {},
  toggleMobileNav: () => {},
  closeMobileNav: () => {},
});

export function AdminNavProvider({ children }: { children: React.ReactNode }) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const toggleMobileNav = () => setIsMobileOpen((prev) => !prev);
  const closeMobileNav = () => setIsMobileOpen(false);

  return (
    <AdminNavContext.Provider
      value={{
        isMobileOpen,
        setIsMobileOpen,
        toggleMobileNav,
        closeMobileNav,
      }}
    >
      {children}
    </AdminNavContext.Provider>
  );
}

export function useAdminNav() {
  return useContext(AdminNavContext);
}
