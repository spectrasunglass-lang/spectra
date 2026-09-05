"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ImagePlus, Loader2, Plus, Trash2, X } from "lucide-react";
import { createProductColorVariant, ProductColorVariant } from "@/lib/productColors";

interface ProductColorVariantsFieldProps {
  variants: ProductColorVariant[];
  onChange: (variants: ProductColorVariant[]) => void;
}

export default function ProductColorVariantsField({
  variants,
  onChange,
}: ProductColorVariantsFieldProps) {
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const enabled = variants.length > 0;

  const updateVariant = (id: string, changes: Partial<ProductColorVariant>) => {
    onChange(variants.map((variant) => (variant.id === id ? { ...variant, ...changes } : variant)));
  };

  const uploadImage = async (variantId: string, file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }

    setUploadingId(variantId);
    setError(null);

    try {
      const form = new FormData();
      form.append("file", file);
      form.append("folder", "spectra/products/colours");

      const response = await fetch("/api/admin/upload", { method: "POST", body: form });
      const data = await response.json();

      if (!response.ok || !data.url) {
        throw new Error(data.error || "Colour image upload failed");
      }

      updateVariant(variantId, { image_url: data.url });
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Colour image upload failed");
    } finally {
      setUploadingId(null);
    }
  };

  return (
    <div className="bg-[#111111] rounded-sm border border-white/[0.07] p-6 space-y-4 shadow-xl shadow-black/40">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-[14px] font-bold text-white">Product Colours</h2>
          <p className="text-[11px] text-white/40 mt-0.5">
            Give each colour its own photo. Customers select a colour before adding this product to their cart.
          </p>
        </div>
        <button
          type="button"
          onClick={() => onChange(enabled ? [] : [createProductColorVariant()])}
          aria-label="Enable colour variants for this product"
          aria-pressed={enabled}
          className={`relative mt-1 w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none cursor-pointer flex-shrink-0 ${
            enabled ? "bg-[#c8874a]" : "bg-[#252525]"
          }`}
        >
          <span
            className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-all duration-200 ${
              enabled ? "left-[22px]" : "left-0.5"
            }`}
          />
        </button>
      </div>

      {enabled && (
        <div className="border-t border-white/[0.06] pt-4 space-y-3">
          {variants.map((variant, index) => (
            <div key={variant.id} className="rounded-sm border border-white/[0.08] bg-[#161616] p-3 sm:p-4">
              <div className="flex items-start gap-3">
                <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-sm border border-white/[0.08] bg-[#f5f0eb]">
                  {variant.image_url ? (
                    <Image
                      src={variant.image_url}
                      alt={variant.name || `Colour ${index + 1}`}
                      fill
                      className="object-contain p-1"
                      sizes="80px"
                    />
                  ) : (
                    <ImagePlus className="absolute inset-0 m-auto text-neutral-400" size={20} />
                  )}
                </div>

                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-white/45" htmlFor={`colour-name-${variant.id}`}>
                      Colour {index + 1}
                    </label>
                    <button
                      type="button"
                      onClick={() => onChange(variants.filter((item) => item.id !== variant.id))}
                      className="rounded p-1 text-white/35 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                      aria-label={`Remove colour ${variant.name || index + 1}`}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <input
                    id={`colour-name-${variant.id}`}
                    type="text"
                    value={variant.name}
                    onChange={(event) => updateVariant(variant.id, { name: event.target.value })}
                    placeholder="e.g. Matte Black"
                    className="w-full rounded-sm border border-white/[0.08] bg-[#111111] px-3 py-2 text-[12px] text-white outline-none transition-colors placeholder:text-white/25 focus:border-[#c8874a]"
                  />

                  <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-sm border border-white/[0.1] bg-[#111111] px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wide text-white/65 transition-colors hover:border-[#c8874a]/60 hover:text-white">
                    {uploadingId === variant.id ? <Loader2 size={12} className="animate-spin text-[#c8874a]" /> : <ImagePlus size={12} className="text-[#c8874a]" />}
                    {uploadingId === variant.id ? "Uploading" : variant.image_url ? "Replace photo" : "Upload photo"}
                    <input
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      disabled={uploadingId !== null}
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (file) uploadImage(variant.id, file);
                        event.target.value = "";
                      }}
                    />
                  </label>
                </div>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={() => onChange([...variants, createProductColorVariant()])}
            className="flex w-full items-center justify-center gap-1.5 rounded-sm border border-dashed border-white/[0.14] px-3 py-2.5 text-[11px] font-bold uppercase tracking-wider text-white/55 transition-colors hover:border-[#c8874a]/60 hover:text-[#c8874a]"
          >
            <Plus size={14} /> Add another colour
          </button>
        </div>
      )}

      {error && (
        <p className="flex items-center gap-1.5 rounded-sm border border-red-500/20 bg-red-500/10 px-3 py-2 text-[11px] text-red-400">
          <X size={13} /> {error}
        </p>
      )}
    </div>
  );
}
