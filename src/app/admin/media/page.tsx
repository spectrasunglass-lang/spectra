"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Loader2, CheckCircle2, Trash2, Image as ImageIcon, RefreshCw, Monitor, Smartphone, Sparkles } from "lucide-react";
import ImageUpload from "@/components/admin/ImageUpload";

interface SlideConfig {
  id: number;
  title: string;
  desktopKey: string;
  mobileKey: string;
}

const heroSlides: SlideConfig[] = [
  {
    id: 1,
    title: "Hero Banner — Slide 1",
    desktopKey: "hero_slide_1_desktop",
    mobileKey: "hero_slide_1_mobile",
  },
  {
    id: 2,
    title: "Hero Banner — Slide 2",
    desktopKey: "hero_slide_2_desktop",
    mobileKey: "hero_slide_2_mobile",
  },
  {
    id: 3,
    title: "Hero Banner — Slide 3",
    desktopKey: "hero_slide_3_desktop",
    mobileKey: "hero_slide_3_mobile",
  },
];

const allKeys = [
  "hero_slide_1_desktop",
  "hero_slide_1_mobile",
  "hero_slide_2_desktop",
  "hero_slide_2_mobile",
  "hero_slide_3_desktop",
  "hero_slide_3_mobile",
  "hero_slide_1", // legacy fallback
  "hero_slide_2",
  "hero_slide_3",
  "story_image",
];

