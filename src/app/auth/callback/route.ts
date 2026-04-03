import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Handles the OAuth / email-confirmation code exchange.
 * Supabase redirects here after the user clicks the confirmation link.
 * URL shape: /auth/callback?code=<pkce_code>&next=/dashboard
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Exchange failed — send to login with error flag.
  return NextResponse.redirect(
    `${origin}/login?error=confirmation_failed`
  );
}
