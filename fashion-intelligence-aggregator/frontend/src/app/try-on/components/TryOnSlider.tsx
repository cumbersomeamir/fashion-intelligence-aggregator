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
      <div className="mx-auto max-w-2xl px-3 sm:px-4 py-6 sm:py-8 min-w-0">
        <h1 className="font-headline text-xl sm:text-2xl font-semibold text-zinc-900 dark:text-zinc-100 mb-4 sm:mb-6">
          Try-On
        </h1>
        <SkeletonTryOn />
        <p className="mt-4 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 text-center">
          Generating… (~1200ms)
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-3 sm:px-4 py-6 sm:py-8 min-w-0">
      <h1 className="font-headline text-xl sm:text-2xl font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
        Try-On
      </h1>
      <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mb-4 sm:mb-6">
        Slide to reveal. Mouse + touch. Nano Banana Pro placeholder.
      </p>
      <SliderReveal
        beforeLabel="Original"
        afterLabel="Try-On Result"
        className="w-full"
      />
    </div>
  );
}
