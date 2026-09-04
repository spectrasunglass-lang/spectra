"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Star,
  CheckCircle2,
  Lock,
  X,
  MessageSquareQuote,
  Loader2,
  User,
  ShieldCheck,
  ChevronDown,
  Filter,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export interface ReviewItem {
  id: string;
  product_id?: string;
  product_slug?: string;
  user_name: string;
  rating: number;
  title?: string | null;
  comment: string;
  is_verified_buyer: boolean;
  status: string;
  created_at: string;
}

interface ProductReviewsProps {
  productId?: string | null;
  productSlug?: string | null;
  productName: string;
}

export default function ProductReviews({
  productId,
  productSlug,
  productName,
}: ProductReviewsProps) {
  const pathname = usePathname();
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const [ratingBreakdown, setRatingBreakdown] = useState<Record<number, number>>({
    5: 0,
    4: 0,
    3: 0,
    2: 0,
    1: 0,
  });
  const [loading, setLoading] = useState(true);

  // Authentication state
  const [currentUser, setCurrentUser] = useState<{ id: string; email?: string; fullName?: string } | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  // Modals & Form
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [selectedStarFilter, setSelectedStarFilter] = useState<number | null>(null);

  // Review Form state
  const [formRating, setFormRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [formTitle, setFormTitle] = useState("");
  const [formComment, setFormComment] = useState("");
  const [formDisplayName, setFormDisplayName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState(false);

  // Check auth
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const supabase = createClient();
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user) {
          setCurrentUser({
            id: session.user.id,
            email: session.user.email,
            fullName: session.user.user_metadata?.full_name || session.user.email?.split("@")[0],
          });
          setFormDisplayName(session.user.user_metadata?.full_name || session.user.email?.split("@")[0] || "");
        } else {
          setCurrentUser(null);
        }
      } catch {
        setCurrentUser(null);
      } finally {
        setAuthChecked(true);
      }
    };
    checkAuth();
  }, []);

  // Fetch reviews
  const loadReviews = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (productId) params.set("productId", productId);
      else if (productSlug) params.set("productSlug", productSlug);

      const res = await fetch(`/api/reviews?${params.toString()}`);
      const data = await res.json();

      if (res.ok && data) {
        setReviews(data.reviews || []);
        setTotalCount(data.totalCount || 0);
        setAverageRating(data.averageRating || 0);
        setRatingBreakdown(data.ratingBreakdown || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 });
      }
    } catch {
      // Fallback cleanly
    } finally {
      setLoading(false);
    }
  }, [productId, productSlug]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  // Handle Write Review Click
  const handleOpenWriteReview = () => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
    } else {
      setFormError(null);
      setFormSuccess(false);
      setIsWriteModalOpen(true);
    }
  };

  // Handle Review Submission
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setIsWriteModalOpen(false);
      setIsAuthModalOpen(true);
      return;
    }

    if (!formComment.trim() || formComment.trim().length < 3) {
      setFormError("Please write a few words about your experience (minimum 3 characters).");
      return;
    }

    setSubmitting(true);
    setFormError(null);

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          productSlug,
          rating: formRating,
          title: formTitle.trim(),
          comment: formComment.trim(),
          displayName: formDisplayName.trim(),
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        setFormError(result.error || "Failed to submit review. Please try again.");
        setSubmitting(false);
        return;
      }

      setFormSuccess(true);
      setTimeout(() => {
        setIsWriteModalOpen(false);
        setFormTitle("");
        setFormComment("");
        setFormSuccess(false);
        loadReviews();
      }, 1400);
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredReviews = selectedStarFilter
    ? reviews.filter((r) => r.rating === selectedStarFilter)
    : reviews;

  const starDescriptions: Record<number, string> = {
    5: "Exceptional — Masterpiece Quality",
    4: "Great — Highly Recommended",
    3: "Good — Satisfactory",
    2: "Fair — Needs Improvement",
    1: "Poor — Did Not Meet Expectations",
  };

  return (
    <section id="reviews" className="py-14 sm:py-20 border-t border-white/[0.08] text-white">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between pb-10 border-b border-white/[0.08] gap-6">
          <div>
            <p className="text-[10px] sm:text-[10.5px] font-bold tracking-[0.3em] uppercase text-[#c8874a] mb-2">
              Authentic Client Testimonials
            </p>
            <h2 className="text-2xl sm:text-4xl font-bold uppercase tracking-tight text-white">
              Reviews &amp; Ratings
            </h2>
            <p className="text-neutral-400 text-[13px] sm:text-[14px] mt-1.5 max-w-xl">
              Verified experiences from collectors who wear {productName}.
            </p>
          </div>

          <button
            onClick={handleOpenWriteReview}
            className="self-start sm:self-auto px-6 py-3 bg-[#c8874a] hover:bg-[#b87840] text-white text-[11px] sm:text-[11.5px] font-bold uppercase tracking-[0.2em] rounded-sm transition-all duration-200 shadow-xl shadow-[#c8874a]/20 cursor-pointer"
          >
            Write a Review
          </button>
        </div>

        {/* Rating Breakdown & Stats Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 py-10 border-b border-white/[0.08] items-center">
          {/* Overall Score */}
          <div className="lg:col-span-4 flex flex-col items-center sm:items-start text-center sm:text-left sm:border-r sm:border-white/[0.08] pr-0 sm:pr-8">
            <div className="flex items-baseline gap-3">
              <span className="text-5xl sm:text-6xl font-black tracking-tight text-white">
                {totalCount > 0 ? averageRating.toFixed(1) : "5.0"}
              </span>
              <span className="text-neutral-500 text-lg font-semibold">/ 5.0</span>
            </div>

            <div className="flex items-center gap-1 mt-2 text-[#c8874a]">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  size={18}
                  className={
                    s <= Math.round(totalCount > 0 ? averageRating : 5)
                      ? "fill-[#c8874a] text-[#c8874a]"
                      : "text-neutral-700"
                  }
                />
              ))}
            </div>

            <p className="text-[12.5px] text-neutral-400 mt-2 font-medium">
              Based on {totalCount} verified {totalCount === 1 ? "review" : "reviews"}
            </p>

            <div className="mt-4 flex items-center gap-2 text-[11px] text-[#c8874a] bg-[#c8874a]/10 border border-[#c8874a]/20 px-3 py-1.5 rounded-sm">
              <ShieldCheck size={14} />
              <span>100% Verified Buyer Protection</span>
            </div>
          </div>

          {/* Star Distribution Bars */}
          <div className="lg:col-span-8 space-y-2.5 max-w-xl">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = ratingBreakdown[star] || 0;
              const percent = totalCount > 0 ? Math.round((count / totalCount) * 100) : star === 5 ? 100 : 0;
              const isFilterActive = selectedStarFilter === star;

              return (
                <button
                  key={star}
                  onClick={() => setSelectedStarFilter(isFilterActive ? null : star)}
                  className={`w-full flex items-center gap-3 text-[12px] group transition-opacity cursor-pointer ${
                    selectedStarFilter && !isFilterActive ? "opacity-40" : "opacity-100"
                  }`}
                >
                  <span className="w-10 text-right font-bold text-neutral-300 flex items-center justify-end gap-1">
                    {star} <Star size={11} className="fill-[#c8874a] text-[#c8874a]" />
                  </span>

                  <div className="flex-1 h-2 bg-neutral-800 rounded-full overflow-hidden relative">
                    <div
                      className="h-full bg-[#c8874a] rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${percent}%` }}
                    />
                  </div>

                  <span className="w-12 text-left font-mono text-[11px] text-neutral-400 group-hover:text-white">
                    {percent}%
                  </span>
                </button>
              );
            })}

            {selectedStarFilter && (
              <div className="pt-2 flex items-center gap-2">
                <span className="text-[11px] text-[#c8874a]">
                  Filtering by {selectedStarFilter} Stars ({filteredReviews.length} reviews)
                </span>
                <button
                  onClick={() => setSelectedStarFilter(null)}
                  className="text-[11px] text-neutral-400 hover:text-white underline cursor-pointer"
                >
                  Clear Filter
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Reviews List */}
        <div className="pt-10">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3 text-neutral-500">
              <Loader2 size={24} className="animate-spin text-[#c8874a]" />
              <p className="text-[12px] uppercase tracking-widest">Loading testimonials...</p>
            </div>
          ) : filteredReviews.length === 0 ? (
            <div className="py-16 text-center max-w-md mx-auto">
              <div className="w-14 h-14 rounded-full bg-[#161616] border border-white/[0.08] flex items-center justify-center text-[#c8874a] mx-auto mb-3.5">
                <MessageSquareQuote size={24} />
              </div>
              <h3 className="text-lg font-bold text-white uppercase">Be the First Connoisseur</h3>
              <p className="text-neutral-400 text-[13px] mt-1.5 mb-6">
                No reviews recorded yet for {productName}. Share your optical experience to guide fellow patrons.
              </p>
              <button
                onClick={handleOpenWriteReview}
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#c8874a] hover:bg-[#b87840] text-white text-[11.5px] font-bold uppercase tracking-[0.18em] rounded-sm transition-all shadow-lg shadow-[#c8874a]/20 cursor-pointer"
              >
                Write the First Review
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
              {filteredReviews.map((review) => {
                const initials = review.user_name
                  .split(" ")
                  .map((n) => n[0])
                  .filter(Boolean)
                  .slice(0, 2)
                  .join("")
                  .toUpperCase() || "SC";

                const formattedDate = new Date(review.created_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                });

                return (
                  <div
                    key={review.id}
                    className="p-5 sm:p-6 rounded-sm bg-[#121212]/80 border border-white/[0.07] hover:border-white/[0.15] transition-all flex flex-col justify-between"
                  >
                    <div>
                      {/* Rating Stars & Date */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-1 text-[#c8874a]">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              size={14}
                              className={
                                s <= review.rating
                                  ? "fill-[#c8874a] text-[#c8874a]"
                                  : "text-neutral-700"
                              }
                            />
                          ))}
                        </div>
                        <span className="text-[11px] text-neutral-500 font-mono">
                          {formattedDate}
                        </span>
                      </div>

                      {/* Title */}
                      {review.title && (
                        <h4 className="text-[14px] sm:text-[15px] font-bold text-white mb-2 leading-snug">
                          {review.title}
                        </h4>
                      )}

                      {/* Comment Body */}
                      <p className="text-[13px] text-neutral-300 leading-relaxed">
                        {review.comment}
                      </p>
                    </div>

                    {/* Reviewer signature */}
                    <div className="mt-5 pt-4 border-t border-white/[0.06] flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-[#1c1c1c] border border-[#c8874a]/30 flex items-center justify-center text-[10px] font-bold text-[#c8874a]">
                          {initials}
                        </div>
                        <span className="text-[12px] font-bold text-neutral-200">
                          {review.user_name}
                        </span>
                      </div>

                      {review.is_verified_buyer && (
                        <span className="flex items-center gap-1 text-[10px] font-bold tracking-wider text-[#c8874a] uppercase">
                          <CheckCircle2 size={12} className="text-[#c8874a]" />
                          Verified Buyer
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ─── MODAL 1: AUTHENTICATION BARRIER ─── */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-md bg-[#121212] border border-white/[0.12] rounded-sm p-6 sm:p-8 shadow-2xl">
            <button
              onClick={() => setIsAuthModalOpen(false)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-white p-1 rounded-sm cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="w-14 h-14 rounded-full bg-[#1a1a1a] border border-[#c8874a]/30 flex items-center justify-center text-[#c8874a] mx-auto mb-4">
              <Lock size={22} />
            </div>

            <div className="text-center">
              <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#c8874a] mb-1">
                Client Verification
              </p>
              <h3 className="text-xl font-bold uppercase tracking-tight text-white">
                Sign In to Post Review
              </h3>
              <p className="text-neutral-400 text-[12.5px] mt-2 leading-relaxed">
                To guarantee 100% verified, authentic feedback for all collectors, submitting a review is reserved exclusively for signed-in SPECTRA clients.
              </p>
            </div>

            <div className="mt-6 space-y-2.5">
              <Link
                href={`/login?redirect=${encodeURIComponent(pathname + "#reviews")}`}
                className="w-full flex items-center justify-center gap-2 bg-[#c8874a] hover:bg-[#b87840] text-white text-[12px] font-bold py-3.5 rounded-sm tracking-wider uppercase transition-colors shadow-lg shadow-[#c8874a]/20"
              >
                <User size={15} />
                Sign In to Review
              </Link>

              <Link
                href={`/login?tab=register&redirect=${encodeURIComponent(pathname + "#reviews")}`}
                className="w-full flex items-center justify-center gap-2 bg-transparent hover:bg-white/[0.04] border border-white/20 text-neutral-200 hover:text-white text-[12px] font-bold py-3 rounded-sm tracking-wider uppercase transition-colors"
              >
                Register New Account
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL 2: WRITE REVIEW FORM ─── */}
      {isWriteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-fadeIn">
          <div className="relative w-full max-w-lg bg-[#121212] border border-white/[0.12] rounded-sm p-6 sm:p-8 shadow-2xl my-8">
            <button
              onClick={() => setIsWriteModalOpen(false)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-white p-1 rounded-sm cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="mb-6">
              <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-[#c8874a] mb-1">
                Your Authentic Voice
              </p>
              <h3 className="text-xl font-bold uppercase tracking-tight text-white">
                Review {productName}
              </h3>
              <p className="text-neutral-400 text-[12px] mt-1">
                Posting as <span className="text-white font-semibold">{currentUser?.fullName || currentUser?.email}</span>
              </p>
            </div>

            {formSuccess ? (
              <div className="py-10 text-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
                  <CheckCircle2 size={28} />
                </div>
                <h4 className="text-lg font-bold text-white uppercase">Thank You</h4>
                <p className="text-neutral-400 text-[13px]">
                  Your review has been verified and published to the SPECTRA community.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitReview} className="space-y-4">
                {formError && (
                  <div className="p-3 bg-red-950/40 border border-red-800/60 rounded-sm text-red-200 text-[12px]">
                    {formError}
                  </div>
                )}

                {/* Rating Selector */}
                <div>
                  <label className="block text-[11px] font-bold tracking-wider uppercase text-neutral-300 mb-1.5">
                    Your Overall Rating <span className="text-[#c8874a]">*</span>
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const isActive = (hoverRating || formRating) >= star;
                      return (
                        <button
                          key={star}
                          type="button"
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          onClick={() => setFormRating(star)}
                          className="p-1 text-[#c8874a] transition-transform hover:scale-125 cursor-pointer"
                          aria-label={`${star} star`}
                        >
                          <Star
                            size={26}
                            className={
                              isActive
                                ? "fill-[#c8874a] text-[#c8874a]"
                                : "text-neutral-700"
                            }
                          />
                        </button>
                      );
                    })}
                    <span className="text-[11.5px] text-[#c8874a] font-semibold ml-2">
                      {starDescriptions[hoverRating || formRating]}
                    </span>
                  </div>
                </div>

                {/* Headline / Title */}
                <div>
                  <label className="block text-[11px] font-bold tracking-wider uppercase text-neutral-300 mb-1">
                    Review Headline (Optional)
                  </label>
                  <input
                    type="text"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="e.g. Masterpiece craftsmanship, pristine UV lenses"
                    maxLength={100}
                    className="w-full px-3.5 py-2.5 bg-[#181818] border border-white/[0.1] rounded-sm text-white text-[13px] placeholder:text-neutral-600 focus:outline-none focus:border-[#c8874a] transition-colors"
                  />
                </div>

                {/* Detailed Comment */}
                <div>
                  <label className="block text-[11px] font-bold tracking-wider uppercase text-neutral-300 mb-1">
                    Detailed Experience <span className="text-[#c8874a]">*</span>
                  </label>
                  <textarea
                    rows={4}
                    value={formComment}
                    onChange={(e) => setFormComment(e.target.value)}
                    placeholder="Describe frame fit, lens polarization, weight, packaging, or compliments received..."
                    required
                    minLength={3}
                    maxLength={1000}
                    className="w-full px-3.5 py-2.5 bg-[#181818] border border-white/[0.1] rounded-sm text-white text-[13px] placeholder:text-neutral-600 focus:outline-none focus:border-[#c8874a] transition-colors resize-none"
                  />
                </div>

                {/* Display Name */}
                <div>
                  <label className="block text-[11px] font-bold tracking-wider uppercase text-neutral-300 mb-1">
                    Public Display Name
                  </label>
                  <input
                    type="text"
                    value={formDisplayName}
                    onChange={(e) => setFormDisplayName(e.target.value)}
                    placeholder="Your name or initials"
                    maxLength={50}
                    className="w-full px-3.5 py-2.5 bg-[#181818] border border-white/[0.1] rounded-sm text-white text-[13px] placeholder:text-neutral-600 focus:outline-none focus:border-[#c8874a] transition-colors"
                  />
                </div>

                {/* Submit button */}
                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsWriteModalOpen(false)}
                    className="px-4 py-2.5 text-[11px] uppercase font-bold text-neutral-400 hover:text-white transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-3 bg-[#c8874a] hover:bg-[#b87840] disabled:opacity-50 text-white text-[11.5px] font-bold uppercase tracking-wider rounded-sm transition-colors flex items-center gap-2 cursor-pointer shadow-lg shadow-[#c8874a]/20"
                  >
                    {submitting ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        Publishing...
                      </>
                    ) : (
                      "Publish Review"
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
