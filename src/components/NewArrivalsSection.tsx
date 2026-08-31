import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ProductCard, Product } from "./ProductCard";

interface NewArrivalsSectionProps {
  products: Product[];
}

export default function NewArrivalsSection({ products }: NewArrivalsSectionProps) {
  return (
    <section className="bg-white py-14 md:py-20 border-b border-neutral-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header row */}
        <div className="flex items-center justify-between mb-8 md:mb-12">
          <div>
            <h2 className="text-xs md:text-sm font-bold tracking-[0.3em] uppercase text-neutral-900">
              New Arrivals
            </h2>
            <p className="text-[12px] text-neutral-400 mt-1">
              Explore the latest handcrafted frames
            </p>
          </div>
          <Link
            href="/new-arrivals"
            className="flex items-center gap-2 text-[11px] font-bold tracking-[0.2em] uppercase text-neutral-800 hover:text-[#c8874a] transition-colors group"
          >
            View All
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Product grid */}
        {products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-8">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} variant="classic" />
            ))}
          </div>
        ) : (
          /* Empty state */
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex flex-col bg-neutral-50 rounded-2xl p-4 border border-neutral-100">
                <div className="bg-neutral-100 aspect-square rounded-xl animate-pulse" />
                <div className="pt-4 pb-1">
                  <div className="h-3 w-24 bg-neutral-200 rounded animate-pulse mb-2" />
                  <div className="h-2.5 w-16 bg-neutral-100 rounded animate-pulse mb-3" />
                  <div className="h-3.5 w-14 bg-neutral-200 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
