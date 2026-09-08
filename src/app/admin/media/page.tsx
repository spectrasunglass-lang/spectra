"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import {
  Loader2,
  CheckCircle2,
  Trash2,
  Image as ImageIcon,
  RefreshCw,
  Monitor,
  Smartphone,
  Sparkles,
  Type,
} from "lucide-react";
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

const IMAGE_KEYS = [
  "hero_slide_1_desktop",
  "hero_slide_1_mobile",
  "hero_slide_2_desktop",
  "hero_slide_2_mobile",
  "hero_slide_3_desktop",
  "hero_slide_3_mobile",
  "hero_slide_1",
  "hero_slide_2",
  "hero_slide_3",
  "story_image",
];

const TEXT_KEYS = [
  "hero_label",
  "hero_heading_line1",
  "hero_heading_line2",
  "hero_subtext",
  "story_label",
  "story_heading",
  "story_body",
  "story_link_text",
];

const TEXT_DEFAULTS: Record<string, string> = {
  hero_label: "NEW COLLECTION 2026",
  hero_heading_line1: "SEE BEYOND",
  hero_heading_line2: "LIMITS",
  hero_subtext: "Crafted for visionaries.\nDesigned to stand apart.",
  story_label: "Our Story",
  story_heading: "BUILT TO BE SEEN",
  story_body:
    "SPECTRA is more than eyewear. It's a mindset. Confidence in every detail. Clarity in every view.",
  story_link_text: "DISCOVER OUR JOURNEY",
};

