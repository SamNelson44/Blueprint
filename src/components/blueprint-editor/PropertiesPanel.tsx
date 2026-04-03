"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { X, Eye, Code2, Video, CheckSquare, Link2 } from "lucide-react";
import { cn } from "@/lib/cn";
import type { BlueprintNode, NodeType } from "@/lib/types";

/* ─────────────────────────────────────────────
   Type selector buttons
   ───────────────────────────────────────────── */

const NODE_TYPES: { value: NodeType; label: string; icon: React.ReactNode }[] =
  [
    { value: "video", label: "Video", icon: <Video size={13} /> },
    { value: "task", label: "Task", icon: <CheckSquare size={13} /> },
    { value: "link", label: "Link", icon: <Link2 size={13} /> },
  ];

/* ─────────────────────────────────────────────
   PropertiesPanel
   ───────────────────────────────────────────── */

interface PropertiesPanelProps {
  node: BlueprintNode;
  onChange: (updated: Partial<BlueprintNode>) => void;
  onClose: () => void;
}

export function PropertiesPanel({ node, onChange, onClose }: PropertiesPanelProps) {
  const [preview, setPreview] = useState(false);

  return (
    <aside className="flex flex-col h-full bg-[#0A0A0A] border-l-2 border-white">
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-5 py-4 border-b-2 border-white shrink-0">
        <div className="flex flex-col gap-0.5">
          <span className="font-mono text-[10px] text-white/40 uppercase tracking-widest">
            Node Properties
          </span>
          <span className="font-mono text-xs text-white/60">
            #{node.order_index + 1}
          </span>
        </div>
        <button
          onClick={onClose}
          aria-label="Close properties panel"
          className="text-white/30 hover:text-white border border-white/20 hover:border-white p-1 transition-colors"
        >
          <X size={14} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-6">
        {/* ── Title ── */}
        <div className="flex flex-col gap-1.5">
          <label className="font-mono text-[10px] text-white/40 uppercase tracking-widest">
            Title
          </label>
          <input
            type="text"
            value={node.title}
            onChange={(e) => onChange({ title: e.target.value })}
            placeholder="Node title…"
            className={cn(
              "w-full bg-black border-2 border-white px-3 py-2",
              "font-sans font-bold text-sm text-white placeholder-white/20",
              "focus:outline-none focus:border-[#D4FF00]",
              "transition-colors"
            )}
          />
        </div>

        {/* ── Type selector ── */}
        <div className="flex flex-col gap-1.5">
          <label className="font-mono text-[10px] text-white/40 uppercase tracking-widest">
            Type
          </label>
          <div className="flex gap-2">
            {NODE_TYPES.map(({ value, label, icon }) => {
              const active = node.type === value;
              return (
                <button
                  key={value}
                  onClick={() => onChange({ type: value })}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-1.5 py-2",
                    "font-mono text-xs font-medium uppercase tracking-wide border-2",
                    "transition-[transform,box-shadow,color,border-color,background] duration-75",
                    active
                      ? "bg-[#D4FF00] text-black border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                      : "bg-transparent text-white/50 border-white/20 hover:border-white hover:text-white"
                  )}
                >
                  {icon}
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── URL field (video + link types only) ── */}
        {(node.type === "video" || node.type === "link") && (
          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-[10px] text-white/40 uppercase tracking-widest">
              {node.type === "video" ? "YouTube or Video URL" : "Link URL"}
            </label>
            <input
              type="url"
              value={node.url ?? ""}
              onChange={(e) => onChange({ url: e.target.value || null })}
              placeholder={
                node.type === "video"
                  ? "https://youtube.com/watch?v=..."
                  : "https://example.com"
              }
              className={cn(
                "w-full bg-black border-2 border-white/30 px-3 py-2",
                "font-mono text-sm text-white placeholder-white/20",
                "focus:outline-none focus:border-[#D4FF00]",
                "transition-colors"
              )}
            />
            {node.type === "video" && (
              <p className="font-mono text-[10px] text-white/20">
                YouTube links auto-embed. Direct .mp4 URLs also supported.
              </p>
            )}
          </div>
        )}

        {/* ── Markdown editor / preview ── */}
        <div className="flex flex-col gap-1.5 flex-1">
          {/* Editor tab bar */}
          <div className="flex items-center justify-between">
            <label className="font-mono text-[10px] text-white/40 uppercase tracking-widest">
              Content
            </label>
            <div className="flex items-center border border-white/20">
              <button
                onClick={() => setPreview(false)}
                className={cn(
                  "flex items-center gap-1 px-2 py-1 font-mono text-[10px] uppercase tracking-widest",
                  !preview
                    ? "bg-white text-black"
                    : "text-white/40 hover:text-white"
                )}
              >
                <Code2 size={10} /> Write
              </button>
              <button
                onClick={() => setPreview(true)}
                className={cn(
                  "flex items-center gap-1 px-2 py-1 font-mono text-[10px] uppercase tracking-widest border-l border-white/20",
                  preview
                    ? "bg-white text-black"
                    : "text-white/40 hover:text-white"
                )}
              >
                <Eye size={10} /> Preview
              </button>
            </div>
          </div>

          {/* Editor */}
          {!preview ? (
            <textarea
              value={node.content_markdown}
              onChange={(e) => onChange({ content_markdown: e.target.value })}
              placeholder={`# Step ${node.order_index + 1}\n\nDescribe this step in detail. Markdown is supported.`}
              rows={14}
              className={cn(
                "w-full resize-none bg-black border-2 border-white/30 px-3 py-2.5",
                "font-mono text-sm text-white/80 placeholder-white/20 leading-relaxed",
                "focus:outline-none focus:border-[#D4FF00]",
                "transition-colors"
              )}
            />
          ) : (
            <div
              className={cn(
                "min-h-[14rem] bg-black border-2 border-white/30 px-4 py-3 overflow-y-auto",
                "prose prose-invert prose-sm max-w-none",
                /* Custom prose overrides to match design system */
                "[&_h1]:font-black [&_h1]:text-white [&_h1]:uppercase",
                "[&_h2]:font-bold [&_h2]:text-white",
                "[&_strong]:text-[#D4FF00]",
                "[&_code]:font-mono [&_code]:text-[#D4FF00] [&_code]:bg-white/5 [&_code]:px-1",
                "[&_a]:text-[#D4FF00] [&_a]:underline",
                "[&_blockquote]:border-l-2 [&_blockquote]:border-[#D4FF00] [&_blockquote]:pl-3 [&_blockquote]:text-white/50",
                "[&_li]:marker:text-[#D4FF00]"
              )}
            >
              {node.content_markdown ? (
                <ReactMarkdown>{node.content_markdown}</ReactMarkdown>
              ) : (
                <p className="text-white/20 italic font-mono text-xs">
                  Nothing to preview yet.
                </p>
              )}
            </div>
          )}

          <p className="font-mono text-[10px] text-white/20">
            Markdown supported — headings, bold, code, lists.
          </p>
        </div>
      </div>
    </aside>
  );
}
