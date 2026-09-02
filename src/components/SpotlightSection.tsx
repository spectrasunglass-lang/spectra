"use client";

import React, { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
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

  return (
    <section className="bg-white py-7 md:py-20 overflow-hidden select-none">
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
                    <h3 className="font-extrabold text-white text-xl sm:text-2xl md:text-[26px] tracking-[0.12em] uppercase drop-shadow-md transition-transform duration-300 group-hover:-translate-y-0.5">
                      {card.title}
                    </h3>
                    {card.subtitle && (
                      <span className="text-[9.5px] sm:text-[10.5px] font-bold text-white/90 tracking-[0.25em] uppercase mt-1.5 drop-shadow">
                        {card.subtitle}
                      </span>
                    )}
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
