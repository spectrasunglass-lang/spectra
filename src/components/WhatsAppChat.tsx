"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { MessageCircle, X, Send, Sparkles, ShieldCheck, ChevronRight } from "lucide-react";

export default function WhatsAppChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [whatsappUrl, setWhatsappUrl] = useState("https://wa.me/918129950341");
  const [customMsg, setCustomMsg] = useState("");

  useEffect(() => {
    // Fetch store whatsapp URL or phone from settings
    async function loadWhatsappSetting() {
      try {
        const supabase = createClient();
        const { data } = await supabase
          .from("settings")
          .select("key, value")
          .in("key", ["whatsapp_url", "contact_phone"]);

        if (data && data.length > 0) {
          const waUrlRow = data.find((r) => r.key === "whatsapp_url");
          const phoneRow = data.find((r) => r.key === "contact_phone");

          if (waUrlRow?.value && waUrlRow.value.trim().length > 0) {
            setWhatsappUrl(waUrlRow.value.trim());
          } else if (phoneRow?.value && phoneRow.value.trim().length > 0) {
            const clean = phoneRow.value.replace(/[^0-9]/g, "");
            setWhatsappUrl(`https://wa.me/${clean.length === 10 ? "91" + clean : clean}`);
          }
        }
      } catch (e) {
        // Fallback already set
      }
    }
    loadWhatsappSetting();
  }, []);

  const openWhatsApp = (presetText?: string) => {
    const text = presetText || customMsg || "Hi SPECTRA! I have a question about your luxury eyewear collection.";
    const base = whatsappUrl.includes("?")
      ? whatsappUrl.split("?")[0]
      : whatsappUrl;

    // Handle wa.me/c/ catalog links vs standard chat
    const finalBase = base.replace("/c/", "/");
    const targetUrl = `${finalBase}?text=${encodeURIComponent(text)}`;
    window.open(targetUrl, "_blank", "noopener,noreferrer");
    setIsOpen(false);
  };

  const quickOptions = [
    { label: "🕶️ Frame Styling Help", msg: "Hi SPECTRA! I'd love some help choosing the best sunglasses frame for my style." },
    { label: "📦 Order Status Inquiry", msg: "Hi SPECTRA! Could you please help me with my order status?" },
    { label: "🎁 Luxury Gift Inquiries", msg: "Hi SPECTRA! I'm interested in luxury gift packaging and premium editions." },
  ];

  return (
    <aside aria-label="WhatsApp Concierge" className="fixed bottom-6 right-5 sm:bottom-8 sm:right-8 z-40 flex flex-col items-end">
      {/* Popover Dialogue */}
      {isOpen && (
        <div 
          role="dialog"
          aria-modal="true"
          aria-labelledby="whatsapp-concierge-title"
          className="mb-3 w-[330px] sm:w-[360px] bg-[#111111]/95 backdrop-blur-xl border border-white/[0.12] rounded-2xl shadow-2xl shadow-black/90 overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-[#0d2a1d] to-[#131c17] p-4 border-b border-emerald-500/20 relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-[#25D366]/20 border border-[#25D366]/40 flex items-center justify-center text-[#25D366]">
                    <MessageCircle size={20} className="fill-[#25D366]" />
                  </div>
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-[#111] rounded-full animate-pulse" />
                </div>
                <div>
                  <h3 id="whatsapp-concierge-title" className="text-[13px] font-bold text-white tracking-wide flex items-center gap-1.5">
                    SPECTRA Concierge
                    <Sparkles size={12} className="text-[#c8874a]" />
                  </h3>
                  <p className="text-[11px] text-emerald-400 font-medium">
                    Online • Typically replies in 5 mins
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors"
                aria-label="Close concierge"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Body Content */}
          <div className="p-4 space-y-3.5 bg-[#0e0e0e]/80">
            {/* Concierge Message */}
            <div className="bg-[#181818] border border-white/[0.06] rounded-xl p-3.5 text-[12.5px] text-neutral-300 leading-relaxed">
              <p className="text-[#c8874a] font-semibold text-[11px] uppercase tracking-wider mb-1">
                Luxury Eyewear Specialist
              </p>
              Greetings! How can we assist you with our handcrafted titanium eyewear or your bespoke order today?
            </div>

            {/* Quick Inquiry Options */}
            <div className="space-y-1.5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 px-1">
                Popular Inquiries
              </p>
              {quickOptions.map((opt, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => openWhatsApp(opt.msg)}
                  className="w-full text-left p-2.5 rounded-lg bg-[#161616] hover:bg-[#202020] border border-white/[0.05] hover:border-[#c8874a]/30 text-[12px] text-neutral-200 transition-all flex items-center justify-between group"
                >
                  <span className="truncate">{opt.label}</span>
                  <ChevronRight size={14} className="text-neutral-500 group-hover:text-[#c8874a] transition-colors flex-shrink-0" />
                </button>
              ))}
            </div>

            {/* Custom Input */}
            <div className="pt-1">
              <div className="flex items-center gap-2 bg-[#181818] border border-white/[0.1] rounded-xl px-3 py-2 focus-within:border-[#25D366]/60 transition-colors">
                <input
                  type="text"
                  value={customMsg}
                  onChange={(e) => setCustomMsg(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") openWhatsApp();
                  }}
                  placeholder="Type your message..."
                  className="bg-transparent text-white text-[12px] placeholder-neutral-500 focus:outline-none flex-1"
                />
                <button
                  type="button"
                  onClick={() => openWhatsApp()}
                  className="w-7 h-7 rounded-lg bg-[#25D366] hover:bg-[#22bf5b] flex items-center justify-center text-black transition-colors"
                  aria-label="Send WhatsApp message"
                >
                  <Send size={13} className="translate-x-[1px]" />
                </button>
              </div>
            </div>

            {/* Trust badge */}
            <div className="flex items-center justify-center gap-1.5 text-[10.5px] text-neutral-400 pt-1">
              <ShieldCheck size={13} className="text-emerald-500" />
              <span>Verified Official Maison Support</span>
            </div>
          </div>
        </div>
      )}

      {/* Floating Trigger Button */}
      <button
        type="button"
        onClick={() => {
          setIsOpen((prev) => !prev);
          setHasInteracted(true);
        }}
        className="group relative flex items-center gap-2.5 bg-[#121212] hover:bg-[#181818] border border-[#25D366]/40 hover:border-[#25D366] text-white p-3 sm:px-4 sm:py-3 rounded-full shadow-2xl shadow-black/80 hover:shadow-[#25D366]/20 transition-all duration-300 active:scale-95"
        aria-label="Open WhatsApp Chat with SPECTRA Concierge"
      >
        {/* Pulsing ring */}
        <span className="absolute -inset-0.5 rounded-full bg-[#25D366]/20 blur-sm group-hover:bg-[#25D366]/30 transition-all" />

        {/* Brand WhatsApp Icon with Glowing Backdrop */}
        <div className="relative w-8 h-8 rounded-full bg-[#25D366] flex items-center justify-center text-black shadow-md flex-shrink-0">
          <MessageCircle size={18} className="fill-black text-black" />
          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 border-2 border-[#121212] rounded-full animate-ping" />
          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 border-2 border-[#121212] rounded-full" />
        </div>

        {/* Label (Desktop) */}
        <div className="hidden sm:flex flex-col text-left pr-1 relative z-10">
          <span className="text-[12px] font-bold text-white tracking-wide leading-none">
            Chat on WhatsApp
          </span>
          <span className="text-[10px] text-emerald-400 font-medium leading-tight mt-0.5">
            Eyewear Concierge
          </span>
        </div>
      </button>
    </aside>
  );
}
