import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");
    const productSlug = searchParams.get("productSlug");

    const supabase = await createClient();

    let query = supabase
      .from("reviews")
      .select("id, product_id, product_slug, user_name, rating, title, comment, is_verified_buyer, status, created_at")
      .eq("status", "approved")
      .order("created_at", { ascending: false });

    if (productId) {
      query = query.eq("product_id", productId);
    } else if (productSlug) {
      query = query.eq("product_slug", productSlug);
    }

    const { data: reviews, error } = await query;

    if (error) {
      // If table doesn't exist yet in Supabase (PGRST205), return empty state without crashing
      if (error.code === "PGRST205" || error.message?.includes("does not exist")) {
        return NextResponse.json({
          reviews: [],
          totalCount: 0,
          averageRating: 0,
          ratingBreakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        });
      }
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const list = reviews || [];
    const totalCount = list.length;
    const ratingBreakdown: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

    let sum = 0;
    for (const r of list) {
      const star = Math.min(5, Math.max(1, Number(r.rating) || 5));
      ratingBreakdown[star] = (ratingBreakdown[star] || 0) + 1;
      sum += star;
    }

    const averageRating = totalCount > 0 ? Number((sum / totalCount).toFixed(1)) : 0;

    return NextResponse.json({
      reviews: list,
      totalCount,
      averageRating,
      ratingBreakdown,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load reviews" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();

    // 1. Enforce Authentication Guard (Only logged-in users can post reviews)
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Exclusive to registered clients. Please sign in to share your review." },
        { status: 401 }
      );
    }

    // 2. Parse and validate review payload
    const body = await req.json();
    const { productId, productSlug, rating, title, comment, displayName } = body;

    const parsedRating = Math.min(5, Math.max(1, Math.round(Number(rating))));
    if (isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5) {
      return NextResponse.json(
        { error: "Please select a valid rating between 1 and 5 stars." },
        { status: 400 }
      );
    }

    if (!comment || typeof comment !== "string" || comment.trim().length < 3) {
      return NextResponse.json(
        { error: "Please write a comment with at least 3 characters describing your experience." },
        { status: 400 }
      );
    }

    const reviewerName =
      (displayName && typeof displayName === "string" && displayName.trim()) ||
      user.user_metadata?.full_name ||
      user.email?.split("@")[0] ||
      "Verified Client";

    // 3. Insert review into Supabase
    const { data: newReview, error: insertError } = await supabase
      .from("reviews")
      .insert({
        product_id: productId || null,
        product_slug: productSlug || null,
        user_id: user.id,
        user_name: reviewerName,
        user_email: user.email || "",
        rating: parsedRating,
        title: title?.trim() || null,
        comment: comment.trim(),
        is_verified_buyer: true,
        status: "approved",
      })
      .select()
      .single();

    if (insertError) {
      if (insertError.code === "PGRST205") {
        return NextResponse.json(
          {
            error:
              "Reviews database table is initializing. Please run supabase/reviews.sql in Supabase SQL Editor.",
          },
          { status: 503 }
        );
      }
      return NextResponse.json({ error: insertError.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: "Your review has been shared successfully.",
      review: newReview,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to submit review" },
      { status: 500 }
    );
  }
}
