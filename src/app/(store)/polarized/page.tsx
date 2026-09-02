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

export const revalidate = 60;

export default async function PolarizedPage() {
  const supabase = await createClient();

  const { data: polarizedData } = await supabase
    .from("products")
    .select("id, name, subtitle, price, compare_price, image_url, slug, is_new, shape, category")
    .eq("status", "active")
    .eq("is_polarized", true)
    .order("created_at", { ascending: false });

  const data = (polarizedData && polarizedData.length > 0)
    ? polarizedData
    : (await supabase.from("products").select("id, name, subtitle, price, compare_price, image_url, slug, is_new, shape, category").eq("status", "active").order("created_at", { ascending: false })).data;

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
            Optical Mastery
          </p>
          <h1 className="text-3xl sm:text-5xl font-bold text-white tracking-tight uppercase">
            Polarized Optics
          </h1>
          <p className="text-neutral-400 text-[13px] sm:text-[14px] mt-3 max-w-md mx-auto">
            Eliminates 99.9% of reflective glare while preserving true color fidelity in harsh sunlight.
          </p>
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
