import React from "react";
import { createClient } from "@/lib/supabase/server";
import { ProductCard, Product } from "@/components/ProductCard";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Women's Sunglasses — SPECTRA",
  description: "Discover luxury women's sunglasses from SPECTRA. Cat Eye, Oversized, Round, and gradient tinted lenses.",
};

export const revalidate = 0;

export default async function WomenPage() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("products")
    .select("*")
    .in("category", ["women", "unisex"])
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
      <div className="relative border-b border-white/[0.08] bg-gradient-to-b from-[#181412] via-[#100d0b] to-[#0a0a0a] py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 text-center">
          <p className="text-[10.5px] font-bold tracking-[0.3em] uppercase text-[#c8874a] mb-2 flex items-center justify-center gap-1.5">
            <Sparkles size={14} />
            Elegance In Every Angle
          </p>
          <h1 className="font-stencil text-3xl sm:text-5xl text-white tracking-[0.1em] uppercase">
            Women&apos;s Collection
          </h1>
          <p className="text-neutral-400 text-[13px] sm:text-[14px] mt-3 max-w-md mx-auto">
            Fluid contours, polished gold hardware, and subtle gradient tints designed to turn heads.
          </p>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-10 sm:py-14">
        <div className="flex items-center justify-between pb-6 border-b border-white/[0.08]">
          <p className="text-[12px] font-bold text-white uppercase tracking-wider">
            Showing {products.length} {products.length === 1 ? "Style" : "Styles"}
          </p>
          <div className="flex items-center gap-2">
            <Link
              href="/sunglasses"
              className="text-[11px] font-bold text-[#c8874a] hover:underline uppercase tracking-wider"
            >
              View All Filters →
            </Link>
          </div>
        </div>

        {products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-3 pt-8">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-24 text-neutral-500">
            <p className="text-[15px] text-white font-bold">New Women&apos;s frames arriving soon</p>
            <p className="text-[12px] mt-1 mb-6">Stay tuned for upcoming drops</p>
            <Link
              href="/sunglasses"
              className="bg-[#c8874a] text-white px-5 py-2.5 rounded-xl text-[11.5px] font-bold uppercase tracking-wider"
            >
              Browse All Sunglasses
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
