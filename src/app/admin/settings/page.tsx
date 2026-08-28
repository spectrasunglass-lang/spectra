"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Save, Loader2, CheckCircle2, Globe, Mail, Phone, Link2, Share2, RefreshCw } from "lucide-react";

interface SettingsForm {
  store_name: string;
  tagline: string;
  contact_email: string;
  contact_phone: string;
  instagram_url: string;
  facebook_url: string;
  currency: string;
  free_shipping_threshold: string;
  return_window_days: string;
  tax_included: string;
}

const defaults: SettingsForm = {
  store_name: "SPECTRA",
  tagline: "See Beyond Limits",
  contact_email: "",
  contact_phone: "",
  instagram_url: "",
  facebook_url: "",
  currency: "INR",
  free_shipping_threshold: "0",
  return_window_days: "14",
  tax_included: "true",
};

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<SettingsForm>(defaults);

  const set = (k: keyof SettingsForm, v: string) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  const loadSettings = async () => {
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("settings")
      .select("key, value")
      .in("key", Object.keys(defaults));
    if (data && data.length > 0) {
      const loaded: Partial<SettingsForm> = {};
      data.forEach((row) => {
        if (row.key in defaults) {
          (loaded as Record<string, string>)[row.key] = row.value ?? "";
        }
      });
      setForm({ ...defaults, ...loaded });
    }
    setLoading(false);
  };

  useEffect(() => { loadSettings(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const supabase = createClient();
      const entries = Object.entries(form).map(([key, value]) => ({ key, value: String(value) }));
      const { error: dbError } = await supabase
        .from("settings")
        .upsert(entries, { onConflict: "key" });
      if (dbError) throw new Error(dbError.message);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const taxOn = form.tax_included === "true";

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 gap-3">
        <Loader2 size={20} className="animate-spin text-[#c8874a]" />
        <p className="text-[13px] text-white/40">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-bold text-white tracking-tight">Settings</h1>
          <p className="text-[13px] text-white/40 mt-0.5">Configure store preferences and policies</p>
        </div>
        <button
          onClick={loadSettings}
          className="w-9 h-9 flex items-center justify-center rounded-xl border border-white/[0.08] bg-[#161616] hover:bg-[#202020] text-white/60 hover:text-white transition-colors"
          title="Reload from database"
        >
          <RefreshCw size={14} />
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        {/* Store Identity */}
        <Section title="Store Identity" icon={<Globe size={16} />}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field label="Store Name">
              <input value={form.store_name} onChange={(e) => set("store_name", e.target.value)} className={inputCls} placeholder="SPECTRA" />
            </Field>
            <Field label="Tagline">
              <input value={form.tagline} onChange={(e) => set("tagline", e.target.value)} className={inputCls} placeholder="See Beyond Limits" />
            </Field>
          </div>
        </Section>

        {/* Contact */}
        <Section title="Contact Information" icon={<Mail size={16} />}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field label="Contact Email">
              <IconInput icon={<Mail size={14} className="text-white/40" />}>
                <input type="email" value={form.contact_email} onChange={(e) => set("contact_email", e.target.value)} className="flex-1 px-3 py-2.5 text-[13px] outline-none text-white bg-transparent placeholder-white/30" placeholder="hello@spectra.in" />
              </IconInput>
            </Field>
            <Field label="Contact Phone">
              <IconInput icon={<Phone size={14} className="text-white/40" />}>
                <input type="tel" value={form.contact_phone} onChange={(e) => set("contact_phone", e.target.value)} className="flex-1 px-3 py-2.5 text-[13px] outline-none text-white bg-transparent placeholder-white/30" placeholder="+91 98765 43210" />
              </IconInput>
            </Field>
          </div>
        </Section>

        {/* Social */}
        <Section title="Social Media" icon={<Link2 size={16} />}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field label="Instagram URL">
              <IconInput icon={<Link2 size={14} className="text-white/40" />}>
                <input type="url" value={form.instagram_url} onChange={(e) => set("instagram_url", e.target.value)} className="flex-1 px-3 py-2.5 text-[13px] outline-none text-white bg-transparent placeholder-white/30" placeholder="https://instagram.com/spectra" />
              </IconInput>
            </Field>
            <Field label="Facebook URL">
              <IconInput icon={<Share2 size={14} className="text-white/40" />}>
                <input type="url" value={form.facebook_url} onChange={(e) => set("facebook_url", e.target.value)} className="flex-1 px-3 py-2.5 text-[13px] outline-none text-white bg-transparent placeholder-white/30" placeholder="https://facebook.com/spectra" />
              </IconInput>
            </Field>
          </div>
        </Section>

        {/* Commerce */}
        <Section title="Commerce Settings" icon={<Globe size={16} />}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <Field label="Currency">
              <select value={form.currency} onChange={(e) => set("currency", e.target.value)} className={selectCls}>
                <option value="INR" className="bg-[#181818] text-white">INR — Indian Rupee (₹)</option>
                <option value="USD" className="bg-[#181818] text-white">USD — US Dollar ($)</option>
                <option value="EUR" className="bg-[#181818] text-white">EUR — Euro (€)</option>
              </select>
            </Field>
            <Field label="Free Shipping Above (₹)">
              <input type="number" min="0" value={form.free_shipping_threshold} onChange={(e) => set("free_shipping_threshold", e.target.value)} className={inputCls} placeholder="0 = always free" />
            </Field>
            <Field label="Return Window (days)">
              <input type="number" min="1" max="365" value={form.return_window_days} onChange={(e) => set("return_window_days", e.target.value)} className={inputCls} placeholder="14" />
            </Field>
          </div>

          {/* Tax toggle */}
          <div className="flex items-center justify-between pt-4 border-t border-white/[0.06] mt-2">
            <div>
              <p className="text-[13px] font-semibold text-white">Prices include tax</p>
              <p className="text-[11px] text-white/40 mt-0.5">Display tax-inclusive prices to customers</p>
            </div>
            <button
              type="button"
              onClick={() => set("tax_included", taxOn ? "false" : "true")}
              className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${taxOn ? "bg-[#c8874a]" : "bg-[#252525]"}`}
            >
              <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-all duration-200 ${taxOn ? "left-[22px]" : "left-0.5"}`} />
            </button>
          </div>
        </Section>

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-[12px] text-red-400">{error}</div>
        )}

        {/* Save */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving || saved}
            className={`inline-flex items-center gap-2 px-6 py-3.5 rounded-xl text-[13px] font-bold transition-all duration-200 shadow-md ${
              saved ? "bg-emerald-600 text-white shadow-emerald-900/30" : "bg-[#c8874a] hover:bg-[#b87840] text-white shadow-[#c8874a]/20"
            } disabled:opacity-70`}
          >
            {saving ? <><Loader2 size={15} className="animate-spin" /> Saving...</> : saved ? <><CheckCircle2 size={15} /> Settings Saved!</> : <><Save size={15} /> Save Settings</>}
          </button>
        </div>
      </form>
    </div>
  );
}

// ── Shared helpers ──────────────────────────────────────────────────────────────
function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-[#111111] rounded-2xl border border-white/[0.07] p-6 space-y-5 shadow-xl shadow-black/40">
      <div className="flex items-center gap-2.5 border-b border-white/[0.06] pb-4">
        <span className="text-[#c8874a]">{icon}</span>
        <h2 className="text-[14px] font-bold text-white">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[12px] font-bold text-white/80 tracking-wide">{label}</label>
      {children}
    </div>
  );
}

function IconInput({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-center rounded-xl border border-white/[0.08] bg-[#161616] focus-within:border-[#c8874a] overflow-hidden transition-colors">
      <span className="px-3.5 py-2.5 bg-[#121212] border-r border-white/[0.08]">{icon}</span>
      {children}
    </div>
  );
}

const inputCls = "w-full px-3.5 py-2.5 rounded-xl border border-white/[0.08] focus:border-[#c8874a] focus:outline-none text-[13px] text-white placeholder-white/30 bg-[#161616] transition-colors";
const selectCls = "w-full px-3.5 py-2.5 rounded-xl border border-white/[0.08] focus:border-[#c8874a] focus:outline-none text-[13px] text-white bg-[#161616] transition-colors cursor-pointer";
