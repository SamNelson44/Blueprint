/* Server-safe — no "use client" needed, pure CSS animation */

function Bone({ className }: { className?: string }) {
  return (
    <div
      className={`bg-white/5 border border-white/10 animate-pulse ${className ?? ""}`}
    />
  );
}

export function PlayerSkeleton() {
  return (
    <div className="flex flex-col h-screen bg-black overflow-hidden">
      {/* Top bar skeleton */}
      <div className="flex items-center gap-4 px-5 py-3 border-b-2 border-white/20 bg-[#0A0A0A] shrink-0">
        <Bone className="h-4 w-20" />
        <Bone className="h-4 w-40" />
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar skeleton */}
        <div className="w-72 shrink-0 border-r-2 border-white/20 bg-[#0A0A0A] flex flex-col">
          <div className="px-5 py-4 border-b-2 border-white/20">
            <Bone className="h-3 w-16 mb-2" />
            <Bone className="h-5 w-48" />
          </div>

          {/* Progress bar skeleton */}
          <div className="px-5 py-4 border-b-2 border-white/20 flex flex-col gap-2">
            <div className="flex justify-between">
              <Bone className="h-3 w-16" />
              <Bone className="h-3 w-10" />
            </div>
            <div className="flex gap-[3px] border-2 border-white/20 p-[3px]">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-3 flex-1 bg-white/5" />
              ))}
            </div>
          </div>

          {/* Node list skeleton */}
          <div className="flex-1 py-3 flex flex-col gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-5 py-3">
                <Bone className="h-5 w-5 shrink-0" />
                <div className="flex flex-col gap-1.5 flex-1">
                  <Bone className="h-3.5 w-full" />
                  <Bone className="h-2.5 w-12" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main content skeleton */}
        <main className="flex-1 overflow-y-auto px-6 py-8 max-w-3xl">
          <div className="flex gap-2 mb-6">
            <Bone className="h-5 w-14" />
            <Bone className="h-5 w-10" />
          </div>
          <Bone className="h-10 w-3/4 mb-2" />
          <Bone className="h-10 w-1/2 mb-6" />
          <Bone className="h-1 w-16 mb-8" />

          <div className="flex flex-col gap-3">
            <Bone className="h-4 w-full" />
            <Bone className="h-4 w-5/6" />
            <Bone className="h-4 w-4/6" />
            <Bone className="h-4 w-full" />
            <Bone className="h-4 w-3/4" />
          </div>

          <Bone className="h-32 w-full mt-6 border-2 border-white/10" />

          <div className="flex flex-col gap-3 mt-6">
            <Bone className="h-4 w-full" />
            <Bone className="h-4 w-2/3" />
          </div>
        </main>
      </div>

      {/* Bottom bar skeleton */}
      <div className="shrink-0 flex items-center justify-between px-6 py-3 border-t-2 border-white/20 bg-[#0A0A0A]">
        <div className="flex flex-col gap-1.5">
          <Bone className="h-2.5 w-16" />
          <Bone className="h-4 w-40" />
        </div>
        <div className="flex gap-3">
          <Bone className="h-10 w-36" />
          <Bone className="h-10 w-28" />
        </div>
      </div>
    </div>
  );
}
