import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe";

export async function POST(request: Request) {
  try {
    // ── 1. Authenticate ──────────────────────────────────────────────
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ── 2. Parse + validate request body ────────────────────────────
    let blueprintId: string;
    try {
      const body = await request.json();
      if (typeof body?.blueprintId !== "string" || !body.blueprintId.trim()) {
        return NextResponse.json({ error: "Invalid request" }, { status: 400 });
      }
      blueprintId = body.blueprintId.trim();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    // ── 3. Fetch blueprint price from DB (never trust the client) ────
    const { data: blueprint, error: bpError } = await supabase
      .from("blueprints")
      .select("id, title, slug, price, is_published, creator_id")
      .eq("id", blueprintId)
      .eq("is_published", true)
      .single();

    if (bpError || !blueprint) {
      return NextResponse.json(
        { error: "Blueprint not found" },
        { status: 404 }
      );
    }

    // ── 4. Business rule guards ──────────────────────────────────────

    // Creators cannot buy their own blueprints
    if (blueprint.creator_id === user.id) {
      return NextResponse.json(
        { error: "You cannot purchase your own blueprint" },
        { status: 403 }
      );
    }

    // Free blueprints must go through the free enrollment path
    if (blueprint.price === 0) {
      return NextResponse.json(
        { error: "Use the free enrollment flow for free blueprints" },
        { status: 400 }
      );
    }

    // Prevent duplicate payment if already enrolled
    const { data: existing } = await supabase
      .from("enrollments")
      .select("id")
      .match({ user_id: user.id, blueprint_id: blueprint.id })
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: "Already enrolled" },
        { status: 409 }
      );
    }

    // ── 5. Build redirect URLs ───────────────────────────────────────
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3001";
    const successUrl = `${appUrl}/blueprints/${blueprint.slug}/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${appUrl}/blueprints/${blueprint.slug}`;

    // ── 6. Create Stripe Checkout Session ───────────────────────────
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: user.email,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            // Price is stored as NUMERIC(10,2) in DB — convert to cents
            unit_amount: Math.round(Number(blueprint.price) * 100),
            product_data: {
              name: blueprint.title,
              description: `Lifetime access to the "${blueprint.title}" Blueprint.`,
            },
          },
        },
      ],
      // Metadata is available in the webhook — this is how we
      // link the payment back to the correct user and blueprint.
      metadata: {
        blueprint_id: blueprint.id,
        blueprint_slug: blueprint.slug,
        user_id: user.id,
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
      // Expire the session after 30 minutes of inactivity
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
    });

    if (!session.url) {
      throw new Error("Stripe did not return a session URL");
    }

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[stripe/checkout]", err);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
