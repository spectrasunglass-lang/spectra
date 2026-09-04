"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Bookmark, ArrowRight, Trash2, ShoppingBag } from "lucide-react";
import { useCart } from "@/components/CartContext";

export default function WishlistPage() {
  const { items, count, total, removeItem, openCart } = useCart();

  return (
    <div className="bg-[#0a0a0a] min-h-screen">
      <div className="relative border-b border-white/[0.08] bg-gradient-to-b from-[#141414] to-[#0a0a0a] py-14 sm:py-16 text-center">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
          <p className="text-[10.5px] font-bold tracking-[0.3em] uppercase text-[#c8874a] mb-2 flex items-center justify-center gap-1.5">
            <Bookmark size={14} />
            Personal Collection
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight uppercase">
            Saved List
          </h1>
          <p className="text-neutral-400 text-[13px] sm:text-[14px] mt-2 max-w-md mx-auto">
            {count > 0
              ? `${count} handcrafted SPECTRA silhouette${count > 1 ? "s" : ""} saved for your consideration.`
              : "Save and curate your favorite SPECTRA silhouettes in one place."}
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-5 sm:px-8 py-12">
        {items.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#141414] border border-white/[0.08] flex items-center justify-center text-neutral-500 mx-auto mb-4">
              <Bookmark size={28} />
            </div>
            <h3 className="text-white font-bold text-[18px]">Your saved list is empty</h3>
            <p className="text-neutral-500 text-[13px] mt-1.5 mb-8 max-w-sm mx-auto">
              Explore our handcrafted sunglasses and tap &ldquo;Save to List&rdquo; on any frame to curate your collection here.
            </p>
            <Link
              href="/sunglasses"
              className="inline-flex items-center gap-2 bg-[#c8874a] hover:bg-[#b87840] text-white px-7 py-3.5 rounded-sm text-[11.5px] font-bold uppercase tracking-[0.18em] transition-all shadow-xl shadow-[#c8874a]/20"
            >
              Discover Sunglasses
              <ArrowRight size={15} />
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="divide-y divide-white/[0.08] border border-white/[0.08] rounded-sm bg-[#121212]/70 overflow-hidden">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 sm:gap-6 p-4 sm:p-5 hover:bg-white/[0.02] transition-colors"
                >
                  <Link
                    href={`/products/${item.slug}`}
                    className="relative w-20 h-20 sm:w-24 sm:h-24 bg-white rounded-sm overflow-hidden flex-shrink-0 flex items-center justify-center p-2"
                  >
                    {item.image_url ? (
                      <Image
                        src={item.image_url}
                        alt={item.name}
                        fill
                        className="object-contain p-1"
                      />
                    ) : (
                      <ShoppingBag size={24} className="text-neutral-400" />
                    )}
                  </Link>

                  <div className="flex-1 min-w-0">
                    {item.subtitle && (
                      <p className="text-[10px] uppercase font-bold text-[#c8874a] tracking-wider mb-0.5">
                        {item.subtitle}
                      </p>
                    )}
                    <Link
                      href={`/products/${item.slug}`}
                      className="text-[14px] sm:text-[15px] font-bold text-white hover:text-[#c8874a] transition-colors line-clamp-1"
                    >
                      {item.name}
                    </Link>
                    <p className="text-[14px] font-bold text-white mt-1">
                      &#8377;{item.price.toLocaleString("en-IN")}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 sm:gap-3">
                    <button
                      onClick={() => openCart()}
                      className="px-3.5 py-2 bg-[#c8874a] hover:bg-[#b87840] text-white text-[11px] font-bold uppercase tracking-wider rounded-sm transition-colors cursor-pointer"
                    >
                      Order
                    </button>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-2 text-neutral-500 hover:text-red-400 transition-colors cursor-pointer"
                      title="Remove from saved list"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-white/[0.08]">
              <div>
                <p className="text-[11px] uppercase tracking-wider text-neutral-400">Total Saved Value</p>
                <p className="text-2xl font-black text-white">&#8377;{total.toLocaleString("en-IN")}</p>
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <Link
                  href="/sunglasses"
                  className="flex-1 sm:flex-initial text-center px-5 py-3 border border-white/10 hover:border-white/30 text-white text-[11.5px] font-bold uppercase tracking-wider rounded-sm transition-colors"
                >
                  Continue Browsing
                </Link>
                <Link
                  href="/cart"
                  className="flex-1 sm:flex-initial text-center px-6 py-3 bg-[#c8874a] hover:bg-[#b87840] text-white text-[11.5px] font-bold uppercase tracking-wider rounded-sm transition-colors shadow-lg shadow-[#c8874a]/20"
                >
                  Proceed to Checkout
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
