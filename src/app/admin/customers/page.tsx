"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { formatWhatsappPhone, getWhatsappChatLink } from "@/lib/customers";
import {
  Users,
  Search,
  RefreshCw,
  Plus,
  Download,
  Phone,
  Mail,
  MapPin,
  ShoppingBag,
  IndianRupee,
  ExternalLink,
  MessageCircle,
  Copy,
  Check,
  Calendar,
  X,
  ShieldCheck,
  Clock,
  Sparkles,
  ChevronRight,
  Filter,
  UserCheck,
} from "lucide-react";

interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  city?: string | null;
  address?: string | null;
  auth_id?: string | null;
  total_orders: number;
  total_spent: number;
  created_at: string;
  last_active_at?: string | null;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [search, setSearch] = useState("");
  const [filterTab, setFilterTab] = useState<"all" | "orders" | "whatsapp" | "registered">("all");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Add Customer modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [adding, setAdding] = useState(false);
  const [addForm, setAddForm] = useState({
    name: "",
    email: "",
    phone: "",
    city: "",
    address: "",
  });

  // Customer Detail Drawer / Modal
  const [activeCustomer, setActiveCustomer] = useState<Customer | null>(null);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const supabase = createClient();

      // 1. Fetch from customers table
      const { data: customerData, error: customerErr } = await supabase
        .from("customers")
        .select("*")
        .order("created_at", { ascending: false });

      // 2. Fetch from orders table to cross-reference & aggregate
      const { data: ordersData } = await supabase
        .from("orders")
        .select("customer_name, customer_email, customer_phone, city, address, amount, created_at");

      // Aggregate orders by lowercase email
      const ordersByEmail: Record<
        string,
        {
          name: string;
          email: string;
          phone?: string;
          city?: string;
          address?: string;
          count: number;
          spent: number;
          earliest: string;
          latest: string;
        }
      > = {};

      (ordersData || []).forEach((ord) => {
        if (!ord.customer_email) return;
        const em = ord.customer_email.trim().toLowerCase();
        if (!ordersByEmail[em]) {
          ordersByEmail[em] = {
            name: ord.customer_name || em.split("@")[0],
            email: em,
            phone: ord.customer_phone || undefined,
            city: ord.city || undefined,
            address: ord.address || undefined,
            count: 0,
            spent: 0,
            earliest: ord.created_at || new Date().toISOString(),
            latest: ord.created_at || new Date().toISOString(),
          };
        }
        ordersByEmail[em].count += 1;
        ordersByEmail[em].spent += Number(ord.amount || 0);
        if (ord.customer_phone && !ordersByEmail[em].phone) ordersByEmail[em].phone = ord.customer_phone;
        if (ord.city && !ordersByEmail[em].city) ordersByEmail[em].city = ord.city;
        if (ord.address && !ordersByEmail[em].address) ordersByEmail[em].address = ord.address;
        if (new Date(ord.created_at) < new Date(ordersByEmail[em].earliest)) ordersByEmail[em].earliest = ord.created_at;
        if (new Date(ord.created_at) > new Date(ordersByEmail[em].latest)) ordersByEmail[em].latest = ord.created_at;
      });

      // Merge results
      const customerMap = new Map<string, Customer>();

      // Populate from customers table first
      if (!customerErr && customerData) {
        customerData.forEach((c: Customer) => {
          const em = c.email.toLowerCase().trim();
          const ordStats = ordersByEmail[em];
          customerMap.set(em, {
            ...c,
            // If orders table has more updated order count/spending, use higher
            total_orders: Math.max(c.total_orders || 0, ordStats?.count || 0),
            total_spent: Math.max(Number(c.total_spent || 0), ordStats?.spent || 0),
            phone: c.phone || ordStats?.phone || null,
            city: c.city || ordStats?.city || null,
            address: c.address || ordStats?.address || null,
          });
        });
      }

      // Add any order clients that are not yet in customers table
      Object.keys(ordersByEmail).forEach((em) => {
        if (!customerMap.has(em)) {
          const ord = ordersByEmail[em];
          customerMap.set(em, {
            id: `ord-client-${em}`,
            name: ord.name,
            email: ord.email,
            phone: ord.phone || null,
            city: ord.city || null,
            address: ord.address || null,
            auth_id: null,
            total_orders: ord.count,
            total_spent: ord.spent,
            created_at: ord.earliest,
            last_active_at: ord.latest,
          });
        }
      });

      const list = Array.from(customerMap.values()).sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setCustomers(list);
    } catch (err) {
      console.error("[Fetch Customers Error]", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  // Sync customers from orders table into Supabase customers table
  const handleSyncOrders = async () => {
    setSyncing(true);
    try {
      const supabase = createClient();
      const { data: ordersData } = await supabase
        .from("orders")
        .select("customer_name, customer_email, customer_phone, city, address, amount, created_at");

      if (!ordersData || ordersData.length === 0) {
        alert("No orders available to sync.");
        setSyncing(false);
        return;
      }

      const orderGroups: Record<string, any> = {};
      ordersData.forEach((ord) => {
        if (!ord.customer_email) return;
        const em = ord.customer_email.trim().toLowerCase();
        if (!orderGroups[em]) {
          orderGroups[em] = {
            name: ord.customer_name || em.split("@")[0],
            email: em,
            phone: ord.customer_phone || null,
            city: ord.city || null,
            address: ord.address || null,
            total_orders: 0,
            total_spent: 0,
            created_at: ord.created_at,
            last_active_at: ord.created_at,
          };
        }
        orderGroups[em].total_orders += 1;
        orderGroups[em].total_spent += Number(ord.amount || 0);
        if (ord.customer_phone) orderGroups[em].phone = ord.customer_phone;
        if (ord.city) orderGroups[em].city = ord.city;
        if (ord.address) orderGroups[em].address = ord.address;
      });

      const records = Object.values(orderGroups);
      for (const rec of records) {
        await supabase
          .from("customers")
          .upsert(rec, { onConflict: "email" });
      }

      await fetchCustomers();
      alert(`Synced ${records.length} customers from orders successfully!`);
    } catch (err: any) {
      console.error("[Sync Error]", err);
      alert("Notice: Run the customers SQL schema in Supabase SQL editor to enable persistent table sync.");
    } finally {
      setSyncing(false);
    }
  };

  // Add customer manually
  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.email) return;
    setAdding(true);

    try {
      const supabase = createClient();
      const now = new Date().toISOString();
      const { error } = await supabase.from("customers").insert({
        name: addForm.name.trim() || addForm.email.split("@")[0],
        email: addForm.email.trim().toLowerCase(),
        phone: addForm.phone.trim() || null,
        city: addForm.city.trim() || null,
        address: addForm.address.trim() || null,
        total_orders: 0,
        total_spent: 0,
        created_at: now,
        last_active_at: now,
      });

      if (error) throw error;

      setShowAddModal(false);
      setAddForm({ name: "", email: "", phone: "", city: "", address: "" });
      await fetchCustomers();
    } catch (err: any) {
      console.error("[Add Customer Error]", err);
      alert(err.message || "Failed to add customer. Ensure customers table exists in Supabase.");
    } finally {
      setAdding(false);
    }
  };

  // Copy helper
  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Export CSV
  const handleExportCSV = () => {
    if (customers.length === 0) return;
    const headers = ["Name", "Email", "Phone", "City", "Total Orders", "Total Spent (INR)", "Created Date", "Registered Client"];
    const rows = customers.map((c) => [
      `"${c.name.replace(/"/g, '""')}"`,
      `"${c.email}"`,
      `"${c.phone || ""}"`,
      `"${(c.city || "").replace(/"/g, '""')}"`,
      c.total_orders,
      c.total_spent,
      new Date(c.created_at).toLocaleDateString(),
      c.auth_id ? "Yes" : "No",
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `spectra-customers-${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter logic
  const filtered = customers.filter((c) => {
    const q = search.toLowerCase();
    const matchesSearch =
      c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      (c.phone && c.phone.includes(q)) ||
      (c.city && c.city.toLowerCase().includes(q));

    if (!matchesSearch) return false;

    if (filterTab === "orders") return c.total_orders > 0;
    if (filterTab === "whatsapp") return Boolean(c.phone && c.phone.trim().length >= 10);
    if (filterTab === "registered") return Boolean(c.auth_id);
    return true;
  });

  // Stats calculation
  const totalSpend = customers.reduce((s, c) => s + (Number(c.total_spent) || 0), 0);
  const totalOrders = customers.reduce((s, c) => s + (c.total_orders || 0), 0);
  const withPhoneCount = customers.filter((c) => c.phone && c.phone.trim().length >= 10).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-[22px] font-bold text-white tracking-tight">
              Customer Directory
            </h1>
            <span className="bg-[#c8874a]/15 text-[#e5a872] border border-[#c8874a]/30 px-2.5 py-0.5 rounded-full text-[11px] font-bold">
              {customers.length} Clients
            </span>
          </div>
          <p className="text-[13px] text-white/40 mt-0.5">
            Client profiles, purchase volume, and one-click direct WhatsApp engagement
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Refresh */}
          <button
            type="button"
            onClick={fetchCustomers}
            disabled={loading}
            className="p-2.5 bg-[#141414] hover:bg-[#1f1f1f] border border-white/[0.08] text-white/70 hover:text-white rounded-sm transition-colors cursor-pointer"
            title="Refresh list"
          >
            <RefreshCw size={14} className={loading ? "animate-spin text-[#c8874a]" : ""} />
          </button>

          {/* Sync Orders */}
          <button
            type="button"
            onClick={handleSyncOrders}
            disabled={syncing}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#141414] hover:bg-[#1a1a1a] border border-[#c8874a]/40 text-[#e5a872] text-[12px] font-semibold rounded-sm transition-colors cursor-pointer"
            title="Scan orders table and import all customers"
          >
            <RefreshCw size={13} className={syncing ? "animate-spin" : ""} />
            {syncing ? "Syncing..." : "Sync from Orders"}
          </button>

          {/* Export CSV */}
          <button
            type="button"
            onClick={handleExportCSV}
            disabled={customers.length === 0}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#141414] hover:bg-[#1f1f1f] border border-white/[0.08] text-white/80 text-[12px] font-semibold rounded-sm transition-colors cursor-pointer"
          >
            <Download size={13} />
            Export CSV
          </button>

          {/* Add Customer */}
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#c8874a] hover:bg-[#b87840] text-white text-[12px] font-bold rounded-sm transition-all shadow-lg shadow-[#c8874a]/20 cursor-pointer"
          >
            <Plus size={14} />
            Add Customer
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Total Customers */}
        <div className="bg-[#111111] border border-white/[0.07] rounded-sm p-4.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-white/40">
              Total Clients
            </span>
            <div className="w-8 h-8 rounded-sm bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-[#c8874a]">
              <Users size={16} />
            </div>
          </div>
          <p className="text-[24px] font-bold text-white mt-2 leading-none">
            {customers.length}
          </p>
          <span className="text-[11px] text-white/40 mt-1.5 block">
            {customers.filter((c) => c.auth_id).length} registered with password
          </span>
        </div>

        {/* WhatsApp Ready */}
        <div className="bg-[#111111] border border-emerald-500/20 rounded-sm p-4.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-emerald-400">
              WhatsApp Ready
            </span>
            <div className="w-8 h-8 rounded-sm bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-[#25D366]">
              <MessageCircle size={16} className="fill-[#25D366]" />
            </div>
          </div>
          <p className="text-[24px] font-bold text-white mt-2 leading-none">
            {withPhoneCount}
          </p>
          <span className="text-[11px] text-emerald-400/70 mt-1.5 block">
            Direct 1-tap WhatsApp chat links
          </span>
        </div>

        {/* Total Orders */}
        <div className="bg-[#111111] border border-white/[0.07] rounded-sm p-4.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-white/40">
              Orders Placed
            </span>
            <div className="w-8 h-8 rounded-sm bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-[#c8874a]">
              <ShoppingBag size={16} />
            </div>
          </div>
          <p className="text-[24px] font-bold text-white mt-2 leading-none">
            {totalOrders}
          </p>
          <span className="text-[11px] text-white/40 mt-1.5 block">
            {customers.filter((c) => c.total_orders > 0).length} repeat or active buyers
          </span>
        </div>

        {/* Total Spend */}
        <div className="bg-[#111111] border border-white/[0.07] rounded-sm p-4.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-white/40">
              Customer Lifetime Value
            </span>
            <div className="w-8 h-8 rounded-sm bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-[#c8874a]">
              <IndianRupee size={16} />
            </div>
          </div>
          <p className="text-[24px] font-bold text-[#e5a872] mt-2 leading-none">
            ₹{totalSpend.toLocaleString("en-IN")}
          </p>
          <span className="text-[11px] text-white/40 mt-1.5 block">
            Average ₹{customers.length > 0 ? Math.round(totalSpend / customers.length).toLocaleString("en-IN") : 0} per client
          </span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-[#111111] rounded-sm border border-white/[0.07] overflow-hidden shadow-xl shadow-black/40">
        {/* Search and Tabs */}
        <div className="p-4 border-b border-white/[0.06] flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="flex items-center gap-2 bg-[#161616] border border-white/[0.08] rounded-sm px-3.5 py-2 w-full max-w-md focus-within:border-[#c8874a] transition-all">
            <Search size={14} className="text-white/40 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search by client name, email, phone, or city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="text-[13px] bg-transparent outline-none text-white placeholder-white/30 w-full"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="text-white/40 hover:text-white"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1 bg-[#161616] p-1 border border-white/[0.06] rounded-sm self-start md:self-auto overflow-x-auto max-w-full">
            <button
              type="button"
              onClick={() => setFilterTab("all")}
              className={`px-3 py-1.5 text-[11.5px] font-bold uppercase tracking-wider rounded-sm transition-all whitespace-nowrap ${
                filterTab === "all"
                  ? "bg-[#252525] text-white shadow-sm"
                  : "text-white/40 hover:text-white"
              }`}
            >
              All ({customers.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterTab("whatsapp")}
              className={`px-3 py-1.5 text-[11.5px] font-bold uppercase tracking-wider rounded-sm transition-all whitespace-nowrap flex items-center gap-1.5 ${
                filterTab === "whatsapp"
                  ? "bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 shadow-sm"
                  : "text-white/40 hover:text-emerald-400"
              }`}
            >
              <MessageCircle size={12} className="text-[#25D366]" />
              WhatsApp Ready ({withPhoneCount})
            </button>
            <button
              type="button"
              onClick={() => setFilterTab("orders")}
              className={`px-3 py-1.5 text-[11.5px] font-bold uppercase tracking-wider rounded-sm transition-all whitespace-nowrap ${
                filterTab === "orders"
                  ? "bg-[#252525] text-white shadow-sm"
                  : "text-white/40 hover:text-white"
              }`}
            >
              Buyers ({customers.filter((c) => c.total_orders > 0).length})
            </button>
            <button
              type="button"
              onClick={() => setFilterTab("registered")}
              className={`px-3 py-1.5 text-[11.5px] font-bold uppercase tracking-wider rounded-sm transition-all whitespace-nowrap ${
                filterTab === "registered"
                  ? "bg-[#252525] text-white shadow-sm"
                  : "text-white/40 hover:text-white"
              }`}
            >
              Registered ({customers.filter((c) => c.auth_id).length})
            </button>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="py-24 text-center text-white/40 text-[13px]">
            <RefreshCw size={26} className="animate-spin mx-auto mb-2 text-[#c8874a]" />
            Loading customer directory...
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-24 text-center text-white/40 text-[13px] space-y-3 px-4">
            <Users size={36} className="mx-auto text-white/20 mb-2" />
            <p className="font-bold text-white/80 text-[15px]">No customers found</p>
            <p className="text-[12px] max-w-md mx-auto text-white/40">
              {search
                ? `No customers match "${search}". Try clearing your search.`
                : "When clients register on the store or place orders, they will automatically be recorded here."}
            </p>
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="text-[12px] text-[#c8874a] underline"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/[0.06] bg-[#0d0d0d]">
                  <th className="px-5 py-3.5 text-[10.5px] font-bold text-white/40 uppercase tracking-widest">
                    Client Details
                  </th>
                  <th className="px-5 py-3.5 text-[10.5px] font-bold text-white/40 uppercase tracking-widest">
                    WhatsApp / Phone
                  </th>
                  <th className="px-5 py-3.5 text-[10.5px] font-bold text-white/40 uppercase tracking-widest">
                    Location
                  </th>
                  <th className="px-5 py-3.5 text-[10.5px] font-bold text-white/40 uppercase tracking-widest">
                    Orders / Volume
                  </th>
                  <th className="px-5 py-3.5 text-[10.5px] font-bold text-white/40 uppercase tracking-widest">
                    Joined Date
                  </th>
                  <th className="px-5 py-3.5 text-[10.5px] font-bold text-white/40 uppercase tracking-widest text-right">
                    Direct Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {filtered.map((c) => {
                  const waLink = getWhatsappChatLink(
                    c.phone,
                    `Hello ${c.name}! We're contacting you from SPECTRA Luxury Eyewear regarding your account & bespoke eyewear.`
                  );

                  return (
                    <tr
                      key={c.id}
                      className="hover:bg-white/[0.02] transition-colors group cursor-pointer"
                      onClick={() => setActiveCustomer(c)}
                    >
                      {/* Client Details */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#1b1b1b] to-[#252525] border border-white/[0.1] flex items-center justify-center text-[#c8874a] font-bold text-[12px] uppercase shadow-inner flex-shrink-0">
                            {c.name ? c.name.charAt(0) : "C"}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-white text-[13px] truncate">
                                {c.name || "Client"}
                              </span>
                              {c.auth_id && (
                                <span
                                  className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[9.5px] font-bold tracking-wider uppercase"
                                  title="Registered Member Account"
                                >
                                  <ShieldCheck size={10} />
                                  VIP
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-[12px] text-white/50 truncate">
                                {c.email}
                              </span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  copyToClipboard(c.email, `email-${c.id}`);
                                }}
                                className="text-white/30 hover:text-white transition-colors"
                                title="Copy email"
                              >
                                {copiedKey === `email-${c.id}` ? (
                                  <Check size={12} className="text-emerald-400" />
                                ) : (
                                  <Copy size={12} />
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* WhatsApp / Phone */}
                      <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
                        {c.phone ? (
                          <div className="flex items-center gap-2">
                            <a
                              href={waLink || "#"}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 hover:border-emerald-500/50 text-[#25D366] text-[11.5px] font-bold transition-all shadow-sm group/btn"
                              title="Click to start WhatsApp chat with this client"
                            >
                              <MessageCircle size={13} className="fill-[#25D366] group-hover/btn:scale-110 transition-transform" />
                              <span>{c.phone}</span>
                            </a>
                            <button
                              type="button"
                              onClick={() => copyToClipboard(c.phone!, `phone-${c.id}`)}
                              className="text-white/30 hover:text-white transition-colors p-1"
                              title="Copy phone"
                            >
                              {copiedKey === `phone-${c.id}` ? (
                                <Check size={12} className="text-emerald-400" />
                              ) : (
                                <Copy size={12} />
                              )}
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11.5px] text-white/25 italic">
                            No phone provided
                          </span>
                        )}
                      </td>

                      {/* City */}
                      <td className="px-5 py-4">
                        {c.city ? (
                          <div className="flex items-center gap-1.5 text-[12px] text-white/70">
                            <MapPin size={12} className="text-[#c8874a] flex-shrink-0" />
                            <span className="truncate max-w-[140px]">{c.city}</span>
                          </div>
                        ) : (
                          <span className="text-[11.5px] text-white/25">—</span>
                        )}
                      </td>

                      {/* Orders / Volume */}
                      <td className="px-5 py-4">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`text-[12px] font-bold ${
                                c.total_orders > 0 ? "text-white" : "text-white/40"
                              }`}
                            >
                              {c.total_orders} {c.total_orders === 1 ? "order" : "orders"}
                            </span>
                          </div>
                          <span className="text-[11px] text-[#e5a872] font-medium block">
                            ₹{Number(c.total_spent || 0).toLocaleString("en-IN")}
                          </span>
                        </div>
                      </td>

                      {/* Joined Date */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5 text-[11.5px] text-white/40">
                          <Calendar size={11} className="text-white/30 flex-shrink-0" />
                          <span>{new Date(c.created_at).toLocaleDateString()}</span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="inline-flex items-center gap-1.5">
                          {c.phone && waLink && (
                            <a
                              href={waLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-[#25D366] border border-emerald-500/30 transition-colors"
                              title="Direct WhatsApp Chat"
                            >
                              <MessageCircle size={14} className="fill-[#25D366]" />
                            </a>
                          )}
                          <Link
                            href={`/admin/orders?search=${encodeURIComponent(c.email)}`}
                            className="p-1.5 rounded bg-white/[0.04] hover:bg-white/[0.08] text-white/60 hover:text-white border border-white/[0.08] transition-colors"
                            title="View orders by this customer"
                          >
                            <ShoppingBag size={14} />
                          </Link>
                          <button
                            type="button"
                            onClick={() => setActiveCustomer(c)}
                            className="p-1.5 rounded bg-white/[0.04] hover:bg-white/[0.08] text-white/60 hover:text-white border border-white/[0.08] transition-colors"
                            title="View customer profile"
                          >
                            <ChevronRight size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Customer Detail Drawer / Modal */}
      {activeCustomer && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121212] border border-white/[0.12] rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-white/[0.08] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#1e1e1e] border border-white/[0.12] flex items-center justify-center text-[#c8874a] font-bold text-[18px] uppercase">
                  {activeCustomer.name ? activeCustomer.name.charAt(0) : "C"}
                </div>
                <div>
                  <h3 className="text-[16px] font-bold text-white flex items-center gap-2">
                    {activeCustomer.name}
                    {activeCustomer.auth_id && (
                      <span className="bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded text-[9.5px] font-bold uppercase">
                        Registered
                      </span>
                    )}
                  </h3>
                  <p className="text-[12px] text-white/50">{activeCustomer.email}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveCustomer(null)}
                className="text-white/40 hover:text-white p-1 rounded hover:bg-white/5"
              >
                <X size={18} />
              </button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#181818] p-3.5 rounded-lg border border-white/[0.06]">
                <span className="text-[10.5px] uppercase font-bold text-white/40 tracking-wider">
                  Total Orders
                </span>
                <p className="text-[18px] font-bold text-white mt-1">
                  {activeCustomer.total_orders}
                </p>
              </div>
              <div className="bg-[#181818] p-3.5 rounded-lg border border-white/[0.06]">
                <span className="text-[10.5px] uppercase font-bold text-white/40 tracking-wider">
                  Total Spend
                </span>
                <p className="text-[18px] font-bold text-[#e5a872] mt-1">
                  ₹{Number(activeCustomer.total_spent || 0).toLocaleString("en-IN")}
                </p>
              </div>
            </div>

            {/* Contact & Address Details */}
            <div className="space-y-2.5 text-[12.5px]">
              <div className="flex items-center justify-between p-3 bg-[#181818] rounded-lg border border-white/[0.06]">
                <span className="text-white/50 flex items-center gap-2">
                  <Phone size={13} className="text-[#c8874a]" /> Phone Number
                </span>
                <span className="font-semibold text-white">
                  {activeCustomer.phone || "Not provided"}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-[#181818] rounded-lg border border-white/[0.06]">
                <span className="text-white/50 flex items-center gap-2">
                  <MapPin size={13} className="text-[#c8874a]" /> City / Region
                </span>
                <span className="font-semibold text-white">
                  {activeCustomer.city || "Not provided"}
                </span>
              </div>

              {activeCustomer.address && (
                <div className="p-3 bg-[#181818] rounded-lg border border-white/[0.06] space-y-1">
                  <span className="text-[11px] uppercase tracking-wider text-white/40 font-semibold block">
                    Last Known Delivery Address
                  </span>
                  <p className="text-neutral-300 text-[12px] leading-relaxed">
                    {activeCustomer.address}
                  </p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex items-center gap-3">
              {activeCustomer.phone ? (
                <a
                  href={
                    getWhatsappChatLink(
                      activeCustomer.phone,
                      `Hello ${activeCustomer.name}! Reaching out from SPECTRA Luxury Eyewear regarding your order.`
                    ) || "#"
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2.5 px-4 bg-[#25D366] hover:bg-[#20ba59] text-black font-bold text-[13px] rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#25D366]/20"
                >
                  <MessageCircle size={16} className="fill-black" />
                  Chat on WhatsApp
                </a>
              ) : (
                <button
                  type="button"
                  disabled
                  className="flex-1 py-2.5 px-4 bg-white/5 text-white/30 text-[13px] rounded-lg flex items-center justify-center gap-2 cursor-not-allowed"
                >
                  <MessageCircle size={16} />
                  No WhatsApp Phone
                </button>
              )}

              <Link
                href={`/admin/orders?search=${encodeURIComponent(activeCustomer.email)}`}
                className="py-2.5 px-4 bg-white/10 hover:bg-white/15 text-white font-semibold text-[13px] rounded-lg transition-colors flex items-center gap-1.5"
              >
                <ShoppingBag size={15} />
                Orders
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Add Customer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121212] border border-white/[0.12] rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <h3 className="text-[16px] font-bold text-white flex items-center gap-2">
                <Users size={18} className="text-[#c8874a]" />
                Add New Customer
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-white/40 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddCustomer} className="space-y-3.5">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-white/60 block mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={addForm.name}
                  onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full bg-[#181818] border border-white/[0.1] rounded-lg px-3 py-2 text-white text-[13px] focus:outline-none focus:border-[#c8874a]"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-white/60 block mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={addForm.email}
                  onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                  placeholder="client@example.com"
                  className="w-full bg-[#181818] border border-white/[0.1] rounded-lg px-3 py-2 text-white text-[13px] focus:outline-none focus:border-[#c8874a]"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-white/60 block mb-1">
                  WhatsApp / Phone Number
                </label>
                <input
                  type="tel"
                  value={addForm.phone}
                  onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full bg-[#181818] border border-white/[0.1] rounded-lg px-3 py-2 text-white text-[13px] focus:outline-none focus:border-[#c8874a]"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-white/60 block mb-1">
                  City
                </label>
                <input
                  type="text"
                  value={addForm.city}
                  onChange={(e) => setAddForm({ ...addForm, city: e.target.value })}
                  placeholder="Mumbai, Delhi, Bangalore..."
                  className="w-full bg-[#181818] border border-white/[0.1] rounded-lg px-3 py-2 text-white text-[13px] focus:outline-none focus:border-[#c8874a]"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-white/60 block mb-1">
                  Full Address (Optional)
                </label>
                <textarea
                  rows={2}
                  value={addForm.address}
                  onChange={(e) => setAddForm({ ...addForm, address: e.target.value })}
                  placeholder="Street, Landmark, Pincode"
                  className="w-full bg-[#181818] border border-white/[0.1] rounded-lg px-3 py-2 text-white text-[13px] focus:outline-none focus:border-[#c8874a]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-[12px] font-semibold text-white/60 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adding}
                  className="px-5 py-2 bg-[#c8874a] hover:bg-[#b87840] text-white text-[12px] font-bold rounded-lg transition-all shadow-lg shadow-[#c8874a]/20"
                >
                  {adding ? "Saving..." : "Save Customer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
