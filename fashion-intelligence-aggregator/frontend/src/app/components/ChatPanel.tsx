"use client";

import { useState, useCallback } from "react";
import { TopicChips } from "@/components/TopicChips";
import { useStore } from "@/state/store";
import { sendChat } from "@/lib/api";
import { detectTopicFromMessage } from "@/lib/topicDetection";
import type { Topic } from "@/types";

interface ChatPanelProps {
  onClose: () => void;
}

export function ChatPanel({ onClose }: ChatPanelProps) {
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
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

  return (
    <div className="flex flex-col h-full min-h-[260px] sm:min-h-[280px]">
      {/* Context memory strip */}
      <div className="px-3 py-2 sm:px-4 sm:py-2.5 border-b border-zinc-200/80 dark:border-zinc-700/80 shrink-0 bg-zinc-50/50 dark:bg-zinc-800/30">
        <p className="text-[10px] sm:text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">Context</p>
        <TopicChips
          currentTopic={currentTopic}
          onSelect={(t) => setCurrentTopic(t)}
        />
      </div>
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-4 space-y-2.5 min-h-0">
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
      </div>
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
    </div>
  );
}
