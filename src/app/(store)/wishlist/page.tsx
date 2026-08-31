import React from "react";
import Link from "next/link";
import { Heart, ShoppingBag, ArrowRight } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Your Wishlist — SPECTRA",
  description: "Saved luxury sunglasses and wishlist items.",
};

export default function WishlistPage() {
  return (
    <div className="bg-[#0a0a0a] min-h-screen">
      <div className="relative border-b border-white/[0.08] bg-gradient-to-b from-[#141414] to-[#0a0a0a] py-16 sm:py-20 text-center">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
          <p className="text-[10.5px] font-bold tracking-[0.3em] uppercase text-[#c8874a] mb-2 flex items-center justify-center gap-1.5">
            <Heart size={14} />
            Personal Collection
          </p>
          <h1 className="font-stencil text-3xl sm:text-5xl text-white tracking-[0.1em] uppercase">
            Your Wishlist
          </h1>
          <p className="text-neutral-400 text-[13px] sm:text-[14px] mt-3 max-w-md mx-auto">
            Save and curate your favorite SPECTRA silhouettes in one place.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-[#141414] border border-white/[0.08] flex items-center justify-center text-neutral-500 mx-auto mb-4">
          <Heart size={28} />
        </div>
        <h3 className="text-white font-bold text-[18px]">Your wishlist is currently empty</h3>
        <p className="text-neutral-500 text-[13px] mt-1.5 mb-8 max-w-sm mx-auto">
          Explore our handcrafted sunglasses and tap the heart icon on any frame to save it here.
        </p>
        <Link
          href="/sunglasses"
          className="inline-flex items-center gap-2 bg-[#c8874a] hover:bg-[#b87840] text-white px-7 py-3.5 rounded-xl text-[12px] font-bold uppercase tracking-[0.18em] transition-all shadow-xl shadow-[#c8874a]/25"
        >
          Discover Sunglasses
          <ArrowRight size={15} />
        </Link>
      </div>
    </div>
  );
}
