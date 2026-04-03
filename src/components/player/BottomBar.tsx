"use client";

import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/cn";
import { ToggleComplete } from "./ToggleComplete";
import type { BlueprintNode } from "@/lib/types";

interface BottomBarProps {
  currentNode: BlueprintNode;
  nextNode: BlueprintNode | null;
  userId: string;
  blueprintId: string;
  isCompleted: boolean;
  onToggle: (nodeId: string, completed: boolean) => void;
  onNext: () => void;
}

export function BottomBar({
  currentNode,
  nextNode,
  userId,
  blueprintId,
  isCompleted,
  onToggle,
  onNext,
}: BottomBarProps) {
  return (
    <footer className="shrink-0 flex items-center justify-between px-6 py-3 border-t-2 border-white bg-[#0A0A0A]">
      {/* Left — current node info */}
      <div className="flex flex-col gap-0.5 min-w-0">
        <span className="font-mono text-[10px] text-white/30 uppercase tracking-widest">
          Current step
        </span>
        <span className="font-sans font-bold text-sm text-white truncate max-w-[240px]">
          {currentNode.title}
        </span>
      </div>

      {/* Right — actions */}
      <div className="flex items-center gap-3 shrink-0">
        <ToggleComplete
          nodeId={currentNode.id}
          userId={userId}
          blueprintId={blueprintId}
          isCompleted={isCompleted}
          onToggle={onToggle}
        />

        {nextNode && (
          <button
            onClick={onNext}
            disabled={!isCompleted}
            className={cn(
              "flex items-center gap-2 px-5 py-2.5 border-2 font-mono font-bold text-sm uppercase tracking-widest",
              "transition-[transform,box-shadow,opacity] duration-75",
              isCompleted
                ? [
                    "bg-[#D4FF00] text-black border-black",
                    "shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]",
                    "hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]",
                  ]
                : "opacity-25 cursor-not-allowed border-white/30 text-white/30"
            )}
          >
            Next Step
            <ArrowRight size={14} />
          </button>
        )}
      </div>
    </footer>
  );
}
