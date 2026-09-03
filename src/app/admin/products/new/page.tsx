"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Loader2, CheckCircle2 } from "lucide-react";
import ImageUpload from "@/components/admin/ImageUpload";

const categories = ["Men", "Women", "Sunglasses", "Unisex", "Kids"];
const shapes = ["Oval", "Rectangle", "Wayfarer", "Round", "Aviator", "Square", "Cat Eye"];

export default function NewProductPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    subtitle: "",
    slug: "",
    price: "",
    compare_price: "",
    category: "Men",
    shape: "Rectangle",
    description: "",
    is_new: true,
    is_polarized: false,
    is_gift: false,
    status: "active" as "active" | "draft",
    image_url: null as string | null,
    secondary_image_url: null as string | null,
  });

  const set = (k: keyof typeof form, v: unknown) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  const autoSlug = (name: string) =>
    name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.price) {
      setError("Name and price are required.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const { error: dbError } = await supabase.from("products").insert([
        {
          name: form.name,
          subtitle: form.subtitle,
          slug: form.slug || autoSlug(form.name),
          price: parseFloat(form.price),
          compare_price: form.compare_price ? parseFloat(form.compare_price) : null,
          category: form.category.toLowerCase(),
          shape: form.shape.toLowerCase(),
          description: form.description,
          is_new: form.is_new,
          is_polarized: form.is_polarized,
          is_gift: form.is_gift,
          status: form.status,
          image_url: form.image_url,
          images: form.secondary_image_url ? [form.secondary_image_url] : [],
        },
      ]);
      if (dbError) throw new Error(dbError.message);
      setSaved(true);
      setTimeout(() => router.push("/admin/products"), 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save product");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/products"
          className="w-10 h-10 rounded-sm bg-[#141414] border border-white/[0.08] flex items-center justify-center hover:bg-[#1a1a1a] hover:border-[#c8874a]/40 transition-colors text-white/70 hover:text-white"
        >
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 className="text-[22px] font-bold text-white tracking-tight">
            Add New Product
          </h1>
          <p className="text-[13px] text-white/40 mt-0.5">
            Create and publish a new sunglass listing
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Main fields */}
        <div className="lg:col-span-2 space-y-5">
          {/* Basic Info Card */}
          <div className="bg-[#111111] rounded-sm border border-white/[0.07] p-6 space-y-5 shadow-xl shadow-black/40">
            <h2 className="text-[14px] font-bold text-white border-b border-white/[0.06] pb-4">
              Product Information
            </h2>

            <FormField label="Product Name" required>
              <input
                type="text"
                value={form.name}
                onChange={(e) => {
                  set("name", e.target.value);
                  if (!form.slug) set("slug", autoSlug(e.target.value));
                }}
                placeholder="e.g. Charon I"
                className={inputCls}
                required
              />
            </FormField>

            <FormField label="Subtitle / Style">
              <input
                type="text"
                value={form.subtitle}
                onChange={(e) => set("subtitle", e.target.value)}
                placeholder="e.g. Black Rectangle"
                className={inputCls}
              />
            </FormField>

            <FormField label="URL Slug">
              <div className="flex items-center rounded-sm border border-white/[0.08] bg-[#161616] focus-within:border-[#c8874a] overflow-hidden transition-colors">
                <span className="px-3.5 text-[12px] text-white/40 bg-[#121212] border-r border-white/[0.08] py-2.5 select-none">
                  /products/
                </span>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => set("slug", e.target.value)}
                  placeholder="charon-i"
                  className="flex-1 px-3.5 py-2.5 text-[13px] outline-none text-white bg-transparent placeholder-white/30"
                />
              </div>
            </FormField>

            <FormField label="Description">
              <textarea
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                rows={4}
                placeholder="Write a compelling product description..."
                className={`${inputCls} resize-none`}
              />
            </FormField>
          </div>

          {/* Pricing Card */}
          <div className="bg-[#111111] rounded-sm border border-white/[0.07] p-6 space-y-5 shadow-xl shadow-black/40">
            <h2 className="text-[14px] font-bold text-white border-b border-white/[0.06] pb-4">
              Pricing
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Selling Price (₹)" required>
                <div className="flex items-center rounded-sm border border-white/[0.08] bg-[#161616] focus-within:border-[#c8874a] overflow-hidden transition-colors">
                  <span className="px-3.5 py-2.5 text-[13px] text-[#c8874a] bg-[#121212] border-r border-white/[0.08] font-bold">
                    ₹
                  </span>
                  <input
                    type="number"
                    value={form.price}
                    onChange={(e) => set("price", e.target.value)}
                    placeholder="1299"
                    className="flex-1 px-3.5 py-2.5 text-[13px] outline-none text-white bg-transparent placeholder-white/30"
                    min="0"
                    step="1"
                    required
                  />
                </div>
              </FormField>
              <FormField label="Compare Price (₹)">
                <div className="flex items-center rounded-sm border border-white/[0.08] bg-[#161616] focus-within:border-[#c8874a] overflow-hidden transition-colors">
                  <span className="px-3.5 py-2.5 text-[13px] text-white/40 bg-[#121212] border-r border-white/[0.08]">
                    ₹
                  </span>
                  <input
                    type="number"
                    value={form.compare_price}
                    onChange={(e) => set("compare_price", e.target.value)}
                    placeholder="1999"
                    className="flex-1 px-3.5 py-2.5 text-[13px] outline-none text-white bg-transparent placeholder-white/30"
                    min="0"
                    step="1"
                  />
                </div>
              </FormField>
            </div>
          </div>

          {/* Organisation Card */}
          <div className="bg-[#111111] rounded-sm border border-white/[0.07] p-6 space-y-5 shadow-xl shadow-black/40">
            <h2 className="text-[14px] font-bold text-white border-b border-white/[0.06] pb-4">
              Organisation
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Category">
                <select
                  value={form.category}
                  onChange={(e) => set("category", e.target.value)}
                  className={selectCls}
                >
                  {categories.map((c) => (
                    <option key={c} value={c} className="bg-[#181818] text-white">
                      {c}
                    </option>
                  ))}
                </select>
              </FormField>
              <FormField label="Shape">
                <select
                  value={form.shape}
                  onChange={(e) => set("shape", e.target.value)}
                  className={selectCls}
                >
                  {shapes.map((s) => (
                    <option key={s} value={s} className="bg-[#181818] text-white">
                      {s}
                    </option>
                  ))}
                </select>
              </FormField>
            </div>
          </div>
        </div>

        {/* Right: Image + Status */}
        <div className="space-y-5">
          {/* Product Image */}
          <div className="bg-[#111111] rounded-sm border border-white/[0.07] p-6 space-y-4 shadow-xl shadow-black/40">
            <h2 className="text-[14px] font-bold text-white border-b border-white/[0.06] pb-4">
              Product Image
            </h2>
            <ImageUpload
              value={form.image_url}
              onChange={(url) => set("image_url", url)}
              onRemove={() => set("image_url", null)}
              label="Upload Primary Product Image"
              folder="spectra/products"
            />
          </div>

          {/* Secondary Hover Image */}
          <div className="bg-[#111111] rounded-sm border border-white/[0.07] p-6 space-y-3 shadow-xl shadow-black/40">
            <div>
              <h2 className="text-[14px] font-bold text-white">
                Hover Image (Alternate Angle)
              </h2>
              <p className="text-[11px] text-white/40 mt-0.5">
                Smoothly transitions when hovering over product card (side angle, folded, or on-model)
              </p>
            </div>
            <ImageUpload
              value={form.secondary_image_url}
              onChange={(url) => set("secondary_image_url", url)}
              onRemove={() => set("secondary_image_url", null)}
              label="Upload Hover / Alternate Image"
              folder="spectra/products"
            />
          </div>

          {/* Status & Flags */}
          <div className="bg-[#111111] rounded-sm border border-white/[0.07] p-6 space-y-5 shadow-xl shadow-black/40">
            <h2 className="text-[14px] font-bold text-white border-b border-white/[0.06] pb-4">
              Status & Flags
            </h2>

            <FormField label="Visibility">
              <div className="flex items-center gap-1 bg-[#161616] p-1 rounded-sm border border-white/[0.06]">
                {(["active", "draft"] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => set("status", s)}
                    className={`flex-1 py-2 text-[11px] font-bold rounded-sm capitalize transition-all ${
                      form.status === s
                        ? "bg-[#c8874a] text-white shadow-sm"
                        : "text-white/40 hover:text-white"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </FormField>

            {/* New badge toggle */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[13px] font-semibold text-white">
                  Mark as New
                </p>
                <p className="text-[11px] text-white/40 mt-0.5">
                  Shows &quot;NEW&quot; badge on card
                </p>
              </div>
              <button
                type="button"
                onClick={() => set("is_new", !form.is_new)}
                className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none cursor-pointer ${
                  form.is_new ? "bg-[#c8874a]" : "bg-[#252525]"
                }`}
              >
                <span
                  className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-all duration-200 ${
                    form.is_new ? "left-[22px]" : "left-0.5"
                  }`}
                />
              </button>
            </div>

            {/* Polarized toggle */}
            <div className="flex items-center justify-between border-t border-white/[0.06] pt-4">
              <div>
                <p className="text-[13px] font-semibold text-white">
                  Polarized Lens
                </p>
                <p className="text-[11px] text-white/40 mt-0.5">
                  Displays in Polarized Optics collection
                </p>
              </div>
              <button
                type="button"
                onClick={() => set("is_polarized", !form.is_polarized)}
                className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none cursor-pointer ${
                  form.is_polarized ? "bg-[#c8874a]" : "bg-[#252525]"
                }`}
              >
                <span
                  className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-all duration-200 ${
                    form.is_polarized ? "left-[22px]" : "left-0.5"
                  }`}
                />
              </button>
            </div>

            {/* Gift Recommended toggle */}
            <div className="flex items-center justify-between border-t border-white/[0.06] pt-4">
              <div>
                <p className="text-[13px] font-semibold text-white">
                  Featured for Gifting
                </p>
                <p className="text-[11px] text-white/40 mt-0.5">
                  Displays in Luxury Gifts collection
                </p>
              </div>
              <button
                type="button"
                onClick={() => set("is_gift", !form.is_gift)}
                className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none cursor-pointer ${
                  form.is_gift ? "bg-[#c8874a]" : "bg-[#252525]"
                }`}
              >
                <span
                  className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-all duration-200 ${
                    form.is_gift ? "left-[22px]" : "left-0.5"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-sm px-4 py-3 text-[12px] text-red-400 font-medium">
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={saving || saved}
            className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-sm text-[13px] font-bold transition-all duration-200 shadow-lg ${
              saved
                ? "bg-emerald-600 text-white shadow-emerald-900/30"
                : "bg-[#c8874a] hover:bg-[#b87840] text-white shadow-[#c8874a]/20"
            } disabled:opacity-70`}
          >
            {saving ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Saving Product...
              </>
            ) : saved ? (
              <>
                <CheckCircle2 size={15} />
                Product Saved!
              </>
            ) : (
              <>
                <Save size={15} />
                Save & Publish
              </>
            )}
          </button>

          <Link
            href="/admin/products"
            className="w-full flex items-center justify-center py-2.5 rounded-sm text-[12px] font-semibold text-white/40 hover:text-white hover:bg-white/[0.04] transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function FormField({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[12px] font-bold text-white/80 tracking-wide">
        {label}
        {required && <span className="text-[#c8874a] ml-1">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls =
  "w-full px-3.5 py-2.5 rounded-sm border border-white/[0.08] focus:border-[#c8874a] focus:outline-none text-[13px] text-white placeholder-white/30 bg-[#161616] transition-colors";

const selectCls =
  "w-full px-3.5 py-2.5 rounded-sm border border-white/[0.08] focus:border-[#c8874a] focus:outline-none text-[13px] text-white bg-[#161616] transition-colors cursor-pointer";
