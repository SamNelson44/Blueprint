/* ─────────────────────────────────────────────
   Blueprint — Core Domain Types
   Single source of truth — mirrors DB schema
   ───────────────────────────────────────────── */

export type NodeType = "video" | "task" | "link";

export interface Blueprint {
  id: string;
  creator_id: string;
  slug: string;
  title: string;
  description: string;
  price: number;
  is_published: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface BlueprintNode {
  id: string;
  blueprint_id: string;
  order_index: number;
  title: string;
  content_markdown: string;
  type: NodeType;
}

export interface Enrollment {
  id: string;
  user_id: string;
  blueprint_id: string;
  enrolled_at: string;
}

export interface UserProgress {
  id: string;
  user_id: string;
  node_id: string;
  is_completed: boolean;
  completed_at?: string;
}

/* Form shape — derived from the zod schema to stay in sync */
export type { BlueprintSchemaValues as BlueprintFormValues } from "@/lib/validators";
