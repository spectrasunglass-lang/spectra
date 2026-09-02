import React from "react";
import Link from "next/link";
import { Shield, Lock, EyeOff, UserCheck, ArrowRight } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — SPECTRA",
  description: "Read the SPECTRA Privacy Policy, data confidentiality commitments, and encrypted payment security standards.",
};

export default function PrivacyPolicyPage() {
  const principles = [
    {
      icon: <Lock size={22} className="text-[#c8874a]" />,
      title: "Encrypted Transactions",
      desc: "All financial transactions are processed through 256-bit encrypted gateways via Razorpay. SPECTRA never stores card numbers, CVVs, or banking PINs.",
    },
    {
      icon: <EyeOff size={22} className="text-[#c8874a]" />,
      title: "Zero Third-Party Sharing",
      desc: "We do not sell, rent, or monetize your personal information. Your contact data is strictly used for order fulfillment and customer concierge.",
    },
    {
      icon: <Shield size={22} className="text-[#c8874a]" />,
      title: "Secure Order Fulfillment",
      desc: "Delivery coordinates are shared exclusively with certified courier partners to ensure safe doorstep delivery and tracking notifications.",
    },
    {
      icon: <UserCheck size={22} className="text-[#c8874a]" />,
      title: "Your Rights & Access",
      desc: "You retain full control over your stored details. You may request profile information review or deletion at any time by contacting our team.",
    },
  ];

  return (
    <div className="bg-[#0a0a0a] min-h-screen text-white pb-20">
      {/* Header Banner */}
      <div className="bg-gradient-to-b from-[#141414] to-[#0a0a0a] py-16 sm:py-20 text-center">
        <div className="max-w-5xl mx-auto px-4">
          <p className="text-[10.5px] font-bold tracking-[0.3em] uppercase text-[#c8874a] mb-2">
            Client Concierge
          </p>
          <h1 className="font-stencil text-2xl sm:text-3xl md:text-4xl lg:text-[44px] text-white tracking-[0.04em] sm:tracking-[0.06em] uppercase whitespace-nowrap">
            Privacy Policy
          </h1>
          <p className="text-neutral-400 text-xs sm:text-sm mt-3 max-w-md mx-auto">
            Our commitment to safeguarding your privacy, personal data, and payment security.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-5 sm:px-8 pt-12 space-y-12">
        {/* Principles Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {principles.map((p, idx) => (
            <div key={idx} className="bg-[#111111] p-6 rounded-sm space-y-3">
              <div className="w-10 h-10 rounded-sm bg-[#181818] flex items-center justify-center">
                {p.icon}
              </div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                {p.title}
              </h3>
              <p className="text-xs sm:text-[13px] text-neutral-400 leading-relaxed">
                {p.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Detailed Sections */}
        <div className="bg-[#111111] p-6 sm:p-8 rounded-sm space-y-6">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-white mb-2">
              Information We Collect
            </h2>
            <p className="text-xs sm:text-[13px] text-neutral-400 leading-relaxed">
              When you place an order, we collect essential fulfillment information including your name, email address, phone number, and delivery destination. This data is used solely to dispatch your parcel and provide delivery tracking updates.
            </p>
          </div>

          <div className="pt-6">
            <h2 className="text-sm font-bold uppercase tracking-wider text-white mb-2">
              Cookies & Browsing Analytics
            </h2>
            <p className="text-xs sm:text-[13px] text-neutral-400 leading-relaxed">
              We utilize essential session cookies to remember your shopping cart items, wishlist selections, and preferences. Anonymous analytical data helps us refine optical collections and improve store responsiveness.
            </p>
          </div>
        </div>

        {/* Contact CTA */}
        <div className="bg-gradient-to-r from-[#141414] to-[#1a1612] p-6 sm:p-8 rounded-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              Privacy Inquiries
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              Contact our Data Protection desk for inquiries or account data removal requests.
            </p>
          </div>
          <Link
            href="/contact"
            className="bg-[#c8874a] hover:bg-[#b87840] text-white text-xs font-bold uppercase tracking-wider px-5 py-3 rounded-sm transition-colors flex items-center gap-2 flex-shrink-0"
          >
            Contact Concierge <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
