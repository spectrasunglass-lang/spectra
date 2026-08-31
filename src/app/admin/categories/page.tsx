"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import {
  Plus,
  Trash2,
  Upload,
  X,
  Loader2,
  CheckCircle2,
  ImagePlus,
  Pencil,
  Check,
  RefreshCw,
  GripVertical,
  AlertTriangle,
} from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
  image_url: string;
}

const SETTINGS_KEY = "category_shapes";

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function toSlug(name: string) {
  return name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

interface CardProps {
  cat: Category;
  onRename: (id: string, name: string) => void;
  onImageChange: (id: string, url: string) => void;
  onRemoveImage: (id: string) => void;
  onDelete: (id: string) => void;
  globalUploading: boolean;
  setGlobalUploading: (v: boolean) => void;
}

function CategoryCard({
  cat,
  onRename,
  onImageChange,
  onRemoveImage,
  onDelete,
  globalUploading,
  setGlobalUploading,
}: CardProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(cat.name);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadErr, setUploadErr] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) {
        setUploadErr("Please upload an image file.");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setUploadErr("File must be under 10MB.");
        return;
      }
      setUploading(true);
      setGlobalUploading(true);
      setUploadErr(null);
      try {
        const form = new FormData();
        form.append("file", file);
        form.append("folder", "spectra/category-icons");
        const res = await fetch("/api/admin/upload", { method: "POST", body: form });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Upload failed");
        onImageChange(cat.id, data.url);
      } catch (err) {
        setUploadErr(err instanceof Error ? err.message : "Upload failed");
      } finally {
        setUploading(false);
        setGlobalUploading(false);
      }
    },
    [cat.id, onImageChange, setGlobalUploading]
  );

  const commitRename = () => {
    const trimmed = draft.trim();
    if (trimmed && trimmed !== cat.name) onRename(cat.id, trimmed);
    setEditing(false);
  };

  const isUploading = uploading;

  return (
    <div className="bg-[#111111] border border-white/[0.07] rounded-sm overflow-hidden shadow-xl shadow-black/30 flex flex-col group/card hover:border-white/[0.14] transition-all duration-200">
      <div
        className={`relative bg-[#0d0d0d] aspect-square flex items-center justify-center transition-all ${
          dragOver ? "border-2 border-dashed border-[#c8874a] bg-[#c8874a]/5" : ""
        }`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          const file = e.dataTransfer.files[0];
          if (file) handleUpload(file);
        }}
      >
        {cat.image_url ? (
          <>
            <div className="relative w-full h-full">
              <Image
                src={cat.image_url}
                alt={cat.name}
                fill
                className="object-contain p-2"
              />
            </div>
            <div className="absolute inset-0 bg-black/75 opacity-0 group-hover/card:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <label className="cursor-pointer bg-[#c8874a] hover:bg-[#b87840] text-white text-[11px] font-bold px-3 py-1.5 rounded-sm flex items-center gap-1.5 transition-colors shadow-md">
                <Upload size={11} />
                Replace
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f); e.target.value = ""; }}
                  disabled={isUploading}
                />
              </label>
              <button
                type="button"
                onClick={() => onRemoveImage(cat.id)}
                className="bg-red-500/90 hover:bg-red-600 text-white text-[11px] font-bold px-3 py-1.5 rounded-sm flex items-center gap-1.5 transition-colors shadow-md"
              >
                <X size={11} />
                Remove
              </button>
            </div>
          </>
        ) : isUploading ? (
          <div className="flex flex-col items-center gap-2 p-4">
            <Loader2 size={28} className="text-[#c8874a] animate-spin" />
            <p className="text-[11px] text-white/40">Uploading...</p>
          </div>
        ) : (
          <label className="flex flex-col items-center gap-2.5 cursor-pointer w-full h-full justify-center px-4">
            <div className="w-12 h-12 rounded-sm bg-[#1c1c1c] border border-[#c8874a]/20 flex items-center justify-center group-hover/card:border-[#c8874a]/50 group-hover/card:bg-[#c8874a]/5 transition-all">
              <ImagePlus size={20} className="text-[#c8874a]/60 group-hover/card:text-[#c8874a] transition-colors" />
            </div>
            <p className="text-[11px] text-white/30 text-center group-hover/card:text-white/50 transition-colors">
              Click or drag image
            </p>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f); e.target.value = ""; }}
              disabled={isUploading}
            />
          </label>
        )}
      </div>

      {uploadErr && (
        <div className="px-3 py-2 bg-red-500/10 border-t border-red-500/20 flex items-center gap-1.5 text-[11px] text-red-400">
          <AlertTriangle size={11} />
          {uploadErr}
        </div>
      )}

      <div className="px-3 py-3 flex items-center gap-2 border-t border-white/[0.06]">
        <GripVertical size={13} className="text-white/20 flex-shrink-0 cursor-grab" />

        {editing ? (
          <div className="flex items-center gap-1.5 flex-1 min-w-0">
            <input
              ref={inputRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") commitRename();
                if (e.key === "Escape") { setDraft(cat.name); setEditing(false); }
              }}
              className="flex-1 min-w-0 bg-[#1a1a1a] border border-[#c8874a]/50 rounded-sm px-2 py-1 text-[12px] text-white outline-none"
              autoFocus
            />
            <button
              onClick={commitRename}
              className="w-6 h-6 rounded-sm bg-[#c8874a] flex items-center justify-center flex-shrink-0 hover:bg-[#b87840] transition-colors"
            >
              <Check size={11} className="text-white" />
            </button>
            <button
              onClick={() => { setDraft(cat.name); setEditing(false); }}
              className="w-6 h-6 rounded-sm bg-[#222] flex items-center justify-center flex-shrink-0 hover:bg-[#333] transition-colors"
            >
              <X size={11} className="text-white/60" />
            </button>
          </div>
        ) : (
          <>
            <span className="flex-1 min-w-0 text-[12px] font-bold text-white tracking-wide truncate">
              {cat.name}
            </span>
            <button
              onClick={() => { setDraft(cat.name); setEditing(true); }}
              className="w-6 h-6 rounded-sm bg-[#1c1c1c] hover:bg-[#c8874a]/20 flex items-center justify-center flex-shrink-0 transition-colors opacity-0 group-hover/card:opacity-100"
              title="Rename"
            >
              <Pencil size={11} className="text-white/50 hover:text-[#c8874a]" />
            </button>
            <button
              onClick={() => onDelete(cat.id)}
              className="w-6 h-6 rounded-sm bg-[#1c1c1c] hover:bg-red-500/20 flex items-center justify-center flex-shrink-0 transition-colors opacity-0 group-hover/card:opacity-100"
              title="Delete"
            >
              <Trash2 size={11} className="text-white/50 hover:text-red-400" />
            </button>
          </>
        )}
      </div>

      <div className="px-3 pb-3">
        <span className="text-[10px] text-white/20 font-mono">?shape={cat.slug || toSlug(cat.name)}</span>
      </div>
    </div>
  );
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [globalUploading, setGlobalUploading] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("settings")
      .select("value")
      .eq("key", SETTINGS_KEY)
      .single();

    if (data?.value) {
      try {
        const parsed = JSON.parse(data.value);
        if (Array.isArray(parsed)) {
          setCategories(parsed);
          setLoading(false);
          return;
        }
      } catch { }
    }

    setCategories([
      { id: uid(), name: "Oval", slug: "oval", image_url: "" },
      { id: uid(), name: "Rectangle", slug: "rectangle", image_url: "" },
      { id: uid(), name: "Wayfarer", slug: "wayfarer", image_url: "" },
      { id: uid(), name: "Round", slug: "round", image_url: "" },
      { id: uid(), name: "Aviator", slug: "aviator", image_url: "" },
    ]);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    setSaving(true);
    setSaveError(null);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("settings")
        .upsert({ key: SETTINGS_KEY, value: JSON.stringify(categories) }, { onConflict: "key" });
      if (error) throw new Error(error.message);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const addCategory = () => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    setCategories((prev) => [
      ...prev,
      { id: uid(), name: trimmed, slug: toSlug(trimmed), image_url: "" },
    ]);
    setNewName("");
    setShowAdd(false);
  };

  const renameCategory = (id: string, name: string) =>
    setCategories((prev) => prev.map((c) => c.id === id ? { ...c, name, slug: toSlug(name) } : c));

  const setImage = (id: string, url: string) =>
    setCategories((prev) => prev.map((c) => c.id === id ? { ...c, image_url: url } : c));

  const removeImage = (id: string) =>
    setCategories((prev) => prev.map((c) => c.id === id ? { ...c, image_url: "" } : c));

  const deleteCategory = (id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
    setDeleteConfirm(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 gap-3">
        <Loader2 size={20} className="animate-spin text-[#c8874a]" />
        <p className="text-[13px] text-white/40">Loading categories...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-bold text-white tracking-tight">Categories</h1>
          <p className="text-[13px] text-white/40 mt-0.5">
            Manage the &quot;Shop By Shape&quot; icons shown on the storefront
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={load}
            className="w-9 h-9 flex items-center justify-center rounded-sm border border-white/[0.08] bg-[#161616] hover:bg-[#202020] text-white/60 hover:text-white transition-colors"
            title="Reload from database"
          >
            <RefreshCw size={14} />
          </button>
          <button
            onClick={() => { setShowAdd(true); setNewName(""); }}
            className="inline-flex items-center gap-2 bg-[#c8874a] hover:bg-[#b87840] text-white text-[12px] font-bold px-4 py-2.5 rounded-sm transition-all shadow-lg shadow-[#c8874a]/20"
          >
            <Plus size={14} />
            Add Category
          </button>
        </div>
      </div>

      <div className="flex items-start gap-3 bg-[#181818] border border-white/[0.06] rounded-sm px-4 py-3">
        <div className="w-4 h-4 flex-shrink-0 mt-0.5 text-[#c8874a]">
          <svg viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm.75 10.5h-1.5v-5h1.5v5zm0-6.5h-1.5V3.5h1.5V5z"/>
          </svg>
        </div>
        <p className="text-[12px] text-white/45 leading-relaxed">
          Upload an icon image for each shape category. Categories without an image will show the default SVG outline icon on the storefront.{" "}
          <strong className="text-white/65">Press Save Changes after editing to publish to the storefront.</strong>
        </p>
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm">
          <div className="bg-[#141414] border border-white/[0.1] rounded-sm shadow-2xl w-full max-w-sm mx-4 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-[15px] font-bold text-white">New Category</h2>
              <button onClick={() => setShowAdd(false)} className="text-white/40 hover:text-white transition-colors">
                <X size={16} />
              </button>
            </div>
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-white/50 tracking-widest uppercase">Name</label>
              <input
                autoFocus
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") addCategory();
                  if (e.key === "Escape") setShowAdd(false);
                }}
                placeholder="e.g. Cat Eye"
                className="w-full px-3.5 py-2.5 rounded-sm border border-white/[0.08] focus:border-[#c8874a] focus:outline-none text-[13px] text-white placeholder-white/25 bg-[#1a1a1a] transition-colors"
              />
              {newName.trim() && (
                <p className="text-[10px] text-white/25 font-mono">slug: {toSlug(newName)}</p>
              )}
            </div>
            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                onClick={() => setShowAdd(false)}
                className="px-4 py-2 rounded-sm border border-white/[0.08] text-[12px] font-bold text-white/50 hover:text-white hover:border-white/20 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={addCategory}
                disabled={!newName.trim()}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-sm bg-[#c8874a] hover:bg-[#b87840] text-white text-[12px] font-bold transition-colors disabled:opacity-40"
              >
                <Plus size={13} />
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm">
          <div className="bg-[#141414] border border-red-500/25 rounded-sm shadow-2xl w-full max-w-sm mx-4 p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-sm bg-red-500/10 flex items-center justify-center flex-shrink-0">
                <Trash2 size={16} className="text-red-400" />
              </div>
              <div>
                <h2 className="text-[14px] font-bold text-white">Delete Category</h2>
                <p className="text-[12px] text-white/40 mt-0.5">
                  &quot;{categories.find((c) => c.id === deleteConfirm)?.name}&quot; will be permanently removed.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 rounded-sm border border-white/[0.08] text-[12px] font-bold text-white/50 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteCategory(deleteConfirm)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-sm bg-red-500 hover:bg-red-600 text-white text-[12px] font-bold transition-colors"
              >
                <Trash2 size={13} />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {categories.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 bg-[#111111] rounded-sm border border-white/[0.07]">
          <div className="w-14 h-14 rounded-sm bg-[#181818] border border-white/[0.06] flex items-center justify-center">
            <ImagePlus size={22} className="text-white/20" />
          </div>
          <p className="text-[14px] font-semibold text-white/30">No categories yet</p>
          <button
            onClick={() => { setShowAdd(true); setNewName(""); }}
            className="inline-flex items-center gap-2 bg-[#c8874a] hover:bg-[#b87840] text-white text-[12px] font-bold px-5 py-2.5 rounded-sm transition-all"
          >
            <Plus size={14} />
            Add your first category
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {categories.map((cat) => (
            <CategoryCard
              key={cat.id}
              cat={cat}
              onRename={renameCategory}
              onImageChange={setImage}
              onRemoveImage={removeImage}
              onDelete={(id) => setDeleteConfirm(id)}
              globalUploading={globalUploading}
              setGlobalUploading={setGlobalUploading}
            />
          ))}

          <button
            onClick={() => { setShowAdd(true); setNewName(""); }}
            className="bg-[#0d0d0d] border-2 border-dashed border-white/[0.07] rounded-sm aspect-square flex flex-col items-center justify-center gap-2 hover:border-[#c8874a]/35 hover:bg-[#111111] transition-all group/add min-h-[160px]"
          >
            <div className="w-10 h-10 rounded-sm bg-[#181818] group-hover/add:bg-[#c8874a]/10 border border-white/[0.06] group-hover/add:border-[#c8874a]/30 flex items-center justify-center transition-all">
              <Plus size={18} className="text-white/25 group-hover/add:text-[#c8874a] transition-colors" />
            </div>
            <p className="text-[11px] text-white/20 group-hover/add:text-[#c8874a]/60 transition-colors">New Category</p>
          </button>
        </div>
      )}

      <div className="sticky bottom-0 pt-2">
        <div className="bg-[#111111] border border-white/[0.07] rounded-sm px-5 py-4 flex items-center justify-between shadow-2xl shadow-black/60">
          <div>
            <p className="text-[13px] font-bold text-white">
              {categories.length} categor{categories.length === 1 ? "y" : "ies"}
            </p>
            <p className="text-[11px] text-white/30 mt-0.5">
              Save to publish changes to the storefront
            </p>
          </div>
          <div className="flex items-center gap-3">
            {saveError && (
              <p className="text-[11px] text-red-400 flex items-center gap-1">
                <AlertTriangle size={11} /> {saveError}
              </p>
            )}
            <button
              onClick={save}
              disabled={saving || saved || globalUploading}
              className={`inline-flex items-center gap-2 px-6 py-3 rounded-sm text-[13px] font-bold transition-all shadow-md ${
                saved
                  ? "bg-emerald-600 text-white shadow-emerald-900/30"
                  : "bg-[#c8874a] hover:bg-[#b87840] text-white shadow-[#c8874a]/20"
              } disabled:opacity-60`}
            >
              {saving ? (
                <><Loader2 size={14} className="animate-spin" /> Saving...</>
              ) : saved ? (
                <><CheckCircle2 size={14} /> Saved!</>
              ) : globalUploading ? (
                <><Loader2 size={14} className="animate-spin" /> Uploading...</>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}