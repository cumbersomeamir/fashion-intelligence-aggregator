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
      <div className="mx-auto max-w-6xl px-3 sm:px-4 py-4 sm:py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] min-w-0 overflow-x-hidden">
        <h1 className="font-headline text-xl sm:text-2xl font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
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

  const prefs = profile?.stylePrefs ?? [];
  const prefsLower = prefs.map((p) => p.toLowerCase());

  return (
    <div className="mx-auto max-w-6xl px-3 sm:px-4 py-4 sm:py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] min-w-0 overflow-x-hidden">
      <h1 className="font-headline text-xl sm:text-2xl font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
        Recommendations
      </h1>
      <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4">
        Ranked by your preferences. {prefs.length > 0 && "Matches your style tags."}
      </p>
      <div
        className={`
          rounded-2xl border p-4 sm:p-5 shadow-md
          ${highlight ? "ring-2 ring-accent ring-offset-2 dark:ring-offset-zinc-900 border-accent/50" : "border-zinc-200 dark:border-zinc-800"}
        `}
      >
        {ranked.length === 0 ? (
          <p className="text-sm text-zinc-500 dark:text-zinc-400 py-8 text-center">
            No products yet. Add preferences in <a href="/personalize" className="text-accent font-medium underline">Personalize</a> or wait for products to load.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {ranked.map(({ product, score }, index) => {
              const matchTags = [...product.styleTags, ...product.occasionTags].filter((t) => prefsLower.includes(t.toLowerCase()));
              return (
                <div key={product.id} className="relative min-w-0 group">
                  <div className="absolute -left-1 top-2 w-7 h-7 rounded-full bg-accent text-white flex items-center justify-center text-xs font-bold z-10 shadow">
                    {index + 1}
                  </div>
                  <ProductCard product={product} />
                  <div className="mt-2 p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-700/60">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">
                      Why recommended
                    </p>
                    <p className="text-xs text-zinc-700 dark:text-zinc-300">
                      Score {score}
                      {matchTags.length > 0 && (
                        <span className="text-accent font-medium"> — matches: {matchTags.join(", ")}</span>
                      )}
                    </p>
                    {matchTags.length === 0 && (
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">Style: {product.styleTags.slice(0, 2).join(", ")}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
