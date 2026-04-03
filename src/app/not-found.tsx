import Link from "next/link";
import { Navbar } from "@/components/Navbar";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Grid overlay */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="relative z-10">
        <Navbar />
      </div>

      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 text-center">
        {/* Giant 404 */}
        <p
          className="font-sans font-black text-white/5 select-none leading-none"
          style={{ fontSize: "clamp(8rem, 30vw, 20rem)" }}
          aria-hidden
        >
          404
        </p>

        {/* Overlaid content */}
        <div className="-mt-16 flex flex-col items-center gap-6">
          <div className="border-2 border-[#D4FF00] px-4 py-1 shadow-[4px_4px_0px_0px_#D4FF00]">
            <span className="font-mono text-xs font-bold text-[#D4FF00] uppercase tracking-[0.3em]">
              Page not found
            </span>
          </div>

          <h1 className="font-sans font-black text-white uppercase leading-none tracking-tight text-5xl md:text-7xl">
            Nothing
            <br />
            <span className="text-[#D4FF00]">here.</span>
          </h1>

          <p className="font-mono text-sm text-white/40 max-w-sm">
            The page you're looking for doesn't exist or was moved.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 mt-2">
            <Link
              href="/"
              className={[
                "px-6 py-3 font-mono font-bold text-sm uppercase tracking-widest",
                "bg-[#D4FF00] text-black border-2 border-black",
                "shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
                "hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]",
                "active:translate-x-[4px] active:translate-y-[4px] active:shadow-none",
                "transition-[transform,box-shadow] duration-75",
              ].join(" ")}
            >
              Go home
            </Link>
            <Link
              href="/blueprints"
              className={[
                "px-6 py-3 font-mono font-bold text-sm uppercase tracking-widest",
                "bg-transparent text-white border-2 border-white",
                "shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]",
                "hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]",
                "active:translate-x-[4px] active:translate-y-[4px] active:shadow-none",
                "transition-[transform,box-shadow] duration-75",
              ].join(" ")}
            >
              Explore blueprints
            </Link>
          </div>
        </div>
      </main>

      {/* Bottom accent bar */}
      <div className="relative z-10 h-2 w-full bg-[#D4FF00]" />
    </div>
  );
}
