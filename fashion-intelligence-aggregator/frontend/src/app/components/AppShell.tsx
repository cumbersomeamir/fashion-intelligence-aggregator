"use client";

import { Suspense, useEffect } from "react";
import { usePathname } from "next/navigation";
import { GlassBar } from "@/components/GlassBar";
import { BottomSheet } from "@/components/BottomSheet";
import { useStore } from "@/state/store";
import { ChatPanel } from "./ChatPanel";
import { ProductsProvider } from "./ProductsProvider";

const AUTH_ROUTES = ["/login", "/vendor-register", "/onboarding"];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { chatOpen, setChatOpen, darkMode, reduceMotion } = useStore();
  const isChatPage = pathname === "/chat";
  const isReelsPage = pathname === "/reels";
  const isAuthPage = AUTH_ROUTES.includes(pathname);
  const showTopBar = !isAuthPage && !isReelsPage;
  const mainPaddingBottom = isReelsPage ? "" : "pb-[max(1.5rem,env(safe-area-inset-bottom))]";

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [darkMode]);

  useEffect(() => {
    if (reduceMotion) document.documentElement.classList.add("reduce-motion");
    else document.documentElement.classList.remove("reduce-motion");
  }, [reduceMotion]);

  return (
    <ProductsProvider>
      {showTopBar && <GlassBar variant="top" />}
      <main className={`${mainPaddingBottom} min-h-screen min-h-[100dvh] pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)] overflow-x-hidden ${showTopBar ? "pt-14" : ""}`}>{children}</main>
      {!isChatPage && !isAuthPage && !isReelsPage && (
        <BottomSheet open={chatOpen} onClose={() => setChatOpen(false)} title="Concierge Chat">
          <Suspense fallback={<div className="p-4 text-sm text-zinc-500">Loading chat…</div>}>
            <ChatPanel onClose={() => setChatOpen(false)} />
          </Suspense>
        </BottomSheet>
      )}
    </ProductsProvider>
  );
}
