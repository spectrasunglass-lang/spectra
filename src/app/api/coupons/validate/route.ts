import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { Coupon, validateCouponDetails } from "@/lib/coupons";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code, orderAmount } = body;

    if (!code || typeof code !== "string" || !code.trim()) {
      return NextResponse.json(
        { success: false, valid: false, error: "Please enter a coupon code." },
        { status: 400 }
      );
    }

    const amount = Number(orderAmount);
    if (isNaN(amount) || amount <= 0) {
      return NextResponse.json(
        { success: false, valid: false, error: "Invalid order amount." },
        { status: 400 }
      );
    }

    const cleanCode = code.trim().toUpperCase();
    const supabase = await createClient();

    // 1. Fetch coupon from database
    const { data: coupon, error: dbError } = await supabase
      .from("coupons")
      .select("*")
      .ilike("code", cleanCode)
      .maybeSingle();

    if (dbError) {
      console.error("[Coupon Validate] Database error:", dbError);
      return NextResponse.json(
        { success: false, valid: false, error: "Unable to validate coupon at this time." },
        { status: 500 }
      );
    }

    if (!coupon) {
      return NextResponse.json(
        { success: false, valid: false, error: `Coupon code "${cleanCode}" does not exist.` },
        { status: 404 }
      );
    }

    // 2. Validate all rules
    const result = validateCouponDetails(coupon as Coupon, amount);

    if (!result.valid) {
      return NextResponse.json(
        { success: false, valid: false, error: result.error || "Coupon is not applicable." },
        { status: 400 }
      );
    }

    const discountAmount = result.discountAmount;
    const finalAmount = Math.max(0, amount - discountAmount);

    return NextResponse.json({
      success: true,
      valid: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        description: coupon.description,
        discount_type: coupon.discount_type,
        discount_value: Number(coupon.discount_value),
        min_order_value: Number(coupon.min_order_value || 0),
        max_discount_amount: coupon.max_discount_amount ? Number(coupon.max_discount_amount) : null,
      },
      discountAmount,
      finalAmount,
    });
  } catch (err: any) {
    console.error("[Coupon Validate Error]", err);
    return NextResponse.json(
      { success: false, valid: false, error: "Internal error validating coupon." },
      { status: 500 }
    );
  }
}
