"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error") ?? "ConfigurationError";

  const messages: Record<string, string> = {
    Configuration: "There is a problem with the server configuration.",
    AccessDenied: "Access denied.",
    Verification: "The sign-in link was already used or has expired.",
    Default: "An error occurred during sign-in.",
  };
  const message = messages[error] ?? messages.Default;

  return (
    <div className="min-h-screen min-h-[100dvh] flex flex-col items-center justify-center px-4 sm:px-6 bg-[var(--bg)]">
      <div className="absolute inset-0 bg-mesh opacity-40" />
      <div className="relative w-full max-w-md text-center">
        <h1 className="font-headline text-2xl font-bold text-zinc-900 dark:text-white mb-2">
          Sign-in error
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400 mb-6">{message}</p>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-8">
          If this is a new deployment, check that NEXTAUTH_URL, NEXTAUTH_SECRET, and Google OAuth
          credentials are set in your hosting environment, and that your production URL is added as
          an authorized redirect URI in Google Cloud Console.
        </p>
        <Link
          href="/login"
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-accent text-white font-semibold shadow-button hover:shadow-button-hover transition-all"
        >
          Back to login
        </Link>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[var(--bg)]">Loading...</div>}>
      <AuthErrorContent />
    </Suspense>
  );
}
