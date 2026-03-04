"use client";

import Link from "next/link";

interface ChatModeToggleProps {
  mode: "chat" | "avatar";
}

export function ChatModeToggle({ mode }: ChatModeToggleProps) {
  return (
    <div className="inline-flex rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-100/80 dark:bg-zinc-800/70 p-1">
      <Link
        href="/chat"
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
          mode === "chat"
            ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm"
            : "text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white"
        }`}
      >
        Chat
      </Link>
      <Link
        href="/avatar"
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
          mode === "avatar"
            ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm"
            : "text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white"
        }`}
      >
        Avatar
      </Link>
    </div>
  );
}
