import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Video, CheckSquare, Link2, Lock, BookOpen, Pencil } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { enrollInBlueprint } from "@/lib/supabase/actions";
import { Navbar } from "@/components/Navbar";
import { CheckoutButton } from "@/components/CheckoutButton";
import type { NodeType } from "@/lib/types";

/* ─────────────────────────────────────────────
   Types
   ───────────────────────────────────────────── */

interface NodePreview {
  id: string;
  title: string;
  type: NodeType;
  order_index: number;
}

interface BlueprintDetail {
  id: string;
  slug: string;
  title: string;
  description: string;
  price: number;
  creator_id: string;
  profiles: { full_name: string | null; bio: string | null } | null;
}

const TYPE_ICONS: Record<NodeType, React.ReactNode> = {
  video: <Video size={12} />,
  task: <CheckSquare size={12} />,
  link: <Link2 size={12} />,
};

/* ─────────────────────────────────────────────
   Metadata
   ───────────────────────────────────────────── */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("blueprints")
    .select("title, description")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (!data) return { title: "Blueprint Not Found" };

  return {
    title: `${data.title} — Blueprint`,
    description: data.description,
  };
}

/* ─────────────────────────────────────────────
   Page
   ───────────────────────────────────────────── */

export default async function BlueprintLandingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  // Fetch blueprint + creator profile
  const { data: raw } = await supabase
    .from("blueprints")
    .select(`
      id, slug, title, description, price, creator_id,
      profiles ( full_name, bio )
    `)
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (!raw) notFound();

  const blueprint: BlueprintDetail = {
    ...raw,
    profiles: Array.isArray(raw.profiles) ? raw.profiles[0] : raw.profiles,
  };

  // Fetch node previews (title + type only — content stays locked)
  const { data: nodes } = await supabase
    .from("nodes")
    .select("id, title, type, order_index")
    .eq("blueprint_id", blueprint.id)
    .order("order_index");

  const nodeList: NodePreview[] = nodes ?? [];

  // Check current user's relationship to this blueprint
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isCreator = user?.id === blueprint.creator_id;

  let isEnrolled = false;
  if (user && !isCreator) {
    const { data: enrollment } = await supabase
      .from("enrollments")
      .select("id")
      .match({ user_id: user.id, blueprint_id: blueprint.id })
      .maybeSingle();
    isEnrolled = !!enrollment;
  }

  const isFree = blueprint.price === 0;

  // Server action bound to this blueprint
  const enroll = enrollInBlueprint.bind(null, blueprint.id, blueprint.slug);

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <Navbar />

      <main className="flex-1 px-6 py-12 max-w-6xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-10 items-start">
          {/* ── LEFT — Blueprint info ── */}
          <div className="flex flex-col gap-8">
            {/* Header */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="font-mono text-[10px] text-white/30 border border-white/20 px-2 py-0.5 uppercase tracking-widest">
                  Blueprint
                </span>
                <span className="font-mono text-[10px] text-white/30">
                  {nodeList.length} steps
                </span>
              </div>

              <h1 className="font-sans font-black text-white uppercase text-4xl md:text-5xl leading-[0.9] tracking-tight">
                {blueprint.title}
              </h1>
              <div className="mt-4 h-1 w-20 bg-[#D4FF00]" />
            </div>

            {/* Creator */}
            {blueprint.profiles?.full_name && (
              <div className="flex flex-col gap-1 border-l-2 border-[#D4FF00] pl-4">
                <span className="font-mono text-[10px] text-white/30 uppercase tracking-widest">
                  Created by
                </span>
                <span className="font-sans font-bold text-white">
                  {blueprint.profiles.full_name}
                </span>
                {blueprint.profiles.bio && (
                  <p className="font-mono text-xs text-white/40 leading-relaxed">
                    {blueprint.profiles.bio}
                  </p>
                )}
              </div>
            )}

            {/* Description */}
            {blueprint.description && (
              <div className="flex flex-col gap-2">
                <span className="font-mono text-[10px] text-white/30 uppercase tracking-widest">
                  About this Blueprint
                </span>
                <p className="font-sans text-white/70 text-base leading-relaxed">
                  {blueprint.description}
                </p>
              </div>
            )}

            {/* Node list preview */}
            {nodeList.length > 0 && (
              <div className="flex flex-col gap-3">
                <span className="font-mono text-[10px] text-white/30 uppercase tracking-widest">
                  What's inside
                </span>
                <div className="flex flex-col gap-2">
                  {nodeList.map((node) => {
                    const locked = !isEnrolled && !isCreator;
                    return (
                      <div
                        key={node.id}
                        className="flex items-center gap-3 border border-white/10 px-4 py-3 bg-[#0A0A0A]"
                      >
                        <span className="font-mono text-xs text-white/20 w-5 text-right shrink-0">
                          {node.order_index + 1}
                        </span>
                        <span className="text-white/30 shrink-0">
                          {TYPE_ICONS[node.type]}
                        </span>
                        <span
                          className={
                            locked
                              ? "font-sans text-sm text-white/40 flex-1"
                              : "font-sans text-sm text-white flex-1 font-medium"
                          }
                        >
                          {node.title || "Untitled"}
                        </span>
                        {locked && (
                          <Lock size={11} className="text-white/20 shrink-0" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* ── RIGHT — Sticky purchase card ── */}
          <div className="lg:sticky lg:top-8">
            <div className="border-2 border-white shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] bg-[#0A0A0A] p-6 flex flex-col gap-5">
              {/* Price */}
              <div className="flex flex-col gap-1">
                <span className="font-mono text-[10px] text-white/30 uppercase tracking-widest">
                  Price
                </span>
                <span className="font-sans font-black text-[#D4FF00] text-4xl">
                  {isFree ? "Free" : `$${Number(blueprint.price).toFixed(2)}`}
                </span>
                {!isFree && (
                  <span className="font-mono text-xs text-white/30">
                    One-time purchase · Lifetime access
                  </span>
                )}
              </div>

              <div className="h-px bg-white/10" />

              {/* CTA */}
              {isCreator ? (
                /* Creator sees edit button */
                <Link
                  href={`/dashboard/blueprints/${blueprint.id}/edit`}
                  className={[
                    "w-full flex items-center justify-center gap-2 py-3.5",
                    "font-mono font-bold text-sm uppercase tracking-widest",
                    "border-2 border-white text-white",
                    "shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]",
                    "hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]",
                    "transition-[transform,box-shadow] duration-75",
                  ].join(" ")}
                >
                  <Pencil size={14} /> Edit Blueprint
                </Link>
              ) : isEnrolled ? (
                /* Already enrolled */
                <Link
                  href={`/blueprints/${blueprint.slug}/learn`}
                  className={[
                    "w-full flex items-center justify-center gap-2 py-3.5",
                    "font-mono font-bold text-sm uppercase tracking-widest",
                    "bg-[#D4FF00] text-black border-2 border-black",
                    "shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
                    "hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]",
                    "transition-[transform,box-shadow] duration-75",
                  ].join(" ")}
                >
                  <BookOpen size={14} /> Continue Learning →
                </Link>
              ) : isFree ? (
                /* Free — enroll immediately */
                <form action={enroll}>
                  <button
                    type="submit"
                    className={[
                      "w-full flex items-center justify-center gap-2 py-3.5",
                      "font-mono font-bold text-sm uppercase tracking-widest",
                      "bg-[#D4FF00] text-black border-2 border-black",
                      "shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
                      "hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]",
                      "active:translate-x-[4px] active:translate-y-[4px] active:shadow-none",
                      "transition-[transform,box-shadow] duration-75",
                    ].join(" ")}
                  >
                    <BookOpen size={14} /> Enroll Free →
                  </button>
                </form>
              ) : (
                /* Paid — Stripe Checkout */
                <CheckoutButton blueprintId={blueprint.id} price={blueprint.price} />
              )}

              {!user && (
                <p className="text-center font-mono text-xs text-white/30">
                  <Link
                    href={`/login?redirect=/blueprints/${blueprint.slug}`}
                    className="text-[#D4FF00] hover:underline"
                  >
                    Sign in
                  </Link>{" "}
                  to enroll.
                </p>
              )}

              {/* What you get */}
              <div className="flex flex-col gap-2 pt-1">
                {[
                  `${nodeList.length} structured steps`,
                  "Progress tracking",
                  "Lifetime access",
                  "Works at your own pace",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 bg-[#D4FF00] shrink-0" />
                    <span className="font-mono text-xs text-white/40">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