export default function MediaPage() {
  const [images, setImages] = useState<Record<string, string | null>>({});
  const [texts, setTexts] = useState<Record<string, string>>({ ...TEXT_DEFAULTS });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("settings")
      .select("key, value")
      .in("key", [...IMAGE_KEYS, ...TEXT_KEYS]);

    if (data) {
      const loadedImages: Record<string, string | null> = {};
      const loadedTexts: Record<string, string> = { ...TEXT_DEFAULTS };

      data.forEach((row) => {
        if (TEXT_KEYS.includes(row.key)) {
          if (row.value) loadedTexts[row.key] = row.value;
        } else {
          if (row.value) loadedImages[row.key] = row.value;
        }
      });

      // Migrate legacy keys
      if (loadedImages.hero_slide_1 && !loadedImages.hero_slide_1_desktop)
        loadedImages.hero_slide_1_desktop = loadedImages.hero_slide_1;
      if (loadedImages.hero_slide_2 && !loadedImages.hero_slide_2_desktop)
        loadedImages.hero_slide_2_desktop = loadedImages.hero_slide_2;
      if (loadedImages.hero_slide_3 && !loadedImages.hero_slide_3_desktop)
        loadedImages.hero_slide_3_desktop = loadedImages.hero_slide_3;

      setImages(loadedImages);
      setTexts(loadedTexts);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
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

  const handleTextChange = (key: string, value: string) => {
    setTexts((prev) => ({ ...prev, [key]: value }));
  };

  const handleSaveAll = async () => {
    setSaving(true);
    setError(null);
    try {
      const supabase = createClient();
      const imageEntries = Object.entries(images).map(([key, value]) => ({
        key,
        value: value ?? "",
      }));
      const textEntries = Object.entries(texts).map(([key, value]) => ({
        key,
        value: value ?? "",
      }));
      const { error: dbError } = await supabase
        .from("settings")
        .upsert([...imageEntries, ...textEntries], { onConflict: "key" });
      if (dbError) throw new Error(dbError.message);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  // ── Render Helpers ──────────────────────────────────────────

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
            <div className="relative w-full h-[220px] bg-[#0e0e0e] rounded-sm overflow-hidden border border-white/[0.08]">
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

  const renderTextField = (
    key: string,
    label: string,
    placeholder: string,
    multiline = false
  ) => (
    <div className="space-y-1.5">
      <label className="text-[11px] font-bold text-white/50 uppercase tracking-wider">
        {label}
      </label>
      {multiline ? (
        <textarea
          value={texts[key] ?? ""}
          onChange={(e) => handleTextChange(key, e.target.value)}
          placeholder={placeholder}
          rows={3}
          className="w-full bg-[#1a1a1a] border border-white/[0.08] rounded-sm px-3 py-2.5 text-[13px] text-white placeholder-white/20 focus:outline-none focus:border-[#c8874a]/60 resize-none transition-colors"
        />
      ) : (
        <input
          type="text"
          value={texts[key] ?? ""}
          onChange={(e) => handleTextChange(key, e.target.value)}
          placeholder={placeholder}
          className="w-full bg-[#1a1a1a] border border-white/[0.08] rounded-sm px-3 py-2.5 text-[13px] text-white placeholder-white/20 focus:outline-none focus:border-[#c8874a]/60 transition-colors"
        />
      )}
    </div>
  );

  // ── Render ──────────────────────────────────────────────────

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-bold text-white tracking-tight">
            Media & Hero Banners
          </h1>
          <p className="text-[13px] text-white/40 mt-0.5">
            Configure banner images and editable text for Hero &amp; Our Story sections
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
            onClick={loadData}
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
          <p className="text-[13px] text-white/40">Loading...</p>
        </div>
      ) : (
        <div className="space-y-6">

          {/* ── Hero Text Content ── */}
          <div className="bg-[#111111] rounded-sm border border-white/[0.07] p-6 space-y-5 shadow-xl shadow-black/40">
            <div className="border-b border-white/[0.06] pb-3 flex items-center gap-2.5">
              <Type size={16} className="text-[#c8874a]" />
              <div>
                <h3 className="text-[15px] font-bold text-white">
                  Hero Section — Text Content
                </h3>
                <p className="text-[12px] text-white/40 mt-0.5">
                  Edit heading, label and subtext shown on the hero banner
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderTextField("hero_label", "Label (small text above heading)", "e.g. NEW COLLECTION 2026")}
              {renderTextField("hero_heading_line1", "Heading Line 1 — White", "e.g. SEE BEYOND")}
              {renderTextField("hero_heading_line2", "Heading Line 2 — Gold", "e.g. LIMITS")}
              {renderTextField("hero_subtext", "Subtext (below heading)", "e.g. Crafted for visionaries.", true)}
            </div>
          </div>

          {/* ── Hero Slides (Images) ── */}
          {heroSlides.map((slide) => (
            <div
              key={slide.id}
              className="bg-[#111111] rounded-sm border border-white/[0.07] p-6 space-y-4 shadow-xl shadow-black/40"
            >
              <div className="border-b border-white/[0.06] pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-[15px] font-bold text-white">{slide.title}</h3>
                  <p className="text-[12px] text-white/40 mt-0.5">
                    Separate image variants for Desktop and Mobile viewports
                  </p>
                </div>
                <span className="text-[11px] font-bold text-[#c8874a] bg-[#c8874a]/10 border border-[#c8874a]/20 px-2.5 py-1 rounded-sm">
                  Slide {slide.id}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                {renderSlotCard(slide.desktopKey, "Desktop Banner", "desktop", "16:9", "1920 × 1080px (Landscape)")}
                {renderSlotCard(slide.mobileKey, "Mobile Banner", "mobile", "4:5 or 9:16", "1080 × 1350px (Portrait)")}
              </div>
            </div>
          ))}

          {/* ── Our Story Text + Image ── */}
          <div className="bg-[#111111] rounded-sm border border-white/[0.07] p-6 space-y-5 shadow-xl shadow-black/40">
            <div className="border-b border-white/[0.06] pb-3 flex items-center gap-2.5">
              <Type size={16} className="text-[#c8874a]" />
              <div>
                <h3 className="text-[15px] font-bold text-white">
                  Our Story — Text Content
                </h3>
                <p className="text-[12px] text-white/40 mt-0.5">
                  Edit the &quot;Built to Be Seen&quot; section heading, body and link text
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderTextField("story_label", "Label (small text above heading)", "e.g. Our Story")}
              {renderTextField("story_heading", "Main Heading", "e.g. BUILT TO BE SEEN")}
              {renderTextField("story_body", "Body Text", "e.g. SPECTRA is more than eyewear...", true)}
              {renderTextField("story_link_text", "Link / Button Text", "e.g. DISCOVER OUR JOURNEY")}
            </div>

            <div className="border-t border-white/[0.06] pt-5">
              <p className="text-[12px] font-bold text-white/50 uppercase tracking-wider mb-3">
                Story Editorial Image
              </p>
              <div className="max-w-md">
                {renderSlotCard("story_image", "Story Editorial Image", "mobile", "3:4", "600 × 800px (Portrait model shot)")}
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
