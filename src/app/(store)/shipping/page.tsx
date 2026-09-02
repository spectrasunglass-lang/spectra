import React from "react";
import Link from "next/link";
import { Truck, Clock, ShieldCheck, Package, ArrowRight } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shipping Policy — SPECTRA",
  description: "Read about SPECTRA shipping timelines, complimentary express delivery, and secure insured packaging.",
};

export default function ShippingPolicyPage() {
  const policies = [
    {
      icon: <Truck size={22} className="text-[#c8874a]" />,
      title: "Complimentary Express Delivery",
      desc: "All SPECTRA orders enjoy complimentary express shipping across India with zero hidden handling fees.",
    },
    {
      icon: <Clock size={22} className="text-[#c8874a]" />,
      title: "Dispatch & Delivery Timeline",
      desc: "Orders are processed and dispatched within 24–48 hours. Metro delivery typically arrives in 2–4 business days; other regions within 4–6 business days.",
    },
    {
      icon: <ShieldCheck size={22} className="text-[#c8874a]" />,
      title: "Insured & Tamper-Evident",
      desc: "Each package is 100% transit-insured and delivered in our custom magnetic hard case with tamper-evident sealing.",
    },
    {
      icon: <Package size={22} className="text-[#c8874a]" />,
      title: "Live Order Tracking",
      desc: "Once dispatched, you will receive real-time tracking updates via SMS & email to monitor your parcel from our studio to your doorstep.",
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
            Shipping Policy
          </h1>
          <p className="text-neutral-400 text-xs sm:text-sm mt-3 max-w-md mx-auto">
            Reliable, complimentary express courier delivery for all handcrafted eyewear.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-5 sm:px-8 pt-12 space-y-12">
        {/* Policy Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {policies.map((p, idx) => (
            <div
              key={idx}
              className="bg-[#111111] p-6 rounded-sm space-y-3"
            >
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

        {/* Additional Details */}
        <div className="bg-[#111111] p-6 sm:p-8 rounded-sm space-y-6">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-white mb-2">
              Delivery Address & Availability
            </h2>
            <p className="text-xs sm:text-[13px] text-neutral-400 leading-relaxed">
              Please ensure your complete delivery address, contact phone number, and postal code are accurate during checkout. Our courier partners attempt delivery up to 3 times before returning the shipment to our central hub.
            </p>
          </div>

          <div className="pt-6">
            <h2 className="text-sm font-bold uppercase tracking-wider text-white mb-2">
              Damaged or Tampered Parcels
            </h2>
            <p className="text-xs sm:text-[13px] text-neutral-400 leading-relaxed">
              If your package arrives visibly damaged or tampered with, please do not accept delivery and immediately contact our Client Concierge team for a priority replacement.
            </p>
          </div>
        </div>

        {/* CTA Banner */}
        <div className="bg-gradient-to-r from-[#141414] to-[#1a1612] p-6 sm:p-8 rounded-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              Already have an order?
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              Check live fulfillment status using your Order ID.
            </p>
          </div>
          <Link
            href="/track-order"
            className="bg-[#c8874a] hover:bg-[#b87840] text-white text-xs font-bold uppercase tracking-wider px-5 py-3 rounded-sm transition-colors flex items-center gap-2 flex-shrink-0"
          >
            Track Order <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
