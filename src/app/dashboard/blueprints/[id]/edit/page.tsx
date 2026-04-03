import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { EditPageClient } from "./EditPageClient";
import type { Blueprint, BlueprintNode } from "@/lib/types";

export const metadata: Metadata = {
  title: "Blueprint Editor — Blueprint",
};

function isSupabaseConfigured() {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

/* ─────────────────────────────────────────────
   Real data layer
   ───────────────────────────────────────────── */

async function getLiveData(id: string): Promise<{
  blueprint: Blueprint;
  nodes: BlueprintNode[];
  userId: string;
}> {
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Fetch blueprint — RLS ensures only the creator can read their own drafts.
  const { data: blueprint, error } = await supabase
    .from("blueprints")
    .select("*")
    .eq("id", id)
    .eq("creator_id", user.id)
    .single();

  if (error || !blueprint) notFound();

  const { data: nodes } = await supabase
    .from("nodes")
    .select("*")
    .eq("blueprint_id", id)
    .order("order_index");

  return { blueprint, nodes: nodes ?? [], userId: user.id };
}

/* ─────────────────────────────────────────────
   Mock data layer
   ───────────────────────────────────────────── */

async function getMockData(id: string): Promise<{
  blueprint: Blueprint;
  nodes: BlueprintNode[];
  userId: string;
}> {
  const blueprint: Blueprint = {
    id,
    creator_id: "mock-creator-id",
    slug: "full-stack-development-in-30-days",
    title: "Full-Stack Development in 30 Days",
    description:
      "A structured, practical roadmap taking complete beginners from zero to deploying their first production web app.",
    price: 49,
    is_published: false,
  };

  const nodes: BlueprintNode[] = [
    {
      id: "node-1",
      blueprint_id: id,
      order_index: 0,
      title: "Understanding the Web: How HTTP Works",
      content_markdown:
        "## What You'll Learn\n\nBefore writing a single line of code, you need to understand the communication layer the internet runs on.\n\n- **Request/Response cycle**\n- Status codes (200, 404, 500)\n- Headers and cookies\n\n> This knowledge will make debugging 10x easier.",
      type: "video",
    },
    {
      id: "node-2",
      blueprint_id: id,
      order_index: 1,
      title: "Set Up Your Development Environment",
      content_markdown:
        "## Task\n\nInstall the following tools before moving on:\n\n1. `nvm`\n2. Node.js 20 LTS\n3. VS Code\n4. Git\n\nRun `node -v` to confirm.",
      type: "task",
    },
    {
      id: "node-3",
      blueprint_id: id,
      order_index: 2,
      title: "Essential Reading: MDN HTML Guide",
      content_markdown: "",
      type: "link",
    },
  ];

  return { blueprint, nodes, userId: "mock-creator-id" };
}

/* ─────────────────────────────────────────────
   Page
   ───────────────────────────────────────────── */

interface Props {
  params: Promise<{ id: string }>;
}

export default async function BlueprintEditPage({ params }: Props) {
  const { id } = await params;

  const { blueprint, nodes, userId } = isSupabaseConfigured()
    ? await getLiveData(id)
    : await getMockData(id);

  return (
    <EditPageClient
      blueprint={blueprint}
      initialNodes={nodes}
      userId={userId}
    />
  );
}
