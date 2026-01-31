"use client";

import { forwardRef } from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  highlight?: boolean;
  children: React.ReactNode;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ highlight, children, className = "", ...props }, ref) => (
    <div
      ref={ref}
      className={`
        rounded-2xl border bg-white/80 dark:bg-zinc-900/80 shadow-sm
        ${highlight ? "ring-2 ring-accent ring-offset-2 dark:ring-offset-zinc-900" : "border-zinc-200/80 dark:border-zinc-800"}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  )
);
Card.displayName = "Card";
