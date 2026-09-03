"use client";

import React, { useState, useEffect } from "react";
import { GiftPackage } from "@/lib/giftPackages";

interface GiftPackageSelectorProps {
  selectedPackage: GiftPackage | null;
  onSelectPackage: (pkg: GiftPackage | null) => void;
}

export default function GiftPackageSelector({
  selectedPackage,
  onSelectPackage,
}: GiftPackageSelectorProps) {
  const [packages, setPackages] = useState<GiftPackage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadActivePackages() {
      try {
        const res = await fetch("/api/gift-packages");
        const data = await res.json();
        if (data.success && Array.isArray(data.packages)) {
          setPackages(data.packages);
        }
      } catch (err) {
        console.error("Error loading gift packages:", err);
      } finally {
        setLoading(false);
      }
    }
    loadActivePackages();
  }, []);

  // If no packages are active in admin, don't show the widget
  if (!loading && packages.length === 0) {
    return null;
  }

  return (
    <div className="bg-[#121212] border border-white/[0.08] rounded-xl p-3.5 space-y-2.5">
      {/* Header */}
      <div className="flex items-center justify-between px-0.5">
        <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-neutral-400">
          Gift Packaging (Optional)
        </span>
        {selectedPackage && (
          <span className="text-[11.5px] font-bold text-[#c8874a]">
            +₹{selectedPackage.price.toLocaleString("en-IN")} added
          </span>
        )}
      </div>

      {/* Clean On-Page Options (No popups, 1-click select) */}
      <div className="space-y-1.5">
        {/* Option 1: Standard Included Free */}
        <div
          onClick={() => onSelectPackage(null)}
          className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg border transition-all cursor-pointer select-none ${
            selectedPackage === null
              ? "bg-[#181818] border-[#c8874a] text-white"
              : "bg-[#151515] border-white/[0.05] text-neutral-400 hover:border-white/[0.15] hover:text-white"
          }`}
        >
          <div className="flex items-center gap-2.5">
            <span
              className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center transition-colors ${
                selectedPackage === null
                  ? "border-[#c8874a] bg-[#c8874a]"
                  : "border-neutral-600"
              }`}
            >
              {selectedPackage === null && (
                <span className="w-1.5 h-1.5 rounded-full bg-black" />
              )}
            </span>
            <span className="text-[12px] font-medium">Standard Protective Case</span>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
            Free
          </span>
        </div>

        {/* Dynamic Active Gift Packages */}
        {packages.map((pkg) => {
          const isSelected = selectedPackage?.id === pkg.id;
          return (
            <div
              key={pkg.id}
              onClick={() => onSelectPackage(pkg)}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg border transition-all cursor-pointer select-none ${
                isSelected
                  ? "bg-[#181818] border-[#c8874a] text-white"
                  : "bg-[#151515] border-white/[0.05] text-neutral-400 hover:border-white/[0.15] hover:text-white"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span
                  className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center transition-colors ${
                    isSelected
                      ? "border-[#c8874a] bg-[#c8874a]"
                      : "border-neutral-600"
                  }`}
                >
                  {isSelected && (
                    <span className="w-1.5 h-1.5 rounded-full bg-black" />
                  )}
                </span>
                <span className="text-[12px] font-medium">{pkg.name}</span>
              </div>
              <span className="text-[12px] font-bold text-[#c8874a]">
                +₹{pkg.price.toLocaleString("en-IN")}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
