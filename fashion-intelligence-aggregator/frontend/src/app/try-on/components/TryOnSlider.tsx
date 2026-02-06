"use client";

import { useState, useEffect } from "react";
import { SliderReveal } from "@/components/SliderReveal";

export function TryOnSlider() {
  const [generating, setGenerating] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setGenerating(false), 1200);
    return () => clearTimeout(t);
  }, []);

  if (generating) {
    return (
      <div className="mx-auto max-w-2xl px-4 sm:px-6 py-6 sm:py-8 pb-[max(2rem,env(safe-area-inset-bottom))] min-w-0 overflow-x-hidden">
        {/* Header */}
        <div className="mb-6">
          <h1 className="font-headline text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white mb-2">
            Virtual Try-On
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            See how it looks on you
          </p>
        </div>

        {/* Loading state */}
        <div className="relative rounded-3xl border border-[var(--border-subtle)] overflow-hidden bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-800 shadow-elevation-3">
          <div className="absolute inset-0 animate-shimmer opacity-60" />
          <div className="relative aspect-[3/4] flex flex-col items-center justify-center p-8">
            {/* Spinner */}
            <div className="relative mb-6">
              <div className="w-16 h-16 rounded-full border-[3px] border-zinc-200 dark:border-zinc-700" />
              <div className="absolute inset-0 w-16 h-16 rounded-full border-[3px] border-transparent border-t-accent animate-spin" />
            </div>

            {/* Text */}
            <p className="text-base font-semibold text-zinc-800 dark:text-zinc-200 mb-1">
              Generating your try-on
            </p>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              This usually takes a moment...
            </p>

            {/* Progress dots */}
            <div className="flex items-center gap-2 mt-6">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full bg-accent animate-pulse"
                  style={{ animationDelay: `${i * 0.2}s` }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-6 sm:py-8 pb-[max(2rem,env(safe-area-inset-bottom))] min-w-0 overflow-x-hidden">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-headline text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white mb-2">
          Virtual Try-On
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Drag the slider to compare{" "}
          <span className="font-medium text-zinc-700 dark:text-zinc-300">Before</span>
          {" "}vs{" "}
          <span className="font-medium text-gradient">After</span>
        </p>
      </div>

      {/* Slider */}
      <SliderReveal
        beforeLabel="Before"
        afterLabel="After"
        className="w-full"
      />

      {/* Tips */}
      <div className="mt-6 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-[var(--border-subtle)]">
        <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
          Tips
        </p>
        <ul className="text-sm text-zinc-600 dark:text-zinc-400 space-y-1">
          <li>• Drag the handle to reveal the try-on result</li>
          <li>• Works with mouse and touch</li>
          <li>• Upload a clear photo for best results</li>
        </ul>
      </div>
    </div>
  );
}
