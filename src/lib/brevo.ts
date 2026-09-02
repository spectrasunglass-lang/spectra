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
 * (Full White Theme, No Alert Icon, No Order/Payment ID, Product Image + Name + Quantity only)
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

  const formattedTotal = `₹${Number(details.totalAmount || 0).toLocaleString("en-IN")}`;
  const isCod = details.paymentMethod === "cod";
  const fullAddress = details.address
    ? `${details.address.street}, ${details.address.city}, ${details.address.state} - ${details.address.pincode}`
    : "Address on file";

  // Build items rows with Image, Name, and Quantity ONLY
  const itemsHtml = Array.isArray(details.items) && details.items.length > 0
    ? details.items.map((item) => {
        const itemImg = item.image_url || item.image;
        const imgBlock = itemImg
          ? `<img src="${itemImg}" alt="${item.name}" width="54" height="54" style="display: block; width: 54px; height: 54px; object-fit: cover; border-radius: 4px; border: 1px solid #e5e7eb;" />`
          : `<div style="width: 54px; height: 54px; background-color: #f3f4f6; border-radius: 4px; border: 1px solid #e5e7eb; display: flex; align-items: center; justify-content: center; font-size: 10px; color: #9ca3af; text-align: center; line-height: 54px;">No Image</div>`;

        return `
          <tr>
            <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6; width: 64px;" valign="middle">
              ${imgBlock}
            </td>
            <td style="padding: 12px 10px; border-bottom: 1px solid #f3f4f6;" valign="middle">
              <div style="font-weight: 600; font-size: 13.5px; color: #111827;">${item.name}</div>
            </td>
            <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6; text-align: right; width: 80px;" valign="middle">
              <span style="display: inline-block; padding: 4px 10px; background-color: #f3f4f6; border-radius: 4px; font-size: 12px; font-weight: 700; color: #374151;">
                Qty: ${item.quantity}
              </span>
            </td>
          </tr>
        `;
      }).join("")
    : `
      <tr>
        <td colspan="3" style="padding: 12px 0; color: #374151; font-size: 13px;">
          ${details.productSummary || "SPECTRA Eyewear"}
        </td>
      </tr>
    `;

  // 1. Customer Order Confirmation Email (100% Pure White Theme)
  const customerHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Confirmation - SPECTRA</title>
    </head>
    <body style="margin: 0; padding: 25px 15px; background-color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1f2937;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #ffffff;">
        <tr>
          <td align="center">
            <table width="100%" max-width="580" cellpadding="0" cellspacing="0" style="max-width: 580px; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
              
              <!-- Header (Clean White Mode) -->
              <tr>
                <td style="padding: 24px 28px; background-color: #ffffff; border-bottom: 2px solid #c8874a;">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td valign="middle">
                        <h1 style="margin: 0; font-size: 22px; font-weight: 800; letter-spacing: 0.15em; text-transform: uppercase; color: #111827;">SPECTRA</h1>
                        <p style="margin: 2px 0 0; font-size: 9.5px; font-weight: 700; letter-spacing: 0.25em; text-transform: uppercase; color: #c8874a;">MAISON DE L'OPTIQUE</p>
                      </td>
                      <td align="right" valign="middle">
                        <span style="display: inline-block; padding: 5px 12px; background-color: #f3f4f6; color: #111827; font-size: 11px; font-weight: 700; border-radius: 4px; text-transform: uppercase; letter-spacing: 0.05em; border: 1px solid #e5e7eb;">
                          Order Confirmed
                        </span>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Greeting -->
              <tr>
                <td style="padding: 24px 28px 8px;">
                  <h2 style="margin: 0 0 6px; font-size: 16px; font-weight: 700; color: #111827;">Thank You for Your Order</h2>
                  <p style="margin: 0; font-size: 13.5px; color: #6b7280; line-height: 1.5;">
                    Hello ${details.customerName}, we have received your order and are preparing your handcrafted eyewear for delivery.
                  </p>
                </td>
              </tr>

              <!-- Ordered Products (Image + Name + Quantity Only) -->
              <tr>
                <td style="padding: 12px 28px;">
                  <h3 style="margin: 0 0 10px; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #6b7280;">Ordered Products</h3>
                  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #ffffff;">
                    ${itemsHtml}
                  </table>
                </td>
              </tr>

              <!-- Delivery Destination -->
              <tr>
                <td style="padding: 12px 28px;">
                  <h3 style="margin: 0 0 10px; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #6b7280;">Delivery Destination</h3>
                  <div style="background-color: #fafafa; border: 1px solid #f0f0f0; border-radius: 6px; padding: 12px 14px; font-size: 13px; color: #111827; line-height: 1.4;">
                    <p style="margin: 0 0 4px; font-weight: 600;">${details.customerName}</p>
                    <p style="margin: 0 0 4px; color: #4b5563;">${fullAddress}</p>
                    ${details.customerPhone ? `<p style="margin: 0; color: #6b7280; font-size: 12px;">Phone: ${details.customerPhone}</p>` : ""}
                  </div>
                </td>
              </tr>

              <!-- Payment Summary Section -->
              <tr>
                <td style="padding: 12px 28px 24px;">
                  <table width="100%" cellpadding="12" cellspacing="0" style="background-color: #fafafa; border: 1px solid #f0f0f0; border-radius: 6px; font-size: 13px;">
                    <tr>
                      <td style="color: #6b7280; font-weight: 600;">Payment Mode</td>
                      <td style="color: #111827; text-align: right; font-weight: 600;">
                        ${isCod ? `COD (Advance Paid: ₹${details.chargeAmount || 0}, Due: ₹${details.balanceDue || 0})` : "Online Full Paid"}
                      </td>
                    </tr>
                    <tr>
                      <td style="color: #111827; font-weight: 700; font-size: 14px; border-top: 1px solid #f0f0f0;">Total Amount</td>
                      <td style="color: #c8874a; text-align: right; font-weight: 800; font-size: 16px; border-top: 1px solid #f0f0f0;">${formattedTotal}</td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="padding: 16px 28px; background-color: #fafafa; border-top: 1px solid #f0f0f0; text-align: center; font-size: 11px; color: #9ca3af;">
                  Need assistance with your delivery or sizing? Email us at <a href="mailto:spectrasunglass@gmail.com" style="color: #c8874a; text-decoration: none;">spectrasunglass@gmail.com</a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  // 2. Admin Notification Email (100% Pure White Theme)
  const adminHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Order Received - SPECTRA</title>
    </head>
    <body style="margin: 0; padding: 25px 15px; background-color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1f2937;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #ffffff;">
        <tr>
          <td align="center">
            <table width="100%" max-width="580" cellpadding="0" cellspacing="0" style="max-width: 580px; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
              
              <!-- Header (Clean White Mode) -->
              <tr>
                <td style="padding: 24px 28px; background-color: #ffffff; border-bottom: 2px solid #c8874a;">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td valign="middle">
                        <h1 style="margin: 0; font-size: 22px; font-weight: 800; letter-spacing: 0.15em; text-transform: uppercase; color: #111827;">SPECTRA</h1>
                        <p style="margin: 2px 0 0; font-size: 9.5px; font-weight: 700; letter-spacing: 0.25em; text-transform: uppercase; color: #c8874a;">MAISON DE L'OPTIQUE</p>
                      </td>
                      <td align="right" valign="middle">
                        <span style="display: inline-block; padding: 5px 12px; background-color: #f3f4f6; color: #111827; font-size: 11px; font-weight: 700; border-radius: 4px; text-transform: uppercase; letter-spacing: 0.05em; border: 1px solid #e5e7eb;">
                          New Order
                        </span>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Customer Info Section -->
              <tr>
                <td style="padding: 24px 28px 12px;">
                  <h2 style="margin: 0 0 12px; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #6b7280;">Customer Information</h2>
                  <table width="100%" cellpadding="8" cellspacing="0" style="background-color: #fafafa; border: 1px solid #f0f0f0; border-radius: 6px; font-size: 13px;">
                    <tr>
                      <td style="color: #6b7280; width: 130px; border-bottom: 1px solid #f0f0f0;">Customer Name:</td>
                      <td style="color: #111827; font-weight: 600; border-bottom: 1px solid #f0f0f0;">${details.customerName}</td>
                    </tr>
                    <tr>
                      <td style="color: #6b7280; border-bottom: 1px solid #f0f0f0;">Email:</td>
                      <td style="border-bottom: 1px solid #f0f0f0;">
                        <a href="mailto:${details.customerEmail}" style="color: #c8874a; text-decoration: none; font-weight: 500;">${details.customerEmail}</a>
                      </td>
                    </tr>
                    <tr>
                      <td style="color: #6b7280; border-bottom: 1px solid #f0f0f0;">Phone:</td>
                      <td style="color: #111827; border-bottom: 1px solid #f0f0f0;">${details.customerPhone || "N/A"}</td>
                    </tr>
                    <tr>
                      <td style="color: #6b7280;">Delivery Address:</td>
                      <td style="color: #111827; line-height: 1.4;">${fullAddress}</td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Ordered Products (Image + Name + Quantity Only) -->
              <tr>
                <td style="padding: 12px 28px;">
                  <h2 style="margin: 0 0 10px; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #6b7280;">Ordered Products</h2>
                  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #ffffff;">
                    ${itemsHtml}
                  </table>
                </td>
              </tr>

              <!-- Payment Summary Section -->
              <tr>
                <td style="padding: 12px 28px 24px;">
                  <table width="100%" cellpadding="12" cellspacing="0" style="background-color: #fafafa; border: 1px solid #f0f0f0; border-radius: 6px; font-size: 13px;">
                    <tr>
                      <td style="color: #6b7280; font-weight: 600;">Payment Mode</td>
                      <td style="color: #111827; text-align: right; font-weight: 600;">
                        ${isCod ? `COD (Advance Paid: ₹${details.chargeAmount || 0}, Due: ₹${details.balanceDue || 0})` : "Online Full Paid"}
                      </td>
                    </tr>
                    <tr>
                      <td style="color: #111827; font-weight: 700; font-size: 14px; border-top: 1px solid #f0f0f0;">Total Amount</td>
                      <td style="color: #c8874a; text-align: right; font-weight: 800; font-size: 16px; border-top: 1px solid #f0f0f0;">${formattedTotal}</td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="padding: 16px 28px; background-color: #fafafa; border-top: 1px solid #f0f0f0; text-align: center; font-size: 11px; color: #9ca3af;">
                  SPECTRA Eyewear &bull; Store Administration Notification
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
      subject: `Order Confirmation — SPECTRA Eyewear`,
      htmlContent: customerHtml,
      tags: ["order_confirmation", "customer_receipt"],
    }),
    sendBrevoEmail({
      to: [{ email: getBrevoAdminEmail(), name: "SPECTRA Store Admin" }],
      subject: `New Order Received — ${details.customerName} (${formattedTotal})`,
      htmlContent: adminHtml,
      tags: ["order_alert", "admin_notification"],
    }),
  ]);

  return {
    customer: customerResult,
    admin: adminResult,
  };
}
