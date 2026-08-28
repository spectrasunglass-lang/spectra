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
      setTimeout(() => inputRef.current?.focus(), 50);
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
    if (!q.trim()) { setResults([]); return; }
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
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(val), 300);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex flex-col items-center pt-[10vh] px-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Search card */}
      <div className="relative w-full max-w-2xl bg-[#111] border border-white/[0.1] rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-4 duration-200">
        {/* Input row */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-white/[0.07]">
          {loading
            ? <Loader2 size={18} className="text-[#c8874a] animate-spin flex-shrink-0" />
            : <Search size={18} className="text-white/40 flex-shrink-0" />
          }
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleInput(e.target.value)}
            placeholder="Search sunglasses, styles, shapes..."
            className="flex-1 bg-transparent text-white text-[15px] outline-none placeholder-white/30"
          />
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] flex items-center justify-center text-white/50 hover:text-white transition-colors flex-shrink-0"
          >
            <X size={15} />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-[420px] overflow-y-auto">
          {!query && (
            <div className="px-5 py-8 text-center">
              <p className="text-[13px] text-white/30">
                Start typing to search our collection
              </p>
              <div className="flex items-center justify-center gap-3 mt-4 flex-wrap">
                {["Men", "Women", "Oval", "Wayfarer", "Polarized"].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => handleInput(tag)}
                    className="px-3 py-1.5 text-[11px] font-semibold text-white/50 border border-white/[0.1] rounded-full hover:border-[#c8874a]/50 hover:text-[#c8874a] transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          {query && results.length === 0 && !loading && (
            <div className="px-5 py-10 text-center">
              <p className="text-[14px] font-semibold text-white/40">
                No results for &ldquo;{query}&rdquo;
              </p>
              <p className="text-[12px] text-white/25 mt-1">
                Try different keywords
              </p>
            </div>
          )}

          {results.length > 0 && (
            <div>
              <p className="px-5 py-2.5 text-[10px] font-bold text-white/30 uppercase tracking-widest border-b border-white/[0.05]">
                {results.length} result{results.length !== 1 ? "s" : ""} for &ldquo;{query}&rdquo;
              </p>
              {results.map((product) => (
                <Link
                  key={product.id}
                  href={`/products/${product.slug}`}
                  onClick={onClose}
                  className="flex items-center gap-4 px-5 py-3.5 hover:bg-white/[0.04] transition-colors border-b border-white/[0.04] group"
                >
                  {/* Image */}
                  <div className="w-14 h-14 rounded-xl bg-[#f5f0eb] flex-shrink-0 overflow-hidden relative">
                    {product.image_url ? (
                      <Image
                        src={product.image_url}
                        alt={product.name}
                        fill
                        className="object-contain p-1.5"
                      />
                    ) : (
                      <Search size={16} className="absolute inset-0 m-auto text-gray-400" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-bold text-white group-hover:text-[#c8874a] transition-colors">
                      {product.name}
                    </p>
                    <p className="text-[11px] text-white/40 mt-0.5">{product.subtitle}</p>
                    <p className="text-[11px] text-white/30 mt-0.5 capitalize">{product.category}</p>
                  </div>

                  {/* Price */}
                  <div className="text-right flex-shrink-0">
                    <p className="text-[14px] font-bold text-[#c8874a]">
                      ₹{product.price.toLocaleString("en-IN")}
                    </p>
                    <ArrowRight size={13} className="text-white/20 group-hover:text-[#c8874a] transition-colors mt-1 ml-auto" />
                  </div>
                </Link>
              ))}

              {/* View all */}
              <Link
                href={`/search?q=${encodeURIComponent(query)}`}
                onClick={onClose}
                className="flex items-center justify-center gap-2 px-5 py-4 text-[12px] font-bold text-[#c8874a] hover:bg-white/[0.04] transition-colors"
              >
                View all results for &ldquo;{query}&rdquo;
                <ArrowRight size={13} />
              </Link>
            </div>
          )}
        </div>

        {/* Footer hint */}
        <div className="px-5 py-3 border-t border-white/[0.05] flex items-center gap-4">
          <span className="text-[10px] text-white/20">Press</span>
          <kbd className="text-[10px] text-white/30 bg-white/[0.06] px-2 py-0.5 rounded font-mono">ESC</kbd>
          <span className="text-[10px] text-white/20">to close</span>
        </div>
      </div>
    </div>
  );
}
