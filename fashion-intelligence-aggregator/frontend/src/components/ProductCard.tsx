"use client";

import type { Product } from "@/types";

interface ProductCardProps {
  product: Product;
  compact?: boolean;
}

export function ProductCard({ product, compact }: ProductCardProps) {
  return (
    <div
      className={`
        rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden
        bg-white dark:bg-zinc-900 min-w-0 min-h-[120px]
        ${compact ? "p-3" : "p-3 sm:p-4"}
      `}
    >
      <div className="aspect-square bg-zinc-100 dark:bg-zinc-800 rounded-xl mb-2 sm:mb-3 flex items-center justify-center text-zinc-400 text-xs">
        {product.images[0] ? "Image" : "No image"}
      </div>
      <p className="font-headline font-medium text-zinc-900 dark:text-zinc-100 truncate text-sm sm:text-base">
        {product.name}
      </p>
      <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 truncate">{product.brand}</p>
      <p className="text-sm font-medium text-accent mt-1">${product.price}</p>
    </div>
  );
}
