"use client";

import { Card } from "@/components/Card";
import { useStore } from "@/state/store";

export function SettingsPanel() {
  const {
    darkMode,
    setDarkMode,
    reduceMotion,
    setReduceMotion,
    clearProfile,
    clearChat,
  } = useStore();

  return (
    <div className="mx-auto max-w-xl px-3 sm:px-4 py-6 sm:py-8 min-w-0">
      <h1 className="font-headline text-xl sm:text-2xl font-semibold text-zinc-900 dark:text-zinc-100 mb-5 sm:mb-6">
        Settings
      </h1>
      <Card className="p-4 sm:p-6 space-y-5 sm:space-y-6">
        <label className="flex items-center justify-between gap-4 min-h-[44px] py-2 cursor-pointer">
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Dark mode
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={darkMode}
            onClick={() => setDarkMode(!darkMode)}
            className="relative w-11 h-6 rounded-full transition-colors shrink-0 touch-manipulation min-h-[44px] min-w-[44px] flex items-center justify-center -m-2"
          >
            <span
              className={`
                absolute inset-0 rounded-full transition-colors
                ${darkMode ? "bg-accent" : "bg-zinc-200 dark:bg-zinc-700"}
              `}
            />
            <span
              className={`
                absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform
                ${darkMode ? "left-6" : "left-1"}
              `}
            />
          </button>
        </label>
        <div className="flex items-center justify-between gap-4 min-h-[44px] py-1">
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Accent color
          </span>
          <span className="text-sm text-zinc-500 dark:text-zinc-400 shrink-0" title="Read-only">
            #6366F1 (indigo)
          </span>
        </div>
        <label className="flex items-center justify-between gap-4 min-h-[44px] py-2 cursor-pointer">
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Reduce motion
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={reduceMotion}
            onClick={() => setReduceMotion(!reduceMotion)}
            className="relative w-11 h-6 rounded-full transition-colors shrink-0 touch-manipulation min-h-[44px] min-w-[44px] flex items-center justify-center -m-2"
          >
            <span
              className={`
                absolute inset-0 rounded-full transition-colors
                ${reduceMotion ? "bg-accent" : "bg-zinc-200 dark:bg-zinc-700"}
              `}
            />
            <span
              className={`
                absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform
                ${reduceMotion ? "left-6" : "left-1"}
              `}
            />
          </button>
        </label>
        <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 space-y-2">
          <button
            type="button"
            onClick={clearProfile}
            className="w-full min-h-[48px] rounded-xl border border-zinc-200 dark:border-zinc-700 py-3 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 active:bg-zinc-100 dark:active:bg-zinc-700 transition-colors touch-manipulation"
          >
            Clear profile
          </button>
          <button
            type="button"
            onClick={clearChat}
            className="w-full min-h-[48px] rounded-xl border border-zinc-200 dark:border-zinc-700 py-3 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 active:bg-zinc-100 dark:active:bg-zinc-700 transition-colors touch-manipulation"
          >
            Clear chat
          </button>
        </div>
      </Card>
    </div>
  );
}
