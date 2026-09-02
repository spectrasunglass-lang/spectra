"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Search,
  Package,
  Clock,
  Truck,
  CheckCircle2,
  XCircle,
  Loader2,
  ArrowRight,
  ShieldCheck,
  ShoppingBag,
  MapPin,
  Calendar,
} from "lucide-react";

interface OrderData {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  product_name: string;
  amount: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  created_at: string;
  city?: string;
  address?: string;
}

const STEPS = [
  { key: "pending", label: "Order Placed", icon: Clock },
  { key: "processing", label: "Processing", icon: Package },
  { key: "shipped", label: "Shipped", icon: Truck },
  { key: "delivered", label: "Delivered", icon: CheckCircle2 },
];

const statusIndexMap: Record<string, number> = {
  pending: 0,
  processing: 1,
  shipped: 2,
  delivered: 3,
};

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const initialId = searchParams.get("id") || "";

  const [orderIdInput, setOrderIdInput] = useState(initialId);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<OrderData | null>(null);

  const handleTrack = async (idToSearch: string) => {
    const cleanId = idToSearch.trim();
    if (!cleanId) {
      setError("Please enter your Order ID.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/orders/track?orderId=${encodeURIComponent(cleanId)}`);
      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || "Order not found. Please verify the ID.");
        setOrder(null);
      } else {
        setOrder(data.order);
      }
    } catch {
      setError("Network error. Please try again.");
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialId) {
      handleTrack(initialId);
    }
  }, [initialId]);

  const currentStepIndex = order ? statusIndexMap[order.status] ?? -1 : -1;
  const isCancelled = order?.status === "cancelled";

  return (
    <div className="bg-[#0a0a0a] min-h-screen text-white pb-20">
      {/* Header Banner */}
      <div className="border-b border-white/[0.08] bg-gradient-to-b from-[#141414] to-[#0a0a0a] py-14 sm:py-16 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#c8874a] mb-2">
            SPECTRA Delivery Tracking
          </p>
          <h1 className="text-2xl sm:text-4xl font-bold text-white tracking-tight uppercase">
            Track Your Order
          </h1>
          <p className="text-neutral-400 text-xs sm:text-sm mt-2 max-w-md mx-auto">
            Enter your order confirmation number to check the real-time fulfillment and shipping status.
          </p>

          {/* Search Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleTrack(orderIdInput);
            }}
            className="mt-8 flex flex-col sm:flex-row gap-2.5 max-w-lg mx-auto"
          >
            <div className="relative flex-1">
              <input
                type="text"
                value={orderIdInput}
                onChange={(e) => setOrderIdInput(e.target.value)}
                placeholder="e.g. 7422BC25 or #7422BC25"
                className="w-full bg-[#141414] border border-white/[0.12] focus:border-[#c8874a] text-white text-xs sm:text-sm px-4 py-3.5 rounded-sm outline-none placeholder:text-neutral-600 transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-[#c8874a] hover:bg-[#b87840] disabled:opacity-60 text-white text-xs font-bold uppercase tracking-wider px-6 py-3.5 rounded-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search size={15} />
                  Track
                </>
              )}
            </button>
          </form>

          {error && (
            <p className="mt-4 text-red-400 text-xs bg-red-500/10 border border-red-500/20 py-2.5 px-4 rounded-sm max-w-lg mx-auto">
              {error}
            </p>
          )}
        </div>
      </div>

      {/* Result Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-10">
        {order ? (
          <div className="bg-[#111111] border border-white/[0.08] rounded-sm overflow-hidden shadow-2xl">
            {/* Card Top Details */}
            <div className="p-6 sm:p-8 border-b border-white/[0.06] flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#c8874a]">
                  Order Number
                </span>
                <p className="text-base sm:text-lg font-mono font-bold text-white mt-0.5">
                  #{String(order.id).slice(-8).toUpperCase()}
                </p>
                <p className="text-[11px] font-mono text-neutral-500 break-all">
                  Ref: {order.id}
                </p>
                <div className="flex items-center gap-4 text-xs text-neutral-400 mt-2">
                  <span className="flex items-center gap-1.5">
                    <Calendar size={13} className="text-neutral-500" />
                    {new Date(order.created_at).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                  {order.city && (
                    <span className="flex items-center gap-1.5">
                      <MapPin size={13} className="text-neutral-500" />
                      {order.city}
                    </span>
                  )}
                </div>
              </div>

              {/* Status Badge */}
              <div className="text-right">
                <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 block mb-1">
                  Status
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    isCancelled
                      ? "bg-red-500/15 text-red-400 border border-red-500/30"
                      : order.status === "delivered"
                      ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                      : "bg-[#c8874a]/15 text-[#e5a872] border border-[#c8874a]/30"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isCancelled
                        ? "bg-red-400"
                        : order.status === "delivered"
                        ? "bg-emerald-400"
                        : "bg-[#c8874a]"
                    }`}
                  />
                  {order.status}
                </span>
              </div>
            </div>

            {/* Stepper Progress */}
            {isCancelled ? (
              <div className="p-6 sm:p-8 border-b border-white/[0.06] bg-red-500/[0.03] flex items-center gap-3 text-red-400">
                <XCircle size={20} />
                <div>
                  <p className="text-sm font-semibold">Order Cancelled</p>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    This order has been cancelled. For refunds or inquiries, please contact our concierge.
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-6 sm:p-8 border-b border-white/[0.06] bg-white/[0.01]">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-2">
                  {STEPS.map((step, idx) => {
                    const StepIcon = step.icon;
                    const isCompleted = currentStepIndex >= idx;
                    const isCurrent = currentStepIndex === idx;

                    return (
                      <div key={step.key} className="flex flex-col items-center text-center relative">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                            isCompleted
                              ? "bg-[#c8874a] text-white shadow-lg shadow-[#c8874a]/20"
                              : "bg-[#1a1a1a] text-neutral-500 border border-white/[0.08]"
                          } ${isCurrent ? "ring-2 ring-[#c8874a] ring-offset-2 ring-offset-[#111]" : ""}`}
                        >
                          <StepIcon size={17} />
                        </div>
                        <p
                          className={`mt-2.5 text-xs font-semibold tracking-wide ${
                            isCompleted ? "text-white" : "text-neutral-500"
                          }`}
                        >
                          {step.label}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Product & Summary Grid */}
            <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Product Details */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-400 flex items-center gap-2">
                  <ShoppingBag size={14} className="text-[#c8874a]" />
                  Ordered Items
                </h3>
                <div className="bg-[#161616] p-4 rounded-sm border border-white/[0.04] space-y-2">
                  <p className="text-sm text-neutral-200 font-medium">
                    {order.product_name || "SPECTRA Luxury Eyewear"}
                  </p>
                  <p className="text-xs text-neutral-400">
                    Recipient: <span className="text-white font-medium">{order.customer_name}</span>
                  </p>
                </div>
              </div>

              {/* Payment & Delivery Summary */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-400 flex items-center gap-2">
                  <ShieldCheck size={14} className="text-[#c8874a]" />
                  Summary & Payment
                </h3>
                <div className="bg-[#161616] p-4 rounded-sm border border-white/[0.04] space-y-2 text-xs">
                  <div className="flex justify-between text-neutral-300">
                    <span>Total Amount</span>
                    <span className="text-sm font-bold text-[#c8874a]">
                      ₹{order.amount ? order.amount.toLocaleString("en-IN") : "0"}
                    </span>
                  </div>
                  {order.address && (
                    <div className="pt-2 border-t border-white/[0.06] text-neutral-400">
                      <span className="block text-[11px] text-neutral-500 mb-0.5">Shipping Destination:</span>
                      <span className="text-neutral-300 line-clamp-2">{order.address}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          !loading && (
            <div className="border border-white/[0.06] rounded-sm p-10 text-center bg-[#111111]/40">
              <Package className="w-12 h-12 text-neutral-600 mx-auto stroke-[1.2]" />
              <h2 className="text-base font-semibold text-neutral-300 mt-4">No order selected</h2>
              <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
                Please enter your Order ID above to check real-time status and delivery updates.
              </p>
              <div className="mt-6 flex justify-center">
                <Link
                  href="/sunglasses"
                  className="inline-flex items-center gap-2 text-xs font-bold text-[#c8874a] hover:text-[#e5a872] uppercase tracking-wider transition-colors"
                >
                  Continue Shopping <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-[#0a0a0a] min-h-screen flex items-center justify-center text-white">
          <Loader2 className="w-6 h-6 animate-spin text-[#c8874a]" />
        </div>
      }
    >
      <TrackOrderContent />
    </Suspense>
  );
}
