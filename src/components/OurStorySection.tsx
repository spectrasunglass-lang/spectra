import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

interface OurStorySectionProps {
  storyImageUrl?: string | null;
}

export default function OurStorySection({ storyImageUrl }: OurStorySectionProps) {
  return (
    <section className="bg-[#0a0a0a] py-14 md:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Text content */}
          <div>
            <p className="section-label mb-4">Our Story</p>
            <h2 className="text-white font-bold uppercase leading-[1.05] mb-5">
              <span className="block text-3xl sm:text-4xl md:text-5xl tracking-tight">
                BUILT TO
              </span>
              <span className="block text-3xl sm:text-4xl md:text-5xl tracking-tight">
                BE SEEN
              </span>
            </h2>
            <p className="text-neutral-400 text-sm md:text-[15px] leading-relaxed mb-6 max-w-md">
              SPECTRA is more than eyewear.
              <br />
              It&apos;s a mindset.
              <br />
              Confidence in every detail.
              <br />
              Clarity in every view.
            </p>
            <Link
              href="/about"
              className="inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.2em] uppercase"
              style={{ color: "#c8874a" }}
            >
              DISCOVER OUR JOURNEY
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Story image — empty slot for admin upload */}
          <div className="relative w-full aspect-[3/4] max-h-[480px] bg-[#141414] overflow-hidden">
            {storyImageUrl ? (
              <Image
                src={storyImageUrl}
                alt="SPECTRA Story"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            ) : (
              /* Placeholder when no image uploaded from admin */
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center opacity-20">
                  <svg
                    width="48"
                    height="48"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="1"
                    className="mx-auto mb-2"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <path d="m21 15-5-5L5 21" />
                  </svg>
                  <p className="text-white text-xs tracking-widest uppercase">
                    Story Image
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
