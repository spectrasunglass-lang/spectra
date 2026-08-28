"use client";

import React, { useState } from "react";
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
} from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard, exact: true },
  { label: "Products", href: "/admin/products", icon: Package, exact: false },
  { label: "Orders", href: "/admin/orders", icon: ShoppingBag, exact: false },
  { label: "Media", href: "/admin/media", icon: ImageIcon, exact: false },
  { label: "Settings", href: "/admin/settings", icon: Settings, exact: false },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const isActive = (href: string, exact: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  return (
    <aside
      className={`relative flex flex-col h-full transition-all duration-300 ease-in-out flex-shrink-0 bg-[#0c0c0c] border-r border-white/[0.06] ${
        collapsed ? "w-[72px]" : "w-[230px]"
      }`}
    >
      {/* Top gold accent line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#c8874a] via-[#e5a872] to-transparent" />

      {/* Brand */}
      <div
        className={`flex items-center border-b border-white/[0.05] transition-all duration-300 ${
          collapsed ? "justify-center py-5 px-3" : "px-5 py-5"
        }`}
      >
        {collapsed ? (
          <div className="w-9 h-9 rounded-xl bg-[#181818] border border-white/[0.08] flex items-center justify-center shadow-lg flex-shrink-0">
            <Image
              src="/logo/logo.png"
              alt="SPECTRA"
              width={22}
              height={22}
              className="object-contain brightness-0 invert"
              priority
            />
          </div>
        ) : (
          <Link href="/admin" className="flex flex-col hover:opacity-80 transition-opacity">
            <Image
              src="/logo/logo.png"
              alt="SPECTRA Admin"
              width={120}
              height={32}
              className="h-6 w-auto object-contain brightness-0 invert"
              priority
            />
            <span className="text-[9px] tracking-[0.35em] text-[#c8874a] uppercase mt-1 pl-0.5 font-bold">
              Admin Portal
            </span>
          </Link>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 overflow-y-auto">
        <div className="px-3 space-y-1.5">
          {!collapsed && (
            <p className="text-[9px] font-bold text-white/20 tracking-[0.3em] uppercase px-2 pb-2 pt-1">
              Menu
            </p>
          )}
          {navItems.map((item) => {
            const active = isActive(item.href, item.exact);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                title={collapsed ? item.label : undefined}
                className={`flex items-center gap-3 py-2.5 rounded-xl transition-all duration-200 group relative overflow-hidden ${
                  collapsed ? "justify-center px-2" : "px-3"
                } ${
                  active
                    ? "bg-[#181818] text-white border border-white/[0.08] shadow-md shadow-black/40"
                    : "text-white/45 hover:text-white hover:bg-white/[0.03]"
                }`}
              >
                {/* Active left indicator bar */}
                {active && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-[#c8874a] rounded-r-full shadow-sm shadow-[#c8874a]" />
                )}

                {/* Icon container */}
                <div
                  className={`relative flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 ${
                    active
                      ? "bg-[#c8874a] text-white shadow-md shadow-[#c8874a]/20"
                      : "bg-[#161616] text-white/50 group-hover:text-white group-hover:bg-[#202020]"
                  }`}
                >
                  <Icon size={15} />
                </div>

                {!collapsed && (
                  <span
                    className={`text-[12.5px] font-semibold tracking-wide relative ${
                      active ? "text-white font-bold" : ""
                    }`}
                  >
                    {item.label}
                  </span>
                )}

                {/* Tooltip */}
                {collapsed && (
                  <span className="absolute left-full ml-3 px-3 py-1.5 bg-[#1a1a1a] border border-white/10 text-white text-[11px] font-semibold rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 shadow-2xl pointer-events-none">
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Store link */}
      <div className="pb-4 px-3 border-t border-white/[0.05] pt-3">
        <Link
          href="/"
          title={collapsed ? "View Store" : undefined}
          className={`flex items-center gap-3 py-2.5 rounded-xl text-white/30 hover:text-white hover:bg-white/[0.04] transition-all group relative ${
            collapsed ? "justify-center px-2" : "px-3"
          }`}
        >
          <div className="w-8 h-8 rounded-lg bg-[#161616] group-hover:bg-[#222222] flex items-center justify-center flex-shrink-0 transition-colors text-white/50 group-hover:text-white">
            <ExternalLink size={14} />
          </div>
          {!collapsed && <span className="text-[12px] font-semibold">View Store</span>}
          {!collapsed && <LogOut size={12} className="ml-auto opacity-40" />}
          {collapsed && (
            <span className="absolute left-full ml-3 px-3 py-1.5 bg-[#1a1a1a] border border-white/10 text-white text-[11px] font-semibold rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 shadow-2xl pointer-events-none">
              View Store
            </span>
          )}
        </Link>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3.5 top-[74px] w-7 h-7 rounded-full border border-white/10 flex items-center justify-center text-white/50 hover:text-white transition-all shadow-xl z-10 bg-[#181818] hover:bg-[#222222]"
        aria-label={collapsed ? "Expand" : "Collapse"}
      >
        {collapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
      </button>
    </aside>
  );
}
