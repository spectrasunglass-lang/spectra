import fs from "fs";
import path from "path";

/**
 * Brevo (formerly Sendinblue) API Integration
 *
 * Configured using BREVO_API_KEY from environment variables.
 * Official Brevo v3 REST API documentation: https://developers.brevo.com/reference
 */

const BREVO_API_URL = "https://api.brevo.com/v3";

export interface BrevoEmailRecipient {
  email: string;
  name?: string;
}

export interface BrevoSendEmailPayload {
  to: BrevoEmailRecipient[];
  subject: string;
  htmlContent?: string;
  textContent?: string;
  sender?: BrevoEmailRecipient;
  replyTo?: BrevoEmailRecipient;
  cc?: BrevoEmailRecipient[];
  bcc?: BrevoEmailRecipient[];
  templateId?: number;
  params?: Record<string, unknown>;
  tags?: string[];
}

export interface BrevoContactPayload {
  email: string;
  attributes?: Record<string, unknown>;
  listIds?: number[];
  updateEnabled?: boolean;
}

export interface BrevoResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  messageId?: string;
}

export interface OrderItemEmail {
  name: string;
  quantity: number;
  price?: number;
  image_url?: string | null;
  image?: string | null;
}

export interface OrderEmailDetails {
  orderId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  items?: OrderItemEmail[];
  productSummary?: string;
  totalAmount: number;
  chargeAmount?: number;
  balanceDue?: number;
  paymentMethod?: string;
  paymentId?: string;
  address?: {
    fullName: string;
    phone: string;
    email: string;
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
}

/**
 * Check whether Brevo API key is defined in the current environment
 */
export function isBrevoConfigured(): boolean {
  return Boolean(process.env.BREVO_API_KEY && process.env.BREVO_API_KEY.trim() !== "");
}

/**
 * Get default sender details
 */
export function getBrevoDefaultSender(): BrevoEmailRecipient {
  return {
    email: process.env.BREVO_SENDER_EMAIL || "spectrasunglass@gmail.com",
    name: process.env.BREVO_SENDER_NAME || "SPECTRA Eyewear",
  };
}

/**
 * Get admin notification email address
 */
export function getBrevoAdminEmail(): string {
  return (
    process.env.ADMIN_EMAIL ||
    process.env.BREVO_SENDER_EMAIL ||
    "spectrasunglass@gmail.com"
  );
}

/**
 * Send a transactional email via Brevo REST API
 */
export async function sendBrevoEmail(payload: BrevoSendEmailPayload): Promise<BrevoResponse> {
  const apiKey = process.env.BREVO_API_KEY;

  if (!apiKey) {
    console.warn("[Brevo] BREVO_API_KEY is not defined in environment variables. Email will not be sent.");
    return { success: false, error: "BREVO_API_KEY is not configured" };
  }

  try {
    const sender = payload.sender || getBrevoDefaultSender();

    const response = await fetch(`${BREVO_API_URL}/smtp/email`, {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        "api-key": apiKey,
      },
      body: JSON.stringify({
        sender,
        to: payload.to,
        subject: payload.subject,
        htmlContent: payload.htmlContent,
        textContent: payload.textContent,
        replyTo: payload.replyTo,
        cc: payload.cc,
        bcc: payload.bcc,
        templateId: payload.templateId,
        params: payload.params,
        tags: payload.tags,
      }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errorMsg = data?.message || `Brevo HTTP error ${response.status}`;
      console.error("[Brevo] API Error sending email:", errorMsg);
      return { success: false, error: errorMsg };
    }

    return {
      success: true,
      messageId: data?.messageId,
      data,
    };
  } catch (error: unknown) {
    console.error("[Brevo] Network error sending email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Network error contacting Brevo",
    };
  }
}

/**
 * Add or update contact in Brevo Lists (for Newsletter, Customers, Leads)
 */
export async function addOrUpdateBrevoContact(payload: BrevoContactPayload): Promise<BrevoResponse> {
  const apiKey = process.env.BREVO_API_KEY;

  if (!apiKey) {
    console.warn("[Brevo] BREVO_API_KEY is not defined. Contact not created.");
    return { success: false, error: "BREVO_API_KEY is not configured" };
  }

  try {
    const response = await fetch(`${BREVO_API_URL}/contacts`, {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        "api-key": apiKey,
      },
      body: JSON.stringify({
        email: payload.email,
        attributes: payload.attributes,
        listIds: payload.listIds,
        updateEnabled: payload.updateEnabled ?? true,
      }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errorMsg = data?.message || `Brevo HTTP error ${response.status}`;
      console.error("[Brevo] API Error creating contact:", errorMsg);
      return { success: false, error: errorMsg };
    }

    return { success: true, data };
  } catch (error: unknown) {
    console.error("[Brevo] Network error creating contact:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Network error contacting Brevo",
    };
  }
}

/**
 * Send order notification to BOTH User (Customer) and Admin
 * Professional Amazon/Flipkart/Luxury eCommerce standard:
 * - Real official SPECTRA logo header with gold accent
 * - Uncropped 72x72 product images with contain fit
 * - Complete gift package and specs info
 * - Clear delivery address and payment invoice breakdown
 * - Track order button & WhatsApp concierge
 */
export async function sendOrderEmails(details: OrderEmailDetails): Promise<{
  customer: BrevoResponse;
  admin: BrevoResponse;
}> {
  if (!isBrevoConfigured()) {
    console.warn("[Brevo] Skipping order emails because BREVO_API_KEY is not set.");
    return {
      customer: { success: false, error: "BREVO_API_KEY missing" },
      admin: { success: false, error: "BREVO_API_KEY missing" },
    };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.spectrasunglassess.in";
  const logoUrl = `${siteUrl}/logo/logo.png`;
  const formattedTotal = `₹${Number(details.totalAmount || 0).toLocaleString("en-IN")}`;
  const isCod = details.paymentMethod === "cod";
  const orderId = details.orderId || `ORD-${Date.now().toString().slice(-6)}`;
  const orderDate = new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const trackUrl = `${siteUrl}/track-order?id=${encodeURIComponent(orderId)}`;

  const fullAddress = details.address
    ? `${details.address.street}, ${details.address.city}, ${details.address.state} - ${details.address.pincode}`
    : "Address on file";

  // Build items rows with high-res image, clear specs, gift packaging, and price
  const itemsHtml = Array.isArray(details.items) && details.items.length > 0
    ? details.items.map((item) => {
        let itemImg = item.image_url || item.image;
        if (itemImg && itemImg.startsWith("/")) {
          itemImg = `${siteUrl}${itemImg}`;
        }
        const giftInfo = (item as any).gift_package;
        const imgBlock = itemImg
          ? `<img src="${itemImg}" alt="${item.name}" width="72" height="72" style="display: block; width: 72px; height: 72px; object-fit: contain; background-color: #fafafa; border-radius: 8px; border: 1px solid #e5e7eb; padding: 4px;" />`
          : `<div style="width: 72px; height: 72px; background-color: #fafafa; border-radius: 8px; border: 1px solid #e5e7eb; display: flex; align-items: center; justify-content: center; font-size: 11px; color: #9ca3af; text-align: center; line-height: 72px;">SPECTRA</div>`;

        const itemPrice = item.price ? `₹${Number(item.price).toLocaleString("en-IN")}` : "";

        return `
          <tr>
            <td style="padding: 16px 0; border-bottom: 1px solid #f1f5f9; width: 84px;" valign="top">
              ${imgBlock}
            </td>
            <td style="padding: 16px 14px; border-bottom: 1px solid #f1f5f9;" valign="top">
              <div style="font-weight: 700; font-size: 14px; color: #0f172a; line-height: 1.35; margin-bottom: 4px;">
                ${item.name}
              </div>
              <div style="font-size: 11.5px; color: #64748b; margin-bottom: 6px;">
                Premium Polarized Optics &bull; 100% UV400 Protection
              </div>
              ${giftInfo ? `
                <div style="display: inline-block; padding: 3px 8px; background-color: #fffbeb; border: 1px solid #fde68a; border-radius: 4px; font-size: 11px; font-weight: 600; color: #b45309; margin-bottom: 6px;">
                  🎁 Gift Box: ${giftInfo.name} (+₹${giftInfo.price})
                </div>
              ` : ""}
              <div style="font-size: 12px; font-weight: 600; color: #475569;">
                Qty: ${item.quantity} ${itemPrice ? `&times; ${itemPrice}` : ""}
              </div>
            </td>
            <td style="padding: 16px 0; border-bottom: 1px solid #f1f5f9; text-align: right; width: 90px;" valign="top">
              <span style="font-size: 14px; font-weight: 700; color: #c8874a;">
                ${itemPrice ? `₹${(Number(item.price || 0) * Number(item.quantity || 1)).toLocaleString("en-IN")}` : ""}
              </span>
            </td>
          </tr>
        `;
      }).join("")
    : `
      <tr>
        <td colspan="3" style="padding: 16px 0; color: #374151; font-size: 13px;">
          ${details.productSummary || "SPECTRA Luxury Eyewear"}
        </td>
      </tr>
    `;

  // 1. Customer Order Confirmation Email (Amazon / Flipkart / Luxury standard)
  const customerHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Confirmed — SPECTRA</title>
    </head>
    <body style="margin: 0; padding: 30px 12px; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #18181b;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5;">
        <tr>
          <td align="center">
            <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border: 1px solid #e4e4e7; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.06);">
              
              <!-- Brand Header (Luxury Dark Bar with Real Official Logo) -->
              <tr>
                <td style="background-color: #0a0a0a; padding: 22px 28px;">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td valign="middle">
                        <a href="${siteUrl}" target="_blank" style="text-decoration: none; display: inline-block;">
                          <img src="${logoUrl}" alt="SPECTRA" width="130" style="display: block; border: 0; width: 130px; height: auto; filter: brightness(0) invert(1);" />
                        </a>
                      </td>
                      <td align="right" valign="middle">
                        <span style="display: inline-block; padding: 6px 14px; background-color: #1a1612; color: #c8874a; font-size: 10.5px; font-weight: 700; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.08em; border: 1px solid rgba(200, 135, 74, 0.4);">
                          &#10003; Order Confirmed
                        </span>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <!-- Gold Accent Line -->
              <tr>
                <td height="3" style="background: linear-gradient(90deg, #c8874a, #e5a872, #c8874a); font-size: 0; line-height: 0;">&nbsp;</td>
              </tr>

              <!-- Greeting & Order Status -->
              <tr>
                <td style="padding: 28px 28px 16px;">
                  <h1 style="margin: 0 0 6px; font-size: 20px; font-weight: 800; color: #09090b; letter-spacing: -0.02em;">
                    Thank You for Your Order!
                  </h1>
                  <p style="margin: 0 0 18px; font-size: 13.5px; color: #71717a; line-height: 1.55;">
                    Hi <strong>${details.customerName}</strong>, we have received your order and are carefully preparing your handcrafted polarized eyewear for delivery.
                  </p>

                  <!-- Amazon/Flipkart Style Order Metadata Strip -->
                  <table width="100%" cellpadding="12" cellspacing="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 12.5px;">
                    <tr>
                      <td width="33%" style="border-right: 1px solid #e2e8f0;">
                        <div style="font-size: 10px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em;">Order Number</div>
                        <div style="font-size: 13px; font-weight: 700; color: #0f172a; margin-top: 2px;">${orderId}</div>
                      </td>
                      <td width="33%" style="padding-left: 14px; border-right: 1px solid #e2e8f0;">
                        <div style="font-size: 10px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em;">Order Date</div>
                        <div style="font-size: 13px; font-weight: 700; color: #0f172a; margin-top: 2px;">${orderDate}</div>
                      </td>
                      <td width="34%" style="padding-left: 14px;">
                        <div style="font-size: 10px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em;">Estimated Delivery</div>
                        <div style="font-size: 13px; font-weight: 700; color: #16a34a; margin-top: 2px;">3&ndash;5 Business Days</div>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Items Table -->
              <tr>
                <td style="padding: 10px 28px 18px;">
                  <h2 style="margin: 0 0 10px; font-size: 11.5px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; color: #64748b;">
                    Items in Your Order
                  </h2>
                  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #ffffff;">
                    ${itemsHtml}
                  </table>
                </td>
              </tr>

              <!-- Delivery & Payment Cards (2 Columns) -->
              <tr>
                <td style="padding: 0 28px 24px;">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <!-- Delivery Destination -->
                      <td width="50%" valign="top" style="padding-right: 8px;">
                        <div style="background-color: #fafafa; border: 1px solid #f1f5f9; border-radius: 8px; padding: 14px; height: 100%;">
                          <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; color: #64748b; margin-bottom: 6px;">
                            Delivery Address
                          </div>
                          <div style="font-size: 13px; font-weight: 700; color: #0f172a; margin-bottom: 3px;">
                            ${details.customerName}
                          </div>
                          <div style="font-size: 12px; color: #475569; line-height: 1.45; margin-bottom: 6px;">
                            ${fullAddress}
                          </div>
                          ${details.customerPhone ? `<div style="font-size: 11.5px; color: #64748b;">Phone: <strong>${details.customerPhone}</strong></div>` : ""}
                        </div>
                      </td>

                      <!-- Payment Breakdown -->
                      <td width="50%" valign="top" style="padding-left: 8px;">
                        <div style="background-color: #fafafa; border: 1px solid #f1f5f9; border-radius: 8px; padding: 14px;">
                          <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; color: #64748b; margin-bottom: 8px;">
                            Payment Summary
                          </div>
                          <table width="100%" cellpadding="2" cellspacing="0" style="font-size: 12px; color: #475569;">
                            <tr>
                              <td>Shipping:</td>
                              <td align="right" style="color: #16a34a; font-weight: 700;">FREE (Express)</td>
                            </tr>
                            <tr>
                              <td>Payment Mode:</td>
                              <td align="right" style="font-weight: 600; color: #0f172a;">
                                ${isCod ? "Cash on Delivery" : "Online Paid (Razorpay)"}
                              </td>
                            </tr>
                            ${isCod && details.chargeAmount ? `
                              <tr>
                                <td>Advance Paid:</td>
                                <td align="right" style="font-weight: 600; color: #16a34a;">₹${details.chargeAmount}</td>
                              </tr>
                              <tr>
                                <td>Due on Delivery:</td>
                                <td align="right" style="font-weight: 700; color: #b45309;">₹${details.balanceDue || 0}</td>
                              </tr>
                            ` : ""}
                            <tr>
                              <td colspan="2" style="padding-top: 8px; border-top: 1px solid #e2e8f0;">
                                <table width="100%" cellpadding="0" cellspacing="0">
                                  <tr>
                                    <td style="font-size: 13px; font-weight: 700; color: #0f172a;">Total Order Value:</td>
                                    <td align="right" style="font-size: 16px; font-weight: 800; color: #c8874a;">${formattedTotal}</td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                          </table>
                        </div>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Primary CTA: Track Your Order Button -->
              <tr>
                <td align="center" style="padding: 0 28px 26px;">
                  <a href="${trackUrl}" target="_blank" style="display: block; max-width: 320px; background-color: #0a0a0a; color: #ffffff; text-decoration: none; font-size: 12.5px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; padding: 14px 24px; border-radius: 6px; text-align: center; border: 1px solid #27272a;">
                    Track Your Order &rarr;
                  </a>
                </td>
              </tr>

              <!-- Concierge Support Box -->
              <tr>
                <td style="padding: 16px 28px; background-color: #f8fafc; border-top: 1px solid #f1f5f9; text-align: center; font-size: 12px; color: #64748b; line-height: 1.6;">
                  Questions or need to update your address? Reply to this email or chat with our luxury concierge on WhatsApp at <a href="https://wa.me/918129950341" style="color: #c8874a; text-decoration: none; font-weight: 700;">+91 81299 50341</a>.
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="padding: 18px 28px; background-color: #0a0a0a; text-align: center; font-size: 11px; color: #71717a;">
                  <div style="font-weight: 700; color: #d4d4d8; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 4px;">SPECTRA LUXURY EYEWEAR</div>
                  <div>Malappuram, Kerala 676505, India &bull; <a href="${siteUrl}" style="color: #c8874a; text-decoration: none;">www.spectrasunglassess.in</a></div>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  // 2. Admin Order Notification Email
  const adminHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Order Alert — SPECTRA Admin</title>
    </head>
    <body style="margin: 0; padding: 30px 12px; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #18181b;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5;">
        <tr>
          <td align="center">
            <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border: 1px solid #e4e4e7; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.06);">
              
              <!-- Brand Header -->
              <tr>
                <td style="background-color: #0a0a0a; padding: 22px 28px;">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td valign="middle">
                        <img src="${logoUrl}" alt="SPECTRA" width="130" style="display: block; border: 0; width: 130px; height: auto; filter: brightness(0) invert(1);" />
                      </td>
                      <td align="right" valign="middle">
                        <span style="display: inline-block; padding: 6px 14px; background-color: #1a1612; color: #e5a872; font-size: 10.5px; font-weight: 700; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.08em; border: 1px solid rgba(200, 135, 74, 0.4);">
                          &#9889; New Order Received
                        </span>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td height="3" style="background: linear-gradient(90deg, #c8874a, #e5a872, #c8874a); font-size: 0; line-height: 0;">&nbsp;</td>
              </tr>

              <!-- Header Summary -->
              <tr>
                <td style="padding: 24px 28px 12px;">
                  <h1 style="margin: 0 0 6px; font-size: 18px; font-weight: 800; color: #09090b;">
                    New Order Alert: ${orderId}
                  </h1>
                  <p style="margin: 0; font-size: 13.5px; color: #71717a;">
                    A new order for <strong>${formattedTotal}</strong> has been placed by <strong>${details.customerName}</strong>.
                  </p>
                </td>
              </tr>

              <!-- Customer Dispatch Info -->
              <tr>
                <td style="padding: 8px 28px 16px;">
                  <div style="background-color: #fafafa; border: 1px solid #f1f5f9; border-radius: 8px; padding: 14px;">
                    <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; color: #64748b; margin-bottom: 8px;">
                      Customer & Dispatch Details
                    </div>
                    <table width="100%" cellpadding="3" cellspacing="0" style="font-size: 12.5px; color: #334155;">
                      <tr>
                        <td width="110" style="color: #64748b;">Customer:</td>
                        <td style="font-weight: 700; color: #0f172a;">${details.customerName}</td>
                      </tr>
                      <tr>
                        <td style="color: #64748b;">Email:</td>
                        <td><a href="mailto:${details.customerEmail}" style="color: #c8874a; text-decoration: none;">${details.customerEmail}</a></td>
                      </tr>
                      <tr>
                        <td style="color: #64748b;">Phone:</td>
                        <td>
                          <a href="tel:${details.customerPhone}" style="color: #0f172a; font-weight: 600; text-decoration: none;">${details.customerPhone || "N/A"}</a>
                          ${details.customerPhone ? ` &bull; <a href="https://wa.me/${details.customerPhone.replace(/[^0-9]/g, '')}" target="_blank" style="color: #16a34a; font-weight: 700; text-decoration: none;">Chat WhatsApp &rarr;</a>` : ""}
                        </td>
                      </tr>
                      <tr>
                        <td style="color: #64748b;" valign="top">Ship To:</td>
                        <td style="color: #0f172a; line-height: 1.45;">${fullAddress}</td>
                      </tr>
                      <tr>
                        <td style="color: #64748b;">Payment:</td>
                        <td style="font-weight: 700; color: #0f172a;">
                          ${isCod ? `Cash on Delivery (Advance: ₹${details.chargeAmount || 0}, Collect Due: ₹${details.balanceDue || 0})` : "Online Full Paid (Razorpay)"}
                        </td>
                      </tr>
                    </table>
                  </div>
                </td>
              </tr>

              <!-- Items -->
              <tr>
                <td style="padding: 8px 28px 20px;">
                  <h2 style="margin: 0 0 10px; font-size: 11.5px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; color: #64748b;">
                    Packing Checklist
                  </h2>
                  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #ffffff;">
                    ${itemsHtml}
                  </table>
                </td>
              </tr>

              <!-- Admin Action CTA -->
              <tr>
                <td align="center" style="padding: 0 28px 24px;">
                  <a href="${siteUrl}/admin/orders" target="_blank" style="display: block; max-width: 320px; background-color: #c8874a; color: #ffffff; text-decoration: none; font-size: 12.5px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; padding: 13px 24px; border-radius: 6px; text-align: center;">
                    View in Admin Dashboard &rarr;
                  </a>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="padding: 16px 28px; background-color: #0a0a0a; text-align: center; font-size: 11px; color: #71717a;">
                  SPECTRA Eyewear Automated Dispatch Notification
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  // Send to BOTH Customer (User) and Admin in parallel
  const [customerResult, adminResult] = await Promise.all([
    sendBrevoEmail({
      to: [{ email: details.customerEmail, name: details.customerName }],
      subject: `Order Confirmed: ${orderId} — SPECTRA Eyewear`,
      htmlContent: customerHtml,
      tags: ["order_confirmation", "customer_receipt"],
    }),
    sendBrevoEmail({
      to: [{ email: getBrevoAdminEmail(), name: "SPECTRA Store Admin" }],
      subject: `New Order: ${orderId} — ${details.customerName} (${formattedTotal})`,
      htmlContent: adminHtml,
      tags: ["order_alert", "admin_notification"],
    }),
  ]);

  return {
    customer: customerResult,
    admin: adminResult,
  };
}
