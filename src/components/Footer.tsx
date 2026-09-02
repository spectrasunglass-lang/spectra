"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Check, ChevronDown, Mail, Phone, MessageCircle } from "lucide-react";

const footerSections = [
  {
    id: "shop",
    title: "Shop Collections",
    links: [
      { name: "Home", href: "/" },
      { name: "New Arrivals", href: "/new-arrivals" },
      { name: "Men's Sunglasses", href: "/men" },
      { name: "Women's Sunglasses", href: "/women" },
      { name: "Spectra Collections", href: "/collections" },
      { name: "Polarized Lenses", href: "/polarized" },
      { name: "Luxury Gift Sets", href: "/gifts" },
    ],
  },
  {
    id: "care",
    title: "Client Concierge",
    links: [
      { name: "Track Your Order", href: "/track-order" },
      { name: "Shipping Policy", href: "/shipping" },
      { name: "Authenticity Guarantee", href: "/authenticity" },
      { name: "Privacy Policy", href: "/privacy-policy" },
      { name: "Terms of Service", href: "/terms-of-service" },
      { name: "FAQ & Assistance", href: "/faq" },
    ],
  },
  {
    id: "maison",
    title: "The Maison",
    links: [
      { name: "Our Heritage & Story", href: "/about" },
      { name: "Contact Concierge", href: "/contact" },
      { name: "Admin Portal", href: "/admin" },
    ],
  },
];

