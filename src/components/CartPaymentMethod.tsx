"use client";

import React from "react";
import { CreditCard, Banknote, Check } from "lucide-react";

export type PaymentOption = "online" | "cod";

interface CartPaymentMethodProps {
  selected: PaymentOption;
  onChange: (method: PaymentOption) => void;
  codAdvanceEnabled?: boolean;
  codAdvanceAmount?: string | number;
}

export default function CartPaymentMethod({
  selected,
  onChange,
  codAdvanceEnabled = false,
  codAdvanceAmount = "199",
}: CartPaymentMethodProps) {
  return (
    <div className="space-y-4 sm:bg-white/[0.03] sm:p-6 sm:rounded-sm">
      <div className="flex items-center gap-2 pb-2">
        <CreditCard size={16} className="text-[#c8874a]" />
        <h2 className="text-[15px] font-bold text-white tracking-wide uppercase">
          Payment Method
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Online Payment Option */}
        <button
          type="button"
          onClick={() => onChange("online")}
          className={`flex items-start gap-3.5 p-4 rounded-sm text-left transition-all cursor-pointer ${
            selected === "online"
              ? "bg-white/[0.09] text-white ring-1 ring-[#c8874a]"
              : "bg-white/[0.04] text-white/70 hover:bg-white/[0.06] hover:text-white"
          }`}
        >
          <div className="mt-0.5 p-2 rounded-sm bg-white/[0.06] text-[#c8874a]">
            <CreditCard size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-bold text-white uppercase tracking-wider">
                Online Payment
              </span>
              {selected === "online" && (
                <div className="w-4 h-4 rounded-full bg-[#c8874a] flex items-center justify-center text-white">
                  <Check size={11} strokeWidth={3} />
                </div>
              )}
            </div>
            <p className="text-[11.5px] text-white/40 mt-1">
              UPI, Cards, Net Banking & Wallets
            </p>
          </div>
        </button>

        {/* COD Option */}
        <button
          type="button"
          onClick={() => onChange("cod")}
          className={`flex items-start gap-3.5 p-4 rounded-sm text-left transition-all cursor-pointer ${
            selected === "cod"
              ? "bg-white/[0.09] text-white ring-1 ring-[#c8874a]"
              : "bg-white/[0.04] text-white/70 hover:bg-white/[0.06] hover:text-white"
          }`}
        >
          <div className="mt-0.5 p-2 rounded-sm bg-white/[0.06] text-[#c8874a]">
            <Banknote size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-bold text-white uppercase tracking-wider">
                Cash On Delivery
              </span>
              {selected === "cod" && (
                <div className="w-4 h-4 rounded-full bg-[#c8874a] flex items-center justify-center text-white">
                  <Check size={11} strokeWidth={3} />
                </div>
              )}
            </div>
            <p className="text-[11.5px] text-white/40 mt-1">
              {codAdvanceEnabled
                ? `₹${codAdvanceAmount} advance deposit required, balance on delivery`
                : "Pay in cash upon doorstep delivery"}
            </p>
          </div>
        </button>
      </div>
    </div>
  );
}
