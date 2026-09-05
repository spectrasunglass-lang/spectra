import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendOrderEmails } from "@/lib/brevo";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { address, items, totalAmount } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ success: false, error: "Cart is empty" }, { status: 400 });
    }

    if (!address || !address.fullName || !address.phone || !address.email) {
      return NextResponse.json({ success: false, error: "Incomplete delivery address" }, { status: 400 });
    }

    const total = Number(totalAmount);
    if (isNaN(total) || total <= 0) {
      return NextResponse.json({ success: false, error: "Invalid total amount" }, { status: 400 });
    }

    const productSummary = items
      .map((i: { name: string; quantity: number; color?: { name: string } | null; gift_package?: { name: string; price: number } }) => {
        const colour = i.color?.name ? ` [Colour: ${i.color.name}]` : "";
        const gift = i.gift_package ? ` [🎁 ${i.gift_package.name}]` : "";
        return `${i.name} (x${i.quantity})${colour}${gift}`;
      })
      .join(", ");

    const paymentNote = `[CASH ON DELIVERY - FULL AMOUNT ₹${total} TO BE COLLECTED AT DOORSTEP]`;
    const fullAddress = `${address.street}, ${address.city}, ${address.state} - ${address.pincode} ${paymentNote}`;

    const supabase = await createClient();
    const { data, error: dbError } = await supabase
      .from("orders")
      .insert({
        customer_name: address.fullName,
        customer_email: address.email,
        customer_phone: address.phone,
        product_name: productSummary,
        amount: total,
        status: "pending",
        city: address.city,
        address: fullAddress,
      })
      .select("id")
      .single();

    if (dbError) {
      console.error("[COD Order DB Error]", dbError);
      return NextResponse.json({ success: false, error: "Failed to place order in database" }, { status: 500 });
    }

    const confirmedOrderId = data?.id || `ORD-${Date.now().toString().slice(-6)}`;

    // Send confirmation emails via Brevo
    try {
      await sendOrderEmails({
        orderId: confirmedOrderId,
        customerName: address.fullName,
        customerEmail: address.email,
        customerPhone: address.phone,
        items,
        productSummary,
        totalAmount: total,
        chargeAmount: 0,
        balanceDue: total,
        paymentMethod: "cod",
        address,
      });
    } catch (emailErr) {
      console.error("Non-blocking Brevo email error for COD:", emailErr);
    }

    return NextResponse.json({
      success: true,
      orderId: confirmedOrderId,
      totalAmount: total,
    });
  } catch (error: unknown) {
    console.error("[COD Place Order Error]", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to place COD order" },
      { status: 500 }
    );
  }
}
