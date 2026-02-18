"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { ChatMessage, ChatSearchResult } from "@/types";
import { getProfile } from "@/lib/api";
import { useStore } from "@/state/store";

type NetworkTier = "low" | "medium" | "high";
type BusyAction = "dupes" | "try-on" | null;

interface ReelItem {
  id: string;
  creator: string;
  title: string;
  brand: string;
  priceHint: string;
  baseImageUrl: string;
}

interface NavigatorWithConnection extends Navigator {
  connection?: {
    effectiveType?: string;
    downlink?: number;
    saveData?: boolean;
    addEventListener?: (type: "change", listener: () => void) => void;
    removeEventListener?: (type: "change", listener: () => void) => void;
  };
}

const REELS: ReelItem[] = [
  {
    id: "reel-1",
    creator: "@urban.tailor",
    title: "Charcoal double-breasted suit with brown monk-strap shoes",
    brand: "Arbore Menswear",
    priceHint: "$199",
    baseImageUrl: "https://images.unsplash.com/photo-1509631179647-0177331693ae",
  },
  {
    id: "reel-2",
    creator: "@street.edit",
    title: "Lightweight beige trench layered over neutral knitwear",
    brand: "Rue Atelier",
    priceHint: "$149",
    baseImageUrl: "https://images.unsplash.com/photo-1514996937319-344454492b37",
  },
  {
    id: "reel-3",
    creator: "@daily.fitbook",
    title: "Classic white tee with structured black denims",
    brand: "Mono Basics",
    priceHint: "$59",
    baseImageUrl: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab",
  },
  {
    id: "reel-4",
    creator: "@city.vogue",
    title: "Red evening dress with fitted waist and flowy hemline",
    brand: "Maison Cora",
    priceHint: "$179",
    baseImageUrl: "https://images.unsplash.com/photo-1496747611176-843222e1e57c",
  },
  {
    id: "reel-5",
    creator: "@weekend.picks",
    title: "Layered monochrome athleisure with clean sneakers",
    brand: "North Fold",
    priceHint: "$99",
    baseImageUrl: "https://images.unsplash.com/photo-1483985988355-763728e1935b",
  },
  {
    id: "reel-6",
    creator: "@wardrobe.lab",
    title: "Minimal studio shirt-jacket styling for office casual",
    brand: "Noble Loom",
    priceHint: "$129",
    baseImageUrl: "https://images.unsplash.com/photo-1445205170230-053b83016050",
  },
];

const IMAGE_QUALITY: Record<NetworkTier, { width: number; quality: number }> = {
  low: { width: 720, quality: 48 },
  medium: { width: 960, quality: 62 },
  high: { width: 1320, quality: 80 },
};

const NETWORK_LABEL: Record<NetworkTier, string> = {
  low: "Low Network",
  medium: "Balanced Network",
  high: "High Network",
};

function buildImageUrl(baseImageUrl: string, tier: NetworkTier): string {
  const { width, quality } = IMAGE_QUALITY[tier];
  return `${baseImageUrl}?auto=format&fit=crop&crop=faces&w=${width}&q=${quality}`;
}

async function readResponseError(res: Response, fallback: string): Promise<string> {
  try {
    const data = (await res.json()) as { error?: string; message?: string };
    return data.error?.trim() || data.message?.trim() || fallback;
  } catch {
    return fallback;
  }
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const value = typeof reader.result === "string" ? reader.result.split(",")[1] : "";
      resolve(value ?? "");
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function replaceMessage(messages: ChatMessage[], messageId: string, nextMessage: ChatMessage): ChatMessage[] {
  return messages.map((message) => (message.id === messageId ? nextMessage : message));
}

function useNetworkTier(): NetworkTier {
  const [tier, setTier] = useState<NetworkTier>("high");

  useEffect(() => {
    const conn = (navigator as NavigatorWithConnection).connection;
    if (!conn) return;

    const update = () => {
      const effectiveType = (conn.effectiveType ?? "").toLowerCase();
      const downlink = conn.downlink ?? 0;
      if (conn.saveData || effectiveType.includes("2g")) {
        setTier("low");
        return;
      }
      if (effectiveType === "3g" || (downlink > 0 && downlink < 2.5)) {
        setTier("medium");
        return;
      }
      setTier("high");
    };

    update();
    conn.addEventListener?.("change", update);
    return () => conn.removeEventListener?.("change", update);
  }, []);

  return tier;
}

function HeartIcon({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="h-8 w-8" fill={active ? "#ff4d67" : "none"} stroke="currentColor" strokeWidth="1.8">
      <path d="M12 21s-7.2-4.4-9.4-8.8C.8 8.6 2.7 4.5 6.8 4.5c2.1 0 3.3 1 5.2 3.1 1.9-2.1 3.1-3.1 5.2-3.1 4.1 0 6 4.1 4.2 7.7C19.2 16.6 12 21 12 21Z" />
    </svg>
  );
}

function SaveIcon({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="h-8 w-8" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8">
      <path d="M6.5 3.5h11a1 1 0 0 1 1 1v16l-6.5-4-6.5 4v-16a1 1 0 0 1 1-1Z" />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M21 3 10 14" />
      <path d="m21 3-7 18-4-7-7-4 18-7Z" />
    </svg>
  );
}

function MoreIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-8 w-8" fill="currentColor">
      <circle cx="12" cy="5" r="1.8" />
      <circle cx="12" cy="12" r="1.8" />
      <circle cx="12" cy="19" r="1.8" />
    </svg>
  );
}

