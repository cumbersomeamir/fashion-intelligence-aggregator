"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AssetViewerModal } from "@/components/AssetViewerModal";

interface SessionItem {
  sessionId: string;
  title: string;
  preview: string;
  messageCount: number;
  currentTopic: string | null;
  createdAt: string;
  updatedAt: string;
  lastActivityAt: string;
}

interface TryOnAssetItem {
  id: string;
  sessionId: string;
  sessionTitle: string;
  image: string;
  productTitle: string;
  productSource: string;
  productPrice: string;
  lastActivityAt: string;
}

export function HistoryContent() {
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [assets, setAssets] = useState<TryOnAssetItem[]>([]);
  const [assetsLoading, setAssetsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"chat" | "assets">("chat");
  const [assetViewerIndex, setAssetViewerIndex] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/sessions")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load");
        return res.json();
      })
      .then((data) => {
        setSessions(data.sessions ?? []);
      })
      .catch(() => setSessions([]))
      .finally(() => setSessionsLoading(false));
  }, []);

  useEffect(() => {
    fetch("/api/history/assets")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load");
        return res.json();
      })
      .then((data) => {
        setAssets(data.assets ?? []);
      })
      .catch(() => setAssets([]))
      .finally(() => setAssetsLoading(false));
  }, []);

  const assetViewerItems = assets.map((asset, idx) => ({
    url: asset.image,
    title: asset.productTitle || "Generated Try-On",
    subtitle: [asset.productSource, asset.productPrice].filter(Boolean).join(" · "),
    downloadName: `try-on-${idx + 1}.png`,
  }));

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 60 * 60 * 1000) return "Just now";
    if (diff < 24 * 60 * 60 * 1000) return `${Math.floor(diff / (60 * 60 * 1000))}h ago`;
    if (diff < 7 * 24 * 60 * 60 * 1000) return `${Math.floor(diff / (24 * 60 * 60 * 1000))}d ago`;
    return d.toLocaleDateString();
  };

  const loading = activeTab === "chat" ? sessionsLoading : assetsLoading;

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-4 sm:px-6 py-12">
        <div className="flex items-center justify-center py-20">
          <div className="animate-pulse flex flex-col items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/20" />
            <p className="text-sm text-zinc-500">
              {activeTab === "chat" ? "Loading sessions…" : "Loading assets…"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-12">
      <h1 className="font-headline font-semibold text-xl sm:text-2xl text-zinc-900 dark:text-white mb-2">
        History
      </h1>
      <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">
        View past chats and generated try-on assets.
      </p>
      <div className="mb-8 inline-flex rounded-xl glass-section p-1">
        <button
          type="button"
          onClick={() => setActiveTab("chat")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === "chat"
              ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm"
              : "text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white"
          }`}
        >
          Chats
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("assets")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === "assets"
              ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm"
              : "text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white"
          }`}
        >
          Assets
        </button>
      </div>

      {activeTab === "chat" ? (
        sessions.length === 0 ? (
          <div className="rounded-2xl glass-card p-12 text-center">
            <p className="text-zinc-500 dark:text-zinc-400 text-sm">
              No chat sessions yet. Start a conversation on the Chat page.
            </p>
            <Link
              href="/chat"
              className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent text-white text-sm font-medium hover:bg-accent/90 transition-colors"
            >
              Go to Chat
            </Link>
          </div>
        ) : (
          <ul className="space-y-2">
            {sessions.map((s) => (
              <li key={s.sessionId}>
                <Link
                  href={`/chat?sessionId=${encodeURIComponent(s.sessionId)}`}
                  className="block rounded-xl glass-section p-4 hover:border-accent/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-zinc-900 dark:text-white truncate">
                        {s.title || "New Chat"}
                      </p>
                      {s.preview && (
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 truncate">
                          {s.preview}
                        </p>
                      )}
                      <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1.5">
                        {s.messageCount} message{s.messageCount !== 1 ? "s" : ""} · {formatDate(s.lastActivityAt)}
                      </p>
                    </div>
                    <span className="shrink-0 text-accent text-sm">→</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )
      ) : assets.length === 0 ? (
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/30 p-12 text-center">
          <p className="text-zinc-500 dark:text-zinc-400 text-sm">
            No try-on assets found yet. Generate a try-on from chat results and it will appear here.
          </p>
          <Link
            href="/chat"
            className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent text-white text-sm font-medium hover:bg-accent/90 transition-colors"
          >
            Go to Chat
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {assets.map((asset, index) => (
            <div
              key={asset.id}
              className="rounded-xl glass-section p-3"
            >
              <button
                type="button"
                onClick={() => setAssetViewerIndex(index)}
                className="block w-full text-left rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-accent/60"
              >
                <div className="aspect-square">
                  <img src={asset.image} alt={asset.productTitle || "Try-on asset"} className="w-full h-full object-cover" />
                </div>
              </button>
              <div className="mt-2.5 space-y-1">
                <p className="text-xs font-medium text-zinc-900 dark:text-white line-clamp-1">
                  {asset.productTitle || "Generated Try-On"}
                </p>
                {(asset.productSource || asset.productPrice) && (
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-1">
                    {[asset.productSource, asset.productPrice].filter(Boolean).join(" · ")}
                  </p>
                )}
                <p className="text-[10px] text-zinc-400 dark:text-zinc-500">
                  {formatDate(asset.lastActivityAt)}
                </p>
                <Link
                  href={`/chat?sessionId=${encodeURIComponent(asset.sessionId)}`}
                  className="inline-flex items-center text-xs font-medium text-accent hover:underline"
                >
                  Open source chat
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      <AssetViewerModal
        isOpen={assetViewerIndex != null}
        assets={assetViewerItems}
        initialIndex={assetViewerIndex ?? 0}
        onClose={() => setAssetViewerIndex(null)}
      />
    </div>
  );
}
