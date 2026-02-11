"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { TopicChips } from "@/components/TopicChips";
import { useStore } from "@/state/store";
import { sendChat, getProfile, saveProfile, uploadProfileImage } from "@/lib/api";
import { detectTopicFromMessage } from "@/lib/topicDetection";
import type { Topic } from "@/types";
import type { ChatMessage } from "@/types";

const SEARCH_COUNTRIES = [
  { code: "in", label: "India" },
  { code: "us", label: "US" },
  { code: "uk", label: "UK" },
  { code: "ae", label: "UAE" },
  { code: "ca", label: "Canada" },
] as const;

interface ShoppingResult {
  position: number;
  title: string;
  product_id?: string;
  product_link?: string;
  /** SerpApi URL to fetch merchant/seller links (direct Myntra, Amazon, etc.) */
  serpapi_immersive_product_api?: string;
  source?: string;
  price?: string;
  extracted_price?: number;
  thumbnail?: string;
  serpapi_thumbnail?: string;
  rating?: number;
  reviews?: number;
  tag?: string;
  delivery?: string;
}

interface ChatPanelProps {
  onClose: () => void;
  /** Rendered above messages/search in the scroll area (e.g. try-on result card) */
  topSlot?: React.ReactNode;
}

export function ChatPanel({ onClose, topSlot }: ChatPanelProps) {
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [searchCountry, setSearchCountry] = useState<string>("in");
  const [openingProductPosition, setOpeningProductPosition] = useState<number | null>(null);
  const [openingTryOnId, setOpeningTryOnId] = useState<string | null>(null);
  const [tryOnPosition, setTryOnPosition] = useState<number | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadImageError, setUploadImageError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    chatMessages,
    setChatMessages,
    currentTopic,
    setCurrentTopic,
    profile,
    setProfile,
    setTryOnResultImage,
    setTryOnProduct,
    tryOnError,
    setTryOnError,
  } = useStore();

  const handleUnifiedSubmit = useCallback(async () => {
    const text = input.trim();
    if (!text || sending) return;
    setInput("");
    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
    };
    setChatMessages((prev) => [...prev, userMsg]);
    setSending(true);
    try {
      const switchRes = await fetch("/api/model-switcher", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: text }),
      });
      const switchData = (await switchRes.json()) as { type?: string; query?: string };
      const routeType = (switchData?.type ?? "chat").toLowerCase();
      const q = (routeType === "search" && switchData?.query?.trim()) || text;

      if (routeType === "search") {
        const params = new URLSearchParams({ q, country: searchCountry });
        const res = await fetch(`/api/shopping-search?${params.toString()}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Search failed");
        const results = (data.results ?? []) as ShoppingResult[];
        setChatMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content: `Here are some results for "${q}"`,
            type: "search",
            searchQuery: q,
            searchResults: results,
          } as ChatMessage,
        ]);
      } else {
        const topic = detectTopicFromMessage(text);
        setCurrentTopic(topic);
        const res = await sendChat(text, topic);
        setCurrentTopic(res.topic as Topic);
        setChatMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content: res.message,
            topic: res.topic as Topic,
            citations: res.citations,
          } as ChatMessage,
        ]);
      }
    } catch (err) {
      setChatMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "Sorry, I couldn’t reach the server. Try again.",
        },
      ]);
    } finally {
      setSending(false);
    }
  }, [input, sending, searchCountry, setChatMessages, setCurrentTopic]);

  const openProduct = useCallback(
    async (r: ShoppingResult) => {
      const fallbackUrl = r.product_link ?? "#";
      if (!r.serpapi_immersive_product_api) {
        window.open(fallbackUrl, "_blank");
        return;
      }
      setOpeningProductPosition(r.position);
      try {
        const params = new URLSearchParams({
          serpapi_url: r.serpapi_immersive_product_api,
        });
        const res = await fetch(`/api/shopping-product?${params.toString()}`);
        const data = await res.json();
        const merchantLink =
          data.merchantLink ?? (Array.isArray(data.sellers) && data.sellers[0]?.link) ?? null;
        window.open(merchantLink ?? fallbackUrl, "_blank");
      } catch {
        window.open(fallbackUrl, "_blank");
      } finally {
        setOpeningProductPosition(null);
      }
    },
    []
  );

  const openTryOnProduct = useCallback(
    async (msgId: string, p: { product_link?: string; serpapi_immersive_product_api?: string }) => {
      const fallbackUrl = p.product_link ?? "#";
      if (!p.serpapi_immersive_product_api) {
        window.open(fallbackUrl, "_blank");
        return;
      }
      setOpeningTryOnId(msgId);
      try {
        const params = new URLSearchParams({
          serpapi_url: p.serpapi_immersive_product_api,
        });
        const res = await fetch(`/api/shopping-product?${params.toString()}`);
        const data = await res.json();
        const merchantLink =
          data.merchantLink ?? (Array.isArray(data.sellers) && data.sellers[0]?.link) ?? null;
        window.open(merchantLink ?? fallbackUrl, "_blank");
      } catch {
        window.open(fallbackUrl, "_blank");
      } finally {
        setOpeningTryOnId(null);
      }
    },
    []
  );

  const handleTryOn = useCallback(
    async (r: ShoppingResult) => {
      if (!profile?.profile_image) {
        setTryOnError("Upload a profile image first (Profile image button above).");
        return;
      }
      const productImageUrl = (r.thumbnail ?? r.serpapi_thumbnail ?? "").trim();
      if (!productImageUrl) {
        setTryOnError("This product has no image.");
        return;
      }
      setTryOnError(null);
      setTryOnPosition(r.position);
      setTryOnResultImage(null);
      setTryOnProduct(null);
      try {
        const profileImageUrl = `/api/profile-image?url=${encodeURIComponent(profile.profile_image)}`;
        const imgRes = await fetch(profileImageUrl);
        if (!imgRes.ok) throw new Error("Failed to load profile image");
        const blob = await imgRes.blob();
        const mime = blob.type || "image/jpeg";
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const dataUrl = reader.result as string;
            const b64 = dataUrl.split(",")[1];
            resolve(b64 ?? "");
          };
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
        const res = await fetch("/api/try-on", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productImageUrl,
            profileImageBase64: base64,
            profileImageMime: mime,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Try-on failed");
        if (data.image) {
          const product = {
            title: r.title,
            source: r.source,
            price: r.price ?? (r.extracted_price != null ? `$${r.extracted_price}` : undefined),
            product_link: r.product_link,
            serpapi_immersive_product_api: r.serpapi_immersive_product_api,
            rating: r.rating,
            reviews: r.reviews,
          };
          setChatMessages((prev) => [
            ...prev,
            {
              id: crypto.randomUUID(),
              role: "assistant",
              content: "Here's your try-on result.",
              type: "try-on",
              tryOnResultImage: data.image,
              tryOnProduct: product,
            } as ChatMessage,
          ]);
          setTryOnResultImage(null);
          setTryOnProduct(null);
        } else {
          throw new Error("No image in response");
        }
      } catch (err) {
        setTryOnError(err instanceof Error ? err.message : "Try-on failed");
      } finally {
        setTryOnPosition(null);
      }
    },
    [profile?.profile_image, setChatMessages, setTryOnResultImage, setTryOnProduct]
  );

  useEffect(() => {
    if (profile == null) {
      let cancelled = false;
      getProfile().then((data) => {
        if (!cancelled && data) setProfile(data);
      });
      return () => { cancelled = true; };
    }
  }, [profile, setProfile]);

  const handleProfileImageChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = "";
      if (!file) return;
      setUploadImageError(null);
      setUploadingImage(true);
      try {
        const url = await uploadProfileImage(file);
        const current = await getProfile();
        const next = { ...(current ?? {}), profile_image: url };
        await saveProfile(next);
        setProfile(next);
      } catch (err) {
        setUploadImageError(err instanceof Error ? err.message : "Upload failed");
      } finally {
        setUploadingImage(false);
      }
    },
    [setProfile]
  );

  return (
    <div className="flex flex-col h-full min-h-0 min-w-0 overflow-hidden">
      {/* Scrollable content */}
      <div className="flex-1 min-h-0 min-w-0 overflow-y-auto overflow-x-hidden p-3 sm:p-4 space-y-2.5 overscroll-contain">
        {topSlot}
        {tryOnPosition != null && (
          <div className="flex items-center gap-2 py-2 px-3 rounded-xl bg-accent/10 text-accent text-sm">
            <span className="inline-block w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" aria-hidden />
            <span>Generating try-on image…</span>
          </div>
        )}
        {tryOnError && (
          <p className="text-sm text-red-600 dark:text-red-400 py-1.5 px-2 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            Try-on: {tryOnError}
          </p>
        )}
        {chatMessages.length === 0 && !topSlot && (
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 py-1">
            Ask about fit, budget, occasion, style, fabric, comparison, or try-on. Or search for products (e.g. &quot;blue sneakers&quot;).
          </p>
        )}
        {chatMessages.map((m) => (
          <div
            key={m.id}
            className={`flex gap-2 ${m.role === "user" ? "justify-end" : "justify-start"} min-w-0`}
          >
            {m.role === "assistant" && (
              <div className="shrink-0 w-7 h-7 rounded-full bg-accent/20 flex items-center justify-center mt-0.5" aria-hidden>
                <span className="text-accent text-xs font-bold">AI</span>
              </div>
            )}
            {m.role === "user" ? (
              <div className="max-w-[90%] sm:max-w-[85%] rounded-2xl px-3 sm:px-4 py-2.5 text-sm break-words bg-accent text-white shadow-sm">
                <p className="break-words">{m.content}</p>
              </div>
            ) : m.type === "try-on" && m.tryOnResultImage && m.tryOnProduct ? (
              <div className="max-w-full rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-sm p-4 sm:p-5">
                <div className="flex items-center gap-2 mb-4">
                  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-semibold">
                    <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                    Try-On Result
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row gap-5">
                  <div className="shrink-0">
                    <img
                      src={m.tryOnResultImage}
                      alt="Try-on result"
                      className="max-h-[280px] sm:max-h-[320px] w-auto object-contain rounded-xl border border-zinc-200 dark:border-zinc-700"
                    />
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <h3 className="font-semibold text-zinc-900 dark:text-white text-lg sm:text-xl mb-2 line-clamp-2">
                      {m.tryOnProduct.title}
                    </h3>
                    {m.tryOnProduct.source && (
                      <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-2">{m.tryOnProduct.source}</p>
                    )}
                    {m.tryOnProduct.price && (
                      <p className="text-xl sm:text-2xl font-bold text-accent mb-3">{m.tryOnProduct.price}</p>
                    )}
                    {(m.tryOnProduct.rating != null || m.tryOnProduct.reviews != null) && (
                      <div className="flex items-center gap-2 mb-4">
                        {m.tryOnProduct.rating != null && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-medium">
                            ★ {m.tryOnProduct.rating}
                          </span>
                        )}
                        {m.tryOnProduct.reviews != null && (
                          <span className="text-xs text-zinc-500 dark:text-zinc-400">{m.tryOnProduct.reviews} reviews</span>
                        )}
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => openTryOnProduct(m.id, m.tryOnProduct!)}
                      disabled={openingTryOnId === m.id}
                      className="self-start mt-auto px-6 py-3 rounded-xl bg-accent text-white text-sm font-medium hover:bg-accent/90 disabled:opacity-50"
                    >
                      {openingTryOnId === m.id ? "Opening…" : "Visit Store →"}
                    </button>
                  </div>
                </div>
              </div>
            ) : m.type === "search" && m.searchResults ? (
              <div className="max-w-full space-y-2">
                <div className="rounded-2xl px-3 sm:px-4 py-2.5 text-sm bg-zinc-100 dark:bg-zinc-800/90 text-zinc-900 dark:text-zinc-100 border border-zinc-200/60 dark:border-zinc-700/60">
                  <p className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400 mb-1">Concierge</p>
                  <p className="break-words">{m.content}</p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {m.searchResults.slice(0, 12).map((r) => {
                    const opening = openingProductPosition === r.position;
                    const tryingOn = tryOnPosition === r.position;
                    return (
                      <div
                        key={r.position}
                        className="flex gap-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/80 p-3 hover:border-accent/50 transition-colors"
                      >
                        <div className="shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-700">
                          {(r.thumbnail || r.serpapi_thumbnail) && (
                            <img
                              src={r.thumbnail ?? r.serpapi_thumbnail ?? ""}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium text-zinc-900 dark:text-zinc-100 line-clamp-2">{r.title}</p>
                          {r.source && (
                            <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5">{r.source}</p>
                          )}
                          <p className="text-sm font-semibold text-accent mt-1">
                            {r.price ?? (r.extracted_price != null ? `$${r.extracted_price}` : "")}
                          </p>
                          {r.rating != null || r.tag ? (
                            <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                              {[r.rating != null && `${r.rating}★`, r.reviews != null && `${r.reviews} reviews`, r.tag].filter(Boolean).join(" · ")}
                            </p>
                          ) : null}
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleTryOn(r);
                              }}
                              disabled={tryingOn}
                              className="px-2.5 py-1 rounded-lg text-xs font-medium bg-accent text-white hover:bg-accent/90 disabled:opacity-50"
                            >
                              {tryingOn ? "…" : "Try On"}
                            </button>
                            <button
                              type="button"
                              onClick={() => openProduct(r)}
                              disabled={opening}
                              className="px-2.5 py-1 rounded-lg text-xs font-medium border border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 disabled:opacity-50"
                            >
                              {opening ? "Opening…" : "Visit Store"}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="max-w-[90%] sm:max-w-[85%] rounded-2xl px-3 sm:px-4 py-2.5 text-sm break-words bg-zinc-100 dark:bg-zinc-800/90 text-zinc-900 dark:text-zinc-100 border border-zinc-200/60 dark:border-zinc-700/60">
                {m.role === "assistant" && (
                  <p className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400 mb-1">Concierge</p>
                )}
                <p className="break-words">{m.content}</p>
                {m.citations && m.citations.length > 0 && (
                  <div className="mt-2.5 pt-2 border-t border-zinc-200/60 dark:border-zinc-600/60">
                    <p className="text-[10px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">References</p>
                    <div className="flex flex-wrap gap-1.5">
                      {m.citations.slice(0, 4).map((c, i) => (
                        <span key={i} className="inline-block px-2 py-1 rounded-md bg-accent/10 text-accent text-xs break-all max-w-full">
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
        {sending && (
          <div className="flex justify-start gap-2">
            <div className="shrink-0 w-7 h-7 rounded-full bg-accent/20 flex items-center justify-center mt-0.5" aria-hidden>
              <span className="text-accent text-xs font-bold">AI</span>
            </div>
            <div className="rounded-2xl px-3 sm:px-4 py-2.5 bg-zinc-100 dark:bg-zinc-800 text-sm text-zinc-500 border border-zinc-200/60 dark:border-zinc-700/60">
              …
            </div>
          </div>
        )}
      </div>

      {/* Thin bottom bar: options + input (chatbox style) — solid bg + z-10 on mobile so nothing overlaps */}
      <div className="shrink-0 relative z-10 isolate rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 sm:bg-white/95 sm:dark:bg-zinc-900/95 backdrop-blur-sm shadow-[0_-2px 12px rgba(0,0,0,0.06)] dark:shadow-[0_-2px 12px rgba(0,0,0,0.2)] mx-2 sm:mx-0 mb-2 sm:mb-3 mb-[max(0.5rem,env(safe-area-inset-bottom))] p-2 sm:p-2.5 space-y-2">
        {/* Options row — single row on mobile, no wrap; chips scroll horizontally */}
        <div className="flex items-center gap-2 min-h-0 overflow-x-auto overflow-y-hidden scrollbar-hide sm:flex-wrap">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            aria-hidden
            onChange={handleProfileImageChange}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingImage}
            className="flex items-center gap-1.5 min-h-[38px] px-2.5 rounded-lg border border-zinc-200 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-xs font-medium disabled:opacity-50 transition-colors shrink-0 touch-manipulation"
            title="Upload profile image"
          >
            {profile?.profile_image ? (
              <span className="w-6 h-6 rounded-full overflow-hidden shrink-0 bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center">
                <img
                  src={`/api/profile-image?url=${encodeURIComponent(profile.profile_image)}`}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </span>
            ) : (
              <span className="w-6 h-6 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-zinc-500 text-[10px]" aria-hidden>📷</span>
            )}
            <span className="hidden sm:inline">{uploadingImage ? "…" : "Profile"}</span>
          </button>
          {uploadImageError && (
            <p className="text-[10px] text-red-600 dark:text-red-400 shrink-0 whitespace-nowrap">{uploadImageError}</p>
          )}
          <div className="flex-1 min-w-[80px] overflow-x-auto scrollbar-hide -mx-1">
            <TopicChips
              currentTopic={currentTopic}
              onSelect={(t) => setCurrentTopic(t)}
              compact
            />
          </div>
          <div className="flex gap-1.5 shrink-0">
            {SEARCH_COUNTRIES.map(({ code, label }) => (
              <button
                key={code}
                type="button"
                onClick={() => setSearchCountry(code)}
                className={`px-2 py-1.5 rounded-md text-[11px] font-medium transition-colors shrink-0 min-h-[38px] sm:min-h-0 flex items-center ${searchCountry === code ? "bg-accent text-white" : "bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-600"}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        {/* Input row */}
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleUnifiedSubmit()}
            placeholder="Ask or search for products…"
            className="flex-1 min-w-0 min-h-[44px] sm:min-h-[38px] rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/80 px-3 py-2.5 sm:py-2 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 touch-manipulation"
          />
          <button
            type="button"
            onClick={handleUnifiedSubmit}
            disabled={sending || !input.trim()}
            className="min-h-[44px] sm:min-h-[38px] px-4 rounded-xl bg-accent text-white text-sm font-medium disabled:opacity-50 hover:bg-accent/90 active:bg-accent/80 transition-colors shrink-0 touch-manipulation"
          >
            {sending ? "…" : "Send"}
          </button>
        </div>
        {tryOnError && (
          <p className="text-[11px] text-red-600 dark:text-red-400 px-1 pt-0.5">{tryOnError}</p>
        )}
      </div>
    </div>
  );
}
