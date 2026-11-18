"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  DEFAULT_ELIGIBLE_ITEMS,
  DEFAULT_NOT_ELIGIBLE_ITEMS,
  ReturnProcessStep,
  getDefaultReturnSteps,
  getStep2ForShippingType,
  getStep4ForPolicyType,
  parseReturnList,
  parseReturnSteps,
} from "@/lib/returnPolicy";
import {
  Save,
  Loader2,
  CheckCircle2,
  Globe,
  Mail,
  Phone,
  Link2,
  Share2,
  RefreshCw,
  MessageCircle,
  Plus,
  Trash2,
  AlertCircle,
  RotateCcw,
} from "lucide-react";

interface SettingsForm {
  store_name: string;
  tagline: string;
  contact_email: string;
  contact_phone: string;
  whatsapp_url: string;
  instagram_url: string;
  facebook_url: string;
  currency: string;
  free_shipping_threshold: string;
  return_window_days: string;
  return_policy_enabled: string;
  return_policy_type: string;
  return_shipping_type: string;
  return_policy_tagline: string;
  return_policy_conditions: string;
  return_process_steps: string;
  return_eligible_items: string;
  return_not_eligible_items: string;
  tax_included: string;
  cod_advance_enabled: string;
  cod_advance_amount: string;
}

