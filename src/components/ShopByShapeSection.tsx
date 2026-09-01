import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

export interface ShapeCategory {
  id?: string;
  name: string;
  slug: string;
  image_url?: string;
}

interface ShopByShapeSectionProps {
  categories?: ShapeCategory[];
  /** Optional slug to Cloudinary URL map from admin Categories page */
  iconUrls?: Record<string, string>;
}

export default function ShopByShapeSection({
  categories = [],
  iconUrls = {},
}: ShopByShapeSectionProps) {
  // Only display shape categories that have an uploaded image
  const displayShapes: ShapeCategory[] =
    categories.length > 0
      ? categories.filter((c) => Boolean(c.image_url?.trim() || iconUrls[c.slug]))
      : Object.entries(iconUrls)
          .filter(([, url]) => Boolean(url?.trim()))
          .map(([slug, url]) => ({
            name: slug.charAt(0).toUpperCase() + slug.slice(1),
            slug,
            image_url: url,
          }));

  // If no shapes have images, do not render the section
  if (displayShapes.length === 0) {
    return null;
  }

  return (
    <section className="bg-white pt-14 pb-7 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 md:mb-12">
          <div>
            <h2 className="text-xs md:text-sm font-bold tracking-[0.3em] uppercase text-neutral-900">
              Shop By Shape
            </h2>
            <p className="hidden sm:block text-[12px] text-neutral-400 mt-1">
              Find the perfect silhouette tailored for your face
            </p>
          </div>
          <Link
            href="/sunglasses"
            className="flex items-center gap-1.5 text-[11px] font-bold tracking-[0.2em] uppercase text-neutral-900 hover:text-[#c8874a] transition-colors group flex-shrink-0"
          >
            <span className="sm:hidden">View All</span>
            <span className="hidden sm:inline">View All Shapes</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Shapes single-line horizontally scrollable container */}
        <div className="flex items-center overflow-x-auto no-scrollbar gap-3 sm:gap-6 pb-4 pt-4 px-1 -mx-1">
          {displayShapes.map((shape) => {
            const imageUrl = shape.image_url || iconUrls[shape.slug];
            const href = `/sunglasses?shape=${shape.slug}`;

            return (
              <Link
                key={shape.slug || shape.name}
                href={href}
                className="flex flex-col items-center group flex-shrink-0"
              >
                {/* Floating Pedestal Box */}
                <div className="w-36 h-36 sm:w-44 sm:h-44 md:w-56 md:h-56 flex items-center justify-center relative mb-3 bg-gradient-to-b from-[#fafafc] via-[#f2f3f7] to-[#e6e7ec] border border-gray-200 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] group-hover:-translate-y-1.5 transition-all duration-300 ease-out rounded-sm">
                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt={shape.name}
                      fill
                      className="object-contain p-3 sm:p-5 group-hover:scale-105 transition-transform duration-500 ease-out"
                      sizes="(max-width: 640px) 144px, (max-width: 768px) 176px, 224px"
                    />
                  ) : null}
                </div>

                {/* Shape Name & Gold indicator */}
                <span className="text-[11px] sm:text-[12px] font-bold tracking-[0.18em] uppercase text-neutral-900 group-hover:text-[#c8874a] transition-colors text-center">
                  {shape.name}
                </span>
                <span className="block h-[2px] w-4 bg-[#c8874a] opacity-0 group-hover:opacity-100 transition-all duration-300 mt-1" />
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
