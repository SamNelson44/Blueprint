"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";

interface BlueprintCompleteProps {
  blueprintTitle: string;
  totalNodes: number;
  onDismiss: () => void;
}

export function BlueprintComplete({
  blueprintTitle,
  totalNodes,
  onDismiss,
}: BlueprintCompleteProps) {
  const [visible, setVisible] = useState(false);

  /* Stagger in after a brief delay for dramatic effect */
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#D4FF00]",
        "transition-opacity duration-300",
        visible ? "opacity-100" : "opacity-0"
      )}
    >
      {/* Brutal grid overlay — inverted on accent bg */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="relative z-10 flex flex-col items-center gap-8 px-8 text-center max-w-2xl">
        {/* Flash badge */}
        <div className="border-4 border-black px-4 py-1 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          <span className="font-mono font-bold text-xs text-black uppercase tracking-[0.3em]">
            All {totalNodes} steps complete
          </span>
        </div>

        {/* Main headline */}
        <h1
          className="font-sans font-black text-black uppercase leading-[0.85] tracking-tighter"
          style={{ fontSize: "clamp(3rem, 12vw, 8rem)" }}
        >
          Blueprint
          <br />
          Complete.
        </h1>

        {/* Blueprint name */}
        <p className="font-mono text-base text-black/60 max-w-md">
          You've finished{" "}
          <span className="font-bold text-black">"{blueprintTitle}"</span>.
          Time to ship what you've learned.
        </p>

        {/* Actions */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={onDismiss}
            className={[
              "px-6 py-3 font-mono font-bold text-sm uppercase tracking-widest",
              "bg-black text-[#D4FF00] border-4 border-black",
              "shadow-[5px_5px_0px_0px_rgba(0,0,0,0.3)]",
              "hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,0.3)]",
              "transition-[transform,box-shadow] duration-75",
            ].join(" ")}
          >
            Review Steps →
          </button>
          <Link
            href="/dashboard"
            className={[
              "px-6 py-3 font-mono font-bold text-sm uppercase tracking-widest",
              "bg-transparent text-black border-4 border-black",
              "shadow-[5px_5px_0px_0px_rgba(0,0,0,0.2)]",
              "hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,0.2)]",
              "transition-[transform,box-shadow] duration-75",
            ].join(" ")}
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
