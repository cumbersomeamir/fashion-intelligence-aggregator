"use client";

import { forwardRef } from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  highlight?: boolean;
  inactive?: boolean;
  pulse?: boolean;
  children: React.ReactNode;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ highlight, inactive, pulse, children, className = "", ...props }, ref) => (
    <div
      ref={ref}
      className={`
        relative rounded-3xl border overflow-hidden
        bg-white dark:bg-zinc-900
        transition-all duration-400 ease-out-expo
        ${highlight
          ? "ring-2 ring-accent ring-offset-2 dark:ring-offset-zinc-950 shadow-elevation-4 border-accent/30"
          : "border-[var(--border-subtle)] shadow-elevation-2 hover:shadow-elevation-3 hover:border-[var(--border-default)]"
        }
        ${inactive ? "opacity-60 pointer-events-none" : ""}
        ${pulse && highlight ? "animate-card-pulse" : ""}
        ${className}
      `}
      {...props}
    >
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-transparent to-transparent dark:from-white/5 pointer-events-none" />
      <div className="relative">{children}</div>
    </div>
  )
);
Card.displayName = "Card";
