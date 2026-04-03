"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Check, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/cn";

function isSupabaseConfigured() {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

async function toggleProgressInDb(
  nodeId: string,
  userId: string,
  markComplete: boolean
): Promise<void> {
  if (!isSupabaseConfigured()) {
    await new Promise((res) => setTimeout(res, 300));
    return;
  }

  const supabase = createClient();

  if (markComplete) {
    const { error } = await supabase.from("user_progress").upsert(
      {
        user_id: userId,
        node_id: nodeId,
        is_completed: true,
        completed_at: new Date().toISOString(),
      },
      { onConflict: "user_id,node_id" }
    );
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from("user_progress")
      .delete()
      .match({ user_id: userId, node_id: nodeId });
    if (error) throw error;
  }
}

/* ─────────────────────────────────────────────
   Component
   ───────────────────────────────────────────── */

interface ToggleCompleteProps {
  nodeId: string;
  userId: string;
  blueprintId: string;
  isCompleted: boolean;
  onToggle: (nodeId: string, completed: boolean) => void;
}

export function ToggleComplete({
  nodeId,
  userId,
  blueprintId,
  isCompleted,
  onToggle,
}: ToggleCompleteProps) {
  const queryClient = useQueryClient();
  const router = useRouter();

  const { mutate, isPending } = useMutation({
    mutationFn: (markComplete: boolean) =>
      toggleProgressInDb(nodeId, userId, markComplete),
    onMutate: (markComplete: boolean) => {
      // Optimistic — flip UI immediately before the DB round-trip.
      onToggle(nodeId, markComplete);
    },
    onError: (_err, markComplete) => {
      // Roll back to the opposite of what we tried.
      onToggle(nodeId, !markComplete);
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["progress", blueprintId, userId],
      });
      // Bust the Next.js Router Cache so navigating away and back
      // reflects the latest progress from the server.
      router.refresh();
    },
  });

  return (
    <button
      onClick={() => mutate(!isCompleted)}
      disabled={isPending}
      aria-label={isCompleted ? "Mark as incomplete" : "Mark as complete"}
      className={cn(
        "flex items-center gap-2 px-5 py-2.5 border-2",
        "font-mono font-bold text-sm uppercase tracking-widest",
        "transition-[transform,box-shadow,background,color,border-color] duration-75",
        isPending && "opacity-60 cursor-not-allowed",
        isCompleted
          ? [
              "bg-[#D4FF00] text-black border-black",
              "shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]",
              "hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]",
            ]
          : [
              "bg-transparent text-white border-white",
              "shadow-[3px_3px_0px_0px_rgba(255,255,255,1)]",
              "hover:bg-white/5 hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]",
            ]
      )}
    >
      {isPending ? (
        <Loader2 size={14} className="animate-spin" />
      ) : isCompleted ? (
        <Check size={14} strokeWidth={3} />
      ) : null}
      {isPending ? "Saving…" : isCompleted ? "Completed" : "Mark Complete"}
    </button>
  );
}
