import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { BookOpen, CheckCircle } from "lucide-react";

/**
 * Stripe redirects here after a completed checkout:
 *   /blueprints/[slug]/success?session_id=cs_test_...
 *
 * We verify the session server-side before showing the confirmation.
 * If the session is invalid, missing, or unpaid we redirect away.
 */

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ session_id?: string }>;
}

export default async function CheckoutSuccessPage({
  params,
  searchParams,
}: Props) {
  const { slug } = await params;
  const { session_id } = await searchParams;

  if (!session_id) redirect(`/blueprints/${slug}`);

  // ── Verify the Stripe session ──────────────────────────────────────
  // Only runs when Stripe is configured.
  let blueprintTitle: string | null = null;

  if (process.env.STRIPE_SECRET_KEY) {
    try {
      const { stripe } = await import("@/lib/stripe");
      const session = await stripe.checkout.sessions.retrieve(session_id);

      if (session.payment_status !== "paid") {
        redirect(`/blueprints/${slug}`);
      }

      // Sanity-check the slug matches the metadata so one session can't
      // be used to show a success page for a different blueprint.
      if (session.metadata?.blueprint_slug !== slug) {
        notFound();
      }
    } catch {
      // Invalid session ID format or Stripe API error
      notFound();
    }
  }

  // Fetch the blueprint title for display
  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    try {
      const { createClient } = await import("@/lib/supabase/server");
      const supabase = await createClient();
      const { data } = await supabase
        .from("blueprints")
        .select("title")
        .eq("slug", slug)
        .single();
      blueprintTitle = data?.title ?? null;
    } catch {
      // Non-fatal — we still show the success page without the title
    }
  }

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-lg">
          {/* Card */}
          <div className="border-2 border-[#D4FF00] shadow-[8px_8px_0px_0px_#D4FF00] bg-[#0A0A0A] p-8 flex flex-col gap-6">
            {/* Icon + badge */}
            <div className="flex items-center gap-3">
              <CheckCircle size={28} className="text-[#D4FF00] shrink-0" />
              <span className="font-mono text-[10px] text-[#D4FF00] border border-[#D4FF00] px-2 py-0.5 uppercase tracking-widest">
                Payment confirmed
              </span>
            </div>

            {/* Headline */}
            <div>
              <h1 className="font-sans font-black text-white uppercase text-3xl md:text-4xl leading-[0.95] tracking-tight">
                You&apos;re Enrolled.
              </h1>
              <div className="mt-3 h-1 w-16 bg-[#D4FF00]" />
            </div>

            {/* Blueprint name */}
            {blueprintTitle && (
              <p className="font-mono text-sm text-white/50">
                <span className="text-white/30">Blueprint: </span>
                <span className="text-white">{blueprintTitle}</span>
              </p>
            )}

            <p className="font-mono text-xs text-white/40 leading-relaxed">
              Your payment was processed successfully. You now have lifetime
              access to this Blueprint. Start learning whenever you&apos;re ready.
            </p>

            <div className="h-px bg-white/10" />

            {/* CTA */}
            <Link
              href={`/blueprints/${slug}/learn`}
              className={[
                "w-full flex items-center justify-center gap-2 py-3.5",
                "font-mono font-bold text-sm uppercase tracking-widest",
                "bg-[#D4FF00] text-black border-2 border-black",
                "shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
                "hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]",
                "transition-[transform,box-shadow] duration-75",
              ].join(" ")}
            >
              <BookOpen size={14} /> Start Learning →
            </Link>

            <Link
              href="/blueprints"
              className="text-center font-mono text-xs text-white/30 hover:text-white/60 transition-colors duration-75"
            >
              ← Back to Explore
            </Link>
          </div>

          {/* Receipt note */}
          <p className="mt-4 text-center font-mono text-[10px] text-white/20">
            A receipt has been sent to your email by Stripe.
          </p>
        </div>
      </main>
    </div>
  );
}
