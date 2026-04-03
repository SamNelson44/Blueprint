import Link from "next/link";
import { Navbar } from "@/components/Navbar";

/* ─────────────────────────────────────────────
   Blueprint — Landing Page Hero
   Design: High-Contrast Neo-Brutalism
   ───────────────────────────────────────────── */

export default function Hero() {
  return (
    <section className="relative min-h-screen bg-black flex flex-col overflow-hidden">

      {/* ── Brutal grid overlay (pure CSS, zero deps) ── */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      {/* ── Nav ── */}
      <div className="relative z-10">
        <Navbar />
      </div>

      {/* ── Hero body ── */}
      <div className="relative z-10 flex flex-1 flex-col items-start justify-center px-6 py-20 md:px-12 lg:px-20 max-w-[1400px] mx-auto w-full">

        {/* Badge */}
        <div className="mb-8 inline-flex items-center gap-2 border-2 border-[#D4FF00] px-3 py-1 shadow-hard-accent-sm">
          <span className="h-2 w-2 rounded-full bg-[#D4FF00] animate-pulse" />
          <span className="font-mono text-xs font-medium text-[#D4FF00] uppercase tracking-widest">
            Now in early access
          </span>
        </div>

        {/* H1 — the star of the show */}
        <h1 className="font-sans font-black uppercase leading-[0.92] tracking-tight text-white text-[clamp(3.5rem,10vw,9rem)] max-w-[18ch]">
          Turn your
          <br />
          expertise into
          <br />
          <span className="text-[#D4FF00]">a roadmap</span>
          <br />
          they pay for.
        </h1>

        {/* Sub-headline */}
        <p className="mt-8 max-w-xl font-mono text-base md:text-lg text-white/60 leading-relaxed">
          Blueprint is the creator platform for structured knowledge.
          Build interactive learning paths — called{" "}
          <em className="not-italic text-white font-medium">Blueprints</em> —
          sell them once, update forever.
        </p>

        {/* CTA row */}
        <div className="mt-10 flex flex-wrap items-center gap-4">
          <PrimaryButton href="/signup" size="lg">
            Start building free →
          </PrimaryButton>
          <GhostButton href="/blueprints">
            Explore blueprints
          </GhostButton>
        </div>

        {/* Social proof strip */}
        <div className="mt-16 flex flex-wrap items-center gap-x-8 gap-y-3">
          {[
            { value: "2,400+", label: "Blueprints published" },
            { value: "$1.2M",  label: "Earned by creators" },
            { value: "18K+",   label: "Active learners" },
          ].map(({ value, label }) => (
            <div key={label} className="flex flex-col">
              <span className="font-sans font-black text-2xl text-white">
                {value}
              </span>
              <span className="font-mono text-xs text-white/40 uppercase tracking-widest">
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Bottom accent bar ── */}
      <div className="relative z-10 h-2 w-full bg-[#D4FF00]" />
    </section>
  );
}

/* ─────────────────────────────────────────────
   Reusable Neo-Brutalist Button Primitives
   ───────────────────────────────────────────── */

type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps {
  href: string;
  children: React.ReactNode;
  size?: ButtonSize;
}

const sizeMap: Record<ButtonSize, string> = {
  sm: "px-4 py-2 text-sm",
  md: "px-5 py-2.5 text-sm",
  lg: "px-7 py-3.5 text-base",
};

/** Accent-filled, hard-shadow, push-down on hover */
function PrimaryButton({ href, children, size = "md" }: ButtonProps) {
  return (
    <Link
      href={href}
      className={[
        "group relative inline-flex items-center font-mono font-bold uppercase tracking-wide",
        "bg-[#D4FF00] text-black border-2 border-black",
        "shadow-hard-accent btn-push",
        "hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-hard-accent-sm",
        "active:translate-x-[4px] active:translate-y-[4px] active:shadow-none",
        sizeMap[size],
      ].join(" ")}
    >
      {children}
    </Link>
  );
}

/** Ghost — white border, transparent fill */
function GhostButton({ href, children, size = "md" }: ButtonProps) {
  return (
    <Link
      href={href}
      className={[
        "inline-flex items-center font-mono font-bold uppercase tracking-wide",
        "bg-transparent text-white border-2 border-white",
        "shadow-hard btn-push",
        "hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-hard-sm",
        "active:translate-x-[4px] active:translate-y-[4px] active:shadow-none",
        sizeMap[size],
      ].join(" ")}
    >
      {children}
    </Link>
  );
}
