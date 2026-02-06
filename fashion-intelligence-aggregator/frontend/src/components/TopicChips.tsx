"use client";

import type { Topic } from "@/types";
import { TOPICS } from "@/lib/topicDetection";

interface TopicChipsProps {
  currentTopic: Topic | null;
  onSelect: (topic: Topic) => void;
  className?: string;
  compact?: boolean;
}

export function TopicChips({ currentTopic, onSelect, className = "", compact }: TopicChipsProps) {
  return (
    <div className={`flex gap-2 ${compact ? "flex-nowrap overflow-x-auto scrollbar-hide shrink-0 min-w-0" : "flex-wrap"} ${className}`}>
      {TOPICS.map((topic) => {
        const isActive = currentTopic === topic;
        return (
          <button
            key={topic}
            type="button"
            onClick={() => onSelect(topic)}
            className={`
              shrink-0 rounded-xl font-medium
              transition-all duration-300 ease-out-expo
              touch-manipulation active:scale-[0.97]
              border
              ${compact
                ? "min-h-[36px] px-3 py-1.5 text-xs"
                : "min-h-[44px] px-4 py-2.5 sm:min-h-0 sm:py-2 text-sm"
              }
              ${isActive
                ? "bg-gradient-accent text-white border-transparent shadow-button"
                : "bg-white dark:bg-zinc-800/50 text-zinc-700 dark:text-zinc-300 border-[var(--border-subtle)] hover:border-accent/30 hover:text-accent hover:shadow-elevation-2"
              }
            `}
          >
            {topic}
          </button>
        );
      })}
    </div>
  );
}
