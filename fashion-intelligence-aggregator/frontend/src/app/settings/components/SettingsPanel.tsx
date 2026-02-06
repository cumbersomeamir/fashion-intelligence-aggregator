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
    <div className="mx-auto max-w-xl px-4 sm:px-6 py-6 sm:py-8 pb-[max(2rem,env(safe-area-inset-bottom))] min-w-0 overflow-x-hidden">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-headline text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white mb-2">
          Settings
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Customize your experience
        </p>
      </div>

      {/* Appearance Section */}
      <div className="mb-6">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-4">
          Appearance
        </h2>
        <div className="rounded-2xl border border-[var(--border-subtle)] bg-white dark:bg-zinc-900 shadow-elevation-2 overflow-hidden">
          {/* Dark mode toggle */}
          <label className="flex items-center justify-between gap-4 p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer border-b border-[var(--border-subtle)]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                <span className="text-lg">{darkMode ? "🌙" : "☀️"}</span>
              </div>
              <div>
                <span className="text-sm font-semibold text-zinc-900 dark:text-white block">Dark mode</span>
                <span className="text-xs text-zinc-500 dark:text-zinc-400">Switch to dark theme</span>
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={darkMode}
              onClick={() => setDarkMode(!darkMode)}
              className={`
                relative w-14 h-8 rounded-full transition-all duration-300 shrink-0
                ${darkMode ? "bg-gradient-accent shadow-button" : "bg-zinc-200 dark:bg-zinc-700"}
              `}
            >
              <span
                className={`
                  absolute top-1 w-6 h-6 rounded-full bg-white shadow-elevation-2
                  transition-all duration-300 ease-out-back
                  ${darkMode ? "left-7" : "left-1"}
                `}
              />
            </button>
          </label>

          {/* Accent color */}
          <div className="flex items-center justify-between gap-4 p-4 border-b border-[var(--border-subtle)]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-accent flex items-center justify-center">
                <span className="text-white text-lg">🎨</span>
              </div>
              <div>
                <span className="text-sm font-semibold text-zinc-900 dark:text-white block">Accent color</span>
                <span className="text-xs text-zinc-500 dark:text-zinc-400">Brand color theme</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-gradient-accent shadow-button" />
              <span className="text-xs font-mono text-zinc-400">#6366F1</span>
            </div>
          </div>

          {/* Reduce motion toggle */}
          <label className="flex items-center justify-between gap-4 p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                <span className="text-lg">✨</span>
              </div>
              <div>
                <span className="text-sm font-semibold text-zinc-900 dark:text-white block">Reduce motion</span>
                <span className="text-xs text-zinc-500 dark:text-zinc-400">Minimize animations</span>
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={reduceMotion}
              onClick={() => setReduceMotion(!reduceMotion)}
              className={`
                relative w-14 h-8 rounded-full transition-all duration-300 shrink-0
                ${reduceMotion ? "bg-gradient-accent shadow-button" : "bg-zinc-200 dark:bg-zinc-700"}
              `}
            >
              <span
                className={`
                  absolute top-1 w-6 h-6 rounded-full bg-white shadow-elevation-2
                  transition-all duration-300 ease-out-back
                  ${reduceMotion ? "left-7" : "left-1"}
                `}
              />
            </button>
          </label>
        </div>
      </div>

      {/* Data Section */}
      <div>
        <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-4">
          Data & Privacy
        </h2>
        <div className="rounded-2xl border border-[var(--border-subtle)] bg-white dark:bg-zinc-900 shadow-elevation-2 overflow-hidden">
          <div className="p-4 space-y-3">
            <button
              type="button"
              onClick={clearProfile}
              className="w-full min-h-[52px] rounded-xl border border-[var(--border-subtle)] py-3.5 text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 hover:border-[var(--border-default)] active:scale-[0.98] transition-all duration-200 touch-manipulation"
            >
              Clear profile data
            </button>
            <button
              type="button"
              onClick={clearChat}
              className="w-full min-h-[52px] rounded-xl border border-[var(--border-subtle)] py-3.5 text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 hover:border-[var(--border-default)] active:scale-[0.98] transition-all duration-200 touch-manipulation"
            >
              Clear chat history
            </button>
          </div>
          <div className="px-4 pb-4">
            <p className="text-xs text-zinc-400 dark:text-zinc-500 leading-relaxed">
              Clearing data will remove your saved preferences, measurements, and conversation history. This action cannot be undone.
            </p>
          </div>
        </div>
      </div>

      {/* Version info */}
      <div className="mt-8 text-center">
        <p className="text-xs text-zinc-400 dark:text-zinc-500">
          Fashion Intelligence v1.0
        </p>
      </div>
    </div>
  );
}
