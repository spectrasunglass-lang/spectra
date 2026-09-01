import React from "react";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProductCard, Product } from "@/components/ProductCard";
import ProductDetailClient from "./ProductDetailClient";
import type { Metadata } from "next";

export const revalidate = 0;

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: product } = await supabase
    .from("products")
    .select("name, subtitle, description")
    .eq("slug", slug)
    .single();

  if (!product) {
    return { title: "Product Not Found — SPECTRA" };
  }

  return {
    title: `${product.name} — SPECTRA Eyewear`,
    description: product.subtitle || product.description || "SPECTRA Luxury Eyewear",
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!product) {
    notFound();
  }

  // Fetch related products in the same category
  const { data: relatedData } = await supabase
    .from("products")
    .select("*")
    .eq("status", "active")
    .neq("id", product.id)
    .limit(4);

  const relatedProducts: Product[] = (relatedData || []).map((p) => ({
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
      <ProductDetailClient product={product} />

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="border-t border-white/[0.08] pt-5 pb-16 md:pb-0 md:py-16 max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
          <div className="flex items-center justify-between pb-8">
            <div>
              <p className="text-[10.5px] font-bold tracking-[0.3em] uppercase text-[#c8874a]">
                Complete The Look
              </p>
              <h2 className="text-2xl font-bold uppercase text-white tracking-tight mt-1">
                You May Also Admire
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-3">
            {relatedProducts.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
