"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, Search, Heart, ShoppingBag } from "lucide-react";
import SearchOverlay from "./SearchOverlay";
import { useCart } from "./CartContext";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { count: cartCount, openCart } = useCart();

  // Scroll effect
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close menu on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsMenuOpen(false);
    };
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMenuOpen]);

  const mainNavItems = [
    { name: "NEW ARRIVALS", href: "/new-arrivals" },
    { name: "MEN", href: "/men" },
    { name: "WOMEN", href: "/women" },
    { name: "SUNGLASSES", href: "/sunglasses" },
    { name: "POLARIZED", href: "/polarized" },
    { name: "COLLECTIONS", href: "/collections" },
    { name: "GIFTS", href: "/gifts" },
  ];

  const infoNavItems = [
    { name: "ABOUT", href: "/about" },
    { name: "CONTACT", href: "/contact" },
  ];

  return (
    <>
      <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      <header
        className={`sticky top-0 z-40 w-full transition-all duration-300 ${
          scrolled
            ? "bg-[#0a0a0a]/98 backdrop-blur-xl border-b border-white/[0.06] shadow-2xl shadow-black/50"
            : "bg-[#0a0a0a]/95 backdrop-blur-md border-b border-neutral-800/60"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative flex items-center justify-between h-[60px] sm:h-[64px]">

            {/* Left Area: Hamburger on mobile, Logo on desktop */}
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setIsMenuOpen(true)}
                className="md:hidden text-neutral-300 hover:text-white p-1 -ml-1 rounded transition-colors cursor-pointer"
                aria-label="Open navigation menu"
              >
                <Menu className="w-5 h-5 stroke-[1.5]" />
              </button>

              {/* Desktop Logo (hidden on mobile) */}
              <Link href="/" className="hidden md:flex items-center hover:opacity-80 transition-opacity">
                <Image
                  src="/logo/logo.png"
                  alt="SPECTRA Logo"
                  width={140}
                  height={36}
                  className="h-7 sm:h-8 w-auto object-contain"
                  priority
                />
              </Link>
            </div>

            {/* Mobile Logo: Centered exclusively on mobile (< md) */}
            <div className="absolute left-1/2 -translate-x-1/2 md:hidden flex items-center">
              <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
                <Image
                  src="/logo/logo.png"
                  alt="SPECTRA Logo"
                  width={130}
                  height={32}
                  className="h-6 w-auto object-contain"
                  priority
                />
              </Link>
            </div>

            {/* Center Nav (desktop only) */}
            <nav className="hidden md:flex items-center gap-7 lg:gap-9">
              {mainNavItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-[10px] lg:text-[11px] font-semibold tracking-[0.2em] text-neutral-300 hover:text-white transition-colors duration-200 uppercase py-1 relative group"
                >
                  {item.name}
                  <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-[#c8874a] transition-all duration-300 group-hover:w-full" />
                </Link>
              ))}
            </nav>

            {/* Right icons */}
            <div className="flex items-center gap-3 sm:gap-4 text-neutral-300">
              {/* Search */}
              <button
                type="button"
                onClick={() => setIsSearchOpen(true)}
                className="hover:text-white p-1 transition-colors cursor-pointer group relative"
                aria-label="Search"
              >
                <Search className="w-[17px] h-[17px] stroke-[1.5] group-hover:scale-110 transition-transform" />
              </button>

              {/* Wishlist */}
              <Link
                href="/wishlist"
                className="hover:text-white p-1 transition-colors group"
                aria-label="Wishlist"
              >
                <Heart className="w-[17px] h-[17px] stroke-[1.5] group-hover:scale-110 transition-transform" />
              </Link>

              {/* Cart */}
              <button
                type="button"
                onClick={openCart}
                className="hover:text-white p-1 transition-colors relative group cursor-pointer"
                aria-label="Shopping Cart"
              >
                <ShoppingBag className="w-[17px] h-[17px] stroke-[1.5] group-hover:scale-110 transition-transform" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1.5 bg-[#c8874a] text-white text-[9px] font-bold h-4 min-w-4 px-0.5 rounded-full flex items-center justify-center leading-none animate-in zoom-in duration-200">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      <div
        className={`fixed inset-0 z-50 transition-[visibility] duration-300 ${
          isMenuOpen ? "visible" : "invisible pointer-events-none"
        }`}
        aria-modal="true"
        role="dialog"
        aria-label="Navigation menu"
      >
        <div
          className={`fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity duration-300 ease-in-out ${
            isMenuOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setIsMenuOpen(false)}
        />

        <aside
          className={`fixed top-0 left-0 bottom-0 w-full max-w-[280px] sm:max-w-xs bg-[#0e0e0e] border-r border-neutral-800 text-white shadow-2xl flex flex-col z-50 transform transition-transform duration-300 ease-out ${
            isMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {/* Drawer Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-800/80">
            <Link href="/" onClick={() => setIsMenuOpen(false)} className="hover:opacity-80 transition-opacity">
              <Image src="/logo/logo.png" alt="SPECTRA Logo" width={120} height={32} className="h-6 sm:h-7 w-auto object-contain" />
            </Link>
            <button
              type="button"
              onClick={() => setIsMenuOpen(false)}
              className="text-neutral-400 hover:text-white p-1.5 rounded transition-colors cursor-pointer"
              aria-label="Close navigation menu"
            >
              <X className="w-5 h-5 stroke-[1.5]" />
            </button>
          </div>

          {/* Mobile search */}
          <div className="px-5 py-3 border-b border-neutral-800/60">
            <button
              onClick={() => { setIsMenuOpen(false); setIsSearchOpen(true); }}
              className="w-full flex items-center gap-3 bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-[12px] text-neutral-400 hover:text-white hover:border-white/[0.15] transition-all"
            >
              <Search size={14} />
              Search sunglasses...
            </button>
          </div>

          {/* Nav Links */}
          <nav className="flex-1 overflow-y-auto px-5 py-6 space-y-6">
            <div className="space-y-1">
              <p className="text-[9px] font-bold text-neutral-500 tracking-[0.3em] uppercase pb-2">Shop</p>
              {mainNavItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center justify-between py-2 text-[11px] font-bold tracking-[0.2em] text-neutral-300 hover:text-white hover:translate-x-1 transition-all duration-200 uppercase group"
                >
                  {item.name}
                  <span className="w-1.5 h-1.5 rounded-full bg-[#c8874a] opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              ))}
            </div>

            <div className="h-px bg-neutral-800" />

            <div className="space-y-1">
              <p className="text-[9px] font-bold text-neutral-500 tracking-[0.3em] uppercase pb-2">Information</p>
              {infoNavItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="block py-1.5 text-[11px] font-semibold tracking-[0.2em] text-neutral-400 hover:text-white hover:translate-x-1 transition-all duration-200 uppercase"
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </nav>

          {/* Drawer Footer */}
          <div className="px-5 py-4 border-t border-neutral-800/80 space-y-3">
            <button
              onClick={() => { setIsMenuOpen(false); openCart(); }}
              className="w-full flex items-center justify-center gap-2 bg-[#c8874a] text-white text-[11px] font-bold py-3 rounded-xl tracking-wide hover:bg-[#b87840] transition-colors"
            >
              <ShoppingBag size={14} />
              Cart
              {cartCount > 0 && (
                <span className="bg-white text-[#c8874a] text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
            <p className="text-[9px] text-neutral-600 tracking-wider text-center">
              &copy; {new Date().getFullYear()} SPECTRA. All rights reserved.
            </p>
          </div>
        </aside>
      </div>
    </>
  );
}