export function ReelsFeed() {
  const router = useRouter();
  const networkTier = useNetworkTier();
  const feedRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const { setCurrentSessionId, setCurrentTopic, setChatMessages } = useStore();

  const [activeIndex, setActiveIndex] = useState(0);
  const [likedMap, setLikedMap] = useState<Record<string, boolean>>({});
  const [savedMap, setSavedMap] = useState<Record<string, boolean>>({});
  const [busyMap, setBusyMap] = useState<Record<string, BusyAction>>({});
  const [toast, setToast] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const activeReel = REELS[activeIndex] ?? REELS[0];

  useEffect(() => {
    const preloadIndexes = [activeIndex, activeIndex + 1].filter((i) => i >= 0 && i < REELS.length);
    preloadIndexes.forEach((idx) => {
      const reel = REELS[idx];
      const img = new Image();
      img.src = buildImageUrl(reel.baseImageUrl, networkTier);
    });
  }, [activeIndex, networkTier]);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 1800);
    return () => window.clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    if (!error) return;
    const t = window.setTimeout(() => setError(null), 2600);
    return () => window.clearTimeout(t);
  }, [error]);

  useEffect(() => {
    return () => {
      if (rafRef.current != null) {
        window.cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  const setBusyForReel = useCallback((reelId: string, action: BusyAction) => {
    setBusyMap((prev) => {
      if (action === null) {
        const next = { ...prev };
        delete next[reelId];
        return next;
      }
      return { ...prev, [reelId]: action };
    });
  }, []);

  const handleFeedScroll = useCallback(() => {
    if (rafRef.current != null) {
      window.cancelAnimationFrame(rafRef.current);
    }
    rafRef.current = window.requestAnimationFrame(() => {
      const node = feedRef.current;
      if (!node) return;
      const next = Math.round(node.scrollTop / Math.max(node.clientHeight, 1));
      const safeNext = Math.max(0, Math.min(next, REELS.length - 1));
      setActiveIndex((prev) => (prev === safeNext ? prev : safeNext));
    });
  }, []);

  const toggleLike = useCallback((reelId: string) => {
    setLikedMap((prev) => ({ ...prev, [reelId]: !prev[reelId] }));
  }, []);

  const toggleSave = useCallback((reelId: string) => {
    setSavedMap((prev) => ({ ...prev, [reelId]: !prev[reelId] }));
  }, []);

  const buildFallbackSearchResult = useCallback(
    (reel: ReelItem): ChatSearchResult => ({
      position: 1,
      title: reel.title,
      source: reel.brand,
      price: reel.priceHint,
      product_link: `https://www.google.com/search?tbm=shop&q=${encodeURIComponent(reel.title)}`,
      thumbnail: buildImageUrl(reel.baseImageUrl, networkTier),
      serpapi_thumbnail: buildImageUrl(reel.baseImageUrl, networkTier),
    }),
    [networkTier]
  );

  const createSession = useCallback(async (): Promise<string> => {
    const sessionRes = await fetch("/api/sessions", { method: "POST" });
    if (!sessionRes.ok) {
      throw new Error(await readResponseError(sessionRes, "Failed to start chat session."));
    }
    const sessionData = (await sessionRes.json()) as { sessionId?: string };
    const sessionId = sessionData.sessionId?.trim();
    if (!sessionId) {
      throw new Error("Session ID is missing.");
    }
    return sessionId;
  }, []);

  const patchSession = useCallback(
    async (sessionId: string, payload: { title: string; messages: ChatMessage[]; currentTopic?: string | null }) => {
      const res = await fetch(`/api/sessions/${encodeURIComponent(sessionId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        throw new Error(await readResponseError(res, "Failed to prepare chat session."));
      }
    },
    []
  );

  const buildSearchQuery = useCallback(async (summary: string): Promise<string> => {
    try {
      const res = await fetch("/api/model-switcher", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: `search ${summary}` }),
      });
      if (!res.ok) return summary;
      const data = (await res.json()) as { type?: string; query?: string };
      const query = data.query?.trim();
      if (data.type === "search" && query) return query;
      return summary;
    } catch {
      return summary;
    }
  }, []);

  const startTryOnFlow = useCallback(
    async (reel: ReelItem) => {
      setError(null);
      setBusyForReel(reel.id, "try-on");
      const sessionTitle = `Try-on: ${reel.title.slice(0, 36)}`;
      const userMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content: `Try this look on me: ${reel.title}`,
      };
      const pendingAssistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "Preparing your try-on...",
      };
      const initialMessages: ChatMessage[] = [userMessage, pendingAssistantMessage];
      let sessionId = "";
      let navigated = false;

      try {
        sessionId = await createSession();
        await patchSession(sessionId, {
          title: sessionTitle,
          currentTopic: "TryOn",
          messages: initialMessages,
        });
        setCurrentSessionId(sessionId);
        setCurrentTopic("TryOn");
        setChatMessages(initialMessages);
        router.push(`/chat?sessionId=${encodeURIComponent(sessionId)}`);
        navigated = true;

        const profile = await getProfile().catch(() => null);
        const profileImage = profile?.profile_image?.trim();

        if (!profileImage) {
          const searchResult = buildFallbackSearchResult(reel);
          const assistantMessage: ChatMessage = {
            id: pendingAssistantMessage.id,
            role: "assistant",
            content: "Upload your profile image in chat, then tap Try On on this card.",
            type: "search",
            searchQuery: reel.title,
            searchResults: [searchResult],
          };
          const messages = replaceMessage(initialMessages, pendingAssistantMessage.id, assistantMessage);
          setChatMessages(messages);
          await patchSession(sessionId, {
            title: sessionTitle,
            currentTopic: "TryOn",
            messages,
          });
          return;
        }

        const profileImageRes = await fetch(`/api/profile-image?url=${encodeURIComponent(profileImage)}`);
        if (!profileImageRes.ok) {
          throw new Error(await readResponseError(profileImageRes, "Failed to load profile image."));
        }
        const profileBlob = await profileImageRes.blob();
        const profileMime = profileBlob.type || "image/jpeg";
        const profileImageBase64 = await blobToBase64(profileBlob);

        const tryOnRes = await fetch("/api/try-on", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productImageUrl: buildImageUrl(reel.baseImageUrl, "high"),
            profileImageBase64,
            profileImageMime: profileMime,
          }),
        });
        const tryOnData = (await tryOnRes.json()) as { image?: string; error?: string };
        if (!tryOnRes.ok || !tryOnData.image) {
          throw new Error((tryOnData.error ?? "Try-on failed.").trim());
        }

        const assistantMessage: ChatMessage = {
          id: pendingAssistantMessage.id,
          role: "assistant",
          content: "Here's your try-on result.",
          type: "try-on",
          tryOnResultImage: tryOnData.image,
          tryOnProduct: {
            title: reel.title,
            source: reel.brand,
            price: reel.priceHint,
            product_link: `https://www.google.com/search?tbm=shop&q=${encodeURIComponent(reel.title)}`,
          },
        };
        const messages = replaceMessage(initialMessages, pendingAssistantMessage.id, assistantMessage);
        setChatMessages(messages);

        await patchSession(sessionId, {
          title: sessionTitle,
          currentTopic: "TryOn",
          messages,
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : "Try-on failed.";
        if (sessionId && navigated) {
          const failureMessage: ChatMessage = {
            id: pendingAssistantMessage.id,
            role: "assistant",
            content: `Try-on failed: ${message}`,
          };
          const failureMessages = replaceMessage(initialMessages, pendingAssistantMessage.id, failureMessage);
          setChatMessages(failureMessages);
          try {
            await patchSession(sessionId, {
              title: sessionTitle,
              currentTopic: "TryOn",
              messages: failureMessages,
            });
          } catch {}
        } else {
          setError(message);
        }
      } finally {
        setBusyForReel(reel.id, null);
      }
    },
    [
      buildFallbackSearchResult,
      createSession,
      patchSession,
      router,
      setBusyForReel,
      setChatMessages,
      setCurrentSessionId,
      setCurrentTopic,
    ]
  );

  const startDupesFlow = useCallback(
    async (reel: ReelItem) => {
      setError(null);
      setBusyForReel(reel.id, "dupes");
      const userMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content: "search dupes for this look",
      };
      const pendingAssistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "Searching dupes...",
      };
      const initialMessages: ChatMessage[] = [userMessage, pendingAssistantMessage];
      let sessionId = "";
      let navigated = false;

      try {
        sessionId = await createSession();
        await patchSession(sessionId, {
          title: `Dupes: ${reel.title.slice(0, 38)}`,
          currentTopic: "Style",
          messages: initialMessages,
        });
        setCurrentSessionId(sessionId);
        setCurrentTopic("Style");
        setChatMessages(initialMessages);
        router.push(`/chat?sessionId=${encodeURIComponent(sessionId)}`);
        navigated = true;

        const summaryRes = await fetch("/api/reels/attire-summary", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageUrl: buildImageUrl(reel.baseImageUrl, "high") }),
        });
        if (!summaryRes.ok) {
          throw new Error(await readResponseError(summaryRes, "Failed to analyze outfit."));
        }
        const summaryData = (await summaryRes.json()) as { summary?: string };
        const summary = summaryData.summary?.trim();
        if (!summary) {
          throw new Error("Outfit summary is empty.");
        }
        const query = await buildSearchQuery(summary);

        const params = new URLSearchParams({ q: query, country: "in" });
        const searchRes = await fetch(`/api/shopping-search?${params.toString()}`);
        const searchData = (await searchRes.json()) as { results?: ChatSearchResult[]; error?: string };
        if (!searchRes.ok) {
          throw new Error((searchData.error ?? "Failed to fetch dupes.").trim());
        }

        const results = Array.isArray(searchData.results) ? searchData.results : [];
        const resolvedUserMessage: ChatMessage = {
          ...userMessage,
          content: `search dupes for this look: ${query}`,
        };
        const assistantMessage: ChatMessage =
          results.length > 0
            ? {
                id: pendingAssistantMessage.id,
                role: "assistant",
                content: `Here are some dupes for "${query}"`,
                type: "search",
                searchQuery: query,
                searchResults: results,
              }
            : {
                id: pendingAssistantMessage.id,
                role: "assistant",
                content: `I could not find results for "${query}". Try a broader keyword.`,
              };
        const nextUserMessages = replaceMessage(initialMessages, userMessage.id, resolvedUserMessage);
        const messages = replaceMessage(nextUserMessages, pendingAssistantMessage.id, assistantMessage);
        setChatMessages(messages);

        await patchSession(sessionId, {
          title: `Dupes: ${query.slice(0, 38)}`,
          currentTopic: "Style",
          messages,
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : "Find dupes failed.";
        if (sessionId && navigated) {
          const failureMessage: ChatMessage = {
            id: pendingAssistantMessage.id,
            role: "assistant",
            content: `Find dupes failed: ${message}`,
          };
          const failureMessages = replaceMessage(initialMessages, pendingAssistantMessage.id, failureMessage);
          setChatMessages(failureMessages);
          try {
            await patchSession(sessionId, {
              title: `Dupes: ${reel.title.slice(0, 38)}`,
              currentTopic: "Style",
              messages: failureMessages,
            });
          } catch {}
        } else {
          setError(message);
        }
      } finally {
        setBusyForReel(reel.id, null);
      }
    },
    [
      buildSearchQuery,
      createSession,
      patchSession,
      router,
      setBusyForReel,
      setChatMessages,
      setCurrentSessionId,
      setCurrentTopic,
    ]
  );

  const shareCurrentReel = useCallback(async (reel: ReelItem) => {
    const shareUrl = `${window.location.origin}/reels?item=${encodeURIComponent(reel.id)}`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: reel.title,
          text: reel.title,
          url: shareUrl,
        });
        return;
      }
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
        setToast("Link copied");
        return;
      }
      setToast("Share is not supported on this device");
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;
      setToast("Share failed");
    }
  }, []);

  const activeBusy = useMemo(() => busyMap[activeReel.id] ?? null, [activeReel.id, busyMap]);

  return (
    <div className="relative h-[100dvh] w-full bg-black text-white md:flex md:items-center md:justify-center md:p-4">
      <div className="relative h-full w-full overflow-hidden md:h-[92dvh] md:w-[430px] md:max-w-[calc(100vw-2rem)] md:rounded-[26px] md:border md:border-white/10 md:shadow-[0_24px_80px_rgba(0,0,0,0.55)]">
        <div
          ref={feedRef}
          onScroll={handleFeedScroll}
          className="h-full overflow-y-auto snap-y snap-mandatory overscroll-y-contain scrollbar-hide"
        >
        {REELS.map((reel, index) => {
          const isActive = index === activeIndex;
          const shouldRenderImage = Math.abs(index - activeIndex) <= 1;
          const imageSrc = buildImageUrl(reel.baseImageUrl, networkTier);
          const isLiked = Boolean(likedMap[reel.id]);
          const isSaved = Boolean(savedMap[reel.id]);
          const busy = busyMap[reel.id] ?? null;

          return (
            <section key={reel.id} className="relative h-full w-full snap-start bg-zinc-950">
              {shouldRenderImage ? (
                <img
                  src={imageSrc}
                  alt={reel.title}
                  className="h-full w-full object-cover"
                  loading={isActive ? "eager" : "lazy"}
                  decoding="async"
                  draggable={false}
                />
              ) : (
                <div className="h-full w-full bg-gradient-to-b from-zinc-900 via-zinc-800 to-zinc-900" />
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-black/30" />

              <div className="absolute left-3 top-[max(0.75rem,env(safe-area-inset-top))] rounded-full border border-white/20 bg-black/35 px-3 py-1 text-xs backdrop-blur-md">
                5G | {NETWORK_LABEL[networkTier]}
              </div>

              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col items-center gap-4 text-white">
                <button
                  type="button"
                  onClick={() => toggleLike(reel.id)}
                  className="flex flex-col items-center gap-1 text-[13px]"
                  aria-pressed={isLiked}
                >
                  <HeartIcon active={isLiked} />
                  <span>{isLiked ? "liked" : "like"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => toggleSave(reel.id)}
                  className="flex flex-col items-center gap-1 text-[13px]"
                  aria-pressed={isSaved}
                >
                  <SaveIcon active={isSaved} />
                  <span>{isSaved ? "saved" : "save"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => shareCurrentReel(reel)}
                  className="flex flex-col items-center gap-1 text-[13px]"
                >
                  <ShareIcon />
                  <span>share</span>
                </button>

                <button
                  type="button"
                  disabled
                  className="flex flex-col items-center gap-1 text-[13px] opacity-70"
                  aria-disabled="true"
                >
                  <MoreIcon />
                  <span>more</span>
                </button>
              </div>

              <div className="absolute left-3 right-3 bottom-[max(1rem,env(safe-area-inset-bottom)+0.5rem)]">
                <div className="mb-3 max-w-[72%]">
                  <p className="text-sm font-semibold">{reel.creator}</p>
                  <p className="text-base font-medium leading-tight">{reel.title}</p>
                  <p className="mt-1 text-sm text-white/85">{reel.brand} | {reel.priceHint}</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => startDupesFlow(reel)}
                    disabled={busy !== null}
                    className="h-14 flex-1 rounded-full border border-white/30 bg-zinc-900/80 text-xl font-medium tracking-tight backdrop-blur-md disabled:opacity-70"
                  >
                    {busy === "dupes" ? "finding..." : "find dupes"}
                  </button>
                  <button
                    type="button"
                    onClick={() => startTryOnFlow(reel)}
                    disabled={busy !== null}
                    className="h-14 flex-1 rounded-full bg-[#e76870] text-xl font-semibold tracking-tight text-white disabled:opacity-70"
                  >
                    {busy === "try-on" ? "starting..." : "try-on"}
                  </button>
                </div>
              </div>
            </section>
          );
        })}
        </div>

        {toast && (
          <div className="pointer-events-none absolute left-1/2 top-[max(0.75rem,env(safe-area-inset-top))] -translate-x-1/2 rounded-full border border-white/20 bg-black/65 px-3 py-1.5 text-xs backdrop-blur-md">
            {toast}
          </div>
        )}
        {error && (
          <div className="pointer-events-none absolute left-3 right-3 bottom-[max(5.2rem,env(safe-area-inset-bottom)+4.25rem)] rounded-xl border border-red-400/40 bg-red-950/70 px-3 py-2 text-sm text-red-100 backdrop-blur-md">
            {error}
          </div>
        )}

        <div className="pointer-events-none absolute right-3 top-[max(2.8rem,env(safe-area-inset-top)+2rem)] rounded-md border border-white/15 bg-black/30 px-2 py-1 text-[10px] uppercase tracking-wider text-white/75">
          media: image | next: hls abr
        </div>

        <div className="pointer-events-none absolute left-1/2 top-[max(0.75rem,env(safe-area-inset-top))] -translate-x-1/2 text-[11px] text-white/80">
          {activeBusy ? "Preparing chat..." : ""}
        </div>
      </div>
    </div>
  );
}
