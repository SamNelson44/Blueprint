"use client";

import { useState } from "react";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { restrictToVerticalAxis, restrictToParentElement } from "@dnd-kit/modifiers";
import { Plus } from "lucide-react";
import { NodeCard } from "./NodeCard";
import type { BlueprintNode } from "@/lib/types";

interface NodeListProps {
  nodes: BlueprintNode[];
  selectedId: string | null;
  onNodesChange: (nodes: BlueprintNode[]) => void;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onAddNode: () => void;
}

export function NodeList({
  nodes,
  selectedId,
  onNodesChange,
  onSelect,
  onDelete,
  onAddNode,
}: NodeListProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      /* Require 8px move before activating — prevents accidental drags on click */
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const activeNode = activeId ? nodes.find((n) => n.id === activeId) : null;

  function handleDragStart({ active }: DragStartEvent) {
    setActiveId(active.id as string);
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    setActiveId(null);

    if (!over || active.id === over.id) return;

    const oldIndex = nodes.findIndex((n) => n.id === active.id);
    const newIndex = nodes.findIndex((n) => n.id === over.id);

    /* Optimistic reorder — re-assign order_index to match new positions */
    const reordered = arrayMove(nodes, oldIndex, newIndex).map((node, i) => ({
      ...node,
      order_index: i,
    }));

    onNodesChange(reordered);
  }

  return (
    <div className="flex flex-col gap-0">
      {/* ── Section header ── */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h2 className="font-sans font-black text-white uppercase tracking-tight text-lg">
            Nodes
          </h2>
          <span className="font-mono text-xs text-white/30 border border-white/20 px-1.5 py-0.5">
            {nodes.length}
          </span>
        </div>

        <button
          onClick={onAddNode}
          className={[
            "inline-flex items-center gap-1.5 px-4 py-2",
            "bg-[#D4FF00] text-black border-2 border-black font-mono font-bold text-xs uppercase tracking-widest",
            "shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]",
            "hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]",
            "active:translate-x-[3px] active:translate-y-[3px] active:shadow-none",
            "transition-[transform,box-shadow] duration-75",
          ].join(" ")}
        >
          <Plus size={14} />
          Add Node
        </button>
      </div>

      {/* ── Empty state ── */}
      {nodes.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed border-white/20 text-center">
          <span className="font-mono text-xs text-white/30 uppercase tracking-widest">
            No nodes yet
          </span>
          <p className="mt-2 font-sans text-sm text-white/20">
            Click "Add Node" to build your first step.
          </p>
        </div>
      )}

      {/* ── Sortable list ── */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        modifiers={[restrictToVerticalAxis, restrictToParentElement]}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={nodes.map((n) => n.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="flex flex-col gap-2">
            {nodes.map((node) => (
              <NodeCard
                key={node.id}
                node={node}
                isSelected={selectedId === node.id}
                onSelect={() => onSelect(node.id)}
                onDelete={() => onDelete(node.id)}
              />
            ))}
          </div>
        </SortableContext>

        {/* ── Drag ghost (follows cursor, no layout shift) ── */}
        <DragOverlay dropAnimation={null}>
          {activeNode ? (
            <NodeCard
              node={activeNode}
              isSelected={false}
              onSelect={() => {}}
              onDelete={() => {}}
              isOverlay
            />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
