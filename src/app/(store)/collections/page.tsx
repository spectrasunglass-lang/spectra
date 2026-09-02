import React from "react";
import { createClient } from "@/lib/supabase/server";
import { ProductCard, Product } from "@/components/ProductCard";
import Link from "next/link";
import { Package, Sparkles } from "lucide-react";
import type { Metadata } from "next";
import MobileFilterSheet from "@/components/MobileFilterSheet";

export const metadata: Metadata = {
  title: "Spectra Collections — SPECTRA",
  description: "Browse the complete SPECTRA luxury eyewear and sunglasses collection. Handcrafted frames, polarized lenses.",
};

export const revalidate = 0;

interface CollectionsPageProps {
  searchParams: Promise<{
    category?: string;
    shape?: string;
    sort?: string;
    minPrice?: string;
    maxPrice?: string;
    is_new?: string;
  }>;
}

const shapes = ["all", "aviator", "wayfarer", "round", "rectangle", "oval", "cat eye"];
const categories = ["all", "men", "women", "sunglasses", "unisex"];

export default async function CollectionsPage({ searchParams }: CollectionsPageProps) {
  const params = await searchParams;
  const categoryFilter = params.category?.toLowerCase() || "all";
  const shapeFilter = params.shape?.toLowerCase() || "all";
  const sort = params.sort || "newest";

  const supabase = await createClient();

  let query = supabase.from("products").select("*").eq("status", "active");

  if (categoryFilter !== "all") {
    query = query.eq("category", categoryFilter);
  }

  if (shapeFilter !== "all") {
    query = query.eq("shape", shapeFilter);
  }

  if (sort === "price-asc") {
    query = query.order("price", { ascending: true });
  } else if (sort === "price-desc") {
    query = query.order("price", { ascending: false });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  const { data } = await query;
  const products: Product[] = (data || []).map((p) => ({
    id: p.id,
    name: p.name,
    subtitle: p.subtitle || "",
    price: Number(p.price),
    compare_price: p.compare_price ? Number(p.compare_price) : null,
    image_url: p.image_url,
    slug: p.slug,
    is_new: Boolean(p.is_new),
  }));

  return (
    <div className="bg-[#0a0a0a] min-h-screen">
      {/* Banner Header */}
      <div className="relative border-b border-white/[0.08] bg-gradient-to-b from-[#141414] to-[#0a0a0a] py-10 sm:py-20">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 text-center">
          <p className="text-[10.5px] font-bold tracking-[0.3em] uppercase text-[#c8874a] mb-2 flex items-center justify-center">
            Maison Chapters
          </p>
          <h1 className="text-3xl sm:text-5xl font-bold text-white tracking-tight uppercase">
            Spectra Collections
          </h1>
          <p className="text-neutral-400 text-[13px] sm:text-[14px] mt-3 max-w-md mx-auto">
            Engineered with aerospace-grade precision, hand-finished acetate, and optical mastery.
          </p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 pb-10 sm:py-14">
        {/* Filters Toolbar — desktop only */}
        <div className="hidden md:flex flex-col md:flex-row md:items-center justify-between gap-4 px-4 py-3 mb-8 rounded-sm">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
            {categories.map((c) => {
              const isActive = categoryFilter === c;
              const href = c === "all" ? "/collections" : `/collections?category=${c}`;
              return (
                <Link
                  key={c}
                  href={href}
                  className={`px-4 py-2 rounded-sm text-[11.5px] font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                    isActive
                      ? "bg-[#c8874a] text-white shadow-md shadow-[#c8874a]/20"
                      : "bg-[#141414] text-neutral-400 hover:text-white hover:bg-[#1a1a1a] border border-white/[0.06]"
                  }`}
                >
                  {c === "all" ? "All Collections" : c}
                </Link>
              );
            })}
          </div>

          {/* Shapes & Sort */}
          <div className="flex items-center gap-3 self-end md:self-auto">
            {/* Shape select */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-neutral-500 uppercase tracking-widest hidden sm:inline">
                Shape:
              </span>
              <div className="flex items-center gap-1 overflow-x-auto">
                {shapes.slice(0, 6).map((s) => {
                  const isActive = shapeFilter === s;
                  const href =
                    s === "all"
                      ? categoryFilter !== "all"
                        ? `/collections?category=${categoryFilter}`
                        : "/collections"
                      : `/collections?shape=${s}${
                          categoryFilter !== "all" ? `&category=${categoryFilter}` : ""
                        }`;
                  return (
                    <Link
                      key={s}
                      href={href}
                      className={`px-3 py-1 rounded-sm text-[11px] font-semibold capitalize transition-colors ${
                        isActive
                          ? "bg-white text-black font-bold"
                          : "text-neutral-400 hover:text-white"
                      }`}
                    >
                      {s}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Product count */}
            <div className="text-[11px] text-neutral-500 font-semibold pl-3 border-l border-white/[0.1] hidden sm:block whitespace-nowrap">
              {products.length} {products.length === 1 ? "Frame" : "Frames"}
            </div>
          </div>
        </div>

        {/* Mobile filter bar */}
        <MobileFilterSheet
          categoryFilter={categoryFilter}
          shapeFilter={shapeFilter}
          shapes={shapes}
          categories={categories}
        />

        {/* Product Grid */}
        {products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-3">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#141414] border border-white/[0.08] flex items-center justify-center text-neutral-500 mb-4">
              <Package size={28} />
            </div>
            <h3 className="text-white font-bold text-[16px]">No frames match this filter</h3>
            <p className="text-neutral-500 text-[12.5px] mt-1 mb-6">
              Try switching your category or shape selection
            </p>
            <Link
              href="/collections"
              className="bg-[#c8874a] text-white px-5 py-2.5 rounded-xl text-[11.5px] font-bold uppercase tracking-wider hover:bg-[#b87840] transition-colors"
            >
              Reset Filters
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
