"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface GlassBarProps {
  variant: "top" | "bottom";
  onOpenChat?: () => void;
}

const TOP_LINKS = [
  { href: "/chat", label: "Chat" },
  { href: "/personalize", label: "Personalize" },
  { href: "/recommendations", label: "Recommendations" },
  { href: "/settings", label: "Settings" },
];

export function GlassBar({ variant, onOpenChat }: GlassBarProps) {
  const pathname = usePathname();
  const isTop = variant === "top";

  return (
    <nav
      className={`
        fixed left-0 right-0 z-50
        glass-strong
        transition-all duration-300
        ${isTop ? "top-0 pt-[env(safe-area-inset-top)]" : "bottom-0 border-t border-[var(--border-subtle)] pb-[env(safe-area-inset-bottom)]"}
      `}
    >
      {isTop ? (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 h-16 flex items-center gap-3 sm:gap-6">
          {/* Logo */}
          <Link href="/landing" className="group flex items-center gap-2.5 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-accent flex items-center justify-center shadow-button group-hover:shadow-button-hover transition-shadow duration-300">
              <span className="text-white text-sm font-bold">FI</span>
            </div>
            <span className="hidden sm:block font-headline font-semibold text-zinc-900 dark:text-white group-hover:text-accent transition-colors duration-300">
              Fashion Intelligence
            </span>
          </Link>

          {/* Navigation */}
          <div className="flex-1 min-w-0 overflow-x-auto overflow-y-hidden scrollbar-hide">
            <div className="flex items-center gap-1 py-2">
              {TOP_LINKS.map(({ href, label }) => {
                const isActive = pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`
                      relative shrink-0 px-4 py-2.5 rounded-xl text-sm font-medium
                      transition-all duration-300 touch-manipulation
                      min-h-[44px] sm:min-h-0 flex items-center justify-center
                      ${isActive
                        ? "text-accent bg-accent/10 dark:bg-accent/15"
                        : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100/80 dark:hover:bg-zinc-800/50"
                      }
                    `}
                  >
                    {label}
                    {isActive && (
                      <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-accent" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* CTA Button (desktop) */}
          <div className="hidden sm:block shrink-0">
            <Link
              href="/chat"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-accent text-white text-sm font-semibold shadow-button hover:shadow-button-hover hover:-translate-y-0.5 transition-all duration-300"
            >
              <span>Try Now</span>
              <span className="text-white/80">→</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 h-16 flex items-center justify-center">
          <button
            type="button"
            onClick={onOpenChat}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-accent text-white font-semibold shadow-button hover:shadow-button-hover hover:-translate-y-0.5 transition-all duration-300 touch-manipulation"
          >
            Open Concierge Chat
          </button>
        </div>
      )}
    </nav>
  );
}
