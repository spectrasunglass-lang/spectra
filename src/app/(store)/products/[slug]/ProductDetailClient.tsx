"use client";

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/components/CartContext";
import GiftPackageSelector from "@/components/GiftPackageSelector";
import { GiftPackage } from "@/lib/giftPackages";
import { normalizeProductColorVariants, ProductColorVariant } from "@/lib/productColors";
import {
  Zap,
  ShieldCheck,
  Truck,
  RefreshCw,
  ChevronDown,
  Bookmark,
  Maximize2,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  X,
  Star,
} from "lucide-react";
import ProductReviews from "@/components/ProductReviews";

interface ProductData {
  id: string;
  name: string;
  slug?: string | null;
  subtitle?: string | null;
  description?: string | null;
  price: number;
  compare_price?: number | null;
  image_url: string;
  images?: string[] | null;
  gallery_urls?: string[] | null;
  category?: string | null;
  shape?: string | null;
  frame_color?: string | null;
  lens_color?: string | null;
  material?: string | null;
  sku?: string | null;
  stock_quantity?: number | null;
  is_new?: boolean | null;
  color_variants?: unknown;
  whats_in_the_box?: string | string[] | null;
}

export default function ProductDetailClient({ product }: { product: ProductData }) {
  const { addItem } = useCart();
  const colorVariants = useMemo(
    () => normalizeProductColorVariants(product.color_variants),
    [product.color_variants]
  );
  const [selectedColorId, setSelectedColorId] = useState<string | null>(colorVariants[0]?.id || null);
  const selectedColor = colorVariants.find((variant) => variant.id === selectedColorId) || null;
  const [selectedImage, setSelectedImage] = useState(
    colorVariants[0]?.image_url || product.image_url
  );
  const [added, setAdded] = useState(false);
  const [activeTab, setActiveTab] = useState<string | null>("details");
  const [selectedGiftPackage, setSelectedGiftPackage] = useState<GiftPackage | null>(null);

  // Auto scroll to top when product loads or switches
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [product.id]);

  const images = useMemo(() => {
    const rawImages = [
      product.image_url,
      ...(Array.isArray(product.images) ? product.images : []),
      ...(Array.isArray(product.gallery_urls) ? product.gallery_urls : []),
      ...colorVariants.map((variant) => variant.image_url),
    ].filter(Boolean) as string[];

    return Array.from(new Set(rawImages));
  }, [product.image_url, product.images, product.gallery_urls, colorVariants]);

  const discountPercent =
    product.compare_price && product.compare_price > product.price
      ? Math.round(((product.compare_price - product.price) / product.compare_price) * 100)
      : null;

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      slug: product.slug || product.id,
      price: Number(product.price),
      image_url: selectedColor?.image_url || product.image_url,
      subtitle: product.subtitle || "",
      color: selectedColor ? { id: selectedColor.id, name: selectedColor.name } : null,
      gift_package: selectedGiftPackage
        ? {
            id: selectedGiftPackage.id,
            name: selectedGiftPackage.name,
            price: Number(selectedGiftPackage.price),
            image_url: selectedGiftPackage.image_url || undefined,
          }
        : null,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  const selectColor = (variant: ProductColorVariant) => {
    setSelectedColorId(variant.id);
    setSelectedImage(variant.image_url);
  };

  const toggleTab = (tab: string) => {
    setActiveTab((prev) => (prev === tab ? null : tab));
  };

  // Image zoom, mobile drag & lightbox states
  const [isZooming, setIsZooming] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxZoom, setLightboxZoom] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchDeltaX, setTouchDeltaX] = useState(0);
  const imageContainerRef = useRef<HTMLDivElement>(null);

  const activeImageIndex = Math.max(0, images.indexOf(selectedImage));

  const showNextImage = useCallback((e?: React.MouseEvent | React.TouchEvent) => {
    e?.stopPropagation();
    if (images.length <= 1) return;
    const nextIdx = (activeImageIndex + 1) % images.length;
    setSelectedImage(images[nextIdx]);
  }, [activeImageIndex, images]);

  const showPrevImage = useCallback((e?: React.MouseEvent | React.TouchEvent) => {
    e?.stopPropagation();
    if (images.length <= 1) return;
    const prevIdx = (activeImageIndex - 1 + images.length) % images.length;
    setSelectedImage(images[prevIdx]);
  }, [activeImageIndex, images]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageContainerRef.current) return;
    const { left, top, width, height } = imageContainerRef.current.getBoundingClientRect();
    const x = Math.min(Math.max(((e.clientX - left) / width) * 100, 0), 100);
    const y = Math.min(Math.max(((e.clientY - top) / height) * 100, 0), 100);
    setZoomPosition({ x, y });
  };

  const handleMouseEnter = () => {
    setIsZooming(true);
  };

  const handleMouseLeave = () => {
    setIsZooming(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
    setTouchDeltaX(0);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    setTouchDeltaX(e.touches[0].clientX - touchStartX);
  };

  const handleTouchEnd = () => {
    if (touchStartX === null) return;
    const swipeThreshold = 40;
    if (touchDeltaX < -swipeThreshold && images.length > 1) {
      showNextImage();
    } else if (touchDeltaX > swipeThreshold && images.length > 1) {
      showPrevImage();
    }
    setTouchStartX(null);
    setTouchDeltaX(0);
  };

  useEffect(() => {
    if (!isLightboxOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsLightboxOpen(false);
      if (e.key === "ArrowRight") showNextImage();
      if (e.key === "ArrowLeft") showPrevImage();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLightboxOpen, showNextImage, showPrevImage]);

  // Parse description into Frame Description & Optics and What's In The Box
  const rawDescription = product.description || "";
  let frameDescription = rawDescription;
  let customBoxItems: string[] = [];

  if (rawDescription.includes("---WHATS_IN_THE_BOX---")) {
    const parts = rawDescription.split("---WHATS_IN_THE_BOX---");
    frameDescription = parts[0]?.trim() || "";
    const boxContent = parts[1]?.trim() || "";
    if (boxContent) {
      customBoxItems = boxContent
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean);
    }
  }

  if (product.whats_in_the_box) {
    const rawBox = product.whats_in_the_box;
    customBoxItems = typeof rawBox === "string" 
      ? rawBox.split("\n").map((l: string) => l.trim()).filter(Boolean)
      : Array.isArray(rawBox) ? rawBox : customBoxItems;
  }

  const defaultBoxItems = [
    "• 1x SPECTRA Handcrafted Eyewear",
    "• 1x Signature Matte-Black Hardcase",
    "• 1x High-Density Microfiber Cleaning Cloth",
    "• 1x Authenticity & Warranty Card"
  ];

  const boxItemsToDisplay = customBoxItems.length > 0 ? customBoxItems : defaultBoxItems;

  return (
    <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-10 sm:py-5">

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

          {/* Main Large Image Studio White Showcase with Desktop Hover Zoom & Mobile Swipe */}
          <div
            ref={imageContainerRef}
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onClick={() => setIsLightboxOpen(true)}
            className="relative flex-1 aspect-square sm:aspect-[4/4.5] max-h-[580px] bg-white rounded-sm overflow-hidden border border-white/[0.08] shadow-2xl flex items-center justify-center p-6 sm:p-10 group cursor-zoom-in select-none"
          >
            {product.is_new && (
              <span className="absolute top-5 left-5 bg-black text-white text-[10px] font-bold tracking-[0.2em] uppercase px-3 py-1.5 rounded-full z-10 pointer-events-none">
                NEWLY ADDED
              </span>
            )}
            {discountPercent && (
              <span className="absolute top-5 right-5 bg-[#c8874a] text-white text-[10px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-full z-10 pointer-events-none">
                -{discountPercent}%
              </span>
            )}

            {/* Desktop Zoomable Inner Image */}
            <div
              className="relative w-full h-full flex items-center justify-center pointer-events-none"
              style={{
                transform: isZooming ? "scale(2.5)" : "scale(1)",
                transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                transition: isZooming ? "transform 0.08s ease-out" : "transform 0.35s cubic-bezier(0.2, 0, 0, 1)",
              }}
            >
              <Image
                src={selectedImage}
                alt={product.name}
                fill
                priority
                className="object-contain p-4 sm:p-8"
                sizes="(max-width: 1024px) 100vw, 60vw"
              />
            </div>

            {/* Mobile Swipe / Arrow Controls */}
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={showPrevImage}
                  className="sm:hidden absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center backdrop-blur-md z-20 shadow-md cursor-pointer"
                  aria-label="Previous image"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  type="button"
                  onClick={showNextImage}
                  className="sm:hidden absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center backdrop-blur-md z-20 shadow-md cursor-pointer"
                  aria-label="Next image"
                >
                  <ChevronRight size={18} />
                </button>

                {/* Mobile Drag Dot Indicators */}
                <div className="sm:hidden absolute bottom-3.5 inset-x-0 flex items-center justify-center gap-1.5 z-20 pointer-events-none">
                  {images.map((_, i) => (
                    <span
                      key={i}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        i === activeImageIndex ? "w-5 bg-[#c8874a]" : "w-1.5 bg-neutral-300"
                      }`}
                    />
                  ))}
                </div>
              </>
            )}

            {/* Full View Button */}
            <div className="absolute bottom-3.5 right-3.5 z-20 flex items-center gap-1.5 bg-black/70 hover:bg-black text-white text-[10px] font-bold tracking-wider uppercase px-2.5 py-1.5 rounded-full backdrop-blur-md transition-all shadow-md">
              <Maximize2 size={12} />
              <span className="hidden sm:inline">Full View</span>
            </div>

            {/* Desktop Hover Zoom Hint */}
            {!isZooming && (
              <div className="hidden md:flex absolute bottom-3.5 left-3.5 z-20 items-center gap-1.5 bg-white/90 text-neutral-700 text-[10px] font-semibold px-2.5 py-1 rounded-full backdrop-blur-sm pointer-events-none border border-neutral-200 shadow-sm">
                <ZoomIn size={11} className="text-[#c8874a]" />
                Hover to zoom
              </div>
            )}
          </div>
        </div>

        {/* Right: Product Details & Actions (5 cols on lg) */}
        <div className="lg:col-span-5 space-y-6">
          <div>
            <div className="flex items-center gap-2 text-[10.5px] font-bold tracking-[0.25em] text-[#c8874a] uppercase mb-2">
              <span>{product.category || "Unisex"} • {product.shape || "Eyewear"}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl text-white tracking-wider uppercase">
              {product.name}
            </h1>

            {product.subtitle && (
              <p className="text-neutral-400 text-[13.5px] mt-1.5">
                {product.subtitle}
              </p>
            )}

            {/* Review Stars & Verified Rating Snippet */}
            <a
              href="#reviews"
              className="inline-flex items-center gap-2 mt-2.5 text-[12px] text-neutral-300 hover:text-white transition-colors group cursor-pointer"
            >
              <div className="flex items-center gap-0.5 text-[#c8874a]">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} size={13} className="fill-[#c8874a] text-[#c8874a]" />
                ))}
              </div>
              <span className="font-semibold text-white group-hover:underline">
                4.9 <span className="text-neutral-500 font-normal">• Verified Client Reviews</span>
              </span>
            </a>
          </div>

          {/* Price Card */}
          <div className="flex items-baseline gap-3.5 pb-4 border-b border-white/[0.08]">
            <span className="text-3xl text-white tracking-tight">
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

          {/* Colour selector */}
          {colorVariants.length > 0 && (
            <div className="rounded-xl border border-white/[0.07] bg-[#121212] p-4">
              <div className="mb-3 flex items-baseline justify-between gap-3">
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/75">
                  Colour
                </p>
                <p className="text-[11px] font-semibold text-[#c8874a]">
                  {selectedColor?.name}
                </p>
              </div>
              <div className="flex flex-wrap gap-2.5" role="radiogroup" aria-label="Select product colour">
                {colorVariants.map((variant) => {
                  const isSelected = selectedColor?.id === variant.id;
                  return (
                    <button
                      key={variant.id}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      onClick={() => selectColor(variant)}
                      className={`group flex items-center gap-2 rounded-lg border py-1.5 pl-1.5 pr-3 text-left transition-all ${
                        isSelected
                          ? "border-[#c8874a] bg-[#c8874a]/10 text-white shadow-sm shadow-[#c8874a]/10"
                          : "border-white/[0.08] bg-white/[0.02] text-white/60 hover:border-white/[0.25] hover:text-white"
                      }`}
                    >
                      <span className="relative h-8 w-8 overflow-hidden rounded-md bg-[#f5f0eb]">
                        <Image
                          src={variant.image_url}
                          alt={`${variant.name} ${product.name}`}
                          fill
                          className="object-contain p-0.5"
                          sizes="32px"
                        />
                      </span>
                      <span className="text-[11px] font-bold">{variant.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Luxury Gift Packaging Option */}
          <div className="pt-2">
            <GiftPackageSelector
              selectedPackage={selectedGiftPackage}
              onSelectPackage={setSelectedGiftPackage}
            />
          </div>

          {/* Add to Cart / Buy Now CTAs */}
          <div className="space-y-3 pt-1">
            <button
              type="button"
              onClick={handleAddToCart}
              className={`w-full py-4 rounded-sm font-bold text-[12px] uppercase tracking-[0.18em] flex items-center justify-center gap-2 transition-all shadow-xl cursor-pointer ${
                added
                  ? "bg-emerald-600 text-white shadow-emerald-900/30"
                  : "bg-[#c8874a] hover:bg-[#b87840] text-white shadow-[#c8874a]/25 hover:shadow-[#c8874a]/40"
              }`}
            >
              {added ? (
                <>
                  <Bookmark size={16} className="fill-white" /> Saved to List
                </>
              ) : (
                <>
                  <Bookmark size={16} /> Save to List
                </>
              )}
            </button>

            <Link
              href="/cart"
              onClick={handleAddToCart}
              className="w-full py-4 rounded-sm font-bold text-[12px] uppercase tracking-[0.18em] flex items-center justify-center gap-2 bg-white text-black hover:bg-neutral-200 transition-colors shadow-lg cursor-pointer"
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
                  <p>{frameDescription || "Masterfully designed with premium lightweight craftsmanship and scratch-resistant optical coating. Tailored for all-day comfort and glare-free clarity."}</p>
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
                  {boxItemsToDisplay.map((item, idx) => (
                    <p key={idx}>{item.startsWith("•") ? item : `• ${item}`}</p>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Client Reviews & Ratings Section */}
      <ProductReviews
        productId={product.id}
        productSlug={product.slug || undefined}
        productName={product.name}
      />

      {/* High-Res Fullscreen Lightbox Modal */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-between p-4 sm:p-6 animate-in fade-in duration-200"
          onClick={() => {
            setIsLightboxOpen(false);
            setLightboxZoom(false);
          }}
        >
          {/* Top Bar: Brand, Counter & Close */}
          <div className="w-full flex items-center justify-between z-30 text-white">
            <div className="flex items-center gap-3">
              <span className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.2em] text-[#c8874a]">
                SPECTRA HIGH-RES VIEW
              </span>
              <span className="text-xs text-neutral-400">
                {activeImageIndex + 1} / {images.length}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxZoom(!lightboxZoom);
                }}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                title={lightboxZoom ? "Zoom Out" : "Zoom In"}
              >
                {lightboxZoom ? <ZoomOut size={18} /> : <ZoomIn size={18} />}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsLightboxOpen(false);
                  setLightboxZoom(false);
                }}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                title="Close"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Center Image with Click to Toggle Zoom & Touch Swipe */}
          <div
            className="relative w-full flex-1 max-w-5xl flex items-center justify-center overflow-hidden my-2"
            onClick={(e) => {
              e.stopPropagation();
              setLightboxZoom(!lightboxZoom);
            }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div
              className={`relative w-full h-full max-h-[76vh] transition-transform duration-300 ease-out cursor-pointer ${
                lightboxZoom ? "scale-150 sm:scale-[2]" : "scale-100"
              }`}
            >
              <Image
                src={selectedImage}
                alt={product.name}
                fill
                priority
                className="object-contain p-2 sm:p-4 select-none"
                sizes="100vw"
              />
            </div>

            {/* Lightbox Next/Prev Arrows */}
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={showPrevImage}
                  className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center backdrop-blur-md transition-all z-30 cursor-pointer shadow-lg"
                  aria-label="Previous image"
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  type="button"
                  onClick={showNextImage}
                  className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center backdrop-blur-md transition-all z-30 cursor-pointer shadow-lg"
                  aria-label="Next image"
                >
                  <ChevronRight size={24} />
                </button>
              </>
            )}
          </div>

          {/* Bottom Filmstrip Thumbnails */}
          {images.length > 1 && (
            <div
              className="flex items-center gap-2 overflow-x-auto max-w-full pb-2 z-30 no-scrollbar"
              onClick={(e) => e.stopPropagation()}
            >
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSelectedImage(img);
                    setLightboxZoom(false);
                  }}
                  className={`relative w-12 h-12 sm:w-14 sm:h-14 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 cursor-pointer ${
                    selectedImage === img
                      ? "border-[#c8874a] scale-105"
                      : "border-white/20 opacity-50 hover:opacity-100"
                  }`}
                >
                  <Image src={img} alt="" fill className="object-contain p-1" sizes="60px" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
