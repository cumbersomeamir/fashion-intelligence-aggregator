"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { UserProfile as UserProfileType } from "@/types";

export function ProfileContent() {
  const { data: session, status } = useSession();
  const [profile, setProfile] = useState<UserProfileType | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"wardrobe" | "pinterest">("wardrobe");

  const router = useRouter();

  useEffect(() => {
    if (status !== "authenticated" || !session?.user) {
      setLoading(false);
      return;
    }
    fetch("/api/user-profile")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        setProfile(data);
        if (data === null) {
          router.replace("/onboarding");
          return;
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [status, session?.user, router]);

  const user = session?.user;
  const displayName = profile?.displayName ?? user?.name ?? "User";
  const username = profile?.username ?? (user?.email?.split("@")[0] ?? "user");
  const avatarUrl = profile?.profilePictureUrl ?? user?.image ?? null;
  const initial = displayName?.charAt(0)?.toLowerCase() ?? "u";

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg)]">
        <div className="animate-pulse flex flex-col items-center gap-3">
          <div className="w-24 h-24 rounded-full bg-zinc-200 dark:bg-zinc-700" />
          <p className="text-sm text-zinc-500">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-[var(--bg)]">
        <p className="text-zinc-600 dark:text-zinc-400 mb-4">Sign in to view your profile.</p>
        <Link href="/login" className="text-accent font-medium hover:underline">
          Go to Login →
        </Link>
      </div>
    );
  }

  const tryOnCount = profile?.tryOnCount ?? 0;
  const followersCount = profile?.followersCount ?? 0;
  const followingCount = profile?.followingCount ?? 0;

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <div className="mx-auto max-w-lg px-4 sm:px-6 pt-6 pb-24 sm:pb-32">
        {/* Header: hamburger */}
        <div className="flex justify-end mb-4">
          <Link
            href="/settings"
            className="p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            aria-label="Settings"
          >
            <svg className="w-6 h-6 text-zinc-600 dark:text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </Link>
        </div>

        {/* Avatar */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative">
            <div
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-3xl sm:text-4xl font-headline font-semibold text-zinc-600 dark:text-zinc-400 overflow-hidden"
            >
              {avatarUrl ? (
                <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                initial
              )}
            </div>
            <button
              type="button"
              className="absolute bottom-0 right-0 w-9 h-9 rounded-full bg-white dark:bg-zinc-800 border-2 border-zinc-200 dark:border-zinc-600 flex items-center justify-center shadow-elevation-2 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
              aria-label="Change photo"
            >
              <svg className="w-4 h-4 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 13v7a2 2 0 01-2 2H7a2 2 0 01-2-2v-7" />
              </svg>
            </button>
          </div>
          <h1 className="font-headline text-xl sm:text-2xl font-semibold text-zinc-900 dark:text-white mt-3">
            {displayName}
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">{username}</p>

          {/* Stats */}
          <div className="flex gap-6 sm:gap-10 mt-4">
            <div className="text-center">
              <p className="font-headline font-bold text-zinc-900 dark:text-white">{tryOnCount}</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">try-on</p>
            </div>
            <div className="text-center">
              <p className="font-headline font-bold text-zinc-900 dark:text-white">{followersCount}</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">followers</p>
            </div>
            <div className="text-center">
              <p className="font-headline font-bold text-zinc-900 dark:text-white">{followingCount}</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">following</p>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 mb-8">
          <button
            type="button"
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium text-sm hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Give feedback</span>
          </button>
          <button
            type="button"
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium text-sm hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            <span>Share profile</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-zinc-200 dark:border-zinc-700 mb-6">
          <button
            type="button"
            onClick={() => setActiveTab("wardrobe")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "wardrobe"
                ? "border-accent text-accent"
                : "border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300"
            }`}
          >
            <span className="w-4 h-4 flex items-center justify-center">🍓</span>
            Wardrobe
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("pinterest")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "pinterest"
                ? "border-accent text-accent"
                : "border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300"
            }`}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="#E60023">
              <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" />
            </svg>
            Pinterest
          </button>
        </div>

        {/* Tab content */}
        {activeTab === "wardrobe" ? (
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div className="aspect-[4/5] rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex flex-col justify-end p-3 overflow-hidden">
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                likes by {displayName}
              </p>
            </div>
            <Link
              href="/personalize"
              className="aspect-square rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex flex-col items-center justify-center gap-2 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors border-2 border-dashed border-zinc-300 dark:border-zinc-600"
            >
              <span className="w-12 h-12 rounded-full bg-zinc-200 dark:bg-zinc-600 flex items-center justify-center text-2xl text-zinc-500 dark:text-zinc-400">
                +
              </span>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 text-center">
                create wardrobe
              </p>
            </Link>
          </div>
        ) : (
          <div className="rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-700 p-8 text-center">
            <div className="flex justify-center gap-2 mb-4">
              <span className="w-12 h-12 rounded-full bg-white dark:bg-zinc-800 flex items-center justify-center text-2xl shadow-elevation-1">
                🍓
              </span>
              <span className="w-12 h-12 rounded-full bg-white dark:bg-zinc-800 flex items-center justify-center -ml-2 shadow-elevation-1">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="#E60023">
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" />
                </svg>
              </span>
            </div>
            <h2 className="font-headline text-lg font-semibold text-zinc-900 dark:text-white mb-2">
              Import your Pinterest boards!
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-2 flex items-center justify-center gap-2">
              <span className="w-4 h-4">👤</span> Personalize your feed
            </p>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6 flex items-center justify-center gap-2">
              <span className="w-4 h-4">📷</span> Image search your boards
            </p>
            <button
              type="button"
              className="w-full max-w-xs mx-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-accent text-white font-semibold shadow-button hover:shadow-button-hover transition-all"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" />
              </svg>
              Connect Pinterest
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
