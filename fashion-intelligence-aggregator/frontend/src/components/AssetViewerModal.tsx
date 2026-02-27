"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

export interface AssetViewerItem {
  url: string;
  title?: string;
  subtitle?: string;
  downloadName?: string;
}

interface AssetViewerModalProps {
  isOpen: boolean;
  assets: AssetViewerItem[];
  initialIndex: number;
  onClose: () => void;
}

export function AssetViewerModal({ isOpen, assets, initialIndex, onClose }: AssetViewerModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const maxIndex = Math.max(assets.length - 1, 0);
  const safeInitialIndex = Math.min(Math.max(initialIndex, 0), maxIndex);

  useEffect(() => {
    if (!isOpen) return;
    setCurrentIndex(safeInitialIndex);
  }, [isOpen, safeInitialIndex]);

  const goPrev = useCallback(() => {
    if (assets.length <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + assets.length) % assets.length);
  }, [assets.length]);

  const goNext = useCallback(() => {
    if (assets.length <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % assets.length);
  }, [assets.length]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        goPrev();
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        goNext();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, goPrev, goNext, onClose]);

  const current = useMemo(() => {
    if (!isOpen || assets.length === 0) return null;
    return assets[Math.min(Math.max(currentIndex, 0), maxIndex)] ?? null;
  }, [isOpen, assets, currentIndex, maxIndex]);

  if (!isOpen || !current) return null;

  return (
    <div className="fixed inset-0 z-[80] bg-black/95 flex flex-col">
      <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-3 border-b border-white/10">
        <div className="min-w-0">
          {current.title && (
            <p className="text-sm font-medium text-white truncate">{current.title}</p>
          )}
          {current.subtitle && (
            <p className="text-xs text-white/70 truncate">{current.subtitle}</p>
          )}
          <p className="text-[11px] text-white/60 mt-0.5">
            {currentIndex + 1} / {assets.length}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <a
            href={current.url}
            download={current.downloadName || `try-on-${currentIndex + 1}.png`}
            className="px-3 py-1.5 rounded-lg bg-white/10 text-white text-xs font-medium hover:bg-white/20 transition-colors"
          >
            Download
          </a>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg bg-white/10 text-white text-xs font-medium hover:bg-white/20 transition-colors"
          >
            Close
          </button>
        </div>
      </div>

      <div className="relative flex-1 flex items-center justify-center p-4 sm:p-8">
        <img
          src={current.url}
          alt={current.title || "Asset"}
          className="max-w-full max-h-full object-contain"
        />

        {assets.length > 1 && (
          <>
            <button
              type="button"
              onClick={goPrev}
              className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 px-3 py-2 rounded-lg bg-black/60 border border-white/20 text-white text-xs font-medium hover:bg-black/75 transition-colors"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={goNext}
              className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 px-3 py-2 rounded-lg bg-black/60 border border-white/20 text-white text-xs font-medium hover:bg-black/75 transition-colors"
            >
              Next
            </button>
          </>
        )}
      </div>
    </div>
  );
}
