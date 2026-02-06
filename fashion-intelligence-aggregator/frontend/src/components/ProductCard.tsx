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
        group relative rounded-2xl border border-[var(--border-subtle)] overflow-hidden
        bg-white dark:bg-zinc-900 min-w-0
        transition-all duration-400 ease-out-expo
        hover:border-[var(--border-default)] hover:shadow-elevation-3 hover:-translate-y-1
        ${compact ? "p-3" : "p-4 sm:p-5"}
      `}
    >
      {/* Image container */}
      <div className="relative aspect-square bg-zinc-100 dark:bg-zinc-800 rounded-xl mb-3 sm:mb-4 overflow-hidden">
        {product.images[0] ? (
          <div className="w-full h-full flex items-center justify-center text-zinc-400 text-xs">
            Image
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-zinc-400 text-xs">
            No image
          </div>
        )}
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Content */}
      <div className="space-y-1">
        <p className="font-headline font-semibold text-zinc-900 dark:text-white truncate text-sm sm:text-base group-hover:text-accent transition-colors duration-300">
          {product.name}
        </p>
        <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 truncate">
          {product.brand}
        </p>
        <p className="text-sm sm:text-base font-semibold text-gradient inline-block mt-2">
          ${product.price}
        </p>
      </div>

      {/* Top gradient line on hover */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </div>
  );
}
