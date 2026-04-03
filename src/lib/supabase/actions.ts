"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { ProfileValues } from "@/lib/validators";

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function createBlueprint() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const slug = `untitled-blueprint-${Date.now()}`;

  const { data, error } = await supabase
    .from("blueprints")
    .insert({
      creator_id: user.id,
      title: "Untitled Blueprint",
      slug,
      description: "",
      price: 0,
      is_published: false,
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  redirect(`/dashboard/blueprints/${data.id}/edit`);
}

export async function enrollInBlueprint(
  blueprintId: string,
  blueprintSlug: string
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect(`/login?redirect=/blueprints/${blueprintSlug}`);

  // Guard: this action is for free blueprints only.
  // Paid blueprints must go through Stripe checkout.
  const { data: bp } = await supabase
    .from("blueprints")
    .select("price")
    .eq("id", blueprintId)
    .single();

  if (!bp || Number(bp.price) !== 0) {
    throw new Error("Paid blueprints must be purchased through checkout");
  }

  const { data: existing } = await supabase
    .from("enrollments")
    .select("id")
    .match({ user_id: user.id, blueprint_id: blueprintId })
    .maybeSingle();

  if (existing) redirect(`/blueprints/${blueprintSlug}/learn`);

  const { error } = await supabase
    .from("enrollments")
    .insert({ user_id: user.id, blueprint_id: blueprintId });

  if (error) throw new Error(error.message);

  redirect(`/blueprints/${blueprintSlug}/learn`);
}

export async function updateProfile(values: ProfileValues) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: values.full_name || null,
      bio: values.bio || null,
      avatar_url: values.avatar_url || null,
    })
    .eq("id", user.id);

  if (error) throw new Error(error.message);
}
