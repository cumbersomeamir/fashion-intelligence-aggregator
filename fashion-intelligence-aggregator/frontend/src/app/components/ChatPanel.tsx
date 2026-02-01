"use client";

import { useState, useCallback } from "react";
import { TopicChips } from "@/components/TopicChips";
import { useStore } from "@/state/store";
import { sendChat } from "@/lib/api";
import { detectTopicFromMessage } from "@/lib/topicDetection";
import type { Topic } from "@/types";

type PanelMode = "chat" | "search";

const SEARCH_COUNTRIES = [
  { code: "in", label: "India" },
  { code: "us", label: "US" },
  { code: "uk", label: "UK" },
  { code: "ae", label: "UAE" },
  { code: "ca", label: "Canada" },
] as const;

interface ShoppingResult {
  position: number;
  title: string;
  product_id?: string;
  product_link?: string;
  /** SerpApi URL to fetch merchant/seller links (direct Myntra, Amazon, etc.) */
  serpapi_immersive_product_api?: string;
  source?: string;
  price?: string;
  extracted_price?: number;
  thumbnail?: string;
  serpapi_thumbnail?: string;
  rating?: number;
  reviews?: number;
  tag?: string;
  delivery?: string;
}

interface ChatPanelProps {
  onClose: () => void;
}

