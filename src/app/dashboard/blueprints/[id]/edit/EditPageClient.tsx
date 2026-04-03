"use client";

import { useState, useCallback, useRef } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { blueprintSchema, type BlueprintSchemaValues } from "@/lib/validators";
import { MetaPanel } from "@/components/blueprint-editor/MetaPanel";
import { NodeList } from "@/components/blueprint-editor/NodeList";
import { PropertiesPanel } from "@/components/blueprint-editor/PropertiesPanel";
import type { Blueprint, BlueprintNode } from "@/lib/types";

type BlueprintFormValues = BlueprintSchemaValues;

function isSupabaseConfigured() {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

async function saveBlueprintToDb(
  blueprint: BlueprintSchemaValues & { id: string; creator_id: string },
  nodes: BlueprintNode[],
  deletedNodeIds: string[]
): Promise<void> {
  if (!isSupabaseConfigured()) {
    await new Promise((res) => setTimeout(res, 600));
    return;
  }

  const { createClient } = await import("@/lib/supabase/client");
  const supabase = createClient();

  const { error: bpError } = await supabase
    .from("blueprints")
    .upsert(blueprint, { onConflict: "id" });

  if (bpError) {
    // Surface slug conflicts as a human-readable message
    if (bpError.message.includes("blueprints_slug_key") ||
        bpError.message.includes("unique constraint")) {
      throw new Error("That URL slug is already taken — try a different one.");
    }
    throw new Error(bpError.message);
  }

  if (nodes.length > 0) {
    const { error: nodesError } = await supabase
      .from("nodes")
      .upsert(nodes, { onConflict: "id" });
    if (nodesError) throw new Error(nodesError.message);
  }

  if (deletedNodeIds.length > 0) {
    const { error: deleteError } = await supabase
      .from("nodes")
      .delete()
      .in("id", deletedNodeIds);
    if (deleteError) throw new Error(deleteError.message);
  }
}

interface EditPageClientProps {
  blueprint: Blueprint;
  initialNodes: BlueprintNode[];
  userId: string;
}

export function EditPageClient({ blueprint, initialNodes, userId }: EditPageClientProps) {
  const [nodes, setNodes] = useState<BlueprintNode[]>(initialNodes);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saved" | "error">("idle");
  const [saveError, setSaveError] = useState<string | null>(null);

  const deletedNodeIds = useRef<Set<string>>(new Set());
  const selectedNode = nodes.find((n) => n.id === selectedId) ?? null;

  const methods = useForm<BlueprintFormValues>({
    resolver: zodResolver(blueprintSchema),
    defaultValues: {
      title: blueprint.title,
      slug: blueprint.slug,
      description: blueprint.description,
      price: blueprint.price,
      is_published: blueprint.is_published,
    },
  });

  const addNode = useCallback(() => {
    const newNode: BlueprintNode = {
      id: crypto.randomUUID(),
      blueprint_id: blueprint.id,
      order_index: nodes.length,
      title: "",
      content_markdown: "",
      type: "task",
    };
    setNodes((prev) => [...prev, newNode]);
    setSelectedId(newNode.id);
  }, [nodes.length, blueprint.id]);

  const deleteNode = useCallback((id: string) => {
    if (initialNodes.some((n) => n.id === id)) deletedNodeIds.current.add(id);
    setNodes((prev) =>
      prev.filter((n) => n.id !== id).map((n, i) => ({ ...n, order_index: i }))
    );
    setSelectedId((cur) => (cur === id ? null : cur));
  }, [initialNodes]);

  const updateNode = useCallback(
    (patch: Partial<BlueprintNode>) => {
      if (!selectedId) return;
      setNodes((prev) =>
        prev.map((n) => (n.id === selectedId ? { ...n, ...patch } : n))
      );
    },
    [selectedId]
  );

  const handleSave = methods.handleSubmit(async (formValues) => {
    setIsSaving(true);
    setSaveStatus("idle");
    setSaveError(null);
    try {
      await saveBlueprintToDb(
        { id: blueprint.id, creator_id: userId, ...formValues },
        nodes,
        Array.from(deletedNodeIds.current)
      );
      deletedNodeIds.current.clear();
      setSaveStatus("saved");
      methods.reset(formValues);
      setTimeout(() => setSaveStatus("idle"), 3000);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Save failed";
      setSaveError(msg);
      setSaveStatus("error");
    } finally {
      setIsSaving(false);
    }
  });

  const currentSlug = methods.watch("slug");

  return (
    <FormProvider {...methods}>
      <div className="flex flex-col h-screen bg-black overflow-hidden">

        {/* ── Top bar ── */}
        <header className="flex items-center gap-4 px-5 py-3 border-b-2 border-white bg-[#0A0A0A] shrink-0">
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 font-mono text-xs text-white/40 hover:text-white transition-colors"
          >
            <ArrowLeft size={13} /> Dashboard
          </Link>
          <span className="text-white/20">/</span>
          <span className="font-mono text-xs text-white/40 truncate max-w-[200px]">
            {methods.watch("title") || "Untitled Blueprint"}
          </span>

          <div className="ml-auto flex items-center gap-3">
            {saveStatus === "saved" && (
              <span className="font-mono text-[10px] text-[#D4FF00] border border-[#D4FF00] px-2 py-0.5 uppercase tracking-widest">
                ✓ Saved
              </span>
            )}
          </div>
        </header>

        {/* ── 3-panel layout ── */}
        <div className="flex flex-1 overflow-hidden">
          <div className="w-72 xl:w-80 shrink-0 overflow-y-auto">
            <MetaPanel
              blueprintId={blueprint.id}
              blueprintSlug={currentSlug}
              nodeCount={nodes.length}
              isSaving={isSaving}
              saveError={saveError}
              onSave={handleSave}
            />
          </div>

          <main className="flex-1 overflow-y-auto px-6 py-6">
            <NodeList
              nodes={nodes}
              selectedId={selectedId}
              onNodesChange={setNodes}
              onSelect={setSelectedId}
              onDelete={deleteNode}
              onAddNode={addNode}
            />
          </main>

          <div
            className="shrink-0 overflow-y-auto transition-[width] duration-200"
            style={{ width: selectedNode ? "22rem" : 0 }}
          >
            {selectedNode && (
              <div className="w-[22rem]">
                <PropertiesPanel
                  node={selectedNode}
                  onChange={updateNode}
                  onClose={() => setSelectedId(null)}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </FormProvider>
  );
}
