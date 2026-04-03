"use client";

import { useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SidebarNav } from "@/components/player/SidebarNav";
import { NodeContent } from "@/components/player/NodeContent";
import { BottomBar } from "@/components/player/BottomBar";
import { BlueprintComplete } from "@/components/player/BlueprintComplete";
import type { Blueprint, BlueprintNode } from "@/lib/types";

interface LearnPageClientProps {
  blueprint: Blueprint;
  nodes: BlueprintNode[];
  initialCompletedIds: string[];
  userId: string;
}

export function LearnPageClient({
  blueprint,
  nodes,
  initialCompletedIds,
  userId,
}: LearnPageClientProps) {
  const [selectedId, setSelectedId] = useState<string>(
    nodes[0]?.id ?? ""
  );
  const [completedIds, setCompletedIds] = useState<Set<string>>(
    () => new Set(initialCompletedIds)
  );

  const selectedNode = useMemo(
    () => nodes.find((n) => n.id === selectedId) ?? nodes[0],
    [nodes, selectedId]
  );

  const selectedIndex = useMemo(
    () => nodes.findIndex((n) => n.id === selectedId),
    [nodes, selectedId]
  );

  const nextNode = nodes[selectedIndex + 1] ?? null;
  const isCurrentCompleted = completedIds.has(selectedId);
  const isAllComplete = nodes.length > 0 && completedIds.size >= nodes.length;

  /* Optimistic toggle — called by both ToggleComplete and BottomBar */
  const handleToggle = useCallback((nodeId: string, completed: boolean) => {
    setCompletedIds((prev) => {
      const next = new Set(prev);
      if (completed) {
        next.add(nodeId);
      } else {
        next.delete(nodeId);
      }
      return next;
    });
  }, []);

  const handleNext = useCallback(() => {
    if (nextNode) setSelectedId(nextNode.id);
  }, [nextNode]);

  if (!selectedNode) return null;

  return (
    <>
      {/* ── Completion overlay ── */}
      {isAllComplete && (
        <BlueprintComplete
          blueprintTitle={blueprint.title}
          totalNodes={nodes.length}
        />
      )}

      <div className="flex flex-col h-screen bg-black overflow-hidden">
        {/* ── Top bar ── */}
        <header className="flex items-center gap-4 px-5 py-3 border-b-2 border-white bg-[#0A0A0A] shrink-0">
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 font-mono text-xs text-white/40 hover:text-white transition-colors shrink-0"
          >
            <ArrowLeft size={13} /> Dashboard
          </Link>
          <span className="text-white/20">/</span>
          <span className="font-mono text-xs text-white/60 truncate">
            {blueprint.title}
          </span>
          {isAllComplete && (
            <span className="ml-auto font-mono text-[10px] text-black bg-[#D4FF00] px-2 py-0.5 uppercase tracking-widest shrink-0">
              ✓ Complete
            </span>
          )}
        </header>

        {/* ── 3-zone layout ── */}
        <div className="flex flex-1 overflow-hidden">
          {/* LEFT — Navigation sidebar */}
          <SidebarNav
            blueprintTitle={blueprint.title}
            nodes={nodes}
            completedIds={completedIds}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />

          {/* CENTER — Node content */}
          <main className="flex-1 overflow-y-auto">
            <NodeContent node={selectedNode} />
          </main>
        </div>

        {/* BOTTOM — Persistent action bar */}
        <BottomBar
          currentNode={selectedNode}
          nextNode={nextNode}
          userId={userId}
          blueprintId={blueprint.id}
          isCompleted={isCurrentCompleted}
          onToggle={handleToggle}
          onNext={handleNext}
        />
      </div>
    </>
  );
}
