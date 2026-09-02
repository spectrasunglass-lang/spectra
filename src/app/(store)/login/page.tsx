"use client";

import React, { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Mail, Lock, User, ArrowRight, Loader2, Eye, EyeOff, ShieldCheck, CheckCircle2 } from "lucide-react";

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") === "register" ? "register" : "login";
  const redirectPath = searchParams.get("redirect") || "/account";

  const [tab, setTab] = useState<"login" | "register">(initialTab);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (searchParams.get("tab") === "register") {
      setTab("register");
    }
  }, [searchParams]);

  // Check if already logged in
  useEffect(() => {
    const checkUser = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        router.push(redirectPath);
      }
    };
    checkUser();
  }, [router, redirectPath]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    const supabase = createClient();

    try {
      if (tab === "login") {
        const { error: authError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (authError) throw authError;

        router.push(redirectPath);
        router.refresh();
      } else {
        // Sign Up
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              full_name: fullName.trim(),
            },
          },
        });

        if (signUpError) throw signUpError;

        if (data.session) {
          // Auto signed in
          router.push(redirectPath);
          router.refresh();
        } else {
          setSuccessMsg("Account created! Please check your email inbox to verify your account.");
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center px-4 sm:px-6 py-12 relative overflow-hidden selection:bg-[#c8874a]/30">
      {/* Background Ambience */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#c8874a]/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="w-full max-w-[420px] relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8 flex flex-col items-center">
          <Link href="/" className="inline-block hover:opacity-85 transition-opacity mb-4">
            <Image
              src="/logo/logo.png"
              alt="SPECTRA Logo"
              width={160}
              height={40}
              className="h-8 sm:h-9 w-auto object-contain brightness-110"
              priority
            />
          </Link>
          <p className="text-[10.5px] font-bold tracking-[0.28em] uppercase text-[#c8874a]">
            {tab === "login" ? "Maison Client Portal" : "Join The Maison"}
          </p>
          <p className="text-[13px] text-neutral-400 mt-1">
            {tab === "login"
              ? "Sign in to access your order history and VIP benefits"
              : "Create an account for expedited checkout & bespoke curation"}
          </p>
        </div>

        {/* Card Container */}
        <div className="bg-[#111111]/90 backdrop-blur-xl border border-white/[0.08] rounded-sm p-7 sm:p-8 shadow-2xl shadow-black/80">
          {/* Tab Switcher */}
          <div className="grid grid-cols-2 p-1 bg-[#161616] border border-white/[0.06] rounded-sm mb-6">
            <button
              type="button"
              onClick={() => { setTab("login"); setError(null); setSuccessMsg(null); }}
              className={`py-2 text-[11.5px] font-bold uppercase tracking-wider rounded-sm transition-all ${
                tab === "login"
                  ? "bg-[#202020] text-white shadow-sm"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setTab("register"); setError(null); setSuccessMsg(null); }}
              className={`py-2 text-[11.5px] font-bold uppercase tracking-wider rounded-sm transition-all ${
                tab === "register"
                  ? "bg-[#202020] text-white shadow-sm"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              Create Account
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-sm bg-red-500/10 border border-red-500/20 text-red-400 text-[12px] font-medium">
                {error}
              </div>
            )}

            {successMsg && (
              <div className="p-3 rounded-sm bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[12px] font-medium flex items-start gap-2">
                <CheckCircle2 size={16} className="flex-shrink-0 mt-0.5" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Full Name on Register */}
            {tab === "register" && (
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                  Full Name
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 text-neutral-500 pointer-events-none">
                    <User size={15} />
                  </span>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full bg-[#161616] border border-white/[0.08] focus:border-[#c8874a] text-white text-[13px] rounded-sm pl-10 pr-4 py-3 outline-none transition-colors placeholder:text-neutral-600"
                  />
                </div>
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                Email Address
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
                  placeholder="Enter your email address"
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
                  placeholder={tab === "login" ? "Enter your password" : "Create a password (min. 6 characters)"}
                  autoComplete={tab === "login" ? "current-password" : "new-password"}
                  minLength={6}
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
              {tab === "register" && (
                <p className="text-[11px] text-neutral-500 mt-1">Must be at least 6 characters</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-3 py-3.5 bg-[#c8874a] hover:bg-[#b87840] disabled:bg-[#c8874a]/60 text-white rounded-sm text-[12px] font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#c8874a]/20 cursor-pointer disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  {tab === "login" ? "Authenticating..." : "Creating Account..."}
                </>
              ) : (
                <>
                  {tab === "login" ? "Sign In" : "Register Account"}
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </form>

          {/* Quick guest note */}
          <div className="text-center pt-5 mt-5 border-t border-white/[0.06]">
            <p className="text-[12px] text-neutral-500">
              Purchasing without an account?{" "}
              <Link href="/collections" className="text-[#c8874a] hover:underline font-semibold">
                Guest checkout is always welcome
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="bg-[#0a0a0a] min-h-screen text-white">
      <Suspense fallback={
        <div className="min-h-[85vh] flex items-center justify-center">
          <Loader2 size={24} className="animate-spin text-[#c8874a]" />
        </div>
      }>
        <LoginFormContent />
      </Suspense>
    </div>
  );
}
