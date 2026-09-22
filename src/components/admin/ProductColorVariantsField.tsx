"use client";

import React, { useState } from "react";
import Image from "next/image";
import { cldUrl, isCloudinaryUrl } from "@/lib/cldUrl";
import { ImagePlus, Loader2, Plus, Trash2, X, Star, UploadCloud } from "lucide-react";
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
  const [uploadProgress, setUploadProgress] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const enabled = variants.length > 0;

  const updateVariant = (id: string, changes: Partial<ProductColorVariant>) => {
    onChange(
      variants.map((variant) => (variant.id === id ? { ...variant, ...changes } : variant))
    );
  };

  const uploadImagesForVariant = async (variantId: string, files: FileList | File[]) => {
    const validFiles = Array.from(files).filter((file) => file.type.startsWith("image/"));
    if (validFiles.length === 0) {
      setError("Please select valid image files.");
      return;
    }

    setUploadingId(variantId);
    setError(null);
    setUploadProgress(`0 of ${validFiles.length}`);

    try {
      const uploadedUrls: string[] = [];

      for (let i = 0; i < validFiles.length; i++) {
        const file = validFiles[i];
        setUploadProgress(`${i + 1} of ${validFiles.length}`);

        const form = new FormData();
        form.append("file", file);
        form.append("folder", "spectra/products/colours");

        const response = await fetch("/api/admin/upload", { method: "POST", body: form });
        const data = await response.json();

        if (!response.ok || !data.url) {
          throw new Error(data.error || "Colour image upload failed");
        }

        uploadedUrls.push(data.url);
      }

      const target = variants.find((v) => v.id === variantId);
      const existingImages = target?.images && target.images.length > 0
        ? target.images
        : target?.image_url ? [target.image_url] : [];

      const combinedImages = [...existingImages, ...uploadedUrls];
      const primaryUrl = combinedImages[0] || "";

      updateVariant(variantId, {
        image_url: primaryUrl,
        images: combinedImages,
      });
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Colour image upload failed");
    } finally {
      setUploadingId(null);
      setUploadProgress("");
    }
  };

  const setCoverImage = (variantId: string, imgUrl: string) => {
    const target = variants.find((v) => v.id === variantId);
    if (!target) return;
    const currentImages = target.images && target.images.length > 0 ? target.images : [target.image_url];
    const filtered = currentImages.filter((img) => img !== imgUrl);
    const reordered = [imgUrl, ...filtered];

    updateVariant(variantId, {
      image_url: imgUrl,
      images: reordered,
    });
  };

  const removeVariantImage = (variantId: string, imgUrl: string) => {
    const target = variants.find((v) => v.id === variantId);
    if (!target) return;
    const currentImages = target.images && target.images.length > 0 ? target.images : [target.image_url];
    const remaining = currentImages.filter((img) => img !== imgUrl);
    const newPrimary = remaining[0] || "";

    updateVariant(variantId, {
      image_url: newPrimary,
      images: remaining,
    });
  };

  return (
    <div className="bg-[#111111] rounded-sm border border-white/[0.07] p-6 space-y-5 shadow-xl shadow-black/40">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-[14px] font-bold text-white">Product Colours &amp; Variant Galleries</h2>
            <span className="text-[10px] font-semibold bg-[#c8874a]/20 text-[#c8874a] px-2 py-0.5 rounded">
              Multi-Angle Support
            </span>
          </div>
          <p className="text-[11px] text-white/40 mt-1">
            Give each colour its own name and multiple photo angles (front, side, 45°, folded, model). When customers select a colour on the storefront, the gallery automatically switches to that colour&apos;s photos.
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
        <div className="border-t border-white/[0.06] pt-4 space-y-4">
          {variants.map((variant, index) => {
            const variantImages =
              variant.images && variant.images.length > 0
                ? variant.images
                : variant.image_url
                ? [variant.image_url]
                : [];

            const isUploading = uploadingId === variant.id;

            return (
              <div
                key={variant.id}
                className="rounded-sm border border-white/[0.08] bg-[#161616] p-4 sm:p-5 space-y-4"
              >
                {/* Variant Header & Names */}
                <div className="space-y-3 pb-3 border-b border-white/[0.05]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#c8874a] bg-[#c8874a]/10 px-2 py-0.5 rounded">
                        Colour {index + 1}
                      </span>
                      <span className="text-[11px] text-white/40">
                        {variantImages.length} {variantImages.length === 1 ? "angle" : "angles"} uploaded
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => onChange(variants.filter((item) => item.id !== variant.id))}
                      className="rounded p-1 text-white/35 hover:bg-red-500/10 hover:text-red-400 transition-colors cursor-pointer flex items-center gap-1 text-[11px]"
                      title="Remove this colour variant"
                      aria-label={`Remove colour ${variant.name || index + 1}`}
                    >
                      <Trash2 size={13} />
                      <span className="hidden sm:inline">Delete</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-white/50 block mb-1">
                        Colour Swatch Name *
                      </label>
                      <input
                        type="text"
                        value={variant.name}
                        onChange={(e) => updateVariant(variant.id, { name: e.target.value })}
                        placeholder="e.g. Crystal Brown, Matte Black, Blue"
                        className="w-full rounded-sm border border-white/[0.08] bg-[#111111] px-3 py-2 text-[12px] text-white outline-none transition-colors placeholder:text-white/25 focus:border-[#c8874a]"
                      />
                      <p className="text-[10px] text-white/30 mt-1">Short label shown on the colour selector button</p>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-[#c8874a] block mb-1">
                        Product Name on Colour Click (H1 Title)
                      </label>
                      <input
                        type="text"
                        value={variant.product_name || ""}
                        onChange={(e) => updateVariant(variant.id, { product_name: e.target.value })}
                        placeholder="e.g. Classic - Crystal Brown Transparent"
                        className="w-full rounded-sm border border-white/[0.08] bg-[#111111] px-3 py-2 text-[12px] text-white outline-none transition-colors placeholder:text-white/25 focus:border-[#c8874a]"
                      />
                      <p className="text-[10px] text-white/30 mt-1">Changes product title when customer clicks this colour</p>
                    </div>
                  </div>
                </div>

                {/* Variant Angles Gallery Grid */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <p className="text-[10.5px] font-bold uppercase tracking-wider text-white/50">
                      Photos for {variant.name || `Colour ${index + 1}`}
                    </p>
                    {isUploading && (
                      <span className="text-[10.5px] text-[#c8874a] flex items-center gap-1">
                        <Loader2 size={12} className="animate-spin" /> Uploading {uploadProgress}...
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    {variantImages.map((imgUrl, imgIdx) => {
                      const isCover = imgIdx === 0;

                      return (
                        <div
                          key={imgUrl + imgIdx}
                          className="group relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-sm border border-white/[0.1] bg-[#f5f0eb] shadow-md"
                        >
                          <Image
                            src={cldUrl(imgUrl, 200)}
                            unoptimized={isCloudinaryUrl(imgUrl)}
                            alt={`${variant.name} angle ${imgIdx + 1}`}
                            fill
                            className="object-contain p-1"
                            sizes="80px"
                          />

                          {/* Cover Badge */}
                          {isCover ? (
                            <div className="absolute top-1 left-1 bg-[#c8874a] text-white text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded shadow-sm flex items-center gap-0.5">
                              <Star size={8} fill="currentColor" /> Cover
                            </div>
                          ) : null}

                          {/* Hover Overlay Controls */}
                          <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 p-1">
                            {!isCover && (
                              <button
                                type="button"
                                onClick={() => setCoverImage(variant.id, imgUrl)}
                                className="text-[9px] font-bold text-[#c8874a] hover:text-white transition-colors uppercase tracking-wider bg-white/[0.1] hover:bg-[#c8874a] px-1.5 py-0.5 rounded w-full text-center cursor-pointer"
                              >
                                Set Cover
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => removeVariantImage(variant.id, imgUrl)}
                              className="text-[9px] font-bold text-red-400 hover:text-white transition-colors uppercase tracking-wider bg-red-500/20 hover:bg-red-500 px-1.5 py-0.5 rounded w-full text-center cursor-pointer"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      );
                    })}

                    {/* Add Photo Button (Supports multiple files!) */}
                    <label
                      className={`relative h-20 w-24 flex-shrink-0 flex flex-col items-center justify-center gap-1 rounded-sm border border-dashed border-white/[0.15] bg-[#111111] hover:border-[#c8874a] hover:bg-[#c8874a]/5 transition-all text-white/50 hover:text-[#c8874a] cursor-pointer ${
                        isUploading ? "opacity-50 pointer-events-none" : ""
                      }`}
                    >
                      {isUploading ? (
                        <Loader2 size={16} className="animate-spin text-[#c8874a]" />
                      ) : (
                        <UploadCloud size={16} />
                      )}
                      <span className="text-[9px] font-bold uppercase tracking-wider text-center px-1 leading-tight">
                        {isUploading ? "Uploading" : "+ Add Photos"}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="sr-only"
                        disabled={isUploading}
                        onChange={(e) => {
                          if (e.target.files && e.target.files.length > 0) {
                            uploadImagesForVariant(variant.id, e.target.files);
                          }
                          e.target.value = "";
                        }}
                      />
                    </label>
                  </div>
                </div>
              </div>
            );
          })}

          <button
            type="button"
            onClick={() => onChange([...variants, createProductColorVariant()])}
            className="flex w-full items-center justify-center gap-1.5 rounded-sm border border-dashed border-white/[0.14] px-3 py-3 text-[11px] font-bold uppercase tracking-wider text-white/55 transition-colors hover:border-[#c8874a]/60 hover:text-[#c8874a] cursor-pointer"
          >
            <Plus size={14} /> Add another colour variant
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
