"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight, ArrowUpRight } from "lucide-react";

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
      className="relative w-full min-h-[calc(100dvh-60px)] sm:min-h-[calc(100dvh-80px)] bg-[#0a0a0a] overflow-hidden flex flex-col justify-end md:justify-center group/hero select-none"
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
      <div className="relative z-20 w-full max-w-7xl mx-auto px-5 sm:px-10 lg:px-20 pb-12 sm:pb-16 md:py-20 flex flex-col items-start text-left">
        <div className="w-full max-w-md sm:max-w-lg md:max-w-md lg:max-w-xl flex flex-col items-start text-left">
          {/* Label */}
          <p className="text-[11px] sm:text-[12px] font-bold tracking-[0.3em] uppercase text-[#c8874a] mb-2 sm:mb-4">
            NEW COLLECTION 2026
          </p>

          {/* Headline with Exact Stencil Typography */}
          <h1 className="font-stencil uppercase leading-[1.05] tracking-[0.06em] sm:tracking-[0.1em] mb-3 sm:mb-5">
            <span className="block text-white text-[28px] sm:text-4xl md:text-6xl lg:text-[68px]">
              SEE BEYOND{" "}
            </span>
            <span className="block text-[#c8874a] text-[28px] sm:text-4xl md:text-6xl lg:text-[68px] mt-1">
              LIMITS
            </span>
          </h1>

          {/* Subtext */}
          <p className="text-neutral-300 text-[13px] sm:text-sm md:text-[15px] leading-relaxed mb-5 sm:mb-8 font-medium">
            Crafted for visionaries.
            <br />
            Designed to stand apart.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 items-start w-full">
            <Link
              href="/men"
              className="w-full max-w-[220px] bg-[#c8874a] hover:bg-[#b87840] text-white text-[11px] font-bold px-5 py-3.5 rounded-lg flex items-center justify-center gap-2 uppercase tracking-[0.15em] transition-all shadow-md group/btn"
            >
              <span>SHOP MEN</span>
              <ArrowUpRight size={15} className="text-white transition-transform duration-200 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
            </Link>

            <Link
              href="/women"
              className="w-full max-w-[220px] border border-[#c8874a]/60 hover:border-[#c8874a] text-white hover:bg-white/[0.04] text-[11px] font-bold px-5 py-3.5 rounded-lg flex items-center justify-center gap-2 uppercase tracking-[0.15em] transition-all group/btn"
            >
              <span>EXPLORE WOMEN</span>
              <ArrowUpRight size={15} className="text-white transition-transform duration-200 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Slide Indicators - Centered at Bottom */}
      {totalSlides > 1 && (
        <div className="absolute bottom-4 sm:bottom-6 left-0 right-0 z-30 flex items-center justify-center gap-2 pointer-events-auto">
          {slideList.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveSlide(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                activeSlide === i
                  ? "w-8 bg-[#c8874a]"
                  : "w-6 bg-white/30 hover:bg-white/50"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
