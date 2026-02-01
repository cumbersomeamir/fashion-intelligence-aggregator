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
    <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 p-4 sm:p-5 mb-4">
      <p className="text-[10px] sm:text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-3">Try-on result</p>
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
        <div className="relative shrink-0">
          <div className="relative inline-block rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-700 shadow-sm">
            <img src={tryOnResultImage} alt="Try-on result" className="max-h-[280px] sm:max-h-[320px] w-auto object-contain" />
            <button
              type="button"
              onClick={handleDismiss}
              className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 text-white text-sm font-medium hover:bg-black/70 flex items-center justify-center"
              aria-label="Dismiss"
            >
              ×
            </button>
          </div>
        </div>
        {tryOnProduct && (
          <div className="flex-1 min-w-0 flex flex-col justify-center">
            <h3 className="font-headline font-semibold text-zinc-900 dark:text-zinc-100 text-base sm:text-lg mb-1 line-clamp-2">
              {tryOnProduct.title}
            </h3>
            {tryOnProduct.source && (
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-1">{tryOnProduct.source}</p>
            )}
            {tryOnProduct.price && (
              <p className="text-lg font-semibold text-accent mb-2">{tryOnProduct.price}</p>
            )}
            {(tryOnProduct.rating != null || tryOnProduct.reviews != null) && (
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-3">
                {[tryOnProduct.rating != null && `${tryOnProduct.rating}★`, tryOnProduct.reviews != null && `${tryOnProduct.reviews} reviews`].filter(Boolean).join(" · ")}
              </p>
            )}
            <button
              type="button"
              onClick={handleOpenStore}
              disabled={openingStore}
              className="self-start mt-auto min-h-[44px] px-4 py-2.5 rounded-xl bg-accent text-white text-sm font-medium hover:bg-accent/90 disabled:opacity-50 transition-colors touch-manipulation"
            >
              {openingStore ? "Opening…" : "Visit Store"}
            </button>
          </div>
        )}
      </div>
    </div>
  ) : null;

  return (
    <div className="mx-auto max-w-6xl w-full h-[calc(100vh-3.5rem-2rem)] min-h-[380px] sm:min-h-[420px] flex flex-col px-3 sm:px-4">
      <div className="flex-1 min-h-0 flex flex-col min-w-0">
        <ChatPanel onClose={() => {}} topSlot={tryOnCard} />
      </div>
    </div>
  );
}
