"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/components/CartContext";
import { Plus, Minus, Trash2, ShoppingBag, ArrowRight, ArrowLeft } from "lucide-react";

export default function CartPage() {
  const { items, count, total, removeItem, updateQty, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-6 px-4 text-white">
        <div className="w-24 h-24 rounded-sm bg-white/[0.05] flex items-center justify-center">
          <ShoppingBag size={40} className="text-white/20" />
        </div>
        <div className="text-center">
          <h1 className="text-[24px] font-bold text-white">Your cart is empty</h1>
          <p className="text-[14px] text-white/40 mt-2">Add some SPECTRA sunglasses to get started.</p>
        </div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-[#c8874a] hover:bg-[#b87840] text-white text-[13px] font-bold px-6 py-3.5 rounded-sm transition-colors"
        >
          <ArrowLeft size={15} />
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight">Shopping Cart</h1>
          <p className="text-[13px] text-white/40 mt-1">{count} item{count !== 1 ? "s" : ""}</p>
        </div>
        <button
          onClick={clearCart}
          className="text-[12px] text-white/30 hover:text-red-400 transition-colors flex items-center gap-1.5"
        >
          <Trash2 size={13} />
          Clear cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex gap-5 p-5 bg-white/[0.03] rounded-sm transition-colors"
            >
              {/* Image */}
              <Link href={`/products/${item.slug}`} className="flex-shrink-0">
                <div className="w-24 h-24 rounded-sm bg-[#f5f0eb] overflow-hidden relative">
                  {item.image_url ? (
                    <Image src={item.image_url} alt={item.name} fill className="object-contain p-2" />
                  ) : (
                    <ShoppingBag size={24} className="absolute inset-0 m-auto text-gray-400" />
                  )}
                </div>
              </Link>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link href={`/products/${item.slug}`}>
                      <p className="text-[14px] font-bold text-white hover:text-[#c8874a] transition-colors truncate">
                        {item.name}
                      </p>
                    </Link>
                    <p className="text-[12px] text-white/40 mt-0.5">{item.subtitle}</p>
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-1.5 rounded-sm text-white/20 hover:text-red-400 hover:bg-red-500/10 transition-colors flex-shrink-0"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <div className="flex items-center justify-between mt-4">
                  {/* Qty */}
                  <div className="flex items-center gap-1 bg-white/[0.06] rounded-sm p-1">
                    <button
                      onClick={() => updateQty(item.id, item.quantity - 1)}
                      className="w-7 h-7 rounded-sm flex items-center justify-center text-white/50 hover:text-white hover:bg-white/[0.1] transition-colors"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="w-8 text-center text-[13px] font-bold text-white">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQty(item.id, item.quantity + 1)}
                      className="w-7 h-7 rounded-sm flex items-center justify-center text-white/50 hover:text-white hover:bg-white/[0.1] transition-colors"
                    >
                      <Plus size={12} />
                    </button>
                  </div>

                  {/* Line total */}
                  <p className="text-[16px] font-bold text-[#c8874a]">
                    &#8377;{(item.price * item.quantity).toLocaleString("en-IN")}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {/* Continue shopping */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[12px] text-white/40 hover:text-white transition-colors mt-2"
          >
            <ArrowLeft size={13} />
            Continue Shopping
          </Link>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 bg-white/[0.03] rounded-sm p-6 space-y-5">
            <h2 className="text-[15px] font-bold text-white">Order Summary</h2>

            <div className="space-y-3 text-[13px]">
              <div className="flex justify-between text-white/60">
                <span>Subtotal ({count} items)</span>
                <span>&#8377;{total.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-white/60">
                <span>Shipping</span>
                <span className="text-emerald-400">Free</span>
              </div>
              <div className="h-px bg-white/[0.07]" />
              <div className="flex justify-between font-bold text-white text-[15px]">
                <span>Total</span>
                <span>&#8377;{total.toLocaleString("en-IN")}</span>
              </div>
            </div>

            {/* CTA */}
            <button className="w-full flex items-center justify-center gap-2 bg-[#c8874a] hover:bg-[#b87840] text-white text-[13px] font-bold py-4 rounded-sm transition-colors">
              Proceed to Checkout
              <ArrowRight size={15} />
            </button>

            {/* Trust badges */}
            <div className="flex items-center justify-center gap-4 pt-2">
              {["Free Returns", "Secure Payment", "30-Day Warranty"].map((t) => (
                <span key={t} className="text-[10px] text-white/25 text-center">{t}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
