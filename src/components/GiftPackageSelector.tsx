"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Gift, Check, X, Sparkles, ChevronRight, ShieldCheck } from "lucide-react";
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
  const [isOpen, setIsOpen] = useState(false);
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

  const lowestPrice = packages.length > 0 ? Math.min(...packages.map((p) => p.price)) : 149;

  return (
    <>
      {/* ─── Non-Boring Luxury Glowing Gift Button ─── */}
      <div className="relative group">
        {selectedPackage ? (
          /* Active Selected State */
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#c8874a]/10 border border-[#c8874a]/50 shadow-[0_0_20px_rgba(200,135,74,0.18)] transition-all">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-lg bg-[#c8874a] flex items-center justify-center text-white flex-shrink-0 shadow-md shadow-[#c8874a]/30">
                <Gift size={18} />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#e5a872] flex items-center gap-1">
                    <Sparkles size={11} /> Gift Packaging Added
                  </span>
                </div>
                <p className="text-xs font-bold text-white truncate">{selectedPackage.name}</p>
                <p className="text-[11px] font-bold text-[#c8874a]">
                  +₹{selectedPackage.price.toLocaleString("en-IN")}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                type="button"
                onClick={() => setIsOpen(true)}
                className="text-[11px] font-bold text-[#e5a872] hover:text-white uppercase tracking-wider underline cursor-pointer"
              >
                Change
              </button>
              <button
                type="button"
                onClick={() => onSelectPackage(null)}
                className="w-7 h-7 rounded-full bg-white/[0.08] hover:bg-red-500/20 text-neutral-400 hover:text-red-400 flex items-center justify-center transition-colors cursor-pointer"
                title="Remove Gift Box"
              >
                <X size={13} />
              </button>
            </div>
          </div>
        ) : (
          /* Sleek Glowing Trigger Button */
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="w-full relative overflow-hidden flex items-center justify-between p-3.5 rounded-xl bg-gradient-to-r from-[#14120f] via-[#1b1611] to-[#14120f] border border-[#c8874a]/40 hover:border-[#c8874a] shadow-[0_0_20px_rgba(200,135,74,0.15)] hover:shadow-[0_0_25px_rgba(200,135,74,0.3)] transition-all duration-300 cursor-pointer group/btn"
          >
            {/* Animated Golden Ambient Shine Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#c8874a]/10 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none" />

            <div className="flex items-center gap-3 relative z-10">
              <div className="w-8 h-8 rounded-lg bg-[#c8874a]/20 border border-[#c8874a]/40 flex items-center justify-center text-[#c8874a] group-hover/btn:scale-105 group-hover/btn:bg-[#c8874a] group-hover/btn:text-white transition-all shadow-sm">
                <Gift size={16} />
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-white tracking-wide group-hover/btn:text-[#f3c89b] transition-colors">
                    Make it a Luxury Gift?
                  </span>
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#c8874a] animate-pulse" />
                </div>
                <p className="text-[11px] text-neutral-400">
                  Custom luxury boxes from{" "}
                  <span className="text-[#c8874a] font-semibold">
                    {lowestPrice === 0 ? "FREE" : `+₹${lowestPrice}`}
                  </span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 text-[11px] font-bold text-[#c8874a] uppercase tracking-wider group-hover/btn:translate-x-0.5 transition-transform relative z-10">
              <span>Choose Box</span>
              <ChevronRight size={14} />
            </div>
          </button>
        )}
      </div>

      {/* ─── Luxury Selection Modal / Drawer ─── */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-[#101010] border border-white/[0.12] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl shadow-black/80 flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/[0.08] px-6 py-4 bg-[#141414]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-md bg-[#c8874a]/15 border border-[#c8874a]/30 flex items-center justify-center text-[#c8874a]">
                  <Gift size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Select Gift Packaging
                  </h3>
                  <p className="text-[11px] text-neutral-400">
                    Handcrafted presentation boxes for special gifting
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-neutral-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Packaging Options List */}
            <div className="p-5 overflow-y-auto space-y-3.5 divide-y divide-white/[0.04]">
              {/* Option 0: Standard Free Box */}
              <div
                onClick={() => {
                  onSelectPackage(null);
                  setIsOpen(false);
                }}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-4 ${
                  selectedPackage === null
                    ? "bg-[#c8874a]/10 border-[#c8874a] shadow-md shadow-[#c8874a]/10"
                    : "bg-[#161616] border-white/[0.06] hover:border-white/[0.15]"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full border flex items-center justify-center mt-0.5 flex-shrink-0 transition-colors ${
                    selectedPackage === null
                      ? "border-[#c8874a] bg-[#c8874a] text-black"
                      : "border-neutral-500"
                  }`}
                >
                  {selectedPackage === null && <Check size={12} strokeWidth={3} />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-white uppercase tracking-wide">
                      Standard SPECTRA Hardcase
                    </span>
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
                      INCLUDED FREE
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-400 mt-1 leading-relaxed">
                    Signature matte-black hard protective case with embossed logo & microfiber cloth.
                  </p>
                </div>
              </div>

              {/* Dynamic Active Gift Packages */}
              {packages.map((pkg) => {
                const isSelected = selectedPackage?.id === pkg.id;
                return (
                  <div
                    key={pkg.id}
                    onClick={() => {
                      onSelectPackage(pkg);
                      setIsOpen(false);
                    }}
                    className={`pt-3.5 first:pt-0`}
                  >
                    <div
                      className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-4 relative overflow-hidden ${
                        isSelected
                          ? "bg-[#c8874a]/15 border-[#c8874a] shadow-lg shadow-[#c8874a]/15"
                          : "bg-[#161616] border-white/[0.06] hover:border-[#c8874a]/40"
                      }`}
                    >
                      {/* Radio Checkbox */}
                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center mt-0.5 flex-shrink-0 transition-colors ${
                          isSelected
                            ? "border-[#c8874a] bg-[#c8874a] text-black"
                            : "border-neutral-500"
                        }`}
                      >
                        {isSelected && <Check size={12} strokeWidth={3} />}
                      </div>

                      {/* Package Image preview */}
                      <div className="w-14 h-14 rounded-lg bg-[#202020] border border-white/[0.08] flex items-center justify-center flex-shrink-0 overflow-hidden relative">
                        {pkg.image_url ? (
                          <Image
                            src={pkg.image_url}
                            alt={pkg.name}
                            width={56}
                            height={56}
                            className="object-contain p-1 brightness-0 invert"
                          />
                        ) : (
                          <Gift size={24} className="text-[#c8874a]" />
                        )}
                      </div>

                      {/* Package Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-bold text-white tracking-wide">
                            {pkg.name}
                          </span>
                          <span className="text-xs font-black text-[#c8874a]">
                            +₹{pkg.price.toLocaleString("en-IN")}
                          </span>
                        </div>
                        <p className="text-[11px] text-neutral-400 mt-1 leading-relaxed">
                          {pkg.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Modal Footer */}
            <div className="border-t border-white/[0.08] px-6 py-4 bg-[#141414] flex items-center justify-between">
              <div className="flex items-center gap-2 text-[11px] text-neutral-400">
                <ShieldCheck size={14} className="text-[#c8874a]" />
                <span>Individually inspected & packed</span>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-5 py-2.5 bg-[#c8874a] hover:bg-[#b87840] text-white rounded-sm text-xs font-bold uppercase tracking-wider transition-colors shadow-md shadow-[#c8874a]/20 cursor-pointer"
              >
                Confirm Selection
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
