import { createClient } from "@/lib/supabase/client";

export interface CustomerData {
  name: string;
  email: string;
  phone?: string | null;
  city?: string | null;
  address?: string | null;
  auth_id?: string | null;
  orderAmount?: number;
}

/**
 * Format a phone number to WhatsApp international standard.
 * Cleans spaces, dashes, parentheses and prepends 91 if it's a 10-digit Indian number.
 */
export function formatWhatsappPhone(rawPhone?: string | null): string | null {
  if (!rawPhone) return null;
  const cleaned = rawPhone.replace(/[^0-9]/g, "");
  if (!cleaned) return null;

  // If 10 digits, assume India (+91)
  if (cleaned.length === 10) {
    return `91${cleaned}`;
  }
  // If starts with 0 and 11 digits (e.g. 08129950341)
  if (cleaned.length === 11 && cleaned.startsWith("0")) {
    return `91${cleaned.slice(1)}`;
  }
  return cleaned;
}

/**
 * Generate a direct WhatsApp chat link for a phone number
 */
export function getWhatsappChatLink(rawPhone?: string | null, customMessage?: string): string | null {
  const formatted = formatWhatsappPhone(rawPhone);
  if (!formatted) return null;
  const msg = customMessage || "Hello! Connecting from SPECTRA Luxury Eyewear.";
  return `https://wa.me/${formatted}?text=${encodeURIComponent(msg)}`;
}

/**
 * Record or update a customer in Supabase customers table.
 * Designed to be safe and non-blocking.
 */
export async function recordCustomer(data: CustomerData): Promise<void> {
  if (!data.email) return;

  try {
    const supabase = createClient();
    const cleanEmail = data.email.trim().toLowerCase();

    // Check if customer already exists
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
    // Non-blocking catch: table might not exist yet or client network issue
    console.warn("[Customers] Non-blocking recordCustomer warning:", err);
  }
}
