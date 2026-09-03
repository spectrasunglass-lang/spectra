"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Image as ImageIcon,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  ExternalLink,
  Sparkles,
  Shapes,
  Mail,
  X,
} from "lucide-react";
import { useAdminNav } from "./AdminNavContext";

const navItems = [
  { label: "Dashboard",   href: "/admin",             icon: LayoutDashboard, exact: true  },
  { label: "Products",    href: "/admin/products",    icon: Package,         exact: false },
  { label: "Orders",      href: "/admin/orders",      icon: ShoppingBag,     exact: false },
  { label: "Subscribers", href: "/admin/subscribers", icon: Mail,            exact: false },
  { label: "Campaigns",   href: "/admin/campaigns",   icon: Sparkles,        exact: false },
  { label: "Categories",  href: "/admin/categories",  icon: Shapes,          exact: false },
  { label: "Media",       href: "/admin/media",       icon: ImageIcon,       exact: false },
  { label: "Settings",    href: "/admin/settings",    icon: Settings,        exact: false },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const { isMobileOpen, closeMobileNav } = useAdminNav();
  const prevPathname = useRef(pathname);

  // Close mobile drawer ONLY when pathname changes (user navigated to new page)
  useEffect(() => {
    if (prevPathname.current !== pathname) {
      closeMobileNav();
      prevPathname.current = pathname;
    }
  }, [pathname, closeMobileNav]);

  const isActive = (href: string, exact: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.href = "/admin/login";
  };

  const navContent = (isMobile: boolean = false) => (
    <div className="flex flex-col h-full select-none">
      {/* Brand Header */}
      <div className="h-[64px] flex-shrink-0 flex items-center justify-between border-b border-white/[0.06] px-4">
        {isMobile || !collapsed ? (
          <Link
            href="/admin"
            onClick={closeMobileNav}
            className="flex items-center gap-2.5 hover:opacity-85 transition-opacity"
          >
            <Image
              src="/logo/logo.png"
              alt="SPECTRA"
              width={110}
              height={26}
              className="h-5 sm:h-6 w-auto object-contain brightness-0 invert"
              priority
            />
            <span className="text-[9px] font-bold tracking-[0.2em] text-[#c8874a] uppercase bg-[#c8874a]/10 px-1.5 py-0.5 rounded-[2px] border border-[#c8874a]/20">
              Admin
            </span>
          </Link>
        ) : (
          <div className="w-8 h-8 rounded-sm bg-[#181818] border border-white/[0.08] flex items-center justify-center shadow-md flex-shrink-0 mx-auto">
            <Image
              src="/logo/logo.png"
              alt="SPECTRA"
              width={20}
              height={20}
              className="object-contain brightness-0 invert"
              priority
            />
          </div>
        )}

        {/* Mobile Close Button */}
        {isMobile && (
          <button
            type="button"
            onClick={closeMobileNav}
            className="w-8 h-8 rounded-sm bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.08] flex items-center justify-center text-neutral-300 hover:text-white transition-colors cursor-pointer"
            aria-label="Close menu"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Nav Items */}
      <nav className="flex-1 py-4 overflow-y-auto no-scrollbar">
        <div className="px-3 space-y-1.5">
          {(isMobile || !collapsed) && (
            <p className="text-[9px] font-bold text-white/20 tracking-[0.3em] uppercase px-2 pb-2 pt-1">
              Navigation
            </p>
          )}
          {navItems.map((item) => {
            const active = isActive(item.href, item.exact);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeMobileNav}
                title={!isMobile && collapsed ? item.label : undefined}
                className={`flex items-center gap-3 py-2.5 rounded-sm transition-all duration-200 group relative overflow-hidden ${
                  !isMobile && collapsed ? "justify-center px-2" : "px-3"
                } ${
                  active
                    ? "bg-[#181818] text-white border border-white/[0.08] shadow-md shadow-black/40"
                    : "text-white/45 hover:text-white hover:bg-white/[0.03]"
                }`}
              >
                {/* Active left indicator bar */}
                {active && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-[#c8874a] rounded-r-sm shadow-sm shadow-[#c8874a]" />
                )}

                {/* Icon container */}
                <div
                  className={`relative flex-shrink-0 w-8 h-8 rounded-sm flex items-center justify-center transition-all duration-200 ${
                    active
                      ? "bg-[#c8874a] text-white shadow-md shadow-[#c8874a]/20"
                      : "bg-[#161616] text-white/50 group-hover:text-white group-hover:bg-[#202020]"
                  }`}
                >
                  <Icon size={15} />
                </div>

                {(isMobile || !collapsed) && (
                  <span
                    className={`text-[12.5px] font-semibold tracking-wide relative ${
                      active ? "text-white font-bold" : ""
                    }`}
                  >
                    {item.label}
                  </span>
                )}

                {/* Desktop tooltip when collapsed */}
                {!isMobile && collapsed && (
                  <span className="absolute left-full ml-3 px-3 py-1.5 bg-[#1a1a1a] border border-white/10 text-white text-[11px] font-semibold rounded-sm opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 shadow-2xl pointer-events-none">
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Store link & Logout */}
      <div className="pb-5 px-3 border-t border-white/[0.05] pt-3 space-y-1.5">
        <Link
          href="/"
          target="_blank"
          onClick={closeMobileNav}
          title={!isMobile && collapsed ? "View Store" : undefined}
          className={`flex items-center gap-3 py-2 rounded-sm text-white/40 hover:text-white hover:bg-white/[0.04] transition-all group relative ${
            !isMobile && collapsed ? "justify-center px-2" : "px-3"
          }`}
        >
          <div className="w-8 h-8 rounded-sm bg-[#161616] group-hover:bg-[#222222] flex items-center justify-center flex-shrink-0 transition-colors text-white/50 group-hover:text-white">
            <ExternalLink size={14} />
          </div>
          {(isMobile || !collapsed) && <span className="text-[12px] font-semibold">View Live Store</span>}
          {!isMobile && collapsed && (
            <span className="absolute left-full ml-3 px-3 py-1.5 bg-[#1a1a1a] border border-white/10 text-white text-[11px] font-semibold rounded-sm opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 shadow-2xl pointer-events-none">
              View Live Store
            </span>
          )}
        </Link>

        <button
          type="button"
          onClick={handleLogout}
          title={!isMobile && collapsed ? "Sign Out" : undefined}
          className={`w-full flex items-center gap-3 py-2 rounded-sm text-red-400/70 hover:text-red-400 hover:bg-red-500/10 transition-all group relative cursor-pointer ${
            !isMobile && collapsed ? "justify-center px-2" : "px-3"
          }`}
        >
          <div className="w-8 h-8 rounded-sm bg-[#161616] group-hover:bg-red-500/15 flex items-center justify-center flex-shrink-0 transition-colors text-red-400/70 group-hover:text-red-400">
            <LogOut size={14} />
          </div>
          {(isMobile || !collapsed) && <span className="text-[12px] font-semibold">Sign Out</span>}
          {!isMobile && collapsed && (
            <span className="absolute left-full ml-3 px-3 py-1.5 bg-[#1a1a1a] border border-white/10 text-red-400 text-[11px] font-semibold rounded-sm opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 shadow-2xl pointer-events-none">
              Sign Out
            </span>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* ─── DESKTOP SIDEBAR (hidden on mobile <md) ─── */}
      <aside
        className={`hidden md:flex relative flex-col h-full transition-all duration-300 ease-in-out flex-shrink-0 bg-[#0c0c0c] border-r border-white/[0.06] no-scrollbar ${
          collapsed ? "w-[72px]" : "w-[230px]"
        }`}
      >
        {navContent(false)}

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3.5 top-[50px] w-7 h-7 rounded-full border border-white/10 flex items-center justify-center text-white/50 hover:text-white transition-all shadow-xl z-20 bg-[#181818] hover:bg-[#222222] cursor-pointer"
          aria-label={collapsed ? "Expand" : "Collapse"}
        >
          {collapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
        </button>
      </aside>

      {/* ─── MOBILE DRAWER (Identical rock-solid pattern as Navbar.tsx) ─── */}
      <div
        className={`md:hidden fixed inset-0 z-[100] transition-[visibility] duration-300 ${
          isMobileOpen ? "visible" : "invisible pointer-events-none"
        }`}
        aria-modal="true"
        role="dialog"
        aria-label="Admin navigation menu"
      >
        {/* Backdrop */}
        <div
          onClick={closeMobileNav}
          className={`fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-300 ease-in-out ${
            isMobileOpen ? "opacity-100" : "opacity-0"
          }`}
        />

        {/* Slide-out Drawer Panel */}
        <aside
          className={`fixed inset-y-0 left-0 w-[275px] max-w-[85vw] h-full bg-[#0c0c0c] border-r border-white/10 shadow-2xl flex flex-col justify-between transition-transform duration-300 ease-in-out z-10 ${
            isMobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {navContent(true)}
        </aside>
      </div>
    </>
  );
}
