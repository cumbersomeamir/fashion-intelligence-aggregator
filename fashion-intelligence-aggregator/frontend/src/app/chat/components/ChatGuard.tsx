"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { isAuthenticated } from "@/lib/auth";

interface ChatGuardProps {
  children: React.ReactNode;
}

export function ChatGuard({ children }: ChatGuardProps) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const hasAuth =
    status === "authenticated" ||
    (status === "unauthenticated" && mounted && isAuthenticated());

  useEffect(() => {
    if (!mounted || status === "loading") return;
    if (!hasAuth) {
      router.replace("/login");
    }
  }, [mounted, status, hasAuth, router]);

  if (!mounted || status === "loading") {
    return (
      <div className="min-h-screen min-h-[100dvh] flex items-center justify-center bg-[var(--bg)]">
        <div className="animate-pulse flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent/20" />
          <p className="text-sm text-zinc-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (!hasAuth) {
    return null;
  }

  return <>{children}</>;
}
