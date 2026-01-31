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

  return (
    <div className="mx-auto max-w-2xl px-3 sm:px-4 py-6 sm:py-8 min-w-0">
      <Card className="p-4 sm:p-6">
        <h1 className="font-headline text-xl sm:text-2xl font-semibold text-zinc-900 dark:text-zinc-100 break-words">
          {product.name}
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 text-sm">{product.brand}</p>
        <p className="text-base sm:text-lg font-medium text-accent mt-2">${product.price}</p>

        <section className="mt-5 sm:mt-6">
          <h2 className="font-headline font-semibold text-sm text-zinc-700 dark:text-zinc-300 mb-2">
            Fabric composition
          </h2>
          <ul className="text-sm text-zinc-600 dark:text-zinc-400">
            {Object.entries(product.fabricComposition).map(([key, val]) => (
              <li key={key}>
                {key}: {val}%
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-5 sm:mt-6">
          <h2 className="font-headline font-semibold text-sm text-zinc-700 dark:text-zinc-300 mb-2">
            Size chart
          </h2>
          <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
            <table className="w-full min-w-[280px] text-sm text-left">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-700">
                  <th className="py-2 pr-4">Size</th>
                  {product.sizeChart[0]?.chest != null && <th className="py-2 pr-4">Chest</th>}
                  {product.sizeChart[0]?.waist != null && <th className="py-2 pr-4">Waist</th>}
                  {product.sizeChart[0]?.hips != null && <th className="py-2 pr-4">Hips</th>}
                  {product.sizeChart[0]?.length != null && <th className="py-2 pr-4">Length</th>}
                </tr>
              </thead>
              <tbody>
                {product.sizeChart.map((row) => (
                  <tr key={row.size} className="border-b border-zinc-100 dark:border-zinc-800">
                    <td className="py-2 pr-4">{row.size}</td>
                    {row.chest != null && <td className="py-2 pr-4">{row.chest}</td>}
                    {row.waist != null && <td className="py-2 pr-4">{row.waist}</td>}
                    {row.hips != null && <td className="py-2 pr-4">{row.hips}</td>}
                    {row.length != null && <td className="py-2 pr-4">{row.length}</td>}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-5 sm:mt-6">
          <h2 className="font-headline font-semibold text-sm text-zinc-700 dark:text-zinc-300 mb-2">
            Texture tags
          </h2>
          <div className="flex flex-wrap gap-2">
            {product.textureTags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-xs"
              >
                {tag}
              </span>
            ))}
          </div>
        </section>

        <section className="mt-4 sm:mt-5">
          <h2 className="font-headline font-semibold text-sm text-zinc-700 dark:text-zinc-300 mb-2">
            Occasion & style
          </h2>
          <div className="flex flex-wrap gap-2">
            {[...product.occasionTags, ...product.styleTags].map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 rounded-full bg-accent/10 text-accent text-xs"
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
