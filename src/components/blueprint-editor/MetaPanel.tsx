"use client";

import { useFormContext } from "react-hook-form";
import { Save, Globe, Lock, AlertCircle, RefreshCw, ExternalLink } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import type { BlueprintSchemaValues as BlueprintFormValues } from "@/lib/validators";

/* Client-side slugify — mirrors the DB function in schema.sql */
function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/[\s-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

interface MetaPanelProps {
  blueprintId: string;
  blueprintSlug: string;
  nodeCount: number;
  isSaving: boolean;
  saveError: string | null;
  onSave: () => void;
}

export function MetaPanel({
  blueprintId,
  blueprintSlug,
  nodeCount,
  isSaving,
  saveError,
  onSave,
}: MetaPanelProps) {
  const {
    register,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useFormContext<BlueprintFormValues>();

  const title = watch("title");
  const slug = watch("slug");
  const price = watch("price");
  const isPublished = watch("is_published");

  function generateSlug() {
    const generated = slugify(title);
    if (generated) setValue("slug", generated, { shouldDirty: true, shouldValidate: true });
  }

  return (
    <aside className="flex flex-col h-full bg-[#0A0A0A] border-r-2 border-white">
      {/* ── Header ── */}
      <div className="px-5 py-4 border-b-2 border-white shrink-0 flex items-center justify-between">
        <div>
          <span className="font-mono text-[10px] text-white/40 uppercase tracking-widest">
            Blueprint Editor
          </span>
          <p className="font-mono text-[11px] text-white/30 mt-0.5 truncate">
            ID: {blueprintId.slice(0, 8)}…
          </p>
        </div>
        {isPublished && (
          <Link
            href={`/blueprints/${blueprintSlug}`}
            target="_blank"
            className="flex items-center gap-1 font-mono text-[10px] text-[#D4FF00] hover:underline"
          >
            View live <ExternalLink size={9} />
          </Link>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-5">

        {/* ── Live preview card ── */}
        <div className="border-2 border-[#D4FF00] shadow-[4px_4px_0px_0px_#D4FF00] p-4 bg-black flex flex-col gap-2">
          <span className="font-mono text-[10px] text-[#D4FF00] uppercase tracking-widest">
            Preview
          </span>
          <h3 className="font-sans font-black text-white text-base leading-tight break-words">
            {title || (
              <span className="text-white/20 font-normal italic">Untitled Blueprint</span>
            )}
          </h3>
          <div className="flex items-center gap-3 mt-1">
            <span className="font-mono text-lg font-bold text-[#D4FF00]">
              {price > 0 ? `$${Number(price).toFixed(2)}` : "Free"}
            </span>
            <span className="font-mono text-[10px] text-white/30">{nodeCount} steps</span>
          </div>
          <div
            className={cn(
              "inline-flex items-center gap-1.5 self-start px-2 py-1 border font-mono text-[10px] uppercase tracking-widest",
              isPublished
                ? "border-[#D4FF00] text-[#D4FF00]"
                : "border-white/30 text-white/30"
            )}
          >
            {isPublished ? <Globe size={10} /> : <Lock size={10} />}
            {isPublished ? "Published" : "Draft"}
          </div>
        </div>

        {/* ── Title ── */}
        <div className="flex flex-col gap-1.5">
          <label className="font-mono text-[10px] text-white/40 uppercase tracking-widest">
            Title *
          </label>
          <input
            {...register("title")}
            placeholder="Your Blueprint title…"
            className={cn(
              "w-full bg-black border-2 px-3 py-2",
              "font-sans font-bold text-sm text-white placeholder-white/20",
              "focus:outline-none transition-colors",
              errors.title ? "border-red-500" : "border-white/40 focus:border-[#D4FF00]"
            )}
          />
          {errors.title && (
            <span className="flex items-center gap-1 font-mono text-[10px] text-red-400">
              <AlertCircle size={10} /> {errors.title.message}
            </span>
          )}
        </div>

        {/* ── Slug ── */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label className="font-mono text-[10px] text-white/40 uppercase tracking-widest">
              URL Slug *
            </label>
            <button
              type="button"
              onClick={generateSlug}
              className="flex items-center gap-1 font-mono text-[10px] text-white/30 hover:text-[#D4FF00] transition-colors"
            >
              <RefreshCw size={9} /> Generate
            </button>
          </div>
          <input
            {...register("slug")}
            placeholder="my-blueprint-title"
            spellCheck={false}
            className={cn(
              "w-full bg-black border-2 px-3 py-2",
              "font-mono text-sm text-white placeholder-white/20",
              "focus:outline-none transition-colors",
              errors.slug ? "border-red-500" : "border-white/40 focus:border-[#D4FF00]"
            )}
          />
          {errors.slug ? (
            <span className="flex items-center gap-1 font-mono text-[10px] text-red-400">
              <AlertCircle size={10} /> {errors.slug.message}
            </span>
          ) : (
            <span className="font-mono text-[10px] text-white/20 truncate">
              /blueprints/{slug || "…"}
            </span>
          )}
        </div>

        {/* ── Description ── */}
        <div className="flex flex-col gap-1.5">
          <label className="font-mono text-[10px] text-white/40 uppercase tracking-widest">
            Description
          </label>
          <textarea
            {...register("description")}
            placeholder="What will learners achieve?"
            rows={4}
            className={cn(
              "w-full resize-none bg-black border-2 border-white/40 px-3 py-2",
              "font-mono text-xs text-white/70 placeholder-white/20 leading-relaxed",
              "focus:outline-none focus:border-[#D4FF00] transition-colors"
            )}
          />
          {errors.description && (
            <span className="font-mono text-[10px] text-red-400">
              {errors.description.message}
            </span>
          )}
        </div>

        {/* ── Price ── */}
        <div className="flex flex-col gap-1.5">
          <label className="font-mono text-[10px] text-white/40 uppercase tracking-widest">
            Price (USD)
          </label>
          <div className="flex items-center border-2 border-white/40 focus-within:border-[#D4FF00] bg-black transition-colors">
            <span className="px-3 font-mono text-sm text-white/40 border-r border-white/20">
              $
            </span>
            <input
              {...register("price", { valueAsNumber: true })}
              type="number"
              min={0}
              step={0.01}
              placeholder="0.00"
              className="flex-1 bg-transparent px-3 py-2 font-mono text-sm text-white placeholder-white/20 focus:outline-none"
            />
          </div>
          {errors.price && (
            <span className="font-mono text-[10px] text-red-400">
              {errors.price.message}
            </span>
          )}
        </div>

        {/* ── Publish toggle ── */}
        <div className="flex items-center justify-between border-2 border-white/20 px-4 py-3">
          <div className="flex flex-col gap-0.5">
            <span className="font-sans font-bold text-sm text-white">
              {isPublished ? "Published" : "Draft"}
            </span>
            <span className="font-mono text-[10px] text-white/30">
              {isPublished ? "Visible to learners" : "Only visible to you"}
            </span>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={isPublished}
            onClick={() => setValue("is_published", !isPublished, { shouldDirty: true })}
            className={cn(
              "relative h-6 w-11 border-2 transition-colors shrink-0",
              isPublished ? "bg-[#D4FF00] border-[#D4FF00]" : "bg-black border-white/40"
            )}
          >
            <span
              className={cn(
                "absolute top-0 bottom-0 w-4 bg-black transition-transform",
                isPublished ? "translate-x-5" : "translate-x-0"
              )}
            />
          </button>
        </div>
      </div>

      {/* ── Save — pinned to bottom ── */}
      <div className="px-5 py-4 border-t-2 border-white shrink-0">
        {saveError && (
          <p className="font-mono text-[10px] text-red-400 mb-2 flex items-center gap-1">
            <AlertCircle size={10} /> {saveError}
          </p>
        )}
        {!saveError && isDirty && (
          <p className="font-mono text-[10px] text-[#D4FF00] mb-2 flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-[#D4FF00] animate-pulse" />
            Unsaved changes
          </p>
        )}
        <button
          type="button"
          onClick={onSave}
          disabled={isSaving}
          className={cn(
            "w-full flex items-center justify-center gap-2 py-3",
            "font-mono font-bold text-sm uppercase tracking-widest",
            "border-2 transition-[transform,box-shadow] duration-75",
            isSaving
              ? "bg-white/10 text-white/30 border-white/20 cursor-not-allowed shadow-none"
              : [
                  "bg-[#D4FF00] text-black border-black",
                  "shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
                  "hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]",
                  "active:translate-x-[4px] active:translate-y-[4px] active:shadow-none",
                ]
          )}
        >
          <Save size={14} />
          {isSaving ? "Saving…" : "Save Blueprint"}
        </button>
      </div>
    </aside>
  );
}
