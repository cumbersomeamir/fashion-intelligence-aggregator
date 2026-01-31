"use client";

import Link from "next/link";
import { Card } from "@/components/Card";
import { useStore } from "@/state/store";
import type { Topic } from "@/types";

const TOPIC_TO_CARD: Record<Topic, string> = {
  Fit: "size",
  Budget: "recommendations",
  Occasion: "recommendations",
  Style: "recommendations",
  Fabric: "product",
  Comparison: "comparison",
  TryOn: "tryon",
};

function getHighlightForTopic(topic: Topic | null): Record<string, boolean> {
  if (!topic) return {};
  const key = TOPIC_TO_CARD[topic];
  return key ? { [key]: true } : {};
}

const CARDS = [
  { key: "tryon", title: "Try-On", href: "/try-on", desc: "Slide to reveal virtual try-on result. Nano Banana Pro placeholder.", large: true },
  { key: "product", title: "Product Info", href: "/product", desc: "Unified schema: name, brand, fabric, size chart, texture tags.", large: false },
  { key: "size", title: "Size & Measurement", href: "/size", desc: "Body measurements and fit status. Good Fit triggers haptic.", large: false },
  { key: "comparison", title: "Comparison", href: "/product", desc: "Cross-brand products, unified schema comparison.", large: false },
  { key: "recommendations", title: "Recommendations", href: "/recommendations", desc: "Ranked by profile prefs + heuristic. Why recommended.", large: false },
] as const;

export function BentoGrid() {
  const { currentTopic, productsLoading } = useStore();
  const highlight = getHighlightForTopic(currentTopic);
  const hasTopic = !!currentTopic;

  return (
    <div className="mx-auto max-w-6xl px-3 sm:px-4 py-6 sm:py-8">
      <h1 className="font-headline text-xl sm:text-2xl font-semibold text-zinc-900 dark:text-zinc-100 mb-5 sm:mb-8">
        The Modular Studio
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {CARDS.map(({ key, title, href, desc, large }) => {
          const isHighlight = highlight[key as keyof typeof highlight];
          const discussingLabel = hasTopic && isHighlight && currentTopic ? `Discussing: ${currentTopic}` : null;
          return (
            <Card
              key={key}
              highlight={!!isHighlight}
              inactive={hasTopic && !isHighlight}
              pulse={!!isHighlight}
              className={large ? "md:col-span-2 lg:row-span-2 p-4 sm:p-6 shadow-lg" : "p-4 sm:p-6"}
            >
              <Link href={href} className="block h-full min-h-[140px] sm:min-h-0 active:opacity-90 touch-manipulation">
                {discussingLabel && (
                  <p className="text-xs font-medium text-accent mb-2 rounded-full bg-accent/10 w-fit px-2.5 py-1">
                    {discussingLabel}
                  </p>
                )}
                <h2 className="font-headline font-semibold text-base sm:text-lg mb-1 sm:mb-2 text-zinc-900 dark:text-zinc-100">
                  {title}
                </h2>
                <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mb-3 sm:mb-4 line-clamp-2">
                  {desc}
                </p>
                {large && (
                  <div className="aspect-[4/3] rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 text-xs sm:text-sm">
                    Try-On preview
                  </div>
                )}
              </Link>
            </Card>
          );
        })}
      </div>
      {productsLoading && (
        <p className="mt-4 text-sm text-zinc-500">Loading products…</p>
      )}
    </div>
  );
}
