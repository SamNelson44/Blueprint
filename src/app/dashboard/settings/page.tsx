import { redirect } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/Navbar";
import { SettingsForm } from "./SettingsForm";

export const metadata: Metadata = { title: "Settings — Blueprint" };

export default async function SettingsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, bio, avatar_url")
    .eq("id", user.id)
    .single();

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <Navbar />

      <main className="flex-1 px-6 py-10 max-w-xl mx-auto w-full">
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 font-mono text-xs text-white/40 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft size={13} /> Dashboard
          </Link>
          <h1 className="font-sans font-black text-white uppercase text-3xl tracking-tight">
            Settings
          </h1>
          <p className="mt-1 font-mono text-sm text-white/30">
            Your public profile and account details.
          </p>
        </div>

        <SettingsForm
          email={user.email ?? ""}
          defaultValues={{
            full_name: profile?.full_name ?? "",
            bio: profile?.bio ?? "",
            avatar_url: profile?.avatar_url ?? "",
          }}
        />
      </main>
    </div>
  );
}
