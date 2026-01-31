"use client";

import { useSearchParams } from "next/navigation";
import { useStore } from "@/state/store";
import { Card } from "@/components/Card";
import { Skeleton } from "@/components/Skeleton";

export function ProductDetail() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const { products, productsLoading } = useStore();
  const product = id ? products.find((p) => p.id === id) : products[0];

  if (productsLoading) {
    return (
      <div className="mx-auto max-w-2xl px-3 sm:px-4 py-6 sm:py-8 space-y-4 min-w-0">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-2xl px-3 sm:px-4 py-6 sm:py-8 text-zinc-500 text-sm sm:text-base">
        No product selected. Pick one from Studio or Recommendations.
      </div>
    );
  }

  const totalPct = Object.values(product.fabricComposition).reduce((a, b) => a + b, 0) || 100;
  const recommendedSizeIndex = Math.floor(product.sizeChart.length / 2);
  const recommendedSize = product.sizeChart[recommendedSizeIndex]?.size;

  return (
    <div className="mx-auto max-w-2xl px-3 sm:px-4 py-6 sm:py-8 min-w-0">
      <Card className="p-4 sm:p-6 shadow-md">
        <h1 className="font-headline text-xl sm:text-2xl font-semibold text-zinc-900 dark:text-zinc-100 break-words">
          {product.name}
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium">{product.brand}</p>
        <p className="text-base sm:text-lg font-semibold text-accent mt-1">${product.price}</p>

        <hr className="my-5 sm:my-6 border-0 h-px bg-zinc-200 dark:bg-zinc-700" />

        <section>
          <h2 className="font-headline font-semibold text-sm uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-3">
            Fabric composition
          </h2>
          <div className="space-y-2.5">
            {Object.entries(product.fabricComposition).map(([key, val]) => {
              const pct = totalPct ? (val / totalPct) * 100 : 0;
              return (
                <div key={key} className="flex items-center gap-3">
                  <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300 w-24 shrink-0 capitalize">{key}</span>
                  <div className="flex-1 h-2 rounded-full bg-zinc-200 dark:bg-zinc-700 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-accent/80 transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 w-10 text-right">{val}%</span>
                </div>
              );
            })}
          </div>
          <div className="flex flex-wrap gap-1.5 mt-3">
            {Object.keys(product.fabricComposition).map((key) => (
              <span key={key} className="px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-xs font-medium text-zinc-700 dark:text-zinc-300 capitalize">
                {key}
              </span>
            ))}
          </div>
        </section>

        <hr className="my-5 sm:my-6 border-0 h-px bg-zinc-200 dark:bg-zinc-700" />

        <section>
          <h2 className="font-headline font-semibold text-sm uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-3">
            Size chart
          </h2>
          <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
            <table className="w-full min-w-[280px] text-sm text-left">
              <thead>
                <tr className="border-b-2 border-zinc-200 dark:border-zinc-700">
                  <th className="py-2.5 pr-4 font-semibold text-zinc-700 dark:text-zinc-300">Size</th>
                  {product.sizeChart[0]?.chest != null && <th className="py-2.5 pr-4 font-semibold text-zinc-700 dark:text-zinc-300">Chest</th>}
                  {product.sizeChart[0]?.waist != null && <th className="py-2.5 pr-4 font-semibold text-zinc-700 dark:text-zinc-300">Waist</th>}
                  {product.sizeChart[0]?.hips != null && <th className="py-2.5 pr-4 font-semibold text-zinc-700 dark:text-zinc-300">Hips</th>}
                  {product.sizeChart[0]?.length != null && <th className="py-2.5 pr-4 font-semibold text-zinc-700 dark:text-zinc-300">Length</th>}
                </tr>
              </thead>
              <tbody>
                {product.sizeChart.map((row) => (
                  <tr
                    key={row.size}
                    className={`border-b border-zinc-100 dark:border-zinc-800 ${row.size === recommendedSize ? "bg-accent/10 dark:bg-accent/20" : ""}`}
                  >
                    <td className="py-2.5 pr-4 font-medium">
                      {row.size}
                      {row.size === recommendedSize && (
                        <span className="ml-2 text-[10px] font-semibold uppercase text-accent">Recommended</span>
                      )}
                    </td>
                    {row.chest != null && <td className="py-2.5 pr-4">{row.chest}</td>}
                    {row.waist != null && <td className="py-2.5 pr-4">{row.waist}</td>}
                    {row.hips != null && <td className="py-2.5 pr-4">{row.hips}</td>}
                    {row.length != null && <td className="py-2.5 pr-4">{row.length}</td>}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <hr className="my-5 sm:my-6 border-0 h-px bg-zinc-200 dark:bg-zinc-700" />

        <section>
          <h2 className="font-headline font-semibold text-sm uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-3">
            Texture tags
          </h2>
          <div className="flex flex-wrap gap-2">
            {product.textureTags.map((tag) => (
              <span
                key={tag}
                className="px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-xs font-medium text-zinc-700 dark:text-zinc-300"
              >
                {tag}
              </span>
            ))}
          </div>
        </section>

        <hr className="my-5 sm:my-6 border-0 h-px bg-zinc-200 dark:bg-zinc-700" />

        <section>
          <h2 className="font-headline font-semibold text-sm uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-3">
            Occasion & style
          </h2>
          <div className="flex flex-wrap gap-2">
            {[...product.occasionTags, ...product.styleTags].map((tag) => (
              <span
                key={tag}
                className="px-2.5 py-1 rounded-full bg-accent/10 text-accent text-xs font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
        </section>
      </Card>
    </div>
  );
}
