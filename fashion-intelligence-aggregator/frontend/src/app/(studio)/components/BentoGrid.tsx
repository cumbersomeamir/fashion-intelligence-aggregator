"use client";

import Link from "next/link";
import { Card } from "@/components/Card";
import { useStore } from "@/state/store";
import type { Topic } from "@/types";

function getHighlightForTopic(topic: Topic | null): Record<string, boolean> {
  if (!topic) return {};
  const map: Record<Topic, string> = {
    Fit: "size",
    Budget: "recommendations",
    Occasion: "recommendations",
    Style: "recommendations",
    Fabric: "product",
    Comparison: "comparison",
    TryOn: "tryon",
  };
  const key = map[topic];
  return key ? { [key]: true } : {};
}

export function BentoGrid() {
  const { currentTopic, productsLoading } = useStore();
  const highlight = getHighlightForTopic(currentTopic);

  return (
    <div className="mx-auto max-w-6xl px-3 sm:px-4 py-6 sm:py-8">
      <h1 className="font-headline text-xl sm:text-2xl font-semibold text-zinc-900 dark:text-zinc-100 mb-4 sm:mb-6">
        The Modular Studio
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <Card highlight={highlight.tryon} className="md:col-span-2 lg:row-span-2 p-4 sm:p-6">
          <Link href="/try-on" className="block h-full min-h-[140px] sm:min-h-0 active:opacity-90 touch-manipulation">
            <h2 className="font-headline font-semibold text-base sm:text-lg mb-1 sm:mb-2">Try-On</h2>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mb-3 sm:mb-4 line-clamp-2">
              Slide to reveal virtual try-on result. Nano Banana Pro placeholder.
            </p>
            <div className="aspect-[4/3] rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 text-xs sm:text-sm">
              Try-On preview
            </div>
          </Link>
        </Card>
        <Card highlight={highlight.product} className="p-4 sm:p-6">
          <Link href="/product" className="block min-h-[44px] active:opacity-90 touch-manipulation">
            <h2 className="font-headline font-semibold text-base sm:text-lg mb-1 sm:mb-2">Product Info</h2>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2">
              Unified schema: name, brand, fabric, size chart, texture tags.
            </p>
          </Link>
        </Card>
        <Card highlight={highlight.size} className="p-4 sm:p-6">
          <Link href="/size" className="block min-h-[44px] active:opacity-90 touch-manipulation">
            <h2 className="font-headline font-semibold text-base sm:text-lg mb-1 sm:mb-2">Size & Measurement</h2>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2">
              Body measurements and fit status. Good Fit triggers haptic.
            </p>
          </Link>
        </Card>
        <Card highlight={highlight.comparison} className="p-4 sm:p-6">
          <Link href="/product" className="block min-h-[44px] active:opacity-90 touch-manipulation">
            <h2 className="font-headline font-semibold text-base sm:text-lg mb-1 sm:mb-2">Comparison</h2>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2">
              Cross-brand products, unified schema comparison.
            </p>
          </Link>
        </Card>
        <Card highlight={highlight.recommendations} className="p-4 sm:p-6">
          <Link href="/recommendations" className="block min-h-[44px] active:opacity-90 touch-manipulation">
            <h2 className="font-headline font-semibold text-base sm:text-lg mb-1 sm:mb-2">Recommendations</h2>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2">
              Ranked by profile prefs + heuristic. Why recommended.
            </p>
          </Link>
        </Card>
      </div>
      {productsLoading && (
        <p className="mt-4 text-sm text-zinc-500">Loading products…</p>
      )}
    </div>
  );
}
