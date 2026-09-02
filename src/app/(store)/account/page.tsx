"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  User,
  Package,
  ShoppingBag,
  Heart,
  LogOut,
  ChevronRight,
  Loader2,
  Clock,
  ShieldCheck,
  Truck,
  Sparkles,
  ExternalLink,
} from "lucide-react";

interface Order {
  id: string;
  customer_name: string;
  customer_email: string;
  product_name: string;
  amount: number;
  status: string;
  created_at: string;
}

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ id: string; email?: string; full_name?: string } | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  const loadUserData = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();

    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    if (!authUser) {
      router.push("/login");
      return;
    }

    setUser({
      id: authUser.id,
      email: authUser.email,
      full_name: authUser.user_metadata?.full_name || authUser.email?.split("@")[0],
    });

    if (authUser.email) {
      // Fetch orders matching customer email
      const { data: orderData } = await supabase
        .from("orders")
        .select("*")
        .ilike("customer_email", authUser.email)
        .order("created_at", { ascending: false });

      if (orderData) {
        setOrders(orderData as Order[]);
      }
    }

    setLoading(false);
  }, [router]);

  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  const handleLogout = async () => {
    setLoggingOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  if (loading) {
    return (
      <div className="bg-[#0a0a0a] min-h-[75vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={24} className="animate-spin text-[#c8874a]" />
          <p className="text-[12px] text-neutral-400 uppercase tracking-widest">
            Loading Client Profile...
          </p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="bg-[#0a0a0a] min-h-screen text-white pb-20">
      {/* Profile Banner */}
      <div className="border-b border-white/[0.08] bg-gradient-to-b from-[#141414] to-[#0a0a0a] py-12 sm:py-16">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4 sm:gap-5">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#181818] border border-[#c8874a]/30 flex items-center justify-center text-[#c8874a] shadow-xl shadow-black/60 flex-shrink-0">
                <User size={26} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-white">
                    {user.full_name}
                  </h1>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#c8874a]/15 border border-[#c8874a]/30 text-[#c8874a] text-[10px] font-bold uppercase tracking-wider">
                    VIP Member
                  </span>
                </div>
                <p className="text-neutral-400 text-[12.5px] mt-0.5">{user.email}</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2 rounded-sm bg-[#161616] hover:bg-red-500/10 text-neutral-400 hover:text-red-400 border border-white/[0.08] text-[11.5px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
            >
              {loggingOut ? <Loader2 size={13} className="animate-spin" /> : <LogOut size={13} />}
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Main Account Content */}
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left 2 Columns: Order History */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
              <div>
                <h2 className="text-[16px] font-bold uppercase tracking-tight text-white">
                  Order History
                </h2>
                <p className="text-[12px] text-neutral-400 mt-0.5">
                  Track and review your recent acquisitions
                </p>
              </div>
              <span className="text-[11.5px] font-bold text-neutral-500">
                {orders.length} {orders.length === 1 ? "Order" : "Orders"}
              </span>
            </div>

            {orders.length > 0 ? (
              <div className="space-y-3.5">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="p-5 rounded-sm bg-[#111111] border border-white/[0.07] hover:border-white/[0.14] transition-all space-y-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.05] pb-3">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                          Order Number
                        </p>
                        <p className="text-[12.5px] font-bold text-[#c8874a]">
                          #{String(order.id).slice(-8).toUpperCase()}
                        </p>
                      </div>

                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                          Placed On
                        </p>
                        <p className="text-[12px] text-neutral-300">
                          {new Date(order.created_at).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      </div>

                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                          Status
                        </p>
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            order.status === "delivered"
                              ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                              : order.status === "shipped"
                              ? "bg-blue-500/15 text-blue-400 border border-blue-500/30"
                              : order.status === "processing"
                              ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                              : "bg-neutral-800 text-neutral-400 border border-white/[0.08]"
                          }`}
                        >
                          {order.status}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-sm bg-[#181818] border border-white/[0.06] flex items-center justify-center text-neutral-400">
                          <Package size={18} />
                        </div>
                        <div>
                          <p className="text-[13px] font-bold text-white line-clamp-1">
                            {order.product_name}
                          </p>
                          <p className="text-[11.5px] text-[#c8874a] font-semibold mt-0.5">
                            ₹{Number(order.amount).toLocaleString("en-IN")}
                          </p>
                        </div>
                      </div>

                      <Link
                        href={`/track-order?orderId=${order.id}`}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-sm bg-[#181818] hover:bg-[#222222] border border-white/[0.08] text-[11px] font-bold uppercase tracking-wider text-neutral-300 hover:text-white transition-colors"
                      >
                        <Truck size={12} />
                        Track Package
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-10 rounded-sm bg-[#111111] border border-white/[0.07] text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-[#181818] border border-white/[0.08] flex items-center justify-center text-neutral-500 mx-auto">
                  <ShoppingBag size={20} />
                </div>
                <div>
                  <h3 className="text-white font-bold text-[14px]">No orders recorded yet</h3>
                  <p className="text-neutral-500 text-[12px] mt-1">
                    Your acquisitions and orders will appear here automatically.
                  </p>
                </div>
                <Link
                  href="/collections"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-sm bg-[#c8874a] hover:bg-[#b87840] text-white text-[11.5px] font-bold uppercase tracking-wider transition-colors shadow-md shadow-[#c8874a]/20"
                >
                  Explore Collections &rarr;
                </Link>
              </div>
            )}
          </div>

          {/* Right Column: Quick Links & Concierge */}
          <div className="space-y-6">
            <div className="bg-[#111111] border border-white/[0.07] rounded-sm p-6 space-y-4">
              <h3 className="text-[13px] font-bold uppercase tracking-wider text-[#c8874a]">
                Client Concierge
              </h3>
              <p className="text-[12.5px] text-neutral-400 leading-relaxed">
                As a registered client, you enjoy prioritized delivery routing, complimentary eyewear adjustments, and private preview access.
              </p>

              <div className="pt-2 space-y-2">
                <Link
                  href="/wishlist"
                  className="flex items-center justify-between p-3 rounded-sm bg-[#161616] hover:bg-[#1f1f1f] text-neutral-300 hover:text-white transition-colors text-[12px] font-semibold"
                >
                  <span className="flex items-center gap-2">
                    <Heart size={14} className="text-[#c8874a]" />
                    My Saved Wishlist
                  </span>
                  <ChevronRight size={14} className="text-neutral-500" />
                </Link>

                <Link
                  href="/track-order"
                  className="flex items-center justify-between p-3 rounded-sm bg-[#161616] hover:bg-[#1f1f1f] text-neutral-300 hover:text-white transition-colors text-[12px] font-semibold"
                >
                  <span className="flex items-center gap-2">
                    <Truck size={14} className="text-[#c8874a]" />
                    Live Courier Tracking
                  </span>
                  <ChevronRight size={14} className="text-neutral-500" />
                </Link>

                <Link
                  href="/contact"
                  className="flex items-center justify-between p-3 rounded-sm bg-[#161616] hover:bg-[#1f1f1f] text-neutral-300 hover:text-white transition-colors text-[12px] font-semibold"
                >
                  <span className="flex items-center gap-2">
                    <ShieldCheck size={14} className="text-[#c8874a]" />
                    Contact Client Advisor
                  </span>
                  <ChevronRight size={14} className="text-neutral-500" />
                </Link>
              </div>
            </div>

            <div className="p-6 rounded-sm bg-gradient-to-b from-[#181410] to-[#111111] border border-[#c8874a]/20 space-y-3 text-center">
              <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-[#c8874a]">
                Complimentary Service
              </p>
              <h4 className="text-[14px] font-bold text-white uppercase">
                Bespoke Sizing & Styling
              </h4>
              <p className="text-[12px] text-neutral-400">
                Need guidance selecting the optimal frame geometry for your face shape?
              </p>
              <a
                href="https://wa.me/c/918129950341"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-[11.5px] font-bold text-[#25D366] hover:underline pt-1"
              >
                Chat on WhatsApp Concierge &rarr;
              </a>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
