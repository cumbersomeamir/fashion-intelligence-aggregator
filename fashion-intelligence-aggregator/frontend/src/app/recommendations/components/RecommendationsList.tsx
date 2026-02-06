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
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-6 sm:py-8 pb-[max(2rem,env(safe-area-inset-bottom))] min-w-0 overflow-x-hidden">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-headline text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white mb-2">
            Recommendations
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Personalized picks just for you
          </p>
        </div>

        {/* Loading grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
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
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-6 sm:py-8 pb-[max(2rem,env(safe-area-inset-bottom))] min-w-0 overflow-x-hidden">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-headline text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white mb-2">
          Recommendations
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {prefs.length > 0
            ? `Ranked by your style preferences: ${prefs.slice(0, 3).join(", ")}${prefs.length > 3 ? "..." : ""}`
            : "Add your style preferences to see personalized recommendations"}
        </p>
      </div>

      {/* Results container */}
      <div
        className={`
          rounded-3xl border p-5 sm:p-6 transition-all duration-300
          ${highlight
            ? "border-accent/30 shadow-glow bg-gradient-subtle"
            : "border-[var(--border-subtle)] bg-white dark:bg-zinc-900 shadow-elevation-2"
          }
        `}
      >
        {ranked.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
              <span className="text-2xl">🛍️</span>
            </div>
            <p className="text-lg font-semibold text-zinc-900 dark:text-white mb-2">
              No recommendations yet
            </p>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
              Add your preferences in{" "}
              <a href="/personalize" className="text-accent font-medium hover:underline">
                Personalize
              </a>{" "}
              to see products ranked for you.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {ranked.map(({ product, score }, index) => {
              const matchTags = [...product.styleTags, ...product.occasionTags].filter((t) =>
                prefsLower.includes(t.toLowerCase())
              );
              return (
                <div key={product.id} className="relative min-w-0 group">
                  {/* Rank badge */}
                  <div className="absolute -left-2 -top-2 w-8 h-8 rounded-xl bg-gradient-accent text-white flex items-center justify-center text-sm font-bold z-10 shadow-button">
                    {index + 1}
                  </div>

                  {/* Product card */}
                  <ProductCard product={product} />

                  {/* Why recommended */}
                  <div className="mt-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-[var(--border-subtle)]">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1.5">
                      Why recommended
                    </p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-accent/10 text-accent text-xs font-medium">
                        Score: {score}
                      </span>
                      {matchTags.length > 0 && (
                        <>
                          {matchTags.slice(0, 2).map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-0.5 rounded-md bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs"
                            >
                              {tag}
                            </span>
                          ))}
                          {matchTags.length > 2 && (
                            <span className="text-xs text-zinc-400">+{matchTags.length - 2}</span>
                          )}
                        </>
                      )}
                    </div>
                    {matchTags.length === 0 && product.styleTags.length > 0 && (
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                        Style: {product.styleTags.slice(0, 2).join(", ")}
                      </p>
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
