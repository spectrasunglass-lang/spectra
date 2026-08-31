"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { SpotlightCard, SpotlightHeading } from "@/types/campaign";
import ImageUpload from "@/components/admin/ImageUpload";
import {
  Plus,
  Trash2,
  Edit3,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  RefreshCw,
  X,
  Layers,
  HelpCircle,
  ChevronDown,
  Check,
} from "lucide-react";

const DEFAULT_HEADING: SpotlightHeading = {
  title: "Curated Drops & Stories",
  subtitle: "Explore signature handcrafted silhouettes captured in our latest visual concepts.",
};

export default function CampaignsAdminPage() {
  const [cards, setCards] = useState<SpotlightCard[]>([]);
  const [heading, setHeading] = useState<SpotlightHeading>(DEFAULT_HEADING);
  const [products, setProducts] = useState<{ id: string; name: string; slug: string; category?: string }[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [productOpen, setProductOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Editor Modal / Drawer state
  const [editingCard, setEditingCard] = useState<SpotlightCard | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Load data from Supabase settings & products
  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      
      const [{ data: settingsData }, { data: productsData }] = await Promise.all([
        supabase
          .from("settings")
          .select("key, value")
          .in("key", ["spotlight_stories", "spotlight_heading"]),
        supabase
          .from("products")
          .select("id, name, slug, category")
          .eq("status", "active")
          .order("name", { ascending: true }),
      ]);

      if (settingsData) {
        settingsData.forEach((row) => {
          if (row.key === "spotlight_stories" && row.value) {
            try {
              const parsed = JSON.parse(row.value);
              if (Array.isArray(parsed)) {
                setCards(parsed);
              }
            } catch (e) {
              console.error("Failed to parse spotlight_stories", e);
            }
          }
          if (row.key === "spotlight_heading" && row.value) {
            try {
              const parsed = JSON.parse(row.value);
              setHeading((prev) => ({ ...prev, ...parsed }));
            } catch (e) {
              console.error("Failed to parse spotlight_heading", e);
            }
          }
        });
      }

      if (productsData) {
        setProducts(productsData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load campaign stories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Save changes to Supabase
  const handleSave = async (updatedCards: SpotlightCard[] = cards, updatedHeading: SpotlightHeading = heading) => {
    setSaving(true);
    setError(null);
    try {
      const supabase = createClient();
      const payload = [
        { key: "spotlight_stories", value: JSON.stringify(updatedCards) },
        { key: "spotlight_heading", value: JSON.stringify(updatedHeading) },
      ];

      const { error: dbError } = await supabase
        .from("settings")
        .upsert(payload, { onConflict: "key" });

      if (dbError) throw new Error(dbError.message);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCategoryOpen(false);
    setProductOpen(false);
    setEditingCard(null);
  };

  // Open modal to add a new card
  const handleAddNew = () => {
    const newCard: SpotlightCard = {
      id: "card_" + Date.now(),
      title: "",
      subtitle: "NEW ARRIVAL",
      image_url: "",
      link_url: "/sunglasses",
      active: true,
      order: cards.length + 1,
    };
    setSelectedCategory("all");
    setCategoryOpen(false);
    setProductOpen(false);
    setEditingCard(newCard);
    setIsModalOpen(true);
  };

  // Open modal to edit existing card
  const handleEdit = (card: SpotlightCard) => {
    setSelectedCategory("all");
    setCategoryOpen(false);
    setProductOpen(false);
    setEditingCard({ ...card });
    setIsModalOpen(true);
  };

  // Save current card in modal
  const handleSaveModalCard = () => {
    if (!editingCard) return;
    if (!editingCard.title.trim()) {
      setError("Please provide a Title for the campaign card.");
      return;
    }
    if (!editingCard.image_url) {
      setError("Please upload or provide an image for the campaign card.");
      return;
    }

    const index = cards.findIndex((c) => c.id === editingCard.id);
    let updated: SpotlightCard[];
    if (index >= 0) {
      updated = [...cards];
      updated[index] = editingCard;
    } else {
      updated = [...cards, editingCard];
    }
    setCards(updated);
    closeModal();
    handleSave(updated, heading);
  };

  // Delete card
  const handleDelete = (id: string) => {
    if (!window.confirm("Are you sure you want to delete this campaign card?")) return;
    const updated = cards.filter((c) => c.id !== id);
    setCards(updated);
    handleSave(updated, heading);
  };

  // Toggle active status
  const handleToggleActive = (id: string) => {
    const updated = cards.map((c) =>
      c.id === id ? { ...c, active: !c.active } : c
    );
    setCards(updated);
    handleSave(updated, heading);
  };

  // Reorder cards
  const handleMove = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= cards.length) return;
    const updated = [...cards];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    // Update order values
    updated.forEach((c, idx) => {
      c.order = idx + 1;
    });
    setCards(updated);
    handleSave(updated, heading);
  };

  // Derive unique categories from products
  const categories = Array.from(
    new Set(products.map((p) => (p.category ? p.category.toLowerCase() : "sunglasses")).filter(Boolean))
  );

  // Filter products by selected category
  const filteredProducts =
    selectedCategory === "all"
      ? products
      : products.filter(
          (p) => (p.category ? p.category.toLowerCase() : "sunglasses") === selectedCategory.toLowerCase()
        );

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-[22px] font-bold text-white tracking-tight">
              Campaigns & Spotlight Stories
            </h1>
            <span className="text-[10px] font-bold tracking-widest uppercase bg-[#c8874a]/15 text-[#c8874a] px-2.5 py-0.5 rounded-sm border border-[#c8874a]/30">
              Editorial Cards
            </span>
          </div>
          <p className="text-[13px] text-white/40 mt-1">
            Manage tall portrait cards displayed in the storefront Spotlight section with custom imagery, stylized typography & links.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={loadData}
            className="w-9 h-9 flex items-center justify-center rounded-sm border border-white/[0.08] bg-[#161616] hover:bg-[#202020] text-white/60 hover:text-white transition-colors flex-shrink-0"
            title="Refresh"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>

          <button
            onClick={handleAddNew}
            className="h-9 inline-flex items-center gap-1.5 px-4 rounded-sm text-[12px] font-bold bg-[#c8874a] hover:bg-[#b87840] text-white transition-all shadow-md shadow-[#c8874a]/20 cursor-pointer whitespace-nowrap flex-shrink-0"
          >
            <Plus size={14} />
            Add Campaign Card
          </button>

          <button
            onClick={() => handleSave(cards, heading)}
            disabled={saving || saved}
            className={`h-9 inline-flex items-center gap-1.5 px-4 rounded-sm text-[12px] font-bold transition-all duration-200 shadow-md whitespace-nowrap flex-shrink-0 ${
              saved
                ? "bg-emerald-600 text-white"
                : "bg-[#1f1f1f] hover:bg-[#282828] text-white border border-white/[0.1]"
            } disabled:opacity-70 cursor-pointer`}
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

      {/* Error alert */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-sm px-4 py-3 text-[12px] text-red-400 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-400/60 hover:text-red-400">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Section Header Customization Settings */}
      <div className="bg-[#111111] rounded-sm border border-white/[0.07] p-6 space-y-4 shadow-xl shadow-black/40">
        <div className="border-b border-white/[0.06] pb-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Layers size={16} className="text-[#c8874a]" />
            <h3 className="text-[15px] font-bold text-white">Section Heading & Labels</h3>
          </div>
          <span className="text-[11px] text-white/35">Storefront Section Settings</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-white/50 mb-1.5">
              Section Title
            </label>
            <input
              type="text"
              value={heading.title || ""}
              onChange={(e) => setHeading((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="Curated Drops & Stories"
              className="w-full bg-[#181818] border border-white/[0.08] focus:border-[#c8874a] rounded-sm px-3.5 py-2 text-[13px] text-white outline-none transition-colors"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-white/50 mb-1.5">
              Section Description
            </label>
            <input
              type="text"
              value={heading.subtitle || ""}
              onChange={(e) => setHeading((prev) => ({ ...prev, subtitle: e.target.value }))}
              placeholder="Explore signature handcrafted silhouettes..."
              className="w-full bg-[#181818] border border-white/[0.08] focus:border-[#c8874a] rounded-sm px-3.5 py-2 text-[13px] text-white outline-none transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Campaign Cards List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-[16px] font-bold text-white">
              Active Cards ({cards.filter((c) => c.active).length} of {cards.length})
            </h3>
            <p className="text-[12px] text-white/40 mt-0.5">
              Cards are displayed as a smooth horizontal scrollable row on the storefront (supports 8+ items)
            </p>
          </div>
          {cards.length > 0 && (
            <button
              onClick={handleAddNew}
              className="text-[12px] font-bold text-[#c8874a] hover:text-[#d8975a] flex items-center gap-1.5 transition-colors"
            >
              <Plus size={14} /> Add Another Card
            </button>
          )}
        </div>

        {loading ? (
          <div className="bg-[#111111] rounded-sm border border-white/[0.07] flex items-center justify-center py-20 gap-3">
            <Loader2 size={20} className="animate-spin text-[#c8874a]" />
            <p className="text-[13px] text-white/40">Loading campaign cards...</p>
          </div>
        ) : cards.length === 0 ? (
          <div className="bg-[#111111] rounded-sm border border-dashed border-white/[0.12] p-12 text-center space-y-4">
            <div className="w-14 h-14 rounded-sm bg-[#1a1a1a] border border-white/[0.08] flex items-center justify-center mx-auto text-[#c8874a]">
              <Sparkles size={24} />
            </div>
            <div>
              <h4 className="text-[16px] font-bold text-white">No Campaign Cards Created Yet</h4>
              <p className="text-[12.5px] text-white/40 max-w-md mx-auto mt-1">
                Create editorial story cards with portrait images, custom stylized titles (e.g. STRATOS, HAWK, MAJOR), and destination links.
              </p>
            </div>
            <button
              onClick={handleAddNew}
              className="btn-gold inline-flex items-center gap-2 rounded-sm text-[12px] shadow-lg shadow-[#c8874a]/25"
            >
              <Plus size={14} /> Create First Campaign Card
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {cards.map((card, idx) => (
              <div
                key={card.id}
                className={`bg-[#141414] border rounded-sm p-4 flex flex-col justify-between space-y-4 transition-all duration-200 group relative ${
                  card.active
                    ? "border-white/[0.08] hover:border-white/[0.18] shadow-lg shadow-black/50"
                    : "border-white/[0.04] opacity-60 hover:opacity-100"
                }`}
              >
                {/* Visual Card Preview */}
                <div className="relative aspect-[9/14] w-full bg-[#181818] rounded-sm overflow-hidden border border-white/[0.08]">
                  {card.image_url ? (
                    <Image
                      src={card.image_url}
                      alt={card.title || "Campaign"}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/20 text-[12px]">
                      No Image
                    </div>
                  )}

                  {/* Typography Overlay (if title provided) */}
                  {card.title && (
                    <div className="absolute top-4 left-0 right-0 px-3 text-center pointer-events-none">
                      <h4 className="font-extrabold text-white text-[15px] tracking-[0.18em] uppercase font-stencil drop-shadow-md truncate">
                        {card.title}
                      </h4>
                      {card.subtitle && (
                        <p className="text-[9px] font-bold text-white/90 tracking-[0.25em] uppercase mt-0.5 drop-shadow truncate">
                          {card.subtitle}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Status Tag */}
                  <div className="absolute bottom-3 left-3">
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider ${
                        card.active
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : "bg-white/10 text-white/50 border border-white/10"
                      }`}
                    >
                      {card.active ? "Active" : "Draft"}
                    </span>
                  </div>

                  {/* Order Index */}
                  <div className="absolute bottom-3 right-3 text-[10px] font-bold text-white/60 bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded-sm">
                    #{idx + 1}
                  </div>
                </div>

                {/* Card Details & Actions */}
                <div className="space-y-3 pt-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <div className="truncate max-w-[150px]">
                      <span className="text-white/40 block text-[9.5px] uppercase font-bold tracking-wider">
                        Destination Link
                      </span>
                      <span className="text-white font-medium truncate block">
                        {card.link_url || "/sunglasses"}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleMove(idx, "up")}
                        disabled={idx === 0}
                        title="Move Up"
                        className="w-7 h-7 rounded-sm bg-white/[0.04] hover:bg-white/[0.1] text-white/60 hover:text-white flex items-center justify-center disabled:opacity-20 disabled:pointer-events-none transition-colors"
                      >
                        <ArrowUp size={12} />
                      </button>
                      <button
                        onClick={() => handleMove(idx, "down")}
                        disabled={idx === cards.length - 1}
                        title="Move Down"
                        className="w-7 h-7 rounded-sm bg-white/[0.04] hover:bg-white/[0.1] text-white/60 hover:text-white flex items-center justify-center disabled:opacity-20 disabled:pointer-events-none transition-colors"
                      >
                        <ArrowDown size={12} />
                      </button>
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="grid grid-cols-3 gap-2 pt-1 border-t border-white/[0.06]">
                    <button
                      onClick={() => handleToggleActive(card.id)}
                      className="py-1.5 rounded-sm bg-white/[0.04] hover:bg-white/[0.08] text-white/70 hover:text-white text-[11px] font-bold flex items-center justify-center gap-1 transition-colors"
                      title={card.active ? "Set to Draft" : "Set to Active"}
                    >
                      {card.active ? <EyeOff size={12} /> : <Eye size={12} />}
                      <span>{card.active ? "Hide" : "Show"}</span>
                    </button>

                    <button
                      onClick={() => handleEdit(card)}
                      className="py-1.5 rounded-sm bg-[#c8874a]/15 hover:bg-[#c8874a]/25 text-[#c8874a] text-[11px] font-bold flex items-center justify-center gap-1 transition-colors"
                    >
                      <Edit3 size={12} />
                      <span>Edit</span>
                    </button>

                    <button
                      onClick={() => handleDelete(card.id)}
                      className="py-1.5 rounded-sm bg-red-500/10 hover:bg-red-500/20 text-red-400 text-[11px] font-bold flex items-center justify-center gap-1 transition-colors"
                    >
                      <Trash2 size={12} />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add / Edit Card Modal */}
      {isModalOpen && editingCard && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#141414] border border-white/[0.1] rounded-sm w-full max-w-2xl max-h-[90vh] overflow-y-auto no-scrollbar p-6 sm:p-8 space-y-6 shadow-2xl shadow-black relative animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
              <div>
                <h3 className="text-[18px] font-bold text-white">
                  {cards.some((c) => c.id === editingCard.id)
                    ? "Edit Campaign Card"
                    : "New Campaign Card"}
                </h3>
                <p className="text-[12px] text-white/40 mt-0.5">
                  Configure imagery, overlay title, subtitle, and destination URL
                </p>
              </div>
              <button
                onClick={closeModal}
                className="w-8 h-8 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-white/60 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column: Image Upload & Preview */}
              <div className="space-y-4">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-white/60">
                  Card Portrait Image * (Aspect ~9:15)
                </label>

                {editingCard.image_url ? (
                  <div className="relative aspect-[9/14] w-full bg-[#181818] rounded-sm overflow-hidden border border-white/[0.1] shadow-lg group">
                    <Image
                      src={editingCard.image_url}
                      alt="Preview"
                      fill
                      className="object-cover"
                    />
                    
                    {/* Live text overlay in preview */}
                    {editingCard.title && (
                      <div className="absolute top-5 left-0 right-0 px-4 text-center pointer-events-none">
                        <h4 className="font-extrabold text-white text-[17px] tracking-[0.18em] uppercase font-stencil drop-shadow-md">
                          {editingCard.title}
                        </h4>
                        {editingCard.subtitle && (
                          <p className="text-[10px] font-bold text-white/90 tracking-[0.25em] uppercase mt-1 drop-shadow">
                            {editingCard.subtitle}
                          </p>
                        )}
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => setEditingCard((prev) => prev ? { ...prev, image_url: "" } : null)}
                      className="absolute bottom-3 right-3 bg-red-500 hover:bg-red-600 text-white text-[10px] font-bold px-2.5 py-1.5 rounded-sm flex items-center gap-1 transition-colors shadow-md"
                    >
                      <Trash2 size={11} /> Remove
                    </button>
                  </div>
                ) : (
                  <ImageUpload
                    value={editingCard.image_url}
                    onChange={(url) => setEditingCard((prev) => prev ? { ...prev, image_url: url } : null)}
                    label="Upload Portrait Image"
                    folder="spectra/campaigns"
                  />
                )}

                <div>
                  <label className="block text-[10px] font-semibold text-white/40 mb-1">
                    Or enter direct image URL
                  </label>
                  <input
                    type="url"
                    value={editingCard.image_url || ""}
                    onChange={(e) =>
                      setEditingCard((prev) => prev ? { ...prev, image_url: e.target.value } : null)
                    }
                    placeholder="https://images.unsplash.com/..."
                    className="w-full bg-[#181818] border border-white/[0.08] focus:border-[#c8874a] rounded-sm px-3 py-1.5 text-[11px] text-white outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Right Column: Title, Subtitle, Link & Status */}
              <div className="space-y-4 flex flex-col justify-between">
                <div className="space-y-4">
                  {/* Title */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-white/60 mb-1.5">
                      Card Title * (e.g. STRATOS, HAWK, MAJOR)
                    </label>
                    <input
                      type="text"
                      value={editingCard.title}
                      onChange={(e) =>
                        setEditingCard((prev) => prev ? { ...prev, title: e.target.value } : null)
                      }
                      placeholder="e.g. STRATOS"
                      className="w-full bg-[#181818] border border-white/[0.08] focus:border-[#c8874a] rounded-sm px-3.5 py-2.5 text-[13px] text-white outline-none transition-colors uppercase font-bold"
                    />
                  </div>

                  {/* Subtitle */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-white/60 mb-1.5">
                      Card Subtitle / Tagline (e.g. NEW ARRIVAL)
                    </label>
                    <input
                      type="text"
                      value={editingCard.subtitle || ""}
                      onChange={(e) =>
                        setEditingCard((prev) => prev ? { ...prev, subtitle: e.target.value } : null)
                      }
                      placeholder="e.g. NEW ARRIVAL or SAGE GREEN RIMLESS"
                      className="w-full bg-[#181818] border border-white/[0.08] focus:border-[#c8874a] rounded-sm px-3.5 py-2.5 text-[13px] text-white outline-none transition-colors"
                    />
                  </div>

                  {/* Destination Product */}
                  <div className="space-y-3 bg-[#181818] border border-white/[0.08] rounded-sm p-3.5">
                    <div className="flex items-center justify-between">
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-white/70">
                        Select Linked Product
                      </label>
                      <span className="text-[10px] text-[#c8874a] font-semibold">
                        {filteredProducts.length} product{filteredProducts.length === 1 ? "" : "s"}
                      </span>
                    </div>

                    {/* 1. Category Selector (Top) */}
                    <div className="relative">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-white/40 mb-1.5">
                        1. Select Category
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setCategoryOpen((prev) => !prev);
                          setProductOpen(false);
                        }}
                        className={`w-full bg-[#121212] border rounded-sm px-3.5 py-2.5 text-[12.5px] text-white flex items-center justify-between transition-all cursor-pointer ${
                          categoryOpen
                            ? "border-[#c8874a] ring-1 ring-[#c8874a]/40 bg-[#161616]"
                            : "border-white/[0.08] hover:border-white/[0.2]"
                        }`}
                      >
                        <span className="font-medium capitalize">
                          {selectedCategory === "all"
                            ? `All Categories (${products.length})`
                            : `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} (${
                                products.filter(
                                  (p) =>
                                    (p.category ? p.category.toLowerCase() : "sunglasses") ===
                                    selectedCategory.toLowerCase()
                                ).length
                              })`}
                        </span>
                        <ChevronDown
                          size={14}
                          className={`text-white/40 transition-transform duration-200 ${
                            categoryOpen ? "rotate-180 text-[#c8874a]" : ""
                          }`}
                        />
                      </button>

                      {/* Custom Category Dropdown Menu */}
                      {categoryOpen && (
                        <div className="absolute top-full left-0 right-0 mt-1 z-30 bg-[#161616] border border-white/[0.12] rounded-sm shadow-2xl overflow-hidden py-1 max-h-52 overflow-y-auto no-scrollbar">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedCategory("all");
                              setCategoryOpen(false);
                            }}
                            className={`w-full px-3.5 py-2 text-left text-[12px] flex items-center justify-between transition-colors cursor-pointer ${
                              selectedCategory === "all"
                                ? "bg-[#c8874a]/15 text-[#c8874a] font-bold"
                                : "text-white/80 hover:bg-white/[0.06] hover:text-white"
                            }`}
                          >
                            <span>All Categories</span>
                            <span className="text-[10px] opacity-60">({products.length})</span>
                          </button>
                          {categories.map((cat) => {
                            const count = products.filter(
                              (p) => (p.category ? p.category.toLowerCase() : "sunglasses") === cat
                            ).length;
                            const isSelected = selectedCategory.toLowerCase() === cat.toLowerCase();
                            return (
                              <button
                                key={cat}
                                type="button"
                                onClick={() => {
                                  setSelectedCategory(cat);
                                  setCategoryOpen(false);
                                }}
                                className={`w-full px-3.5 py-2 text-left text-[12px] flex items-center justify-between capitalize transition-colors cursor-pointer ${
                                  isSelected
                                    ? "bg-[#c8874a]/15 text-[#c8874a] font-bold"
                                    : "text-white/80 hover:bg-white/[0.06] hover:text-white"
                                }`}
                              >
                                <span>{cat.charAt(0).toUpperCase() + cat.slice(1)}</span>
                                <span className="text-[10px] opacity-60">({count})</span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* 2. Product Selector (Bottom) */}
                    <div className="relative">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-white/40 mb-1.5">
                        2. Select Product
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setProductOpen((prev) => !prev);
                          setCategoryOpen(false);
                        }}
                        className={`w-full bg-[#121212] border rounded-sm px-3.5 py-2.5 text-[12.5px] text-white flex items-center justify-between transition-all cursor-pointer ${
                          productOpen
                            ? "border-[#c8874a] ring-1 ring-[#c8874a]/40 bg-[#161616]"
                            : "border-white/[0.08] hover:border-white/[0.2]"
                        }`}
                      >
                        <span className="font-medium truncate">
                          {(() => {
                            const slug = editingCard.link_url?.startsWith("/products/")
                              ? editingCard.link_url.replace("/products/", "")
                              : "";
                            const found = products.find((p) => p.slug === slug);
                            return found ? found.name : "-- Choose a product --";
                          })()}
                        </span>
                        <ChevronDown
                          size={14}
                          className={`text-white/40 transition-transform duration-200 flex-shrink-0 ${
                            productOpen ? "rotate-180 text-[#c8874a]" : ""
                          }`}
                        />
                      </button>

                      {/* Custom Product Dropdown Menu */}
                      {productOpen && (
                        <div className="absolute top-full left-0 right-0 mt-1 z-30 bg-[#161616] border border-white/[0.12] rounded-sm shadow-2xl overflow-hidden py-1 max-h-56 overflow-y-auto no-scrollbar">
                          {filteredProducts.length === 0 ? (
                            <div className="px-3.5 py-3 text-center text-[11.5px] text-white/40">
                              No products found in this category
                            </div>
                          ) : (
                            filteredProducts.map((p) => {
                              const currentSlug = editingCard.link_url?.startsWith("/products/")
                                ? editingCard.link_url.replace("/products/", "")
                                : "";
                              const isSelected = currentSlug === p.slug;
                              return (
                                <button
                                  key={p.slug}
                                  type="button"
                                  onClick={() => {
                                    setEditingCard((prev) => {
                                      if (!prev) return null;
                                      return {
                                        ...prev,
                                        link_url: `/products/${p.slug}`,
                                        title: prev.title || p.name,
                                      };
                                    });
                                    setProductOpen(false);
                                  }}
                                  className={`w-full px-3.5 py-2.5 text-left text-[12px] flex items-center justify-between transition-colors cursor-pointer ${
                                    isSelected
                                      ? "bg-[#c8874a]/15 text-[#c8874a] font-bold"
                                      : "text-white/80 hover:bg-white/[0.06] hover:text-white"
                                  }`}
                                >
                                  <div className="flex items-center gap-2 truncate">
                                    <span className="truncate">{p.name}</span>
                                    {p.category && (
                                      <span className="text-[9.5px] font-medium text-white/40 uppercase bg-white/[0.05] px-1.5 py-0.5 rounded-sm">
                                        {p.category}
                                      </span>
                                    )}
                                  </div>
                                  {isSelected && <Check size={13} className="text-[#c8874a] flex-shrink-0" />}
                                </button>
                              );
                            })
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Active Toggle */}
                  <div className="flex items-center justify-between p-3 rounded-sm bg-white/[0.03] border border-white/[0.06]">
                    <div>
                      <span className="text-[12px] font-bold text-white block">Active on Storefront</span>
                      <span className="text-[10px] text-white/40">Visible to all visitors</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={editingCard.active}
                      onChange={(e) =>
                        setEditingCard((prev) => prev ? { ...prev, active: e.target.checked } : null)
                      }
                      className="w-4 h-4 accent-[#c8874a] cursor-pointer"
                    />
                  </div>
                </div>

                {/* Modal Footer Actions */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/[0.08]">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 rounded-sm text-[12px] font-bold text-white/60 hover:text-white transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveModalCard}
                    className="btn-gold rounded-sm text-[12px] shadow-lg shadow-[#c8874a]/20"
                  >
                    Save Card
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
