"use client";

import React, { useState, useCallback } from "react";
import Image from "next/image";
import { Upload, X, ImagePlus, Loader2, Star, Check } from "lucide-react";

interface MultiImageUploadProps {
  primaryImage?: string | null;
  galleryImages: string[];
  onPrimaryChange: (url: string | null) => void;
  onGalleryChange: (urls: string[]) => void;
  folder?: string;
}

export default function MultiImageUpload({
  primaryImage,
  galleryImages = [],
  onPrimaryChange,
  onGalleryChange,
  folder = "spectra/products",
}: MultiImageUploadProps) {
  const [uploadingCount, setUploadingCount] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadSingleFile = async (file: File): Promise<string | null> => {
    if (!file.type.startsWith("image/")) {
      throw new Error(`File ${file.name} is not an image`);
    }
    const form = new FormData();
    form.append("file", file);
    form.append("folder", folder);

    const res = await fetch("/api/admin/upload", {
      method: "POST",
      body: form,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Upload failed");
    return data.url;
  };

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      const fileArray = Array.from(files).filter((f) => f.type.startsWith("image/"));
      if (fileArray.length === 0) return;

      setUploadingCount(fileArray.length);
      setError(null);

      try {
        const uploadedUrls: string[] = [];
        for (const file of fileArray) {
          const url = await uploadSingleFile(file);
          if (url) uploadedUrls.push(url);
          setUploadingCount((prev) => Math.max(0, prev - 1));
        }

        if (uploadedUrls.length > 0) {
          // If no primary image set, make first uploaded the primary
          let updatedPrimary = primaryImage;
          let remaining = [...uploadedUrls];

          if (!updatedPrimary && remaining.length > 0) {
            updatedPrimary = remaining[0];
            onPrimaryChange(updatedPrimary);
            remaining = remaining.slice(1);
          }

          if (remaining.length > 0) {
            onGalleryChange([...galleryImages, ...remaining]);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to upload some images");
      } finally {
        setUploadingCount(0);
      }
    },
    [primaryImage, galleryImages, folder, onPrimaryChange, onGalleryChange]
  );

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const onFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
    e.target.value = "";
  };

  const removeGalleryImage = (indexToRemove: number) => {
    onGalleryChange(galleryImages.filter((_, idx) => idx !== indexToRemove));
  };

  const setAsCover = (url: string, indexInGallery: number) => {
    const oldPrimary = primaryImage;
    onPrimaryChange(url);
    const newGallery = [...galleryImages];
    newGallery.splice(indexInGallery, 1);
    if (oldPrimary) {
      newGallery.unshift(oldPrimary);
    }
    onGalleryChange(newGallery);
  };

  const totalImagesCount = (primaryImage ? 1 : 0) + galleryImages.length;

  return (
    <div className="space-y-4">
      {/* Drag & Drop Multi-Upload Box */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={`relative border-2 border-dashed rounded-sm p-6 text-center transition-all ${
          dragging
            ? "border-[#c8874a] bg-[#c8874a]/10"
            : "border-white/[0.12] hover:border-[#c8874a]/50 bg-[#161616]"
        }`}
      >
        <input
          type="file"
          accept="image/*"
          multiple
          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
          onChange={onFileInput}
          disabled={uploadingCount > 0}
        />

        <div className="flex flex-col items-center justify-center gap-2 pointer-events-none">
          {uploadingCount > 0 ? (
            <div className="flex flex-col items-center gap-2 py-2">
              <Loader2 size={24} className="animate-spin text-[#c8874a]" />
              <p className="text-xs font-bold text-white">
                Uploading {uploadingCount} image{uploadingCount > 1 ? "s" : ""}...
              </p>
            </div>
          ) : (
            <>
              <div className="w-11 h-11 rounded-full bg-white/[0.06] border border-white/[0.08] flex items-center justify-center text-white/70">
                <ImagePlus size={20} className="text-[#c8874a]" />
              </div>
              <div>
                <p className="text-[13px] font-bold text-white">
                  Drop multiple images here or <span className="text-[#c8874a]">browse files</span>
                </p>
                <p className="text-[11px] text-white/40 mt-0.5">
                  Select 4–6 angles (front, side, 45°, folded, on-model, packaging)
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {error && (
        <p className="text-[12px] text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-sm">
          {error}
        </p>
      )}

      {/* Uploaded Gallery Section */}
      {totalImagesCount > 0 && (
        <div className="space-y-4 pt-1">
          {/* Main Cover Showcase Card */}
          {primaryImage && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <Star size={13} className="text-[#c8874a] fill-[#c8874a]" /> Main Cover Photo
                </span>
                <span className="text-[10px] text-emerald-400 font-medium bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-[2px]">
                  Active Listing Image
                </span>
              </div>

              <div className="relative w-full h-48 sm:h-52 rounded-sm overflow-hidden bg-[#f5f0eb] border-2 border-[#c8874a]/80 shadow-md group">
                <Image
                  src={primaryImage}
                  alt="Main Cover"
                  fill
                  priority
                  unoptimized
                  className="object-contain p-3 transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 350px"
                />

                {/* Hover overlay for Cover actions */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-[2px]">
                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#c8874a] hover:bg-[#b87840] text-white text-[11px] font-bold rounded-sm cursor-pointer shadow transition-colors">
                    <ImagePlus size={13} />
                    Replace Cover
                    <input
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          try {
                            setUploadingCount(1);
                            const url = await uploadSingleFile(file);
                            if (url) onPrimaryChange(url);
                          } catch (err) {
                            setError(err instanceof Error ? err.message : "Upload failed");
                          } finally {
                            setUploadingCount(0);
                          }
                        }
                        e.target.value = "";
                      }}
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => onPrimaryChange(null)}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-red-600 hover:bg-red-700 text-white text-[11px] font-bold rounded-sm cursor-pointer shadow transition-colors"
                  >
                    <X size={13} /> Remove
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Additional Gallery Angles */}
          {galleryImages.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white/70 uppercase tracking-wider text-[11px]">
                  Additional Angles ({galleryImages.length})
                </span>
                <span className="text-[10px] text-white/40">
                  Hover to set as cover or remove
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                {galleryImages.map((url, idx) => (
                  <div
                    key={idx}
                    className="relative aspect-square rounded-sm overflow-hidden bg-[#f5f0eb] border border-white/[0.12] hover:border-white/40 transition-all group shadow-sm"
                  >
                    <Image
                      src={url}
                      alt={`Angle ${idx + 2}`}
                      fill
                      unoptimized
                      className="object-contain p-2"
                      sizes="100px"
                    />
                    <span className="absolute bottom-1 left-1 bg-black/75 text-white text-[8.5px] font-bold px-1.5 py-0.5 rounded-[2px]">
                      Angle {idx + 2}
                    </span>

                    {/* Hover Actions */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 backdrop-blur-[1px]">
                      <button
                        type="button"
                        onClick={() => setAsCover(url, idx)}
                        className="p-1.5 rounded-full bg-[#c8874a] text-white hover:bg-[#b87840] transition-colors cursor-pointer shadow"
                        title="Make Main Cover"
                      >
                        <Star size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeGalleryImage(idx)}
                        className="p-1.5 rounded-full bg-red-600 text-white hover:bg-red-700 transition-colors cursor-pointer shadow"
                        title="Remove Angle"
                      >
                        <X size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
