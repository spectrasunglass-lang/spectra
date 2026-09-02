"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Lock, Mail, ArrowRight, Loader2, Eye, EyeOff, ShieldCheck } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Authentication failed.");
      }

      // Successful login -> Redirect to Admin Dashboard
      router.push("/admin");
      router.refresh();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Invalid credentials. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070707] flex flex-col items-center justify-center px-4 sm:px-6 relative overflow-hidden selection:bg-[#c8874a]/30">
      {/* Subtle Background Ambience */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-[#c8874a]/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff05_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

      <div className="w-full max-w-[420px] relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="relative mb-5 flex items-center justify-center">
            <Image
              src="/logo/logo.png"
              alt="SPECTRA Logo"
              width={180}
              height={45}
              className="h-9 w-auto object-contain brightness-110"
              priority
            />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.08] mb-3">
            <ShieldCheck size={13} className="text-[#c8874a]" />
            <span className="text-[10.5px] font-bold tracking-[0.25em] uppercase text-neutral-300">
              Management Portal
            </span>
          </div>
          <p className="text-[13px] text-neutral-400">
            Sign in to access store controls, inventory, and orders
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-[#111111]/90 backdrop-blur-xl border border-white/[0.08] rounded-sm p-7 sm:p-8 shadow-2xl shadow-black/80">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3.5 rounded-sm bg-red-500/10 border border-red-500/20 text-red-400 text-[12.5px] font-medium animate-shake">
                {error}
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                Admin Email
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-neutral-500 pointer-events-none">
                  <Mail size={15} />
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@spectra.com"
                  autoComplete="email"
                  className="w-full bg-[#161616] border border-white/[0.08] focus:border-[#c8874a] text-white text-[13px] rounded-sm pl-10 pr-4 py-3 outline-none transition-colors placeholder:text-neutral-600"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                  Password
                </label>
              </div>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-neutral-500 pointer-events-none">
                  <Lock size={15} />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  autoComplete="current-password"
                  className="w-full bg-[#161616] border border-white/[0.08] focus:border-[#c8874a] text-white text-[13px] rounded-sm pl-10 pr-11 py-3 outline-none transition-colors placeholder:text-neutral-600"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-neutral-500 hover:text-neutral-300 transition-colors p-1"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3.5 bg-[#c8874a] hover:bg-[#b87840] disabled:bg-[#c8874a]/60 text-white rounded-sm text-[12px] font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#c8874a]/20 cursor-pointer disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  Verifying Credentials...
                </>
              ) : (
                <>
                  Enter Dashboard
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer info */}
        <div className="text-center mt-8 text-[11px] text-neutral-600 tracking-wider uppercase">
          SPECTRA Luxury Eyewear &copy; {new Date().getFullYear()}
        </div>
      </div>
    </div>
  );
}
