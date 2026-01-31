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
    <div className="flex flex-col h-full min-h-[280px] sm:min-h-[300px]">
      <div className="p-3 sm:p-4 border-b border-zinc-200 dark:border-zinc-800 shrink-0">
        <TopicChips
          currentTopic={currentTopic}
          onSelect={(t) => setCurrentTopic(t)}
        />
      </div>
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-4 space-y-3 min-h-0">
        {chatMessages.length === 0 && (
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
            Ask about fit, budget, occasion, style, fabric, comparison, or try-on.
          </p>
        )}
        {chatMessages.map((m) => (
          <div
            key={m.id}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"} min-w-0`}
          >
            <div
              className={`
                max-w-[90%] sm:max-w-[85%] rounded-2xl px-3 sm:px-4 py-2.5 text-sm break-words
                ${
                  m.role === "user"
                    ? "bg-accent text-white"
                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                }
              `}
            >
              <p className="break-words">{m.content}</p>
              {m.citations && m.citations.length > 0 && (
                <ul className="mt-2 text-xs opacity-80 space-y-1 break-words">
                  {m.citations.slice(0, 3).map((c, i) => (
                    <li key={i} className="break-words">{c}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ))}
        {sending && (
          <div className="flex justify-start">
            <div className="rounded-2xl px-3 sm:px-4 py-2.5 bg-zinc-100 dark:bg-zinc-800 text-sm text-zinc-500">
              …
            </div>
          </div>
        )}
      </div>
      <div className="p-3 sm:p-4 border-t border-zinc-200 dark:border-zinc-800 flex gap-2 shrink-0">
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
