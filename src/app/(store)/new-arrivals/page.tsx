import React from "react";
import { createClient } from "@/lib/supabase/server";
import { ProductCard, Product } from "@/components/ProductCard";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "New Arrivals 2026 — SPECTRA",
  description: "Explore the latest 2026 sunglasses arrivals. Handcrafted limited-batch frames from SPECTRA.",
};

export const revalidate = 0;

export default async function NewArrivalsPage() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("products")
    .select("*")
    .eq("status", "active")
    .order("created_at", { ascending: false });

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
      <div className="relative border-b border-white/[0.08] bg-gradient-to-b from-[#141414] to-[#0a0a0a] py-16 sm:py-20 text-center">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
          <p className="text-[10.5px] font-bold tracking-[0.3em] uppercase text-[#c8874a] mb-2 flex items-center justify-center gap-1.5">
            <Sparkles size={14} />
            Fresh Releases 2026
          </p>
          <h1 className="font-stencil text-3xl sm:text-5xl text-white tracking-[0.1em] uppercase">
            New Arrivals
          </h1>
          <p className="text-neutral-400 text-[13px] sm:text-[14px] mt-3 max-w-md mx-auto">
            The newest vision of luxury. Discover our latest design innovations.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-10 sm:py-14">
        {products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-3">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-neutral-500">
            <p className="text-[15px] text-white font-bold">New styles launching shortly</p>
          </div>
        )}
      </div>
    </div>
  );
}
