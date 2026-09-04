"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Star,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Trash2,
  RefreshCw,
  Loader2,
  ExternalLink,
  ShieldCheck,
  Filter,
  Copy,
  Check,
  AlertCircle,
  MessageSquareQuote,
  ShoppingBag,
} from "lucide-react";

interface ProductInfo {
  id: string;
  name: string;
  image_url: string | null;
  slug: string;
}

interface AdminReview {
  id: string;
  product_id?: string;
  product_slug?: string;
  user_id?: string;
  user_name: string;
  user_email: string;
  rating: number;
  title?: string | null;
  comment: string;
  is_verified_buyer: boolean;
  status: "approved" | "pending" | "rejected";
  created_at: string;
  products?: ProductInfo | null;
}

interface ReviewStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  averageRating: number;
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [stats, setStats] = useState<ReviewStats>({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    averageRating: 0,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "approved" | "pending" | "rejected">("all");
  const [starFilter, setStarFilter] = useState<number | 0>(0);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [needsMigration, setNeedsMigration] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (search.trim()) params.set("search", search.trim());

      const res = await fetch(`/api/admin/reviews?${params.toString()}`);
      const data = await res.json();

      if (res.ok && data) {
        setReviews(data.reviews || []);
        setStats(data.stats || { total: 0, pending: 0, approved: 0, rejected: 0, averageRating: 0 });
        setNeedsMigration(Boolean(data.needsMigration));
      }
    } catch {
      // Clean fallback
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  // Update Status Action
  const handleUpdateStatus = async (id: string, newStatus: "approved" | "pending" | "rejected") => {
    try {
      setUpdatingId(id);
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        setReviews((prev) =>
          prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
        );
        fetchReviews();
      }
    } catch {
      // Handle error
    } finally {
      setUpdatingId(null);
    }
  };

  // Delete Action
  const handleDeleteReview = async (id: string) => {
    if (!window.confirm("Are you sure you want to permanently delete this customer review?")) {
      return;
    }

    try {
      setDeletingId(id);
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setReviews((prev) => prev.filter((r) => r.id !== id));
        fetchReviews();
      }
    } catch {
      // Handle error
    } finally {
      setDeletingId(null);
    }
  };

  const copyMigrationSql = () => {
    const sql = `-- Run this in Supabase SQL Editor:
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    product_slug TEXT,
    user_id UUID,
    user_name TEXT NOT NULL,
    user_email TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title TEXT,
    comment TEXT NOT NULL,
    is_verified_buyer BOOLEAN DEFAULT true,
    status TEXT NOT NULL DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access on approved reviews" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Allow full access on reviews" ON public.reviews FOR ALL USING (true) WITH CHECK (true);
ALTER PUBLICATION supabase_realtime ADD TABLE public.reviews;`;

    navigator.clipboard.writeText(sql);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  const filteredReviews = starFilter > 0
    ? reviews.filter((r) => r.rating === starFilter)
    : reviews;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white uppercase">
            Client Reviews &amp; Ratings
          </h1>
          <p className="text-[13px] text-neutral-400 mt-1">
            Moderate and curate authentic feedback from verified SPECTRA patrons.
          </p>
        </div>

        <button
          onClick={() => fetchReviews()}
          disabled={loading}
          className="self-start sm:self-auto flex items-center gap-2 px-4 py-2 bg-[#181818] hover:bg-[#222222] border border-white/[0.08] text-white text-[11.5px] font-bold uppercase tracking-wider rounded-sm transition-colors cursor-pointer disabled:opacity-50"
        >
          <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Migration Notice Banner if table doesn't exist */}
      {needsMigration && (
        <div className="p-5 bg-[#18140c] border border-[#c8874a]/40 rounded-sm text-neutral-200">
          <div className="flex items-start gap-3.5">
            <AlertCircle className="w-5 h-5 text-[#c8874a] flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Database Migration Required
              </h3>
              <p className="text-[12.5px] text-neutral-300 mt-1 leading-relaxed">
                The <code className="text-[#c8874a] bg-black/40 px-1 py-0.5 rounded">public.reviews</code> table has not yet been executed in your Supabase SQL Editor. We have generated the complete migration script in <code className="text-[#c8874a] bg-black/40 px-1 py-0.5 rounded">supabase/reviews.sql</code>.
              </p>
              <div className="mt-3 flex items-center gap-3">
                <button
                  onClick={copyMigrationSql}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#c8874a] hover:bg-[#b87840] text-white text-[11px] font-bold uppercase tracking-wider rounded-sm transition-colors cursor-pointer"
                >
                  {copiedSql ? <Check size={13} /> : <Copy size={13} />}
                  {copiedSql ? "SQL Copied to Clipboard!" : "Copy SQL Script"}
                </button>
                <a
                  href="https://supabase.com/dashboard"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] text-neutral-400 hover:text-white underline"
                >
                  Open Supabase SQL Editor <ExternalLink size={11} />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats Counter Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 sm:p-5 bg-[#141414] border border-white/[0.06] rounded-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold tracking-[0.2em] text-neutral-400 uppercase">
              Total Reviews
            </span>
            <MessageSquareQuote size={16} className="text-neutral-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-white mt-2">
            {stats.total}
          </p>
          <p className="text-[11px] text-neutral-500 mt-0.5">Across all frames</p>
        </div>

        <div className="p-4 sm:p-5 bg-[#141414] border border-white/[0.06] rounded-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold tracking-[0.2em] text-[#c8874a] uppercase">
              Average Rating
            </span>
            <Star size={16} className="text-[#c8874a] fill-[#c8874a]" />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <p className="text-2xl sm:text-3xl font-black text-white">
              {stats.averageRating > 0 ? stats.averageRating.toFixed(1) : "—"}
            </p>
            <span className="text-neutral-500 text-xs">/ 5.0</span>
          </div>
          <p className="text-[11px] text-neutral-500 mt-0.5">Verified satisfaction</p>
        </div>

        <div className="p-4 sm:p-5 bg-[#141414] border border-white/[0.06] rounded-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold tracking-[0.2em] text-emerald-400 uppercase">
              Approved
            </span>
            <CheckCircle2 size={16} className="text-emerald-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-white mt-2">
            {stats.approved}
          </p>
          <p className="text-[11px] text-neutral-500 mt-0.5">Live on storefront</p>
        </div>

        <div className="p-4 sm:p-5 bg-[#141414] border border-white/[0.06] rounded-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold tracking-[0.2em] text-amber-400 uppercase">
              Pending Moderation
            </span>
            <Clock size={16} className="text-amber-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-white mt-2">
            {stats.pending}
          </p>
          <p className="text-[11px] text-neutral-500 mt-0.5">Awaiting action</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-[#141414] border border-white/[0.06] rounded-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          {/* Search Box */}
          <div className="relative w-full md:w-96">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by customer, email, product..."
              className="w-full pl-10 pr-4 py-2 bg-[#1c1c1c] border border-white/[0.08] rounded-sm text-white text-[12.5px] placeholder:text-neutral-500 focus:outline-none focus:border-[#c8874a] transition-colors"
            />
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            {(["all", "approved", "pending", "rejected"] as const).map((tab) => {
              const active = statusFilter === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setStatusFilter(tab)}
                  className={`px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider rounded-sm transition-colors cursor-pointer whitespace-nowrap ${
                    active
                      ? "bg-[#c8874a] text-white"
                      : "bg-[#1c1c1c] text-neutral-400 hover:text-white"
                  }`}
                >
                  {tab}
                </button>
              );
            })}
          </div>
        </div>

        {/* Star Rating Quick Filter */}
        <div className="flex items-center gap-2 pt-2 border-t border-white/[0.04] text-[11.5px] text-neutral-400 overflow-x-auto">
          <span className="text-[10.5px] font-bold tracking-wider uppercase text-neutral-500 flex items-center gap-1">
            <Filter size={11} /> Rating:
          </span>
          <button
            onClick={() => setStarFilter(0)}
            className={`px-2 py-0.5 rounded-sm transition-colors cursor-pointer ${
              starFilter === 0 ? "text-[#c8874a] font-bold" : "hover:text-white"
            }`}
          >
            All Stars
          </button>
          {[5, 4, 3, 2, 1].map((s) => (
            <button
              key={s}
              onClick={() => setStarFilter(starFilter === s ? 0 : s)}
              className={`flex items-center gap-1 px-2 py-0.5 rounded-sm transition-colors cursor-pointer ${
                starFilter === s ? "bg-[#c8874a]/20 text-[#c8874a] font-bold border border-[#c8874a]/30" : "hover:text-white"
              }`}
            >
              {s} <Star size={11} className="fill-[#c8874a] text-[#c8874a]" />
            </button>
          ))}
        </div>
      </div>

      {/* Reviews Content Table / Cards */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3 text-neutral-500">
          <Loader2 size={24} className="animate-spin text-[#c8874a]" />
          <p className="text-[12px] uppercase tracking-wider">Loading reviews...</p>
        </div>
      ) : filteredReviews.length === 0 ? (
        <div className="py-20 text-center bg-[#141414] border border-white/[0.06] rounded-sm p-8">
          <MessageSquareQuote size={36} className="text-neutral-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white uppercase tracking-wider">
            No Reviews Found
          </h3>
          <p className="text-[13px] text-neutral-400 mt-1 max-w-sm mx-auto">
            {search || statusFilter !== "all" || starFilter > 0
              ? "No reviews match your current search and filter criteria."
              : "No customer reviews have been submitted yet. They will automatically appear here once customers post reviews."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReviews.map((review) => {
            const isUpdating = updatingId === review.id;
            const isDeleting = deletingId === review.id;
            const product = review.products;
            const formattedDate = new Date(review.created_at).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <div
                key={review.id}
                className="p-5 bg-[#141414] border border-white/[0.06] hover:border-white/[0.12] rounded-sm transition-all flex flex-col md:flex-row gap-5 items-start justify-between"
              >
                {/* Left: Product & Customer Info */}
                <div className="flex gap-4 min-w-0 flex-1">
                  {/* Product Thumbnail */}
                  <div className="w-14 h-14 bg-white rounded-sm overflow-hidden flex-shrink-0 flex items-center justify-center p-1 border border-white/10">
                    {product?.image_url ? (
                      <Image
                        src={product.image_url}
                        alt={product.name || "Product"}
                        width={56}
                        height={56}
                        className="object-contain"
                      />
                    ) : (
                      <ShoppingBag size={20} className="text-neutral-400" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    {/* Product Name Link */}
                    {product?.slug ? (
                      <Link
                        href={`/products/${product.slug}`}
                        target="_blank"
                        className="text-[11px] font-bold text-[#c8874a] hover:underline uppercase tracking-wider flex items-center gap-1 truncate"
                      >
                        {product.name}
                        <ExternalLink size={10} />
                      </Link>
                    ) : (
                      <p className="text-[11px] font-bold text-[#c8874a] uppercase tracking-wider truncate">
                        {review.product_slug || "General Product"}
                      </p>
                    )}

                    {/* Customer Info */}
                    <div className="flex items-center gap-2 mt-0.5">
                      <h4 className="text-[14px] font-bold text-white truncate">
                        {review.user_name}
                      </h4>
                      {review.is_verified_buyer && (
                        <span className="flex items-center gap-0.5 text-[9.5px] font-bold text-[#c8874a] uppercase tracking-wider bg-[#c8874a]/10 px-1.5 py-0.2 rounded-[2px]">
                          <ShieldCheck size={11} /> Verified
                        </span>
                      )}
                    </div>
                    <p className="text-[11.5px] text-neutral-500 font-mono">
                      {review.user_email} • {formattedDate}
                    </p>

                    {/* Star Rating & Title */}
                    <div className="flex items-center gap-2 mt-2.5">
                      <div className="flex items-center text-[#c8874a]">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            size={13}
                            className={
                              s <= review.rating
                                ? "fill-[#c8874a] text-[#c8874a]"
                                : "text-neutral-700"
                            }
                          />
                        ))}
                      </div>
                      <span className="text-[12px] font-bold text-neutral-300">
                        ({review.rating}/5)
                      </span>
                      {review.title && (
                        <span className="text-[13px] font-bold text-white truncate">
                          — &ldquo;{review.title}&rdquo;
                        </span>
                      )}
                    </div>

                    {/* Comment Body */}
                    <p className="text-[13px] text-neutral-300 mt-1.5 leading-relaxed bg-[#181818]/60 p-3 rounded-sm border border-white/[0.03]">
                      {review.comment}
                    </p>
                  </div>
                </div>

                {/* Right: Status Badge & Action Buttons */}
                <div className="flex flex-row md:flex-col items-center md:items-end justify-between w-full md:w-auto gap-3 flex-shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-white/[0.04]">
                  {/* Status Badge */}
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[2px] text-[10px] font-bold uppercase tracking-wider ${
                      review.status === "approved"
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                        : review.status === "pending"
                        ? "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                        : "bg-rose-500/10 text-rose-400 border border-rose-500/30"
                    }`}
                  >
                    {review.status === "approved" && <CheckCircle2 size={11} />}
                    {review.status === "pending" && <Clock size={11} />}
                    {review.status === "rejected" && <XCircle size={11} />}
                    {review.status}
                  </span>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5">
                    {review.status !== "approved" && (
                      <button
                        onClick={() => handleUpdateStatus(review.id, "approved")}
                        disabled={isUpdating}
                        className="px-2.5 py-1.5 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-600/40 text-[10.5px] font-bold uppercase tracking-wider rounded-sm transition-colors flex items-center gap-1 cursor-pointer"
                        title="Approve review"
                      >
                        <CheckCircle2 size={12} />
                        Approve
                      </button>
                    )}

                    {review.status !== "rejected" && (
                      <button
                        onClick={() => handleUpdateStatus(review.id, "rejected")}
                        disabled={isUpdating}
                        className="px-2.5 py-1.5 bg-neutral-800 hover:bg-rose-950 text-neutral-400 hover:text-rose-300 border border-white/[0.08] text-[10.5px] font-bold uppercase tracking-wider rounded-sm transition-colors flex items-center gap-1 cursor-pointer"
                        title="Reject review"
                      >
                        <XCircle size={12} />
                        Reject
                      </button>
                    )}

                    <button
                      onClick={() => handleDeleteReview(review.id)}
                      disabled={isDeleting}
                      className="p-1.5 text-neutral-500 hover:text-rose-400 hover:bg-rose-950/40 rounded-sm transition-colors cursor-pointer"
                      title="Permanently delete review"
                    >
                      {isDeleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
