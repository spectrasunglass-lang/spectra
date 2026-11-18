export interface ReturnProcessStep {
  title: string;
  desc: string;
}

export const DEFAULT_ELIGIBLE_ITEMS: string[] = [
  "Requested within {days} calendar days of parcel delivery.",
  "Unworn condition with no scratches or frame bends.",
  "Original luxury magnetic hard case & microfiber cloth included.",
  "Security tags and protective film intact.",
];

export const DEFAULT_NOT_ELIGIBLE_ITEMS: string[] = [
  "Requests initiated after {days} days of delivery.",
  "Frames altered, prescription-fitted, or showing visible wear.",
  "Missing original packaging, warranty card, or microfiber cloth.",
  "Items received as complimentary promotional gifts.",
];

export function getStep2ForShippingType(shippingType: string): ReturnProcessStep {
  if (shippingType === "customer_borne") {
    return {
      title: "Self-Ship Return Parcel",
      desc: "Securely pack the eyewear in its original luxury casing and ship it back to our studio address shared by our Concierge team.",
    };
  }
  return {
    title: "Doorstep Reverse Pickup",
    desc: "Our courier partner will arrive at your shipping address within 24–48 hours to securely collect the packaged eyewear.",
  };
}

export function getStep4ForPolicyType(policyType: string): ReturnProcessStep {
  switch (policyType) {
    case "exchange_only":
      return {
        title: "Instant Exchange Dispatch",
        desc: "Your replacement pair is immediately dispatched via Express Air once our optical team completes inspection.",
      };
    case "exchange_or_credit":
      return {
        title: "Exchange or Store Credit",
        desc: "Your replacement pair is immediately dispatched via Express Air, or instant store credit is issued for your next order.",
      };
    case "replacement_only":
      return {
        title: "Defective Replacement",
        desc: "Once a manufacturing defect is verified, a brand-new quality-checked replacement pair is dispatched via Express Air.",
      };
    default:
      return {
        title: "Instant Fulfillment",
        desc: "Your replacement pair is immediately dispatched via Express Air, or your refund is initiated back to your original payment method.",
      };
  }
}

export function getDefaultReturnSteps(
  shippingType: string = "complimentary_pickup",
  policyType: string = "exchange_and_refund"
): ReturnProcessStep[] {
  return [
    {
      title: "Initiate Request",
      desc: "Message our Concierge on WhatsApp or email us with your Order ID and preferred resolution (Exchange or Return).",
    },
    getStep2ForShippingType(shippingType),
    {
      title: "Studio Inspection",
      desc: "Our optical team inspects the frame to confirm pristine unworn condition, tags intact, and complete luxury casing.",
    },
    getStep4ForPolicyType(policyType),
  ];
}

export function parseReturnSteps(
  raw: string | undefined,
  shippingType: string = "complimentary_pickup",
  policyType: string = "exchange_and_refund"
): ReturnProcessStep[] {
  if (raw && raw.trim()) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const cleaned = parsed
          .filter((s) => s && typeof s.title === "string")
          .map((s) => ({
            title: String(s.title || "").trim(),
            desc: String(s.desc || "").trim(),
          }))
          .filter((s) => s.title || s.desc);
        if (cleaned.length > 0) return cleaned;
      }
    } catch {
      // Fall back to defaults
    }
  }
  return getDefaultReturnSteps(shippingType, policyType);
}

export function parseReturnList(raw: string | undefined, fallback: string[]): string[] {
  if (raw && raw.trim()) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        const cleaned = parsed
          .map((item) => String(item ?? "").trim())
          .filter(Boolean);
        if (cleaned.length > 0) return cleaned;
      }
    } catch {
      const lines = raw
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean);
      if (lines.length > 0) return lines;
    }
  }
  return fallback;
}

export function formatReturnText(text: string, windowDays: string): string {
  return text.replace(/\{days\}/gi, windowDays || "14");
}
