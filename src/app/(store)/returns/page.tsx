import React from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  RotateCcw,
  Truck,
  ShieldCheck,
  Clock,
  CheckCircle2,
  AlertCircle,
  MessageCircle,
  Mail,
  ArrowRight,
  PackageCheck,
  Sparkles,
} from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Returns & Exchange Policy — SPECTRA Luxury Eyewear",
  description:
    "Learn about SPECTRA complimentary reverse pickup, hassle-free exchanges, and our transparent return window guidelines.",
};

export default async function ReturnsPolicyPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("settings")
    .select("key, value")
    .in("key", [
      "return_window_days",
      "return_policy_enabled",
      "return_policy_type",
      "return_shipping_type",
      "return_policy_tagline",
      "return_policy_conditions",
      "contact_email",
      "contact_phone",
      "whatsapp_url",
    ]);

  const settings: Record<string, string> = {
    return_window_days: "14",
    return_policy_enabled: "true",
    return_policy_type: "exchange_and_refund",
    return_shipping_type: "complimentary_pickup",
    return_policy_tagline: "Effortless home exchange & returns",
    return_policy_conditions:
      "Items must be in unworn, brand-new condition with all tags, luxury hard case, warranty card, and microfiber cloth included. Reverse pickup is arranged from your doorstep.",
    contact_email: "spectrasunglass@gmail.com",
    contact_phone: "+91 81299 50341",
    whatsapp_url: "https://wa.me/c/918129950341",
  };

  if (data && data.length > 0) {
    data.forEach((r) => {
      if (r.value) settings[r.key] = r.value;
    });
  }

  const windowDays = settings.return_window_days || "14";
  const isEnabled = settings.return_policy_enabled !== "false";
  const isFreePickup = settings.return_shipping_type === "complimentary_pickup";

  const resolutionLabels: Record<string, string> = {
    exchange_and_refund: "Complimentary Exchanges & Direct Refunds",
    exchange_or_credit: "Size/Color Exchange or Store Credit",
    exchange_only: "Size/Model Exchange Only",
    replacement_only: "Defective Replacement Guarantee",
  };

  const currentResolution =
    resolutionLabels[settings.return_policy_type] ||
    "Complimentary Exchanges & Direct Refunds";

  // WhatsApp concierge pre-filled message
  const whatsappCleanNumber = (settings.contact_phone || "8129950341").replace(
    /\D/g,
    ""
  );
  const waTarget = whatsappCleanNumber.startsWith("91")
    ? whatsappCleanNumber
    : `91${whatsappCleanNumber}`;
  const whatsappLink = `https://wa.me/${waTarget}?text=${encodeURIComponent(
    `Hi SPECTRA Concierge, I would like to request an exchange/return for my order.`
  )}`;

  const highlights = [
    {
      icon: <Clock size={22} className="text-[#c8874a]" />,
      title: `${windowDays}-Day Evaluation Window`,
      desc: `Try your SPECTRA frames in the comfort of your home. You have a full ${windowDays} days from delivery to request an exchange or return.`,
    },
    {
      icon: <Truck size={22} className="text-[#c8874a]" />,
      title: isFreePickup ? "Doorstep Reverse Pickup" : "Tracked Return Service",
      desc: isFreePickup
        ? "We arrange hassle-free courier pickup directly from your doorstep with zero handling or transit stress."
        : "Simple tracked return process coordinated directly with our Client Concierge team.",
    },
    {
      icon: <RotateCcw size={22} className="text-[#c8874a]" />,
      title: currentResolution,
      desc: "Whether you prefer a different frame aesthetic, an alternate lens shade, or a refund, we process resolutions within 24 hours of studio receipt.",
    },
    {
      icon: <ShieldCheck size={22} className="text-[#c8874a]" />,
      title: "100% Quality Inspected",
      desc: "Every SPECTRA frame is certified UV400 and individually examined by our optical specialists before being dispatched.",
    },
  ];

  const steps = [
    {
      num: "01",
      title: "Initiate Request",
      desc: "Message our Concierge on WhatsApp or email us with your Order ID and preferred resolution (Exchange or Return).",
    },
    {
      num: "02",
      title: "Doorstep Reverse Pickup",
      desc: "Our courier partner will arrive at your shipping address within 24–48 hours to securely collect the packaged eyewear.",
    },
    {
      num: "03",
      title: "Studio Inspection",
      desc: "Our optical team inspects the frame to confirm pristine unworn condition, tags intact, and complete luxury casing.",
    },
    {
      num: "04",
      title: "Instant Fulfillment",
      desc: "Your replacement pair is immediately dispatched via Express Air, or your refund is initiated back to your original payment method.",
    },
  ];

  return (
    <div className="bg-[#0a0a0a] min-h-screen text-white pb-20">
      {/* Header Banner */}
      <div className="bg-gradient-to-b from-[#16120e] via-[#100d0b] to-[#0a0a0a] py-16 sm:py-24 text-center border-b border-white/[0.08]">
        <div className="max-w-5xl mx-auto px-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#c8874a]/10 border border-[#c8874a]/25 text-[#c8874a] text-[11px] font-bold uppercase tracking-[0.25em] mb-4">
            <Sparkles size={12} /> Client Concierge Guarantee
          </div>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight uppercase">
            Returns &amp; Exchanges
          </h1>
          <p className="text-neutral-300 text-sm sm:text-base mt-4 max-w-xl mx-auto leading-relaxed">
            {isEnabled ? (
              <>
                Complimentary <span className="text-[#c8874a] font-bold">{windowDays}-day</span> effortless home exchange &amp; return policy on all handcrafted eyewear.
              </>
            ) : (
              "All SPECTRA pieces are inspected for authentic craftsmanship and protected by our replacement guarantee."
            )}
          </p>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-5xl mx-auto px-5 sm:px-8 pt-12 space-y-12">
        {/* Highlight Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {highlights.map((h, i) => (
            <div
              key={i}
              className="bg-[#111111] border border-white/[0.06] p-6 sm:p-7 rounded-sm space-y-3 hover:border-[#c8874a]/30 transition-colors"
            >
              <div className="w-10 h-10 rounded-sm bg-[#181818] border border-white/[0.08] flex items-center justify-center">
                {h.icon}
              </div>
              <h3 className="text-sm sm:text-[15px] font-bold uppercase tracking-wider text-white">
                {h.title}
              </h3>
              <p className="text-xs sm:text-[13px] text-neutral-400 leading-relaxed">
                {h.desc}
              </p>
            </div>
          ))}
        </div>

        {/* 4 Steps How It Works */}
        <div className="bg-[#111111] border border-white/[0.06] rounded-sm p-6 sm:p-10 space-y-8">
          <div>
            <p className="text-[10.5px] font-bold uppercase tracking-[0.25em] text-[#c8874a] mb-1">
              Simple &amp; Transparent
            </p>
            <h2 className="text-xl sm:text-2xl font-bold uppercase text-white tracking-wide">
              How The Return Process Works
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((s) => (
              <div
                key={s.num}
                className="relative bg-[#161616] p-5 rounded-sm border border-white/[0.05] flex flex-col justify-between"
              >
                <div>
                  <span className="font-mono text-2xl font-bold text-[#c8874a]/40">
                    {s.num}
                  </span>
                  <h4 className="text-[13px] font-bold text-white uppercase tracking-wider mt-2 mb-2">
                    {s.title}
                  </h4>
                  <p className="text-[12px] text-neutral-400 leading-relaxed">
                    {s.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Eligibility & Condition Criteria */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#111111] border border-white/[0.06] p-6 sm:p-8 rounded-sm space-y-4">
            <div className="flex items-center gap-2 text-emerald-400">
              <CheckCircle2 size={18} />
              <h3 className="text-[13px] font-bold uppercase tracking-wider">
                Eligible For Return / Exchange
              </h3>
            </div>
            <ul className="space-y-2.5 text-[12.5px] text-neutral-300">
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 mt-0.5">•</span>
                <span>Requested within {windowDays} calendar days of parcel delivery.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 mt-0.5">•</span>
                <span>Unworn condition with no scratches or frame bends.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 mt-0.5">•</span>
                <span>Original luxury magnetic hard case &amp; microfiber cloth included.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 mt-0.5">•</span>
                <span>Security tags and protective film intact.</span>
              </li>
            </ul>
          </div>

          <div className="bg-[#111111] border border-white/[0.06] p-6 sm:p-8 rounded-sm space-y-4">
            <div className="flex items-center gap-2 text-amber-400">
              <AlertCircle size={18} />
              <h3 className="text-[13px] font-bold uppercase tracking-wider">
                Not Eligible For Return
              </h3>
            </div>
            <ul className="space-y-2.5 text-[12.5px] text-neutral-300">
              <li className="flex items-start gap-2">
                <span className="text-amber-400 mt-0.5">•</span>
                <span>Requests initiated after {windowDays} days of delivery.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-400 mt-0.5">•</span>
                <span>Frames altered, prescription-fitted, or showing visible wear.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-400 mt-0.5">•</span>
                <span>Missing original packaging, warranty card, or microfiber cloth.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-400 mt-0.5">•</span>
                <span>Items received as complimentary promotional gifts.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Admin Policy Conditions Custom Box */}
        {settings.return_policy_conditions && (
          <div className="bg-[#111111] border border-white/[0.06] p-6 sm:p-8 rounded-sm space-y-3">
            <h3 className="text-[12px] font-bold uppercase tracking-wider text-[#c8874a]">
              Specific Terms &amp; Conditions
            </h3>
            <p className="text-xs sm:text-[13px] text-neutral-300 leading-relaxed whitespace-pre-line">
              {settings.return_policy_conditions}
            </p>
          </div>
        )}

        {/* Action / Concierge Contact Banner */}
        <div className="bg-gradient-to-r from-[#17130f] via-[#120f0d] to-[#1a140e] border border-[#c8874a]/30 p-8 sm:p-10 rounded-sm flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
          <div className="space-y-1.5 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 text-emerald-400 text-[11px] font-bold uppercase tracking-wider">
              <PackageCheck size={14} /> Ready to initiate?
            </div>
            <h3 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-white">
              Contact Your Personal Concierge
            </h3>
            <p className="text-xs sm:text-sm text-neutral-400 max-w-md">
              Share your Order ID with our team and we will arrange your reverse pickup immediately.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto bg-[#25D366] hover:bg-[#20bd5a] text-black text-[12px] font-bold uppercase tracking-wider px-6 py-3.5 rounded-sm transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#25D366]/20 flex-shrink-0"
            >
              <MessageCircle size={15} /> WhatsApp Concierge
            </a>
            <Link
              href="/track-order"
              className="w-full sm:w-auto bg-white/[0.06] hover:bg-white/[0.12] text-white text-[12px] font-semibold uppercase tracking-wider px-5 py-3.5 rounded-sm transition-colors flex items-center justify-center gap-1.5 flex-shrink-0"
            >
              Track Order <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
