import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";

// Always re-fetch from the DB — progress data is user-specific and changes
// frequently; stale cached renders would show outdated completion state.
export const dynamic = "force-dynamic";
import { LearnPageClient } from "./LearnPageClient";
import { PlayerSkeleton } from "@/components/player/PlayerSkeleton";
import type { Blueprint, BlueprintNode } from "@/lib/types";

/* ─────────────────────────────────────────────
   Helpers
   ───────────────────────────────────────────── */

function isSupabaseConfigured() {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

/* ─────────────────────────────────────────────
   Real data layer
   ───────────────────────────────────────────── */

async function getLiveData(slug: string): Promise<{
  blueprint: Blueprint;
  nodes: BlueprintNode[];
  completedIds: string[];
  userId: string;
}> {
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();

  // 1. Verify session — middleware handles redirect, but belt-and-suspenders.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // 2. Fetch blueprint by slug.
  const { data: blueprint, error: bpError } = await supabase
    .from("blueprints")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (bpError || !blueprint) notFound();

  // 3. Verify enrollment — redirect to purchase page if not enrolled.
  const { data: enrollment } = await supabase
    .from("enrollments")
    .select("id")
    .match({ user_id: user.id, blueprint_id: blueprint.id })
    .single();

  if (!enrollment) redirect(`/blueprints/${slug}`);

  // 4. Fetch nodes and progress in parallel.
  const [{ data: nodes }, { data: progress }] = await Promise.all([
    supabase
      .from("nodes")
      .select("*")
      .eq("blueprint_id", blueprint.id)
      .order("order_index"),
    supabase
      .from("user_progress")
      .select("node_id")
      .eq("user_id", user.id)
      .eq("is_completed", true),
  ]);

  const completedIds = (progress ?? []).map((r: { node_id: string }) => r.node_id);

  return {
    blueprint,
    nodes: nodes ?? [],
    completedIds,
    userId: user.id,
  };
}

/* ─────────────────────────────────────────────
   Mock data layer (used when Supabase is not configured)
   ───────────────────────────────────────────── */

async function getMockData(slug: string): Promise<{
  blueprint: Blueprint;
  nodes: BlueprintNode[];
  completedIds: string[];
  userId: string;
}> {
  const title = slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  const blueprint: Blueprint = {
    id: `bp-${slug}`,
    creator_id: "creator-123",
    slug,
    title,
    description: "A comprehensive, hands-on learning path.",
    price: 49,
    is_published: true,
  };

  const nodes: BlueprintNode[] = [
    {
      id: "n-1",
      blueprint_id: blueprint.id,
      order_index: 0,
      title: "Understanding the Web: How HTTP Works",
      type: "video",
      content_markdown: `## What You'll Learn

Before writing a single line of code, you need to understand the communication layer the internet runs on.

**The Request/Response Cycle** is the foundation of everything. When you type a URL into a browser:

1. Your browser sends an **HTTP Request** to a server
2. The server processes the request
3. It sends back an **HTTP Response** with data

> Every API call, every page load, every form submission — it's all HTTP under the hood.

## Status Codes You Must Know

\`\`\`
200 OK           — Request succeeded
301 Redirect     — Resource moved permanently
401 Unauthorized — Auth required
404 Not Found    — Resource doesn't exist
500 Server Error — Something broke on the server
\`\`\`

## A Real HTTP Request

\`\`\`http
GET /api/users/42 HTTP/1.1
Host: api.example.com
Authorization: Bearer eyJhbGci...
Accept: application/json
\`\`\`

Understanding these headers will make **debugging API issues 10x faster**.`,
    },
    {
      id: "n-2",
      blueprint_id: blueprint.id,
      order_index: 1,
      title: "Set Up Your Development Environment",
      type: "task",
      content_markdown: `## Your Mission

Install every tool you'll need before writing a single line of application code.

## Required Installations

**1. Node Version Manager**

\`\`\`bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
\`\`\`

**2. Node.js LTS**

\`\`\`bash
nvm install --lts
nvm use --lts
node -v  # should print v20.x.x
\`\`\`

**3. Verify everything works**

\`\`\`bash
node -v    # v20+
npm -v     # 10+
git --version
\`\`\`

If all three print a version, **you're ready.**`,
    },
    {
      id: "n-3",
      blueprint_id: blueprint.id,
      order_index: 2,
      title: "HTML Foundations: Structure Before Style",
      type: "task",
      content_markdown: `## Why HTML First?

Every framework compiles down to HTML. Master the foundation and nothing will confuse you.

\`\`\`html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>My First Page</title>
  </head>
  <body>
    <main>
      <h1>Hello, World</h1>
      <p>This is semantic HTML.</p>
    </main>
  </body>
</html>
\`\`\`

Use **semantic elements** — they matter for accessibility and SEO:

- \`<article>\` — self-contained content
- \`<section>\` — thematic grouping
- \`<nav>\` — navigation links
- \`<main>\` — primary content`,
    },
    {
      id: "n-4",
      blueprint_id: blueprint.id,
      order_index: 3,
      title: "CSS: The Box Model & Flexbox",
      type: "video",
      content_markdown: `## Every Element is a Box

Understanding the box model means you can lay out anything.

\`\`\`css
.card {
  /* Content → Padding → Border → Margin */
  padding: 1rem;
  border: 2px solid white;
  margin: 0 auto;
  box-sizing: border-box; /* always use this */
}
\`\`\`

## Flexbox in 60 Seconds

\`\`\`css
.container {
  display: flex;
  justify-content: center;  /* horizontal */
  align-items: center;      /* vertical */
  gap: 1rem;
}
\`\`\`

**That's 90% of what you'll use in production.**`,
    },
    {
      id: "n-5",
      blueprint_id: blueprint.id,
      order_index: 4,
      title: "Your First JavaScript Program",
      type: "task",
      content_markdown: `## Time to Write Real Code

\`\`\`javascript
const name = "Blueprint Learner";

function greet(who) {
  return \`Hello, \${who}! Ready to build?\`;
}

const steps = ["HTML", "CSS", "JavaScript", "React"];

steps.forEach((step, index) => {
  console.log(\`Step \${index + 1}: \${step}\`);
});

console.log(greet(name));
\`\`\`

Run it:

\`\`\`bash
node index.js
\`\`\`

Expected output:

\`\`\`
Step 1: HTML
Step 2: CSS
Step 3: JavaScript
Step 4: React
Hello, Blueprint Learner! Ready to build?
\`\`\`

**If you see that output — you're a programmer.**`,
    },
  ];

  return {
    blueprint,
    nodes,
    completedIds: ["n-1"],
    userId: "mock-user-id",
  };
}

/* ─────────────────────────────────────────────
   Metadata
   ───────────────────────────────────────────── */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const title = slug.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  return { title: `${title} — Blueprint` };
}

/* ─────────────────────────────────────────────
   Page
   ───────────────────────────────────────────── */

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function LearnPage({ params }: Props) {
  const { slug } = await params;

  const data = isSupabaseConfigured()
    ? await getLiveData(slug)
    : await getMockData(slug);

  return (
    <Suspense fallback={<PlayerSkeleton />}>
      <LearnPageClient
        blueprint={data.blueprint}
        nodes={data.nodes}
        initialCompletedIds={data.completedIds}
        userId={data.userId}
      />
    </Suspense>
  );
}
