"use client";

import type { Topic } from "@/types";
import { TOPICS } from "@/lib/topicDetection";

interface TopicChipsProps {
  currentTopic: Topic | null;
  onSelect: (topic: Topic) => void;
  className?: string;
}

export function TopicChips({ currentTopic, onSelect, className = "" }: TopicChipsProps) {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {TOPICS.map((topic) => (
        <button
          key={topic}
          type="button"
          onClick={() => onSelect(topic)}
          className={`
            min-h-[44px] px-3 py-2.5 sm:min-h-0 sm:py-1.5 rounded-full text-sm font-body transition-colors touch-manipulation active:scale-[0.98]
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
