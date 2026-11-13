import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center px-4 text-center">
      <div className="max-w-md w-full space-y-6">
        <div className="w-16 h-16 rounded-full bg-[#181818] border border-white/[0.1] flex items-center justify-center mx-auto text-[#c8874a]">
          <Sparkles size={28} />
        </div>
        <div>
          <p className="text-xs font-bold tracking-[0.3em] uppercase text-[#c8874a] mb-2">
            Page or Frame Not Found
          </p>
          <h1 className="text-3xl sm:text-4xl font-extrabold uppercase tracking-tight text-white">
            Lost In Sight
          </h1>
          <p className="text-sm text-neutral-400 mt-3 leading-relaxed">
            The sunglasses or page you are looking for may have been moved, renamed, or is currently unavailable.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/sunglasses"
            className="w-full sm:w-auto px-6 py-3 bg-[#c8874a] hover:bg-[#b5763b] text-white font-bold text-xs uppercase tracking-widest rounded-sm transition-colors shadow-lg shadow-[#c8874a]/20"
          >
            Explore Sunglasses
          </Link>
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
