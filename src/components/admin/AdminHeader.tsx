"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Bell, Search } from "lucide-react";

const breadcrumbMap: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/products": "Products",
  "/admin/products/new": "Add Product",
  "/admin/orders": "Orders",
  "/admin/media": "Media",
  "/admin/settings": "Settings",
};

export default function AdminHeader() {
  const pathname = usePathname();
  const crumb = breadcrumbMap[pathname] ?? "Admin";

  return (
    <header className="h-[60px] flex-shrink-0 flex items-center justify-between px-6 bg-[#0c0c0c] border-b border-white/[0.06] z-10">
      {/* Left: Breadcrumb */}
      <div className="flex items-center gap-2">
        <span className="text-[11px] text-white/30 font-medium uppercase tracking-widest">
          Admin
        </span>
        <span className="text-white/20">/</span>
        <span className="text-[13px] font-bold text-white tracking-wide">
          {crumb}
        </span>
      </div>

      {/* Right: Search + Notifications + Avatar */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="hidden sm:flex items-center gap-2 bg-[#161616] border border-white/[0.08] rounded-xl px-3 py-2 w-56 group focus-within:border-[#c8874a] focus-within:bg-[#1a1a1a] transition-all">
          <Search size={14} className="text-white/40 group-focus-within:text-[#c8874a] flex-shrink-0 transition-colors" />
          <input
            type="text"
            placeholder="Search dashboard..."
            className="text-[12px] bg-transparent outline-none text-white placeholder-white/30 w-full"
          />
        </div>

        {/* Notifications */}
        <button className="relative w-9 h-9 flex items-center justify-center rounded-xl bg-[#161616] hover:bg-[#202020] border border-white/[0.08] transition-colors text-white/60 hover:text-white">
          <Bell size={16} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-[#c8874a] rounded-full ring-2 ring-[#0c0c0c]" />
        </button>

        {/* Avatar */}
        <div className="flex items-center gap-2.5 pl-3 border-l border-white/[0.08]">
          <div className="w-8 h-8 rounded-full bg-[#c8874a] text-white flex items-center justify-center shadow-md shadow-[#c8874a]/20">
            <span className="text-[11px] font-bold">SA</span>
          </div>
          <div className="hidden sm:block">
            <p className="text-[12px] font-bold text-white leading-tight">
              Store Admin
            </p>
            <p className="text-[10px] text-white/40">spectra@admin.com</p>
          </div>
        </div>
      </div>
    </header>
  );
}
