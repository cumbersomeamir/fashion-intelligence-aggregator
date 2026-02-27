"use client";

import { Fragment, useMemo, type ReactNode } from "react";

type Variant = "assistant" | "user";

interface ChatRichTextProps {
  content: string;
  variant?: Variant;
}

type ParsedBlock =
  | { type: "paragraph"; text: string }
  | { type: "heading"; level: 1 | 2 | 3 | 4; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "quote"; text: string }
  | { type: "code"; language?: string; code: string };

function parseTextBlocks(text: string): ParsedBlock[] {
  const blocks: ParsedBlock[] = [];
  const lines = text.split("\n");
  let i = 0;

  const isHeading = (line: string) => /^(#{1,4})\s+(.+)$/.test(line.trim());
  const isUnordered = (line: string) => /^[-*+]\s+.+$/.test(line.trim());
  const isOrdered = (line: string) => /^\d+\.\s+.+$/.test(line.trim());
  const isQuote = (line: string) => /^>\s?.+$/.test(line.trim());

  while (i < lines.length) {
    const raw = lines[i];
    const line = raw.trim();
    if (!line) {
      i += 1;
      continue;
    }

    const headingMatch = line.match(/^(#{1,4})\s+(.+)$/);
    if (headingMatch) {
      blocks.push({
        type: "heading",
        level: headingMatch[1].length as 1 | 2 | 3 | 4,
        text: headingMatch[2].trim(),
      });
      i += 1;
      continue;
    }

    if (isUnordered(line)) {
      const items: string[] = [];
      while (i < lines.length) {
        const next = lines[i].trim();
        const m = next.match(/^[-*+]\s+(.+)$/);
        if (!m) break;
        items.push(m[1].trim());
        i += 1;
      }
      blocks.push({ type: "ul", items });
      continue;
    }

    if (isOrdered(line)) {
      const items: string[] = [];
      while (i < lines.length) {
        const next = lines[i].trim();
        const m = next.match(/^\d+\.\s+(.+)$/);
        if (!m) break;
        items.push(m[1].trim());
        i += 1;
      }
      blocks.push({ type: "ol", items });
      continue;
    }

    if (isQuote(line)) {
      const quoteLines: string[] = [];
      while (i < lines.length) {
        const next = lines[i].trim();
        const m = next.match(/^>\s?(.*)$/);
        if (!m) break;
        quoteLines.push(m[1]);
        i += 1;
      }
      blocks.push({ type: "quote", text: quoteLines.join("\n") });
      continue;
    }

    const paragraphLines: string[] = [];
    while (i < lines.length) {
      const next = lines[i];
      const trimmed = next.trim();
      if (!trimmed) break;
      if (isHeading(trimmed) || isUnordered(trimmed) || isOrdered(trimmed) || isQuote(trimmed)) break;
      paragraphLines.push(next);
      i += 1;
    }
    if (paragraphLines.length > 0) {
      blocks.push({ type: "paragraph", text: paragraphLines.join("\n").trim() });
    } else {
      i += 1;
    }
  }

  return blocks;
}

function parseBlocks(content: string): ParsedBlock[] {
  const normalized = content.replace(/\r\n?/g, "\n");
  const blocks: ParsedBlock[] = [];
  const fenceRegex = /```([a-zA-Z0-9_-]+)?\n?([\s\S]*?)```/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = fenceRegex.exec(normalized)) !== null) {
    const before = normalized.slice(lastIndex, match.index);
    if (before.trim()) blocks.push(...parseTextBlocks(before));

    blocks.push({
      type: "code",
      language: match[1]?.trim() || undefined,
      code: match[2].replace(/\n+$/g, ""),
    });
    lastIndex = fenceRegex.lastIndex;
  }

  const tail = normalized.slice(lastIndex);
  if (tail.trim()) blocks.push(...parseTextBlocks(tail));
  return blocks;
}

function renderInline(text: string, variant: Variant, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const tokenRegex =
    /(\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)|`([^`]+)`|\*\*([^*]+)\*\*|__([^_]+)__|\*([^*]+)\*|_([^_]+)_)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let part = 0;

  const pushPlain = (value: string) => {
    if (!value) return;
    nodes.push(<Fragment key={`${keyPrefix}-plain-${part++}`}>{value}</Fragment>);
  };

  while ((match = tokenRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      pushPlain(text.slice(lastIndex, match.index));
    }

    const full = match[0];
    const linkLabel = match[2];
    const linkUrl = match[3];
    const codeText = match[4];
    const boldText = match[5] ?? match[6];
    const italicText = match[7] ?? match[8];

    if (linkLabel && linkUrl) {
      nodes.push(
        <a
          key={`${keyPrefix}-link-${part++}`}
          href={linkUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={
            variant === "assistant"
              ? "underline decoration-accent/50 text-accent hover:decoration-accent"
              : "underline decoration-white/60 text-white hover:decoration-white"
          }
        >
          {linkLabel}
        </a>
      );
    } else if (codeText) {
      nodes.push(
        <code
          key={`${keyPrefix}-code-${part++}`}
          className={
            variant === "assistant"
              ? "px-1 py-0.5 rounded bg-zinc-200/70 dark:bg-zinc-700/80 text-zinc-800 dark:text-zinc-100 text-[0.9em]"
              : "px-1 py-0.5 rounded bg-white/20 text-white text-[0.9em]"
          }
        >
          {codeText}
        </code>
      );
    } else if (boldText) {
      nodes.push(
        <strong key={`${keyPrefix}-bold-${part++}`} className="font-semibold">
          {boldText}
        </strong>
      );
    } else if (italicText) {
      nodes.push(
        <em key={`${keyPrefix}-italic-${part++}`} className="italic">
          {italicText}
        </em>
      );
    } else {
      pushPlain(full);
    }

    lastIndex = match.index + full.length;
  }

  if (lastIndex < text.length) pushPlain(text.slice(lastIndex));
  return nodes;
}

export function ChatRichText({ content, variant = "assistant" }: ChatRichTextProps) {
  const blocks = useMemo(() => parseBlocks(content), [content]);
  if (blocks.length === 0) return null;

  return (
    <div
      className={`space-y-2 break-words ${
        variant === "assistant"
          ? "text-sm text-zinc-900 dark:text-zinc-100"
          : "text-sm text-white"
      }`}
    >
      {blocks.map((block, blockIndex) => {
        const key = `block-${blockIndex}`;
        if (block.type === "heading") {
          const className =
            block.level === 1
              ? "font-headline font-semibold text-base sm:text-lg"
              : block.level === 2
              ? "font-headline font-semibold text-sm sm:text-base"
              : block.level === 3
              ? "font-semibold text-sm"
              : "font-semibold text-xs uppercase tracking-wide";
          return (
            <p key={key} className={className}>
              {renderInline(block.text, variant, `${key}-h`)}
            </p>
          );
        }

        if (block.type === "paragraph") {
          return (
            <p key={key} className="leading-relaxed whitespace-pre-wrap">
              {renderInline(block.text, variant, `${key}-p`)}
            </p>
          );
        }

        if (block.type === "ul") {
          return (
            <ul key={key} className="list-disc pl-5 space-y-1">
              {block.items.map((item, idx) => (
                <li key={`${key}-li-${idx}`} className="leading-relaxed">
                  {renderInline(item, variant, `${key}-li-${idx}`)}
                </li>
              ))}
            </ul>
          );
        }

        if (block.type === "ol") {
          return (
            <ol key={key} className="list-decimal pl-5 space-y-1">
              {block.items.map((item, idx) => (
                <li key={`${key}-li-${idx}`} className="leading-relaxed">
                  {renderInline(item, variant, `${key}-li-${idx}`)}
                </li>
              ))}
            </ol>
          );
        }

        if (block.type === "quote") {
          return (
            <blockquote
              key={key}
              className={`border-l-2 pl-3 italic ${
                variant === "assistant"
                  ? "border-accent/50 text-zinc-700 dark:text-zinc-300"
                  : "border-white/50 text-white/90"
              }`}
            >
              {renderInline(block.text, variant, `${key}-q`)}
            </blockquote>
          );
        }

        return (
          <div
            key={key}
            className={`rounded-lg border p-3 overflow-x-auto ${
              variant === "assistant"
                ? "bg-zinc-900 text-zinc-100 border-zinc-700"
                : "bg-black/30 border-white/20 text-white"
            }`}
          >
            {block.language && (
              <p
                className={`mb-1 text-[10px] uppercase tracking-wider ${
                  variant === "assistant" ? "text-zinc-400" : "text-white/60"
                }`}
              >
                {block.language}
              </p>
            )}
            <pre className="text-xs leading-relaxed whitespace-pre-wrap">
              <code>{block.code}</code>
            </pre>
          </div>
        );
      })}
    </div>
  );
}
