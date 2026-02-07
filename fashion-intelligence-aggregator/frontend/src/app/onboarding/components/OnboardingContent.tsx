"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

export function OnboardingContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (session?.user) {
      setDisplayName(session.user.name ?? session.user.email?.split("@")[0] ?? "");
      setUsername(session.user.email?.split("@")[0] ?? "");
    }
  }, [session?.user]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/user-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: displayName.trim() || undefined,
          username: username.trim().toLowerCase().replace(/\s+/g, "") || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error ?? "Failed to create profile");
      }
      router.replace("/profile");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setSubmitting(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg)]">
        <div className="animate-pulse text-zinc-500">Loading...</div>
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 bg-[var(--bg)]">
      <div className="absolute inset-0 bg-mesh opacity-30" />
      <div className="relative w-full max-w-md">
        <Link
          href="/landing"
          className="inline-flex items-center gap-2.5 mb-8 group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-accent flex items-center justify-center shadow-button">
            <span className="text-white text-sm font-bold">FI</span>
          </div>
          <span className="font-headline font-semibold text-zinc-900 dark:text-white">
            Fashion Intelligence
          </span>
        </Link>

        <div className="rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-elevation-2 p-8 sm:p-10">
          <h1 className="font-headline text-2xl font-bold text-zinc-900 dark:text-white mb-2">
            Complete your profile
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400 text-sm mb-6">
            Add a few details to personalize your experience. You can change these later.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="displayName" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                Display name
              </label>
              <input
                id="displayName"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="e.g. Amir Kid"
                className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                maxLength={50}
              />
            </div>
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.replace(/\s/g, "").toLowerCase())}
                placeholder="e.g. amirkid1281"
                className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                maxLength={30}
              />
              <p className="text-xs text-zinc-500 mt-1">Lowercase, no spaces</p>
            </div>

            {error && (
              <p className="text-sm text-red-500 dark:text-red-400">{error}</p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 rounded-xl bg-gradient-accent text-white font-semibold shadow-button hover:shadow-button-hover disabled:opacity-60 disabled:cursor-not-allowed transition-all"
            >
              {submitting ? "Creating profile..." : "Continue"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
