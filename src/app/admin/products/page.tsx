"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import {
  Plus, Search, LayoutGrid, List, Edit2, Trash2, Package, Loader2, RefreshCw,
} from "lucide-react";
import StatusBadge from "@/components/admin/StatusBadge";

interface Product {
  id: string;
  name: string;
  subtitle: string;
  price: number;
  image_url: string | null;
  category: string;
  shape: string;
  is_new: boolean;
  status: "active" | "draft";
  slug: string;
  created_at: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "draft">("all");

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setProducts(data as Product[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchProducts();
    const supabase = createClient();
    const channel = supabase
      .channel("products-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "products" }, () => {
        fetchProducts();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchProducts]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setDeletingId(id);
    const supabase = createClient();
    await supabase.from("products").delete().eq("id", id);
    setDeletingId(null);
    fetchProducts();
  };

  const filtered = products.filter((p) => {
    const matchSearch = !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.subtitle ?? "").toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || p.status === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-bold text-white tracking-tight">Products</h1>
          <p className="text-[13px] text-white/40 mt-0.5">
            {loading ? "Loading..." : `${products.length} total products`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchProducts}
            className="w-9 h-9 flex items-center justify-center rounded-sm border border-white/[0.08] bg-[#161616] hover:bg-[#202020] text-white/60 hover:text-white transition-colors"
            title="Refresh"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
          <Link
            href="/admin/products/new"
            className="inline-flex items-center gap-2 bg-[#c8874a] hover:bg-[#b87840] text-white text-[12px] font-bold px-4 py-2.5 rounded-sm transition-all duration-200 shadow-md shadow-[#c8874a]/20"
          >
            <Plus size={14} />
            Add Product
          </Link>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-[#111111] rounded-sm border border-white/[0.07] px-5 py-4">
        <div className="flex items-center gap-2 bg-[#161616] border border-white/[0.08] rounded-sm px-3.5 py-2.5 w-full sm:w-72 focus-within:border-[#c8874a] focus-within:bg-[#1a1a1a] transition-all">
          <Search size={14} className="text-white/40 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="text-[13px] bg-transparent outline-none text-white placeholder-white/30 w-full"
          />
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center bg-[#161616] rounded-sm p-1 gap-0.5 border border-white/[0.06]">
            {(["all", "active", "draft"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 text-[11px] font-bold rounded-sm capitalize transition-all ${
                  filter === f
                    ? "bg-[#c8874a] text-white shadow-sm"
                    : "text-white/40 hover:text-white"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="flex items-center bg-[#161616] rounded-sm p-1 gap-0.5 border border-white/[0.06]">
            <button
              onClick={() => setView("grid")}
              className={`p-1.5 rounded-sm transition-all ${
                view === "grid" ? "bg-[#252525] shadow-sm text-white" : "text-white/40 hover:text-white"
              }`}
            >
              <LayoutGrid size={14} />
            </button>
            <button
              onClick={() => setView("list")}
              className={`p-1.5 rounded-sm transition-all ${
                view === "list" ? "bg-[#252525] shadow-sm text-white" : "text-white/40 hover:text-white"
              }`}
            >
              <List size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="bg-[#111111] rounded-sm border border-white/[0.07] flex items-center justify-center py-20 gap-3">
          <Loader2 size={20} className="animate-spin text-[#c8874a]" />
          <p className="text-[13px] text-white/40">Loading products...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-[#111111] rounded-sm border border-white/[0.07] flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-16 h-16 rounded-sm bg-[#161616] border border-white/[0.06] flex items-center justify-center">
            <Package size={28} className="text-white/20" />
          </div>
          <div className="text-center">
            <p className="text-[15px] font-bold text-white">
              {search ? "No products found" : "No products yet"}
            </p>
            <p className="text-[13px] text-white/40 mt-1">
              {search ? "Try a different search term" : "Add your first product to get started"}
            </p>
          </div>
          {!search && (
            <Link
              href="/admin/products/new"
              className="inline-flex items-center gap-2 bg-[#c8874a] hover:bg-[#b87840] text-white text-[12px] font-bold px-4 py-2.5 rounded-sm transition-colors mt-2"
            >
              <Plus size={14} />
              Add Product
            </Link>
          )}
        </div>
      ) : view === "grid" ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filtered.map((product) => (
            <div
              key={product.id}
              className="bg-[#111111] rounded-sm border border-white/[0.07] overflow-hidden group hover:border-[#c8874a]/40 hover:shadow-xl hover:shadow-black/50 transition-all duration-200"
            >
              <div className="relative aspect-square bg-[#f5f0eb]">
                {product.image_url ? (
                  <Image src={product.image_url} alt={product.name} fill className="object-contain p-3 transition-transform duration-300 group-hover:scale-105" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Package size={24} className="text-gray-400" />
                  </div>
                )}
                {/* Actions overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Link
                    href={`/admin/products/${product.id}/edit`}
                    className="w-8 h-8 bg-white rounded-sm flex items-center justify-center hover:bg-[#c8874a] hover:text-white transition-colors shadow-sm text-gray-900"
                  >
                    <Edit2 size={13} />
                  </Link>
                  <button
                    onClick={() => handleDelete(product.id, product.name)}
                    disabled={deletingId === product.id}
                    className="w-8 h-8 bg-white rounded-sm flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors shadow-sm disabled:opacity-50 text-gray-900"
                  >
                    {deletingId === product.id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                  </button>
                </div>
                {product.is_new && (
                  <span className="absolute top-2 left-2 text-[9px] font-bold tracking-widest px-1.5 py-0.5 bg-[#c8874a] text-white rounded-sm uppercase">
                    NEW
                  </span>
                )}
              </div>
              <div className="p-3.5">
                <p className="text-[12px] font-bold text-white truncate">{product.name}</p>
                <p className="text-[11px] text-white/40 mt-0.5 truncate">{product.subtitle}</p>
                <div className="flex items-center justify-between mt-2.5">
                  <p className="text-[13px] font-bold text-[#c8874a]">₹{product.price.toLocaleString("en-IN")}</p>
                  <StatusBadge status={product.status} />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-[#111111] rounded-sm border border-white/[0.07] overflow-hidden">
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left min-w-[620px]">
              <thead>
                <tr className="border-b border-white/[0.06] bg-[#0d0d0d]">
                  {["Product", "Category", "Shape", "Price", "Status", ""].map((h) => (
                    <th key={h} className="px-6 py-3.5 text-[10px] font-bold text-white/30 uppercase tracking-widest">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {filtered.map((product) => (
                  <tr key={product.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-sm bg-[#161616] border border-white/[0.06] flex-shrink-0 overflow-hidden relative">
                          {product.image_url ? (
                            <Image src={product.image_url} alt={product.name} fill className="object-contain p-1" />
                          ) : (
                            <Package size={16} className="text-white/30 absolute inset-0 m-auto" />
                          )}
                        </div>
                        <div>
                          <p className="text-[13px] font-bold text-white">{product.name}</p>
                          <p className="text-[11px] text-white/40">{product.subtitle}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[12px] text-white/70 capitalize">{product.category}</td>
                    <td className="px-6 py-4 text-[12px] text-white/70 capitalize">{product.shape}</td>
                    <td className="px-6 py-4 text-[13px] font-bold text-[#c8874a]">₹{product.price.toLocaleString("en-IN")}</td>
                    <td className="px-6 py-4"><StatusBadge status={product.status} /></td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <Link href={`/admin/products/${product.id}/edit`} className="p-1.5 rounded-sm hover:bg-white/[0.06] text-white/40 hover:text-white transition-colors">
                          <Edit2 size={14} />
                        </Link>
                        <button
                          onClick={() => handleDelete(product.id, product.name)}
                          disabled={deletingId === product.id}
                          className="p-1.5 rounded-sm hover:bg-red-500/10 text-white/40 hover:text-red-400 transition-colors disabled:opacity-50"
                        >
                          {deletingId === product.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
