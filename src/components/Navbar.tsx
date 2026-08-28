"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, Search, User, ShoppingBag } from "lucide-react";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  // Close menu on Escape key press and manage body scroll lock
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsMenuOpen(false);
      }
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

  // Main 4 navigation items shown in navbar
  const mainNavItems = [
    { name: "MEN", href: "/men" },
    { name: "WOMEN", href: "/women" },
    { name: "SUNGLASSES", href: "/sunglasses" },
    { name: "COLLECTIONS", href: "/collections" },
  ];

  // Additional navigation items for side menu drawer
  const additionalNavItems = [
    { name: "ABOUT", href: "/about" },
    { name: "CONTACT", href: "/contact" },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-[#0a0a0a]/90 backdrop-blur-md transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-18">
            {/* Left section: Hamburger Button + Brand Logo */}
            <div className="flex items-center space-x-3 sm:space-x-5">
              <button
                type="button"
                onClick={() => setIsMenuOpen(true)}
                className="text-neutral-300 hover:text-white p-1.5 -ml-1.5 rounded-md transition-colors focus:outline-none focus:ring-1 focus:ring-neutral-700 cursor-pointer"
                aria-label="Open navigation menu"
              >
                <Menu className="w-5 h-5 stroke-[1.5]" />
              </button>

              <Link
                href="/"
                className="flex items-center hover:opacity-80 transition-opacity"
              >
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

            {/* Center section: 4 Primary Nav items (Visible on Desktop/Tablet) */}
            <nav className="hidden md:flex items-center space-x-6 lg:space-x-10">
              {mainNavItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-[11px] lg:text-xs font-semibold tracking-[0.22em] text-neutral-300 hover:text-white transition-colors duration-200 uppercase py-1 relative group"
                >
                  {item.name}
                  <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-white transition-all duration-300 group-hover:w-full" />
                </Link>
              ))}
            </nav>

            {/* Right section: Search, User Profile, Cart */}
            <div className="flex items-center space-x-3 sm:space-x-5 text-neutral-300">
              <button
                type="button"
                className="hover:text-white p-1 transition-colors cursor-pointer"
                aria-label="Search"
              >
                <Search className="w-4 h-4 sm:w-[18px] sm:h-[18px] stroke-[1.5]" />
              </button>

              <Link
                href="/account"
                className="hover:text-white p-1 transition-colors"
                aria-label="Account"
              >
                <User className="w-4 h-4 sm:w-[18px] sm:h-[18px] stroke-[1.5]" />
              </Link>

              <Link
                href="/cart"
                className="hover:text-white p-1 transition-colors relative"
                aria-label="Shopping Cart"
              >
                <ShoppingBag className="w-4 h-4 sm:w-[18px] sm:h-[18px] stroke-[1.5]" />
                <span className="absolute -top-1 -right-1.5 bg-white text-black text-[9px] font-bold h-3.5 min-w-3.5 px-0.5 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Slide-out Sidebar Drawer Menu (Mobile First & Desktop) */}
      <div
        className={`fixed inset-0 z-50 transition-visibility duration-300 ${
          isMenuOpen ? "visible" : "invisible pointer-events-none"
        }`}
        aria-modal="true"
        role="dialog"
      >
        {/* Backdrop Overlay */}
        <div
          className={`fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300 ease-in-out ${
            isMenuOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setIsMenuOpen(false)}
        />

        {/* Drawer Panel */}
        <aside
          className={`fixed top-0 left-0 bottom-0 w-full max-w-xs sm:max-w-sm bg-[#0e0e0e] border-r border-neutral-800 text-white shadow-2xl flex flex-col justify-between z-50 transform transition-transform duration-300 ease-out ${
            isMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div>
            {/* Drawer Header */}
            <div className="flex items-center justify-between p-5 border-b border-neutral-800/80">
              <Link
                href="/"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center hover:opacity-80 transition-opacity"
              >
                <Image
                  src="/logo/logo.png"
                  alt="SPECTRA Logo"
                  width={120}
                  height={32}
                  className="h-6 sm:h-7 w-auto object-contain"
                />
              </Link>
              <button
                type="button"
                onClick={() => setIsMenuOpen(false)}
                className="text-neutral-400 hover:text-white p-1.5 rounded-md transition-colors cursor-pointer"
                aria-label="Close navigation menu"
              >
                <X className="w-5 h-5 stroke-[1.5]" />
              </button>
            </div>

            {/* Navigation Links inside Drawer */}
            <nav className="px-6 py-6 space-y-5">
              {/* Primary Top Showing Sections */}
              <div className="space-y-0.5">
                <p className="text-[10px] font-semibold text-neutral-400 tracking-[0.25em] uppercase pb-2">
                  Categories
                </p>
                {mainNavItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="block py-2 text-xs sm:text-sm font-semibold tracking-[0.18em] text-neutral-200 hover:text-white hover:translate-x-1 transition-all duration-200 uppercase"
                  >
                    {item.name}
                  </Link>
                ))}
              </div>

              <div className="h-[1px] bg-neutral-800/80 my-3" />

              {/* Additional Sections: About & Contact */}
              <div className="space-y-0.5">
                <p className="text-[10px] font-semibold text-neutral-400 tracking-[0.25em] uppercase pb-2">
                  Information
                </p>
                {additionalNavItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="block py-1.5 text-xs sm:text-xs font-medium tracking-[0.18em] text-neutral-300 hover:text-white hover:translate-x-1 transition-all duration-200 uppercase"
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </nav>
          </div>

          {/* Drawer Footer */}
          <div className="p-5 border-t border-neutral-800/80 bg-neutral-950/40">
            <p className="text-[10px] text-neutral-400 tracking-wider">
              &copy; {new Date().getFullYear()} SPECTRA. All rights reserved.
            </p>
          </div>
        </aside>
      </div>
    </>
  );
}
