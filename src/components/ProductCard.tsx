"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ShoppingBag, Check } from "lucide-react";
import { useCart } from "./CartContext";

export interface Product {
  id: string;
  name: string;
  subtitle?: string;
  price: number;
  compare_price?: number | null;
  image_url: string | null;
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
  slug?: string;
  is_new?: boolean;
  shape?: string;
  category?: string;
  product?: Product;
}

export function ProductCard(props: ProductCardProps) {
  const p: Product = props.product || {
    id: props.id || "",
    name: props.name || "",
    subtitle: props.subtitle || "",
    price: props.price || 0,
    compare_price: props.compare_price,
    image_url: props.image_url || null,
    slug: props.slug || "",
    is_new: props.is_new,
    shape: props.shape,
    category: props.category,
  };

  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      id: p.id,
      name: p.name,
      subtitle: p.subtitle || "",
      price: p.price,
      image_url: p.image_url,
      slug: p.slug,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  // Determine badge text and background
  const isLowStock = !p.is_new && p.compare_price && p.compare_price > p.price;
  const isNew = Boolean(p.is_new);

  // Determine top category / shape label (e.g. OVAL / M, RECTANGLE / M)
  const tagLabel = p.shape
    ? `${p.shape.toUpperCase()} / M`
    : p.category
    ? `${p.category.toUpperCase()} / M`
    : "OVAL / M";

  return (
    <Link href={`/products/${p.slug}`} className="group block h-full select-none">
      <div className="relative flex flex-col h-full bg-white transition-all duration-200">
        
        {/* Product Image Box */}
        <div className="relative aspect-square w-full bg-white overflow-hidden flex items-center justify-center p-4 sm:p-6 border border-neutral-100 rounded-sm">
          {p.image_url ? (
            <Image
              src={p.image_url}
              alt={p.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-contain p-2 sm:p-4 transition-transform duration-300 ease-out group-hover:scale-105"
            />
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

          {/* Bottom Variant / Carousel Indicator Dots */}
          <div className="absolute bottom-2.5 inset-x-0 flex items-center justify-center gap-1 pointer-events-none">
            <span className="w-3.5 h-[3px] rounded-full bg-[#d27558]" />
            <span className="w-[3.5px] h-[3.5px] rounded-full bg-neutral-300" />
            <span className="w-[3.5px] h-[3.5px] rounded-full bg-neutral-300" />
            <span className="w-[3.5px] h-[3.5px] rounded-full bg-neutral-300" />
            <span className="w-[3.5px] h-[3.5px] rounded-full bg-neutral-300" />
          </div>

          {/* Quick Add To Cart Floating Action (Bottom Right) */}
          <button
            onClick={handleAddToCart}
            aria-label="Add to cart"
            className={`absolute bottom-2.5 right-2.5 z-10 w-7 h-7 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-sm ${
              added
                ? "bg-emerald-600 text-white"
                : "bg-black/5 hover:bg-black text-neutral-500 hover:text-white backdrop-blur-sm"
            }`}
          >
            {added ? <Check size={12} className="stroke-[2.5]" /> : <ShoppingBag size={12} />}
          </button>
        </div>

        {/* Product Details Section Below Image */}
        <div className="pt-2.5 pb-1 px-0.5 flex flex-col flex-1 justify-between">
          <div>
            <p className="text-[9px] sm:text-[9.5px] font-semibold tracking-wider text-neutral-400 uppercase mb-0.5">
              {tagLabel}
            </p>
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
