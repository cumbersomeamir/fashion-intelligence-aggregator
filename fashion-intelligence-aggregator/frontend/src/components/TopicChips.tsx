"use client";

import type { Topic } from "@/types";
import { TOPICS } from "@/lib/topicDetection";

interface TopicChipsProps {
  currentTopic: Topic | null;
  onSelect: (topic: Topic) => void;
  className?: string;
  /** Single-row scroll, smaller chips (for bottom bar on mobile) */
  compact?: boolean;
}

export function TopicChips({ currentTopic, onSelect, className = "", compact }: TopicChipsProps) {
  return (
    <div className={`flex gap-2 ${compact ? "flex-nowrap overflow-x-auto scrollbar-hide shrink-0 min-w-0" : "flex-wrap"} ${className}`}>
      {TOPICS.map((topic) => (
        <button
          key={topic}
          type="button"
          onClick={() => onSelect(topic)}
          className={`
            shrink-0 rounded-full font-body transition-colors touch-manipulation active:scale-[0.98]
            ${compact ? "min-h-[36px] px-2.5 py-1.5 text-xs" : "min-h-[44px] px-3 py-2.5 sm:min-h-0 sm:py-1.5 text-sm"}
            ${
              currentTopic === topic
                ? "bg-accent text-white"
                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700"
            }
          `}
        >
          {topic}
        </button>
      ))}
    </div>
  );
}
