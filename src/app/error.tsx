"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { RefreshCw, ArrowLeft, AlertCircle } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App runtime error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center px-4 text-center">
      <div className="max-w-md w-full space-y-6">
        <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto text-red-400">
          <AlertCircle size={28} />
        </div>
        <div>
          <p className="text-xs font-bold tracking-[0.3em] uppercase text-red-400 mb-2">
            Temporary Glitch
          </p>
          <h1 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-white">
            Something went wrong
          </h1>
          <p className="text-sm text-neutral-400 mt-3 leading-relaxed">
            We encountered a temporary issue while loading this page. Please try refreshing.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto px-6 py-3 bg-[#c8874a] hover:bg-[#b5763b] text-white font-bold text-xs uppercase tracking-widest rounded-sm transition-colors shadow-lg shadow-[#c8874a]/20 flex items-center justify-center gap-2 cursor-pointer"
          >
            <RefreshCw size={14} /> Try Again
          </button>
          <Link
            href="/"
            className="w-full sm:w-auto px-6 py-3 bg-[#181818] hover:bg-[#202020] text-neutral-300 hover:text-white font-bold text-xs uppercase tracking-widest rounded-sm transition-colors border border-white/[0.08] flex items-center justify-center gap-2"
          >
            <ArrowLeft size={14} /> Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
