"use client";

import React, { useState } from "react";
import { Mail, Phone, MapPin, Clock, Check, Send, Sparkles } from "lucide-react";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "Order Inquiry",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: "", email: "", subject: "Order Inquiry", message: "" });
    }, 4000);
  };

  return (
    <div className="bg-[#0a0a0a] min-h-screen">
      {/* Banner */}
      <div className="relative border-b border-white/[0.08] bg-gradient-to-b from-[#161616] to-[#0a0a0a] py-16 sm:py-20 text-center">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
          <p className="text-[10.5px] font-bold tracking-[0.3em] uppercase text-[#c8874a] mb-2 flex items-center justify-center gap-1.5">
            <Sparkles size={14} />
            Client Relations
          </p>
          <h1 className="font-stencil text-3xl sm:text-5xl text-white tracking-[0.1em] uppercase">
            Client Concierge
          </h1>
          <p className="text-neutral-400 text-[13px] sm:text-[14px] mt-3 max-w-md mx-auto">
            Our eyewear advisors are at your service for bespoke styling, sizing, and order assistance.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-14 sm:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left: Contact Info */}
          <div className="lg:col-span-5 space-y-8">
            <div>
              <h2 className="text-2xl font-bold uppercase text-white tracking-tight mb-3">
                Get In Touch
              </h2>
              <p className="text-neutral-400 text-[13.5px] leading-relaxed">
                Whether you seek advice on frame fitting, prescription options, or corporate gifting, our concierge is here to assist you promptly.
              </p>
            </div>

            <div className="space-y-5 text-[13px]">
              <div className="flex items-start gap-4 p-4 rounded-2xl bg-[#121212] border border-white/[0.06]">
                <div className="w-10 h-10 rounded-xl bg-[#1c1c1c] flex items-center justify-center text-[#c8874a] flex-shrink-0">
                  <Mail size={18} />
                </div>
                <div>
                  <p className="font-bold text-white uppercase text-[11px] tracking-wider">Email Concierge</p>
                  <a href="mailto:concierge@spectrasunglass.com" className="text-neutral-400 hover:text-[#c8874a] transition-colors">
                    concierge@spectrasunglass.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-2xl bg-[#121212] border border-white/[0.06]">
                <div className="w-10 h-10 rounded-xl bg-[#1c1c1c] flex items-center justify-center text-[#c8874a] flex-shrink-0">
                  <Phone size={18} />
                </div>
                <div>
                  <p className="font-bold text-white uppercase text-[11px] tracking-wider">Direct Assistance</p>
                  <a href="tel:+919876543210" className="text-neutral-400 hover:text-[#c8874a] transition-colors">
                    +91 98765 43210 (Mon – Sat, 10am – 7pm IST)
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-2xl bg-[#121212] border border-white/[0.06]">
                <div className="w-10 h-10 rounded-xl bg-[#1c1c1c] flex items-center justify-center text-[#c8874a] flex-shrink-0">
                  <MapPin size={18} />
                </div>
                <div>
                  <p className="font-bold text-white uppercase text-[11px] tracking-wider">Flagship Atelier</p>
                  <p className="text-neutral-400">
                    SPECTRA Eyewear House, Design District, Mumbai 400001
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Contact Form */}
          <div className="lg:col-span-7 bg-[#121212] border border-white/[0.08] rounded-3xl p-8 sm:p-10 shadow-2xl">
            <h3 className="text-xl font-bold uppercase text-white tracking-tight mb-2">
              Send Us A Message
            </h3>
            <p className="text-neutral-400 text-[13px] mb-6">
              We usually respond within 2-4 business hours.
            </p>

            {submitted ? (
              <div className="p-6 bg-[#c8874a]/15 border border-[#c8874a]/30 rounded-2xl text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-[#c8874a] text-white mx-auto flex items-center justify-center">
                  <Check size={20} />
                </div>
                <h4 className="text-white font-bold text-[15px]">Message Received</h4>
                <p className="text-neutral-300 text-[13px]">
                  Thank you for reaching out. A client advisor will contact you shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-1.5">
                      Your Name
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Aryan Sharma"
                      className="w-full bg-[#181818] border border-white/[0.1] rounded-xl px-4 py-3 text-[13px] text-white focus:outline-none focus:border-[#c8874a]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-1.5">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="e.g. aryan@example.com"
                      className="w-full bg-[#181818] border border-white/[0.1] rounded-xl px-4 py-3 text-[13px] text-white focus:outline-none focus:border-[#c8874a]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-1.5">
                    Subject
                  </label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full bg-[#181818] border border-white/[0.1] rounded-xl px-4 py-3 text-[13px] text-white focus:outline-none focus:border-[#c8874a]"
                  >
                    <option value="Order Inquiry">Order & Tracking Assistance</option>
                    <option value="Styling Advice">Bespoke Styling & Fit Consultation</option>
                    <option value="Returns">Returns & Exchange Request</option>
                    <option value="Corporate Gifting">Corporate & Bulk Gifting</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-1.5">
                    Your Message
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Tell us how we can assist you..."
                    className="w-full bg-[#181818] border border-white/[0.1] rounded-xl px-4 py-3 text-[13px] text-white focus:outline-none focus:border-[#c8874a]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-4 bg-[#c8874a] hover:bg-[#b87840] text-white rounded-xl text-[12px] font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-all shadow-xl shadow-[#c8874a]/25 cursor-pointer"
                >
                  <Send size={15} /> Submit Inquiry
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
