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

      {/* Uploaded Gallery Grid */}
      {totalImagesCount > 0 && (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-xs text-white/60">
            <span className="font-bold text-white uppercase tracking-wider text-[11px]">
              Uploaded Product Angles ({totalImagesCount})
            </span>
            <span className="text-[11px] text-[#c8874a]">
              ★ First image is the Main Cover
            </span>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
            {/* Primary Cover Image Card */}
            {primaryImage && (
              <div className="relative aspect-square rounded-sm overflow-hidden bg-[#f5f0eb] border-2 border-[#c8874a] shadow-md group">
                <Image
                  src={primaryImage}
                  alt="Main Cover"
                  fill
                  className="object-contain p-2"
                  sizes="120px"
                />
                <span className="absolute top-1.5 left-1.5 bg-[#c8874a] text-white text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded-[2px] shadow">
                  COVER
                </span>
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => onPrimaryChange(null)}
                    className="p-1.5 rounded-full bg-red-600 text-white hover:bg-red-700 transition-colors cursor-pointer"
                    title="Remove Cover"
                  >
                    <X size={13} />
                  </button>
                </div>
              </div>
            )}

            {/* Additional Gallery Images */}
            {galleryImages.map((url, idx) => (
              <div
                key={idx}
                className="relative aspect-square rounded-sm overflow-hidden bg-[#f5f0eb] border border-white/[0.1] hover:border-white/30 transition-all group"
              >
                <Image
                  src={url}
                  alt={`Angle ${idx + 2}`}
                  fill
                  className="object-contain p-2"
                  sizes="120px"
                />
                <span className="absolute bottom-1.5 left-1.5 bg-black/70 text-white text-[8.5px] font-bold px-1.5 py-0.5 rounded-[2px]">
                  Angle {idx + 2}
                </span>

                {/* Hover Actions */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setAsCover(url, idx)}
                    className="p-1.5 rounded-full bg-[#c8874a] text-white hover:bg-[#b87840] transition-colors cursor-pointer"
                    title="Make Main Cover"
                  >
                    <Star size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeGalleryImage(idx)}
                    className="p-1.5 rounded-full bg-red-600 text-white hover:bg-red-700 transition-colors cursor-pointer"
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
  );
}
