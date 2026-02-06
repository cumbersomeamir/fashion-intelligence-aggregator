"use client";

import { useEffect } from "react";

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  title?: string;
}

export function BottomSheet({
  open,
  onClose,
  children,
  defaultExpanded = false,
  title = "Concierge Chat",
}: BottomSheetProps) {
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-zinc-950/20 dark:bg-zinc-950/50 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
        aria-hidden
      />

      {/* Sheet */}
      <div
        className={`
          ${open ? "animate-sheet-up" : ""}
          fixed left-0 right-0 bottom-0 z-50
          max-h-[90vh] sm:max-h-[80vh] md:max-h-[70vh]
          flex flex-col
          rounded-t-3xl
          bg-white dark:bg-zinc-900
          border border-b-0 border-[var(--border-subtle)]
          shadow-elevation-5
          pb-[env(safe-area-inset-bottom)]
        `}
        role="dialog"
        aria-label={title}
      >
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-zinc-200 dark:bg-zinc-700" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-[var(--border-subtle)] shrink-0">
          <h2 className="font-headline font-semibold text-zinc-900 dark:text-white text-lg">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-xl text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 active:bg-zinc-200 dark:active:bg-zinc-700 transition-all duration-200 touch-manipulation"
            aria-label="Close"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="4" y1="4" x2="12" y2="12" />
              <line x1="12" y1="4" x2="4" y2="12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto min-h-0">{children}</div>
      </div>
    </>
  );
}
