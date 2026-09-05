import React from "react";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProductCard, Product } from "@/components/ProductCard";
import ProductDetailClient from "./ProductDetailClient";
import type { Metadata } from "next";
import type { SupabaseClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const dynamicParams = true;

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  try {
    const supabase = await createClient();
    const { data: products } = await supabase.from("products").select("slug");
    return (products || []).filter((p) => p.slug).map((p) => ({
      slug: p.slug,
    }));
  } catch {
    return [];
  }
}

// Helper to reliably find product by slug, normalized slug, id, or name
async function findProduct(supabase: SupabaseClient, rawParam: string) {
  if (!rawParam) return null;
  const decoded = decodeURIComponent(rawParam).trim();
  const normalized = decoded.toLowerCase().replace(/\s+/g, "-");

  // 1. Try normalized slug (e.g. gold-frame-square-aviator-sunglasses)
  const { data: bySlug } = await supabase
    .from("products")
    .select("*")
    .eq("slug", normalized)
    .maybeSingle();

  if (bySlug) return bySlug;

  // 2. Try raw slug if different
  if (decoded !== normalized) {
    const { data: byRawSlug } = await supabase
      .from("products")
      .select("*")
      .eq("slug", decoded)
      .maybeSingle();
    if (byRawSlug) return byRawSlug;
  }

  // 3. Try matching by UUID if valid
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(decoded)) {
    const { data: byId } = await supabase
      .from("products")
      .select("*")
      .eq("id", decoded)
      .maybeSingle();
    if (byId) return byId;
  }

  // 4. Try matching product name (replaces hyphens with spaces)
  const nameQuery = decoded.replace(/-/g, " ").trim();
  const { data: byName } = await supabase
    .from("products")
    .select("*")
    .ilike("name", `%${nameQuery}%`)
    .limit(1)
    .maybeSingle();

  if (byName) return byName;

  // 5. Smart fallback: match by primary keyword in slug
  const words = normalized.split("-").filter((w: string) => w.length > 3);
  if (words.length > 0) {
    const { data: byKeyword } = await supabase
      .from("products")
      .select("*")
      .ilike("slug", `%${words[0]}%`)
      .limit(1)
      .maybeSingle();
    if (byKeyword) return byKeyword;
  }

  return null;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.spectrasunglassess.in";
  const supabase = await createClient();
  const product = await findProduct(supabase, slug);

  if (!product) {
    return { title: "Product Not Found — SPECTRA" };
  }

  const title = `${product.name} — Luxury Polarized Sunglasses | SPECTRA`;
  const description =
    product.description ||
    `${product.name} by SPECTRA Eyewear. Premium handcrafted polarized sunglasses. Fast express delivery across Malappuram, Kerala & India.`;

  return {
    title,
    description,
    keywords: [
      product.name,
      `${product.name} sunglasses`,
      `${product.category} sunglasses kerala`,
      `${product.shape} sunglasses malappuram`,
      "spectra sunglasses",
      "luxury sunglasses kerala",
      "polarized eyewear india",
    ],
    alternates: {
      canonical: `${siteUrl}/products/${product.slug || slug}`,
    },
    openGraph: {
      title,
      description,
      url: `${siteUrl}/products/${product.slug || slug}`,
      siteName: "SPECTRA Luxury Eyewear",
      images: product.image_url ? [{ url: product.image_url, width: 800, height: 800, alt: product.name }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: product.image_url ? [product.image_url] : [],
    },
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.spectrasunglassess.in";
  const supabase = await createClient();
  const product = await findProduct(supabase, slug);

  if (!product) {
    notFound();
  }

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.image_url ? [product.image_url] : [],
    description: product.description || product.subtitle || "SPECTRA Luxury Handcrafted Eyewear",
    sku: `SPEC-${product.id.slice(0, 8).toUpperCase()}`,
    brand: {
      "@type": "Brand",
      name: "SPECTRA",
    },
    category: "Apparel & Accessories > Eyewear > Sunglasses",
    offers: {
      "@type": "Offer",
      url: `${siteUrl}/products/${slug}`,
      priceCurrency: "INR",
      price: product.price,
      priceValidUntil: "2027-12-31",
      itemCondition: "https://schema.org/NewCondition",
      availability: "https://schema.org/InStock",
      seller: {
        "@type": "Organization",
        name: "SPECTRA Luxury Eyewear Malappuram",
      },
    },
  };

  // Fetch related products in the same category
  const { data: relatedData } = await supabase
    .from("products")
    .select("id, name, subtitle, price, compare_price, image_url, images, slug, is_new, shape, category")
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
    images: Array.isArray(p.images) ? p.images : [],
    slug: p.slug,
    is_new: Boolean(p.is_new),
  }));

  return (
    <div className="bg-[#0a0a0a] min-h-screen">
      {/* Product JSON-LD Structured Data for Google Rich Snippets */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />

      <ProductDetailClient key={product.id} product={product} />

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
