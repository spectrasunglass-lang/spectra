import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendOrderStatusUpdateEmail } from "@/lib/brevo";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, newStatus, trackingNumber } = body;

    if (!orderId || !newStatus) {
      return NextResponse.json(
        { success: false, error: "Missing orderId or newStatus" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // 1. Fetch current order details
    const { data: order, error: fetchErr } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (fetchErr || !order) {
      console.error("[Order Status Update] Order not found:", fetchErr);
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    // 2. Update order status in Supabase
    const { error: updateErr } = await supabase
      .from("orders")
      .update({
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId);

    if (updateErr) {
      console.error("[Order Status Update] DB update failed:", updateErr);
      return NextResponse.json(
        { success: false, error: "Failed to update order status in database" },
        { status: 500 }
      );
    }

    // 3. Send email to client if email exists
    let emailSent = false;
    let emailError = null;

    if (order.customer_email) {
      try {
        const emailRes = await sendOrderStatusUpdateEmail({
          orderId: order.id,
          customerName: order.customer_name || "Valued Client",
          customerEmail: order.customer_email,
          customerPhone: order.customer_phone,
          newStatus,
          productName: order.product_name,
          amount: Number(order.amount || 0),
          city: order.city,
          trackingNumber,
        });

        emailSent = emailRes.success;
        if (!emailRes.success) {
          emailError = emailRes.error;
        }
      } catch (err: any) {
        console.error("[Order Status Email Error]", err);
        emailError = err?.message || "Email send failure";
      }
    }

    return NextResponse.json({
      success: true,
      orderId,
      newStatus,
      emailSent,
      emailError,
    });
  } catch (error: any) {
    console.error("[Order Status API Error]", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
