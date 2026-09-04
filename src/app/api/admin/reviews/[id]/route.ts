import { NextRequest, NextResponse } from "next/server";
import { isSessionAuthenticated } from "@/lib/adminAuth";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const isAuth = await isSessionAuthenticated();
    if (!isAuth) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { status, rating, title, comment } = body;

    const supabase = await createClient();

    const updatePayload: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (status && ["approved", "pending", "rejected"].includes(status)) {
      updatePayload.status = status;
    }
    if (typeof rating === "number" && rating >= 1 && rating <= 5) {
      updatePayload.rating = rating;
    }
    if (typeof title === "string") {
      updatePayload.title = title.trim();
    }
    if (typeof comment === "string" && comment.trim().length > 0) {
      updatePayload.comment = comment.trim();
    }

    const { data: updated, error } = await supabase
      .from("reviews")
      .update(updatePayload)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: `Review updated successfully.`,
      review: updated,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to update review" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const isAuth = await isSessionAuthenticated();
    if (!isAuth) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const { id } = await params;
    const supabase = await createClient();

    const { error } = await supabase.from("reviews").delete().eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: "Review removed permanently.",
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to delete review" },
      { status: 500 }
    );
  }
}
