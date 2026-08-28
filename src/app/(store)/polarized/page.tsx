import React from "react";
import { createClient } from "@/lib/supabase/server";
import { ProductCard, Product } from "@/components/ProductCard";
import Link from "next/link";
import { Eye, Sun, Shield } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Polarized Sunglasses — SPECTRA",
  description: "Advanced polarized optics for crystal-clear contrast and 100% UV glare protection.",
};

export const revalidate = 0;

export default async function PolarizedPage() {
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
      {/* Banner */}
      <div className="relative border-b border-white/[0.08] bg-gradient-to-b from-[#14181a] via-[#0d1012] to-[#0a0a0a] py-16 sm:py-20 text-center">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
          <p className="text-[10.5px] font-bold tracking-[0.3em] uppercase text-[#c8874a] mb-2 flex items-center justify-center gap-1.5">
            <Sun size={14} />
            Optical Mastery
          </p>
          <h1 className="font-stencil text-3xl sm:text-5xl text-white tracking-[0.1em] uppercase">
            Polarized Optics
          </h1>
          <p className="text-neutral-400 text-[13px] sm:text-[14px] mt-3 max-w-md mx-auto">
            Eliminates 99.9% of reflective glare while preserving true color fidelity in harsh sunlight.
          </p>
        </div>
      </div>

      {/* Tech features */}
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-10 border-b border-white/[0.08]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center gap-4 bg-[#121212] p-5 rounded-2xl border border-white/[0.06]">
            <div className="w-10 h-10 rounded-xl bg-[#1a1a1a] flex items-center justify-center text-[#c8874a]">
              <Eye size={18} />
            </div>
            <div>
              <p className="text-[12px] font-bold text-white uppercase tracking-wider">Zero Glare</p>
              <p className="text-[11px] text-neutral-400">Micro-etched polarizing film filter</p>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-[#121212] p-5 rounded-2xl border border-white/[0.06]">
            <div className="w-10 h-10 rounded-xl bg-[#1a1a1a] flex items-center justify-center text-[#c8874a]">
              <Shield size={18} />
            </div>
            <div>
              <p className="text-[12px] font-bold text-white uppercase tracking-wider">UV400 Total Block</p>
              <p className="text-[11px] text-neutral-400">Shields against UVA & UVB rays</p>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-[#121212] p-5 rounded-2xl border border-white/[0.06]">
            <div className="w-10 h-10 rounded-xl bg-[#1a1a1a] flex items-center justify-center text-[#c8874a]">
              <Sun size={18} />
            </div>
            <div>
              <p className="text-[12px] font-bold text-white uppercase tracking-wider">High Contrast</p>
              <p className="text-[11px] text-neutral-400">Enhanced depth & landscape clarity</p>
            </div>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-10 sm:py-14">
        {products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-7">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-neutral-500">
            <p className="text-[15px] text-white font-bold">Frames coming soon</p>
          </div>
        )}
      </div>
    </div>
  );
}
