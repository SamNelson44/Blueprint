"use client";

import { cn } from "@/lib/cn";

interface ProgressBarProps {
  total: number;
  completed: number;
}

export function ProgressBar({ total, completed }: ProgressBarProps) {
  const pct = total === 0 ? 0 : Math.round((completed / total) * 100);

  return (
    <div className="flex flex-col gap-2 px-5 py-4 border-b-2 border-white">
      {/* Label row */}
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] text-white/40 uppercase tracking-widest">
          Progress
        </span>
        <span className="font-mono text-xs font-bold text-[#D4FF00]">
          {completed}/{total}
        </span>
      </div>

      {/* Chunky block-based bar — each segment is a discrete block */}
      <div
        className="flex gap-[3px] border-2 border-white p-[3px]"
        role="progressbar"
        aria-valuenow={completed}
        aria-valuemin={0}
        aria-valuemax={total}
      >
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-3 flex-1",
              i < completed ? "bg-[#D4FF00]" : "bg-white/10"
            )}
          />
        ))}
      </div>

      {/* Percentage */}
      <span className="font-mono text-[10px] text-white/30">
        {pct}% complete
      </span>
    </div>
  );
}
