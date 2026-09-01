"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface HeroSlideData {
  desktop?: string | null;
  mobile?: string | null;
}

interface HeroSectionProps {
  slides?: HeroSlideData[];
  autoSlideInterval?: number;
}

export default function HeroSection({
  slides = [],
  autoSlideInterval = 5000,
}: HeroSectionProps) {
  const [activeSlide, setActiveSlide] = useState(0);
  const touchStartX = useRef<number>(0);

  // Filter slides that have at least one uploaded image (desktop or mobile)
  const validSlides = slides.filter((s) => s.desktop || s.mobile);
  const slideList: HeroSlideData[] =
    validSlides.length > 0
      ? validSlides
      : [
          slides[0] || {},
          slides[1] || {},
          slides[2] || {},
        ];

  const totalSlides = slideList.length;

  const nextSlide = useCallback(() => {
    setActiveSlide((prev) => (prev + 1) % totalSlides);
  }, [totalSlides]);

  const prevSlide = useCallback(() => {
    setActiveSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  }, [totalSlides]);

  // Robust Auto-slide timer
  useEffect(() => {
    if (totalSlides <= 1) return;

    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % totalSlides);
    }, autoSlideInterval);

    return () => clearInterval(timer);
  }, [totalSlides, autoSlideInterval]);

  // Mobile touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;
    if (Math.abs(diff) > 35) {
      if (diff > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
  };

  return (
    <section
      className="relative w-full min-h-[72dvh] sm:min-h-[80dvh] md:min-h-[calc(100dvh-64px)] bg-[#0a0a0a] overflow-hidden flex flex-col justify-end md:justify-center group/hero select-none"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Background Slides with Hardware-Accelerated 60fps Cross-Fade */}
      <div className="absolute inset-0 w-full h-full bg-[#0a0a0a] pointer-events-none">
        {slideList.map((slide, i) => {
          const desktopImg = slide.desktop || slide.mobile;
          const mobileImg = slide.mobile || slide.desktop;
          const isActive = activeSlide === i;

          return (
            <div
              key={i}
              className={`absolute inset-0 transition-opacity duration-700 ease-out will-change-[opacity] ${
                isActive ? "opacity-100 z-0" : "opacity-0 -z-10 pointer-events-none"
              }`}
              style={{ transform: "translate3d(0,0,0)" }}
            >
              {/* Desktop Image */}
              {desktopImg && (
                <div className="hidden md:block absolute inset-0">
                  <Image
                    src={desktopImg}
                    alt={`Hero Slide ${i + 1} Desktop`}
                    fill
                    priority
                    sizes="100vw"
                    className="object-cover object-right lg:object-center"
                  />
                </div>
              )}

              {/* Mobile Image: Top-anchored for faces and sunglasses */}
              {mobileImg && (
                <div className="block md:hidden absolute inset-0">
                  <Image
                    src={mobileImg}
                    alt={`Hero Slide ${i + 1} Mobile`}
                    fill
                    priority
                    sizes="100vw"
                    className="object-cover object-top"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Dark gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a]/90 via-[#0a0a0a]/65 to-transparent z-10 hidden md:block pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/75 via-45% to-transparent z-10 md:hidden pointer-events-none" />

      {/* Desktop Navigation Arrows on hover */}
      {totalSlides > 1 && (
        <>
          <button
            onClick={prevSlide}
            aria-label="Previous Slide"
            className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-black/40 hover:bg-black/75 border border-white/15 text-white/70 hover:text-white flex items-center justify-center backdrop-blur-md opacity-0 group-hover/hero:opacity-100 transition-all duration-200 hidden md:flex active:scale-95 cursor-pointer"
          >
            <ChevronLeft size={20} />
          </button>

          <button
            onClick={nextSlide}
            aria-label="Next Slide"
            className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-black/40 hover:bg-black/75 border border-white/15 text-white/70 hover:text-white flex items-center justify-center backdrop-blur-md opacity-0 group-hover/hero:opacity-100 transition-all duration-200 hidden md:flex active:scale-95 cursor-pointer"
          >
            <ChevronRight size={20} />
          </button>
        </>
      )}


      {/* Hero content */}
      <div className="relative z-20 w-full max-w-7xl mx-auto px-5 sm:px-10 lg:px-20 pb-8 pt-10 md:py-20 flex flex-col items-center md:items-start text-center md:text-left">
        <div className="max-w-md sm:max-w-lg md:max-w-md lg:max-w-xl flex flex-col items-center md:items-start">
          {/* Label (Desktop Only) */}
          <p className="hidden md:block text-[10px] sm:text-[11px] font-bold tracking-[0.3em] uppercase text-[#c8874a] mb-3 sm:mb-4">
            NEW COLLECTION 2026
          </p>

          {/* Headline with Exact Stencil Typography */}
          <h1 className="font-stencil uppercase leading-[1.05] tracking-[0.06em] sm:tracking-[0.1em] mb-4 sm:mb-5">
            <span className="inline md:block text-white text-[23px] sm:text-4xl md:text-6xl lg:text-[68px]">
              SEE BEYOND{" "}
            </span>
            <span className="inline md:block text-[#c8874a] text-[23px] sm:text-4xl md:text-6xl lg:text-[68px] md:mt-1">
              LIMITS
            </span>
          </h1>

          {/* Subtext (Desktop Only) */}
          <p className="hidden md:block text-neutral-300 text-[13px] sm:text-sm md:text-[15px] leading-relaxed mb-6 sm:mb-8 font-medium">
            Crafted for visionaries.
            <br />
            Designed to stand apart.
          </p>

          {/* Mobile CTA: Single SHOP NOW button */}
          <div className="flex md:hidden justify-center">
            <Link
              href="/sunglasses"
              className="bg-[#c8874a] hover:bg-[#b87840] text-white text-[11px] font-bold px-8 py-3 rounded-sm flex items-center justify-center gap-2 uppercase tracking-[0.15em] transition-all shadow-md w-full max-w-[200px]"
            >
              SHOP NOW
            </Link>
          </div>

          {/* Desktop CTA Buttons */}
          <div className="hidden md:flex gap-3">
            <Link
              href="/men"
              className="bg-[#c8874a] hover:bg-[#b87840] text-white text-[11px] font-bold px-6 py-3 rounded-lg flex items-center justify-center gap-2 uppercase tracking-[0.15em] transition-all shadow-md sm:flex-initial"
            >
              SHOP MEN
            </Link>

            <Link
              href="/women"
              className="border border-white/40 hover:border-white text-white hover:bg-white/[0.06] text-[11px] font-bold px-6 py-3 rounded-lg flex items-center justify-center gap-2 uppercase tracking-[0.15em] transition-all sm:flex-initial"
            >
              SHOP WOMEN
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
