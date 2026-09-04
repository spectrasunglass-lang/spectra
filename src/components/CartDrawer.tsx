"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { X, Plus, Minus, Bookmark, Trash2, ArrowRight, Gift } from "lucide-react";
import { useCart } from "./CartContext";

export default function CartDrawer() {
  const { items, count, total, isOpen, closeCart, removeItem, updateQty } = useCart();

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
        }`}
        onClick={closeCart}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 bottom-0 z-50 w-full max-w-[400px] bg-[#0f0f0f] flex flex-col shadow-2xl transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.07]">
          <div className="flex items-center gap-3">
            <Bookmark size={18} className="text-[#c8874a]" />
            <span className="text-[14px] font-bold text-white tracking-wide uppercase">
              Saved List
            </span>
            {count > 0 && (
              <span className="w-5 h-5 rounded-full bg-[#c8874a] text-white text-[10px] font-bold flex items-center justify-center">
                {count}
              </span>
            )}
          </div>
          <button
            onClick={closeCart}
            className="w-8 h-8 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] flex items-center justify-center text-white/60 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto py-4 px-6">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-5 text-center">
              <div className="w-20 h-20 rounded-2xl bg-white/[0.05] flex items-center justify-center">
                <Bookmark size={32} className="text-white/20" />
              </div>
              <div>
                <p className="text-[15px] font-bold text-white/60">Your list is empty</p>
                <p className="text-[13px] text-white/30 mt-1">
                  Save some sunglasses to get started
                </p>
              </div>
              <button
                onClick={closeCart}
                className="btn-gold mt-2"
              >
                Explore Collection
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={`${item.id}-${item.gift_package?.id || "std"}`}
                  className="flex gap-4 p-4 rounded-2xl bg-white/[0.04] border border-white/[0.06] hover:border-white/[0.1] transition-colors group"
                >
                  {/* Product image */}
                  <Link href={`/products/${item.slug}`} onClick={closeCart}>
                    <div className="w-20 h-20 rounded-xl bg-[#f5f0eb] flex-shrink-0 overflow-hidden relative">
                      {item.image_url ? (
                        <Image
                          src={item.image_url}
                          alt={item.name}
                          fill
                          className="object-contain p-2"
                        />
                      ) : (
                        <Bookmark size={20} className="absolute inset-0 m-auto text-gray-400" />
                      )}
                    </div>
                  </Link>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <Link href={`/products/${item.slug}`} onClick={closeCart}>
                      <p className="text-[13px] font-bold text-white leading-tight hover:text-[#c8874a] transition-colors">
                        {item.name}
                      </p>
                      <p className="text-[11px] text-white/40 mt-0.5">{item.subtitle}</p>
                    </Link>

                    {/* Gift Package Indicator */}
                    {item.gift_package && (
                      <div className="inline-flex items-center gap-1.5 mt-1 px-2 py-0.5 rounded-md bg-[#c8874a]/15 border border-[#c8874a]/30 text-[#e5a872] text-[10px] font-bold">
                        <Gift size={10} className="text-[#c8874a] flex-shrink-0" />
                        <span className="truncate">{item.gift_package.name} (+₹{item.gift_package.price})</span>
                      </div>
                    )}

                    <p className="text-[14px] font-bold text-[#c8874a] mt-2">
                      ₹{((Number(item.price) + (item.gift_package ? Number(item.gift_package.price) : 0)) * item.quantity).toLocaleString("en-IN")}
                    </p>

                    {/* Qty + Remove */}
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-1 bg-white/[0.06] rounded-lg p-1">
                        <button
                          onClick={() => updateQty(item.id, item.quantity - 1, item.gift_package?.id)}
                          className="w-6 h-6 rounded-md flex items-center justify-center text-white/60 hover:text-white hover:bg-white/[0.1] transition-colors"
                        >
                          <Minus size={11} />
                        </button>
                        <span className="w-7 text-center text-[12px] font-bold text-white">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQty(item.id, item.quantity + 1, item.gift_package?.id)}
                          className="w-6 h-6 rounded-md flex items-center justify-center text-white/60 hover:text-white hover:bg-white/[0.1] transition-colors"
                        >
                          <Plus size={11} />
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(item.id, item.gift_package?.id)}
                        className="p-1.5 rounded-lg text-white/20 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="px-6 py-5 border-t border-white/[0.07] space-y-4">
            {/* Subtotal */}
            <div className="flex items-center justify-between">
              <span className="text-[13px] text-white/50">Subtotal ({count} items)</span>
              <span className="text-[16px] font-bold text-white">
                ₹{total.toLocaleString("en-IN")}
              </span>
            </div>
            <p className="text-[11px] text-white/30 -mt-2">
              Shipping calculated at checkout
            </p>

            {/* Checkout CTA */}
            <Link
              href="/cart"
              onClick={closeCart}
              className="btn-gold w-full justify-center text-[13px] py-3.5 rounded-sm"
            >
              Proceed to Checkout
              <ArrowRight size={15} />
            </Link>
            <button
              onClick={closeCart}
              className="btn-outline-white w-full justify-center text-[12px] py-3 rounded-sm"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </>
  );
}