export function ChatPanel({ onClose }: ChatPanelProps) {
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [mode, setMode] = useState<PanelMode>("chat");
  const [searchCountry, setSearchCountry] = useState<string>("in");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<ShoppingResult[]>([]);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [openingProductPosition, setOpeningProductPosition] = useState<number | null>(null);
  const {
    chatMessages,
    setChatMessages,
    currentTopic,
    setCurrentTopic,
  } = useStore();

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || sending) return;
    setInput("");
    const userMsg = {
      id: crypto.randomUUID(),
      role: "user" as const,
      content: text,
    };
    setChatMessages((prev) => [...prev, userMsg]);
    setSending(true);
    try {
      const topic = detectTopicFromMessage(text);
      setCurrentTopic(topic);
      const res = await sendChat(text, topic);
      setCurrentTopic(res.topic as Topic);
      setChatMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: res.message,
          topic: res.topic as Topic,
          citations: res.citations,
        },
      ]);
    } catch {
      setChatMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "Sorry, I couldn’t reach the server. Try again.",
        },
      ]);
    } finally {
      setSending(false);
    }
  }, [input, sending, setChatMessages, setCurrentTopic]);

  const handleSearch = useCallback(async () => {
    const q = searchQuery.trim();
    if (!q || searchLoading) return;
    setSearchLoading(true);
    setSearchError(null);
    setSearchResults([]);
    try {
      const params = new URLSearchParams({ q, country: searchCountry });
      const res = await fetch(`/api/shopping-search?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Search failed");
      setSearchResults(data.results ?? []);
    } catch (e) {
      setSearchError(e instanceof Error ? e.message : "Search failed");
    } finally {
      setSearchLoading(false);
    }
  }, [searchQuery, searchLoading, searchCountry]);

  const openProduct = useCallback(
    async (r: ShoppingResult) => {
      const fallbackUrl = r.product_link ?? "#";
      if (!r.serpapi_immersive_product_api) {
        window.open(fallbackUrl, "_blank");
        return;
      }
      setOpeningProductPosition(r.position);
      try {
        const params = new URLSearchParams({
          serpapi_url: r.serpapi_immersive_product_api,
        });
        const res = await fetch(`/api/shopping-product?${params.toString()}`);
        const data = await res.json();
        const merchantLink =
          data.merchantLink ?? (Array.isArray(data.sellers) && data.sellers[0]?.link) ?? null;
        window.open(merchantLink ?? fallbackUrl, "_blank");
      } catch {
        window.open(fallbackUrl, "_blank");
      } finally {
        setOpeningProductPosition(null);
      }
    },
    []
  );

  return (
    <div className="flex flex-col h-full min-h-[260px] sm:min-h-[280px]">
      {/* Mode toggle + Context */}
      <div className="px-3 py-2 sm:px-4 sm:py-2.5 border-b border-zinc-200/80 dark:border-zinc-700/80 shrink-0 bg-zinc-50/50 dark:bg-zinc-800/30 space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-[10px] sm:text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Mode</span>
          <div className="flex rounded-lg border border-zinc-200 dark:border-zinc-600 overflow-hidden">
            <button
              type="button"
              onClick={() => setMode("chat")}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${mode === "chat" ? "bg-accent text-white" : "bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-700"}`}
            >
              Chat
            </button>
            <button
              type="button"
              onClick={() => setMode("search")}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${mode === "search" ? "bg-accent text-white" : "bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-700"}`}
            >
              Search
            </button>
          </div>
        </div>
        {mode === "chat" && (
          <>
            <p className="text-[10px] sm:text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">Context</p>
            <TopicChips
              currentTopic={currentTopic}
              onSelect={(t) => setCurrentTopic(t)}
            />
          </>
        )}
      </div>
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-4 space-y-2.5 min-h-0">
        {mode === "search" ? (
          <>
            <div className="mb-3">
              <p className="text-[10px] sm:text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">Country</p>
              <div className="flex flex-wrap gap-1.5">
                {SEARCH_COUNTRIES.map(({ code, label }) => (
                  <button
                    key={code}
                    type="button"
                    onClick={() => setSearchCountry(code)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${searchCountry === code ? "bg-accent text-white" : "bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-600"}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Item name (e.g. grey sweater)"
                className="flex-1 min-w-0 min-h-[40px] rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              />
              <button
                type="button"
                onClick={handleSearch}
                disabled={searchLoading || !searchQuery.trim()}
                className="min-h-[40px] px-4 py-2 rounded-xl bg-accent text-white text-sm font-medium disabled:opacity-50 hover:bg-accent/90 shrink-0"
              >
                {searchLoading ? "…" : "Search"}
              </button>
            </div>
            {searchError && (
              <p className="text-sm text-red-600 dark:text-red-400 py-1">{searchError}</p>
            )}
            {searchResults.length > 0 && (
              <div className="grid gap-3 sm:grid-cols-2">
                {searchResults.slice(0, 12).map((r) => {
                  const opening = openingProductPosition === r.position;
                  return (
                    <button
                      key={r.position}
                      type="button"
                      onClick={() => openProduct(r)}
                      disabled={opening}
                      className="flex gap-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/80 p-3 hover:border-accent/50 transition-colors text-left disabled:opacity-70"
                    >
                      <div className="shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-700">
                        {(r.thumbnail || r.serpapi_thumbnail) && (
                          <img
                            src={r.thumbnail ?? r.serpapi_thumbnail ?? ""}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-zinc-900 dark:text-zinc-100 line-clamp-2">{r.title}</p>
                        {r.source && (
                          <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5">{r.source}</p>
                        )}
                        <p className="text-sm font-semibold text-accent mt-1">
                          {opening ? "Opening store…" : r.price ?? (r.extracted_price != null ? `$${r.extracted_price}` : "")}
                        </p>
                        {!opening && (r.rating != null || r.tag) && (
                          <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                            {[r.rating != null && `${r.rating}★`, r.reviews != null && `${r.reviews} reviews`, r.tag].filter(Boolean).join(" · ")}
                          </p>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
            {!searchLoading && searchResults.length === 0 && searchQuery.trim() && !searchError && (
              <p className="text-xs text-zinc-500 dark:text-zinc-400 py-2">No results. Try another query.</p>
            )}
          </>
        ) : (
          <>
        {chatMessages.length === 0 && (
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 py-1">
            Ask about fit, budget, occasion, style, fabric, comparison, or try-on.
          </p>
        )}
        {chatMessages.map((m) => (
          <div
            key={m.id}
            className={`flex gap-2 ${m.role === "user" ? "justify-end" : "justify-start"} min-w-0`}
          >
            {m.role === "assistant" && (
              <div className="shrink-0 w-7 h-7 rounded-full bg-accent/20 flex items-center justify-center mt-0.5" aria-hidden>
                <span className="text-accent text-xs font-bold">AI</span>
              </div>
            )}
            <div
              className={`
                max-w-[90%] sm:max-w-[85%] rounded-2xl px-3 sm:px-4 py-2.5 text-sm break-words
                ${
                  m.role === "user"
                    ? "bg-accent text-white shadow-sm"
                    : "bg-zinc-100 dark:bg-zinc-800/90 text-zinc-900 dark:text-zinc-100 border border-zinc-200/60 dark:border-zinc-700/60"
                }
              `}
            >
              {m.role === "assistant" && (
                <p className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400 mb-1">Concierge</p>
              )}
              <p className="break-words">{m.content}</p>
              {m.citations && m.citations.length > 0 && (
                <div className="mt-2.5 pt-2 border-t border-zinc-200/60 dark:border-zinc-600/60">
                  <p className="text-[10px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">References</p>
                  <div className="flex flex-wrap gap-1.5">
                    {m.citations.slice(0, 4).map((c, i) => (
                      <span key={i} className="inline-block px-2 py-1 rounded-md bg-accent/10 text-accent text-xs break-all max-w-full">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        {sending && (
          <div className="flex justify-start gap-2">
            <div className="shrink-0 w-7 h-7 rounded-full bg-accent/20 flex items-center justify-center mt-0.5" aria-hidden>
              <span className="text-accent text-xs font-bold">AI</span>
            </div>
            <div className="rounded-2xl px-3 sm:px-4 py-2.5 bg-zinc-100 dark:bg-zinc-800 text-sm text-zinc-500 border border-zinc-200/60 dark:border-zinc-700/60">
              …
            </div>
          </div>
        )}
          </>
        )}
      </div>
      {mode === "chat" && (
        <div className="p-2.5 sm:p-3 border-t border-zinc-200 dark:border-zinc-800 flex gap-2 shrink-0">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type a message…"
            className="flex-1 min-w-0 min-h-[44px] rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-2.5 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-accent touch-manipulation"
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={sending || !input.trim()}
            className="min-h-[44px] min-w-[64px] px-4 py-2.5 rounded-xl bg-accent text-white text-sm font-medium disabled:opacity-50 hover:bg-accent/90 active:bg-accent/80 transition-colors touch-manipulation shrink-0"
          >
            Send
          </button>
        </div>
      )}
    </div>
  );
}
