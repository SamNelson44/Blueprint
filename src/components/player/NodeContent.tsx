"use client";

import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";
import { ExternalLink } from "lucide-react";
import type { BlueprintNode } from "@/lib/types";

/* ─────────────────────────────────────────────
   Video helpers
   ───────────────────────────────────────────── */

function getYouTubeId(url: string): string | null {
  const patterns = [
    /youtube\.com\/watch\?(?:.*&)?v=([a-zA-Z0-9_-]+)/,
    /youtu\.be\/([a-zA-Z0-9_-]+)/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

function VideoEmbed({ url }: { url: string }) {
  const youtubeId = getYouTubeId(url);

  if (youtubeId) {
    return (
      <div className="w-full aspect-video border-2 border-white/30 overflow-hidden mb-8">
        <iframe
          src={`https://www.youtube.com/embed/${youtubeId}`}
          title="Video"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
        />
      </div>
    );
  }

  // Direct video file
  return (
    <div className="w-full border-2 border-white/30 overflow-hidden mb-8">
      <video
        src={url}
        controls
        className="w-full"
      />
    </div>
  );
}

function LinkBlock({ url }: { url: string }) {
  let display = url;
  try {
    display = new URL(url).hostname.replace(/^www\./, "");
  } catch {
    // keep raw url if invalid
  }

  return (
    <div className="mb-8 border-2 border-[#D4FF00] shadow-[4px_4px_0px_0px_#D4FF00] bg-[#0A0A0A] p-5">
      <p className="font-mono text-[10px] text-white/30 uppercase tracking-widest mb-3">
        Resource Link
      </p>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={[
          "inline-flex items-center gap-2 px-5 py-3",
          "font-mono font-bold text-sm uppercase tracking-widest",
          "bg-[#D4FF00] text-black border-2 border-black",
          "shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]",
          "hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]",
          "transition-[transform,box-shadow] duration-75",
        ].join(" ")}
      >
        <ExternalLink size={14} />
        {display} →
      </a>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Custom markdown components
   All colours forced into the Neo-Brutalist palette.
   ───────────────────────────────────────────── */

const MD_COMPONENTS: Components = {
  h1: ({ children }) => (
    <h1 className="font-sans font-black text-white uppercase tracking-tight text-3xl mt-8 mb-4 pb-3 border-b-2 border-white/20">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="font-sans font-black text-white text-xl mt-6 mb-3 flex items-center gap-2">
      <span className="inline-block w-3 h-3 bg-[#D4FF00] shrink-0" />
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="font-sans font-bold text-white/90 text-base mt-5 mb-2">
      {children}
    </h3>
  ),
  p: ({ children }) => (
    <p className="font-sans text-white/75 text-[15px] leading-relaxed mb-4">
      {children}
    </p>
  ),
  strong: ({ children }) => (
    <strong className="font-bold text-[#D4FF00]">{children}</strong>
  ),
  em: ({ children }) => (
    <em className="not-italic text-white/90 border-b border-white/30">
      {children}
    </em>
  ),
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-[#D4FF00] underline underline-offset-2 hover:text-white transition-colors"
    >
      {children}
    </a>
  ),
  ul: ({ children }) => (
    <ul className="mb-4 flex flex-col gap-1.5 pl-0">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="mb-4 flex flex-col gap-1.5 pl-0 list-none counter-reset-[item]">
      {children}
    </ol>
  ),
  li: ({ children }) => (
    <li className="flex items-start gap-2.5 font-sans text-[15px] text-white/75">
      <span className="mt-2 h-1.5 w-1.5 shrink-0 bg-[#D4FF00]" />
      <span>{children}</span>
    </li>
  ),
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-[#D4FF00] pl-4 my-4 bg-white/[0.03] py-2">
      <div className="font-mono text-sm text-white/60 italic">{children}</div>
    </blockquote>
  ),
  /* Inline code */
  code: ({ children, className }) => {
    const isBlock = className?.includes("language-");
    if (isBlock) {
      return (
        <div className="my-4 border-2 border-white/30 overflow-x-auto">
          <div className="flex items-center gap-2 px-4 py-2 border-b-2 border-white/20 bg-white/5">
            <span className="h-2 w-2 rounded-full bg-[#D4FF00]" />
            <span className="font-mono text-[10px] text-white/40 uppercase tracking-widest">
              {className?.replace("language-", "") ?? "code"}
            </span>
          </div>
          <pre className="px-4 py-4 overflow-x-auto">
            <code className="font-mono text-sm text-[#D4FF00] leading-relaxed">
              {children}
            </code>
          </pre>
        </div>
      );
    }
    return (
      <code className="font-mono text-[#D4FF00] bg-white/10 px-1.5 py-0.5 text-sm border border-white/20">
        {children}
      </code>
    );
  },
  pre: ({ children }) => <>{children}</>,
  hr: () => (
    <div className="my-6 flex items-center gap-3">
      <div className="flex-1 h-[2px] bg-white/10" />
      <span className="h-2 w-2 bg-[#D4FF00]" />
      <div className="flex-1 h-[2px] bg-white/10" />
    </div>
  ),
};

/* ─────────────────────────────────────────────
   NodeContent
   ───────────────────────────────────────────── */

interface NodeContentProps {
  node: BlueprintNode;
}

export function NodeContent({ node }: NodeContentProps) {
  return (
    <article className="max-w-3xl mx-auto px-6 py-8">
      {/* Node header */}
      <header className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <span className="font-mono text-[10px] text-white/30 uppercase tracking-widest border border-white/20 px-2 py-0.5">
            {node.type}
          </span>
          <span className="font-mono text-[10px] text-white/30">
            Step {node.order_index + 1}
          </span>
        </div>
        <h1 className="font-sans font-black text-white text-3xl md:text-4xl leading-tight tracking-tight">
          {node.title}
        </h1>
        <div className="mt-4 h-1 w-16 bg-[#D4FF00]" />
      </header>

      {/* Video embed */}
      {node.type === "video" && node.url && <VideoEmbed url={node.url} />}

      {/* Link block */}
      {node.type === "link" && node.url && <LinkBlock url={node.url} />}

      {/* Markdown body */}
      {node.content_markdown ? (
        <ReactMarkdown components={MD_COMPONENTS}>
          {node.content_markdown}
        </ReactMarkdown>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-white/20">
          <span className="font-mono text-sm text-white/20">
            No content yet.
          </span>
        </div>
      )}
    </article>
  );
}
