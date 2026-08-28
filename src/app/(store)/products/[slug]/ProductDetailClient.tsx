"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/components/CartContext";
import {
  ShoppingBag,
  Zap,
  ShieldCheck,
  Truck,
  RefreshCw,
  ChevronDown,
  Check,
  Heart,
  Share2,
  Sparkles
} from "lucide-react";

interface ProductData {
  id: string;
  name: string;
  subtitle?: string | null;
  description?: string | null;
  price: number;
  compare_price?: number | null;
  image_url: string;
  gallery_urls?: string[] | null;
  category?: string | null;
  shape?: string | null;
  frame_color?: string | null;
  lens_color?: string | null;
  material?: string | null;
  sku?: string | null;
  stock_quantity?: number | null;
  is_new?: boolean | null;
}

export default function ProductDetailClient({ product }: { product: ProductData }) {
  const { addItem } = useCart();
  const [selectedImage, setSelectedImage] = useState(product.image_url);
  const [added, setAdded] = useState(false);
  const [activeTab, setActiveTab] = useState<string | null>("details");

  const images = [product.image_url, ...(product.gallery_urls || [])].filter(Boolean);

  const discountPercent =
    product.compare_price && product.compare_price > product.price
      ? Math.round(((product.compare_price - product.price) / product.compare_price) * 100)
      : null;

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: Number(product.price),
      image_url: product.image_url,
      quantity: 1,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  const toggleTab = (tab: string) => {
    setActiveTab((prev) => (prev === tab ? null : tab));
  };

  return (
    <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-10 sm:py-16">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-[11px] text-neutral-500 uppercase tracking-widest mb-8">
        <Link href="/" className="hover:text-white transition-colors">Home</Link>
        <span>/</span>
        <Link href="/sunglasses" className="hover:text-white transition-colors">Sunglasses</Link>
        <span>/</span>
        <span className="text-[#c8874a] font-bold truncate max-w-[200px]">{product.name}</span>
      </nav>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
        
        {/* Left: Media Gallery (7 cols on lg) */}
        <div className="lg:col-span-7 flex flex-col-reverse sm:flex-row gap-4">
          
          {/* Thumbnails list */}
          {images.length > 1 && (
            <div className="flex sm:flex-col gap-3 overflow-x-auto sm:overflow-y-auto max-h-[540px] scrollbar-none">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-[#f5f0eb] border-2 transition-all flex-shrink-0 cursor-pointer ${
                    selectedImage === img ? "border-[#c8874a] shadow-md shadow-[#c8874a]/20 scale-95" : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                >
                  <Image src={img} alt={`${product.name} thumbnail ${idx + 1}`} fill className="object-contain p-2" sizes="80px" />
                </button>
              ))}
            </div>
          )}

          {/* Main Large Image Studio White Showcase */}
          <div className="relative flex-1 aspect-square sm:aspect-[4/4.5] max-h-[580px] bg-white rounded-3xl overflow-hidden border border-white/[0.08] shadow-2xl flex items-center justify-center p-8 group">
            {product.is_new && (
              <span className="absolute top-5 left-5 bg-black text-white text-[10px] font-bold tracking-[0.2em] uppercase px-3 py-1.5 rounded-full z-10">
                NEW RELEASE
              </span>
            )}
            {discountPercent && (
              <span className="absolute top-5 right-5 bg-[#c8874a] text-white text-[10px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-full z-10">
                -{discountPercent}%
              </span>
            )}

            <Image
              src={selectedImage}
              alt={product.name}
              fill
              priority
              className="object-contain p-6 sm:p-10 group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 1024px) 100vw, 60vw"
            />
          </div>
        </div>

        {/* Right: Product Details & Actions (5 cols on lg) */}
        <div className="lg:col-span-5 space-y-6">
          <div>
            <div className="flex items-center gap-2 text-[10.5px] font-bold tracking-[0.25em] text-[#c8874a] uppercase mb-2">
              <Sparkles size={13} />
              <span>{product.category || "Unisex"} • {product.shape || "Eyewear"}</span>
            </div>

            <h1 className="font-stencil text-3xl sm:text-4xl text-white tracking-wider uppercase">
              {product.name}
            </h1>

            {product.subtitle && (
              <p className="text-neutral-400 text-[13.5px] mt-1.5">
                {product.subtitle}
              </p>
            )}
          </div>

          {/* Price Card */}
          <div className="flex items-baseline gap-3.5 pb-4 border-b border-white/[0.08]">
            <span className="text-3xl font-bold text-white tracking-tight">
              ₹{Number(product.price).toLocaleString("en-IN")}
            </span>
            {product.compare_price && product.compare_price > product.price && (
              <>
                <span className="text-lg text-neutral-500 line-through">
                  ₹{Number(product.compare_price).toLocaleString("en-IN")}
                </span>
                <span className="text-[12px] font-bold text-[#c8874a]">
                  Save {discountPercent}%
                </span>
              </>
            )}
          </div>

          {/* Quick Specs Pills */}
          <div className="grid grid-cols-2 gap-2 text-[11.5px] text-neutral-300">
            {product.material && (
              <div className="bg-[#141414] border border-white/[0.06] rounded-xl px-3.5 py-2">
                <span className="text-neutral-500 block text-[9.5px] uppercase font-bold tracking-wider">Material</span>
                <span className="font-semibold text-white capitalize">{product.material}</span>
              </div>
            )}
            {product.lens_color && (
              <div className="bg-[#141414] border border-white/[0.06] rounded-xl px-3.5 py-2">
                <span className="text-neutral-500 block text-[9.5px] uppercase font-bold tracking-wider">Lens Tone</span>
                <span className="font-semibold text-white capitalize">{product.lens_color}</span>
              </div>
            )}
          </div>

          {/* Add to Cart / Buy Now CTAs */}
          <div className="space-y-3 pt-2">
            <button
              type="button"
              onClick={handleAddToCart}
              className={`w-full py-4 rounded-xl font-bold text-[12px] uppercase tracking-[0.18em] flex items-center justify-center gap-2 transition-all shadow-xl cursor-pointer ${
                added
                  ? "bg-emerald-600 text-white shadow-emerald-900/30"
                  : "bg-[#c8874a] hover:bg-[#b87840] text-white shadow-[#c8874a]/25 hover:shadow-[#c8874a]/40"
              }`}
            >
              {added ? (
                <>
                  <Check size={16} /> Added to Cart
                </>
              ) : (
                <>
                  <ShoppingBag size={16} /> Add to Bag
                </>
              )}
            </button>

            <Link
              href="/cart"
              onClick={handleAddToCart}
              className="w-full py-4 rounded-xl font-bold text-[12px] uppercase tracking-[0.18em] flex items-center justify-center gap-2 bg-white text-black hover:bg-neutral-200 transition-colors shadow-lg cursor-pointer"
            >
              <Zap size={16} /> Buy Now
            </Link>
          </div>

          {/* Guarantee Badges */}
          <div className="bg-[#121212] border border-white/[0.06] rounded-2xl p-4 space-y-3 text-[12px] text-neutral-300">
            <div className="flex items-center gap-3">
              <Truck size={16} className="text-[#c8874a]" />
              <span>Complimentary express delivery across India</span>
            </div>
            <div className="flex items-center gap-3">
              <RefreshCw size={16} className="text-[#c8874a]" />
              <span>14-day effortless home exchange & returns</span>
            </div>
            <div className="flex items-center gap-3">
              <ShieldCheck size={16} className="text-[#c8874a]" />
              <span>100% Certified UV400 optical protection</span>
            </div>
          </div>

          {/* Accordion Sections */}
          <div className="border-t border-white/[0.08] pt-4 space-y-3">
            {/* Description Tab */}
            <div className="border-b border-white/[0.06] pb-3">
              <button
                onClick={() => toggleTab("details")}
                className="w-full flex items-center justify-between py-2 text-[12px] font-bold uppercase tracking-wider text-white hover:text-[#c8874a] transition-colors cursor-pointer"
              >
                <span>Frame Description & Optics</span>
                <ChevronDown size={16} className={`transition-transform duration-200 ${activeTab === "details" ? "rotate-180 text-[#c8874a]" : ""}`} />
              </button>
              {activeTab === "details" && (
                <div className="pt-2 text-neutral-400 text-[13px] leading-relaxed space-y-2">
                  <p>{product.description || "Masterfully designed with premium lightweight craftsmanship and scratch-resistant optical coating. Tailored for all-day comfort and glare-free clarity."}</p>
                </div>
              )}
            </div>

            {/* Packaging Tab */}
            <div className="border-b border-white/[0.06] pb-3">
              <button
                onClick={() => toggleTab("packaging")}
                className="w-full flex items-center justify-between py-2 text-[12px] font-bold uppercase tracking-wider text-white hover:text-[#c8874a] transition-colors cursor-pointer"
              >
                <span>What&apos;s In The Box</span>
                <ChevronDown size={16} className={`transition-transform duration-200 ${activeTab === "packaging" ? "rotate-180 text-[#c8874a]" : ""}`} />
              </button>
              {activeTab === "packaging" && (
                <div className="pt-2 text-neutral-400 text-[13px] leading-relaxed space-y-1.5">
                  <p>• 1x SPECTRA Handcrafted Eyewear</p>
                  <p>• 1x Signature Matte-Black Hardcase</p>
                  <p>• 1x High-Density Microfiber Cleaning Cloth</p>
                  <p>• 1x Authenticity & Warranty Card</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
