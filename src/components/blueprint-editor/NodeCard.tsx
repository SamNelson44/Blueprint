"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2, Video, CheckSquare, Link2 } from "lucide-react";
import { cn } from "@/lib/cn";
import type { BlueprintNode, NodeType } from "@/lib/types";

/* ─────────────────────────────────────────────
   Type Badge
   ───────────────────────────────────────────── */

const TYPE_CONFIG: Record<
  NodeType,
  { label: string; icon: React.ReactNode; classes: string }
> = {
  video: {
    label: "VIDEO",
    icon: <Video size={10} />,
    classes: "border-[#D4FF00] text-[#D4FF00]",
  },
  task: {
    label: "TASK",
    icon: <CheckSquare size={10} />,
    classes: "border-white text-white",
  },
  link: {
    label: "LINK",
    icon: <Link2 size={10} />,
    classes: "border-white/40 text-white/40",
  },
};

function NodeTypeBadge({ type }: { type: NodeType }) {
  const { label, icon, classes } = TYPE_CONFIG[type];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 border px-1.5 py-0.5",
        "font-mono text-[10px] font-medium uppercase tracking-widest shrink-0",
        classes
      )}
    >
      {icon}
      {label}
    </span>
  );
}

/* ─────────────────────────────────────────────
   NodeCard — Sortable
   ───────────────────────────────────────────── */

export interface NodeCardProps {
  node: BlueprintNode;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  /** Passed from DragOverlay clone — disables hooks when true */
  isOverlay?: boolean;
}

export function NodeCard({
  node,
  isSelected,
  onSelect,
  onDelete,
  isOverlay = false,
}: NodeCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: node.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition ?? undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        /* base */
        "relative flex items-center gap-3 px-4 py-3 border-2 bg-[#0A0A0A]",
        "select-none cursor-pointer group",
        /* neo-brutalist shadow */
        "shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]",
        /* selected state — accent takes over */
        isSelected
          ? "border-[#D4FF00] shadow-[4px_4px_0px_0px_#D4FF00]"
          : "border-white hover:border-white/80",
        /* dragging state */
        isDragging && !isOverlay && "opacity-30 shadow-none border-dashed",
        /* overlay (ghost following cursor) */
        isOverlay && "rotate-1 scale-[1.02] shadow-[6px_6px_0px_0px_#D4FF00] border-[#D4FF00] cursor-grabbing"
      )}
      onClick={onSelect}
    >
      {/* ── Drag handle (pointer events isolated) ── */}
      <button
        {...attributes}
        {...listeners}
        onClick={(e) => e.stopPropagation()}
        aria-label="Drag to reorder"
        className="shrink-0 cursor-grab active:cursor-grabbing text-white/20 hover:text-white/60 transition-colors touch-none"
      >
        <GripVertical size={16} />
      </button>

      {/* ── Order index ── */}
      <span className="shrink-0 font-mono text-xs text-white/30 w-5 text-right">
        {node.order_index + 1}
      </span>

      {/* ── Type badge ── */}
      <NodeTypeBadge type={node.type} />

      {/* ── Title ── */}
      <span
        className={cn(
          "flex-1 font-sans font-bold text-sm truncate",
          isSelected ? "text-[#D4FF00]" : "text-white"
        )}
      >
        {node.title || (
          <span className="text-white/30 font-normal italic">Untitled node</span>
        )}
      </span>

      {/* ── Content preview ── */}
      {node.content_markdown && (
        <span className="hidden lg:block font-mono text-[11px] text-white/30 truncate max-w-[160px]">
          {node.content_markdown.slice(0, 60)}…
        </span>
      )}

      {/* ── Delete button ── */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        aria-label="Delete node"
        className="shrink-0 ml-1 text-white/20 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
      >
        <Trash2 size={14} />
      </button>

      {/* ── Selected left-edge accent bar ── */}
      {isSelected && (
        <span
          aria-hidden
          className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#D4FF00]"
        />
      )}
    </div>
  );
}
