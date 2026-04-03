import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { BookOpen, Video, CheckSquare, Link2, ArrowRight } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import type { NodeType } from "@/lib/types";

export const metadata: Metadata = {
  title: "Explore Blueprints — Blueprint",
  description: "Browse expert-built learning roadmaps across every discipline.",
};

const TYPE_ICONS: Record<NodeType, React.ReactNode> = {
  video: <Video size={10} />,
  task: <CheckSquare size={10} />,
  link: <Link2 size={10} />,
};

/* Supabase returns joined rows — define the shape here */
interface BlueprintRow {
  id: string;
  slug: string;
  title: string;
  description: string;
  price: number;
  profiles: { full_name: string | null } | null;
  /* node_count via aggregate — see query below */
  node_count: number;
}

export default async function ExplorePage() {
  const supabase = await createClient();

  /*
   * Fetch published blueprints with:
   *  - creator display name
   *  - total node count (via count on the nodes sub-table)
   * Public RLS policy allows this without auth.
   */
  const { data } = await supabase
    .from("blueprints")
    .select(`
      id,
      slug,
      title,
      description,
      price,
      profiles ( full_name ),
      node_count:nodes ( count )
    `)
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  /* Supabase returns count as [{ count: n }] — normalise it */
  const blueprints: BlueprintRow[] = (data ?? []).map((row) => ({
    ...row,
    profiles: Array.isArray(row.profiles) ? row.profiles[0] : row.profiles,
    node_count: Array.isArray(row.node_count)
      ? (row.node_count[0] as { count: number }).count
      : 0,
  }));

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <Navbar />

      <main className="flex-1 px-6 py-12 max-w-6xl mx-auto w-full">
        {/* ── Header ── */}
        <div className="mb-10">
          <h1 className="font-sans font-black text-white uppercase text-4xl md:text-5xl tracking-tight leading-none">
            Explore
            <br />
            <span className="text-[#D4FF00]">Blueprints.</span>
          </h1>
          <p className="mt-4 font-mono text-sm text-white/40 max-w-lg">
            Expert-built learning roadmaps. Buy once, work through at your own
            pace, track every step.
          </p>
          {blueprints.length > 0 && (
            <p className="mt-2 font-mono text-xs text-white/20">
              {blueprints.length} blueprint{blueprints.length !== 1 ? "s" : ""}{" "}
              available
            </p>
          )}
        </div>

        {/* ── Empty state ── */}
        {blueprints.length === 0 && (
          <div className="flex flex-col items-center justify-center py-32 border-2 border-dashed border-white/20 gap-4 text-center">
            <BookOpen size={36} className="text-white/20" />
            <p className="font-sans font-bold text-white/30">
              No blueprints published yet.
            </p>
            <p className="font-mono text-xs text-white/20">
              Be the first —{" "}
              <Link href="/signup" className="text-[#D4FF00] hover:underline">
                create an account
              </Link>{" "}
              and publish yours.
            </p>
          </div>
        )}

        {/* ── Grid ── */}
        {blueprints.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {blueprints.map((bp) => (
              <Link
                key={bp.id}
                href={`/blueprints/${bp.slug}`}
                className={[
                  "group flex flex-col border-2 border-white bg-[#0A0A0A] p-5 gap-4",
                  "shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]",
                  "hover:shadow-[4px_4px_0px_0px_#D4FF00] hover:border-[#D4FF00]",
                  "transition-[box-shadow,border-color] duration-100",
                ].join(" ")}
              >
                {/* Title */}
                <h2 className="font-sans font-black text-white text-base leading-snug group-hover:text-[#D4FF00] transition-colors">
                  {bp.title}
                </h2>

                {/* Description */}
                {bp.description ? (
                  <p className="font-mono text-xs text-white/40 leading-relaxed line-clamp-2 flex-1">
                    {bp.description}
                  </p>
                ) : (
                  <div className="flex-1" />
                )}

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-white/10">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-mono text-lg font-bold text-[#D4FF00]">
                      {bp.price > 0
                        ? `$${Number(bp.price).toFixed(2)}`
                        : "Free"}
                    </span>
                    <div className="flex items-center gap-2 font-mono text-[10px] text-white/30">
                      <span>{bp.node_count} steps</span>
                      {bp.profiles?.full_name && (
                        <>
                          <span>·</span>
                          <span>{bp.profiles.full_name}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <ArrowRight
                    size={16}
                    className="text-white/30 group-hover:text-[#D4FF00] group-hover:translate-x-1 transition-[color,transform] duration-100"
                  />
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
