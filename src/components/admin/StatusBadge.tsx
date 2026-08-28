import React from "react";

type Status =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "new"
  | "active"
  | "draft";

const config: Record<
  Status,
  { label: string; bg: string; text: string; dot: string; border: string }
> = {
  pending: {
    label: "Pending",
    bg: "bg-amber-500/10",
    text: "text-amber-400",
    dot: "bg-amber-400",
    border: "border-amber-500/20",
  },
  processing: {
    label: "Processing",
    bg: "bg-orange-500/10",
    text: "text-orange-400",
    dot: "bg-orange-400",
    border: "border-orange-500/20",
  },
  shipped: {
    label: "Shipped",
    bg: "bg-[#c8874a]/15",
    text: "text-[#e5a872]",
    dot: "bg-[#c8874a]",
    border: "border-[#c8874a]/30",
  },
  delivered: {
    label: "Delivered",
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    dot: "bg-emerald-400",
    border: "border-emerald-500/20",
  },
  cancelled: {
    label: "Cancelled",
    bg: "bg-red-500/10",
    text: "text-red-400",
    dot: "bg-red-400",
    border: "border-red-500/20",
  },
  new: {
    label: "New",
    bg: "bg-[#c8874a]/20",
    text: "text-[#e5a872]",
    dot: "bg-[#c8874a]",
    border: "border-[#c8874a]/30",
  },
  active: {
    label: "Active",
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    dot: "bg-emerald-400",
    border: "border-emerald-500/20",
  },
  draft: {
    label: "Draft",
    bg: "bg-white/[0.06]",
    text: "text-white/50",
    dot: "bg-white/40",
    border: "border-white/[0.08]",
  },
};

interface StatusBadgeProps {
  status: Status;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const c = config[status] ?? config.draft;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${c.bg} ${c.text} ${c.border}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  );
}
