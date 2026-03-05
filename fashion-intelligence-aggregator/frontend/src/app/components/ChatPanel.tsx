"use client";

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useStore } from "@/state/store";
import { sendChat, getProfile, saveProfile, uploadProfileImage, getSavedProfileAssets } from "@/lib/api";
import { detectTopicFromMessage } from "@/lib/topicDetection";
import { AssetViewerModal } from "@/components/AssetViewerModal";
import { ChatRichText } from "@/components/ChatRichText";
import { AvatarStage } from "@/app/avatar/components/AvatarStage";
import { useAvatarSpeech } from "@/app/avatar/hooks/useAvatarSpeech";
import type { Topic } from "@/types";
import type { ChatMessage } from "@/types";
import type { Profile } from "@/types";
import type { SavedProfileAsset } from "@/lib/api";

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
  /** Optional slot rendered above input row (used by /chat mode toggle) */
  inputTopSlot?: React.ReactNode;
}

const AVATAR_SYSTEM_PROMPT = [
  "You are a fashion concierge avatar.",
  "Keep your responses super concise, conversational, and easy to speak.",
  "Use maximum 2 short sentences.",
  "No markdown or bullet points in responses.",
].join(" ");

function cleanMeasurements(profile: Profile | null): NonNullable<Profile["measurements"]> | undefined {
  const measurements = profile?.measurements;
  if (!measurements) return undefined;
  const cleaned: NonNullable<Profile["measurements"]> = {};
  if (typeof measurements.height === "number" && Number.isFinite(measurements.height)) cleaned.height = measurements.height;
  if (typeof measurements.weight === "number" && Number.isFinite(measurements.weight)) cleaned.weight = measurements.weight;
  if (typeof measurements.chest === "number" && Number.isFinite(measurements.chest)) cleaned.chest = measurements.chest;
  if (typeof measurements.waist === "number" && Number.isFinite(measurements.waist)) cleaned.waist = measurements.waist;
  if (typeof measurements.hips === "number" && Number.isFinite(measurements.hips)) cleaned.hips = measurements.hips;
  if (typeof measurements.shoulder === "number" && Number.isFinite(measurements.shoulder)) cleaned.shoulder = measurements.shoulder;
  if (typeof measurements.inseam === "number" && Number.isFinite(measurements.inseam)) cleaned.inseam = measurements.inseam;
  return Object.keys(cleaned).length > 0 ? cleaned : undefined;
}

function buildPersonalizedSystemPrompt(topic: Topic, profile: Profile | null): string {
  const details: string[] = [];
  const measurements = cleanMeasurements(profile);
  if (measurements) {
    const readable = [
      measurements.height != null ? `height ${measurements.height} cm` : null,
      measurements.weight != null ? `weight ${measurements.weight} kg` : null,
      measurements.chest != null ? `chest ${measurements.chest} in` : null,
      measurements.waist != null ? `waist ${measurements.waist} in` : null,
      measurements.hips != null ? `hips ${measurements.hips} in` : null,
      measurements.shoulder != null ? `shoulder ${measurements.shoulder} in` : null,
      measurements.inseam != null ? `inseam ${measurements.inseam} in` : null,
    ].filter(Boolean);
    if (readable.length > 0) details.push(`Body & Measurements: ${readable.join(", ")}`);
  }
  if (profile?.fitPreference) details.push(`Fit preference: ${profile.fitPreference}`);
  if (profile?.sleevePreference) details.push(`Sleeve preference: ${profile.sleevePreference}`);
  if (profile?.lengthPreference) details.push(`Length preference: ${profile.lengthPreference}`);
  if (profile?.budgetTier) details.push(`Budget tier: ${profile.budgetTier}`);
  if (profile?.budgetSensitivity) details.push(`Budget sensitivity: ${profile.budgetSensitivity}`);
  if (profile?.occasions?.length) details.push(`Occasions: ${profile.occasions.join(", ")}`);
  if (profile?.occasionFrequency) details.push(`Occasion frequency: ${profile.occasionFrequency}`);
  if (profile?.fabricPrefs?.length) details.push(`Fabric preferences: ${profile.fabricPrefs.join(", ")}`);
  if (profile?.fabricSensitivities?.length) details.push(`Fabric sensitivities: ${profile.fabricSensitivities.join(", ")}`);
  if (profile?.climate) details.push(`Climate: ${profile.climate}`);
  if (profile?.favoriteBrands?.length) details.push(`Favorite brands: ${profile.favoriteBrands.join(", ")}`);
  if (profile?.brandsToAvoid?.length) details.push(`Brands to avoid: ${profile.brandsToAvoid.join(", ")}`);
  if (profile?.stylePrefs?.length) details.push(`Style preferences: ${profile.stylePrefs.join(", ")}`);

  return [
    `You are a fashion concierge. Current topic: ${topic}. Answer concisely. Keep your responses super concise.`,
    "Personalization is enabled. Use the user's saved profile details only when relevant and do not invent missing values.",
    details.length > 0 ? `Saved profile details:\n- ${details.join("\n- ")}` : "Saved profile details: none available yet.",
  ].join("\n");
}

