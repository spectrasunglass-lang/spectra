import { createClient } from "@/lib/supabase/client";

export interface Coupon {
  id: string;
  code: string;
  description?: string | null;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  min_order_value: number;
  max_discount_amount?: number | null;
  valid_from?: string | null;
  expires_at?: string | null;
  usage_limit?: number | null;
  used_count: number;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface CouponValidationResult {
  valid: boolean;
  error?: string;
  coupon?: {
    id: string;
    code: string;
    description?: string | null;
    discount_type: "percentage" | "fixed";
    discount_value: number;
    min_order_value: number;
    max_discount_amount?: number | null;
  };
  discountAmount: number;
  finalAmount: number;
}

/**
 * Calculate the exact discount amount for a given order total and coupon
 */
export function calculateCouponDiscount(
  orderAmount: number,
  coupon: {
    discount_type: "percentage" | "fixed";
    discount_value: number;
    max_discount_amount?: number | null;
  }
): number {
  if (orderAmount <= 0) return 0;

  let discount = 0;
  if (coupon.discount_type === "percentage") {
    discount = (orderAmount * Number(coupon.discount_value)) / 100;
    if (coupon.max_discount_amount && Number(coupon.max_discount_amount) > 0) {
      discount = Math.min(discount, Number(coupon.max_discount_amount));
    }
  } else {
    // Fixed amount discount
    discount = Number(coupon.discount_value);
  }

  // Discount cannot exceed order amount
  discount = Math.min(discount, orderAmount);
  // Round to nearest integer (rupee)
  return Math.round(discount);
}

/**
 * Validate a coupon code against an order total.
 * Performs checks on:
 * 1. Active status
 * 2. Valid from / Expires at dates
 * 3. Total usage limit
 * 4. Minimum order value threshold
 */
export function validateCouponDetails(
  coupon: Coupon,
  orderAmount: number
): { valid: boolean; error?: string; discountAmount: number } {
  if (!coupon.is_active) {
    return { valid: false, error: "This coupon code is currently inactive.", discountAmount: 0 };
  }

  const now = new Date();

  if (coupon.valid_from) {
    const validFrom = new Date(coupon.valid_from);
    if (now < validFrom) {
      return { valid: false, error: "This coupon is not yet valid.", discountAmount: 0 };
    }
  }

  if (coupon.expires_at) {
    const expiresAt = new Date(coupon.expires_at);
    if (now > expiresAt) {
      return { valid: false, error: "This coupon has expired.", discountAmount: 0 };
    }
  }

  if (coupon.usage_limit && coupon.usage_limit > 0) {
    if ((coupon.used_count || 0) >= coupon.usage_limit) {
      return { valid: false, error: "This coupon has reached its maximum redemption limit.", discountAmount: 0 };
    }
  }

  if (coupon.min_order_value && orderAmount < Number(coupon.min_order_value)) {
    return {
      valid: false,
      error: `Minimum order value of ₹${Number(coupon.min_order_value).toLocaleString("en-IN")} required for this coupon.`,
      discountAmount: 0,
    };
  }

  const discountAmount = calculateCouponDiscount(orderAmount, coupon);
  return { valid: true, discountAmount };
}

/**
 * Increment the used_count for a coupon after an order is placed
 */
export async function incrementCouponUsed(code: string): Promise<void> {
  if (!code) return;
  try {
    const supabase = createClient();
    const cleanCode = code.trim().toUpperCase();

    const { data: coupon } = await supabase
      .from("coupons")
      .select("id, used_count")
      .ilike("code", cleanCode)
      .maybeSingle();

    if (coupon) {
      await supabase
        .from("coupons")
        .update({
          used_count: (coupon.used_count || 0) + 1,
          updated_at: new Date().toISOString(),
        })
        .eq("id", coupon.id);
    }
  } catch (err) {
    console.warn("[Coupon] Error incrementing coupon count:", err);
  }
}
