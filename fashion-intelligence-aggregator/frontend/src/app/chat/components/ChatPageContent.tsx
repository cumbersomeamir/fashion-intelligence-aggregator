"use client";

import { Suspense, useEffect } from "react";
import { useStore } from "@/state/store";
import { ChatPanel } from "@/app/components/ChatPanel";

export function ChatPageContent() {
  const { setChatOpen } = useStore();

  useEffect(() => {
    setChatOpen(true);
    return () => setChatOpen(false);
  }, [setChatOpen]);

  return (
    <div className="mx-auto w-full max-w-[100vw] sm:max-w-6xl h-[calc(100dvh-4rem-2rem)] min-h-[320px] sm:min-h-[480px] flex flex-col px-4 sm:px-6 overflow-hidden">
      <div className="flex-1 min-h-0 flex flex-col min-w-0 overflow-hidden">
        <Suspense fallback={<div className="flex items-center justify-center p-8 text-zinc-500">Loading chat…</div>}>
          <ChatPanel onClose={() => {}} />
        </Suspense>
      </div>
    </div>
  );
}
