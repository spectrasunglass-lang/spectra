import { createClient } from "@/lib/supabase/server";
import { CustomerData } from "./customers";

/**
 * Server-side helper to record or update customer in Supabase from API routes.
 */
export async function recordCustomerServer(data: CustomerData): Promise<void> {
  if (!data.email) return;

  try {
    const supabase = await createClient();
    const cleanEmail = data.email.trim().toLowerCase();

    const { data: existing } = await supabase
      .from("customers")
      .select("id, total_orders, total_spent, phone, city, address, name")
      .eq("email", cleanEmail)
      .maybeSingle();

    const now = new Date().toISOString();

    if (existing) {
      const newOrders = (existing.total_orders || 0) + (data.orderAmount ? 1 : 0);
      const newSpent = Number(existing.total_spent || 0) + Number(data.orderAmount || 0);

      await supabase
        .from("customers")
        .update({
          name: data.name || existing.name,
          phone: data.phone || existing.phone,
          city: data.city || existing.city,
          address: data.address || existing.address,
          auth_id: data.auth_id || undefined,
          total_orders: newOrders,
          total_spent: newSpent,
          last_active_at: now,
          updated_at: now,
        })
        .eq("email", cleanEmail);
    } else {
      await supabase.from("customers").insert({
        name: data.name || cleanEmail.split("@")[0],
        email: cleanEmail,
        phone: data.phone || null,
        city: data.city || null,
        address: data.address || null,
        auth_id: data.auth_id || null,
        total_orders: data.orderAmount ? 1 : 0,
        total_spent: Number(data.orderAmount || 0),
        last_active_at: now,
        created_at: now,
        updated_at: now,
      });
    }
  } catch (err) {
    console.warn("[Customers Server] Non-blocking recordCustomerServer error:", err);
  }
}
