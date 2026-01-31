"use client";

import { useState, useEffect } from "react";
import { SliderReveal } from "@/components/SliderReveal";
import { SkeletonTryOn } from "@/components/Skeleton";

export function TryOnSlider() {
  const [generating, setGenerating] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setGenerating(false), 1200);
    return () => clearTimeout(t);
  }, []);

  if (generating) {
    return (
      <div className="mx-auto max-w-2xl px-3 sm:px-4 py-4 sm:py-5 min-w-0">
        <h1 className="font-headline text-xl sm:text-2xl font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
          Try-On
        </h1>
        <div className="relative rounded-2xl border border-zinc-200 dark:border-zinc-700 overflow-hidden bg-gradient-to-br from-zinc-100 via-zinc-200/50 to-zinc-100 dark:from-zinc-800 dark:via-zinc-700/50 dark:to-zinc-800">
          <div className="absolute inset-0 animate-shimmer opacity-80" />
          <div className="relative aspect-[3/4] flex flex-col items-center justify-center p-6">
            <div className="w-12 h-12 rounded-full border-2 border-accent/50 border-t-accent animate-spin mb-4" />
            <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Generating…</p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">~1.2s</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-3 sm:px-4 py-4 sm:py-5 min-w-0">
      <h1 className="font-headline text-xl sm:text-2xl font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
        Try-On
      </h1>
      <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mb-3">
        <span className="font-medium text-zinc-700 dark:text-zinc-300">Before</span> / <span className="font-medium text-accent">After</span> — slide to reveal. Mouse + touch.
      </p>
      <SliderReveal
        beforeLabel="Before"
        afterLabel="After"
        className="w-full"
      />
    </div>
  );
}
