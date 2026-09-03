export default function ProductLoading() {
  return (
    <div className="bg-[#0a0a0a] min-h-screen text-white">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-10 sm:py-5 animate-pulse">
        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          {/* Left: Image Skeleton (7 cols on lg) */}
          <div className="lg:col-span-7 flex flex-col-reverse sm:flex-row gap-4">
            {/* Thumbnails */}
            <div className="flex sm:flex-col gap-2.5 overflow-x-auto sm:overflow-visible">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-white/[0.04] border border-white/[0.05] flex-shrink-0"
                />
              ))}
            </div>

            {/* Main Image Stage */}
            <div className="flex-1 aspect-square rounded-2xl bg-white/[0.03] border border-white/[0.06] relative overflow-hidden flex items-center justify-center">
              <div className="w-24 h-24 rounded-full bg-white/[0.02]" />
            </div>
          </div>

          {/* Right: Info & CTA Skeleton (5 cols on lg) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Category / Subtitle */}
            <div className="space-y-2">
              <div className="h-3 w-28 bg-[#c8874a]/20 rounded-sm" />
              <div className="h-8 w-3/4 bg-white/[0.06] rounded-md" />
              <div className="h-4 w-1/2 bg-white/[0.04] rounded-sm" />
            </div>

            {/* Price Row */}
            <div className="flex items-baseline gap-3 pb-4 border-b border-white/[0.06]">
              <div className="h-9 w-32 bg-white/[0.08] rounded-md" />
              <div className="h-5 w-20 bg-white/[0.04] rounded-sm" />
            </div>

            {/* Specs Pills */}
            <div className="grid grid-cols-2 gap-2">
              <div className="h-12 bg-white/[0.03] border border-white/[0.05] rounded-xl" />
              <div className="h-12 bg-white/[0.03] border border-white/[0.05] rounded-xl" />
            </div>

            {/* Gift Package Box Placeholder */}
            <div className="h-20 bg-white/[0.03] border border-white/[0.05] rounded-xl" />

            {/* CTA Buttons */}
            <div className="space-y-3 pt-2">
              <div className="h-13 bg-[#c8874a]/30 rounded-sm w-full" />
              <div className="h-13 bg-white/[0.08] rounded-sm w-full" />
            </div>

            {/* Trust Badges */}
            <div className="h-32 bg-white/[0.02] border border-white/[0.04] rounded-2xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
