import React from "react";
import { ProductCard, Product } from "@/components/ProductCard";
import { createClient } from "@/lib/supabase/server";

type CollectionFlag = "is_computer_glasses" | "is_accessory";

interface FlaggedProductCollectionProps {
  flag: CollectionFlag;
  eyebrow: string;
  title: string;
  description: string;
  emptyMessage: string;
}

/**
 * Renders a storefront collection backed by an explicit product flag. Products
 * are never substituted with unrelated inventory when the collection is empty.
 */
export default async function FlaggedProductCollection({
  flag,
  eyebrow,
  title,
  description,
  emptyMessage,
}: FlaggedProductCollectionProps) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("id, name, subtitle, price, compare_price, image_url, images, slug, is_new")
    .eq("status", "active")
    .eq(flag, true)
    .order("created_at", { ascending: false });

  const products: Product[] = (data || []).map((product) => ({
    id: product.id,
    name: product.name,
    subtitle: product.subtitle || "",
    price: Number(product.price),
    compare_price: product.compare_price ? Number(product.compare_price) : null,
    image_url: product.image_url,
    images: Array.isArray(product.images) ? product.images : [],
    slug: product.slug,
    is_new: Boolean(product.is_new),
  }));

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <section className="border-b border-white/[0.08] bg-gradient-to-b from-[#14181a] via-[#0d1012] to-[#0a0a0a] py-16 text-center sm:py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
          <p className="mb-2 text-[10.5px] font-bold uppercase tracking-[0.3em] text-[#c8874a]">
            {eyebrow}
          </p>
          <h1 className="text-3xl font-bold uppercase tracking-tight text-white sm:text-5xl">
            {title}
          </h1>
          <p className="mx-auto mt-3 max-w-md text-[13px] text-neutral-400 sm:text-[14px]">
            {description}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14 lg:px-12">
        {products.length > 0 ? (
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:gap-7 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center text-neutral-500">
            <p className="text-[15px] font-bold text-white">{emptyMessage}</p>
          </div>
        )}
      </section>
    </div>
  );
}