export function ChatPanel({ onClose, topSlot, inputTopSlot }: ChatPanelProps) {
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [personalizeEnabled, setPersonalizeEnabled] = useState(false);
  const [searchCountry, setSearchCountry] = useState<string>("in");
  const [openingProductPosition, setOpeningProductPosition] = useState<number | null>(null);
  const [openingTryOnId, setOpeningTryOnId] = useState<string | null>(null);
  const [tryOnPosition, setTryOnPosition] = useState<number | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadImageError, setUploadImageError] = useState<string | null>(null);
  const [savedAssetsOpen, setSavedAssetsOpen] = useState(false);
  const [savedAssetsLoading, setSavedAssetsLoading] = useState(false);
  const [savedAssetsError, setSavedAssetsError] = useState<string | null>(null);
  const [savedAssets, setSavedAssets] = useState<SavedProfileAsset[]>([]);
  const [applyingSavedAssetId, setApplyingSavedAssetId] = useState<string | null>(null);
  const [tryOnViewerIndex, setTryOnViewerIndex] = useState<number | null>(null);
  const [assistantMode, setAssistantMode] = useState<"chat" | "avatar">("chat");
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [avatarLastSpokenAt, setAvatarLastSpokenAt] = useState<Date | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const searchParams = useSearchParams();
  const avatarModeFromUrl = searchParams.get("mode")?.trim().toLowerCase();
  const { supported: avatarSpeechSupported, speaking: avatarSpeaking, error: avatarSpeechError, speak: avatarSpeak, stop: avatarStop } = useAvatarSpeech();
  const {
    chatMessages,
    setChatMessages,
    currentTopic,
    setCurrentTopic,
    currentSessionId,
    setCurrentSessionId,
    profile,
    setProfile,
    setTryOnResultImage,
    setTryOnProduct,
    tryOnError,
    setTryOnError,
    clearChat,
  } = useStore();

  const sessionIdFromUrl = searchParams.get("sessionId")?.trim() || null;

  useEffect(() => {
    let cancelled = false;
    async function initSession() {
      const toLoad = sessionIdFromUrl || currentSessionId;
      const url = toLoad
        ? `/api/sessions/current?sessionId=${encodeURIComponent(toLoad)}`
        : "/api/sessions/current";
      try {
        const res = await fetch(url);
        if (!res.ok || cancelled) return;
        const data = (await res.json()) as {
          sessionId: string;
          messages?: ChatMessage[];
          currentTopic?: string | null;
          title?: string;
        };
        if (cancelled) return;
        setCurrentSessionId(data.sessionId);
        setChatMessages(data.messages ?? []);
        if (data.currentTopic) setCurrentTopic(data.currentTopic as Topic);
        else setCurrentTopic(null);
      } catch {
        if (!cancelled) setCurrentSessionId(crypto.randomUUID());
      }
    }
    initSession();
    return () => {
      cancelled = true;
    };
  }, [sessionIdFromUrl, setCurrentSessionId, setChatMessages, setCurrentTopic]);

  useEffect(() => {
    setAssistantMode(avatarModeFromUrl === "avatar" ? "avatar" : "chat");
  }, [avatarModeFromUrl]);

  useEffect(() => {
    return () => avatarStop();
  }, [avatarStop]);

  useEffect(() => {
    if (assistantMode === "chat") avatarStop();
  }, [assistantMode, avatarStop]);

  useEffect(() => {
    if (!currentSessionId || chatMessages.length === 0) return;
    const t = setTimeout(() => {
      fetch(`/api/sessions/${currentSessionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: chatMessages,
          currentTopic,
          title: chatMessages[0]?.role === "user" ? (chatMessages[0]?.content?.slice(0, 50) ?? "New Chat") : "New Chat",
        }),
      })
        .then((res) => {
          if (!res.ok) {
            console.error("[sessions autosave]", res.status);
          }
        })
        .catch(() => {});
    }, 800);
    return () => clearTimeout(t);
  }, [currentSessionId, chatMessages, currentTopic]);

  const handleNewChat = useCallback(async () => {
    try {
      const res = await fetch("/api/sessions", { method: "POST" });
      if (!res.ok) return;
      const data = (await res.json()) as { sessionId: string };
      setCurrentSessionId(data.sessionId);
      clearChat();
    } catch {
      setCurrentSessionId(crypto.randomUUID());
      clearChat();
    }
  }, [setCurrentSessionId, clearChat]);

  const handleUnifiedSubmit = useCallback(async () => {
    const text = input.trim();
    if (!text || sending) return;
    setInput("");
    setAvatarError(null);
    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
    };
    setChatMessages((prev) => [...prev, userMsg]);
    setSending(true);
    try {
      if (assistantMode === "avatar") {
        const topic = detectTopicFromMessage(text);
        setCurrentTopic(topic);
        const res = await sendChat(text, topic, AVATAR_SYSTEM_PROMPT, currentSessionId ?? undefined);
        setCurrentTopic(res.topic as Topic);
        avatarSpeak(res.message);
        setAvatarLastSpokenAt(new Date());
        return;
      }

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
        const systemPrompt = personalizeEnabled ? buildPersonalizedSystemPrompt(topic, profile) : undefined;
        const res = await sendChat(text, topic, systemPrompt, currentSessionId ?? undefined);
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
      if (assistantMode === "avatar") {
        setAvatarError(err instanceof Error ? err.message : "Avatar response failed.");
      } else {
        setChatMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content: "Sorry, I couldn’t reach the server. Try again.",
          },
        ]);
      }
    } finally {
      setSending(false);
    }
  }, [input, sending, assistantMode, searchCountry, currentSessionId, personalizeEnabled, profile, setChatMessages, setCurrentTopic, avatarSpeak]);

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
            bodyMeasurements: personalizeEnabled ? cleanMeasurements(profile) : undefined,
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
    [profile, personalizeEnabled, setChatMessages, setTryOnResultImage, setTryOnProduct]
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

  const loadSavedAssets = useCallback(async () => {
    setSavedAssetsLoading(true);
    setSavedAssetsError(null);
    try {
      const assets = await getSavedProfileAssets();
      setSavedAssets(assets);
    } catch (err) {
      setSavedAssetsError(err instanceof Error ? err.message : "Failed to load saved assets");
    } finally {
      setSavedAssetsLoading(false);
    }
  }, []);

  const openSavedAssets = useCallback(() => {
    setSavedAssetsOpen(true);
    void loadSavedAssets();
  }, [loadSavedAssets]);

  const applySavedAsset = useCallback(
    async (asset: SavedProfileAsset) => {
      setApplyingSavedAssetId(asset.id);
      setUploadImageError(null);
      try {
        const current = await getProfile();
        const next = { ...(current ?? {}), profile_image: asset.url };
        await saveProfile(next);
        setProfile(next);
        setSavedAssetsOpen(false);
      } catch (err) {
        setUploadImageError(err instanceof Error ? err.message : "Failed to apply saved image");
      } finally {
        setApplyingSavedAssetId(null);
      }
    },
    [setProfile]
  );

  useEffect(() => {
    if (!savedAssetsOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSavedAssetsOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [savedAssetsOpen]);

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
        void loadSavedAssets();
      } catch (err) {
        setUploadImageError(err instanceof Error ? err.message : "Upload failed");
      } finally {
        setUploadingImage(false);
      }
    },
    [setProfile, loadSavedAssets]
  );

  const tryOnViewerItems = useMemo(
    () =>
      chatMessages
        .filter(
          (m): m is ChatMessage & { tryOnResultImage: string } =>
            m.type === "try-on" && typeof m.tryOnResultImage === "string" && m.tryOnResultImage.trim().length > 0
        )
        .map((m, idx) => ({
          messageId: m.id,
          url: m.tryOnResultImage,
          title: m.tryOnProduct?.title || "Try-On Result",
          subtitle: [m.tryOnProduct?.source, m.tryOnProduct?.price].filter(Boolean).join(" · "),
          downloadName: `try-on-${idx + 1}.png`,
        })),
    [chatMessages]
  );

  const openTryOnViewer = useCallback(
    (messageId: string) => {
      const index = tryOnViewerItems.findIndex((item) => item.messageId === messageId);
      if (index >= 0) setTryOnViewerIndex(index);
    },
    [tryOnViewerItems]
  );

  return (
    <div className="flex flex-col h-full min-h-0 min-w-0 overflow-hidden">
      {/* Scrollable content */}
      <div className="flex-1 min-h-0 min-w-0 overflow-y-auto overflow-x-hidden p-3 sm:p-4 space-y-2.5 overscroll-contain">
        {topSlot}
        {chatMessages.length > 0 && (
          <div className="flex justify-end -mt-1 mb-1">
            <button
              type="button"
              onClick={handleNewChat}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-accent hover:bg-accent/10 border border-accent/30 transition-colors"
            >
              New Chat
            </button>
          </div>
        )}
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
              <div className="max-w-[90%] sm:max-w-[85%] rounded-2xl px-3 sm:px-4 py-2.5 break-words bg-gradient-to-br from-accent to-accent-dark text-white shadow-[0_10px_24px_rgba(79,70,229,0.38)] border border-accent/70">
                <ChatRichText content={m.content} variant="user" />
              </div>
            ) : m.type === "try-on" && m.tryOnResultImage && m.tryOnProduct ? (
              <div className="max-w-full rounded-2xl glass-card p-4 sm:p-5">
                <div className="flex items-center gap-2 mb-4">
                  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-semibold">
                    <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                    Try-On Result
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row gap-5">
                  <div className="shrink-0">
                    <button
                      type="button"
                      onClick={() => openTryOnViewer(m.id)}
                      className="block rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/60"
                    >
                      <img
                        src={m.tryOnResultImage}
                        alt="Try-on result"
                        className="max-h-[280px] sm:max-h-[320px] w-auto object-contain rounded-xl border border-zinc-200 dark:border-zinc-700"
                      />
                    </button>
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
                <div className="rounded-2xl px-3 sm:px-4 py-2.5 text-sm glass-bubble text-zinc-900 dark:text-zinc-100">
                  <p className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400 mb-1">Concierge</p>
                  <ChatRichText content={m.content} variant="assistant" />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {m.searchResults.slice(0, 12).map((r) => {
                    const opening = openingProductPosition === r.position;
                    const tryingOn = tryOnPosition === r.position;
                    return (
                      <div
                        key={r.position}
                        className="flex gap-3 rounded-xl glass-section p-3 hover:border-accent/50 transition-colors"
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
              <div className="max-w-[90%] sm:max-w-[85%] rounded-2xl px-3 sm:px-4 py-2.5 text-sm break-words glass-bubble text-zinc-900 dark:text-zinc-100">
                {m.role === "assistant" && (
                  <p className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400 mb-1">Concierge</p>
                )}
                <ChatRichText content={m.content} variant="assistant" />
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
        {sending && assistantMode === "chat" && (
          <div className="flex justify-start gap-2">
            <div className="shrink-0 w-7 h-7 rounded-full bg-accent/20 flex items-center justify-center mt-0.5" aria-hidden>
              <span className="text-accent text-xs font-bold">AI</span>
            </div>
            <div className="rounded-2xl px-3 sm:px-4 py-2.5 glass-bubble text-sm text-zinc-500">
              …
            </div>
          </div>
        )}
      </div>

      {/* Thin bottom bar: options + input (chatbox style) — solid bg + z-10 on mobile so nothing overlaps */}
      <div className="shrink-0 relative z-10 isolate rounded-2xl glass-card mx-2 sm:mx-0 mb-2 sm:mb-3 mb-[max(0.5rem,env(safe-area-inset-bottom))] p-2 sm:p-2.5 space-y-2">
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
          <button
            type="button"
            onClick={openSavedAssets}
            className="flex items-center gap-1.5 min-h-[38px] px-2.5 rounded-lg border border-zinc-200 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-xs font-medium transition-colors shrink-0 touch-manipulation"
            title="Open saved profile assets"
          >
            Saved Assets
          </button>
          {uploadImageError && (
            <p className="text-[10px] text-red-600 dark:text-red-400 shrink-0 whitespace-nowrap">{uploadImageError}</p>
          )}
          <div className="flex-1 min-w-[80px]" />
          {assistantMode === "chat" && (
            <div className="flex gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setPersonalizeEnabled((prev) => !prev)}
              role="switch"
              aria-checked={personalizeEnabled}
              aria-label="Personalize"
              className="inline-flex items-center gap-2 px-2 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-600 min-h-[38px] sm:min-h-0"
            >
              <span className="text-[11px] font-medium">Personalize</span>
              <span
                className={`relative inline-flex h-5 w-9 rounded-full transition-colors ${personalizeEnabled ? "bg-accent" : "bg-zinc-300 dark:bg-zinc-500"}`}
                aria-hidden
              >
                <span
                  className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${personalizeEnabled ? "translate-x-4.5" : "translate-x-0.5"}`}
                />
              </span>
            </button>
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
          )}
        </div>
        {inputTopSlot}
        <div className="flex items-center justify-between gap-2">
          <div className="inline-flex rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-100/80 dark:bg-zinc-800/70 p-1">
            <button
              type="button"
              onClick={() => setAssistantMode("chat")}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                assistantMode === "chat"
                  ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm"
                  : "text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white"
              }`}
            >
              Chat
            </button>
            <button
              type="button"
              onClick={() => setAssistantMode("avatar")}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                assistantMode === "avatar"
                  ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm"
                  : "text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white"
              }`}
            >
              Avatar
            </button>
          </div>
          {assistantMode === "avatar" && (
            <span className={`text-[11px] px-2.5 py-1 rounded-full border ${
              sending
                ? "bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-900/30 dark:border-amber-800 dark:text-amber-300"
                : avatarSpeaking
                ? "bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-900/30 dark:border-indigo-800 dark:text-indigo-300"
                : "bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-900/30 dark:border-emerald-800 dark:text-emerald-300"
            }`}>
              {sending ? "Thinking..." : avatarSpeaking ? "Speaking..." : "Ready"}
            </span>
          )}
        </div>
        {assistantMode === "avatar" && (
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50/60 dark:bg-zinc-800/50 p-2 sm:p-2.5 space-y-2">
            <AvatarStage speaking={avatarSpeaking} thinking={sending} />
            <div className="flex flex-wrap items-center gap-2 text-[11px]">
              {!avatarSpeechSupported && (
                <span className="text-red-600 dark:text-red-400">
                  Browser does not support text-to-speech.
                </span>
              )}
              {avatarLastSpokenAt && !sending && (
                <span className="text-zinc-500 dark:text-zinc-400">
                  Last spoken: {avatarLastSpokenAt.toLocaleTimeString()}
                </span>
              )}
            </div>
          </div>
        )}
        {/* Input row */}
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleUnifiedSubmit()}
            placeholder={assistantMode === "avatar" ? "Ask your avatar concierge…" : "Ask or search for products…"}
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
        {(avatarError || avatarSpeechError) && (
          <p className="text-[11px] text-red-600 dark:text-red-400 px-1 pt-0.5">
            Avatar: {avatarError ?? avatarSpeechError}
          </p>
        )}
      </div>

      <AssetViewerModal
        isOpen={tryOnViewerIndex != null}
        assets={tryOnViewerItems.map(({ messageId: _id, ...item }) => item)}
        initialIndex={tryOnViewerIndex ?? 0}
        onClose={() => setTryOnViewerIndex(null)}
      />

      {savedAssetsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Close saved assets"
            className="absolute inset-0 bg-black/50"
            onClick={() => setSavedAssetsOpen(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Saved Assets"
            className="relative z-10 w-full max-w-2xl max-h-[80vh] overflow-hidden rounded-2xl glass-card shadow-2xl"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-200 dark:border-zinc-700">
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Saved Assets</h3>
              <button
                type="button"
                className="px-2 py-1 rounded-lg text-xs text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                onClick={() => setSavedAssetsOpen(false)}
              >
                Close
              </button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[calc(80vh-56px)]">
              {savedAssetsLoading ? (
                <p className="text-sm text-zinc-500 dark:text-zinc-400">Loading saved assets…</p>
              ) : savedAssetsError ? (
                <p className="text-sm text-red-600 dark:text-red-400">{savedAssetsError}</p>
              ) : savedAssets.length === 0 ? (
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  No saved profile images yet. Upload one from the chat toolbar.
                </p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {savedAssets.map((asset) => {
                    const isCurrent = profile?.profile_image === asset.url;
                    const applying = applyingSavedAssetId === asset.id;
                    return (
                      <button
                        key={asset.id}
                        type="button"
                        onClick={() => applySavedAsset(asset)}
                        disabled={applying}
                        className={`text-left rounded-xl border overflow-hidden transition-colors ${
                          isCurrent
                            ? "border-accent ring-1 ring-accent/40"
                            : "border-zinc-200 dark:border-zinc-700 hover:border-accent/60"
                        } ${applying ? "opacity-60" : ""}`}
                      >
                        <div className="aspect-square bg-zinc-100 dark:bg-zinc-800">
                          <img
                            src={`/api/profile-image?url=${encodeURIComponent(asset.url)}`}
                            alt="Saved profile asset"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="px-2.5 py-2">
                          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                            {new Date(asset.createdAt).toLocaleString()}
                          </p>
                          <p className="text-xs font-medium text-zinc-900 dark:text-zinc-100 mt-0.5">
                            {isCurrent ? "Current image" : applying ? "Applying…" : "Use this image"}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
