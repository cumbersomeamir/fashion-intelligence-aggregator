"use client";

import { Suspense } from "react";

export function ProductDetailWrapper({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<div className="mx-auto max-w-2xl px-3 sm:px-4 py-6 sm:py-8 text-sm">Loading…</div>}>{children}</Suspense>;
}
