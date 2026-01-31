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
      <div
        className="fixed inset-0 z-50 bg-black/20 dark:bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div
        className="fixed left-0 right-0 bottom-0 z-50 max-h-[85vh] sm:max-h-[70vh] md:max-h-[60vh] flex flex-col rounded-t-2xl bg-white dark:bg-zinc-900 border border-b-0 border-zinc-200 dark:border-zinc-800 shadow-2xl transition-transform duration-300 ease-out pb-[env(safe-area-inset-bottom)]"
        role="dialog"
        aria-label={title}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 shrink-0">
          <h2 className="font-headline font-semibold text-zinc-900 dark:text-zinc-100 text-base sm:text-lg">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center -m-2 rounded-lg text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 active:bg-zinc-200 dark:active:bg-zinc-700 transition-colors touch-manipulation"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <div className="flex-1 overflow-y-auto min-h-0">{children}</div>
      </div>
    </>
  );
}
