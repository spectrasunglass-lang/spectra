"use client";

import React, { useCallback, useState } from "react";
import Image from "next/image";
import { Upload, X, ImagePlus, Loader2 } from "lucide-react";

interface ImageUploadProps {
  value?: string | null;
  onChange: (url: string) => void;
  onRemove?: () => void;
  label?: string;
  folder?: string;
}

export default function ImageUpload({
  value,
  onChange,
  onRemove,
  label = "Upload Image",
  folder = "spectra/products",
}: ImageUploadProps) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upload = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) {
        setError("Please upload an image file.");
        return;
      }
      setUploading(true);
      setError(null);
      try {
        const form = new FormData();
        form.append("file", file);
        form.append("folder", folder);
        const res = await fetch("/api/admin/upload", {
          method: "POST",
          body: form,
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Upload failed");
        onChange(data.url);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload failed");
      } finally {
        setUploading(false);
      }
    },
    [folder, onChange]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) upload(file);
    },
    [upload]
  );

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) upload(file);
    e.target.value = "";
  };

  if (value) {
    return (
      <div className="relative group rounded-2xl overflow-hidden border border-white/[0.08] bg-[#161616]">
        <div className="relative aspect-square bg-[#f5f0eb]">
          <Image
            src={value}
            alt="Uploaded"
            fill
            className="object-contain p-3"
          />
        </div>
        <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2.5">
          <label className="cursor-pointer bg-[#c8874a] hover:bg-[#b87840] text-white text-[11px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors shadow-md">
            <Upload size={12} />
            Replace
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onFileChange}
            />
          </label>
          {onRemove && (
            <button
              type="button"
              onClick={onRemove}
              className="bg-red-500 hover:bg-red-600 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors shadow-md"
            >
              <X size={12} />
              Remove
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      <label
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={`flex flex-col items-center justify-center gap-3 border-2 border-dashed rounded-2xl aspect-square cursor-pointer transition-all duration-200 ${
          dragging
            ? "border-[#c8874a] bg-[#c8874a]/10 scale-[1.01]"
            : "border-white/[0.1] bg-[#141414] hover:border-[#c8874a]/60 hover:bg-[#181818]"
        }`}
      >
        {uploading ? (
          <>
            <Loader2 size={28} className="text-[#c8874a] animate-spin" />
            <p className="text-[12px] font-medium text-white/50">
              Uploading image...
            </p>
          </>
        ) : (
          <>
            <div className="w-12 h-12 rounded-xl bg-[#201c18] border border-[#c8874a]/30 flex items-center justify-center">
              <ImagePlus size={22} className="text-[#c8874a]" />
            </div>
            <div className="text-center px-4">
              <p className="text-[13px] font-bold text-white">
                {label}
              </p>
              <p className="text-[11px] text-white/40 mt-1">
                Drag & drop or click to browse
              </p>
              <p className="text-[10px] text-white/20 mt-0.5">
                PNG, JPG, WEBP up to 10MB
              </p>
            </div>
          </>
        )}
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onFileChange}
          disabled={uploading}
        />
      </label>
      {error && (
        <p className="text-[11px] text-red-400 mt-2 flex items-center gap-1">
          <X size={11} />
          {error}
        </p>
      )}
    </div>
  );
}
