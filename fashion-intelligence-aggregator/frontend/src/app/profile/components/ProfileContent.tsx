"use client";

import { useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import type {
  UserProfile as UserProfileType,
  PinterestBoard as PinterestBoardType,
  PinterestPin as PinterestPinType,
} from "@/types";

export function ProfileContent() {
  const { data: session, status } = useSession();
  const [profile, setProfile] = useState<UserProfileType | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"wardrobe" | "pinterest">("wardrobe");
  const searchParams = useSearchParams();
  const pinterestStatus = searchParams.get("pinterest");

  const router = useRouter();

  const [pinterestBoards, setPinterestBoards] = useState<PinterestBoardType[]>([]);
  const [pinterestPins, setPinterestPins] = useState<PinterestPinType[]>([]);
  const [pinterestBoardFilter, setPinterestBoardFilter] = useState<string | null>(null);
  const [pinterestSyncLoading, setPinterestSyncLoading] = useState(false);
  const [pinterestDataLoading, setPinterestDataLoading] = useState(false);
  const [pinterestSyncError, setPinterestSyncError] = useState<string | null>(null);
  const pinterestAutoSyncDoneRef = useRef(false);

  useEffect(() => {
    if (pinterestStatus && ["connected", "error", "config_error"].some((s) => pinterestStatus.startsWith(s))) {
      const url = new URL(window.location.href);
      url.searchParams.delete("pinterest");
      router.replace(url.pathname + url.search, { scroll: false });
    }
  }, [pinterestStatus, router]);

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

  useEffect(() => {
    if (activeTab !== "pinterest" || !profile?.pinterestConnected) return;
    setPinterestDataLoading(true);
    const pinsUrl = pinterestBoardFilter
      ? `/api/pinterest/pins?boardId=${encodeURIComponent(pinterestBoardFilter)}`
      : "/api/pinterest/pins";
    Promise.all([
      fetch("/api/pinterest/boards").then((r) => (r.ok ? r.json() : [])),
      fetch(pinsUrl).then((r) => (r.ok ? r.json() : [])),
    ])
      .then(([boards, pins]) => {
        setPinterestBoards(Array.isArray(boards) ? boards : []);
        setPinterestPins(Array.isArray(pins) ? pins : []);
      })
      .finally(() => setPinterestDataLoading(false));
  }, [activeTab, profile?.pinterestConnected, pinterestBoardFilter]);

  // Auto-sync from Pinterest when user opens the tab and we have no boards yet (e.g. right after connecting)
  useEffect(() => {
    if (
      activeTab !== "pinterest" ||
      !profile?.pinterestConnected ||
      pinterestDataLoading ||
      pinterestSyncLoading ||
      pinterestAutoSyncDoneRef.current ||
      pinterestBoards.length > 0
    ) {
      return;
    }
    pinterestAutoSyncDoneRef.current = true;
    setPinterestSyncLoading(true);
    fetch("/api/pinterest/sync", { method: "POST" })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("Sync failed"))))
      .then(() => {
        setPinterestBoardFilter(null);
        return Promise.all([
          fetch("/api/pinterest/boards").then((r) => (r.ok ? r.json() : [])),
          fetch("/api/pinterest/pins").then((r) => (r.ok ? r.json() : [])),
        ]).then(([boards, pins]) => {
          setPinterestBoards(Array.isArray(boards) ? boards : []);
          setPinterestPins(Array.isArray(pins) ? pins : []);
        });
      })
      .catch((err) => {
        pinterestAutoSyncDoneRef.current = false;
        setPinterestSyncError(err?.message ?? "Could not load boards. Try again.");
      })
      .finally(() => setPinterestSyncLoading(false));
  }, [activeTab, profile?.pinterestConnected, pinterestDataLoading, pinterestSyncLoading, pinterestBoards.length]);

  const handlePinterestSync = () => {
    setPinterestSyncError(null);
    setPinterestSyncLoading(true);
    fetch("/api/pinterest/sync", { method: "POST" })
      .then((res) => {
        if (!res.ok) return res.json().then((d) => Promise.reject(new Error(d?.error ?? "Sync failed")));
        return res.json();
      })
      .then(() => {
        setPinterestBoardFilter(null);
        setPinterestDataLoading(true);
        return Promise.all([
          fetch("/api/pinterest/boards").then((r) => (r.ok ? r.json() : [])),
          fetch("/api/pinterest/pins").then((r) => (r.ok ? r.json() : [])),
        ]).then(([boards, pins]) => {
          setPinterestBoards(Array.isArray(boards) ? boards : []);
          setPinterestPins(Array.isArray(pins) ? pins : []);
        });
      })
      .catch((err) => setPinterestSyncError(err?.message ?? "Could not load boards. Try again."))
      .finally(() => {
        setPinterestSyncLoading(false);
        setPinterestDataLoading(false);
      });
  };

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
            {pinterestStatus === "connected" && (
              <div className="mb-4 px-4 py-2 rounded-xl bg-accent/10 dark:bg-accent/20 text-accent text-sm font-medium">
                Pinterest connected successfully!
              </div>
            )}
            {pinterestStatus && pinterestStatus.startsWith("error") && (
              <div className="mb-4 px-4 py-2 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 text-sm">
                Pinterest connection was cancelled or failed.
              </div>
            )}
            {pinterestStatus === "config_error" && (
              <div className="mb-4 px-4 py-2 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-400 text-sm">
                Pinterest is not configured. Add PINTEREST_APP_ID and PINTEREST_APP_SECRET to your environment.
              </div>
            )}
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
            {profile?.pinterestConnected ? (
              <>
                <div className="flex items-center justify-center gap-2 py-3 text-accent font-medium">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#E60023">
                    <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" />
                  </svg>
                  <span>Pinterest connected</span>
                </div>
                <div className="mt-4 flex flex-col gap-4">
                  {pinterestSyncError && (
                    <div className="px-4 py-2 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 text-sm">
                      {pinterestSyncError}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={handlePinterestSync}
                    disabled={pinterestSyncLoading}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-accent text-white font-semibold shadow-button hover:shadow-button-hover transition-all disabled:opacity-60"
                  >
                    {pinterestSyncLoading ? (
                      "Syncing…"
                    ) : (
                      <>
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M17.65 6.35A7.958 7.958 0 0012 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0112 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" />
                        </svg>
                        Sync boards & pins
                      </>
                    )}
                  </button>
                  {pinterestBoards.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-2 uppercase tracking-wider">Boards</p>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => setPinterestBoardFilter(null)}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                            pinterestBoardFilter === null
                              ? "bg-accent text-white"
                              : "bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-300 dark:hover:bg-zinc-600"
                          }`}
                        >
                          All
                        </button>
                        {pinterestBoards.map((b) => (
                          <button
                            key={b.boardId}
                            type="button"
                            onClick={() => setPinterestBoardFilter(b.boardId)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 max-w-[140px] truncate ${
                              pinterestBoardFilter === b.boardId
                                ? "bg-accent text-white"
                                : "bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-300 dark:hover:bg-zinc-600"
                            }`}
                            title={b.name ?? b.boardId}
                          >
                            {b.thumbnailUrl ? (
                              <img src={b.thumbnailUrl} alt="" className="w-5 h-5 rounded object-cover shrink-0" />
                            ) : (
                              <span className="w-5 h-5 rounded bg-zinc-400 shrink-0" />
                            )}
                            <span className="truncate">{b.name ?? "Board"}</span>
                            <span className="text-xs opacity-80">({b.pinCount})</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {pinterestDataLoading && pinterestBoards.length === 0 && (
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center py-4">Loading…</p>
                  )}
                  {!pinterestDataLoading && pinterestBoards.length === 0 && !pinterestSyncLoading && (
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center py-4">No boards yet. Click &quot;Sync boards & pins&quot; to import, or we&apos;ll try again automatically.</p>
                  )}
                  {pinterestPins.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-2 uppercase tracking-wider">Pins</p>
                      <div className="grid grid-cols-3 gap-2">
                        {pinterestPins.map((p) => (
                          <a
                            key={p.pinId}
                            href={p.link ?? "#"}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="aspect-square rounded-xl overflow-hidden bg-zinc-200 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:ring-2 hover:ring-accent/50 transition-all"
                          >
                            <img
                              src={p.imageUrl}
                              alt={p.title ?? p.description ?? "Pin"}
                              className="w-full h-full object-cover"
                            />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <a
                href="/api/pinterest/auth"
                className="w-full max-w-xs mx-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-accent text-white font-semibold shadow-button hover:shadow-button-hover transition-all"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" />
                </svg>
                Connect Pinterest
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
