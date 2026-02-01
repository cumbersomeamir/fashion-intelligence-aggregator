"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { GlassBar } from "@/components/GlassBar";
import { BottomSheet } from "@/components/BottomSheet";
import { useStore } from "@/state/store";
import { ChatPanel } from "./ChatPanel";
import { ProductsProvider } from "./ProductsProvider";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { chatOpen, setChatOpen, darkMode, reduceMotion } = useStore();
  const isChatPage = pathname === "/chat";

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
      <GlassBar variant="top" />
      <main className="pt-14 pb-[max(1.5rem,env(safe-area-inset-bottom))] min-h-screen min-h-[100dvh] pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)] overflow-x-hidden">{children}</main>
      {!isChatPage && (
        <BottomSheet open={chatOpen} onClose={() => setChatOpen(false)} title="Concierge Chat">
          <ChatPanel onClose={() => setChatOpen(false)} />
        </BottomSheet>
      )}
    </ProductsProvider>
  );
}
