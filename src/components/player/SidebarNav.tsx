"use client";

import { Check, Video, CheckSquare, Link2, Lock } from "lucide-react";
import { cn } from "@/lib/cn";
import { ProgressBar } from "./ProgressBar";
import type { BlueprintNode, NodeType } from "@/lib/types";

const TYPE_ICONS: Record<NodeType, React.ReactNode> = {
  video: <Video size={11} />,
  task: <CheckSquare size={11} />,
  link: <Link2 size={11} />,
};

interface SidebarNavProps {
  blueprintTitle: string;
  nodes: BlueprintNode[];
  completedIds: Set<string>;
  selectedId: string;
  onSelect: (id: string) => void;
}

export function SidebarNav({
  blueprintTitle,
  nodes,
  completedIds,
  selectedId,
  onSelect,
}: SidebarNavProps) {
  const completedCount = nodes.filter((n) => completedIds.has(n.id)).length;

  /* A node is "unlocked" if all previous nodes are completed, or it's the first */
  function isUnlocked(index: number): boolean {
    if (index === 0) return true;
    return completedIds.has(nodes[index - 1].id);
  }

  return (
    <aside className="flex flex-col h-full bg-[#0A0A0A] border-r-2 border-white w-72 shrink-0">
      {/* ── Blueprint title ── */}
      <div className="px-5 py-4 border-b-2 border-white shrink-0">
        <span className="font-mono text-[10px] text-white/40 uppercase tracking-widest block mb-1">
          Now Learning
        </span>
        <h2 className="font-sans font-black text-white text-sm leading-tight line-clamp-2">
          {blueprintTitle}
        </h2>
      </div>

      {/* ── Progress bar ── */}
      <ProgressBar total={nodes.length} completed={completedCount} />

      {/* ── Node list ── */}
      <nav className="flex-1 overflow-y-auto py-3" aria-label="Blueprint nodes">
        {nodes.map((node, index) => {
          const isSelected = selectedId === node.id;
          const isCompleted = completedIds.has(node.id);
          const unlocked = isUnlocked(index);

          return (
            <button
              key={node.id}
              onClick={() => unlocked && onSelect(node.id)}
              disabled={!unlocked}
              aria-current={isSelected ? "step" : undefined}
              className={cn(
                "w-full flex items-start gap-3 px-5 py-3 text-left",
                "border-l-[3px] transition-colors",
                /* Selected */
                isSelected
                  ? "bg-white/5 border-l-[#D4FF00]"
                  : "border-l-transparent hover:bg-white/5 hover:border-l-white/30",
                /* Locked */
                !unlocked && "opacity-30 cursor-not-allowed"
              )}
            >
              {/* Step indicator */}
              <span
                className={cn(
                  "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center border-2 font-mono text-[10px] font-bold transition-colors",
                  isCompleted
                    ? "bg-[#D4FF00] border-[#D4FF00] text-black shadow-[2px_2px_0px_0px_rgba(212,255,0,0.4)]"
                    : isSelected
                    ? "border-white text-white"
                    : "border-white/30 text-white/30"
                )}
              >
                {isCompleted ? (
                  <Check size={11} strokeWidth={3} />
                ) : !unlocked ? (
                  <Lock size={9} />
                ) : (
                  index + 1
                )}
              </span>

              <div className="flex flex-col gap-0.5 min-w-0">
                <span
                  className={cn(
                    "font-sans text-sm font-semibold leading-snug",
                    isCompleted
                      ? "text-[#D4FF00]"
                      : isSelected
                      ? "text-white"
                      : "text-white/60"
                  )}
                >
                  {node.title || "Untitled"}
                </span>
                <span className="flex items-center gap-1 font-mono text-[10px] text-white/30 uppercase tracking-widest">
                  {TYPE_ICONS[node.type]}
                  {node.type}
                </span>
              </div>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
