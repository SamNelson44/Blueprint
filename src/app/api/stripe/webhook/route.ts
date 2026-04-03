import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createClient } from "@supabase/supabase-js";
import type Stripe from "stripe";

/**
 * SECURITY NOTES:
 *
 * 1. Raw body required — we read request.text() before any JSON.parse().
 *    Next.js App Router does NOT pre-parse the body, so this is correct.
 *    Never use request.json() here; it would break signature verification.
 *
 * 2. Signature verification — constructEvent() throws if the signature
 *    doesn't match. Any tampered or forged request is rejected before we
 *    touch the database.
 *
 * 3. Idempotency — we check stripe_session_id BEFORE inserting.
 *    Stripe guarantees at-least-once delivery, so the same event may
 *    arrive multiple times. The UNIQUE constraint on stripe_session_id
 *    is a second safety net, but we guard explicitly to avoid a DB error
 *    being misread as a 500 (which would cause Stripe to keep retrying).
 *
 * 4. We use the Supabase service-role client here so RLS does not block
 *    the insert — the webhook runs as a trusted server process, not as
 *    a user session.  The service key MUST be kept server-side only.
 *
 * 5. We return 200 for events we intentionally ignore. Returning non-2xx
 *    for an unrecognised event type would cause Stripe to retry forever.
 */

// Service-role client bypasses RLS — safe because we verify the Stripe
// signature before any DB write. Never expose this key client-side.
function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(request: Request) {
  // ── 1. Read raw body (must be text, not parsed JSON) ──────────────
  const rawBody = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.error("[webhook] STRIPE_WEBHOOK_SECRET is not set");
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
    );
  }

  // ── 2. Verify signature — rejects any forged request ──────────────
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    // Invalid signature — log but do NOT expose details in response
    console.error("[webhook] Signature verification failed:", err);
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    );
  }

  // ── 3. Route event types ───────────────────────────────────────────
  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(event.data.object);
        break;

      // Explicitly acknowledge events we don't need to act on
      default:
        break;
    }
  } catch (err) {
    // Return 500 so Stripe retries — only for unexpected failures
    console.error(`[webhook] Handler error for ${event.type}:`, err);
    return NextResponse.json(
      { error: "Handler failed" },
      { status: 500 }
    );
  }

  // Always return 200 after verified processing
  return NextResponse.json({ received: true });
}

async function handleCheckoutCompleted(
  session: Stripe.Checkout.Session
): Promise<void> {
  // Verify the payment actually succeeded (could be free-mode or pending)
  if (session.payment_status !== "paid") {
    console.log(`[webhook] Session ${session.id} not paid yet — skipping`);
    return;
  }

  // ── Extract metadata set in the checkout route ─────────────────────
  const { blueprint_id, blueprint_slug, user_id } = session.metadata ?? {};

  if (!blueprint_id || !blueprint_slug || !user_id) {
    // This should never happen for sessions we created, but guard anyway
    console.error("[webhook] Missing metadata on session:", session.id);
    throw new Error("Session metadata incomplete");
  }

  const supabase = getServiceClient();

  // ── Idempotency check — has this session already created an enrollment?
  const { data: existing } = await supabase
    .from("enrollments")
    .select("id")
    .eq("stripe_session_id", session.id)
    .maybeSingle();

  if (existing) {
    console.log(`[webhook] Session ${session.id} already processed — skipping`);
    return;
  }

  // ── Create enrollment ───────────────────────────────────────────────
  const { error } = await supabase.from("enrollments").insert({
    user_id,
    blueprint_id,
    stripe_session_id: session.id,
  });

  if (error) {
    // If it's a unique constraint violation on (user_id, blueprint_id),
    // the user was already enrolled through another path — not an error.
    if (error.code === "23505") {
      console.log(`[webhook] User ${user_id} already enrolled in ${blueprint_id}`);
      return;
    }
    console.error("[webhook] Failed to create enrollment:", error);
    throw new Error(error.message);
  }

  console.log(
    `[webhook] Enrolled user ${user_id} in blueprint ${blueprint_id} via session ${session.id}`
  );
}
