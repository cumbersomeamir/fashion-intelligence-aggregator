"use client";

import { useEffect, useCallback, useState } from "react";
import { useStore } from "@/state/store";
import { ChatPanel } from "@/app/components/ChatPanel";

export function ChatPageContent() {
  const { setChatOpen, tryOnResultImage, tryOnProduct, setTryOnResultImage, setTryOnProduct, setTryOnError } = useStore();
  const [openingStore, setOpeningStore] = useState(false);

  useEffect(() => {
    setChatOpen(true);
    return () => setChatOpen(false);
  }, [setChatOpen]);

  const handleDismiss = useCallback(() => {
    setTryOnResultImage(null);
    setTryOnProduct(null);
    setTryOnError(null);
  }, [setTryOnResultImage, setTryOnProduct, setTryOnError]);

  const handleOpenStore = useCallback(async () => {
    const p = tryOnProduct;
    if (!p) return;
    const fallbackUrl = p.product_link ?? "#";
    if (!p.serpapi_immersive_product_api) {
      window.open(fallbackUrl, "_blank");
      return;
    }
    setOpeningStore(true);
    try {
      const params = new URLSearchParams({ serpapi_url: p.serpapi_immersive_product_api });
      const res = await fetch(`/api/shopping-product?${params.toString()}`);
      const data = await res.json();
      const merchantLink = data.merchantLink ?? (Array.isArray(data.sellers) && data.sellers[0]?.link) ?? null;
      window.open(merchantLink ?? fallbackUrl, "_blank");
    } catch {
      window.open(fallbackUrl, "_blank");
    } finally {
      setOpeningStore(false);
    }
  }, [tryOnProduct]);

  const tryOnCard = tryOnResultImage ? (
    <div className="rounded-2xl border border-[var(--border-subtle)] bg-white dark:bg-zinc-900 shadow-elevation-3 p-4 sm:p-5 mb-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-subtle text-accent text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          Try-On Result
        </span>
        <button
          type="button"
          onClick={handleDismiss}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all duration-200"
          aria-label="Dismiss"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="3" y1="3" x2="11" y2="11" />
            <line x1="11" y1="3" x2="3" y2="11" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="flex flex-col sm:flex-row gap-5">
        {/* Image */}
        <div className="relative shrink-0">
          <div className="relative inline-block rounded-2xl overflow-hidden border border-[var(--border-subtle)] shadow-elevation-2">
            <img
              src={tryOnResultImage}
              alt="Try-on result"
              className="max-h-[280px] sm:max-h-[320px] w-auto object-contain"
            />
          </div>
        </div>

        {/* Product info */}
        {tryOnProduct && (
          <div className="flex-1 min-w-0 flex flex-col justify-center">
            <h3 className="font-headline font-semibold text-zinc-900 dark:text-white text-lg sm:text-xl mb-2 line-clamp-2">
              {tryOnProduct.title}
            </h3>

            {tryOnProduct.source && (
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-2">
                {tryOnProduct.source}
              </p>
            )}

            {tryOnProduct.price && (
              <p className="text-xl sm:text-2xl font-bold text-gradient mb-3">
                {tryOnProduct.price}
              </p>
            )}

            {(tryOnProduct.rating != null || tryOnProduct.reviews != null) && (
              <div className="flex items-center gap-2 mb-4">
                {tryOnProduct.rating != null && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-medium">
                    <span>★</span>
                    {tryOnProduct.rating}
                  </span>
                )}
                {tryOnProduct.reviews != null && (
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    {tryOnProduct.reviews} reviews
                  </span>
                )}
              </div>
            )}

            <button
              type="button"
              onClick={handleOpenStore}
              disabled={openingStore}
              className="self-start mt-auto btn-primary text-sm py-3 px-6"
            >
              {openingStore ? "Opening..." : "Visit Store →"}
            </button>
          </div>
        )}
      </div>
    </div>
  ) : null;

  return (
    <div className="mx-auto w-full max-w-[100vw] sm:max-w-6xl h-[calc(100dvh-4rem-2rem)] min-h-[320px] sm:min-h-[480px] flex flex-col px-4 sm:px-6 overflow-hidden">
      <div className="flex-1 min-h-0 flex flex-col min-w-0 overflow-hidden">
        <ChatPanel onClose={() => {}} topSlot={tryOnCard} />
      </div>
    </div>
  );
}
