"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import ProductCard from "@/components/ProductCard";
import { Search, Loader2 } from "lucide-react";

interface Product {
  id: string;
  name: string;
  subtitle: string;
  price: number;
  compare_price: number | null;
  image_url: string | null;
  slug: string;
  is_new: boolean;
}

function SearchResults() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q") ?? "";
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState(q);

  useEffect(() => {
    if (!q) return;
    setLoading(true);
    const supabase = createClient();
    supabase
      .from("products")
      .select("id, name, subtitle, price, compare_price, image_url, images, slug, is_new")
      .or(`name.ilike.%${q}%,subtitle.ilike.%${q}%,category.ilike.%${q}%,shape.ilike.%${q}%`)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setResults((data as Product[]) ?? []);
        setLoading(false);
      });
  }, [q]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    window.location.href = `/search?q=${encodeURIComponent(query)}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-white">
      {/* Search bar */}
      <form onSubmit={handleSearch} className="flex gap-3 max-w-xl mb-10">
        <div className="flex-1 flex items-center gap-3 bg-white/[0.05] border border-white/[0.1] rounded-xl px-4 py-3.5 focus-within:border-[#c8874a]/50 transition-colors">
          <Search size={16} className="text-white/40 flex-shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search sunglasses..."
            className="flex-1 bg-transparent text-white text-[14px] outline-none placeholder-white/30"
            autoFocus
          />
        </div>
        <button type="submit" className="px-5 py-3 bg-[#c8874a] hover:bg-[#b87840] text-white text-[13px] font-bold rounded-xl transition-colors">
          Search
        </button>
      </form>

      {/* Results header */}
      {q && (
        <div className="mb-6">
          <h1 className="text-[20px] font-bold text-white">
            {loading ? "Searching..." : `${results.length} result${results.length !== 1 ? "s" : ""} for `}
            {!loading && <span className="text-[#c8874a]">&ldquo;{q}&rdquo;</span>}
          </h1>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-48 gap-3">
          <Loader2 size={20} className="animate-spin text-[#c8874a]" />
          <p className="text-[13px] text-white/40">Searching...</p>
        </div>
      ) : q && results.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 gap-3 text-center">
          <p className="text-[16px] font-bold text-white/40">No results found</p>
          <p className="text-[13px] text-white/25">Try searching for &ldquo;Men&rdquo;, &ldquo;Oval&rdquo;, or &ldquo;Polarized&rdquo;</p>
        </div>
      ) : results.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {results.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-48 gap-3 text-center">
          <Search size={32} className="text-white/20" />
          <p className="text-[14px] text-white/40">Enter a search term above</p>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-48 gap-3">
        <Loader2 size={20} className="animate-spin text-[#c8874a]" />
      </div>
    }>
      <SearchResults />
    </Suspense>
  );
}