export default function MediaPage() {
  const [images, setImages] = useState<Record<string, string | null>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadImages = async () => {
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("settings")
      .select("key, value")
      .in("key", allKeys);
    if (data) {
      const loaded: Record<string, string | null> = {};
      data.forEach((row) => {
        if (row.value) loaded[row.key] = row.value;
      });
      // Migrate legacy hero_slide_1 to hero_slide_1_desktop if not present
      if (loaded.hero_slide_1 && !loaded.hero_slide_1_desktop) {
        loaded.hero_slide_1_desktop = loaded.hero_slide_1;
      }
      if (loaded.hero_slide_2 && !loaded.hero_slide_2_desktop) {
        loaded.hero_slide_2_desktop = loaded.hero_slide_2;
      }
      if (loaded.hero_slide_3 && !loaded.hero_slide_3_desktop) {
        loaded.hero_slide_3_desktop = loaded.hero_slide_3;
      }
      setImages(loaded);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadImages();
  }, []);

  const handleImageChange = async (key: string, url: string) => {
    setImages((prev) => ({ ...prev, [key]: url }));
    const supabase = createClient();
    await supabase.from("settings").upsert({ key, value: url }, { onConflict: "key" });
  };

  const handleRemove = async (key: string) => {
    setImages((prev) => ({ ...prev, [key]: null }));
    const supabase = createClient();
    await supabase.from("settings").upsert({ key, value: "" }, { onConflict: "key" });
  };

  const handleSaveAll = async () => {
    setSaving(true);
    setError(null);
    try {
      const supabase = createClient();
      const entries = Object.entries(images).map(([key, value]) => ({
        key,
        value: value ?? "",
      }));
      const { error: dbError } = await supabase
        .from("settings")
        .upsert(entries, { onConflict: "key" });
      if (dbError) throw new Error(dbError.message);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const renderSlotCard = (
    key: string,
    label: string,
    device: "desktop" | "mobile",
    aspectRatio: string,
    recommendation: string
  ) => {
    const value = images[key];
    return (
      <div className="flex-1 bg-[#161616] border border-white/[0.06] rounded-sm p-4 flex flex-col justify-between space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {device === "desktop" ? (
              <Monitor size={15} className="text-[#c8874a]" />
            ) : (
              <Smartphone size={15} className="text-[#c8874a]" />
            )}
            <span className="text-[13px] font-bold text-white">{label}</span>
          </div>
          {value && (
            <button
              onClick={() => handleRemove(key)}
              className="p-1 rounded-sm hover:bg-red-500/10 text-white/40 hover:text-red-400 transition-colors"
              title="Remove image"
            >
              <Trash2 size={13} />
            </button>
          )}
        </div>

        {value ? (
          <div className="space-y-2">
            <div
              className="relative w-full h-[220px] bg-[#0e0e0e] rounded-sm overflow-hidden border border-white/[0.08]"
            >
              <Image src={value} alt={label} fill className="object-cover" />
              <label className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/60 transition-colors cursor-pointer group">
                <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-[#c8874a] text-white text-[11px] font-bold px-3 py-1.5 rounded-sm flex items-center gap-1.5 shadow-lg">
                  <ImageIcon size={12} />
                  Replace
                </span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const form = new FormData();
                    form.append("file", file);
                    form.append("folder", "spectra/hero");
                    const res = await fetch("/api/admin/upload", {
                      method: "POST",
                      body: form,
                    });
                    const data = await res.json();
                    if (data.url) handleImageChange(key, data.url);
                    e.target.value = "";
                  }}
                />
              </label>
            </div>
            <div className="flex items-center justify-between text-[10px] text-white/40">
              <span className="truncate max-w-[140px]">{value}</span>
              <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-sm">
                Live ✓
              </span>
            </div>
          </div>
        ) : (
          <ImageUpload
            value={null}
            onChange={(url) => handleImageChange(key, url)}
            label={`Upload ${label}`}
            folder="spectra/hero"
          />
        )}

        <p className="text-[10.5px] text-white/35">
          {recommendation} ({aspectRatio})
        </p>
      </div>
    );
  };

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-bold text-white tracking-tight">
            Media & Hero Banners
          </h1>
          <p className="text-[13px] text-white/40 mt-0.5">
            Configure desktop and mobile banner versions for optimal display on all devices
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/campaigns"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-sm text-[12px] font-bold border border-white/[0.08] bg-[#161616] hover:bg-[#202020] text-white/80 hover:text-white transition-colors"
          >
            <Sparkles size={13} className="text-[#c8874a]" />
            <span>Spotlight Campaigns</span>
          </Link>
          <button
            onClick={loadImages}
            className="w-9 h-9 flex items-center justify-center rounded-sm border border-white/[0.08] bg-[#161616] hover:bg-[#202020] text-white/60 hover:text-white transition-colors"
            title="Refresh"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
          <button
            onClick={handleSaveAll}
            disabled={saving || saved}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-sm text-[12px] font-bold transition-all duration-200 shadow-md ${
              saved
                ? "bg-emerald-600 text-white"
                : "bg-[#c8874a] hover:bg-[#b87840] text-white shadow-[#c8874a]/20"
            } disabled:opacity-70`}
          >
            {saving ? (
              <>
                <Loader2 size={14} className="animate-spin" /> Saving...
              </>
            ) : saved ? (
              <>
                <CheckCircle2 size={14} /> Saved!
              </>
            ) : (
              "Save All"
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-sm px-4 py-3 text-[12px] text-red-400">
          {error}
        </div>
      )}

      {loading ? (
        <div className="bg-[#111111] rounded-sm border border-white/[0.07] flex items-center justify-center py-24 gap-3">
          <Loader2 size={20} className="animate-spin text-[#c8874a]" />
          <p className="text-[13px] text-white/40">Loading media slots...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Hero Slides with Desktop + Mobile Options */}
          {heroSlides.map((slide) => (
            <div
              key={slide.id}
              className="bg-[#111111] rounded-sm border border-white/[0.07] p-6 space-y-4 shadow-xl shadow-black/40"
            >
              <div className="border-b border-white/[0.06] pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-[15px] font-bold text-white">
                    {slide.title}
                  </h3>
                  <p className="text-[12px] text-white/40 mt-0.5">
                    Separate image variants for Desktop and Mobile viewports
                  </p>
                </div>
                <span className="text-[11px] font-bold text-[#c8874a] bg-[#c8874a]/10 border border-[#c8874a]/20 px-2.5 py-1 rounded-sm">
                  Slide {slide.id}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                {/* Desktop Version */}
                {renderSlotCard(
                  slide.desktopKey,
                  "Desktop Banner",
                  "desktop",
                  "16:9",
                  "1920 × 1080px (Landscape)"
                )}

                {/* Mobile Version */}
                {renderSlotCard(
                  slide.mobileKey,
                  "Mobile Banner",
                  "mobile",
                  "4:5 or 9:16",
                  "1080 × 1350px (Portrait)"
                )}
              </div>
            </div>
          ))}

          {/* Story Image */}
          <div className="bg-[#111111] rounded-sm border border-white/[0.07] p-6 space-y-4 shadow-xl shadow-black/40">
            <div className="border-b border-white/[0.06] pb-3">
              <h3 className="text-[15px] font-bold text-white">
                Our Story — Brand Image
              </h3>
              <p className="text-[12px] text-white/40 mt-0.5">
                Portrait editorial image for the &quot;Built to Be Seen&quot; section
              </p>
            </div>
            <div className="max-w-md pt-2">
              {renderSlotCard(
                "story_image",
                "Story Editorial Image",
                "mobile",
                "3:4",
                "600 × 800px (Portrait model shot)"
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
