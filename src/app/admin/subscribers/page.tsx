"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Mail,
  Search,
  Download,
  Trash2,
  Send,
  UserPlus,
  Copy,
  Check,
  RefreshCw,
  Sparkles,
  Users,
  Calendar,
  X,
} from "lucide-react";

interface Subscriber {
  id: string;
  email: string;
  status: "subscribed" | "unsubscribed";
  created_at: string;
}

export default function SubscribersPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  // Add modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [adding, setAdding] = useState(false);

  // Email broadcast modal state
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [targetEmail, setTargetEmail] = useState<string>("all");
  const [emailSubject, setEmailSubject] = useState("Exclusive VIP Invitation — SPECTRA Eyewear");
  const [emailBody, setEmailBody] = useState(
    "Dear VIP,\n\nWe are pleased to present an exclusive private preview of our newest 2026 Collection.\n\nExplore handcrafted titanium frames and precision optical lenses crafted for visionaries.\n\nVisit: https://www.spectrasunglassess.in\n\nWarm regards,\nThe SPECTRA Maison"
  );

  const fetchSubscribers = useCallback(async () => {
    setLoading(true);
    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const { data, error } = await supabase
        .from("subscribers")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSubscribers(data || []);
    } catch (err) {
      console.error("[Subscribers Fetch Error]", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubscribers();
  }, [fetchSubscribers]);

  const handleAddSubscriber = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || adding) return;
    setAdding(true);
    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const { error } = await supabase.from("subscribers").upsert(
        { email: newEmail.trim().toLowerCase(), status: "subscribed" },
        { onConflict: "email" }
      );
      if (error) throw error;
      setNewEmail("");
      setShowAddModal(false);
      fetchSubscribers();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to add subscriber");
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id: string, email: string) => {
    if (!confirm(`Are you sure you want to remove ${email} from subscribers?`)) return;
    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const { error } = await supabase.from("subscribers").delete().eq("id", id);
      if (error) throw error;
      setSubscribers((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete subscriber");
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const copyAllEmails = () => {
    const all = subscribers.map((s) => s.email).join(", ");
    navigator.clipboard.writeText(all);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const exportCSV = () => {
    const headers = "ID,Email,Status,Date Joined\n";
    const rows = subscribers
      .map(
        (s) =>
          `"${s.id}","${s.email}","${s.status}","${new Date(s.created_at).toLocaleDateString()}"`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `spectra_subscribers_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSendEmailClient = () => {
    let recipients = "";
    if (targetEmail === "all") {
      recipients = subscribers.map((s) => s.email).join(",");
    } else {
      recipients = targetEmail;
    }
    const mailtoUrl = `mailto:concierge@spectrasunglass.com?bcc=${encodeURIComponent(
      recipients
    )}&subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
    window.location.href = mailtoUrl;
    setShowEmailModal(false);
  };

  const filtered = subscribers.filter((s) =>
    s.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-bold text-white tracking-tight flex items-center gap-2.5">
            <Mail className="text-[#c8874a]" size={22} />
            Newsletter Subscribers
          </h1>
          <p className="text-[13px] text-white/40 mt-0.5">
            Manage VIP subscribers, export contact lists, and compose campaign emails
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={fetchSubscribers}
            className="w-9 h-9 flex items-center justify-center rounded-sm border border-white/[0.08] bg-[#161616] hover:bg-[#202020] text-white/60 hover:text-white transition-colors cursor-pointer"
            title="Refresh"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>

          <button
            onClick={exportCSV}
            disabled={subscribers.length === 0}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-sm border border-white/[0.08] bg-[#161616] hover:bg-[#202020] text-white/80 hover:text-white text-[12px] font-bold transition-all disabled:opacity-40 cursor-pointer"
          >
            <Download size={13} />
            Export CSV
          </button>

          <button
            onClick={() => {
              setTargetEmail("all");
              setShowEmailModal(true);
            }}
            disabled={subscribers.length === 0}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-sm bg-[#c8874a] hover:bg-[#b87840] text-white text-[12px] font-bold transition-all shadow-md shadow-[#c8874a]/20 cursor-pointer disabled:opacity-40"
          >
            <Send size={13} />
            Send Campaign
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-sm border border-[#c8874a]/40 bg-[#c8874a]/10 hover:bg-[#c8874a]/20 text-[#e5a872] text-[12px] font-bold transition-all cursor-pointer"
          >
            <UserPlus size={13} />
            Add VIP
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#111111] rounded-sm border border-white/[0.07] p-5 shadow-xl shadow-black/40">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-white/40 tracking-wider uppercase">
              Total Subscribers
            </span>
            <Users size={16} className="text-[#c8874a]" />
          </div>
          <p className="text-3xl font-bold text-white mt-2">
            {subscribers.length}
          </p>
          <p className="text-[11px] text-white/40 mt-1">
            Active opt-in VIP list
          </p>
        </div>

        <div className="bg-[#111111] rounded-sm border border-white/[0.07] p-5 shadow-xl shadow-black/40">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-white/40 tracking-wider uppercase">
              Status
            </span>
            <Sparkles size={16} className="text-emerald-400" />
          </div>
          <p className="text-3xl font-bold text-emerald-400 mt-2">
            100%
          </p>
          <p className="text-[11px] text-white/40 mt-1">
            Deliverable & active
          </p>
        </div>

        <div className="bg-[#111111] rounded-sm border border-white/[0.07] p-5 shadow-xl shadow-black/40">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-white/40 tracking-wider uppercase">
              Broadcast Audience
            </span>
            <Mail size={16} className="text-[#c8874a]" />
          </div>
          <div className="flex items-center gap-2 mt-2">
            <button
              onClick={copyAllEmails}
              disabled={subscribers.length === 0}
              className="text-[12px] font-bold text-[#c8874a] hover:text-[#e5a872] flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copiedAll ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
              {copiedAll ? "Emails Copied!" : "Copy All Addresses"}
            </button>
          </div>
          <p className="text-[11px] text-white/40 mt-1">
            One-click BCC copy for Mailchimp / Gmail
          </p>
        </div>
      </div>

      {/* Search & List Table */}
      <div className="bg-[#111111] rounded-sm border border-white/[0.07] overflow-hidden shadow-xl shadow-black/40">
        <div className="p-4 border-b border-white/[0.06] flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 bg-[#161616] border border-white/[0.08] rounded-sm px-3.5 py-2 w-full max-w-sm focus-within:border-[#c8874a] transition-all">
            <Search size={14} className="text-white/40 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search by email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="text-[13px] bg-transparent outline-none text-white placeholder-white/30 w-full"
            />
          </div>
          <span className="text-[11px] text-white/40 font-semibold whitespace-nowrap">
            Showing {filtered.length} of {subscribers.length}
          </span>
        </div>

        {loading ? (
          <div className="py-20 text-center text-white/40 text-[13px]">
            <RefreshCw size={24} className="animate-spin mx-auto mb-2 text-[#c8874a]" />
            Loading VIP subscribers...
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center text-white/40 text-[13px] space-y-2">
            <Mail size={32} className="mx-auto text-white/20 mb-2" />
            <p className="font-bold text-white/70">No subscribers found</p>
            <p className="text-[12px] max-w-xs mx-auto">
              When clients enter their email in the footer newsletter form, they will automatically appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/[0.06] bg-[#0d0d0d]">
                  <th className="px-6 py-3.5 text-[10px] font-bold text-white/30 uppercase tracking-widest">
                    Email Address
                  </th>
                  <th className="px-6 py-3.5 text-[10px] font-bold text-white/30 uppercase tracking-widest">
                    Status
                  </th>
                  <th className="px-6 py-3.5 text-[10px] font-bold text-white/30 uppercase tracking-widest">
                    Joined Date
                  </th>
                  <th className="px-6 py-3.5 text-[10px] font-bold text-white/30 uppercase tracking-widest text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {filtered.map((sub) => (
                  <tr key={sub.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-[#c8874a] font-bold text-[11px] uppercase">
                          {sub.email.charAt(0)}
                        </div>
                        <span className="text-[13px] font-semibold text-white">
                          {sub.email}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        {sub.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[12px] text-white/50">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={13} className="text-white/30" />
                        {new Date(sub.created_at).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => copyToClipboard(sub.email, sub.id)}
                          className="p-1.5 rounded-sm hover:bg-white/[0.06] text-white/50 hover:text-white transition-colors cursor-pointer"
                          title="Copy Email"
                        >
                          {copiedId === sub.id ? (
                            <Check size={14} className="text-emerald-400" />
                          ) : (
                            <Copy size={14} />
                          )}
                        </button>
                        <button
                          onClick={() => {
                            setTargetEmail(sub.email);
                            setShowEmailModal(true);
                          }}
                          className="p-1.5 rounded-sm hover:bg-[#c8874a]/20 text-[#c8874a] transition-colors cursor-pointer"
                          title="Send Email"
                        >
                          <Send size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(sub.id, sub.email)}
                          className="p-1.5 rounded-sm hover:bg-red-500/20 text-red-400 transition-colors cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* --- ADD SUBSCRIBER MODAL --- */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#121212] border border-white/[0.08] rounded-sm w-full max-w-md p-6 space-y-4 shadow-2xl shadow-black">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
              <h3 className="text-[15px] font-bold text-white flex items-center gap-2">
                <UserPlus size={16} className="text-[#c8874a]" />
                Add VIP Subscriber
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-white/40 hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddSubscriber} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-white/50 uppercase tracking-wider mb-2">
                  Client Email Address
                </label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="client@luxury.com"
                  required
                  className="w-full bg-[#181818] border border-white/[0.08] rounded-sm px-4 py-3 text-[13px] text-white focus:outline-none focus:border-[#c8874a]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-sm border border-white/[0.08] text-white/60 hover:text-white text-[12px] font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adding}
                  className="px-5 py-2.5 rounded-sm bg-[#c8874a] hover:bg-[#b87840] text-white text-[12px] font-bold transition-all shadow-md shadow-[#c8874a]/20 cursor-pointer disabled:opacity-60"
                >
                  {adding ? "Adding..." : "Add to VIP List"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- SEND CAMPAIGN EMAIL MODAL --- */}
      {showEmailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#121212] border border-white/[0.08] rounded-sm w-full max-w-lg p-6 space-y-4 shadow-2xl shadow-black">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
              <h3 className="text-[15px] font-bold text-white flex items-center gap-2">
                <Send size={16} className="text-[#c8874a]" />
                {targetEmail === "all"
                  ? `Send Broadcast to ${subscribers.length} VIPs`
                  : `Send Email to ${targetEmail}`}
              </h3>
              <button
                onClick={() => setShowEmailModal(false)}
                className="text-white/40 hover:text-white transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-white/50 uppercase tracking-wider mb-2">
                  Recipient
                </label>
                <div className="bg-[#181818] border border-white/[0.08] rounded-sm px-4 py-2.5 text-[12px] text-white/80 font-mono">
                  {targetEmail === "all"
                    ? `BCC: All ${subscribers.length} Subscribers`
                    : `To: ${targetEmail}`}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-white/50 uppercase tracking-wider mb-2">
                  Email Subject
                </label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="w-full bg-[#181818] border border-white/[0.08] rounded-sm px-4 py-2.5 text-[13px] text-white focus:outline-none focus:border-[#c8874a]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-white/50 uppercase tracking-wider mb-2">
                  Message Content
                </label>
                <textarea
                  rows={6}
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  className="w-full bg-[#181818] border border-white/[0.08] rounded-sm px-4 py-3 text-[13px] text-white focus:outline-none focus:border-[#c8874a] resize-none font-sans leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/[0.06]">
                <button
                  type="button"
                  onClick={() => setShowEmailModal(false)}
                  className="px-4 py-2.5 rounded-sm border border-white/[0.08] text-white/60 hover:text-white text-[12px] font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSendEmailClient}
                  className="px-5 py-2.5 rounded-sm bg-[#c8874a] hover:bg-[#b87840] text-white text-[12px] font-bold transition-all shadow-md shadow-[#c8874a]/20 flex items-center gap-1.5 cursor-pointer"
                >
                  <Send size={13} />
                  Open in Mail Client
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
