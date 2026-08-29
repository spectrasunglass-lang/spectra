"use client";

import React, { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight, ArrowUpRight } from "lucide-react";
import { SpotlightCard, SpotlightHeading } from "@/types/campaign";

interface SpotlightSectionProps {
  cards?: SpotlightCard[];
  heading?: SpotlightHeading;
}

export default function SpotlightSection({
  cards = [],
  heading = {},
}: SpotlightSectionProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Filter only active cards
  const activeCards = cards.filter((c) => c.active);

  // If no cards are active or uploaded yet, do not render mock data
  if (!activeCards || activeCards.length === 0) {
    return null;
  }

  const title = heading.title || "Curated Drops & Stories";
  const subtitle =
    heading.subtitle ||
    "Explore signature handcrafted silhouettes captured in our latest visual concepts.";

  const handleScroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 340;
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <section className="bg-white py-14 md:py-20 border-b border-neutral-100 overflow-hidden select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header row */}
        <div className="flex items-center justify-between mb-8 md:mb-12">
          <div>
            <h2 className="text-xs md:text-sm font-bold tracking-[0.3em] uppercase text-neutral-900">
              {title}
            </h2>
            {subtitle && (
              <p className="text-[12px] text-neutral-400 mt-1">
                {subtitle}
              </p>
            )}
          </div>

          {/* Navigation Controls */}
          {activeCards.length > 1 && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleScroll("left")}
                aria-label="Previous story"
                className="w-8 h-8 rounded-full border border-neutral-200 bg-white hover:bg-neutral-100 text-neutral-700 hover:text-black flex items-center justify-center transition-all shadow-sm active:scale-95 cursor-pointer"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => handleScroll("right")}
                aria-label="Next story"
                className="w-8 h-8 rounded-full border border-neutral-200 bg-white hover:bg-neutral-100 text-neutral-700 hover:text-black flex items-center justify-center transition-all shadow-sm active:scale-95 cursor-pointer"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>

        {/* Scrollable Story Cards Track (Up to 8+ scrollable items, hidden scrollbar) */}
        <div
          ref={scrollContainerRef}
          className="flex gap-4 sm:gap-6 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory pb-4 pt-1 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8"
        >
          {activeCards.map((card) => {
            const destination = card.link_url || "/sunglasses";

            return (
              <Link
                key={card.id}
                href={destination}
                className="group relative flex-shrink-0 w-[240px] sm:w-[270px] md:w-[300px] aspect-[9/13.5] rounded-sm overflow-hidden bg-neutral-100 shadow-sm hover:shadow-xl transition-all duration-500 block border border-neutral-200/80 snap-start"
              >
                {/* Background Image */}
                <div className="absolute inset-0 w-full h-full bg-neutral-100 overflow-hidden">
                  <Image
                    src={card.image_url}
                    alt={card.title || "Campaign"}
                    fill
                    sizes="(max-width: 640px) 260px, (max-width: 1024px) 290px, 320px"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    priority={false}
                  />
                </div>

                {/* Top Typography Overlay (if title provided) */}
                {card.title && (
                  <div className="absolute top-7 sm:top-9 left-0 right-0 px-4 text-center z-10 flex flex-col items-center">
                    <h3 className="font-extrabold text-white text-xl sm:text-2xl md:text-[26px] tracking-[0.16em] uppercase font-stencil drop-shadow-md transition-transform duration-300 group-hover:-translate-y-0.5">
                      {card.title}
                    </h3>
                    {card.subtitle && (
                      <span className="text-[9.5px] sm:text-[10.5px] font-bold text-white/90 tracking-[0.25em] uppercase mt-1.5 drop-shadow">
                        {card.subtitle}
                      </span>
                    )}
                  </div>
                )}

                {/* Bottom CTA Pill on Hover */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 z-10">
                  <span className="inline-flex items-center gap-1.5 bg-white/95 backdrop-blur-md text-neutral-900 text-[10.5px] font-bold tracking-[0.2em] uppercase px-4 py-2 rounded-full shadow-xl border border-white">
                    Explore Drop
                    <ArrowUpRight size={13} className="text-[#c8874a]" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
