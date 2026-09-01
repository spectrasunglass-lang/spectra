"use client";

import React from "react";
import { MapPin } from "lucide-react";

export interface AddressData {
  fullName: string;
  phone: string;
  email: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
}

interface CartAddressFormProps {
  address: AddressData;
  onChange: (field: keyof AddressData, value: string) => void;
  errors?: Partial<Record<keyof AddressData, string>>;
}

export default function CartAddressForm({
  address,
  onChange,
  errors = {},
}: CartAddressFormProps) {
  const inputClass =
    "w-full bg-white/[0.04] text-white text-[13px] px-3.5 py-3 rounded-sm border-none outline-none placeholder-white/25 focus:bg-white/[0.07] transition-colors";

  return (
    <div className="space-y-4 sm:bg-white/[0.03] sm:p-6 sm:rounded-sm">
      <div className="flex items-center gap-2 pb-2">
        <MapPin size={16} className="text-[#c8874a]" />
        <h2 className="text-[15px] font-bold text-white tracking-wide uppercase">
          Delivery Address
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Full Name */}
        <div className="sm:col-span-2">
          <label className="block text-[11px] font-semibold text-white/50 uppercase tracking-wider mb-1">
            Full Name <span className="text-[#c8874a]">*</span>
          </label>
          <input
            type="text"
            value={address.fullName}
            onChange={(e) => onChange("fullName", e.target.value)}
            placeholder="John Doe"
            className={inputClass}
          />
          {errors.fullName && (
            <p className="text-[11px] text-red-400 mt-1">{errors.fullName}</p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label className="block text-[11px] font-semibold text-white/50 uppercase tracking-wider mb-1">
            Phone Number <span className="text-[#c8874a]">*</span>
          </label>
          <input
            type="tel"
            value={address.phone}
            onChange={(e) => onChange("phone", e.target.value)}
            placeholder="+91 98765 43210"
            className={inputClass}
          />
          {errors.phone && (
            <p className="text-[11px] text-red-400 mt-1">{errors.phone}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-[11px] font-semibold text-white/50 uppercase tracking-wider mb-1">
            Email Address <span className="text-[#c8874a]">*</span>
          </label>
          <input
            type="email"
            value={address.email}
            onChange={(e) => onChange("email", e.target.value)}
            placeholder="name@example.com"
            className={inputClass}
          />
          {errors.email && (
            <p className="text-[11px] text-red-400 mt-1">{errors.email}</p>
          )}
        </div>

        {/* Street Address */}
        <div className="sm:col-span-2">
          <label className="block text-[11px] font-semibold text-white/50 uppercase tracking-wider mb-1">
            Street Address / House No. <span className="text-[#c8874a]">*</span>
          </label>
          <input
            type="text"
            value={address.street}
            onChange={(e) => onChange("street", e.target.value)}
            placeholder="Flat / House No., Landmark, Street"
            className={inputClass}
          />
          {errors.street && (
            <p className="text-[11px] text-red-400 mt-1">{errors.street}</p>
          )}
        </div>

        {/* City */}
        <div>
          <label className="block text-[11px] font-semibold text-white/50 uppercase tracking-wider mb-1">
            City <span className="text-[#c8874a]">*</span>
          </label>
          <input
            type="text"
            value={address.city}
            onChange={(e) => onChange("city", e.target.value)}
            placeholder="Mumbai"
            className={inputClass}
          />
          {errors.city && (
            <p className="text-[11px] text-red-400 mt-1">{errors.city}</p>
          )}
        </div>

        {/* State */}
        <div>
          <label className="block text-[11px] font-semibold text-white/50 uppercase tracking-wider mb-1">
            State <span className="text-[#c8874a]">*</span>
          </label>
          <input
            type="text"
            value={address.state}
            onChange={(e) => onChange("state", e.target.value)}
            placeholder="Maharashtra"
            className={inputClass}
          />
          {errors.state && (
            <p className="text-[11px] text-red-400 mt-1">{errors.state}</p>
          )}
        </div>

        {/* PIN Code */}
        <div className="sm:col-span-2">
          <label className="block text-[11px] font-semibold text-white/50 uppercase tracking-wider mb-1">
            PIN Code <span className="text-[#c8874a]">*</span>
          </label>
          <input
            type="text"
            maxLength={6}
            value={address.pincode}
            onChange={(e) => onChange("pincode", e.target.value)}
            placeholder="400001"
            className={inputClass}
          />
          {errors.pincode && (
            <p className="text-[11px] text-red-400 mt-1">{errors.pincode}</p>
          )}
        </div>
      </div>
    </div>
  );
}
