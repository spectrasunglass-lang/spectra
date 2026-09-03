import { NextRequest, NextResponse } from "next/server";
import { verifyRazorpayWebhookSignature } from "@/lib/razorpay";
import { createClient } from "@supabase/supabase-js";
import { sendOrderEmails } from "@/lib/brevo";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "Missing x-razorpay-signature header" },
        { status: 400 }
      );
    }

    const webhookSecret =
      process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET;

    if (!webhookSecret) {
      console.error("[Webhook Error] No webhook secret configured");
      return NextResponse.json(
        { error: "Webhook secret missing in server config" },
        { status: 500 }
      );
    }

    // Cryptographic validation
    const isValid = verifyRazorpayWebhookSignature(
      rawBody,
      signature,
      webhookSecret
    );

    if (!isValid) {
      console.error("[Webhook Error] Invalid webhook signature");
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 400 }
      );
    }

    const event = JSON.parse(rawBody);

    // Only process successful payment events
    if (event.event !== "payment.captured" && event.event !== "order.paid") {
      return NextResponse.json({ status: "ignored", event: event.event });
    }

    const paymentEntity = event?.payload?.payment?.entity;
    const orderEntity = event?.payload?.order?.entity;

    if (!paymentEntity) {
      return NextResponse.json({ error: "Missing payment entity in payload" }, { status: 400 });
    }

    const paymentId = paymentEntity.id;
    const razorpayOrderId = paymentEntity.order_id || orderEntity?.id;
    const notes = paymentEntity.notes || orderEntity?.notes || {};

    // Check if order already exists in Supabase to prevent duplicates (Idempotency)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: existingOrders } = await supabase
      .from("orders")
      .select("id")
      .ilike("address", `%${paymentId}%`)
      .limit(1);

    if (existingOrders && existingOrders.length > 0) {
      // Order was already saved successfully by the client verify-payment callback!
      return NextResponse.json({
        status: "ok",
        message: "Order already registered and confirmed",
        orderId: existingOrders[0].id,
      });
    }

    // ── FALLBACK RECOVERY ──
    // The payment succeeded on Razorpay, but customer tab closed before client could post to verify-payment!
    console.log(`[Webhook Recovery] Creating missing order for payment ${paymentId}`);

    const customerName = notes.customer_name || paymentEntity.notes?.customer_name || "SPECTRA Client";
    const customerEmail = paymentEntity.email || notes.customer_email || "spectrasunglass@gmail.com";
    const customerPhone = paymentEntity.contact || notes.customer_phone || "";
    const totalOrderAmount = Number(notes.total_order_amount) || (paymentEntity.amount / 100);
    const advancePaid = Number(notes.advance_paid) || (paymentEntity.amount / 100);
    const balanceDue = Number(notes.balance_due_on_delivery) || Math.max(0, totalOrderAmount - advancePaid);
    const isCodAdvance = notes.payment_mode === "COD_ADVANCE";

    const paymentSummaryNote = isCodAdvance
      ? `[COD - ADVANCE PAID: ₹${advancePaid} (Razorpay: ${paymentId}), BALANCE DUE ON DELIVERY: ₹${balanceDue}]`
      : `[ONLINE FULL PAID: ₹${totalOrderAmount} (Razorpay: ${paymentId}, Order: ${razorpayOrderId})]`;

    const fullAddressText = `Online Order / Auto-Captured via Webhook ${paymentSummaryNote}`;

    const { data: newOrder, error: insertError } = await supabase
      .from("orders")
      .insert({
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
        product_name: "SPECTRA Eyewear Acquisition",
        amount: totalOrderAmount,
        status: "processing",
        city: "Online",
        address: fullAddressText,
      })
      .select("id")
      .single();

    if (insertError) {
      console.error("[Webhook Order Insert Failed]", insertError);
      return NextResponse.json({ error: "Failed to persist recovered order" }, { status: 500 });
    }

    // Trigger Brevo notifications safely
    try {
      await sendOrderEmails({
        orderId: newOrder?.id || `ORD-${paymentId.slice(-6)}`,
        customerName,
        customerEmail,
        customerPhone,
        productSummary: "SPECTRA Eyewear Acquisition",
        totalAmount: totalOrderAmount,
        chargeAmount: advancePaid,
        balanceDue,
        paymentMethod: isCodAdvance ? "cod" : "online",
        paymentId,
        address: {
          fullName: customerName,
          email: customerEmail,
          phone: customerPhone,
          street: "Online Delivery",
          city: "Online",
          state: "Kerala",
          pincode: "676505",
        },
      });
    } catch (brevoErr) {
      console.error("[Webhook Non-blocking Brevo Error]", brevoErr);
    }

    return NextResponse.json({
      status: "ok",
      recovered: true,
      orderId: newOrder?.id,
      paymentId,
    });
  } catch (error: unknown) {
    console.error("[Razorpay Webhook Error]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Webhook handler exception" },
      { status: 500 }
    );
  }
}
