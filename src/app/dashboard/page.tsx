import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { createBlueprint } from "@/lib/supabase/actions";
import { Navbar } from "@/components/Navbar";
import {
  Plus,
  Pencil,
  Globe,
  Lock,
  BookOpen,
  ArrowRight,
} from "lucide-react";

export const metadata: Metadata = { title: "Dashboard — Blueprint" };

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Fetch created blueprints + enrolled blueprints in parallel
  const [{ data: created }, { data: enrollments }] = await Promise.all([
    supabase
      .from("blueprints")
      .select("id, title, slug, description, price, is_published, updated_at")
      .eq("creator_id", user.id)
      .order("updated_at", { ascending: false }),

    supabase
      .from("enrollments")
      .select(`
        enrolled_at,
        blueprints (
          id, slug, title, description, price,
          nodes ( count )
        )
      `)
      .eq("user_id", user.id)
      .order("enrolled_at", { ascending: false }),
  ]);

  const myBlueprints = created ?? [];
  const publishedCount = myBlueprints.filter((b) => b.is_published).length;

  // Normalise the nested Supabase aggregate shape
  const enrolled = (enrollments ?? [])
    .map((e) => {
      const bp = Array.isArray(e.blueprints) ? e.blueprints[0] : e.blueprints;
      if (!bp) return null;
      const nodeCount = Array.isArray(bp.nodes)
        ? (bp.nodes[0] as { count: number }).count
        : 0;
      return { ...bp, node_count: nodeCount, enrolled_at: e.enrolled_at };
    })
    .filter(Boolean) as {
      id: string;
      slug: string;
      title: string;
      description: string;
      price: number;
      node_count: number;
      enrolled_at: string;
    }[];

  // Fetch completed node counts for each enrolled blueprint
  const enrolledBlueprintIds = enrolled.map((e) => e.id);
  const completedByBlueprint = new Map<string, number>();

  if (enrolledBlueprintIds.length > 0) {
    const { data: enrolledNodes } = await supabase
      .from("nodes")
      .select("id, blueprint_id")
      .in("blueprint_id", enrolledBlueprintIds);

    const nodeToBlueprint = new Map<string, string>();
    (enrolledNodes ?? []).forEach((n) => nodeToBlueprint.set(n.id, n.blueprint_id));

    const enrolledNodeIds = (enrolledNodes ?? []).map((n) => n.id);
    if (enrolledNodeIds.length > 0) {
      const { data: progress } = await supabase
        .from("user_progress")
        .select("node_id")
        .eq("user_id", user.id)
        .eq("is_completed", true)
        .in("node_id", enrolledNodeIds);

      (progress ?? []).forEach((p) => {
        const bpId = nodeToBlueprint.get(p.node_id);
        if (bpId) completedByBlueprint.set(bpId, (completedByBlueprint.get(bpId) ?? 0) + 1);
      });
    }
  }

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <Navbar />

      <main className="flex-1 px-6 py-10 max-w-5xl mx-auto w-full flex flex-col gap-14">

        {/* ── SECTION: My Blueprints ── */}
        <section>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-6">
            <div>
              <h1 className="font-sans font-black text-white uppercase text-3xl md:text-4xl tracking-tight leading-tight">
                My Blueprints
              </h1>
              <p className="mt-1 font-mono text-sm text-white/30">
                {myBlueprints.length} total &middot; {publishedCount} published
              </p>
            </div>

            <form action={createBlueprint}>
              <button
                type="submit"
                className={[
                  "flex items-center gap-2 px-5 py-3",
                  "bg-[#D4FF00] text-black border-2 border-black font-mono font-bold text-sm uppercase tracking-widest",
                  "shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
                  "hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]",
                  "active:translate-x-[4px] active:translate-y-[4px] active:shadow-none",
                  "transition-[transform,box-shadow] duration-75",
                ].join(" ")}
              >
                <Plus size={15} /> New Blueprint
              </button>
            </form>
          </div>

          {myBlueprints.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed border-white/20 text-center gap-3">
              <BookOpen size={28} className="text-white/20" />
              <p className="font-sans font-bold text-white/30">No blueprints yet.</p>
              <p className="font-mono text-sm text-white/20">
                Click "New Blueprint" to create your first one.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myBlueprints.map((bp) => (
                <div
                  key={bp.id}
                  className="flex flex-col border-2 border-white bg-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] p-5 gap-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="font-sans font-black text-white text-base leading-snug">
                      {bp.title}
                    </h2>
                    <span
                      className={[
                        "shrink-0 flex items-center gap-1 font-mono text-[10px] uppercase tracking-widest px-2 py-0.5 border",
                        bp.is_published
                          ? "border-[#D4FF00] text-[#D4FF00]"
                          : "border-white/30 text-white/30",
                      ].join(" ")}
                    >
                      {bp.is_published ? <Globe size={9} /> : <Lock size={9} />}
                      {bp.is_published ? "Published" : "Draft"}
                    </span>
                  </div>

                  {bp.description ? (
                    <p className="font-mono text-xs text-white/40 leading-relaxed line-clamp-2">
                      {bp.description}
                    </p>
                  ) : (
                    <p className="font-mono text-xs text-white/20 italic">No description yet.</p>
                  )}

                  <div className="flex items-center justify-between mt-auto pt-3 border-t border-white/10">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm font-bold text-[#D4FF00]">
                        {bp.price > 0 ? `$${Number(bp.price).toFixed(2)}` : "Free"}
                      </span>
                      {bp.is_published && (
                        <Link
                          href={`/blueprints/${bp.slug}`}
                          className="font-mono text-[10px] text-white/30 hover:text-white transition-colors underline underline-offset-2"
                        >
                          View page
                        </Link>
                      )}
                    </div>
                    <Link
                      href={`/dashboard/blueprints/${bp.id}/edit`}
                      className={[
                        "flex items-center gap-1.5 px-3 py-1.5",
                        "font-mono text-xs font-bold uppercase tracking-widest",
                        "border-2 border-white text-white",
                        "shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]",
                        "hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(255,255,255,1)]",
                        "active:translate-x-[2px] active:translate-y-[2px] active:shadow-none",
                        "transition-[transform,box-shadow] duration-75",
                      ].join(" ")}
                    >
                      <Pencil size={11} /> Edit
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── SECTION: Enrolled Blueprints ── */}
        <section>
          <div className="mb-6">
            <h2 className="font-sans font-black text-white uppercase text-2xl md:text-3xl tracking-tight leading-tight">
              Learning
            </h2>
            <p className="mt-1 font-mono text-sm text-white/30">
              {enrolled.length} enrolled blueprint{enrolled.length !== 1 ? "s" : ""}
            </p>
          </div>

          {enrolled.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed border-white/20 text-center gap-3">
              <BookOpen size={28} className="text-white/20" />
              <p className="font-sans font-bold text-white/30">Not enrolled in anything yet.</p>
              <Link
                href="/blueprints"
                className="font-mono text-sm text-[#D4FF00] hover:underline flex items-center gap-1"
              >
                Browse blueprints <ArrowRight size={12} />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {enrolled.map((bp) => {
                const completed = completedByBlueprint.get(bp.id) ?? 0;
                const total = bp.node_count;
                const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
                const isFinished = total > 0 && completed >= total;

                return (
                  <div
                    key={bp.id}
                    className="flex flex-col border-2 border-white/30 bg-[#0A0A0A] shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)] p-5 gap-4"
                  >
                    <div>
                      <h3 className="font-sans font-black text-white text-base leading-snug">
                        {bp.title}
                      </h3>
                      {bp.description && (
                        <p className="mt-1 font-mono text-xs text-white/40 line-clamp-2">
                          {bp.description}
                        </p>
                      )}
                    </div>

                    {/* Progress bar */}
                    {total > 0 && (
                      <div className="flex flex-col gap-1.5">
                        <div className="h-2 w-full bg-white/10 border border-white/10">
                          <div
                            className="h-full bg-[#D4FF00] transition-[width] duration-300"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[10px] text-white/30">
                            {completed} / {total} steps
                          </span>
                          {isFinished ? (
                            <span className="font-mono text-[10px] text-[#D4FF00] uppercase tracking-widest">
                              ✓ Complete
                            </span>
                          ) : (
                            <span className="font-mono text-[10px] text-white/30">
                              {pct}%
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-end mt-auto pt-3 border-t border-white/10">
                      <Link
                        href={`/blueprints/${bp.slug}/learn`}
                        className={[
                          "flex items-center gap-1.5 px-3 py-1.5",
                          "font-mono text-xs font-bold uppercase tracking-widest",
                          "bg-[#D4FF00] text-black border-2 border-black",
                          "shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]",
                          "hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]",
                          "active:translate-x-[2px] active:translate-y-[2px] active:shadow-none",
                          "transition-[transform,box-shadow] duration-75",
                        ].join(" ")}
                      >
                        <BookOpen size={11} /> {isFinished ? "Review" : "Continue"}
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

      </main>
    </div>
  );
}
