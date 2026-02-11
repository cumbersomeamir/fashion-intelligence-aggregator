"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { setAuthSkipped } from "@/lib/auth";

export function LoginContent() {
  const router = useRouter();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleSkip = () => {
    setAuthSkipped();
    router.replace("/chat");
  };

  const handleGoogleLogin = () => {
    setIsGoogleLoading(true);
    signIn("google", { callbackUrl: "/profile" });
  };

  return (
    <div className="min-h-screen min-h-[100dvh] flex flex-col items-center justify-center px-4 sm:px-6 bg-[var(--bg)]">
      <div className="absolute inset-0 bg-mesh opacity-40" />
      <div className="relative w-full max-w-md">
        {/* Logo */}
        <Link
          href="/landing"
          className="inline-flex items-center gap-2.5 mb-10 group"
        >
          <div className="w-11 h-11 rounded-xl bg-gradient-accent flex items-center justify-center shadow-button group-hover:shadow-button-hover transition-shadow duration-300">
            <span className="text-white text-sm font-bold">FI</span>
          </div>
          <span className="font-headline font-semibold text-zinc-900 dark:text-white">
            Fashion Intelligence
          </span>
        </Link>

        {/* Card */}
        <div className="rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-elevation-2 p-8 sm:p-10">
          <h1 className="font-headline text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white mb-2">
            Welcome back
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400 mb-8">
            Sign in to access the Concierge chat and your personalized experience.
          </p>

          {/* Google Login */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isGoogleLoading}
            className="w-full flex items-center justify-center gap-3 px-5 py-3.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/50 text-zinc-800 dark:text-zinc-200 font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span>{isGoogleLoading ? "Redirecting..." : "Continue with Google"}</span>
          </button>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-700" />
            <span className="text-xs text-zinc-400 uppercase tracking-wider">
              or
            </span>
            <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-700" />
          </div>

          {/* Skip for now */}
          <button
            type="button"
            onClick={handleSkip}
            className="w-full px-5 py-3.5 rounded-xl bg-gradient-accent text-white font-semibold shadow-button hover:shadow-button-hover hover:-translate-y-0.5 transition-all duration-200"
          >
            Skip for now
          </button>
          <p className="text-center text-xs text-zinc-500 dark:text-zinc-400 mt-4">
            Bypass login and go straight to the chat (dev/demo)
          </p>

          {/* Register as Vendor */}
          <div className="mt-8 pt-6 border-t border-zinc-200 dark:border-zinc-700">
            <Link
              href="/vendor-register"
              className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl border-2 border-dashed border-zinc-300 dark:border-zinc-600 text-zinc-600 dark:text-zinc-400 font-medium hover:border-accent/50 hover:text-accent dark:hover:text-accent transition-colors duration-200"
            >
              <span>Register as a Vendor</span>
            </Link>
            <p className="text-center text-xs text-zinc-500 dark:text-zinc-400 mt-2">
              Different flow — coming soon
            </p>
          </div>
        </div>

        <p className="text-center text-sm text-zinc-500 dark:text-zinc-400 mt-6">
          <Link href="/landing" className="hover:text-accent transition-colors">
            ← Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}
