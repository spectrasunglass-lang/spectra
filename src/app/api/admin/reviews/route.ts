import { NextRequest, NextResponse } from "next/server";
import { isSessionAuthenticated } from "@/lib/adminAuth";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  try {
    const isAuth = await isSessionAuthenticated();
    if (!isAuth) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const statusFilter = searchParams.get("status");
    const search = searchParams.get("search")?.toLowerCase().trim();

    const supabase = await createClient();

    let query = supabase
      .from("reviews")
      .select("*, products(id, name, image_url, slug)")
      .order("created_at", { ascending: false });

    if (statusFilter && statusFilter !== "all") {
      query = query.eq("status", statusFilter);
    }

    const { data: reviews, error } = await query;

    if (error) {
      if (error.code === "PGRST205" || error.message?.includes("does not exist")) {
        return NextResponse.json({
          reviews: [],
          stats: { total: 0, pending: 0, approved: 0, rejected: 0, averageRating: 0 },
          needsMigration: true,
        });
      }
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    let list = reviews || [];

    // Search filter
    if (search) {
      list = list.filter((r) => {
        const prodName = r.products?.name?.toLowerCase() || "";
        const userName = r.user_name?.toLowerCase() || "";
        const userEmail = r.user_email?.toLowerCase() || "";
        const comment = r.comment?.toLowerCase() || "";
        const title = r.title?.toLowerCase() || "";
        return (
          prodName.includes(search) ||
          userName.includes(search) ||
          userEmail.includes(search) ||
          comment.includes(search) ||
          title.includes(search)
        );
      });
    }

    // Compute stats from full set
    const all = reviews || [];
    const total = all.length;
    let pending = 0, approved = 0, rejected = 0, sumRating = 0;
    for (const r of all) {
      if (r.status === "pending") pending++;
      else if (r.status === "approved") approved++;
      else if (r.status === "rejected") rejected++;
      sumRating += Number(r.rating) || 5;
    }
    const averageRating = total > 0 ? Number((sumRating / total).toFixed(1)) : 0;

    return NextResponse.json({
      reviews: list,
      stats: { total, pending, approved, rejected, averageRating },
      needsMigration: false,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load admin reviews" },
      { status: 500 }
    );
  }
}
