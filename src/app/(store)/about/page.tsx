import React from "react";
import Link from "next/link";
import { Sparkles, Shield, Compass, Award, ArrowRight } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Our Heritage & Story — SPECTRA",
  description: "Learn about the SPECTRA philosophy, handcrafted eyewear design, and pursuit of optical perfection.",
};

export default function AboutPage() {
  const pillars = [
    {
      icon: <Compass size={24} className="text-[#c8874a]" />,
      title: "Visionary Architecture",
      desc: "Every frame is sketched with architectural balance, balancing bold structural geometry with featherlight ergonomic weight.",
    },
    {
      icon: <Award size={24} className="text-[#c8874a]" />,
      title: "Artisan Materials",
      desc: "We source aerospace-grade titanium, custom cellulose acetate, and diamond-cut hinges engineered for decades of wear.",
    },
    {
      icon: <Shield size={24} className="text-[#c8874a]" />,
      title: "High-Definition Optics",
      desc: "Our polarized lenses undergo rigorous optical calibration to deliver 100% UV400 filtration and high-contrast acuity.",
    },
  ];

  return (
    <div className="bg-[#0a0a0a] min-h-screen">
      {/* Hero */}
      <div className="relative border-b border-white/[0.08] bg-gradient-to-b from-[#181410] via-[#100d0a] to-[#0a0a0a] py-20 sm:py-28 text-center">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
          <p className="text-[10.5px] font-bold tracking-[0.35em] uppercase text-[#c8874a] mb-3 flex items-center justify-center gap-1.5">
            <Sparkles size={14} />
            The Maison Philosophy
          </p>
          <h1 className="font-stencil text-4xl sm:text-6xl text-white tracking-[0.1em] uppercase">
            Built To Be Seen
          </h1>
          <p className="text-neutral-300 text-[14px] sm:text-[16px] mt-4 max-w-xl mx-auto leading-relaxed">
            SPECTRA was founded on a singular conviction: luxury eyewear shouldn&apos;t just frame the world — it should elevate how you move through it.
          </p>
        </div>
      </div>

      {/* Story Narrative */}
      <div className="max-w-4xl mx-auto px-5 sm:px-8 py-16 sm:py-20 space-y-12">
        <div className="space-y-6 text-neutral-300 text-[15px] sm:text-[16px] leading-relaxed">
          <p>
            Born from the intersection of modern industrial design and traditional artisan craftsmanship, SPECTRA creates sunglasses for visionaries, innovators, and leaders who demand distinction in every detail.
          </p>
          <p>
            Each silhouette is developed through over 40 precise manufacturing steps — from precision laser contouring and hand-bevelling to multi-layer anti-reflective coatings. We reject mass production in favor of limited-batch excellence.
          </p>
        </div>

        {/* Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
          {pillars.map((p, i) => (
            <div key={i} className="bg-[#121212] border border-white/[0.06] rounded-2xl p-7">
              <div className="w-12 h-12 rounded-xl bg-[#1a1a1a] flex items-center justify-center mb-5">
                {p.icon}
              </div>
              <h3 className="text-white font-bold text-[15px] mb-2">{p.title}</h3>
              <p className="text-neutral-400 text-[13px] leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="pt-10 text-center">
          <Link
            href="/sunglasses"
            className="inline-flex items-center gap-2 bg-[#c8874a] hover:bg-[#b87840] text-white px-8 py-4 rounded-xl text-[12px] font-bold uppercase tracking-[0.2em] transition-all shadow-xl shadow-[#c8874a]/25"
          >
            Explore The Collection
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}
