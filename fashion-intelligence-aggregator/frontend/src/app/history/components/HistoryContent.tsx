"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

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

export function HistoryContent() {
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [loading, setLoading] = useState(true);

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
      .finally(() => setLoading(false));
  }, []);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 60 * 60 * 1000) return "Just now";
    if (diff < 24 * 60 * 60 * 1000) return `${Math.floor(diff / (60 * 60 * 1000))}h ago`;
    if (diff < 7 * 24 * 60 * 60 * 1000) return `${Math.floor(diff / (24 * 60 * 60 * 1000))}d ago`;
    return d.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-4 sm:px-6 py-12">
        <div className="flex items-center justify-center py-20">
          <div className="animate-pulse flex flex-col items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/20" />
            <p className="text-sm text-zinc-500">Loading sessions…</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-12">
      <h1 className="font-headline font-semibold text-xl sm:text-2xl text-zinc-900 dark:text-white mb-2">
        Chat History
      </h1>
      <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-8">
        Open a previous chat to continue the conversation.
      </p>

      {sessions.length === 0 ? (
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/30 p-12 text-center">
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
                className="block rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/80 p-4 hover:border-accent/50 hover:bg-accent/5 dark:hover:bg-accent/10 transition-colors"
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
      )}
    </div>
  );
}
