"use client";

import { useState, useRef, useCallback } from "react";

interface SliderRevealProps {
  beforeLabel?: string;
  afterLabel?: string;
  beforeContent?: React.ReactNode;
  afterContent?: React.ReactNode;
  className?: string;
}

export function SliderReveal({
  beforeLabel = "Original",
  afterLabel = "Try-On",
  beforeContent,
  afterContent,
  className = "",
}: SliderRevealProps) {
  const [value, setValue] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback(
    (clientX: number) => {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      setValue(x * 100);
    },
    []
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      setIsDragging(true);
      handleMove(e.clientX);
    },
    [handleMove]
  );
  const handlePointerUp = useCallback(() => setIsDragging(false), []);
  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (isDragging) handleMove(e.clientX);
    },
    [isDragging, handleMove]
  );

  return (
    <div
      ref={containerRef}
      className={`relative select-none touch-none overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 ${className}`}
      style={{ touchAction: "none" }}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onPointerMove={handlePointerMove}
    >
      <div className="relative aspect-[3/4] bg-zinc-100 dark:bg-zinc-800">
        {/* Before (left) */}
        <div
          className="absolute inset-0 flex items-center justify-center bg-zinc-200 dark:bg-zinc-700"
          style={{ clipPath: `inset(0 ${100 - value}% 0 0)` }}
        >
          {beforeContent ?? (
            <span className="text-zinc-500 dark:text-zinc-400 text-sm font-body">
              {beforeLabel}
            </span>
          )}
        </div>
        {/* After (right) */}
        <div
          className="absolute inset-0 flex items-center justify-center bg-accent/20"
          style={{ clipPath: `inset(0 0 0 ${value}%)` }}
        >
          {afterContent ?? (
            <span className="text-accent text-sm font-body font-medium">
              {afterLabel}
            </span>
          )}
        </div>
        {/* Slider line */}
        <div
          className="absolute top-0 bottom-0 w-0.5 sm:w-1 bg-white/90 dark:bg-zinc-100 shadow-lg"
          style={{ left: `${value}%`, transform: "translateX(-50%)" }}
        />
        <div
          className="absolute top-1/2 left-0 -translate-y-1/2 w-12 h-12 rounded-full bg-white dark:bg-zinc-100 shadow-xl border-2 border-accent/50 flex items-center justify-center cursor-ew-resize touch-manipulation ring-2 ring-black/5 dark:ring-white/10 hover:border-accent hover:scale-105 active:scale-100 transition-transform duration-200"
          style={{ left: `${value}%`, transform: "translate(-50%, -50%)" }}
        >
          <span className="text-accent text-sm font-bold">⟷</span>
        </div>
      </div>
    </div>
  );
}
