"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ShoppingBag, Check } from "lucide-react";
import { useCart } from "./CartContext";

export interface Product {
  id: string;
  name: string;
  subtitle: string;
  price: number;
  compare_price?: number | null;
  image_url: string | null;
  slug: string;
  is_new?: boolean;
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
  };

  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      id: p.id,
      name: p.name,
      subtitle: p.subtitle,
      price: p.price,
      image_url: p.image_url,
      slug: p.slug,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const discount =
    p.compare_price && p.compare_price > p.price
      ? Math.round(((p.compare_price - p.price) / p.compare_price) * 100)
      : null;

  return (
    <Link href={`/products/${p.slug}`} className="group block h-full">
      <div className="relative flex flex-col h-full overflow-hidden rounded-2xl bg-white border border-neutral-200/80 hover:border-[#c8874a]/60 transition-all duration-300 hover:shadow-xl hover:shadow-black/[0.06] hover:-translate-y-1">
        {/* Product Image Area */}
        <div className="relative aspect-square w-full bg-white overflow-hidden flex items-center justify-center p-6 border-b border-neutral-100">
          {p.image_url ? (
            <Image
              src={p.image_url}
              alt={p.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-contain p-4 transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full bg-neutral-50 text-neutral-300">
              <ShoppingBag size={36} />
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
            {p.is_new && (
              <span className="text-[9px] font-bold tracking-[0.15em] px-2 py-0.5 bg-[#c8874a] text-white rounded-md uppercase shadow-sm">
                NEW
              </span>
            )}
            {discount && (
              <span className="text-[9px] font-bold px-2 py-0.5 bg-red-600 text-white rounded-md shadow-sm">
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
                  <Check size={14} /> Added to Cart!
                </>
              ) : (
                <>
                  <ShoppingBag size={14} /> Add to Cart
                </>
              )}
            </button>
          </div>
        </div>

        {/* Product Details */}
        <div className="p-4 flex flex-col flex-1 justify-between bg-white">
          <div>
            <h3 className="text-[13px] font-bold text-neutral-900 truncate group-hover:text-[#c8874a] transition-colors uppercase tracking-wide">
              {p.name}
            </h3>
            <p className="text-[11px] text-neutral-500 mt-0.5 truncate">
              {p.subtitle || "Handcrafted Luxury"}
            </p>
          </div>

          <div className="flex items-center gap-2 mt-3 pt-2 border-t border-neutral-100/80">
            <span className="text-[14px] font-bold text-neutral-900">
              &#8377;{p.price.toLocaleString("en-IN")}
            </span>
            {p.compare_price && p.compare_price > p.price && (
              <span className="text-[12px] text-neutral-400 line-through">
                &#8377;{p.compare_price.toLocaleString("en-IN")}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

export default ProductCard;
