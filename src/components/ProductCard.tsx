"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ShoppingBag, Check, Bookmark } from "lucide-react";
import { useCart } from "./CartContext";

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
  product?: Product;
  variant?: "default" | "classic";
}

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
  };

  const variant = props.variant || "default";
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

  // ── CLASSIC / OLD STYLE (Used in New Arrivals) ──
  if (variant === "classic") {
    return (
      <Link href={`/products/${safeSlug}`} scroll={true} className="group block h-full border">
        <div className="relative flex flex-col border border-gray-200 h-full overflow-hidden rounded-md bg-white ">
          {/* Product Image Area */}
          <div className="relative aspect-square w-full bg-white overflow-hidden flex items-center justify-center p-6">
            {p.image_url ? (
              <>
                <Image
                  src={p.image_url}
                  alt={p.name}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className={`object-contain p-4 transition-all duration-500 ease-out ${
                    secondaryImage
                      ? "group-hover:opacity-0 group-hover:scale-105"
                      : "group-hover:scale-105"
                  }`}
                />
                {secondaryImage && (
                  <Image
                    src={secondaryImage}
                    alt={`${p.name} alternate view`}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-contain p-4 absolute inset-0 opacity-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500 ease-out"
                  />
                )}
              </>
            ) : (
              <div className="flex items-center justify-center w-full h-full bg-neutral-50 text-neutral-300">
                <ShoppingBag size={36} />
              </div>
            )}

            {/* Badges */}
            <div className="absolute top-3 left-3 flex items-center gap-1.5 z-10">
              {p.is_new && (
                <span className="text-[9px] font-bold tracking-[0.15em] px-2 py-0.5 bg-[#c8874a] text-white rounded-sm uppercase ">
                  NEW
                </span>
              )}
              {discount && (
                <span className="text-[9px] font-bold px-2 py-0.5 bg-red-600 text-white rounded-sm shadow-sm">
                  -{discount}%
                </span>
              )}
            </div>

            {/* Add to Cart slide-up button on hover */}
            <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-20">
              <button
                onClick={handleAddToCart}
                className={`w-full py-3 flex items-center justify-center gap-2 text-[11px] font-bold tracking-wider uppercase transition-all duration-200 shadow-md ${
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
            </div>
          </div>

          {/* Product Info */}
          <div className="p-4 flex flex-col flex-grow justify-between bg-white">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-neutral-400 font-semibold mb-1">
                {p.subtitle || "Spectra Eyewear"}
              </p>
              <h3 className="font-semibold text-neutral-900 text-sm tracking-tight leading-snug line-clamp-1 group-hover:text-[#c8874a] transition-colors">
                {p.name}
              </h3>
            </div>

            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-base font-bold text-neutral-900">
                &#8377;{p.price.toLocaleString("en-IN")}
              </span>
              {p.compare_price && p.compare_price > p.price && (
                <span className="text-xs text-neutral-400 line-through">
                  &#8377;{p.compare_price.toLocaleString("en-IN")}
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // ── DEFAULT NEW MODERN MINIMAL STYLE ──
  const isLowStock = !p.is_new && p.compare_price && p.compare_price > p.price;
  const isNew = Boolean(p.is_new);

  const tagLabel = p.shape
    ? `${p.shape.toUpperCase()} / M`
    : p.category
    ? `${p.category.toUpperCase()} / M`
    : null;

  return (
    <Link href={`/products/${safeSlug}`} scroll={true} className="group block h-full select-none">
      <div className="relative flex flex-col h-full bg-white transition-all duration-200">
        
        {/* Product Image Box */}
        <div className="relative aspect-square w-full bg-white overflow-hidden flex items-center justify-center p-4 sm:p-6 rounded-none border border-b-0 border-gray-200">
          {p.image_url ? (
            <>
              <Image
                src={p.image_url}
                alt={p.name}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className={`object-contain p-2 sm:p-4 transition-all duration-500 ease-out ${
                  secondaryImage
                    ? "group-hover:opacity-0 group-hover:scale-105"
                    : "group-hover:scale-105"
                }`}
              />
              {secondaryImage && (
                <Image
                  src={secondaryImage}
                  alt={`${p.name} alternate view`}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="object-contain p-2 sm:p-4 absolute inset-0 opacity-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500 ease-out"
                />
              )}
            </>
          ) : (
            <div className="flex items-center justify-center w-full h-full bg-neutral-50 text-neutral-300">
              <ShoppingBag size={32} />
            </div>
          )}

          {/* Top Left Badge: LOW STOCK / NEW */}
          {isNew ? (
            <div className="absolute top-2.5 left-2.5 z-10">
              <span className="text-[8px] sm:text-[8.5px] font-extrabold px-1.5 py-0.5 bg-black text-white rounded-[2px] uppercase tracking-wider">
                NEW
              </span>
            </div>
          ) : isLowStock ? (
            <div className="absolute top-2.5 left-2.5 z-10">
              <span className="text-[8px] sm:text-[8.5px] font-extrabold px-1.5 py-0.5 bg-[#b93828] text-white rounded-[2px] uppercase tracking-wider">
                LOW STOCK
              </span>
            </div>
          ) : null}

          {/* Add to Cart slide-up button on hover */}
          <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-20">
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
          </div>
        </div>

        {/* Product Details Section Below Image */}
        <div className="pt-2.5 pb-2.5 px-2 flex flex-col flex-1 justify-between border border-t-0 border-gray-200">
          <div>
            {tagLabel && (
              <p className="text-[9px] sm:text-[9.5px] font-semibold tracking-wider text-neutral-400 uppercase mb-0.5">
                {tagLabel}
              </p>
            )}
            <h3 className="text-[11.5px] sm:text-[12px] font-bold text-neutral-900 leading-snug line-clamp-1 group-hover:text-[#c8874a] transition-colors">
              {p.name}
            </h3>
          </div>

          {/* Price */}
          <div className="flex items-baseline mt-1">
            <span className="text-[12.5px] sm:text-[13px] font-extrabold text-neutral-950">
              Rs. {p.price.toLocaleString("en-IN")}
            </span>
            {p.compare_price && p.compare_price > p.price && (
              <span className="text-[11px] text-neutral-400 line-through ml-2 font-normal">
                Rs. {p.compare_price.toLocaleString("en-IN")}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

export default ProductCard;
