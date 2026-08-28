import React from "react";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Collections — SPECTRA",
  description: "Explore themed luxury eyewear collections from SPECTRA. Aviator series, Wayfarer icons, and Titanium editions.",
};

const collections = [
  {
    title: "THE AVIATOR ICONS",
    tagline: "Aero Titanium & Teardrop Geometry",
    description: "Classic military aviation frames reconstructed with ultra-lightweight aircraft alloy.",
    href: "/sunglasses?shape=aviator",
    badge: "Signature Series",
    gradient: "from-[#201812] to-[#0d0a08]",
  },
  {
    title: "WAYFARER RETROSPECTIVE",
    tagline: "Bold Acetate & Architectural Angles",
    description: "Hand-polished Italian acetate frames engineered for substantial presence.",
    href: "/sunglasses?shape=wayfarer",
    badge: "Heritage Line",
    gradient: "from-[#141a1e] to-[#080d10]",
  },
  {
    title: "MINIMALIST ROUND",
    tagline: "Artisan Circles & Vintage Gold",
    description: "Understated perfection for intellectual and artistic visionaries.",
    href: "/sunglasses?shape=round",
    badge: "Atelier Drop",
    gradient: "from-[#1a141c] to-[#0c080e]",
  },
  {
    title: "RECTANGLE GEOMETRIC",
    tagline: "Sharp Horizons & Low-Profile Form",
    description: "Sleek contemporary frames cut with diamond-honed precision.",
    href: "/sunglasses?shape=rectangle",
    badge: "Contemporary Edition",
    gradient: "from-[#161816] to-[#090b09]",
  },
];

export default function CollectionsPage() {
  return (
    <div className="bg-[#0a0a0a] min-h-screen">
      {/* Banner */}
      <div className="relative border-b border-white/[0.08] bg-gradient-to-b from-[#141414] to-[#0a0a0a] py-16 sm:py-20 text-center">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
          <p className="text-[10.5px] font-bold tracking-[0.3em] uppercase text-[#c8874a] mb-2 flex items-center justify-center gap-1.5">
            <Sparkles size={14} />
            Maison Chapters
          </p>
          <h1 className="font-stencil text-3xl sm:text-5xl text-white tracking-[0.1em] uppercase">
            Curated Collections
          </h1>
          <p className="text-neutral-400 text-[13px] sm:text-[14px] mt-3 max-w-md mx-auto">
            Distinct design languages, each meticulously crafted to define personal style.
          </p>
        </div>
      </div>

      {/* Collection Cards */}
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {collections.map((col, i) => (
            <Link
              key={i}
              href={col.href}
              className={`group relative overflow-hidden rounded-3xl border border-white/[0.08] hover:border-[#c8874a]/50 p-8 sm:p-12 flex flex-col justify-between min-h-[320px] sm:min-h-[380px] bg-gradient-to-br ${col.gradient} transition-all duration-300 hover:shadow-2xl hover:shadow-black/80 hover:-translate-y-1`}
            >
              <div>
                <span className="inline-block px-3 py-1 bg-white/[0.08] border border-white/[0.1] rounded-full text-[10px] font-bold tracking-widest text-[#e5a872] uppercase mb-4">
                  {col.badge}
                </span>
                <h3 className="font-stencil text-2xl sm:text-3xl text-white uppercase tracking-wider mb-2">
                  {col.title}
                </h3>
                <p className="text-[#c8874a] text-[12px] font-bold tracking-wider uppercase mb-4">
                  {col.tagline}
                </p>
                <p className="text-neutral-400 text-[13px] sm:text-[14px] leading-relaxed max-w-sm">
                  {col.description}
                </p>
              </div>

              <div className="pt-6 flex items-center gap-2 text-[11px] font-bold text-white uppercase tracking-[0.2em] group-hover:text-[#c8874a] transition-colors">
                <span>Explore Collection</span>
                <ArrowRight size={14} className="group-hover:translate-x-1.5 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
