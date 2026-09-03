"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, X, Loader2, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Product {
  id: string;
  name: string;
  subtitle: string;
  price: number;
  image_url: string | null;
  slug: string;
  category: string;
}

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 60);
    } else {
      setQuery("");
      setResults([]);
    }
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const search = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("products")
      .select("id, name, subtitle, price, image_url, slug, category")
      .or(`name.ilike.%${q}%,subtitle.ilike.%${q}%,category.ilike.%${q}%`)
      .eq("status", "active")
      .limit(8);
    setResults((data as Product[]) ?? []);
    setLoading(false);
  }, []);

  const handleInput = (val: string) => {
    setQuery(val);
    if (!val.trim()) {
      setResults([]);
      setLoading(false);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(val), 250);
  };

  if (!isOpen) return null;

  const hasQuery = query.trim().length > 0;

  return (
    <div className="fixed inset-0 z-[60] flex flex-col items-center pt-[12vh] sm:pt-[15vh] px-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity duration-200"
        onClick={onClose}
      />

      {/* Search Bar Container */}
      <div className="relative w-full max-w-2xl bg-[#111111] border border-white/[0.12] rounded-sm shadow-2xl shadow-black/80 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Search Input Row */}
        <div className="flex items-center gap-3 px-4 sm:px-5 py-3.5 sm:py-4 bg-[#141414]">
          {loading ? (
            <Loader2 size={18} className="text-[#c8874a] animate-spin flex-shrink-0" />
          ) : (
            <Search size={18} className="text-white/40 flex-shrink-0" />
          )}

          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleInput(e.target.value)}
            placeholder="Search sunglasses, styles, shapes..."
            className="flex-1 bg-transparent text-white text-[14px] sm:text-[15px] outline-none placeholder-white/30 font-medium"
          />

          {hasQuery && (
            <button
              type="button"
              onClick={() => handleInput("")}
              className="text-[11px] font-semibold text-white/40 hover:text-white transition-colors px-1"
            >
              Clear
            </button>
          )}

          <button
            onClick={onClose}
            className="w-7 h-7 rounded-sm bg-white/[0.06] hover:bg-white/[0.12] flex items-center justify-center text-white/50 hover:text-white transition-colors flex-shrink-0 cursor-pointer"
            aria-label="Close search"
          >
            <X size={14} />
          </button>
        </div>

        {/* Results Box (Only renders when user enters a search query) */}
        {hasQuery && (
          <div className="border-t border-white/[0.08] max-h-[420px] overflow-y-auto no-scrollbar bg-[#0f0f0f]">
            {loading ? (
              <div className="py-10 flex items-center justify-center gap-2.5 text-white/40 text-[12px]">
                <Loader2 size={16} className="animate-spin text-[#c8874a]" />
                <span>Searching catalog...</span>
              </div>
            ) : results.length === 0 ? (
              <div className="px-5 py-10 text-center">
                <p className="text-[13px] font-semibold text-white/60">
                  No products found for &ldquo;{query}&rdquo;
                </p>
                <p className="text-[11px] text-white/30 mt-1">
                  Try checking the spelling or searching another style
                </p>
              </div>
            ) : (
              <div>
                <div className="px-5 py-2.5 text-[9.5px] font-bold text-white/40 uppercase tracking-widest border-b border-white/[0.04] bg-white/[0.02] flex items-center justify-between">
                  <span>Results</span>
                  <span className="text-[#c8874a]">{results.length} found</span>
                </div>

                {results.map((product) => {
                  const safeSlug = (product.slug || product.name || product.id)
                    .toLowerCase()
                    .trim()
                    .replace(/[^a-z0-9]+/g, "-")
                    .replace(/^-+|-+$/g, "");
                  return (
                    <Link
                      key={product.id}
                      href={`/products/${safeSlug}`}
                      scroll={true}
                      onClick={onClose}
                      className="flex items-center gap-3.5 px-5 py-3 hover:bg-white/[0.04] transition-colors border-b border-white/[0.04] group"
                    >
                    {/* Product Thumbnail */}
                    <div className="w-12 h-12 flex-shrink-0 overflow-hidden relative">
                      {product.image_url ? (
                        <Image
                          src={product.image_url}
                          alt={product.name}
                          fill
                          className="object-contain p-1 group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <Search size={14} className="absolute inset-0 m-auto text-white/20" />
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-bold text-white group-hover:text-[#c8874a] transition-colors truncate">
                        {product.name}
                      </p>
                      <p className="text-[11px] text-white/40 truncate">
                        {product.subtitle || product.category}
                      </p>
                    </div>

                    {/* Price & Arrow */}
                    <div className="text-right flex-shrink-0 flex items-center gap-2">
                      <p className="text-[13px] font-bold text-[#c8874a]">
                        ₹{product.price.toLocaleString("en-IN")}
                      </p>
                      <ArrowRight
                        size={13}
                        className="text-white/20 group-hover:text-[#c8874a] group-hover:translate-x-0.5 transition-all"
                      />
                    </div>
                  </Link>
                );
              })}

                {/* View All Matching */}
                <Link
                  href={`/search?q=${encodeURIComponent(query)}`}
                  onClick={onClose}
                  className="flex items-center justify-center gap-1.5 px-5 py-3 text-[11.5px] font-bold text-[#c8874a] hover:bg-[#c8874a]/10 transition-colors uppercase tracking-wider border-t border-white/[0.04]"
                >
                  <span>View all results for &ldquo;{query}&rdquo;</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
