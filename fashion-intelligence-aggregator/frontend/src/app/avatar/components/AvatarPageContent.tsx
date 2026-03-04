"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useStore } from "@/state/store";
import { sendChat } from "@/lib/api";
import { detectTopicFromMessage } from "@/lib/topicDetection";
import { ChatModeToggle } from "./ChatModeToggle";
import { AvatarStage } from "./AvatarStage";
import { useAvatarSpeech } from "../hooks/useAvatarSpeech";

interface AvatarTurn {
  id: string;
  role: "user";
  text: string;
}

const AVATAR_SESSION_KEY = "fia_avatar_session_id";

function getOrCreateAvatarSessionId(): string {
  if (typeof window === "undefined") return crypto.randomUUID();
  let id = window.localStorage.getItem(AVATAR_SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    window.localStorage.setItem(AVATAR_SESSION_KEY, id);
  }
  return id;
}

export function AvatarPageContent() {
  const { setChatOpen } = useStore();
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string>("");
  const [turns, setTurns] = useState<AvatarTurn[]>([]);
  const [lastSpokenAt, setLastSpokenAt] = useState<Date | null>(null);
  const { supported, speaking, error: speechError, speak, stop } = useAvatarSpeech();

  useEffect(() => {
    setSessionId(getOrCreateAvatarSessionId());
    setChatOpen(false);
    return () => {
      setChatOpen(false);
      stop();
    };
  }, [setChatOpen, stop]);

  const avatarSystemPrompt = useMemo(
    () =>
      [
        "You are a fashion concierge avatar.",
        "Keep your responses super concise, conversational, and easy to speak.",
        "Use maximum 2 short sentences.",
        "No markdown or bullet points in responses.",
      ].join(" "),
    []
  );

  const handleSubmit = useCallback(async () => {
    const text = input.trim();
    if (!text || sending) return;

    setInput("");
    setError(null);
    setTurns((prev) => [...prev, { id: crypto.randomUUID(), role: "user", text }]);
    setSending(true);

    try {
      const topic = detectTopicFromMessage(text);
      const response = await sendChat(text, topic, avatarSystemPrompt, sessionId || undefined);
      speak(response.message);
      setLastSpokenAt(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Avatar reply failed.");
    } finally {
      setSending(false);
    }
  }, [avatarSystemPrompt, input, sending, sessionId, speak]);

  const statusText = sending
    ? "Thinking..."
    : speaking
    ? "Speaking..."
    : "Ready";

  return (
    <div className="mx-auto w-full max-w-[100vw] sm:max-w-6xl h-[calc(100dvh-4rem-2rem)] min-h-[320px] sm:min-h-[540px] flex flex-col px-4 sm:px-6 overflow-hidden">
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-[1.15fr_1fr] gap-4 overflow-hidden">
        <div className="min-h-0 overflow-hidden flex flex-col">
          <AvatarStage speaking={speaking} thinking={sending} />
          <div className="mt-3 flex items-center gap-2 text-xs">
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border ${
                sending
                  ? "bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-900/30 dark:border-amber-800 dark:text-amber-300"
                  : speaking
                  ? "bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-900/30 dark:border-indigo-800 dark:text-indigo-300"
                  : "bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-900/30 dark:border-emerald-800 dark:text-emerald-300"
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  sending ? "bg-amber-500 animate-pulse" : speaking ? "bg-indigo-500 animate-pulse" : "bg-emerald-500"
                }`}
              />
              {statusText}
            </span>
            {!supported && (
              <span className="text-red-600 dark:text-red-400">
                Browser does not support text-to-speech.
              </span>
            )}
            {lastSpokenAt && !sending && (
              <span className="text-zinc-500 dark:text-zinc-400">
                Last reply: {lastSpokenAt.toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>

        <div className="min-h-0 flex flex-col overflow-hidden">
          <div className="flex-1 min-h-0 overflow-y-auto rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-3 sm:p-4 space-y-2">
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Avatar mode: replies are spoken instead of rendered as assistant message bubbles.
            </p>
            {turns.length === 0 ? (
              <p className="text-sm text-zinc-500 dark:text-zinc-400 pt-1">
                Ask your fashion question and the avatar will answer out loud.
              </p>
            ) : (
              turns.map((turn) => (
                <div
                  key={turn.id}
                  className="ml-auto max-w-[90%] rounded-2xl px-3 sm:px-4 py-2.5 break-words bg-gradient-to-br from-accent to-accent-dark text-white shadow-[0_10px_24px_rgba(79,70,229,0.38)] border border-accent/70 text-sm"
                >
                  {turn.text}
                </div>
              ))
            )}
            {(error || speechError) && (
              <p className="text-sm text-red-600 dark:text-red-400">{error ?? speechError}</p>
            )}
          </div>

          <div className="mt-3 shrink-0 relative z-10 isolate rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 backdrop-blur-sm shadow-[0_-2px_12px_rgba(0,0,0,0.06)] dark:shadow-[0_-2px_12px_rgba(0,0,0,0.2)] p-2.5 space-y-2">
            <div className="flex justify-center sm:justify-start">
              <ChatModeToggle mode="avatar" />
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                placeholder="Talk to your avatar concierge…"
                className="flex-1 min-w-0 min-h-[44px] sm:min-h-[38px] rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/80 px-3 py-2.5 sm:py-2 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
              />
              <button
                type="button"
                onClick={handleSubmit}
                disabled={sending || !input.trim()}
                className="min-h-[44px] sm:min-h-[38px] px-4 rounded-xl bg-accent text-white text-sm font-medium disabled:opacity-50 hover:bg-accent/90 active:bg-accent/80 transition-colors shrink-0"
              >
                {sending ? "…" : "Send"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
