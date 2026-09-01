import { NextRequest, NextResponse } from "next/server";
import { getRazorpayClient } from "@/lib/razorpay";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { items, totalAmount, paymentMethod, advanceAmount, customer } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: "Cart is empty" },
        { status: 400 }
      );
    }

    const total = Number(totalAmount);
    if (isNaN(total) || total <= 0) {
      return NextResponse.json(
        { success: false, error: "Invalid total amount" },
        { status: 400 }
      );
    }

    // Determine the amount to be charged right now via Razorpay
    let chargeAmount = total;
    let isCodAdvance = false;

    if (paymentMethod === "cod") {
      isCodAdvance = true;
      const adv = Number(advanceAmount);
      chargeAmount = !isNaN(adv) && adv > 0 ? Math.min(adv, total) : total;
    }

    // Amount in paise for Razorpay
    const amountInPaise = Math.round(chargeAmount * 100);

    const razorpay = getRazorpayClient();
    const keyId =
      process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID;

    // Generate unique short receipt ID (max 40 chars for Razorpay)
    const receipt = `rcpt_${Date.now().toString().slice(-8)}_${Math.random()
      .toString(36)
      .substring(2, 6)}`;

    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt,
      notes: {
        customer_name: customer?.name || "",
        customer_email: customer?.email || "",
        customer_phone: customer?.phone || "",
        payment_mode: paymentMethod === "cod" ? "COD_ADVANCE" : "ONLINE_FULL",
        total_order_amount: String(total),
        advance_paid: String(chargeAmount),
        balance_due_on_delivery: String(Math.max(0, total - chargeAmount)),
      },
    });

    return NextResponse.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId,
      chargeAmount,
      totalAmount: total,
      balanceDue: Math.max(0, total - chargeAmount),
      isCodAdvance,
    });
  } catch (error: unknown) {
    console.error("Razorpay create order error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to create payment order";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
