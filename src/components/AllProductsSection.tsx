"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { ArrowRight, Loader2 } from "lucide-react";
import { ProductCard, Product } from "./ProductCard";
import { createClient } from "@/lib/supabase/client";

interface AllProductsSectionProps {
  initialProducts?: Product[];
}

export default function AllProductsSection({
  initialProducts = [],
}: AllProductsSectionProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialProducts.length >= 8);
  const observerTarget = useRef<HTMLDivElement>(null);

  // If no initial products passed, fetch first batch of 8 on mount
  useEffect(() => {
    if (initialProducts.length === 0) {
      const fetchInitial = async () => {
        setLoading(true);
        const supabase = createClient();
        const { data, error } = await supabase
          .from("products")
          .select("id, name, subtitle, price, compare_price, image_url, images, slug, is_new, shape, category")
          .eq("status", "active")
          .order("created_at", { ascending: false })
          .range(0, 7);

        if (!error && data) {
          const formatted: Product[] = data.map((p) => ({
            id: p.id,
            name: p.name,
            subtitle: p.subtitle || "",
            price: Number(p.price),
            compare_price: p.compare_price ? Number(p.compare_price) : null,
            image_url: p.image_url,
            images: Array.isArray(p.images) ? p.images : [],
            slug: p.slug,
            is_new: Boolean(p.is_new),
            shape: p.shape,
            category: p.category,
          }));
          setProducts(formatted);
          setHasMore(formatted.length >= 8);
        }
        setLoading(false);
      };

      fetchInitial();
    }
  }, [initialProducts]);

  // Load next 8 products when scrolling near bottom
  const loadMoreProducts = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    const supabase = createClient();
    const offset = products.length;

    const { data, error } = await supabase
      .from("products")
      .select("id, name, subtitle, price, compare_price, image_url, images, slug, is_new, shape, category")
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .range(offset, offset + 7);

    if (!error && data) {
      if (data.length < 8) {
        setHasMore(false);
      }

      const newItems: Product[] = data.map((p) => ({
        id: p.id,
        name: p.name,
        subtitle: p.subtitle || "",
        price: Number(p.price),
        compare_price: p.compare_price ? Number(p.compare_price) : null,
        image_url: p.image_url,
        images: Array.isArray(p.images) ? p.images : [],
        slug: p.slug,
        is_new: Boolean(p.is_new),
        shape: p.shape,
        category: p.category,
      }));

      setProducts((prev) => {
        const existingIds = new Set(prev.map((item) => item.id));
        const uniqueNew = newItems.filter((item) => !existingIds.has(item.id));
        return [...prev, ...uniqueNew];
      });
    } else {
      setHasMore(false);
    }

    setLoading(false);
  }, [loading, hasMore, products.length]);

  // Setup Intersection Observer for infinite scrolling
  useEffect(() => {
    const currentTarget = observerTarget.current;
    if (!currentTarget || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadMoreProducts();
        }
      },
      {
        rootMargin: "250px",
        threshold: 0.1,
      }
    );

    observer.observe(currentTarget);

    return () => {
      if (currentTarget) observer.unobserve(currentTarget);
    };
  }, [loadMoreProducts, hasMore, loading]);

  return (
    <section className="bg-white py-7 md:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header row */}
        <div className="flex items-center justify-between mb-8 md:mb-12">
          <div>
            <h2 className="text-xs md:text-sm font-bold tracking-[0.3em] uppercase text-neutral-900">
              All Products
            </h2>
            <p className="text-[12px] text-neutral-400 mt-1 hidden md:block">
              Explore our full collection of visionary eyewear
            </p>
          </div>
          <Link
            href="/sunglasses"
            className="flex items-center gap-2 text-[11px] font-bold tracking-[0.2em] uppercase text-neutral-800 hover:text-[#c8874a] transition-colors group"
          >
            Browse All
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* 4 products per row grid on desktop */}
        {products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 md:gap-3">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : !loading ? (
          /* Empty state */
          <div className="text-center py-16 text-neutral-400">
            <p className="text-sm font-medium">No products found in the database.</p>
          </div>
        ) : null}

        {/* Loading Skeletons when fetching next batch */}
        {loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-8 mt-5 md:mt-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="flex flex-col bg-neutral-50 rounded-2xl p-4 border border-neutral-100 animate-pulse"
              >
                <div className="bg-neutral-100 aspect-square rounded-xl mb-4" />
                <div className="h-3 w-28 bg-neutral-200 rounded mb-2" />
                <div className="h-2.5 w-16 bg-neutral-100 rounded mb-3" />
                <div className="h-3.5 w-20 bg-neutral-200 rounded" />
              </div>
            ))}
          </div>
        )}

        {/* Scroll Sentinel */}
        <div ref={observerTarget} className="h-8 w-full" />
      </div>
    </section>
  );
}
