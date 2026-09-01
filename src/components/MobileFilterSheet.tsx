"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { SlidersHorizontal, X, Check } from "lucide-react";

interface MobileFilterSheetProps {
  categoryFilter: string;
  shapeFilter: string;
  shapes: string[];
  categories: string[];
}

export default function MobileFilterSheet({
  categoryFilter,
  shapeFilter,
  shapes,
  categories,
}: MobileFilterSheetProps) {
  const [open, setOpen] = useState(false);

  // Prevent body scroll when sheet is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const activeCount =
    (categoryFilter !== "all" ? 1 : 0) + (shapeFilter !== "all" ? 1 : 0);

  const buildHref = (cat: string, shape: string) => {
    const params = new URLSearchParams();
    if (cat !== "all") params.set("category", cat);
    if (shape !== "all") params.set("shape", shape);
    const qs = params.toString();
    return qs ? `/sunglasses?${qs}` : "/sunglasses";
  };

  return (
    <>
      {/* Inline Filter Bar — mobile only, sits above the product grid */}
      <div className="md:hidden flex items-center justify-between py-3 mb-4">
        {/* Left: label + active count */}
        <div className="flex items-center gap-2">
          <span className="text-white text-[12px] font-bold uppercase tracking-[0.18em]">
            Filter
          </span>
          {activeCount > 0 && (
            <span className="w-4 h-4 rounded-full bg-[#c8874a] text-white text-[9px] font-black flex items-center justify-center">
              {activeCount}
            </span>
          )}
        </div>

        {/* Right: icon button */}
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-sm text-white text-[11px] font-bold uppercase tracking-wider active:scale-95 transition-transform"
        >
          <SlidersHorizontal size={12} />
          {activeCount > 0 ? `${activeCount} Active` : "Select"}
        </button>
      </div>

      {/* Backdrop */}
      {open && (
        <div
          className="md:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Bottom Sheet — slides up from bottom of screen */}
      <div
        className={`md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#111111] rounded-t-3xl border-t border-white/[0.08] transition-transform duration-300 ease-out ${
          open ? "translate-y-0" : "translate-y-full"
        }`}
      >
        {/* Handle + Header */}
        <div className="relative flex items-center justify-between px-5 pt-5 pb-3 border-b border-white/[0.07]">
          <div className="w-10 h-1 rounded-full bg-white/20 absolute left-1/2 -translate-x-1/2 top-2.5" />
          <p className="text-white text-[13px] font-bold tracking-[0.15em] uppercase">
            Filter
          </p>
          <button
            onClick={() => setOpen(false)}
            className="w-7 h-7 rounded-full bg-white/[0.08] flex items-center justify-center text-neutral-400 hover:text-white transition-colors"
          >
            <X size={13} />
          </button>
        </div>

        <div className="px-5 pt-5 pb-10 space-y-7 overflow-y-auto max-h-[70vh]">
          {/* Category */}
          <div>
            <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-[#c8874a] mb-3">
              Gender
            </p>
            <div className="flex flex-wrap gap-2">
              {categories.map((c) => {
                const isActive = categoryFilter === c;
                return (
                  <Link
                    key={c}
                    href={buildHref(c, shapeFilter)}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-bold uppercase tracking-wider transition-all ${
                      isActive
                        ? "bg-[#c8874a] text-white shadow-md shadow-[#c8874a]/20"
                        : "bg-[#1a1a1a] text-neutral-400 border border-white/[0.07]"
                    }`}
                  >
                    {isActive && <Check size={11} />}
                    {c === "all" ? "All Genders" : c}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Shape */}
          <div>
            <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-[#c8874a] mb-3">
              Frame Shape
            </p>
            <div className="flex flex-wrap gap-2">
              {shapes.map((s) => {
                const isActive = shapeFilter === s;
                return (
                  <Link
                    key={s}
                    href={buildHref(categoryFilter, s)}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-semibold capitalize transition-all ${
                      isActive
                        ? "bg-white text-black font-bold"
                        : "bg-[#1a1a1a] text-neutral-400 border border-white/[0.07]"
                    }`}
                  >
                    {isActive && <Check size={11} />}
                    {s}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Reset */}
          {activeCount > 0 && (
            <Link
              href="/sunglasses"
              onClick={() => setOpen(false)}
              className="block w-full text-center py-3 rounded-xl border border-white/[0.1] text-[12px] text-neutral-400 font-semibold uppercase tracking-wider hover:text-white hover:border-white/[0.2] transition-colors"
            >
              Reset All Filters
            </Link>
          )}
        </div>
      </div>
    </>
  );
}
