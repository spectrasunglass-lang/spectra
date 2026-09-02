import React from "react";
import Link from "next/link";
import { ShieldCheck, Award, QrCode, Sparkles, ArrowRight } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Authenticity Guarantee — SPECTRA",
  description: "Learn about the SPECTRA Authenticity Guarantee, serialized certification, and laser-engraved optical markings.",
};

export default function AuthenticityPage() {
  const hallmarks = [
    {
      icon: <Award size={22} className="text-[#c8874a]" />,
      title: "100% Genuine Craftsmanship",
      desc: "Every pair of SPECTRA sunglasses is original, designed and assembled using premium materials including aerospace titanium and Japanese acetate.",
    },
    {
      icon: <QrCode size={22} className="text-[#c8874a]" />,
      title: "Serialized Certificate",
      desc: "Each piece arrives with an individual Certificate of Authenticity containing a unique serial number verifiable with our Concierge.",
    },
    {
      icon: <Sparkles size={22} className="text-[#c8874a]" />,
      title: "Laser-Etched Signatures",
      desc: "Authentic SPECTRA lenses feature micro laser-engraved signatures at the corner and detailed frame specifications etched inside the temple arms.",
    },
    {
      icon: <ShieldCheck size={22} className="text-[#c8874a]" />,
      title: "1-Year Maison Warranty",
      desc: "All genuine purchases are protected by our 12-month warranty against manufacturing defects and structural craftsmanship issues.",
    },
  ];

  return (
    <div className="bg-[#0a0a0a] min-h-screen text-white pb-20">
      {/* Header Banner */}
      <div className="bg-gradient-to-b from-[#141414] to-[#0a0a0a] py-16 sm:py-20 text-center">
        <div className="max-w-5xl mx-auto px-4">
          <p className="text-[10.5px] font-bold tracking-[0.3em] uppercase text-[#c8874a] mb-2">
            Maison Standards
          </p>
          <h1 className="font-stencil text-2xl sm:text-3xl md:text-4xl lg:text-[44px] text-white tracking-[0.04em] sm:tracking-[0.06em] uppercase whitespace-nowrap">
            Authenticity Guarantee
          </h1>
          <p className="text-neutral-400 text-xs sm:text-sm mt-3 max-w-md mx-auto">
            Our uncompromised commitment to genuine luxury, optical precision, and artisan integrity.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-5 sm:px-8 pt-12 space-y-12">
        {/* Hallmarks Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {hallmarks.map((h, idx) => (
            <div
              key={idx}
              className="bg-[#111111] p-6 rounded-sm space-y-3"
            >
              <div className="w-10 h-10 rounded-sm bg-[#181818] flex items-center justify-center">
                {h.icon}
              </div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                {h.title}
              </h3>
              <p className="text-xs sm:text-[13px] text-neutral-400 leading-relaxed">
                {h.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Verification Details */}
        <div className="bg-[#111111] p-6 sm:p-8 rounded-sm space-y-6">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-white mb-2">
              Authorized Channels
            </h2>
            <p className="text-xs sm:text-[13px] text-neutral-400 leading-relaxed">
              To guarantee authenticity, always purchase directly from our official website or authorized boutique partners. SPECTRA does not guarantee items purchased through unauthorized third-party resellers or auction platforms.
            </p>
          </div>

          <div className="pt-6">
            <h2 className="text-sm font-bold uppercase tracking-wider text-white mb-2">
              Signature Packaging
            </h2>
            <p className="text-xs sm:text-[13px] text-neutral-400 leading-relaxed">
              Every authentic order is delivered with our bespoke magnetic hard case, embossed high-density microfiber cloth, and security seal.
            </p>
          </div>
        </div>

        {/* Support CTA */}
        <div className="bg-gradient-to-r from-[#141414] to-[#1a1612] p-6 sm:p-8 rounded-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              Have questions about your product?
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              Contact our Client Concierge team for serial verification or support.
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
