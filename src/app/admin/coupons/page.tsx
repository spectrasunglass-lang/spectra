"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Tag,
  Plus,
  Search,
  RefreshCw,
  Trash2,
  Edit2,
  Copy,
  Check,
  Calendar,
  AlertCircle,
  X,
  Sparkles,
  Percent,
  IndianRupee,
  Clock,
  CheckCircle2,
  ToggleLeft,
  ToggleRight,
  TrendingUp,
} from "lucide-react";
import { Coupon } from "@/lib/coupons";

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [saving, setSaving] = useState(false);

  // Form Fields
  const [formCode, setFormCode] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formDiscountType, setFormDiscountType] = useState<"percentage" | "fixed">("percentage");
  const [formDiscountValue, setFormDiscountValue] = useState<string>("10");
  const [formMinOrderValue, setFormMinOrderValue] = useState<string>("999");
  const [formMaxDiscountAmount, setFormMaxDiscountAmount] = useState<string>("");
  const [formValidFrom, setFormValidFrom] = useState<string>("");
  const [formExpiresAt, setFormExpiresAt] = useState<string>("");
  const [formHasExpiry, setFormHasExpiry] = useState<boolean>(false);
  const [formUsageLimit, setFormUsageLimit] = useState<string>("");
  const [formHasUsageLimit, setFormHasUsageLimit] = useState<boolean>(false);
  const [formIsActive, setFormIsActive] = useState<boolean>(true);

  const fetchCoupons = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/coupons");
      const data = await res.json();
      if (data.success && Array.isArray(data.coupons)) {
        setCoupons(data.coupons);
      }
    } catch (err) {
      console.error("Failed to load coupons:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  const showNotification = (message: string, type: "success" | "error" = "success") => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback(null), 4000);
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingCoupon(null);
    setFormCode("");
    setFormDescription("");
    setFormDiscountType("percentage");
    setFormDiscountValue("15");
    setFormMinOrderValue("999");
    setFormMaxDiscountAmount("");
    const todayStr = new Date().toISOString().split("T")[0];
    setFormValidFrom(todayStr);
    setFormExpiresAt("");
    setFormHasExpiry(false);
    setFormUsageLimit("");
    setFormHasUsageLimit(false);
    setFormIsActive(true);
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setFormCode(coupon.code);
    setFormDescription(coupon.description || "");
    setFormDiscountType(coupon.discount_type);
    setFormDiscountValue(String(coupon.discount_value));
    setFormMinOrderValue(String(coupon.min_order_value || 0));
    setFormMaxDiscountAmount(coupon.max_discount_amount ? String(coupon.max_discount_amount) : "");
    setFormValidFrom(coupon.valid_from ? coupon.valid_from.split("T")[0] : "");
    setFormExpiresAt(coupon.expires_at ? coupon.expires_at.split("T")[0] : "");
    setFormHasExpiry(Boolean(coupon.expires_at));
    setFormUsageLimit(coupon.usage_limit ? String(coupon.usage_limit) : "");
    setFormHasUsageLimit(Boolean(coupon.usage_limit));
    setFormIsActive(coupon.is_active);
    setIsModalOpen(true);
  };

  // Generate a random branded coupon code
  const handleGenerateCode = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let rand = "";
    for (let i = 0; i < 6; i++) {
      rand += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormCode(`SPECTRA-${rand}`);
  };

  // Save Coupon (Create or Update)
  const handleSaveCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCode.trim()) {
      showNotification("Please enter a valid coupon code.", "error");
      return;
    }

    const val = parseFloat(formDiscountValue);
    if (isNaN(val) || val <= 0) {
      showNotification("Please enter a valid discount value.", "error");
      return;
    }

    if (formDiscountType === "percentage" && val > 100) {
      showNotification("Percentage discount cannot exceed 100%.", "error");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        id: editingCoupon?.id,
        code: formCode.trim().toUpperCase(),
        description: formDescription.trim(),
        discount_type: formDiscountType,
        discount_value: val,
        min_order_value: parseFloat(formMinOrderValue) || 0,
        max_discount_amount:
          formDiscountType === "percentage" && formMaxDiscountAmount
            ? parseFloat(formMaxDiscountAmount)
            : null,
        valid_from: formValidFrom ? new Date(formValidFrom).toISOString() : new Date().toISOString(),
        expires_at: formHasExpiry && formExpiresAt ? new Date(formExpiresAt).toISOString() : null,
        usage_limit: formHasUsageLimit && formUsageLimit ? parseInt(formUsageLimit, 10) : null,
        is_active: formIsActive,
      };

      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        showNotification(data.error || "Failed to save coupon.", "error");
        return;
      }

      showNotification(editingCoupon ? "Coupon updated successfully!" : "Coupon created successfully!");
      setIsModalOpen(false);
      await fetchCoupons();
    } catch (err: any) {
      showNotification(err.message || "An unexpected error occurred.", "error");
    } finally {
      setSaving(false);
    }
  };

  // Toggle active status
  const handleToggleStatus = async (coupon: Coupon) => {
    try {
      const newStatus = !coupon.is_active;
      const res = await fetch("/api/admin/coupons", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: coupon.id, is_active: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setCoupons((prev) =>
          prev.map((c) => (c.id === coupon.id ? { ...c, is_active: newStatus } : c))
        );
        showNotification(`Coupon ${coupon.code} marked as ${newStatus ? "Active" : "Inactive"}.`);
      }
    } catch (err) {
      showNotification("Failed to toggle coupon status.", "error");
    }
  };

  // Delete coupon
  const handleDeleteCoupon = async (id: string, code: string) => {
    if (!confirm(`Are you sure you want to delete coupon code "${code}"?`)) return;

    try {
      const res = await fetch(`/api/admin/coupons?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setCoupons((prev) => prev.filter((c) => c.id !== id));
        showNotification(`Coupon ${code} deleted.`);
      } else {
        showNotification(data.error || "Failed to delete coupon.", "error");
      }
    } catch (err) {
      showNotification("Error deleting coupon.", "error");
    }
  };

  // Calculate quick stats
  const activeCount = coupons.filter((c) => c.is_active).length;
  const totalRedemptions = coupons.reduce((sum, c) => sum + (c.used_count || 0), 0);
  const expiredCount = coupons.filter((c) => {
    if (!c.expires_at) return false;
    return new Date(c.expires_at) < new Date();
  }).length;

  const filteredCoupons = coupons.filter((c) => {
    const q = search.toLowerCase();
    return (
      c.code.toLowerCase().includes(q) ||
      (c.description && c.description.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Toast Notification */}
      {feedback && (
        <div
          className={`p-3 rounded-sm border text-[13px] font-semibold flex items-center gap-2 animate-in fade-in duration-200 ${
            feedback.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
              : "bg-red-500/10 border-red-500/30 text-red-400"
          }`}
        >
          {feedback.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-[22px] font-bold text-white tracking-tight">
              Promotions & Coupons
            </h1>
            <span className="bg-[#c8874a]/15 text-[#e5a872] border border-[#c8874a]/30 px-2.5 py-0.5 rounded-full text-[11px] font-bold">
              {coupons.length} Coupons
            </span>
          </div>
          <p className="text-[13px] text-white/40 mt-0.5">
            Create discount vouchers, set validity periods & track customer redemptions
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchCoupons}
            disabled={loading}
            className="p-2.5 bg-[#141414] hover:bg-[#1f1f1f] border border-white/[0.08] text-white/70 hover:text-white rounded-sm transition-colors cursor-pointer"
            title="Refresh list"
          >
            <RefreshCw size={14} className={loading ? "animate-spin text-[#c8874a]" : ""} />
          </button>

          <button
            type="button"
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#c8874a] hover:bg-[#b87840] text-white text-[12px] font-bold rounded-sm transition-all shadow-lg shadow-[#c8874a]/20 cursor-pointer"
          >
            <Plus size={14} />
            Create Coupon
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-[#111111] border border-white/[0.07] rounded-sm p-4.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-white/40">
              Active Coupons
            </span>
            <div className="w-8 h-8 rounded-sm bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Tag size={16} />
            </div>
          </div>
          <p className="text-[24px] font-bold text-white mt-2 leading-none">
            {activeCount}
          </p>
          <span className="text-[11px] text-emerald-400/80 mt-1.5 block">
            Live and redeemable in checkout
          </span>
        </div>

        <div className="bg-[#111111] border border-white/[0.07] rounded-sm p-4.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-white/40">
              Total Redemptions
            </span>
            <div className="w-8 h-8 rounded-sm bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-[#c8874a]">
              <TrendingUp size={16} />
            </div>
          </div>
          <p className="text-[24px] font-bold text-[#e5a872] mt-2 leading-none">
            {totalRedemptions}
          </p>
          <span className="text-[11px] text-white/40 mt-1.5 block">
            Orders placed with coupon codes
          </span>
        </div>

        <div className="bg-[#111111] border border-white/[0.07] rounded-sm p-4.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-white/40">
              Percentage Offers
            </span>
            <div className="w-8 h-8 rounded-sm bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-[#c8874a]">
              <Percent size={15} />
            </div>
          </div>
          <p className="text-[24px] font-bold text-white mt-2 leading-none">
            {coupons.filter((c) => c.discount_type === "percentage").length}
          </p>
          <span className="text-[11px] text-white/40 mt-1.5 block">
            Percentage based discounts
          </span>
        </div>

        <div className="bg-[#111111] border border-white/[0.07] rounded-sm p-4.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-white/40">
              Expired / Inactive
            </span>
            <div className="w-8 h-8 rounded-sm bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-white/40">
              <Clock size={16} />
            </div>
          </div>
          <p className="text-[24px] font-bold text-white/60 mt-2 leading-none">
            {coupons.length - activeCount}
          </p>
          <span className="text-[11px] text-white/40 mt-1.5 block">
            {expiredCount} past validity date
          </span>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-[#111111] rounded-sm border border-white/[0.07] overflow-hidden shadow-xl shadow-black/40">
        {/* Search */}
        <div className="p-4 border-b border-white/[0.06] flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 bg-[#161616] border border-white/[0.08] rounded-sm px-3.5 py-2 w-full max-w-sm focus-within:border-[#c8874a] transition-all">
            <Search size={14} className="text-white/40 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search coupon code or title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="text-[13px] bg-transparent outline-none text-white placeholder-white/30 w-full"
            />
          </div>
          <span className="text-[11px] text-white/40 font-semibold whitespace-nowrap">
            Showing {filteredCoupons.length} of {coupons.length}
          </span>
        </div>

        {loading ? (
          <div className="py-24 text-center text-white/40 text-[13px]">
            <RefreshCw size={26} className="animate-spin mx-auto mb-2 text-[#c8874a]" />
            Loading promotion codes...
          </div>
        ) : filteredCoupons.length === 0 ? (
          <div className="py-24 text-center text-white/40 text-[13px] space-y-3 px-4">
            <Tag size={36} className="mx-auto text-white/20 mb-2" />
            <p className="font-bold text-white/80 text-[15px]">No coupons found</p>
            <p className="text-[12px] max-w-md mx-auto text-white/40">
              Create your first promotional code to offer percentage or flat discounts at checkout.
            </p>
            <button
              type="button"
              onClick={handleOpenCreate}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#c8874a] text-white text-[12px] font-bold rounded-sm mt-2"
            >
              <Plus size={14} /> Create Coupon
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/[0.06] bg-[#0d0d0d]">
                  <th className="px-5 py-3.5 text-[10.5px] font-bold text-white/40 uppercase tracking-widest">
                    Coupon Code
                  </th>
                  <th className="px-5 py-3.5 text-[10.5px] font-bold text-white/40 uppercase tracking-widest">
                    Offer Value
                  </th>
                  <th className="px-5 py-3.5 text-[10.5px] font-bold text-white/40 uppercase tracking-widest">
                    Min Order
                  </th>
                  <th className="px-5 py-3.5 text-[10.5px] font-bold text-white/40 uppercase tracking-widest">
                    Validity
                  </th>
                  <th className="px-5 py-3.5 text-[10.5px] font-bold text-white/40 uppercase tracking-widest">
                    Redemptions
                  </th>
                  <th className="px-5 py-3.5 text-[10.5px] font-bold text-white/40 uppercase tracking-widest">
                    Status
                  </th>
                  <th className="px-5 py-3.5 text-[10.5px] font-bold text-white/40 uppercase tracking-widest text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {filteredCoupons.map((coupon) => {
                  const isExpired = coupon.expires_at && new Date(coupon.expires_at) < new Date();
                  const isUpcoming = coupon.valid_from && new Date(coupon.valid_from) > new Date();

                  return (
                    <tr key={coupon.id} className="hover:bg-white/[0.02] transition-colors group">
                      {/* Code */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2.5">
                          <span className="font-mono font-bold text-white text-[13px] bg-[#181818] border border-white/[0.1] px-2.5 py-1 rounded tracking-wider">
                            {coupon.code}
                          </span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(coupon.code)}
                            className="text-white/30 hover:text-white transition-colors p-1"
                            title="Copy coupon code"
                          >
                            {copiedCode === coupon.code ? (
                              <Check size={13} className="text-emerald-400" />
                            ) : (
                              <Copy size={13} />
                            )}
                          </button>
                        </div>
                        {coupon.description && (
                          <p className="text-[11.5px] text-white/40 mt-1 max-w-xs truncate">
                            {coupon.description}
                          </p>
                        )}
                      </td>

                      {/* Offer Value */}
                      <td className="px-5 py-4">
                        <span className="font-bold text-[#e5a872] text-[13px]">
                          {coupon.discount_type === "percentage"
                            ? `${Number(coupon.discount_value)}% OFF`
                            : `₹${Number(coupon.discount_value).toLocaleString("en-IN")} FLAT OFF`}
                        </span>
                        {coupon.discount_type === "percentage" && coupon.max_discount_amount && (
                          <span className="text-[10.5px] text-white/40 block mt-0.5">
                            Up to ₹{Number(coupon.max_discount_amount).toLocaleString("en-IN")}
                          </span>
                        )}
                      </td>

                      {/* Min Order */}
                      <td className="px-5 py-4 text-[12.5px] text-white/70">
                        {coupon.min_order_value && Number(coupon.min_order_value) > 0
                          ? `₹${Number(coupon.min_order_value).toLocaleString("en-IN")}`
                          : "No minimum"}
                      </td>

                      {/* Validity */}
                      <td className="px-5 py-4">
                        <div className="space-y-0.5 text-[11.5px]">
                          {isExpired ? (
                            <span className="inline-flex items-center gap-1 text-red-400 font-semibold bg-red-500/10 px-2 py-0.5 rounded text-[10.5px]">
                              Expired on {new Date(coupon.expires_at!).toLocaleDateString()}
                            </span>
                          ) : isUpcoming ? (
                            <span className="inline-flex items-center gap-1 text-amber-400 font-semibold bg-amber-500/10 px-2 py-0.5 rounded text-[10.5px]">
                              Starts {new Date(coupon.valid_from!).toLocaleDateString()}
                            </span>
                          ) : coupon.expires_at ? (
                            <span className="text-white/60">
                              Until {new Date(coupon.expires_at).toLocaleDateString()}
                            </span>
                          ) : (
                            <span className="text-emerald-400 font-medium">Never expires</span>
                          )}
                        </div>
                      </td>

                      {/* Redemptions */}
                      <td className="px-5 py-4">
                        <div className="space-y-0.5">
                          <span className="text-[12.5px] font-bold text-white">
                            {coupon.used_count || 0}
                            {coupon.usage_limit ? ` / ${coupon.usage_limit}` : " used"}
                          </span>
                          {coupon.usage_limit && (coupon.used_count || 0) >= coupon.usage_limit && (
                            <span className="text-[10px] text-red-400 block font-semibold uppercase">
                              Limit Reached
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Status Toggle */}
                      <td className="px-5 py-4">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(coupon)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                            coupon.is_active
                              ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
                              : "bg-white/5 border border-white/10 text-white/40 hover:bg-white/10"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              coupon.is_active ? "bg-emerald-400 animate-pulse" : "bg-white/30"
                            }`}
                          />
                          {coupon.is_active ? "Active" : "Inactive"}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(coupon)}
                            className="p-1.5 rounded bg-white/[0.04] hover:bg-white/[0.08] text-white/60 hover:text-white border border-white/[0.08] transition-colors cursor-pointer"
                            title="Edit coupon"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteCoupon(coupon.id, coupon.code)}
                            className="p-1.5 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-colors cursor-pointer"
                            title="Delete coupon"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Coupon Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121212] border border-white/[0.12] rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded bg-[#c8874a]/15 border border-[#c8874a]/30 flex items-center justify-center text-[#c8874a]">
                  <Tag size={16} />
                </div>
                <div>
                  <h3 className="text-[16px] font-bold text-white">
                    {editingCoupon ? "Edit Coupon Code" : "Create New Coupon"}
                  </h3>
                  <p className="text-[11.5px] text-white/40">
                    Configure code, discounts, validity windows and usage restrictions
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-white/40 hover:text-white p-1 rounded hover:bg-white/5"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveCoupon} className="space-y-4">
              {/* Code */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-white/70">
                    Coupon Code *
                  </label>
                  <button
                    type="button"
                    onClick={handleGenerateCode}
                    className="text-[10.5px] text-[#c8874a] hover:text-[#e5a872] font-semibold flex items-center gap-1"
                  >
                    <Sparkles size={11} /> Generate Random
                  </button>
                </div>
                <input
                  type="text"
                  required
                  value={formCode}
                  onChange={(e) => setFormCode(e.target.value.toUpperCase().replace(/\s+/g, ""))}
                  placeholder="e.g. SPECTRA20, FESTIVE500"
                  className="w-full bg-[#181818] border border-white/[0.1] rounded-lg px-3.5 py-2.5 text-white font-mono font-bold text-[14px] uppercase tracking-wider focus:outline-none focus:border-[#c8874a]"
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-white/70 block mb-1">
                  Offer Description / Note
                </label>
                <input
                  type="text"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="e.g. Exclusive festive 15% discount for VIP clients"
                  className="w-full bg-[#181818] border border-white/[0.1] rounded-lg px-3.5 py-2 text-white text-[13px] focus:outline-none focus:border-[#c8874a]"
                />
              </div>

              {/* Discount Type & Value */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-white/70 block mb-1">
                    Discount Type *
                  </label>
                  <select
                    value={formDiscountType}
                    onChange={(e) =>
                      setFormDiscountType(e.target.value as "percentage" | "fixed")
                    }
                    className="w-full bg-[#181818] border border-white/[0.1] rounded-lg px-3 py-2.5 text-white text-[13px] focus:outline-none focus:border-[#c8874a]"
                  >
                    <option value="percentage">Percentage (% OFF)</option>
                    <option value="fixed">Fixed Amount (₹ FLAT OFF)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-white/70 block mb-1">
                    Discount Value *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="any"
                      min="1"
                      required
                      value={formDiscountValue}
                      onChange={(e) => setFormDiscountValue(e.target.value)}
                      placeholder={formDiscountType === "percentage" ? "15" : "500"}
                      className="w-full bg-[#181818] border border-white/[0.1] rounded-lg px-3.5 py-2.5 text-white font-bold text-[13px] focus:outline-none focus:border-[#c8874a] pr-10"
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 text-[13px] font-bold">
                      {formDiscountType === "percentage" ? "%" : "₹"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Min Order & Max Discount (if percentage) */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-white/70 block mb-1">
                    Minimum Order Value (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formMinOrderValue}
                    onChange={(e) => setFormMinOrderValue(e.target.value)}
                    placeholder="e.g. 999 (0 for none)"
                    className="w-full bg-[#181818] border border-white/[0.1] rounded-lg px-3.5 py-2 text-white text-[13px] focus:outline-none focus:border-[#c8874a]"
                  />
                </div>

                {formDiscountType === "percentage" ? (
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-white/70 block mb-1">
                      Max Discount Cap (₹)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formMaxDiscountAmount}
                      onChange={(e) => setFormMaxDiscountAmount(e.target.value)}
                      placeholder="e.g. 500 (Optional)"
                      className="w-full bg-[#181818] border border-white/[0.1] rounded-lg px-3.5 py-2 text-white text-[13px] focus:outline-none focus:border-[#c8874a]"
                    />
                  </div>
                ) : (
                  <div className="flex items-center text-[12px] text-white/30 pt-6">
                    Flat amount deducted directly
                  </div>
                )}
              </div>

              {/* Validity Dates */}
              <div className="p-3.5 bg-[#161616] border border-white/[0.06] rounded-lg space-y-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#c8874a] block">
                  Validity & Expiration
                </span>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10.5px] font-semibold text-white/60 block mb-1">
                      Valid From
                    </label>
                    <input
                      type="date"
                      value={formValidFrom}
                      onChange={(e) => setFormValidFrom(e.target.value)}
                      className="w-full bg-[#1c1c1c] border border-white/[0.1] rounded px-3 py-1.5 text-white text-[12px] focus:outline-none focus:border-[#c8874a]"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[10.5px] font-semibold text-white/60">
                        Expires At
                      </label>
                      <label className="text-[10px] text-white/40 flex items-center gap-1 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formHasExpiry}
                          onChange={(e) => setFormHasExpiry(e.target.checked)}
                          className="accent-[#c8874a]"
                        />
                        Has Expiry
                      </label>
                    </div>
                    <input
                      type="date"
                      disabled={!formHasExpiry}
                      value={formExpiresAt}
                      onChange={(e) => setFormExpiresAt(e.target.value)}
                      className="w-full bg-[#1c1c1c] disabled:opacity-30 border border-white/[0.1] rounded px-3 py-1.5 text-white text-[12px] focus:outline-none focus:border-[#c8874a]"
                    />
                  </div>
                </div>
              </div>

              {/* Usage Limit & Active State */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-white/70">
                      Usage Limit
                    </label>
                    <label className="text-[10px] text-white/40 flex items-center gap-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formHasUsageLimit}
                        onChange={(e) => setFormHasUsageLimit(e.target.checked)}
                        className="accent-[#c8874a]"
                      />
                      Limit Total Uses
                    </label>
                  </div>
                  <input
                    type="number"
                    min="1"
                    disabled={!formHasUsageLimit}
                    value={formUsageLimit}
                    onChange={(e) => setFormUsageLimit(e.target.value)}
                    placeholder="e.g. 50 total redemptions"
                    className="w-full bg-[#181818] disabled:opacity-30 border border-white/[0.1] rounded-lg px-3 py-2 text-white text-[13px] focus:outline-none focus:border-[#c8874a]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-white/70 block mb-1">
                    Coupon Status
                  </label>
                  <label className="flex items-center gap-2 p-2 rounded-lg bg-[#181818] border border-white/[0.1] cursor-pointer mt-1">
                    <input
                      type="checkbox"
                      checked={formIsActive}
                      onChange={(e) => setFormIsActive(e.target.checked)}
                      className="accent-[#c8874a] w-4 h-4"
                    />
                    <span className="text-[12.5px] font-semibold text-white">
                      {formIsActive ? "Active (Can be redeemed)" : "Inactive (Hidden)"}
                    </span>
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-white/[0.08] flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-[12.5px] font-semibold text-white/60 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 bg-[#c8874a] hover:bg-[#b87840] disabled:opacity-50 text-white text-[12.5px] font-bold rounded-lg transition-all shadow-lg shadow-[#c8874a]/20 cursor-pointer flex items-center gap-1.5"
                >
                  {saving && <RefreshCw size={13} className="animate-spin" />}
                  {editingCoupon ? "Update Coupon" : "Create Coupon"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
