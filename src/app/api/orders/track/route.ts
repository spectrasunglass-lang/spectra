import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const rawInput = searchParams.get("orderId")?.trim() || "";

    if (!rawInput) {
      return NextResponse.json(
        { success: false, error: "Please enter your Order ID." },
        { status: 400 }
      );
    }

    // Strip leading '#' or 'ORD-' prefixes
    const cleanId = rawInput.replace(/^#/, "").replace(/^ORD-/i, "").trim();

    const supabase = await createClient();

    let matchedOrder = null;

    // 1. If it's a valid full UUID, query directly by ID
    if (UUID_REGEX.test(cleanId)) {
      const { data, error } = await supabase
        .from("orders")
        .select("id, customer_name, customer_email, customer_phone, product_name, amount, status, created_at, city, address")
        .eq("id", cleanId)
        .maybeSingle();

      if (!error && data) {
        matchedOrder = data;
      }
    }

    // 2. If not found or if short ID (like 8-char hex e.g. 7422BC25)
    if (!matchedOrder) {
      const { data: allOrders, error: listError } = await supabase
        .from("orders")
        .select("id, customer_name, customer_email, customer_phone, product_name, amount, status, created_at, city, address")
        .order("created_at", { ascending: false });

      if (!listError && allOrders) {
        const queryLower = cleanId.toLowerCase();

        matchedOrder = allOrders.find((o) => {
          const fullId = String(o.id).toLowerCase();
          const cleanFullId = fullId.replace(/-/g, "");
          const shortId = fullId.slice(-8);

          return (
            fullId === queryLower ||
            shortId === queryLower ||
            fullId.endsWith(queryLower) ||
            cleanFullId.endsWith(queryLower) ||
            cleanFullId.includes(queryLower) ||
            fullId.includes(queryLower) ||
            (o.customer_email && o.customer_email.toLowerCase() === queryLower)
          );
        });
      }
    }

    if (!matchedOrder) {
      return NextResponse.json(
        { success: false, error: "Order not found. Please check your Order ID and try again." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      order: matchedOrder,
    });
  } catch (err: unknown) {
    console.error("Order tracking error:", err);
    return NextResponse.json(
      { success: false, error: "Unable to retrieve order details. Please try again later." },
      { status: 500 }
    );
  }
}
