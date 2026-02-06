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

  const handleMove = useCallback((clientX: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    setValue(x * 100);
  }, []);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    setIsDragging(true);
    handleMove(e.clientX);
  }, [handleMove]);

  const handlePointerUp = useCallback(() => setIsDragging(false), []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (isDragging) handleMove(e.clientX);
  }, [isDragging, handleMove]);

  return (
    <div
      ref={containerRef}
      className={`relative select-none touch-none overflow-hidden rounded-3xl border border-[var(--border-subtle)] shadow-elevation-3 ${className}`}
      style={{ touchAction: "none" }}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onPointerMove={handlePointerMove}
    >
      <div className="relative aspect-[3/4] bg-zinc-100 dark:bg-zinc-800">
        {/* Before (left) */}
        <div
          className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-700"
          style={{ clipPath: `inset(0 ${100 - value}% 0 0)` }}
        >
          {beforeContent ?? (
            <span className="text-zinc-500 dark:text-zinc-400 text-sm font-medium">
              {beforeLabel}
            </span>
          )}
        </div>

        {/* After (right) */}
        <div
          className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-accent/10 to-violet/10"
          style={{ clipPath: `inset(0 0 0 ${value}%)` }}
        >
          {afterContent ?? (
            <span className="text-gradient text-sm font-semibold">
              {afterLabel}
            </span>
          )}
        </div>

        {/* Labels */}
        <div className="absolute top-4 left-4 px-3 py-1.5 rounded-lg glass text-xs font-medium text-zinc-700 dark:text-zinc-300">
          {beforeLabel}
        </div>
        <div className="absolute top-4 right-4 px-3 py-1.5 rounded-lg bg-gradient-accent text-xs font-medium text-white shadow-button">
          {afterLabel}
        </div>

        {/* Slider line */}
        <div
          className="absolute top-0 bottom-0 w-1 bg-white shadow-elevation-3"
          style={{ left: `${value}%`, transform: "translateX(-50%)" }}
        />

        {/* Slider handle */}
        <div
          className={`
            absolute top-1/2
            w-14 h-14 rounded-full
            bg-white dark:bg-zinc-100
            shadow-elevation-4
            border-2 border-accent
            flex items-center justify-center
            cursor-ew-resize touch-manipulation
            transition-all duration-200
            ${isDragging ? "scale-110 shadow-glow" : "hover:scale-105"}
          `}
          style={{ left: `${value}%`, transform: "translate(-50%, -50%)" }}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-accent">
            <path d="M6 10H14M6 10L8 8M6 10L8 12M14 10L12 8M14 10L12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    </div>
  );
}
