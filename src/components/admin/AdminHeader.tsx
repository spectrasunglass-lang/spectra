"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Bell, Search, Menu } from "lucide-react";
import { useAdminNav } from "./AdminNavContext";

const breadcrumbMap: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/products": "Products",
  "/admin/products/new": "Add Product",
  "/admin/orders": "Orders",
  "/admin/subscribers": "Subscribers",
  "/admin/campaigns": "Campaigns",
  "/admin/categories": "Categories",
  "/admin/media": "Media",
  "/admin/settings": "Settings",
};

export default function AdminHeader() {
  const pathname = usePathname();
  const crumb = breadcrumbMap[pathname] ?? "Admin";
  const { toggleMobileNav } = useAdminNav();

  return (
    <header className="h-[60px] sm:h-[64px] flex-shrink-0 flex items-center justify-between px-4 sm:px-6 bg-[#0c0c0c] border-b border-white/[0.06] z-10">
      {/* Left: Mobile Menu Button + Breadcrumb */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Mobile Hamburger Menu Toggle */}
        <button
          type="button"
          onClick={toggleMobileNav}
          className="md:hidden w-9 h-9 flex items-center justify-center rounded-sm bg-[#161616] border border-white/[0.08] text-neutral-300 hover:text-white transition-colors cursor-pointer"
          aria-label="Toggle navigation menu"
        >
          <Menu size={16} />
        </button>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <span className="text-[10.5px] sm:text-[11px] text-white/30 font-medium uppercase tracking-widest hidden xs:inline">
            Admin
          </span>
          <span className="text-white/20 hidden xs:inline">/</span>
          <span className="text-[12.5px] sm:text-[13.5px] font-bold text-white tracking-wide truncate max-w-[140px] sm:max-w-none">
            {crumb}
          </span>
        </div>
      </div>

      {/* Right: Search + Notifications + Avatar */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Search (desktop only) */}
        <div className="hidden lg:flex items-center gap-2 bg-[#161616] border border-white/[0.08] rounded-sm px-3 py-2 w-52 group focus-within:border-[#c8874a] focus-within:bg-[#1a1a1a] transition-all">
          <Search size={14} className="text-white/40 group-focus-within:text-[#c8874a] flex-shrink-0 transition-colors" />
          <input
            type="text"
            placeholder="Search dashboard..."
            className="text-[12px] bg-transparent outline-none text-white placeholder-white/30 w-full"
          />
        </div>

        {/* Notifications */}
        <button className="relative w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-sm bg-[#161616] hover:bg-[#202020] border border-white/[0.08] transition-colors text-white/60 hover:text-white">
          <Bell size={15} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#c8874a] rounded-full ring-2 ring-[#0c0c0c]" />
        </button>

        {/* Avatar */}
        <div className="flex items-center gap-2 sm:gap-2.5 pl-2 sm:pl-3 border-l border-white/[0.08]">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#c8874a] text-white flex items-center justify-center shadow-md shadow-[#c8874a]/20 flex-shrink-0">
            <span className="text-[10px] sm:text-[11px] font-bold">SA</span>
          </div>
          <div className="hidden sm:block">
            <p className="text-[11.5px] font-bold text-white leading-tight">
              Store Admin
            </p>
            <p className="text-[9.5px] text-white/40 truncate max-w-[120px]">spectrasunglass@gmail.com</p>
          </div>
        </div>
      </div>
    </header>
  );
}
