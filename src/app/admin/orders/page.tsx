"use client";

import React, { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Search, Filter, ShoppingBag, Loader2, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";
import StatusBadge from "@/components/admin/StatusBadge";

type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled";

interface Order {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  product_name: string;
  amount: number;
  status: OrderStatus;
  created_at: string;
  city?: string;
  address?: string;
}

const statusOptions: { value: OrderStatus | "all"; label: string }[] = [
  { value: "all", label: "All Orders" },
  { value: "pending", label: "Pending" },
  { value: "processing", label: "Processing" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

const nextStatuses: Record<OrderStatus, OrderStatus[]> = {
  pending: ["processing", "cancelled"],
  processing: ["shipped", "cancelled"],
  shipped: ["delivered"],
  delivered: [],
  cancelled: [],
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [expanded, setExpanded] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setOrders(data as Order[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchOrders();
    const supabase = createClient();
    const channel = supabase
      .channel("orders-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => fetchOrders())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchOrders]);

  const updateStatus = async (orderId: string, newStatus: OrderStatus) => {
    setUpdatingId(orderId);
    const supabase = createClient();
    await supabase.from("orders").update({ status: newStatus }).eq("id", orderId);
    setUpdatingId(null);
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
  };

  const filtered = orders.filter((o) => {
    const matchSearch = !search ||
      (o.customer_name ?? "").toLowerCase().includes(search.toLowerCase()) ||
      String(o.id).toLowerCase().includes(search.toLowerCase()) ||
      (o.customer_email ?? "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const countByStatus = (s: OrderStatus) => orders.filter((o) => o.status === s).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-bold text-white tracking-tight">Orders</h1>
          <p className="text-[13px] text-white/40 mt-0.5">
            {loading ? "Loading..." : `${orders.length} total orders`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Status quick pills */}
          <div className="hidden sm:flex items-center gap-2">
            {(["pending", "processing", "shipped"] as OrderStatus[]).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-full text-[11px] font-bold capitalize border transition-colors ${
                  statusFilter === s
                    ? "border-[#c8874a] bg-[#c8874a]/15 text-[#c8874a]"
                    : "border-white/[0.08] text-white/50 hover:border-white/[0.2] hover:text-white"
                }`}
              >
                {countByStatus(s)} {s}
              </button>
            ))}
          </div>
          <button
            onClick={fetchOrders}
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-white/[0.08] bg-[#161616] hover:bg-[#202020] text-white/60 hover:text-white transition-colors"
            title="Refresh"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-[#111111] rounded-2xl border border-white/[0.07] px-5 py-4 shadow-xl shadow-black/40">
        <div className="flex items-center gap-2 bg-[#161616] border border-white/[0.08] rounded-xl px-3.5 py-2.5 w-full sm:w-80 focus-within:border-[#c8874a] focus-within:bg-[#1a1a1a] transition-all">
          <Search size={14} className="text-white/40 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search by name, email or order ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="text-[13px] bg-transparent outline-none text-white placeholder-white/30 w-full"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-white/40" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as OrderStatus | "all")}
            className="text-[12px] font-semibold text-white bg-[#161616] border border-white/[0.08] rounded-xl px-3 py-2.5 outline-none focus:border-[#c8874a] transition-colors cursor-pointer"
          >
            {statusOptions.map((o) => (
              <option key={o.value} value={o.value} className="bg-[#181818] text-white">
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-[#111111] rounded-2xl border border-white/[0.07] overflow-hidden shadow-xl shadow-black/40">
        {loading ? (
          <div className="flex items-center justify-center py-20 gap-3">
            <Loader2 size={20} className="animate-spin text-[#c8874a]" />
            <p className="text-[13px] text-white/40">Loading orders...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#161616] border border-white/[0.06] flex items-center justify-center">
              <ShoppingBag size={28} className="text-white/20" />
            </div>
            <div className="text-center">
              <p className="text-[15px] font-bold text-white">
                {search || statusFilter !== "all" ? "No orders match your filter" : "No orders yet"}
              </p>
              <p className="text-[13px] text-white/40 mt-1">
                Orders will appear here when customers place them.
              </p>
            </div>
          </div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/[0.06] bg-[#0d0d0d]">
                {["", "Order ID", "Customer", "Product", "Amount", "Date", "Status"].map((h) => (
                  <th key={h} className="px-5 py-3.5 text-[10px] font-bold text-white/30 uppercase tracking-widest">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {filtered.map((order) => (
                <React.Fragment key={order.id}>
                  <tr
                    className={`hover:bg-white/[0.02] transition-colors cursor-pointer ${expanded === order.id ? "bg-white/[0.03]" : ""}`}
                    onClick={() => setExpanded(expanded === order.id ? null : order.id)}
                  >
                    <td className="px-4 py-4 w-8">
                      {expanded === order.id
                        ? <ChevronUp size={14} className="text-white/50" />
                        : <ChevronDown size={14} className="text-white/20" />
                      }
                    </td>
                    <td className="px-5 py-4 text-[11px] font-bold text-[#c8874a]">
                      #{String(order.id).slice(-8).toUpperCase()}
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-[12px] font-semibold text-white">{order.customer_name}</p>
                      <p className="text-[11px] text-white/40">{order.customer_email}</p>
                    </td>
                    <td className="px-5 py-4 text-[12px] text-white/70 max-w-[160px] truncate">{order.product_name}</td>
                    <td className="px-5 py-4 text-[13px] font-bold text-white">₹{(order.amount ?? 0).toLocaleString("en-IN")}</td>
                    <td className="px-5 py-4 text-[12px] text-white/40">
                      {new Date(order.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={order.status} />
                    </td>
                  </tr>

                  {/* Expanded Detail Row */}
                  {expanded === order.id && (
                    <tr>
                      <td colSpan={7} className="px-6 py-5 bg-[#0e0e0e] border-b border-white/[0.06]">
                        <div className="flex flex-wrap items-start gap-8">
                          <div className="min-w-[160px]">
                            <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest mb-1.5">Shipping To</p>
                            <p className="text-[13px] font-bold text-white">{order.customer_name}</p>
                            {order.customer_phone && <p className="text-[12px] text-white/50">{order.customer_phone}</p>}
                            {order.city && <p className="text-[12px] text-white/50">{order.city}</p>}
                            {order.address && <p className="text-[11px] text-white/40 mt-1 max-w-[200px]">{order.address}</p>}
                          </div>
                          <div>
                            <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest mb-1.5">Order Total</p>
                            <p className="text-[22px] font-bold text-[#c8874a]">₹{(order.amount ?? 0).toLocaleString("en-IN")}</p>
                          </div>
                          <div className="ml-auto">
                            <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest mb-2.5">Update Status</p>
                            <div className="flex gap-2 flex-wrap">
                              {(nextStatuses[order.status] ?? []).map((s) => (
                                <button
                                  key={s}
                                  onClick={(e) => { e.stopPropagation(); updateStatus(order.id, s); }}
                                  disabled={updatingId === order.id}
                                  className="px-3.5 py-2 text-[11px] font-bold capitalize rounded-xl border border-[#c8874a]/40 text-[#c8874a] hover:bg-[#c8874a] hover:text-white hover:border-[#c8874a] transition-all flex items-center gap-1.5 disabled:opacity-50"
                                >
                                  {updatingId === order.id && <Loader2 size={11} className="animate-spin" />}
                                  Mark as {s}
                                </button>
                              ))}
                              {nextStatuses[order.status].length === 0 && (
                                <span className="text-[12px] text-white/30 italic">No further actions</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
