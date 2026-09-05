import { NextRequest, NextResponse } from "next/server";
import { verifyRazorpaySignature } from "@/lib/razorpay";
import { createClient } from "@/lib/supabase/server";
import { sendOrderEmails } from "@/lib/brevo";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      address,
      items,
      totalAmount,
      chargeAmount,
      balanceDue,
      paymentMethod,
    } = body;

    // 1. Validate required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { success: false, error: "Missing Razorpay payment identifiers" },
        { status: 400 }
      );
    }

    if (!address || !address.fullName || !address.phone || !address.email) {
      return NextResponse.json(
        { success: false, error: "Incomplete delivery address" },
        { status: 400 }
      );
    }

    // 2. Server-side HMAC SHA-256 signature verification
    const isValid = verifyRazorpaySignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!isValid) {
      console.error("Signature mismatch:", {
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
      });
      return NextResponse.json(
        { success: false, error: "Payment signature verification failed" },
        { status: 400 }
      );
    }

    // 3. Construct Order Data
    const isCod = paymentMethod === "cod";
    const productSummary = Array.isArray(items)
      ? items
          .map((i: { name: string; quantity: number; color?: { name: string } | null; gift_package?: { name: string } }) => {
            const colour = i.color?.name ? ` [Colour: ${i.color.name}]` : "";
            const gift = i.gift_package ? ` [🎁 ${i.gift_package.name}]` : "";
            return `${i.name} (x${i.quantity})${colour}${gift}`;
          })
          .join(", ")
      : "SPECTRA Eyewear Order";

    const paymentNote = isCod
      ? `[COD - ADVANCE PAID: ₹${chargeAmount} (Razorpay: ${razorpay_payment_id}), BALANCE DUE ON DELIVERY: ₹${balanceDue}]`
      : `[ONLINE FULL PAID: ₹${totalAmount} (Razorpay: ${razorpay_payment_id}, Order: ${razorpay_order_id})]`;

    const fullAddress = `${address.street}, ${address.city}, ${address.state} - ${address.pincode} ${paymentNote}`;

    // 4. Save confirmed order to Supabase
    const supabase = await createClient();
    const { data, error: dbError } = await supabase
      .from("orders")
      .insert({
        customer_name: address.fullName,
        customer_email: address.email,
        customer_phone: address.phone,
        product_name: productSummary,
        amount: Number(totalAmount),
        status: "pending",
        city: address.city,
        address: fullAddress,
      })
      .select("id")
      .single();

    const confirmedOrderId = data?.id || `ORD-${Date.now().toString().slice(-6)}`;

    // 5. Send order confirmation to Customer AND notification to Admin via Brevo
    try {
      await sendOrderEmails({
        orderId: confirmedOrderId,
        customerName: address.fullName,
        customerEmail: address.email,
        customerPhone: address.phone,
        items,
        productSummary,
        totalAmount: Number(totalAmount),
        chargeAmount: Number(chargeAmount),
        balanceDue: Number(balanceDue),
        paymentMethod,
        paymentId: razorpay_payment_id,
        address,
      });
    } catch (emailErr) {
      console.error("Non-blocking Brevo email error:", emailErr);
    }

    if (dbError) {
      console.error("Database order insertion error after payment:", dbError);
      // Even if DB insert had an issue, the payment is confirmed; fallback to order id
      return NextResponse.json({
        success: true,
        orderId: confirmedOrderId,
        paymentId: razorpay_payment_id,
        warning: "Payment verified successfully",
      });
    }

    return NextResponse.json({
      success: true,
      orderId: confirmedOrderId,
      paymentId: razorpay_payment_id,
    });
  } catch (error: unknown) {
    console.error("Razorpay verify payment error:", error);
    const message =
      error instanceof Error ? error.message : "Payment verification failed";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
