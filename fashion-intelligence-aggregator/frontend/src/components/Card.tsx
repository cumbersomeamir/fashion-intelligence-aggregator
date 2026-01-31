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
        rounded-2xl border bg-white/80 dark:bg-zinc-900/80
        transition-all duration-300 ease-out
        ${highlight ? "ring-2 ring-accent ring-offset-2 dark:ring-offset-zinc-900 shadow-lg" : "border-zinc-200/80 dark:border-zinc-800 shadow-md"}
        ${inactive ? "opacity-70" : ""}
        ${pulse && highlight ? "animate-card-pulse" : ""}
        ${!highlight ? "shadow-sm" : ""}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  )
);
Card.displayName = "Card";
