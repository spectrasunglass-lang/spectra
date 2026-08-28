import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

interface StatsCardProps {
  label: string;
  value: string;
  change?: number;
  icon: React.ReactNode;
  variant?: "gold" | "dark" | "charcoal" | "carbon";
  suffix?: string;
}

const variants = {
  dark: {
    wrapper: "bg-[#111111] hover:border-[#c8874a]/40",
    iconBg: "bg-[#c8874a] text-white shadow-md shadow-[#c8874a]/20",
    iconColor: "text-white",
    label: "text-white/45",
    value: "text-white",
    border: "border-white/[0.07]",
    glow: "from-[#c8874a]",
  },
  gold: {
    wrapper: "bg-[#141414] hover:border-[#c8874a]/40",
    iconBg: "bg-[#1f1a14] border border-[#c8874a]/30 text-[#c8874a]",
    iconColor: "text-[#c8874a]",
    label: "text-white/45",
    value: "text-white",
    border: "border-white/[0.07]",
    glow: "from-[#c8874a]",
  },
  charcoal: {
    wrapper: "bg-[#121212] hover:border-white/[0.15]",
    iconBg: "bg-[#1c1c1c] border border-white/[0.08] text-white/80",
    iconColor: "text-white",
    label: "text-white/45",
    value: "text-white",
    border: "border-white/[0.07]",
    glow: "from-white/20",
  },
  carbon: {
    wrapper: "bg-[#0f0f0f] hover:border-[#c8874a]/30",
    iconBg: "bg-[#1a1a1a] border border-white/[0.06] text-white/70",
    iconColor: "text-white/90",
    label: "text-white/45",
    value: "text-white",
    border: "border-white/[0.07]",
    glow: "from-[#c8874a]",
  },
};

export default function StatsCard({
  label,
  value,
  change,
  icon,
  variant = "gold",
  suffix,
}: StatsCardProps) {
  const v = variants[variant] || variants.dark;
  const isPositive = change !== undefined && change >= 0;

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border p-5 flex flex-col gap-4 transition-all duration-300 hover:shadow-xl hover:shadow-black/50 hover:-translate-y-0.5 ${v.wrapper} ${v.border}`}
    >
      {/* Top row */}
      <div className="flex items-start justify-between">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${v.iconBg}`}>
          <span className={v.iconColor}>{icon}</span>
        </div>
        {change !== undefined && (
          <div
            className={`flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full ${
              isPositive
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                : "bg-red-500/10 text-red-400 border border-red-500/20"
            }`}
          >
            {isPositive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
            {Math.abs(change)}%
          </div>
        )}
      </div>

      {/* Value + label */}
      <div>
        <p className={`text-[28px] font-bold leading-none tracking-tight ${v.value}`}>
          {value}
          {suffix && <span className="text-[14px] font-semibold ml-1 opacity-40">{suffix}</span>}
        </p>
        <p className={`text-[12px] font-medium mt-1.5 ${v.label}`}>{label}</p>
      </div>

      {/* Subtle gold / carbon accent line at bottom */}
      <div className="absolute bottom-0 left-0 w-12 h-[2px] bg-gradient-to-r from-[#c8874a] to-transparent rounded-r-full" />
    </div>
  );
}
