"use client";

import React, { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Loader2, CheckCircle2 } from "lucide-react";
import MultiImageUpload from "@/components/admin/MultiImageUpload";
import { createClient } from "@/lib/supabase/client";
import ProductColorVariantsField from "@/components/admin/ProductColorVariantsField";
import { normalizeProductColorVariants, ProductColorVariant } from "@/lib/productColors";

const categories = ["Men", "Women", "Sunglasses", "Unisex", "Kids"];
const shapes = ["Oval", "Rectangle", "Wayfarer", "Round", "Aviator", "Square", "Cat Eye"];

const DEFAULT_WHATS_IN_THE_BOX = `• 1x SPECTRA Handcrafted Eyewear\n• 1x Signature Matte-Black Hardcase\n• 1x High-Density Microfiber Cleaning Cloth\n• 1x Authenticity & Warranty Card`;

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export default function EditProductPage({ params }: EditProductPageProps) {
  const resolvedParams = use(params);
  const productId = resolvedParams.id;
  const router = useRouter();

  const [loading, setLoading] = useState(true);
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
    whats_in_the_box: DEFAULT_WHATS_IN_THE_BOX,
    is_new: true,
    is_polarized: false,
    is_gift: false,
    is_computer_glasses: false,
    is_accessory: false,
    status: "active" as "active" | "draft",
    image_url: null as string | null,
    gallery_images: [] as string[],
    color_variants: [] as ProductColorVariant[],
  });

  const set = (k: keyof typeof form, v: unknown) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  const autoSlug = (name: string) =>
    name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

  // Load product on mount
  useEffect(() => {
    async function loadProduct() {
      setLoading(true);
      try {
        const supabase = createClient();
        const { data, error: fetchErr } = await supabase
          .from("products")
          .select("*")
          .eq("id", productId)
          .single();

        if (fetchErr || !data) {
          throw new Error(fetchErr?.message || "Product not found");
        }

        let desc = data.description || "";
        let box = DEFAULT_WHATS_IN_THE_BOX;

        if (desc.includes("---WHATS_IN_THE_BOX---")) {
          const parts = desc.split("---WHATS_IN_THE_BOX---");
          desc = parts[0]?.trim() || "";
          box = parts[1]?.trim() || DEFAULT_WHATS_IN_THE_BOX;
        }

        // Also check if a legacy whats_in_the_box column exists on data.
        const productWithBox = data as { whats_in_the_box?: string | null };
        if (productWithBox.whats_in_the_box) {
          box = productWithBox.whats_in_the_box;
        }

        const gallery = Array.isArray(data.images) ? data.images : [];

        setForm({
          name: data.name || "",
          subtitle: data.subtitle || "",
          slug: data.slug || "",
          price: data.price ? String(data.price) : "",
          compare_price: data.compare_price ? String(data.compare_price) : "",
          category:
            categories.find(
              (c) => c.toLowerCase() === (data.category || "").toLowerCase()
            ) || "Men",
          shape:
            shapes.find(
              (s) => s.toLowerCase() === (data.shape || "").toLowerCase()
            ) || "Rectangle",
          description: desc,
          whats_in_the_box: box,
          is_new: Boolean(data.is_new),
          is_polarized: Boolean(data.is_polarized),
          is_gift: Boolean(data.is_gift),
          is_computer_glasses: Boolean(data.is_computer_glasses),
          is_accessory: Boolean(data.is_accessory),
          status: (data.status as "active" | "draft") || "active",
          image_url: data.image_url || null,
          gallery_images: gallery,
          color_variants: normalizeProductColorVariants(data.color_variants),
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load product");
      } finally {
        setLoading(false);
      }
    }

    if (productId) {
      loadProduct();
    }
  }, [productId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.price) {
      setError("Name and price are required.");
      return;
    }
    if (form.color_variants.some((variant) => !variant.name.trim() || !variant.image_url)) {
      setError("Each colour needs a name and a photo before the product can be saved.");
      return;
    }
    const colourNames = form.color_variants.map((variant) => variant.name.trim().toLowerCase());
    if (new Set(colourNames).size !== colourNames.length) {
      setError("Each colour name must be unique for this product.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const supabase = createClient();

      const combinedDescription = form.whats_in_the_box?.trim()
        ? `${form.description.trim()}\n\n---WHATS_IN_THE_BOX---\n${form.whats_in_the_box.trim()}`
        : form.description.trim();

      const { error: dbError } = await supabase
        .from("products")
        .update({
          name: form.name,
          subtitle: form.subtitle,
          slug: form.slug || autoSlug(form.name),
          price: parseFloat(form.price),
          compare_price: form.compare_price ? parseFloat(form.compare_price) : null,
          category: form.category.toLowerCase(),
          shape: form.shape.toLowerCase(),
          description: combinedDescription,
          is_new: form.is_new,
          is_polarized: form.is_polarized,
          is_gift: form.is_gift,
          is_computer_glasses: form.is_computer_glasses,
          is_accessory: form.is_accessory,
          status: form.status,
          image_url: form.image_url,
          images: form.gallery_images,
          color_variants: form.color_variants.map((variant) => ({
            ...variant,
            name: variant.name.trim(),
          })),
          updated_at: new Date().toISOString(),
        })
        .eq("id", productId);

      if (dbError) throw new Error(dbError.message);
      setSaved(true);
      setTimeout(() => router.push("/admin/products"), 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update product");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-24 flex flex-col items-center justify-center gap-3">
        <Loader2 size={24} className="animate-spin text-[#c8874a]" />
        <p className="text-neutral-400 text-sm">Loading product details...</p>
      </div>
    );
  }

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
            Edit Product
          </h1>
          <p className="text-[13px] text-white/40 mt-0.5">
            Modify details, pricing, frame optics, and package contents
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

            <FormField label="Frame Description & Optics">
              <textarea
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                rows={3}
                placeholder="e.g. Masterfully designed with premium lightweight craftsmanship and scratch-resistant optical coating. Tailored for all-day comfort and glare-free clarity."
                className={`${inputCls} resize-none`}
              />
            </FormField>

            <FormField label="What's In The Box (Items listed one per line)">
              <textarea
                value={form.whats_in_the_box}
                onChange={(e) => set("whats_in_the_box", e.target.value)}
                rows={4}
                placeholder={`• 1x SPECTRA Handcrafted Eyewear\n• 1x Signature Matte-Black Hardcase\n• 1x High-Density Microfiber Cleaning Cloth\n• 1x Authenticity & Warranty Card`}
                className={`${inputCls} resize-none font-mono text-[12px]`}
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

          <ProductColorVariantsField
            variants={form.color_variants}
            onChange={(variants) => set("color_variants", variants)}
          />
        </div>

        {/* Right: Image + Status */}
        <div className="space-y-5">
          {/* Product Media & Angles Showcase */}
          <div className="bg-[#111111] rounded-sm border border-white/[0.07] p-6 space-y-4 shadow-xl shadow-black/40">
            <div>
              <h2 className="text-[14px] font-bold text-white">
                Product Gallery & Angles
              </h2>
              <p className="text-[11px] text-white/40 mt-0.5">
                Drop multiple image files at once. First image is the Main Cover; remaining images become gallery angles & card hover.
              </p>
            </div>
            <MultiImageUpload
              primaryImage={form.image_url}
              galleryImages={form.gallery_images}
              onPrimaryChange={(url) => set("image_url", url)}
              onGalleryChange={(urls) => set("gallery_images", urls)}
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

            {/* Computer Glasses toggle */}
            <div className="flex items-center justify-between border-t border-white/[0.06] pt-4">
              <div>
                <p className="text-[13px] font-semibold text-white">
                  Computer Glasses
                </p>
                <p className="text-[11px] text-white/40 mt-0.5">
                  Displays in the Computer Glasses collection
                </p>
              </div>
              <button
                type="button"
                onClick={() => set("is_computer_glasses", !form.is_computer_glasses)}
                aria-label="Show this product in Computer Glasses"
                aria-pressed={form.is_computer_glasses}
                className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none cursor-pointer ${
                  form.is_computer_glasses ? "bg-[#c8874a]" : "bg-[#252525]"
                }`}
              >
                <span
                  className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-all duration-200 ${
                    form.is_computer_glasses ? "left-[22px]" : "left-0.5"
                  }`}
                />
              </button>
            </div>

            {/* Accessories toggle */}
            <div className="flex items-center justify-between border-t border-white/[0.06] pt-4">
              <div>
                <p className="text-[13px] font-semibold text-white">
                  Accessories
                </p>
                <p className="text-[11px] text-white/40 mt-0.5">
                  Displays in the Accessories collection
                </p>
              </div>
              <button
                type="button"
                onClick={() => set("is_accessory", !form.is_accessory)}
                aria-label="Show this product in Accessories"
                aria-pressed={form.is_accessory}
                className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none cursor-pointer ${
                  form.is_accessory ? "bg-[#c8874a]" : "bg-[#252525]"
                }`}
              >
                <span
                  className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-all duration-200 ${
                    form.is_accessory ? "left-[22px]" : "left-0.5"
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
                Updating Product...
              </>
            ) : saved ? (
              <>
                <CheckCircle2 size={15} />
                Changes Saved!
              </>
            ) : (
              <>
                <Save size={15} />
                Save Changes
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