export default function Footer() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState("");
  const [openSection, setOpenSection] = useState<string | null>(null);

  const [contacts, setContacts] = useState({
    email: "spectrasunglass@gmail.com",
    phone: "+91 81299 50341",
    whatsapp: "https://wa.me/c/918129950341",
    instagram: "https://instagram.com",
    facebook: "https://facebook.com",
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
            instagram: map.instagram_url || prev.instagram,
            facebook: map.facebook_url || prev.facebook,
          }));
        }
      } catch (err) {
        console.error("Footer contacts load err", err);
      }
    }
    loadContacts();
  }, []);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || loading) return;
    setLoading(true);
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setSubscribed(true);
        setFeedbackMsg(data.message || "Welcome to SPECTRA. You are now on the VIP list.");
        setEmail("");
        setTimeout(() => {
          setSubscribed(false);
        }, 5000);
      } else {
        alert(data.error || "Subscription failed. Please try again.");
      }
    } catch {
      alert("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (id: string) => {
    setOpenSection((prev) => (prev === id ? null : id));
  };

  return (
    <footer className="relative bg-[#070707] text-white border-t border-white/[0.08] overflow-hidden">
      {/* Top Gold Hairline */}
      <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-[#c8874a] to-transparent" />

      {/* Main Footer Container */}
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 pb-0 md:pb-14 md:border-b border-white/[0.06]">

          {/* Brand & Newsletter Column */}
          <div className="lg:col-span-2 space-y-6 pb-6 md:pb-0 border-b md:border-b-0 border-white/[0.06]">
            <Link href="/" className="inline-block hover:opacity-80 transition-opacity">
              <Image
                src="/logo/logo.png"
                alt="SPECTRA"
                width={150}
                height={40}
                className="h-8 w-auto object-contain brightness-0 invert"
                priority
              />
            </Link>

            <p className="text-neutral-400 text-[13px] leading-relaxed max-w-sm">
Crafted for visionaries. Designed to stand apart. Luxury eyewear with timeless style and precision.            </p>

            {/* Newsletter Subscription */}
            <div className="pt-2">
              <p className="text-[11px] font-bold tracking-[0.2em] uppercase text-white mb-2.5">
                Join The Inner Circle
              </p>
              <p className="text-[12px] text-neutral-500 mb-3.5">
                Subscribe for exclusive private releases, bespoke drops, and VIP previews.
              </p>

              {subscribed ? (
                <div className="flex items-center gap-2 bg-[#c8874a]/15 border border-[#c8874a]/30 text-[#e5a872] px-4 py-3 rounded-xl text-[12px] font-bold">
                  <Check size={16} />
                  {feedbackMsg}
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email address"
                      required
                      disabled={loading}
                      className="w-full bg-[#121212] rounded-sm px-4 py-3 text-[12.5px] text-white placeholder-neutral-500 focus:outline-none focus:border-[#c8874a] transition-colors disabled:opacity-50"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-[#c8874a] hover:bg-[#b87840] text-white px-5 py-3 rounded-sm text-[12px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-md shadow-[#c8874a]/20 flex-shrink-0 cursor-pointer disabled:opacity-60"
                  >
                    {loading ? "Joining..." : "Subscribe"}
                    <ArrowRight size={14} />
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* --- MOBILE ACCORDION SECTIONS --- */}
          <div className="md:hidden col-span-1 divide-y divide-white/[0.06] border-b border-white/[0.06]">
            {footerSections.map((section) => {
              const isOpen = openSection === section.id;
              return (
                <div key={section.id}>
                  <button
                    onClick={() => toggleSection(section.id)}
                    className="w-full flex items-center justify-between py-4 text-left"
                  >
                    <span className="text-[11px] font-bold tracking-[0.25em] uppercase text-[#c8874a]">
                      {section.title}
                    </span>
                    <ChevronDown
                      size={15}
                      className={`text-neutral-400 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                  <div
                    className={`overflow-hidden transition-all duration-300 ease-out ${isOpen ? "max-h-96 pb-4" : "max-h-0"}`}
                  >
                    <ul className="space-y-3 text-[12.5px]">
                      {section.links.map((link) => (
                        <li key={link.name}>
                          <Link
                            href={link.href}
                            className="text-neutral-400 hover:text-white transition-colors"
                          >
                            {link.name}
                          </Link>
                        </li>
                      ))}
                      {/* Contact info inside Maison accordion */}
                      {section.id === "maison" && (
                        <li className="pt-2 space-y-2 text-[12px] text-neutral-400">
                          <div className="flex items-center gap-2">
                            <Mail size={13} className="text-[#c8874a]" />
                            <a href={`mailto:${contacts.email}`} className="hover:text-white transition-colors">
                              {contacts.email}
                            </a>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone size={13} className="text-[#c8874a]" />
                            <a href={`tel:${contacts.phone.replace(/\s+/g, "")}`} className="hover:text-white transition-colors">
                              {contacts.phone}
                            </a>
                          </div>
                          <div className="flex items-center gap-2">
                            <MessageCircle size={13} className="text-[#25D366]" />
                            <a href={contacts.whatsapp} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                              WhatsApp Concierge
                            </a>
                          </div>
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>

          {/* --- DESKTOP COLUMNS (hidden on mobile) --- */}
          {/* Shop Column */}
          <div className="hidden md:block space-y-4">
            <h4 className="text-[11px] font-bold tracking-[0.25em] uppercase text-[#c8874a]">
              Shop Collections
            </h4>
            <ul className="space-y-2.5 text-[12.5px]">
              {[
                { name: "Home", href: "/" },
                { name: "New Arrivals", href: "/new-arrivals" },
                { name: "Men's Sunglasses", href: "/men" },
                { name: "Women's Sunglasses", href: "/women" },
                { name: "Spectra Collections", href: "/collections" },
                { name: "Polarized Lenses", href: "/polarized" },
                { name: "Luxury Gift Sets", href: "/gifts" },
              ].map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-neutral-400 hover:text-white hover:translate-x-1 transition-all inline-block duration-200">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Care Column */}
          <div className="hidden md:block space-y-4">
            <h4 className="text-[11px] font-bold tracking-[0.25em] uppercase text-[#c8874a]">
              Client Concierge
            </h4>
            <ul className="space-y-2.5 text-[12.5px]">
              {[
                { name: "Track Your Order", href: "/track-order" },
                { name: "Shipping Policy", href: "/shipping" },
                { name: "Authenticity Guarantee", href: "/authenticity" },
                { name: "Privacy Policy", href: "/privacy-policy" },
                { name: "Terms of Service", href: "/terms-of-service" },
                { name: "FAQ & Assistance", href: "/faq" },
              ].map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-neutral-400 hover:text-white hover:translate-x-1 transition-all inline-block duration-200">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Maison & Contact Column */}
          <div className="hidden md:block space-y-4">
            <h4 className="text-[11px] font-bold tracking-[0.25em] uppercase text-[#c8874a]">
              The Maison
            </h4>
            <ul className="space-y-2.5 text-[12.5px]">
              {[
                { name: "Our Heritage & Story", href: "/about" },
                { name: "Contact Concierge", href: "/contact" },
                { name: "Admin Portal", href: "/admin" },
              ].map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-neutral-400 hover:text-white hover:translate-x-1 transition-all inline-block duration-200">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Direct Contact */}
            <div className="pt-2 space-y-2 text-[12px] text-neutral-400">
              <div className="flex items-center gap-2">
                <Mail size={13} className="text-[#c8874a] flex-shrink-0" />
                <a href={`mailto:${contacts.email}`} className="hover:text-white transition-colors break-all">
                  {contacts.email}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={13} className="text-[#c8874a] flex-shrink-0" />
                <a href={`tel:${contacts.phone.replace(/\s+/g, "")}`} className="hover:text-white transition-colors">
                  {contacts.phone}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <MessageCircle size={13} className="text-[#25D366] flex-shrink-0" />
                <a href={contacts.whatsapp} target="_blank" rel="noopener noreferrer" className="hover:text-[#25D366] transition-colors">
                  WhatsApp Concierge
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright, Crafted By & Payment Badges */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-neutral-500 text-center md:text-left">
          {/* Left: Copyright */}
          <div>
            <p>&copy; {new Date().getFullYear()} SPECTRA Eyewear. All rights reserved.</p>
          </div>

          {/* Center: Crafted by Ekodrix */}
          <div className="text-neutral-400 text-[11px] text-center">
            Crafted by{" "}
            <a
              href="https://ekodrix.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#c8874a] hover:text-[#e5a872] hover:underline transition-colors font-medium"
            >
              Ekodrix
            </a>
          </div>

          {/* Right: Social Links & Payment Pill */}
          <div className="flex flex-wrap items-center justify-center md:justify-end gap-3 w-full md:w-auto">
            <div className="flex items-center gap-2.5">
              <a
                href={contacts.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-[#141414] border border-white/[0.08] flex items-center justify-center text-neutral-400 hover:text-[#25D366] hover:border-[#25D366]/50 transition-colors"
                aria-label="WhatsApp"
              >
                <MessageCircle size={14} />
              </a>
              <a
                href={contacts.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-[#141414] border border-white/[0.08] flex items-center justify-center text-neutral-400 hover:text-white hover:border-[#c8874a]/50 transition-colors"
                aria-label="Instagram"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                </svg>
              </a>
              <a
                href={contacts.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-[#141414] border border-white/[0.08] flex items-center justify-center text-neutral-400 hover:text-white hover:border-[#c8874a]/50 transition-colors"
                aria-label="Facebook"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                </svg>
              </a>
            </div>

            <div className="flex items-center gap-1.5 px-3.5 py-2 bg-[#121212] border border-white/[0.06] rounded-lg text-[10px] text-neutral-400 font-bold uppercase tracking-wider">
              <span>UPI</span>
              <span>•</span>
              <span>CARDS</span>
              <span>•</span>
              <span>NET BANKING</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
