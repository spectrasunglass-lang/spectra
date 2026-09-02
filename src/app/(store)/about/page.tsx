import React from "react";
import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Our Heritage & Story — SPECTRA",
  description: "Learn about the SPECTRA philosophy, handcrafted eyewear design, and pursuit of optical perfection.",
};

export default function AboutPage() {
  return (
    <div className="bg-[#0a0a0a] min-h-screen text-white pb-20">

      {/* Section 1: Image Left + Content Right */}
      <section className="max-w-6xl mx-auto px-5 sm:px-8 py-16 sm:py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">

          {/* Left: Image Placeholder */}
          <div className="w-full aspect-[4/5] rounded-sm flex items-center justify-center">
            <Image src="/img.jpg" alt="About" width={500} height={500} />
          </div>

          {/* Right: Content */}
          <div className="space-y-6">
            <p className="text-[10.5px] font-bold tracking-[0.3em] uppercase text-[#c8874a]">
              The Maison
            </p>
            <h1 className="text-4xl sm:text-6xl font-bold text-white tracking-tight uppercase">
            Built To Be Seen
          </h1>
            <p className="text-neutral-400 text-sm sm:text-[15px] leading-relaxed">
              SPECTRA was founded on a singular conviction: luxury eyewear shouldn&apos;t just frame the world — it should elevate how you move through it.
            </p>
            <p className="text-neutral-500 text-sm leading-relaxed">
              Born from the intersection of modern industrial design and traditional artisan craftsmanship, SPECTRA creates sunglasses for visionaries, innovators, and leaders who demand distinction in every detail.
            </p>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        <div className="h-px bg-white/[0.06]" />
      </div>

      {/* Section 2: Mission & Vision */}
      <section className="max-w-6xl mx-auto px-5 sm:px-8 py-16 sm:py-24">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">

          {/* Mission */}
          <div className="bg-[#111111] p-8 rounded-sm space-y-4">
            <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#c8874a]">
              Our Mission
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold uppercase tracking-tight text-white">
              Optical Excellence
            </h2>
            <p className="text-sm text-neutral-400 leading-relaxed">
              To engineer precision-crafted eyewear that delivers uncompromised UV protection, visual clarity, and enduring structural integrity — redefining what luxury performance optics truly means.
            </p>
          </div>

          {/* Vision */}
          <div className="bg-[#111111] p-8 rounded-sm space-y-4">
            <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#c8874a]">
              Our Vision
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold uppercase tracking-tight text-white">
              Global Distinction
            </h2>
            <p className="text-sm text-neutral-400 leading-relaxed">
              To become the definitive Indian luxury eyewear maison — celebrated globally for artisan craftsmanship, optical innovation, and a design philosophy that fuses heritage with modernity.
            </p>
          </div>

        </div>
      </section>

    </div>
  );
}
