import React from "react";
import Link from "next/link";
import { FileText, Scale, ShieldAlert, CheckCircle, ArrowRight } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — SPECTRA",
  description: "Review SPECTRA conditions of sale, order policies, intellectual property rights, and user agreements.",
};

export default function TermsOfServicePage() {
  const terms = [
    {
      icon: <CheckCircle size={22} className="text-[#c8874a]" />,
      title: "Order Acceptance & Pricing",
      desc: "All orders placed are subject to product availability and confirmation of order payment. Prices are inclusive of applicable taxes and free express shipping.",
    },
    {
      icon: <Scale size={22} className="text-[#c8874a]" />,
      title: "Intellectual Property",
      desc: "All silhouettes, brand marks, optical formulations, product photographs, and visual assets are the exclusive property of SPECTRA and protected by law.",
    },
    {
      icon: <ShieldAlert size={22} className="text-[#c8874a]" />,
      title: "Authenticity & Warranty",
      desc: "Our 1-year warranty applies strictly to manufacturing defects for authentic products purchased directly through our official boutique portal.",
    },
    {
      icon: <FileText size={22} className="text-[#c8874a]" />,
      title: "Governing Law & Disputes",
      desc: "These terms and transactions are governed under Indian jurisdiction. Any disputes shall be subject to amicable conciliation with our Client Concierge.",
    },
  ];

  return (
    <div className="bg-[#0a0a0a] min-h-screen text-white pb-20">
      {/* Header Banner */}
      <div className="bg-gradient-to-b from-[#141414] to-[#0a0a0a] py-16 sm:py-20 text-center">
        <div className="max-w-5xl mx-auto px-4">
          <p className="text-[10.5px] font-bold tracking-[0.3em] uppercase text-[#c8874a] mb-2">
            Legal & Governance
          </p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight uppercase">
            Terms of Service
          </h1>
          <p className="text-neutral-400 text-xs sm:text-sm mt-3 max-w-md mx-auto">
            Rules, agreements, and guidelines governing your purchase and experience with SPECTRA.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-5 sm:px-8 pt-12 space-y-12">
        {/* Terms Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {terms.map((t, idx) => (
            <div key={idx} className="bg-[#111111] p-6 rounded-sm space-y-3">
              <div className="w-10 h-10 rounded-sm bg-[#181818] flex items-center justify-center">
                {t.icon}
              </div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                {t.title}
              </h3>
              <p className="text-xs sm:text-[13px] text-neutral-400 leading-relaxed">
                {t.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Detailed Guidelines */}
        <div className="bg-[#111111] p-6 sm:p-8 rounded-sm space-y-6">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-white mb-2">
              User Conduct & Accurate Information
            </h2>
            <p className="text-xs sm:text-[13px] text-neutral-400 leading-relaxed">
              By purchasing from SPECTRA, you agree to provide true, accurate, and current delivery address and contact information. We reserve the right to cancel or pause orders with fraudulent or unverifiable shipping details.
            </p>
          </div>

          <div className="pt-6">
            <h2 className="text-sm font-bold uppercase tracking-wider text-white mb-2">
              Modifications to Service
            </h2>
            <p className="text-xs sm:text-[13px] text-neutral-400 leading-relaxed">
              Prices, product releases, and promotions are subject to change without prior notice. We continuously refine optical technologies to provide optimal visual protection.
            </p>
          </div>
        </div>

        {/* Contact CTA */}
        <div className="bg-gradient-to-r from-[#141414] to-[#1a1612] p-6 sm:p-8 rounded-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              Questions Regarding Terms?
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              Our legal and client support team is available for any clarifications.
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
