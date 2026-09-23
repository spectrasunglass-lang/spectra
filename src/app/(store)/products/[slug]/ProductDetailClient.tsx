"use client";

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { cldUrl, isCloudinaryUrl } from "@/lib/cldUrl";
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
  Send,
  Copy,
  Check,
  Link as LinkIcon,
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

export interface ReturnSettingsProp {
  windowDays?: string;
  enabled?: boolean;
  tagline?: string;
}

export default function ProductDetailClient({
  product,
  returnSettings,
}: {
  product: ProductData;
  returnSettings?: ReturnSettingsProp;
}) {
  const { addItem } = useCart();
  const colorVariants = useMemo(
    () => normalizeProductColorVariants(product.color_variants),
    [product.color_variants]
  );
  const [selectedColorId, setSelectedColorId] = useState<string | null>(colorVariants[0]?.id || null);
  const selectedColor = colorVariants.find((variant) => variant.id === selectedColorId) || null;
  const [selectedImage, setSelectedImage] = useState(
    colorVariants[0]?.images?.[0] || colorVariants[0]?.image_url || product.image_url
  );
  const [added, setAdded] = useState(false);
  const [activeTab, setActiveTab] = useState<string | null>("details");
  const [selectedGiftPackage, setSelectedGiftPackage] = useState<GiftPackage | null>(null);
  const [shareOpen, setShareOpen] = useState(false);
  const [topShareOpen, setTopShareOpen] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const shareRef = useRef<HTMLDivElement>(null);
  const topShareRef = useRef<HTMLDivElement>(null);

  // Auto scroll to top when product loads or switches
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [product.id]);

  // Close share dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (shareRef.current && !shareRef.current.contains(target)) {
        setShareOpen(false);
      }
      if (topShareRef.current && !topShareRef.current.contains(target)) {
        setTopShareOpen(false);
      }
    };
    if (shareOpen || topShareOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [shareOpen, topShareOpen]);

  const productUrl = typeof window !== "undefined"
    ? `${window.location.origin}/products/${product.slug || product.id}`
    : `/products/${product.slug || product.id}`;

  const currentTitle = selectedColor?.product_name || product.name;
  const shareText = `Check out ${currentTitle} on SPECTRA Eyewear`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(productUrl);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const input = document.createElement("input");
      input.value = productUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== "undefined" && typeof (navigator as unknown as { share?: (data: ShareData) => Promise<void> }).share === "function") {
      try {
        await navigator.share({
          title: currentTitle,
          text: shareText,
          url: productUrl,
        });
      } catch {
        // User cancelled share
      }
      setShareOpen(false);
    }
  };

  const shareLinks = [
    {
      name: "WhatsApp",
      href: `https://wa.me/?text=${encodeURIComponent(`${shareText}\n${productUrl}`)}`,
      color: "#25D366",
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      ),
    },
    {
      name: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(productUrl)}`,
      color: "#1877F2",
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
    },
    {
      name: "X (Twitter)",
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(productUrl)}`,
      color: "#ffffff",
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
    },
  ];

  const images = useMemo(() => {
    // 1. If a colour variant is selected and has multiple angle photos:
    if (selectedColor?.images && selectedColor.images.length > 0) {
      return selectedColor.images;
    }

    // 2. If a colour variant is selected with single image_url:
    if (selectedColor?.image_url) {
      const angles = Array.isArray(product.images) ? product.images : [];
      return Array.from(new Set([selectedColor.image_url, ...angles]));
    }

    // 3. Fallback to main product gallery:
    const rawImages = [
      product.image_url,
      ...(Array.isArray(product.images) ? product.images : []),
      ...(Array.isArray(product.gallery_urls) ? product.gallery_urls : []),
      ...colorVariants.map((variant) => variant.images?.[0] || variant.image_url),
    ].filter(Boolean) as string[];

    return Array.from(new Set(rawImages));
  }, [product.image_url, product.images, product.gallery_urls, colorVariants, selectedColor]);

  const discountPercent =
    product.compare_price && product.compare_price > product.price
      ? Math.round(((product.compare_price - product.price) / product.compare_price) * 100)
      : null;

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: selectedColor?.product_name || product.name,
      slug: product.slug || product.id,
      price: Number(product.price),
      image_url: selectedColor?.images?.[0] || selectedColor?.image_url || product.image_url,
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
    const coverImage = variant.images?.[0] || variant.image_url;
    setSelectedImage(coverImage);
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
                  <Image
                    src={cldUrl(img, 200)}
                    alt={`${product.name} thumbnail ${idx + 1}`}
                    fill
                    unoptimized={isCloudinaryUrl(img)}
                    className="object-contain p-2"
                    sizes="80px"
                  />
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
            className="relative flex-1 aspect-square max-h-[580px] bg-white rounded-sm overflow-hidden border border-white/[0.08] shadow-2xl flex items-center justify-center p-0 group cursor-zoom-in select-none"
          >
            {/* Top Left Badges */}
            <div className="absolute top-4 left-4 z-10 flex flex-wrap items-center gap-2 pointer-events-none">
              {product.is_new && (
                <span className="bg-black text-white text-[10px] font-bold tracking-[0.2em] uppercase px-3 py-1.5 rounded-full shadow-sm">
                  NEWLY ADDED
                </span>
              )}
              {discountPercent && (
                <span className="bg-[#c8874a] text-white text-[10px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-full shadow-sm">
                  -{discountPercent}%
                </span>
              )}
            </div>

            {/* Top Right Floating Share Button (Flipkart / Amazon style) */}
            <div
              ref={topShareRef}
              onClick={(e) => e.stopPropagation()}
              className="absolute top-4 right-4 z-30"
            >
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setTopShareOpen((prev) => !prev);
                }}
                className="w-9 h-9 rounded-full bg-black/80 hover:bg-black text-white flex items-center justify-center backdrop-blur-md transition-all shadow-md border border-white/10 hover:border-[#c8874a]/60 cursor-pointer group"
                aria-label="Share this product"
                title="Share this product"
              >
                <Send size={15} className="text-[#c8874a] group-hover:scale-110 transition-transform" />
              </button>

              {/* Share Dropdown from Top Button */}
              {topShareOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-[#161616] border border-white/[0.1] rounded-xl shadow-2xl shadow-black/80 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  {/* Copy Link */}
                  <button
                    type="button"
                    onClick={() => {
                      handleCopyLink();
                      setTimeout(() => setTopShareOpen(false), 1200);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-[12px] font-semibold text-neutral-300 hover:bg-white/[0.05] hover:text-white transition-colors cursor-pointer border-b border-white/[0.06]"
                  >
                    <span className="w-8 h-8 rounded-lg bg-[#c8874a]/15 flex items-center justify-center">
                      {linkCopied ? <Check size={15} className="text-emerald-400" /> : <LinkIcon size={15} className="text-[#c8874a]" />}
                    </span>
                    {linkCopied ? "Link Copied!" : "Copy Product Link"}
                  </button>

                  {/* Social Share Links */}
                  {shareLinks.map((platform) => (
                    <a
                      key={platform.name}
                      href={platform.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setTopShareOpen(false)}
                      className="w-full flex items-center gap-3 px-4 py-3 text-[12px] font-semibold text-neutral-300 hover:bg-white/[0.05] hover:text-white transition-colors cursor-pointer border-b border-white/[0.06]"
                    >
                      <span
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${platform.color}20`, color: platform.color }}
                      >
                        {platform.icon}
                      </span>
                      Share on {platform.name}
                    </a>
                  ))}

                  {/* Native Share */}
                  {typeof navigator !== "undefined" && typeof (navigator as unknown as { share?: unknown }).share === "function" && (
                    <button
                      type="button"
                      onClick={() => {
                        handleNativeShare();
                        setTopShareOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-[12px] font-semibold text-neutral-300 hover:bg-white/[0.05] hover:text-white transition-colors cursor-pointer"
                    >
                      <span className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white">
                        <Send size={15} />
                      </span>
                      Instagram & More Options...
                    </button>
                  )}
                </div>
              )}
            </div>

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
                src={cldUrl(selectedImage, 1400)}
                alt={product.name}
                fill
                priority
                unoptimized={isCloudinaryUrl(selectedImage)}
                className="object-contain p-0"
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
            <div className="flex items-center justify-between gap-3 mb-2">
              <div className="flex items-center gap-2 text-[10.5px] font-bold tracking-[0.25em] text-[#c8874a] uppercase">
                <span>{product.category || "Unisex"} • {product.shape || "Eyewear"}</span>
              </div>

              {/* Quick Share button in details header (Amazon style) */}
              <button
                type="button"
                onClick={() => {
                  if (typeof navigator !== "undefined" && typeof (navigator as unknown as { share?: (data: ShareData) => Promise<void> }).share === "function") {
                    handleNativeShare();
                  } else {
                    setShareOpen((prev) => !prev);
                  }
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-white/[0.08] bg-[#141414] hover:bg-white/[0.06] text-neutral-300 hover:text-white text-[11px] font-semibold tracking-wider transition-all cursor-pointer group"
                title="Share this product"
              >
                <Send size={12} className="text-[#c8874a] group-hover:scale-110 transition-transform" />
                <span>Share</span>
              </button>
            </div>

            <h1 className="text-3xl sm:text-4xl text-white tracking-wider uppercase">
              {selectedColor?.product_name || product.name}
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

          {/* Real Stock Inventory Status */}
          {(() => {
            const stockQty = (() => {
              if (typeof product.stock_quantity === "number") return product.stock_quantity;
              if (Array.isArray(product.color_variants) && product.color_variants.length > 0) {
                const first = product.color_variants[0] as { stock_quantity?: number };
                if (typeof first?.stock_quantity === "number") return first.stock_quantity;
              }
              return null;
            })();

            if (stockQty === null) return null;
            if (stockQty <= 0) {
              return (
                <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-[12px] font-bold">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  Currently Out of Stock — Check back soon
                </div>
              );
            }
            if (stockQty <= 5) {
              return (
                <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[12px] font-semibold">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  ⚡ Only {stockQty} {stockQty === 1 ? "unit" : "units"} left in stock — order soon!
                </div>
              );
            }
            return (
              <div className="flex items-center gap-2 text-[11.5px] font-semibold text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                In Stock • Ready to dispatch across India
              </div>
            );
          })()}

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
                          src={cldUrl(variant.images?.[0] || variant.image_url, 120)}
                          alt={`${variant.name} ${product.name}`}
                          fill
                          unoptimized={isCloudinaryUrl(variant.images?.[0] || variant.image_url)}
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
            {(() => {
              const isOutOfStock = (() => {
                const qty = typeof product.stock_quantity === "number"
                  ? product.stock_quantity
                  : Array.isArray(product.color_variants) && product.color_variants[0]?.stock_quantity !== undefined
                  ? Number((product.color_variants[0] as { stock_quantity?: number }).stock_quantity)
                  : null;
                return qty !== null && qty <= 0;
              })();

              if (isOutOfStock) {
                return (
                  <button
                    type="button"
                    disabled
                    className="w-full py-4 rounded-sm font-bold text-[12px] uppercase tracking-[0.18em] flex items-center justify-center gap-2 bg-neutral-800 text-neutral-400 cursor-not-allowed border border-white/[0.06]"
                  >
                    Currently Out of Stock
                  </button>
                );
              }

              return (
                <>
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
                </>
              );
            })()}
          </div>

          {/* Guarantee Badges */}
          <div className="bg-[#121212] border border-white/[0.06] rounded-2xl p-4 space-y-3 text-[12px] text-neutral-300">
            <div className="flex items-center gap-3">
              <Truck size={16} className="text-[#c8874a]" />
              <span>Complimentary express delivery across India</span>
            </div>
            <Link
              href="/returns"
              className="flex items-center gap-3 hover:text-white transition-colors group/ret cursor-pointer"
            >
              <RefreshCw size={16} className="text-[#c8874a] group-hover/ret:rotate-180 transition-transform duration-500" />
              <span>
                {returnSettings?.enabled === false
                  ? "100% Inspected quality & replacement guarantee"
                  : `${returnSettings?.windowDays || "14"}-day ${returnSettings?.tagline || "effortless home exchange & returns"}`}
              </span>
            </Link>
            <div className="flex items-center gap-3">
              <ShieldCheck size={16} className="text-[#c8874a]" />
              <span>100% Certified UV400 optical protection</span>
            </div>
          </div>

          {/* Share Product */}
          <div ref={shareRef} className="relative">
            <button
              type="button"
              onClick={() => setShareOpen((prev) => !prev)}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-white/[0.08] bg-[#121212] text-[12px] font-bold uppercase tracking-[0.14em] text-neutral-300 hover:text-white hover:border-white/[0.18] transition-all cursor-pointer group"
            >
              <Send size={15} className="text-[#c8874a] group-hover:scale-110 transition-transform" />
              Share This Product
            </button>

            {/* Share Dropdown */}
            {shareOpen && (
              <div className="absolute left-0 right-0 bottom-full mb-2 bg-[#161616] border border-white/[0.1] rounded-xl shadow-2xl shadow-black/60 z-50 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200">
                {/* Copy Link */}
                <button
                  type="button"
                  onClick={() => {
                    handleCopyLink();
                    setTimeout(() => setShareOpen(false), 1200);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-[12px] font-semibold text-neutral-300 hover:bg-white/[0.05] hover:text-white transition-colors cursor-pointer border-b border-white/[0.06]"
                >
                  <span className="w-8 h-8 rounded-lg bg-[#c8874a]/15 flex items-center justify-center">
                    {linkCopied ? <Check size={15} className="text-emerald-400" /> : <LinkIcon size={15} className="text-[#c8874a]" />}
                  </span>
                  {linkCopied ? "Link Copied!" : "Copy Product Link"}
                </button>

                {/* Social Share Links */}
                {shareLinks.map((platform) => (
                  <a
                    key={platform.name}
                    href={platform.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setShareOpen(false)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-[12px] font-semibold text-neutral-300 hover:bg-white/[0.05] hover:text-white transition-colors cursor-pointer border-b border-white/[0.06]"
                  >
                    <span
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${platform.color}20`, color: platform.color }}
                    >
                      {platform.icon}
                    </span>
                    Share on {platform.name}
                  </a>
                ))}

                {/* Native Share fallback if available */}
                {typeof navigator !== "undefined" && typeof (navigator as unknown as { share?: unknown }).share === "function" && (
                  <button
                    type="button"
                    onClick={handleNativeShare}
                    className="w-full flex items-center gap-3 px-4 py-3 text-[12px] font-semibold text-neutral-300 hover:bg-white/[0.05] hover:text-white transition-colors cursor-pointer"
                  >
                    <span className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white">
                      <Send size={15} />
                    </span>
                    Instagram & More Options...
                  </button>
                )}
              </div>
            )}
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
                src={cldUrl(selectedImage, 1800)}
                alt={product.name}
                fill
                priority
                unoptimized={isCloudinaryUrl(selectedImage)}
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
                  <Image
                    src={cldUrl(img, 150)}
                    alt=""
                    fill
                    unoptimized={isCloudinaryUrl(img)}
                    className="object-contain p-1"
                    sizes="60px"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
