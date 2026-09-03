"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ChevronDown, HelpCircle, ArrowRight, Sparkles } from "lucide-react";

interface FAQItem {
  q: string;
  a: string;
  category: string;
}

const faqs: FAQItem[] = [
  {
    category: "Orders & Shipping",
    q: "How long will it take for my order to arrive?",
    a: "Orders are processed within 24–48 hours. Metro deliveries typically arrive in 2–4 business days, while all other locations across India are delivered within 4–6 business days via complimentary express courier.",
  },
  {
    category: "Orders & Shipping",
    q: "How do I track my delivery in real-time?",
    a: "You can track your order at any time on our Track Your Order page by simply entering your Order ID (e.g. 7422BC25). You will also receive real-time SMS and email dispatch notifications.",
  },
  {
    category: "Orders & Shipping",
    q: "Do you offer Cash on Delivery and express delivery in Malappuram and across Kerala?",
    a: "Yes. SPECTRA provides fast 24–48 hour express courier delivery and Cash on Delivery across Malappuram, Kozhikode, Kochi, Kannur, Thrissur, and all 14 districts of Kerala, as well as Pan-India with real-time tracking.",
  },
  {
    category: "Optics & Quality",
    q: "Are all SPECTRA sunglasses polarized with UV protection?",
    a: "Yes. Every SPECTRA optical lens is equipped with UV400 filtration blocking 100% of UVA and UVB rays, featuring multi-layer anti-reflective coatings and high-contrast polarization.",
  },
  {
    category: "Optics & Quality",
    q: "What is covered under the 1-Year Maison Warranty?",
    a: "Our warranty covers manufacturing defects, optical coating delamination, and hinge or frame structural faults for 12 months from the date of purchase. It excludes accidental drops or lens scratches from improper storage.",
  },
  {
    category: "Payments & Security",
    q: "What payment options do you support?",
    a: "We support full online payments (UPI, Credit/Debit Cards, NetBanking) as well as partial COD with a secure nominal booking advance via Razorpay 256-bit encrypted gateway.",
  },
  {
    category: "Assistance",
    q: "How can I contact Client Concierge for assistance?",
    a: "Our eyewear advisors are available via WhatsApp (+91 81299 50341) and email (spectrasunglass@gmail.com) on our Contact Concierge page to assist with bespoke sizing, styling advice, and order modifications.",
  },
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.a,
      },
    })),
  };

  return (
    <div className="bg-[#0a0a0a] min-h-screen text-white pb-20">
      {/* FAQPage Schema for Google Search Accordions */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      {/* Header Banner */}
      <div className="bg-gradient-to-b from-[#141414] to-[#0a0a0a] py-16 sm:py-20 text-center">
        <div className="max-w-5xl mx-auto px-4">
          <p className="text-[10.5px] font-bold tracking-[0.3em] uppercase text-[#c8874a] mb-2">
            Client Concierge
          </p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight uppercase">
            FAQ & Assistance
          </h1>
          <p className="text-neutral-400 text-xs sm:text-sm mt-3 max-w-md mx-auto">
            Frequently asked questions about our optical craft, shipping, warranty, and orders.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-5 sm:px-8 pt-12 space-y-12">
        {/* Accordion List */}
        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="bg-[#111111] rounded-sm overflow-hidden transition-colors"
              >
                <button
                  type="button"
                  onClick={() => toggle(idx)}
                  className="w-full px-6 py-4 sm:py-5 flex items-center justify-between text-left gap-4 cursor-pointer hover:bg-white/[0.02] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#c8874a] bg-[#181818] px-2 py-0.5 rounded-sm flex-shrink-0">
                      {faq.category}
                    </span>
                    <h3 className="text-xs sm:text-sm font-semibold text-neutral-200">
                      {faq.q}
                    </h3>
                  </div>
                  <ChevronDown
                    size={16}
                    className={`text-neutral-400 transition-transform duration-200 flex-shrink-0 ${
                      isOpen ? "rotate-180 text-[#c8874a]" : ""
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-6 pb-5 pt-1 text-xs sm:text-[13px] text-neutral-400 leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Contact CTA */}
        <div className="bg-gradient-to-r from-[#141414] to-[#1a1612] p-6 sm:p-8 rounded-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              Still need personalized assistance?
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              Our eyewear concierges are on standby to answer sizing, prescription, or order queries.
            </p>
          </div>
          <Link
            href="/contact"
            className="bg-[#c8874a] hover:bg-[#b87840] text-white text-xs font-bold uppercase tracking-wider px-5 py-3 rounded-sm transition-colors flex items-center gap-2 flex-shrink-0"
          >
            Contact Us <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
