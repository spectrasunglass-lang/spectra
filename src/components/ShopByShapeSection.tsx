import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const shapes = [
  {
    name: "Oval",
    href: "/sunglasses?shape=oval",
    icon: (
      <svg viewBox="0 0 60 36" fill="none" stroke="currentColor" strokeWidth="2" className="w-10 h-6">
        <ellipse cx="30" cy="18" rx="26" ry="14" />
        <line x1="4" y1="18" x2="0" y2="18" />
        <line x1="56" y1="18" x2="60" y2="18" />
      </svg>
    ),
  },
  {
    name: "Rectangle",
    href: "/sunglasses?shape=rectangle",
    icon: (
      <svg viewBox="0 0 60 36" fill="none" stroke="currentColor" strokeWidth="2" className="w-10 h-6">
        <rect x="4" y="8" width="22" height="20" rx="2" />
        <rect x="34" y="8" width="22" height="20" rx="2" />
        <line x1="26" y1="18" x2="34" y2="18" />
        <line x1="0" y1="18" x2="4" y2="18" />
        <line x1="56" y1="18" x2="60" y2="18" />
      </svg>
    ),
  },
  {
    name: "Wayfarer",
    href: "/sunglasses?shape=wayfarer",
    icon: (
      <svg viewBox="0 0 60 36" fill="none" stroke="currentColor" strokeWidth="2" className="w-10 h-6">
        <path d="M4 10 Q5 4 14 6 L26 8 Q28 8 28 10 L28 24 Q28 28 20 28 L10 28 Q2 28 2 22 Z" />
        <path d="M56 10 Q55 4 46 6 L34 8 Q32 8 32 10 L32 24 Q32 28 40 28 L50 28 Q58 28 58 22 Z" />
        <line x1="28" y1="16" x2="32" y2="16" />
        <line x1="0" y1="18" x2="2" y2="18" />
        <line x1="58" y1="18" x2="60" y2="18" />
      </svg>
    ),
  },
  {
    name: "Round",
    href: "/sunglasses?shape=round",
    icon: (
      <svg viewBox="0 0 60 36" fill="none" stroke="currentColor" strokeWidth="2" className="w-10 h-6">
        <circle cx="15" cy="18" r="12" />
        <circle cx="45" cy="18" r="12" />
        <line x1="27" y1="18" x2="33" y2="18" />
        <line x1="0" y1="18" x2="3" y2="18" />
        <line x1="57" y1="18" x2="60" y2="18" />
      </svg>
    ),
  },
  {
    name: "Aviator",
    href: "/sunglasses?shape=aviator",
    icon: (
      <svg viewBox="0 0 60 36" fill="none" stroke="currentColor" strokeWidth="2" className="w-10 h-6">
        <path d="M4 10 Q6 4 15 6 L26 8 Q28 9 27 14 L24 26 Q22 30 15 30 Q6 30 4 22 Z" />
        <path d="M56 10 Q54 4 45 6 L34 8 Q32 9 33 14 L36 26 Q38 30 45 30 Q54 30 56 22 Z" />
        <line x1="27" y1="16" x2="33" y2="16" />
        <line x1="0" y1="14" x2="4" y2="14" />
        <line x1="56" y1="14" x2="60" y2="14" />
      </svg>
    ),
  },
];

export default function ShopByShapeSection() {
  return (
    <section className="bg-[#0a0a0a] py-10 md:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-7 md:mb-9">
          <h2 className="text-xs md:text-sm font-bold tracking-[0.3em] uppercase text-white">
            Shop By Shape
          </h2>
          <Link
            href="/sunglasses"
            className="flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.2em] uppercase text-neutral-400 hover:text-white transition-colors"
          >
            View All Shapes
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Shapes grid */}
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-4 sm:gap-6">
          {shapes.map((shape) => (
            <Link
              key={shape.name}
              href={shape.href}
              className="flex flex-col items-center gap-3 group"
            >
              {/* Shape image circle — empty, image from admin */}
              <div className="shape-circle text-neutral-400 group-hover:text-[#c8874a] transition-colors duration-200">
                {shape.icon}
              </div>
              <span className="text-[10px] md:text-[11px] font-bold tracking-[0.2em] uppercase text-neutral-400 group-hover:text-white transition-colors">
                {shape.name}
              </span>
              {/* Gold underline on hover */}
              <span className="block h-[2px] w-5 bg-[#c8874a] opacity-0 group-hover:opacity-100 transition-opacity -mt-2" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
