"use client";

import React, { useState, useEffect } from "react";
import { Mail, Phone, MapPin, Check, Send, MessageCircle } from "lucide-react";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "Order Inquiry",
    message: "",
  });

  const [contacts, setContacts] = useState({
    email: "spectrasunglass@gmail.com",
    phone: "+91 81299 50341",
    whatsapp: "https://wa.me/c/918129950341",
  });

  useEffect(() => {
    async function loadContacts() {
      try {
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();
        const { data } = await supabase.from("settings").select("key, value");
        if (data && data.length > 0) {
          const map: Record<string, string> = {};
          data.forEach((r) => {
            if (r.value) map[r.key] = r.value;
          });
          setContacts((prev) => ({
            email: map.contact_email || prev.email,
            phone: map.contact_phone || prev.phone,
            whatsapp: map.whatsapp_url || prev.whatsapp,
          }));
        }
      } catch (err) {
        console.error("Contact page settings load err", err);
      }
    }
    loadContacts();
  }, []);

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
          <p className="text-[10.5px] font-bold tracking-[0.3em] uppercase text-[#c8874a] mb-2 flex items-center justify-center">
            Client Relations
          </p>
          <h1 className="text-3xl sm:text-5xl font-bold text-white tracking-tight uppercase">
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
              <div className="flex items-start gap-4 p-4 rounded-sm bg-[#121212]">
                <div className="w-10 h-10 rounded-sm bg-[#1c1c1c] flex items-center justify-center text-[#c8874a] flex-shrink-0">
                  <Mail size={18} />
                </div>
                <div>
                  <p className="font-bold text-white uppercase text-[11px] tracking-wider">Email Concierge</p>
                  <a href={`mailto:${contacts.email}`} className="text-neutral-400 hover:text-[#c8874a] transition-colors break-all">
                    {contacts.email}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-sm bg-[#121212]">
                <div className="w-10 h-10 rounded-sm bg-[#1c1c1c] flex items-center justify-center text-[#c8874a] flex-shrink-0">
                  <Phone size={18} />
                </div>
                <div>
                  <p className="font-bold text-white uppercase text-[11px] tracking-wider">Direct Assistance</p>
                  <a href={`tel:${contacts.phone.replace(/\s+/g, "")}`} className="text-neutral-400 hover:text-[#c8874a] transition-colors">
                    {contacts.phone} (Mon – Sat, 10am – 7pm IST)
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-sm bg-[#121212]">
                <div className="w-10 h-10 rounded-sm bg-[#1c1c1c] flex items-center justify-center text-[#25D366] flex-shrink-0">
                  <MessageCircle size={18} />
                </div>
                <div>
                  <p className="font-bold text-white uppercase text-[11px] tracking-wider">WhatsApp Concierge</p>
                  <a href={contacts.whatsapp} target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-[#25D366] transition-colors font-medium">
                    Chat with an Advisor on WhatsApp &rarr;
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-sm bg-[#121212]">
                <div className="w-10 h-10 rounded-sm bg-[#1c1c1c] flex items-center justify-center text-[#c8874a] flex-shrink-0">
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
          <div className="lg:col-span-7 bg-[#121212] rounded-sm p-8 sm:p-10 shadow-2xl">
            <h3 className="text-xl font-bold uppercase text-white tracking-tight mb-2">
              Send Us A Message
            </h3>
            <p className="text-neutral-400 text-[13px] mb-6">
              We usually respond within 2-4 business hours.
            </p>

            {submitted ? (
              <div className="p-6 bg-[#c8874a]/15 border border-[#c8874a]/30 rounded-sm text-center space-y-2">
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
                      placeholder="Enter your name"
                      className="w-full bg-[#181818] rounded-sm px-4 py-3 text-[13px] text-white placeholder-neutral-500 focus:outline-none transition-colors"
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
                      placeholder="Enter your email address"
                      className="w-full bg-[#181818] rounded-sm px-4 py-3 text-[13px] text-white placeholder-neutral-500 focus:outline-none transition-colors"
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
                    className="w-full bg-[#181818] rounded-sm px-4 py-3 text-[13px] text-white focus:outline-none transition-colors"
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
                    className="w-full bg-[#181818] rounded-sm px-4 py-3 text-[13px] text-white placeholder-neutral-500 focus:outline-none transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-4 bg-[#c8874a] hover:bg-[#b87840] text-white rounded-sm text-[12px] font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-all shadow-xl shadow-[#c8874a]/25 cursor-pointer"
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
