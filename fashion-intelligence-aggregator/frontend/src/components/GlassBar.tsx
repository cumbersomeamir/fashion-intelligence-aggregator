"use client";

import Link from "next/link";

interface GlassBarProps {
  variant: "top" | "bottom";
  onOpenChat?: () => void;
}

const TOP_LINKS = [
  { href: "/chat", label: "Chat" },
  { href: "/try-on", label: "Try-On" },
  { href: "/personalize", label: "Personalize" },
  { href: "/recommendations", label: "Recommendations" },
  { href: "/settings", label: "Settings" },
];

export function GlassBar({ variant, onOpenChat }: GlassBarProps) {
  const isTop = variant === "top";
  return (
    <nav
      className={`
        fixed left-0 right-0 z-40
        bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xl
        border-b border-zinc-200/60 dark:border-zinc-700/60
        shadow-[0_1px_0_0_rgba(255,255,255,0.05)] dark:shadow-[0_1px_0_0_rgba(0,0,0,0.2)]
        transition-colors duration-200
        ${isTop ? "top-0 pt-[env(safe-area-inset-top)]" : "bottom-0 border-t border-b-0 pb-[env(safe-area-inset-bottom)]"}
      `}
    >
      {isTop ? (
        <div className="mx-auto max-w-6xl px-3 sm:px-4 h-14 flex items-center gap-2 sm:gap-4 font-body text-sm overflow-hidden">
          <span className="font-headline font-semibold text-zinc-900 dark:text-zinc-100 shrink-0 text-sm sm:text-base truncate max-w-[120px] sm:max-w-none">
            Fashion Intelligence
          </span>
          <div className="flex-1 min-w-0 overflow-x-auto overflow-y-hidden -mx-3 sm:mx-0 scrollbar-hide">
            <div className="flex items-center gap-2 sm:gap-4 py-2 px-3 sm:px-0">
              {TOP_LINKS.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="shrink-0 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 flex items-center justify-center px-3 py-2 rounded-lg text-zinc-600 dark:text-zinc-400 hover:text-accent dark:hover:text-accent hover:bg-white/50 dark:hover:bg-zinc-800/50 focus:ring-2 focus:ring-accent/30 active:bg-zinc-100 dark:active:bg-zinc-800 transition-all duration-200 touch-manipulation"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="mx-auto max-w-6xl px-3 sm:px-4 h-14 flex items-center justify-center">
          <button
            type="button"
            onClick={onOpenChat}
            className="min-h-[44px] w-full sm:w-auto sm:min-h-0 px-6 py-3 sm:py-2.5 rounded-xl bg-accent/90 text-white font-medium hover:bg-accent hover:shadow-lg hover:shadow-accent/20 focus:ring-2 focus:ring-accent focus:ring-offset-2 active:bg-accent/80 transition-all duration-200 touch-manipulation"
          >
            Open Concierge Chat
          </button>
        </div>
      )}
    </nav>
  );
}
