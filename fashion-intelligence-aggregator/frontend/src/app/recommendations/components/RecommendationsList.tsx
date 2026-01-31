"use client";

import { useMemo } from "react";
import { useStore } from "@/state/store";
import { ProductCard } from "@/components/ProductCard";
import { SkeletonCard } from "@/components/Skeleton";

function heuristicScore(
  product: { styleTags: string[]; occasionTags: string[]; price: number },
  stylePrefs: string[] = []
): number {
  let score = 50;
  const prefs = stylePrefs.map((p) => p.toLowerCase());
  for (const tag of [...product.styleTags, ...product.occasionTags]) {
    if (prefs.includes(tag.toLowerCase())) score += 15;
  }
  if (product.price < 80) score += 5;
  return score;
}

export function RecommendationsList() {
  const { products, productsLoading, profile, currentTopic } = useStore();
  const highlight = currentTopic === "Budget" || currentTopic === "Occasion" || currentTopic === "Style";

  const ranked = useMemo(() => {
    const prefs = profile?.stylePrefs ?? [];
    return [...products]
      .map((p) => ({ product: p, score: heuristicScore(p, prefs) }))
      .sort((a, b) => b.score - a.score);
  }, [products, profile?.stylePrefs]);

  if (productsLoading) {
    return (
      <div className="mx-auto max-w-6xl px-3 sm:px-4 py-6 sm:py-8 min-w-0">
        <h1 className="font-headline text-xl sm:text-2xl font-semibold text-zinc-900 dark:text-zinc-100 mb-4 sm:mb-6">
          Recommendations
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-3 sm:px-4 py-6 sm:py-8 min-w-0">
      <h1 className="font-headline text-xl sm:text-2xl font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
        Recommendations
      </h1>
      <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mb-4 sm:mb-6">
        Ranked by profile prefs + heuristic. Why recommended: product fields + prefs.
      </p>
      <div
        className={`
          rounded-2xl border p-4 sm:p-6
          ${highlight ? "ring-2 ring-accent ring-offset-2 dark:ring-offset-zinc-900 border-accent/50" : "border-zinc-200 dark:border-zinc-800"}
        `}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {ranked.map(({ product, score }) => (
            <div key={product.id} className="relative min-w-0">
              <ProductCard product={product} />
              <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 break-words">
                Score: {score} — {product.styleTags.join(", ")}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
