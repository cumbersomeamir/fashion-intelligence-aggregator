"use client";

import { useEffect } from "react";
import { useStore } from "@/state/store";
import { TopicChips } from "@/components/TopicChips";
import type { Topic } from "@/types";

export function ChatPageContent() {
  const { setChatOpen, currentTopic, setCurrentTopic } = useStore();

  useEffect(() => {
    setChatOpen(true);
    return () => setChatOpen(false);
  }, [setChatOpen]);

  return (
    <div className="mx-auto max-w-6xl px-3 sm:px-4 py-6 sm:py-8">
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 p-4 sm:p-6">
        <h1 className="font-headline text-xl sm:text-2xl font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
          Concierge Chat
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mb-4">
          Studio stays visible above. Bottom-sheet is open by default. Topic chips drive highlights; citations in responses.
        </p>
        <TopicChips currentTopic={currentTopic} onSelect={(t: Topic) => setCurrentTopic(t)} />
      </div>
    </div>
  );
}
