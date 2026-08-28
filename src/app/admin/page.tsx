import React from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import StatsCard from "@/components/admin/StatsCard";
import StatusBadge from "@/components/admin/StatusBadge";
import {
  IndianRupee,
  ShoppingBag,
  Package,
  Users,
  ArrowRight,
  Plus,
  Eye,
  TrendingUp,
} from "lucide-react";

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmt(n: number) {
  return "₹" + n.toLocaleString("en-IN");
}

export default async function AdminDashboard() {
  const supabase = await createClient();

  // Fetch all stats in parallel
  const [
    { count: totalProducts },
    { data: ordersData },
    { data: recentOrders },
    { data: topProducts },
    { data: chartData },
  ] = await Promise.all([
    supabase.from("products").select("*", { count: "exact", head: true }),
    supabase.from("orders").select("amount, status, created_at"),
    supabase
      .from("orders")
      .select("id, customer_name, customer_email, product_name, amount, status, created_at")
      .order("created_at", { ascending: false })
      .limit(8),
    supabase
      .from("order_items")
      .select("product_id, quantity, products(name, image_url)")
      .limit(5),
    supabase
      .from("orders")
      .select("amount, created_at")
      .gte(
        "created_at",
        new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      )
      .order("created_at", { ascending: true }),
  ]);

  const allOrders = ordersData ?? [];
  const totalRevenue = allOrders
    .filter((o) => o.status === "delivered")
    .reduce((s, o) => s + (o.amount ?? 0), 0);

  const todayStr = new Date().toDateString();
  const ordersToday = allOrders.filter(
    (o) => new Date(o.created_at).toDateString() === todayStr
  ).length;

  // 7-day revenue chart bucketed by day label
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const weekRevenue = Array(7).fill(0) as number[];
  (chartData ?? []).forEach((o) => {
    const d = new Date(o.created_at).getDay();
    weekRevenue[d] += o.amount ?? 0;
  });
  const maxRev = Math.max(...weekRevenue, 1);
  // Rotate so today is last
  const todayIdx = new Date().getDay();
  const rotatedRevenue = [
    ...weekRevenue.slice(todayIdx + 1),
    ...weekRevenue.slice(0, todayIdx + 1),
  ];
  const rotatedDays = [
    ...days.slice(todayIdx + 1),
    ...days.slice(0, todayIdx + 1),
  ];

  const stats = [
    { label: "Total Revenue", value: fmt(totalRevenue), icon: <IndianRupee size={18} />, variant: "dark" as const },
    { label: "Orders Today", value: String(ordersToday), icon: <ShoppingBag size={18} />, variant: "gold" as const },
    { label: "Total Products", value: String(totalProducts ?? 0), icon: <Package size={18} />, variant: "charcoal" as const },
    { label: "Customers", value: String(new Set(allOrders.map((o) => o.customer_email ?? "")).size), icon: <Users size={18} />, variant: "carbon" as const },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-bold text-white tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-[13px] text-white/40 mt-0.5">
            Real-time store metrics and management
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 bg-[#c8874a] hover:bg-[#b87840] text-white text-[12px] font-bold px-4 py-2.5 rounded-xl transition-all duration-200 shadow-lg shadow-[#c8874a]/20"
        >
          <Plus size={14} />
          Add Product
        </Link>
      </div>

      {/* Stats Cards in Pure Luxury Black */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <StatsCard key={s.label} label={s.label} value={s.value} icon={s.icon} variant={s.variant} />
        ))}
      </div>

      {/* Chart + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-[#111111] rounded-2xl border border-white/[0.07] p-6 shadow-xl shadow-black/40">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-[15px] font-bold text-white">Revenue Overview</h2>
              <p className="text-[12px] text-white/40 mt-0.5">Last 7 days revenue performance</p>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#c8874a] bg-[#c8874a]/10 border border-[#c8874a]/20 px-2.5 py-1.5 rounded-full">
              <TrendingUp size={11} />
              Live data
            </div>
          </div>
          <div className="flex items-end gap-3 h-36">
            {rotatedRevenue.map((val, i) => {
              const pct = (val / maxRev) * 100;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full flex flex-col justify-end" style={{ height: "112px" }}>
                    <div
                      title={fmt(val)}
                      className="w-full rounded-t-lg bg-gradient-to-t from-[#8c5626] to-[#c8874a] opacity-80 hover:opacity-100 transition-opacity cursor-pointer shadow-sm shadow-[#c8874a]/20"
                      style={{ height: `${Math.max(pct, 6)}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-white/40 font-medium">{rotatedDays[i]}</span>
                </div>
              );
            })}
          </div>
          {totalRevenue === 0 && (
            <p className="text-center text-[12px] text-white/30 mt-4">
              No revenue recorded yet — orders will appear here automatically.
            </p>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-[#111111] rounded-2xl border border-white/[0.07] p-6 flex flex-col gap-3 shadow-xl shadow-black/40">
          <h2 className="text-[15px] font-bold text-white mb-2">Quick Actions</h2>
          {[
            { label: "Add New Product", href: "/admin/products/new", icon: <Package size={15} />, desc: "Create product listing" },
            { label: "View Orders", href: "/admin/orders", icon: <ShoppingBag size={15} />, desc: "Track customer orders" },
            { label: "Upload Media", href: "/admin/media", icon: <Eye size={15} />, desc: "Hero banners & brand imagery" },
          ].map((a) => (
            <Link
              key={a.href}
              href={a.href}
              className="flex items-center gap-3 p-3.5 rounded-xl border border-white/[0.06] bg-[#161616] hover:border-[#c8874a]/40 hover:bg-[#1a1a1a] transition-all group"
            >
              <div className="w-9 h-9 rounded-xl bg-[#222222] text-[#c8874a] flex items-center justify-center flex-shrink-0 group-hover:bg-[#c8874a] group-hover:text-white transition-colors">
                {a.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-bold text-white group-hover:text-[#c8874a] transition-colors">{a.label}</p>
                <p className="text-[11px] text-white/40">{a.desc}</p>
              </div>
              <ArrowRight size={14} className="text-white/20 group-hover:text-[#c8874a] transition-colors" />
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Orders + Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-3 bg-[#111111] rounded-2xl border border-white/[0.07] overflow-hidden shadow-xl shadow-black/40">
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
            <h2 className="text-[15px] font-bold text-white">Recent Orders</h2>
            <Link href="/admin/orders" className="text-[11px] font-bold text-[#c8874a] hover:underline flex items-center gap-1">
              View all <ArrowRight size={11} />
            </Link>
          </div>
          {!recentOrders || recentOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#161616] border border-white/[0.06] flex items-center justify-center">
                <ShoppingBag size={20} className="text-white/30" />
              </div>
              <p className="text-[13px] font-semibold text-white/40">No orders yet</p>
              <p className="text-[12px] text-white/20">Orders will appear here when placed.</p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/[0.06] bg-[#0d0d0d]">
                  {["Order", "Customer", "Product", "Amount", "Status"].map((h) => (
                    <th key={h} className="px-5 py-3 text-[10px] font-bold text-white/30 uppercase tracking-widest">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-3.5 text-[11px] font-bold text-[#c8874a]">
                      #{String(order.id).slice(-6).toUpperCase()}
                    </td>
                    <td className="px-5 py-3.5 text-[12px] text-white/80 max-w-[100px] truncate">
                      {order.customer_name}
                    </td>
                    <td className="px-5 py-3.5 text-[12px] text-white/50 max-w-[120px] truncate">
                      {order.product_name}
                    </td>
                    <td className="px-5 py-3.5 text-[12px] font-bold text-white">
                      {fmt(order.amount)}
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={order.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Top Products */}
        <div className="lg:col-span-2 bg-[#111111] rounded-2xl border border-white/[0.07] overflow-hidden shadow-xl shadow-black/40">
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
            <h2 className="text-[15px] font-bold text-white">Top Products</h2>
            <Link href="/admin/products" className="text-[11px] font-bold text-[#c8874a] hover:underline flex items-center gap-1">
              View all <ArrowRight size={11} />
            </Link>
          </div>
          {!topProducts || topProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#161616] border border-white/[0.06] flex items-center justify-center">
                <Package size={20} className="text-white/30" />
              </div>
              <p className="text-[13px] font-semibold text-white/40">No products yet</p>
              <Link href="/admin/products/new" className="text-[12px] text-[#c8874a] font-bold hover:underline">
                Add your first product →
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-white/[0.04]">
              {topProducts.map((item, i) => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const p = item.products as any;
                return (
                  <div key={i} className="flex items-center gap-3 px-5 py-3.5 hover:bg-white/[0.02] transition-colors">
                    <span className="text-[11px] font-bold text-white/30 w-4">{i + 1}</span>
                    <div className="w-8 h-8 rounded-lg bg-[#1a1a1a] flex-shrink-0 overflow-hidden relative border border-white/[0.06]">
                      {p?.image_url && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.image_url} alt={p?.name} className="w-full h-full object-contain p-1" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-bold text-white truncate">{p?.name ?? "—"}</p>
                      <p className="text-[11px] text-white/40">{item.quantity} sold</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
