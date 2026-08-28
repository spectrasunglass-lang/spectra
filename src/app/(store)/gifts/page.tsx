import React from "react";
import { createClient } from "@/lib/supabase/server";
import { ProductCard, Product } from "@/components/ProductCard";
import Link from "next/link";
import { Gift, Heart, PackageOpen, Award } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "The Luxury Gift Destination — SPECTRA",
  description: "Curated eyewear gifts, luxury gift packaging, bespoke gift sets and gift cards by SPECTRA.",
};

export const revalidate = 0;

export default async function GiftsPage() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("products")
    .select("*")
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(8);

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

  const giftFeatures = [
    {
      icon: <PackageOpen size={24} className="text-[#c8874a]" />,
      title: "Signature Gold-Embossed Box",
      desc: "Every pair arrives in our signature matte black hardcase with gold foil stamping and microfiber polishing sleeve.",
    },
    {
      icon: <Award size={24} className="text-[#c8874a]" />,
      title: "Certificate of Authenticity",
      desc: "Includes serialized verification card guaranteeing genuine aerospace materials and UV400 certification.",
    },
    {
      icon: <Heart size={24} className="text-[#c8874a]" />,
      title: "Complimentary Handwritten Note",
      desc: "Add a personalized bespoke gift message at checkout, handwritten on luxury heavy-stock card.",
    },
  ];

  return (
    <div className="bg-[#0a0a0a] min-h-screen">
      {/* Gift Header Hero */}
      <div className="relative border-b border-white/[0.08] bg-gradient-to-b from-[#1c140d] via-[#120e0a] to-[#0a0a0a] py-20 sm:py-24">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 text-center">
          <div className="inline-flex items-center gap-2 bg-[#c8874a]/15 border border-[#c8874a]/30 px-3.5 py-1.5 rounded-full text-[#e5a872] text-[11px] font-bold tracking-widest uppercase mb-4">
            <Gift size={14} />
            The Art of Gifting
          </div>
          <h1 className="font-stencil text-3xl sm:text-5xl lg:text-6xl text-white tracking-[0.1em] uppercase">
            Curated Luxury Gifts
          </h1>
          <p className="text-neutral-300 text-[13.5px] sm:text-[15px] mt-4 max-w-lg mx-auto leading-relaxed">
            Give the gift of visionary elegance. Handcrafted frames presented in bespoke ceremonial packaging.
          </p>
        </div>
      </div>

      {/* Gift Packaging Highlights */}
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-14 border-b border-white/[0.08]">
        <div className="text-center mb-10">
          <p className="text-[10.5px] font-bold tracking-[0.3em] uppercase text-[#c8874a] mb-1">
            The SPECTRA Unboxing
          </p>
          <h2 className="text-2xl font-bold uppercase text-white tracking-tight">
            Ceremonial Presentation Included
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {giftFeatures.map((f, i) => (
            <div
              key={i}
              className="bg-[#121212] border border-white/[0.06] hover:border-[#c8874a]/40 rounded-2xl p-7 transition-all group"
            >
              <div className="w-12 h-12 rounded-xl bg-[#1a1a1a] border border-white/[0.08] flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                {f.icon}
              </div>
              <h3 className="text-white font-bold text-[15px] mb-2">{f.title}</h3>
              <p className="text-neutral-400 text-[13px] leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recommended Gift Frames */}
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-14">
        <div className="flex items-center justify-between pb-6 border-b border-white/[0.08]">
          <div>
            <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-[#c8874a]">
              Client Favorites
            </p>
            <h2 className="text-xl font-bold text-white uppercase tracking-tight mt-0.5">
              Most Gifted Styles
            </h2>
          </div>
          <Link
            href="/sunglasses"
            className="text-[11.5px] font-bold text-[#c8874a] hover:underline uppercase tracking-wider"
          >
            Explore All →
          </Link>
        </div>

        {products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-7 pt-8">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-neutral-500">
            <p className="text-[15px] text-white font-bold">Curating gift collection...</p>
          </div>
        )}
      </div>
    </div>
  );
}
