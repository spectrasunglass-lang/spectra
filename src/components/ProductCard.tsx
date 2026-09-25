"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ShoppingBag, Bookmark } from "lucide-react";
import { useCart } from "./CartContext";
import { cldUrl, isCloudinaryUrl } from "@/lib/cldUrl";

export interface Product {
  id: string;
  name: string;
  subtitle?: string;
  price: number;
  compare_price?: number | null;
  image_url: string | null;
  images?: string[] | null;
  slug: string;
  is_new?: boolean;
  shape?: string;
  category?: string;
  stock_quantity?: number | null;
  color_variants?: unknown;
}

export interface ProductCardProps {
  id?: string;
  name?: string;
  subtitle?: string;
  price?: number;
  compare_price?: number | null;
  image_url?: string | null;
  images?: string[] | null;
  slug?: string;
  is_new?: boolean;
  shape?: string;
  category?: string;
  stock_quantity?: number | null;
  color_variants?: unknown;
  product?: Product;
  variant?: "default" | "classic";
  theme?: "dark" | "light";
}

const formatCurrency = (amount: number) =>
  `₹${amount.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export function ProductCard(props: ProductCardProps) {
  const p: Product = props.product || {
    id: props.id || "",
    name: props.name || "",
    subtitle: props.subtitle || "",
    price: props.price || 0,
    compare_price: props.compare_price,
    image_url: props.image_url || null,
    images: props.images || [],
    slug: props.slug || "",
    is_new: props.is_new,
    shape: props.shape,
    category: props.category,
    stock_quantity: props.stock_quantity ?? null,
    color_variants: props.color_variants ?? [],
  };

  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  // Extract secondary image for smooth hover flip if available
  const secondaryImage = (() => {
    const imgList = Array.isArray(p.images) ? p.images : [];
    if (imgList.length > 0) {
      const second = imgList.find(
        (img) => img && typeof img === "string" && img.trim() !== "" && img !== p.image_url
      );
      if (second) return second;
      if (imgList.length > 1 && imgList[1]) return imgList[1];
    }
    return null;
  })();

  const safeSlug = (p.slug || p.name || p.id)
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      id: p.id,
      name: p.name,
      subtitle: p.subtitle || "",
      price: p.price,
      image_url: p.image_url,
      slug: safeSlug,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const discount =
    p.compare_price && p.compare_price > p.price
      ? Math.round(((p.compare_price - p.price) / p.compare_price) * 100)
      : null;

  // ── Real Stock & Urgency Logic ──
  const stock: number | null = (() => {
    if (typeof p.stock_quantity === "number") return p.stock_quantity;
    if (Array.isArray(p.color_variants) && p.color_variants.length > 0) {
      const first = p.color_variants[0] as { stock_quantity?: number };
      if (typeof first?.stock_quantity === "number") return first.stock_quantity;
    }
    return null;
  })();

  const isOutOfStock = stock !== null && stock <= 0;
  const isLowStock = stock !== null && stock > 0 && stock <= 5;
  const isNew = Boolean(p.is_new);

  const isLight = props.theme === "light";

  return (
    <Link href={`/products/${safeSlug}`} scroll={true} className="group block h-full select-none">
      <div className="relative flex flex-col h-full bg-transparent transition-all duration-200">
        {/* Product Image Area with clean border box */}
        <div className="relative aspect-square w-full bg-white border border-gray-200 rounded-sm overflow-hidden flex items-center justify-center p-3 sm:p-5 group-hover:border-[#c8874a]/50 group-hover:shadow-sm transition-all duration-200">
          {p.image_url ? (
            <>
              <Image
                src={cldUrl(p.image_url, 800)}
                alt={p.name}
                fill
                unoptimized={isCloudinaryUrl(p.image_url)}
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className={`object-contain p-2 sm:p-3 transition-all duration-500 ease-out ${
                  secondaryImage
                    ? "group-hover:opacity-0 group-hover:scale-105"
                    : "group-hover:scale-105"
                }`}
              />
              {secondaryImage && (
                <Image
                  src={cldUrl(secondaryImage, 800)}
                  alt={`${p.name} alternate view`}
                  fill
                  unoptimized={isCloudinaryUrl(secondaryImage)}
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="object-contain p-2 sm:p-3 absolute inset-0 opacity-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500 ease-out"
                />
              )}
            </>
          ) : (
            <div className="flex items-center justify-center w-full h-full bg-neutral-50 text-neutral-300">
              <ShoppingBag size={32} />
            </div>
          )}

          {/* Badges ("badges needed bro") */}
          <div className="absolute top-2.5 left-2.5 z-10 flex items-center gap-1.5 flex-wrap">
            {isOutOfStock ? (
              <span className="text-[8.5px] sm:text-[9px] font-extrabold px-1.5 py-0.5 bg-neutral-900 text-white rounded-[2px] uppercase tracking-wider">
                OUT OF STOCK
              </span>
            ) : isLowStock ? (
              <span className="text-[8.5px] sm:text-[9px] font-extrabold px-1.5 py-0.5 bg-[#b93828] text-white rounded-[2px] uppercase tracking-wider">
                {stock === 1 ? "ONLY 1 LEFT" : `ONLY ${stock} LEFT`}
              </span>
            ) : (
              <>
                {isNew && (
                  <span className="text-[8.5px] sm:text-[9px] font-bold tracking-[0.15em] px-1.5 py-0.5 bg-[#c8874a] text-white rounded-[2px] uppercase">
                    NEW
                  </span>
                )}
                {discount ? (
                  <span className="text-[8.5px] sm:text-[9px] font-bold px-1.5 py-0.5 bg-red-600 text-white rounded-[2px] shadow-sm">
                    -{discount}%
                  </span>
                ) : null}
              </>
            )}
          </div>

          {/* Add to Cart / Save to List slide-up button on hover */}
          <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-20">
            {isOutOfStock ? (
              <button
                disabled
                className="w-full py-2.5 sm:py-3 flex items-center justify-center gap-2 text-[10.5px] sm:text-[11px] font-bold tracking-wider uppercase bg-neutral-800 text-neutral-400 cursor-not-allowed rounded-none"
              >
                Out of Stock
              </button>
            ) : (
              <button
                onClick={handleAddToCart}
                className={`w-full py-2.5 sm:py-3 flex items-center justify-center gap-2 text-[10.5px] sm:text-[11px] font-bold tracking-wider uppercase transition-all duration-200 shadow-md rounded-none ${
                  added
                    ? "bg-emerald-600 text-white"
                    : "bg-[#0a0a0a] text-white hover:bg-[#c8874a]"
                }`}
              >
                {added ? (
                  <>
                    <Bookmark size={14} className="fill-white" /> Saved to List!
                  </>
                ) : (
                  <>
                    <Bookmark size={14} /> Save to List
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Product Details Section Below Image — Free and borderless on the page */}
        <div className="pt-3 pb-1 flex flex-col">
          <h3
            className={`text-[12.5px] sm:text-[13.5px] font-bold uppercase tracking-tight leading-snug line-clamp-1 transition-colors ${
              isLight
                ? "text-neutral-900 group-hover:text-[#c8874a]"
                : "text-white group-hover:text-[#c8874a]"
            }`}
          >
            {p.name}
          </h3>

          {/* Price: Strikethrough compare price + Bold Red Sale Price */}
          <div className="flex items-center gap-2 sm:gap-2.5 mt-1.5 flex-wrap">
            {p.compare_price && p.compare_price > p.price ? (
              <>
                <span className="text-[11.5px] sm:text-[12.5px] text-neutral-400 line-through font-normal">
                  {formatCurrency(p.compare_price)}
                </span>
                <span
                  className={`text-[12.5px] sm:text-[13.5px] font-bold ${
                    isLight ? "text-[#c92a2a]" : "text-[#ff4d4d]"
                  }`}
                >
                  {formatCurrency(p.price)}
                </span>
              </>
            ) : (
              <span
                className={`text-[12.5px] sm:text-[13.5px] font-bold ${
                  isLight ? "text-neutral-900" : "text-white"
                }`}
              >
                {formatCurrency(p.price)}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

export default ProductCard;
