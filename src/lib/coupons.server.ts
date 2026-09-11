import { createClient } from "@/lib/supabase/server";

/**
 * Server-side helper to increment coupon used_count in Supabase
 */
export async function incrementCouponUsedServer(code: string): Promise<void> {
  if (!code) return;
  try {
    const supabase = await createClient();
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
    console.warn("[Coupon Server] Error incrementing coupon count:", err);
  }
}
