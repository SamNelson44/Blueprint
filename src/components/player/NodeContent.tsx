"use client";

import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";
import type { BlueprintNode } from "@/lib/types";

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
