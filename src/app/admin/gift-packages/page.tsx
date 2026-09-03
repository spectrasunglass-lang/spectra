"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Gift, Plus, Edit2, Trash2, Check, X, Loader2, Sparkles, AlertCircle, Upload, ToggleLeft, ToggleRight } from "lucide-react";
import { GiftPackage, DEFAULT_GIFT_PACKAGES } from "@/lib/giftPackages";

export default function AdminGiftPackagesPage() {
  const [packages, setPackages] = useState<GiftPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<GiftPackage | null>(null);
  const [formName, setFormName] = useState("");
  const [formPrice, setFormPrice] = useState<number>(199);
  const [formDescription, setFormDescription] = useState("");
  const [formImageUrl, setFormImageUrl] = useState("");
  const [formIsActive, setFormIsActive] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Load packages
  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/gift-packages?all=true");
      const data = await res.json();
      if (data.success && Array.isArray(data.packages)) {
        setPackages(data.packages);
      } else {
        setPackages(DEFAULT_GIFT_PACKAGES);
      }
    } catch (err) {
      console.error("Failed to load gift packages:", err);
      setPackages(DEFAULT_GIFT_PACKAGES);
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message: string, type: "success" | "error" = "success") => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback(null), 4000);
  };

  const savePackagesToDb = async (updated: GiftPackage[]) => {
    setSaving(true);
    try {
      const res = await fetch("/api/gift-packages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packages: updated }),
      });
      const data = await res.json();
      if (data.success) {
        setPackages(updated);
        showNotification("Gift packages updated successfully.");
      } else {
        showNotification(data.error || "Failed to update gift packages.", "error");
      }
    } catch (err) {
      console.error("Save error:", err);
      showNotification("Network error saving changes.", "error");
    } finally {
      setSaving(false);
    }
  };

  // Toggle active / inactive switch
  const handleToggleActive = async (id: string) => {
    const updated = packages.map((pkg) =>
      pkg.id === id ? { ...pkg, is_active: !pkg.is_active } : pkg
    );
    await savePackagesToDb(updated);
  };

  // Open modal for new package
  const handleOpenAddModal = () => {
    setEditingPackage(null);
    setFormName("");
    setFormPrice(199);
    setFormDescription("");
    setFormImageUrl("/logo/logo.png");
    setFormIsActive(true);
    setIsModalOpen(true);
  };

  // Open modal for editing
  const handleOpenEditModal = (pkg: GiftPackage) => {
    setEditingPackage(pkg);
    setFormName(pkg.name);
    setFormPrice(pkg.price);
    setFormDescription(pkg.description);
    setFormImageUrl(pkg.image_url || "/logo/logo.png");
    setFormIsActive(pkg.is_active);
    setIsModalOpen(true);
  };

  // Delete package
  const handleDeletePackage = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;
    const updated = packages.filter((pkg) => pkg.id !== id);
    await savePackagesToDb(updated);
  };

  // Upload image via Cloudinary admin endpoint
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "spectra/gift-packages");

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.url) {
        setFormImageUrl(data.url);
        showNotification("Image uploaded successfully.");
      } else {
        showNotification(data.error || "Image upload failed.", "error");
      }
    } catch (err) {
      showNotification("Failed to upload image.", "error");
    } finally {
      setUploadingImage(false);
    }
  };

  // Submit modal form
  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      showNotification("Please provide a box package name.", "error");
      return;
    }

    let updated: GiftPackage[];

    if (editingPackage) {
      // Edit existing
      updated = packages.map((pkg) =>
        pkg.id === editingPackage.id
          ? {
              ...pkg,
              name: formName.trim(),
              price: Number(formPrice) || 0,
              description: formDescription.trim(),
              image_url: formImageUrl.trim() || "/logo/logo.png",
              is_active: formIsActive,
            }
          : pkg
      );
    } else {
      // Add new
      const newPkg: GiftPackage = {
        id: `gift_${Date.now().toString().slice(-6)}`,
        name: formName.trim(),
        price: Number(formPrice) || 0,
        description: formDescription.trim(),
        image_url: formImageUrl.trim() || "/logo/logo.png",
        is_active: formIsActive,
        created_at: new Date().toISOString(),
      };
      updated = [newPkg, ...packages];
    }

    await savePackagesToDb(updated);
    setIsModalOpen(false);
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/[0.08] pb-6">
        <div>
          <div className="flex items-center gap-2 text-[#c8874a] text-xs font-bold uppercase tracking-[0.2em] mb-1">
            <Gift size={14} /> Luxury Packaging Management
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold uppercase tracking-tight text-white">
            Gift Packages
          </h1>
          <p className="text-neutral-400 text-xs sm:text-sm mt-1">
            Create and configure custom luxury gift boxes shown to customers on all product pages.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center gap-2 bg-[#c8874a] hover:bg-[#b87840] text-white px-4 py-2.5 rounded-sm text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-[#c8874a]/20 cursor-pointer self-start sm:self-auto"
        >
          <Plus size={16} /> Add Gift Package
        </button>
      </div>

      {/* Notification banner */}
      {feedback && (
        <div
          className={`flex items-center gap-2 px-4 py-3 rounded-md text-xs font-semibold ${
            feedback.type === "success"
              ? "bg-emerald-900/30 border border-emerald-500/30 text-emerald-300"
              : "bg-red-900/30 border border-red-500/30 text-red-300"
          }`}
        >
          {feedback.type === "success" ? <Check size={16} /> : <AlertCircle size={16} />}
          {feedback.message}
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 text-neutral-400 gap-3">
          <Loader2 className="animate-spin text-[#c8874a]" size={32} />
          <p className="text-xs uppercase tracking-widest font-semibold">Loading Gift Packages...</p>
        </div>
      ) : packages.length === 0 ? (
        <div className="text-center py-20 bg-[#121212] border border-white/[0.06] rounded-2xl p-8 space-y-4">
          <div className="w-16 h-16 rounded-full bg-[#181818] flex items-center justify-center mx-auto text-[#c8874a]">
            <Gift size={28} />
          </div>
          <h3 className="text-lg font-bold text-white uppercase">No Gift Packages Created Yet</h3>
          <p className="text-neutral-400 text-xs max-w-md mx-auto">
            Add your first custom luxury packaging option. Enabled boxes will immediately appear in the gift selector on all product pages.
          </p>
          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-2 bg-[#c8874a] hover:bg-[#b87840] text-white px-5 py-2.5 rounded-sm text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-[#c8874a]/20 cursor-pointer"
          >
            <Plus size={15} /> Create First Box
          </button>
        </div>
      ) : (
        /* Package Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className={`relative bg-[#121212] border rounded-xl overflow-hidden transition-all flex flex-col justify-between ${
                pkg.is_active
                  ? "border-white/[0.1] shadow-lg shadow-black/40 hover:border-[#c8874a]/50"
                  : "border-white/[0.04] opacity-60 hover:opacity-90"
              }`}
            >
              {/* Card Header & Status Badge */}
              <div className="p-5 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-[#181818] border border-white/[0.08] flex items-center justify-center flex-shrink-0 overflow-hidden relative">
                      {pkg.image_url ? (
                        <Image
                          src={pkg.image_url}
                          alt={pkg.name}
                          width={48}
                          height={48}
                          className="object-contain p-1 brightness-0 invert"
                        />
                      ) : (
                        <Gift size={20} className="text-[#c8874a]" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white leading-snug">{pkg.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm font-black text-[#c8874a]">
                          {pkg.price === 0 ? "FREE" : `₹${pkg.price.toLocaleString("en-IN")}`}
                        </span>
                        <span className="text-[10px] text-neutral-500 uppercase tracking-widest font-semibold">
                          per box
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Active / Inactive Pill */}
                  <span
                    className={`text-[9.5px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border ${
                      pkg.is_active
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                        : "bg-neutral-800 border-neutral-700 text-neutral-400"
                    }`}
                  >
                    {pkg.is_active ? "Enabled" : "Disabled"}
                  </span>
                </div>

                {/* Description */}
                <p className="text-neutral-400 text-xs leading-relaxed line-clamp-3">
                  {pkg.description || "Luxury presentation box for sunglasses."}
                </p>
              </div>

              {/* Card Footer Actions */}
              <div className="bg-[#161616] border-t border-white/[0.06] px-5 py-3 flex items-center justify-between">
                {/* 1-Click Toggle Switch */}
                <button
                  type="button"
                  onClick={() => handleToggleActive(pkg.id)}
                  disabled={saving}
                  className={`flex items-center gap-1.5 text-xs font-semibold cursor-pointer transition-colors ${
                    pkg.is_active
                      ? "text-emerald-400 hover:text-emerald-300"
                      : "text-neutral-400 hover:text-neutral-200"
                  }`}
                  title={pkg.is_active ? "Click to Disable" : "Click to Enable"}
                >
                  {pkg.is_active ? (
                    <>
                      <ToggleRight size={22} className="text-emerald-400" />
                      <span className="text-[11px]">Active</span>
                    </>
                  ) : (
                    <>
                      <ToggleLeft size={22} className="text-neutral-500" />
                      <span className="text-[11px]">Inactive</span>
                    </>
                  )}
                </button>

                {/* Edit & Delete Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEditModal(pkg)}
                    className="p-1.5 rounded-md hover:bg-white/[0.08] text-neutral-400 hover:text-white transition-colors cursor-pointer"
                    title="Edit Package"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => handleDeletePackage(pkg.id, pkg.name)}
                    className="p-1.5 rounded-md hover:bg-red-500/15 text-neutral-400 hover:text-red-400 transition-colors cursor-pointer"
                    title="Delete Package"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Add / Edit Gift Package */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#121212] border border-white/[0.1] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/[0.08] px-6 py-4">
              <div className="flex items-center gap-2 text-white font-bold text-sm uppercase tracking-wider">
                <Gift size={16} className="text-[#c8874a]" />
                {editingPackage ? "Edit Gift Package" : "New Gift Package"}
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-neutral-400 hover:text-white transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveModal} className="p-6 space-y-4">
              <div>
                <label className="block text-[11px] font-bold tracking-wider uppercase text-neutral-300 mb-1.5">
                  Package / Box Name *
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Royal Velvet Presentation Casket"
                  required
                  className="w-full bg-[#181818] border border-white/[0.08] rounded-md px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#c8874a] transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold tracking-wider uppercase text-neutral-300 mb-1.5">
                  Additional Price (₹) *
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={formPrice}
                  onChange={(e) => setFormPrice(Number(e.target.value))}
                  placeholder="e.g. 199 (0 for free)"
                  required
                  className="w-full bg-[#181818] border border-white/[0.08] rounded-md px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#c8874a] transition-colors"
                />
                <span className="text-[10px] text-neutral-500 mt-1 block">
                  Amount added to product price at checkout when this box is selected.
                </span>
              </div>

              <div>
                <label className="block text-[11px] font-bold tracking-wider uppercase text-neutral-300 mb-1.5">
                  Description / Inclusions
                </label>
                <textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  rows={3}
                  placeholder="e.g. Includes gold-debossed hard box, velvet cleaning cloth, and gift card."
                  className="w-full bg-[#181818] border border-white/[0.08] rounded-md px-3.5 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#c8874a] transition-colors resize-none"
                />
              </div>

              {/* Image Upload / URL */}
              <div>
                <label className="block text-[11px] font-bold tracking-wider uppercase text-neutral-300 mb-1.5">
                  Packaging Image
                </label>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-[#181818] border border-white/[0.08] flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {formImageUrl ? (
                      <Image
                        src={formImageUrl}
                        alt="Preview"
                        width={48}
                        height={48}
                        className="object-contain p-1 brightness-0 invert"
                      />
                    ) : (
                      <Gift size={20} className="text-neutral-500" />
                    )}
                  </div>
                  <label className="flex-1 cursor-pointer bg-[#181818] hover:bg-[#222222] border border-white/[0.08] rounded-md px-3 py-2 text-xs text-neutral-300 flex items-center justify-center gap-2 transition-colors">
                    {uploadingImage ? (
                      <>
                        <Loader2 size={14} className="animate-spin text-[#c8874a]" />
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <>
                        <Upload size={14} className="text-[#c8874a]" />
                        <span>Upload Photo</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Status Toggle */}
              <div className="pt-2 flex items-center justify-between border-t border-white/[0.06]">
                <span className="text-xs font-semibold text-neutral-300">
                  Enable on Storefront
                </span>
                <button
                  type="button"
                  onClick={() => setFormIsActive(!formIsActive)}
                  className="cursor-pointer"
                >
                  {formIsActive ? (
                    <ToggleRight size={26} className="text-emerald-400" />
                  ) : (
                    <ToggleLeft size={26} className="text-neutral-500" />
                  )}
                </button>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-sm text-xs font-bold text-neutral-400 hover:text-white uppercase transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 bg-[#c8874a] hover:bg-[#b87840] text-white rounded-sm text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-md shadow-[#c8874a]/20 cursor-pointer disabled:opacity-50"
                >
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                  {editingPackage ? "Save Changes" : "Create Package"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