const defaults: SettingsForm = {
  store_name: "SPECTRA",
  tagline: "See Beyond Limits",
  contact_email: "spectrasunglass@gmail.com",
  contact_phone: "+91 81299 50341",
  whatsapp_url: "https://wa.me/c/918129950341",
  instagram_url: "https://instagram.com",
  facebook_url: "https://facebook.com",
  currency: "INR",
  free_shipping_threshold: "0",
  return_window_days: "14",
  return_policy_enabled: "true",
  return_policy_type: "exchange_and_refund",
  return_shipping_type: "complimentary_pickup",
  return_policy_tagline: "Effortless home exchange & returns",
  return_policy_conditions:
    "Items must be in unworn, brand-new condition with all tags, luxury hard case, warranty card, and microfiber cloth included.",
  return_process_steps: "",
  return_eligible_items: "",
  return_not_eligible_items: "",
  tax_included: "true",
  cod_advance_enabled: "false",
  cod_advance_amount: "199",
};

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<SettingsForm>(defaults);

  // Structured editors for Return Policy lists & steps
  const [processSteps, setProcessSteps] = useState<ReturnProcessStep[]>(() =>
    getDefaultReturnSteps(defaults.return_shipping_type, defaults.return_policy_type)
  );
  const [eligibleItems, setEligibleItems] = useState<string[]>(DEFAULT_ELIGIBLE_ITEMS);
  const [notEligibleItems, setNotEligibleItems] = useState<string[]>(DEFAULT_NOT_ELIGIBLE_ITEMS);

  const set = (k: keyof SettingsForm, v: string) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  const loadSettings = async () => {
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("settings")
      .select("key, value")
      .in("key", Object.keys(defaults));

    let merged: SettingsForm = { ...defaults };
    if (data && data.length > 0) {
      const loaded: Partial<SettingsForm> = {};
      data.forEach((row) => {
        if (row.key in defaults) {
          (loaded as Record<string, string>)[row.key] = row.value ?? "";
        }
      });
      merged = { ...defaults, ...loaded };
    }

    setForm(merged);
    setProcessSteps(
      parseReturnSteps(
        merged.return_process_steps,
        merged.return_shipping_type,
        merged.return_policy_type
      )
    );
    setEligibleItems(
      parseReturnList(merged.return_eligible_items, DEFAULT_ELIGIBLE_ITEMS)
    );
    setNotEligibleItems(
      parseReturnList(merged.return_not_eligible_items, DEFAULT_NOT_ELIGIBLE_ITEMS)
    );
    setLoading(false);
  };

  useEffect(() => { loadSettings(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-sync Step 02 when Reverse Courier Pickup dropdown changes
  const handleShippingTypeChange = (newShippingType: string) => {
    set("return_shipping_type", newShippingType);
    setProcessSteps((prev) => {
      if (prev.length >= 2) {
        const next = [...prev];
        next[1] = getStep2ForShippingType(newShippingType);
        return next;
      }
      return prev;
    });
  };

  // Auto-sync Step 04 when Resolution Type dropdown changes
  const handlePolicyTypeChange = (newPolicyType: string) => {
    set("return_policy_type", newPolicyType);
    setProcessSteps((prev) => {
      if (prev.length >= 4) {
        const next = [...prev];
        next[3] = getStep4ForPolicyType(newPolicyType);
        return next;
      }
      return prev;
    });
  };

  const handleStepChange = (index: number, field: keyof ReturnProcessStep, value: string) => {
    setProcessSteps((prev) =>
      prev.map((step, i) => (i === index ? { ...step, [field]: value } : step))
    );
  };

  const handleAddStep = () => {
    setProcessSteps((prev) => [...prev, { title: "", desc: "" }]);
  };

  const handleRemoveStep = (index: number) => {
    setProcessSteps((prev) => prev.filter((_, i) => i !== index));
  };

  const handleResetSteps = () => {
    setProcessSteps(
      getDefaultReturnSteps(form.return_shipping_type, form.return_policy_type)
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const supabase = createClient();

      const cleanedSteps = processSteps
        .map((s) => ({ title: s.title.trim(), desc: s.desc.trim() }))
        .filter((s) => s.title || s.desc);

      const cleanedEligible = eligibleItems.map((item) => item.trim()).filter(Boolean);
      const cleanedNotEligible = notEligibleItems.map((item) => item.trim()).filter(Boolean);

      const payloadForm: SettingsForm = {
        ...form,
        return_process_steps: JSON.stringify(cleanedSteps),
        return_eligible_items: JSON.stringify(cleanedEligible),
        return_not_eligible_items: JSON.stringify(cleanedNotEligible),
      };

      const entries = Object.entries(payloadForm).map(([key, value]) => ({
        key,
        value: String(value),
      }));

      const { error: dbError } = await supabase
        .from("settings")
        .upsert(entries, { onConflict: "key" });

      if (dbError) throw new Error(dbError.message);

      setForm(payloadForm);
      setProcessSteps(
        cleanedSteps.length > 0
          ? cleanedSteps
          : getDefaultReturnSteps(form.return_shipping_type, form.return_policy_type)
      );
      setEligibleItems(
        cleanedEligible.length > 0 ? cleanedEligible : DEFAULT_ELIGIBLE_ITEMS
      );
      setNotEligibleItems(
        cleanedNotEligible.length > 0 ? cleanedNotEligible : DEFAULT_NOT_ELIGIBLE_ITEMS
      );

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
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-bold text-white tracking-tight">Settings</h1>
          <p className="text-[13px] text-white/40 mt-0.5">Configure store preferences and policies</p>
        </div>
        <button
          onClick={loadSettings}
          className="w-9 h-9 flex items-center justify-center rounded-sm border border-white/[0.08] bg-[#161616] hover:bg-[#202020] text-white/60 hover:text-white transition-colors"
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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <Field label="Contact Email">
              <IconInput icon={<Mail size={14} className="text-white/40" />}>
                <input type="email" value={form.contact_email} onChange={(e) => set("contact_email", e.target.value)} className="flex-1 px-3 py-2.5 text-[13px] outline-none text-white bg-transparent placeholder-white/30" placeholder="spectrasunglass@gmail.com" />
              </IconInput>
            </Field>
            <Field label="Contact Phone">
              <IconInput icon={<Phone size={14} className="text-white/40" />}>
                <input type="tel" value={form.contact_phone} onChange={(e) => set("contact_phone", e.target.value)} className="flex-1 px-3 py-2.5 text-[13px] outline-none text-white bg-transparent placeholder-white/30" placeholder="+91 81299 50341" />
              </IconInput>
            </Field>
            <Field label="WhatsApp URL / Number">
              <IconInput icon={<MessageCircle size={14} className="text-emerald-400" />}>
                <input type="url" value={form.whatsapp_url} onChange={(e) => set("whatsapp_url", e.target.value)} className="flex-1 px-3 py-2.5 text-[13px] outline-none text-white bg-transparent placeholder-white/30" placeholder="https://wa.me/c/918129950341" />
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
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

          {/* COD Advance Payment */}
          <div className="pt-4 border-t border-white/[0.06] mt-2 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[13px] font-semibold text-white">COD Advance Payment</p>
                <p className="text-[11px] text-white/40 mt-0.5">Require an advance deposit for Cash on Delivery orders</p>
              </div>
              <button
                type="button"
                onClick={() => set("cod_advance_enabled", form.cod_advance_enabled === "true" ? "false" : "true")}
                className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${form.cod_advance_enabled === "true" ? "bg-[#c8874a]" : "bg-[#252525]"}`}
              >
                <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-all duration-200 ${form.cod_advance_enabled === "true" ? "left-[22px]" : "left-0.5"}`} />
              </button>
            </div>

            {form.cod_advance_enabled === "true" && (
              <div className="pt-2">
                <Field label="COD Advance Amount (₹)">
                  <input
                    type="number"
                    min="1"
                    value={form.cod_advance_amount}
                    onChange={(e) => set("cod_advance_amount", e.target.value)}
                    className={inputCls}
                    placeholder="199"
                  />
                </Field>
              </div>
            )}
          </div>
        </Section>

        {/* Return & Exchange Policy */}
        <Section title="Return & Exchange Policy" icon={<RefreshCw size={16} />}>
          <div className="space-y-6">
            {/* Returns Enabled Toggle */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[13px] font-semibold text-white">Enable Returns & Exchanges</p>
                <p className="text-[11px] text-white/40 mt-0.5">Show return guarantee badges across the store, product pages, and footer</p>
              </div>
              <button
                type="button"
                onClick={() => set("return_policy_enabled", form.return_policy_enabled === "true" ? "false" : "true")}
                className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${form.return_policy_enabled === "true" ? "bg-[#c8874a]" : "bg-[#252525]"}`}
              >
                <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-all duration-200 ${form.return_policy_enabled === "true" ? "left-[22px]" : "left-0.5"}`} />
              </button>
            </div>

            {form.return_policy_enabled === "true" ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-3 border-t border-white/[0.06]">
                  <Field label="Return Window (Days)">
                    <input
                      type="number"
                      min="1"
                      max="90"
                      value={form.return_window_days}
                      onChange={(e) => set("return_window_days", e.target.value)}
                      className={inputCls}
                      placeholder="14"
                    />
                    <p className="text-[10.5px] text-white/30 mt-1">Days from delivery allowed for exchange or return</p>
                  </Field>

                  <Field label="Resolution Type">
                    <select
                      value={form.return_policy_type}
                      onChange={(e) => handlePolicyTypeChange(e.target.value)}
                      className={selectCls}
                    >
                      <option value="exchange_and_refund" className="bg-[#181818] text-white">Exchange & Full Refund</option>
                      <option value="exchange_or_credit" className="bg-[#181818] text-white">Exchange or Store Credit</option>
                      <option value="exchange_only" className="bg-[#181818] text-white">Exchange Only (No Cash Refund)</option>
                      <option value="replacement_only" className="bg-[#181818] text-white">Defective Replacement Only</option>
                    </select>
                    <p className="text-[10.5px] text-white/30 mt-1">Resolution offered to customers (auto-updates Step 04)</p>
                  </Field>

                  <Field label="Reverse Courier Pickup">
                    <select
                      value={form.return_shipping_type}
                      onChange={(e) => handleShippingTypeChange(e.target.value)}
                      className={selectCls}
                    >
                      <option value="complimentary_pickup" className="bg-[#181818] text-white">Complimentary Doorstep Pickup</option>
                      <option value="customer_borne" className="bg-[#181818] text-white">Customer Borne / Self-Ship</option>
                    </select>
                    <p className="text-[10.5px] text-white/30 mt-1">Shipping responsibility (auto-updates Step 02)</p>
                  </Field>
                </div>

                <div className="pt-1">
                  <Field label="Storefront Tagline / Headline">
                    <input
                      type="text"
                      value={form.return_policy_tagline}
                      onChange={(e) => set("return_policy_tagline", e.target.value)}
                      className={inputCls}
                      placeholder="Effortless home exchange & returns"
                    />
                    <p className="text-[10.5px] text-white/30 mt-1">Appears on product detail page badge and the returns policy header</p>
                  </Field>
                </div>

                {/* ── EDITABLE HOW THE RETURN PROCESS WORKS (4 STEPS) ── */}
                <div className="pt-5 border-t border-white/[0.06] space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-[12.5px] font-bold text-white uppercase tracking-wider">
                        How The Return Process Works (Steps)
                      </p>
                      <p className="text-[11px] text-white/40 mt-0.5">
                        Fully editable steps shown on the /returns page. Changing pickup or resolution above auto-updates Step 02 &amp; Step 04.
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleResetSteps}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-sm text-[11px] font-semibold text-white/60 hover:text-white bg-[#181818] border border-white/[0.08] hover:border-white/[0.2] transition-colors cursor-pointer"
                        title="Reset steps based on selected dropdowns"
                      >
                        <RotateCcw size={12} /> Reset Defaults
                      </button>
                      <button
                        type="button"
                        onClick={handleAddStep}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-sm text-[11px] font-bold text-[#c8874a] bg-[#c8874a]/10 border border-[#c8874a]/30 hover:bg-[#c8874a] hover:text-white transition-colors cursor-pointer"
                      >
                        <Plus size={12} /> Add Step
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {processSteps.map((step, idx) => (
                      <div
                        key={idx}
                        className="bg-[#161616] border border-white/[0.07] rounded-sm p-3.5 space-y-2.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[12px] font-bold text-[#c8874a]">
                            STEP {String(idx + 1).padStart(2, "0")}
                          </span>
                          {processSteps.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveStep(idx)}
                              className="p-1 text-white/30 hover:text-red-400 transition-colors cursor-pointer"
                              title="Remove step"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                        <input
                          type="text"
                          value={step.title}
                          onChange={(e) => handleStepChange(idx, "title", e.target.value)}
                          placeholder="Step title (e.g. Self-Ship Return Parcel)"
                          className="w-full px-3 py-2 rounded-sm border border-white/[0.08] focus:border-[#c8874a] focus:outline-none text-[12.5px] font-semibold text-white placeholder-white/30 bg-[#111111]"
                        />
                        <textarea
                          rows={3}
                          value={step.desc}
                          onChange={(e) => handleStepChange(idx, "desc", e.target.value)}
                          placeholder="Step description..."
                          className="w-full px-3 py-2 rounded-sm border border-white/[0.08] focus:border-[#c8874a] focus:outline-none text-[12px] text-neutral-300 placeholder-white/30 bg-[#111111] resize-none"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* ── EDITABLE ELIGIBLE & NOT ELIGIBLE CRITERIA ── */}
                <div className="pt-5 border-t border-white/[0.06] space-y-3">
                  <div>
                    <p className="text-[12.5px] font-bold text-white uppercase tracking-wider">
                      Return Eligibility Criteria Lists
                    </p>
                    <p className="text-[11px] text-white/40 mt-0.5">
                      Customize the bullet points for Eligible and Not Eligible cards. Use{" "}
                      <code className="text-[#c8874a] bg-white/[0.06] px-1 py-0.5 rounded">{`{days}`}</code>{" "}
                      to automatically insert your Return Window ({form.return_window_days || "14"} days).
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Eligible List Editor */}
                    <div className="bg-[#161616] border border-emerald-500/20 rounded-sm p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-emerald-400">
                          <CheckCircle2 size={15} />
                          <span className="text-[11.5px] font-bold uppercase tracking-wider">
                            Eligible For Return / Exchange
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setEligibleItems((prev) => [...prev, ""])}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-sm text-[10.5px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 hover:bg-emerald-500 hover:text-black transition-colors cursor-pointer"
                        >
                          <Plus size={11} /> Add
                        </button>
                      </div>

                      <div className="space-y-2">
                        {eligibleItems.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <span className="text-emerald-400 text-xs">•</span>
                            <input
                              type="text"
                              value={item}
                              onChange={(e) =>
                                setEligibleItems((prev) =>
                                  prev.map((v, i) => (i === idx ? e.target.value : v))
                                )
                              }
                              placeholder="Enter eligibility condition..."
                              className="flex-1 px-2.5 py-1.5 rounded-sm border border-white/[0.08] focus:border-emerald-400/60 focus:outline-none text-[12px] text-white placeholder-white/25 bg-[#111111]"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setEligibleItems((prev) => prev.filter((_, i) => i !== idx))
                              }
                              className="p-1 text-white/30 hover:text-red-400 transition-colors cursor-pointer"
                              title="Remove point"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Not Eligible List Editor */}
                    <div className="bg-[#161616] border border-amber-500/20 rounded-sm p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-amber-400">
                          <AlertCircle size={15} />
                          <span className="text-[11.5px] font-bold uppercase tracking-wider">
                            Not Eligible For Return
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setNotEligibleItems((prev) => [...prev, ""])}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-sm text-[10.5px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/25 hover:bg-amber-500 hover:text-black transition-colors cursor-pointer"
                        >
                          <Plus size={11} /> Add
                        </button>
                      </div>

                      <div className="space-y-2">
                        {notEligibleItems.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <span className="text-amber-400 text-xs">•</span>
                            <input
                              type="text"
                              value={item}
                              onChange={(e) =>
                                setNotEligibleItems((prev) =>
                                  prev.map((v, i) => (i === idx ? e.target.value : v))
                                )
                              }
                              placeholder="Enter non-eligible condition..."
                              className="flex-1 px-2.5 py-1.5 rounded-sm border border-white/[0.08] focus:border-amber-400/60 focus:outline-none text-[12px] text-white placeholder-white/25 bg-[#111111]"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setNotEligibleItems((prev) => prev.filter((_, i) => i !== idx))
                              }
                              className="p-1 text-white/30 hover:text-red-400 transition-colors cursor-pointer"
                              title="Remove point"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Specific Terms & Conditions */}
                <div className="pt-2">
                  <Field label="Specific Terms & Conditions (Additional Notes)">
                    <textarea
                      rows={3}
                      value={form.return_policy_conditions}
                      onChange={(e) => set("return_policy_conditions", e.target.value)}
                      className="w-full bg-[#161616] border border-white/[0.08] rounded-sm px-3.5 py-2.5 text-[13px] text-white placeholder-white/30 outline-none focus:border-[#c8874a] transition-colors resize-none"
                      placeholder="List any additional return guidelines or studio return address instructions..."
                    />
                    <p className="text-[10.5px] text-white/30 mt-1">Shown in the &quot;Specific Terms &amp; Conditions&quot; box on the customer-facing /returns page</p>
                  </Field>
                </div>

                {/* Live Storefront Preview */}
                <div className="p-4 rounded-sm bg-[#161616]/80 border border-white/[0.06] space-y-2">
                  <p className="text-[10.5px] font-bold uppercase tracking-wider text-[#c8874a]">Live Storefront Display Preview</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[12px] text-neutral-300">
                    <div className="bg-[#111111] p-3 rounded-sm border border-white/[0.04]">
                      <span className="text-white/40 block text-[10.5px] uppercase tracking-wider mb-1">Store Benefits Bar</span>
                      <span className="font-semibold text-white">EASY RETURNS — {form.return_window_days || "14"} days return</span>
                    </div>
                    <div className="bg-[#111111] p-3 rounded-sm border border-white/[0.04]">
                      <span className="text-white/40 block text-[10.5px] uppercase tracking-wider mb-1">Product Detail Badge</span>
                      <span className="font-semibold text-white">{form.return_window_days || "14"}-day {form.return_policy_tagline || "effortless home exchange & returns"}</span>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="p-4 rounded-sm bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[12px]">
                Returns & exchanges are disabled. Storefront will display &quot;Quality Inspected / Replacement Guarantee&quot;.
              </div>
            )}
          </div>
        </Section>

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-sm px-4 py-3 text-[12px] text-red-400">{error}</div>
        )}

        {/* Save */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving || saved}
            className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-sm text-[13px] font-bold transition-all duration-200 shadow-md ${
              saved ? "bg-emerald-600 text-white shadow-emerald-900/30" : "bg-[#c8874a] hover:bg-[#b87840] text-white shadow-[#c8874a]/20 cursor-pointer"
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
    <div className="bg-[#111111] rounded-sm border border-white/[0.07] p-6 space-y-5 shadow-xl shadow-black/40">
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
    <div className="flex items-center rounded-sm border border-white/[0.08] bg-[#161616] focus-within:border-[#c8874a] overflow-hidden transition-colors">
      <span className="px-3.5 py-2.5 bg-[#121212] border-r border-white/[0.08]">{icon}</span>
      {children}
    </div>
  );
}

const inputCls = "w-full px-3.5 py-2.5 rounded-sm border border-white/[0.08] focus:border-[#c8874a] focus:outline-none text-[13px] text-white placeholder-white/30 bg-[#161616] transition-colors";
const selectCls = "w-full px-3.5 py-2.5 rounded-sm border border-white/[0.08] focus:border-[#c8874a] focus:outline-none text-[13px] text-white bg-[#161616] transition-colors cursor-pointer";
