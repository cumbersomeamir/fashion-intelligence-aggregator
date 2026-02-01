"use client";

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
    <div className="mx-auto max-w-xl px-3 sm:px-4 py-4 sm:py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] min-w-0 overflow-x-hidden">
      <h1 className="font-headline text-xl sm:text-2xl font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
        Settings
      </h1>
      <div className="rounded-2xl border border-zinc-200/80 dark:border-zinc-700/80 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl shadow-lg overflow-hidden">
        <div className="p-4 sm:p-5 space-y-1">
          <label className="flex items-center justify-between gap-4 min-h-[52px] py-2 px-1 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer">
            <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">Dark mode</span>
            <button
              type="button"
              role="switch"
              aria-checked={darkMode}
              onClick={() => setDarkMode(!darkMode)}
              className="relative w-11 h-6 rounded-full transition-colors shrink-0 touch-manipulation min-h-[44px] min-w-[48px] flex items-center justify-center -m-2"
            >
              <span className={`absolute inset-0 rounded-full transition-colors ${darkMode ? "bg-accent" : "bg-zinc-200 dark:bg-zinc-700"}`} />
              <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${darkMode ? "left-6" : "left-1"}`} />
            </button>
          </label>
          <hr className="border-0 h-px bg-zinc-200 dark:bg-zinc-700 my-1" />
          <div className="flex items-center justify-between gap-4 min-h-[52px] py-2 px-1">
            <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">Accent color</span>
            <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400 shrink-0" title="Read-only">
              #6366F1
            </span>
          </div>
          <hr className="border-0 h-px bg-zinc-200 dark:bg-zinc-700 my-1" />
          <label className="flex items-center justify-between gap-4 min-h-[52px] py-2 px-1 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer">
            <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">Reduce motion</span>
            <button
              type="button"
              role="switch"
              aria-checked={reduceMotion}
              onClick={() => setReduceMotion(!reduceMotion)}
              className="relative w-11 h-6 rounded-full transition-colors shrink-0 touch-manipulation min-h-[44px] min-w-[48px] flex items-center justify-center -m-2"
            >
              <span className={`absolute inset-0 rounded-full transition-colors ${reduceMotion ? "bg-accent" : "bg-zinc-200 dark:bg-zinc-700"}`} />
              <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${reduceMotion ? "left-6" : "left-1"}`} />
            </button>
          </label>
        </div>
        <hr className="border-0 h-px bg-zinc-200 dark:bg-zinc-700" />
        <div className="p-4 sm:p-5 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 px-1 mb-2">
            Data
          </p>
          <button
            type="button"
            onClick={clearProfile}
            className="w-full min-h-[48px] rounded-xl border border-zinc-200 dark:border-zinc-700 py-3 text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 focus:ring-2 focus:ring-accent/30 active:bg-zinc-200 dark:active:bg-zinc-700 transition-colors touch-manipulation"
          >
            Clear profile
          </button>
          <button
            type="button"
            onClick={clearChat}
            className="w-full min-h-[48px] rounded-xl border border-zinc-200 dark:border-zinc-700 py-3 text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 focus:ring-2 focus:ring-accent/30 active:bg-zinc-200 dark:active:bg-zinc-700 transition-colors touch-manipulation"
          >
            Clear chat
          </button>
        </div>
      </div>
    </div>
  );
}
