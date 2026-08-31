import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

interface ShopByShapeSectionProps {
  /** Optional slug to Cloudinary URL map from admin Categories page */
  iconUrls?: Record<string, string>;
}

const shapes = [
  {
    slug: "oval",
    name: "Oval",
    href: "/sunglasses?shape=oval",
    icon: (
      <svg viewBox="0 0 64 36" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-11 h-6 text-neutral-900 group-hover:text-[#c8874a] transition-colors">
        <ellipse cx="18" cy="18" rx="13" ry="10" />
        <ellipse cx="46" cy="18" rx="13" ry="10" />
        <path d="M31 16 Q32 14 33 16" />
        <line x1="1" y1="16" x2="5" y2="16" />
        <line x1="59" y1="16" x2="63" y2="16" />
      </svg>
    ),
  },
  {
    slug: "rectangle",
    name: "Rectangle",
    href: "/sunglasses?shape=rectangle",
    icon: (
      <svg viewBox="0 0 64 36" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-11 h-6 text-neutral-900 group-hover:text-[#c8874a] transition-colors">
        <rect x="5" y="9" width="22" height="18" rx="3" />
        <rect x="37" y="9" width="22" height="18" rx="3" />
        <line x1="27" y1="16" x2="37" y2="16" />
        <line x1="1" y1="15" x2="5" y2="15" />
        <line x1="59" y1="15" x2="63" y2="15" />
      </svg>
    ),
  },
  {
    slug: "wayfarer",
    name: "Wayfarer",
    href: "/sunglasses?shape=wayfarer",
    icon: (
      <svg viewBox="0 0 64 36" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-11 h-6 text-neutral-900 group-hover:text-[#c8874a] transition-colors">
        <path d="M5 10 Q6 8 16 9 L27 10 Q29 10 28 13 L26 23 Q24 27 18 27 L13 27 Q6 27 6 22 Z" />
        <path d="M59 10 Q58 8 48 9 L37 10 Q35 10 36 13 L38 23 Q40 27 46 27 L51 27 Q58 27 58 22 Z" />
        <path d="M28 13 Q32 11 36 13" />
        <line x1="1" y1="12" x2="5" y2="12" />
        <line x1="59" y1="12" x2="63" y2="12" />
      </svg>
    ),
  },
  {
    slug: "round",
    name: "Round",
    href: "/sunglasses?shape=round",
    icon: (
      <svg viewBox="0 0 64 36" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-11 h-6 text-neutral-900 group-hover:text-[#c8874a] transition-colors">
        <circle cx="18" cy="18" r="12" />
        <circle cx="46" cy="18" r="12" />
        <path d="M30 16 Q32 13 34 16" />
        <line x1="1" y1="15" x2="6" y2="15" />
        <line x1="58" y1="15" x2="63" y2="15" />
      </svg>
    ),
  },
  {
    slug: "aviator",
    name: "Aviator",
    href: "/sunglasses?shape=aviator",
    icon: (
      <svg viewBox="0 0 64 36" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-11 h-6 text-neutral-900 group-hover:text-[#c8874a] transition-colors">
        <path d="M6 11 Q16 9 27 11 L27 17 Q26 27 17 27 Q8 27 6 20 Z" />
        <path d="M58 11 Q48 9 37 11 L37 17 Q38 27 47 27 Q56 27 58 20 Z" />
        <line x1="27" y1="12" x2="37" y2="12" />
        <path d="M27 16 Q32 14 37 16" />
        <line x1="1" y1="12" x2="6" y2="12" />
        <line x1="58" y1="12" x2="63" y2="12" />
      </svg>
    ),
  },
];

export default function ShopByShapeSection({ iconUrls = {} }: ShopByShapeSectionProps) {
  return (
    <section className="bg-white py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 md:mb-10">
          <div>
            <h2 className="text-xs md:text-sm font-bold tracking-[0.3em] uppercase text-neutral-900">
              Shop By Shape
            </h2>
            <p className="text-[12px] text-neutral-500 mt-1">
              Find the perfect silhouette for your face
            </p>
          </div>
          <Link
            href="/sunglasses"
            className="flex items-center gap-1.5 text-[11px] font-bold tracking-[0.2em] uppercase text-neutral-900 hover:text-[#c8874a] transition-colors group"
          >
            View All Shapes
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Shapes grid */}
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-4 sm:gap-6">
          {shapes.map((shape) => {
            const customUrl = iconUrls[shape.slug];
            return (
              <Link
                key={shape.name}
                href={shape.href}
                className="flex flex-col items-center gap-3 group"
              >
                {/* Shape circle container */}
                <div className="w-[76px] h-[76px] sm:w-[84px] sm:h-[84px] rounded-full border-2 border-neutral-300 bg-neutral-100 flex items-center justify-center group-hover:border-[#c8874a] group-hover:bg-[#c8874a]/10 group-hover:scale-105 transition-all duration-200 shadow-sm overflow-hidden relative">
                  {customUrl ? (
                    <Image
                      src={customUrl}
                      alt={shape.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-200"
                      sizes="(max-width: 640px) 76px, 84px"
                    />
                  ) : (
                    shape.icon
                  )}
                </div>
                <span className="text-[11px] font-bold tracking-[0.18em] uppercase text-neutral-900 group-hover:text-[#c8874a] transition-colors">
                  {shape.name}
                </span>
                {/* Gold underline on hover */}
                <span className="block h-[2px] w-5 bg-[#c8874a] opacity-0 group-hover:opacity-100 transition-opacity -mt-2" />
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
