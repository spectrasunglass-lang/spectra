import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET all coupons
export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: coupons, error } = await supabase
      .from("coupons")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[Admin Coupons GET Error]", error);
      return NextResponse.json({ success: false, error: error.message, coupons: [] }, { status: 500 });
    }

    return NextResponse.json({ success: true, coupons: coupons || [] });
  } catch (err: any) {
    console.error("[Admin Coupons GET Exception]", err);
    return NextResponse.json({ success: false, error: err?.message, coupons: [] }, { status: 500 });
  }
}

// POST: Create or Update Coupon
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      id,
      code,
      description,
      discount_type,
      discount_value,
      min_order_value,
      max_discount_amount,
      valid_from,
      expires_at,
      usage_limit,
      is_active,
    } = body;

    if (!code || !code.trim()) {
      return NextResponse.json({ success: false, error: "Coupon code is required" }, { status: 400 });
    }

    if (!discount_type || !["percentage", "fixed"].includes(discount_type)) {
      return NextResponse.json({ success: false, error: "Discount type must be percentage or fixed" }, { status: 400 });
    }

    const val = Number(discount_value);
    if (isNaN(val) || val <= 0) {
      return NextResponse.json({ success: false, error: "Discount value must be greater than 0" }, { status: 400 });
    }

    if (discount_type === "percentage" && val > 100) {
      return NextResponse.json({ success: false, error: "Percentage discount cannot exceed 100%" }, { status: 400 });
    }

    const cleanCode = code.trim().toUpperCase();
    const supabase = await createClient();
    const now = new Date().toISOString();

    const record = {
      code: cleanCode,
      description: description ? description.trim() : null,
      discount_type,
      discount_value: val,
      min_order_value: Number(min_order_value || 0),
      max_discount_amount: max_discount_amount ? Number(max_discount_amount) : null,
      valid_from: valid_from ? new Date(valid_from).toISOString() : now,
      expires_at: expires_at ? new Date(expires_at).toISOString() : null,
      usage_limit: usage_limit ? parseInt(String(usage_limit), 10) : null,
      is_active: is_active ?? true,
      updated_at: now,
    };

    if (id) {
      // Update existing coupon
      const { data, error } = await supabase
        .from("coupons")
        .update(record)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, coupon: data });
    } else {
      // Check if code already exists
      const { data: existing } = await supabase
        .from("coupons")
        .select("id")
        .ilike("code", cleanCode)
        .maybeSingle();

      if (existing) {
        return NextResponse.json({ success: false, error: `Coupon code "${cleanCode}" already exists.` }, { status: 400 });
      }

      const { data, error } = await supabase
        .from("coupons")
        .insert({
          ...record,
          used_count: 0,
          created_at: now,
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, coupon: data });
    }
  } catch (err: any) {
    console.error("[Admin Coupons POST Exception]", err);
    return NextResponse.json({ success: false, error: err?.message }, { status: 500 });
  }
}

// DELETE a coupon
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "Coupon ID is required" }, { status: 400 });
    }

    const supabase = await createClient();
    const { error } = await supabase.from("coupons").delete().eq("id", id);

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message }, { status: 500 });
  }
}

// PATCH: Toggle active state
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, is_active } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "Coupon ID is required" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("coupons")
      .update({ is_active, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, coupon: data });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message }, { status: 500 });
  }
}
