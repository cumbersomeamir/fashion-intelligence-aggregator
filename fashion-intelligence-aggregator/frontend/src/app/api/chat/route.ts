import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import Redis from "ioredis";
import { memoryStore } from "./memory";

// ---- COST CONTROLS ----
const MAX_TURNS = 10;
const MAX_MESSAGES = MAX_TURNS * 2;
const MAX_CHARS_PER_MSG = 1200;
const MAX_OUTPUT_TOKENS = 350;
const TEMPERATURE = 0.4;
const MODEL = "gemini-2.0-flash";

const keyHistory = (sessionId: string) => `chat:${sessionId}:history`;
const keySummary = (sessionId: string) => `chat:${sessionId}:summary`;
const TTL_SEC = 60 * 60 * 24 * 7; // 7 days

function clip(text: string, maxChars: number): string {
  if (!text) return "";
  return text.length > maxChars ? text.slice(0, maxChars) : text;
}

function safeTextFromResp(resp: { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> }): string {
  const parts = resp?.candidates?.[0]?.content?.parts ?? [];
  return parts.map((p) => p.text ?? "").join("").trim();
}

type HistoryEntry = { role: string; parts: Array<{ text: string }> };

async function getRedis(): Promise<Redis | null> {
  const url = process.env.REDIS_URL;
  if (!url) return null;
  try {
    return new Redis(url);
  } catch {
    return null;
  }
}

async function loadHistory(sessionId: string): Promise<HistoryEntry[]> {
  const redis = await getRedis();
  if (redis) {
    try {
      const raw = await redis.get(keyHistory(sessionId));
      await redis.quit();
      return raw ? JSON.parse(raw) : [];
    } catch {
      await redis.quit();
    }
  }
  const raw = await memoryStore.get(keyHistory(sessionId));
  return raw ? JSON.parse(raw) : [];
}

async function saveHistory(sessionId: string, history: HistoryEntry[]): Promise<void> {
  const val = JSON.stringify(history);
  const redis = await getRedis();
  if (redis) {
    try {
      await redis.set(keyHistory(sessionId), val, "EX", TTL_SEC);
      await redis.quit();
      return;
    } catch {
      await redis.quit();
    }
  }
  await memoryStore.set(keyHistory(sessionId), val);
}

async function loadSummary(sessionId: string): Promise<string> {
  const redis = await getRedis();
  if (redis) {
    try {
      const s = await redis.get(keySummary(sessionId));
      await redis.quit();
      return s ?? "";
    } catch {
      await redis.quit();
    }
  }
  return (await memoryStore.get(keySummary(sessionId))) ?? "";
}

async function saveSummary(sessionId: string, summaryText: string): Promise<void> {
  const redis = await getRedis();
  if (redis) {
    try {
      await redis.set(keySummary(sessionId), summaryText, "EX", TTL_SEC);
      await redis.quit();
      return;
    } catch {
      await redis.quit();
    }
  }
  await memoryStore.set(keySummary(sessionId), summaryText);
}

function trimToLastMessages(history: HistoryEntry[]): HistoryEntry[] {
  if (history.length > MAX_MESSAGES) return history.slice(-MAX_MESSAGES);
  return history;
}

/** Optional: compress older history into summary when it exceeds MAX_MESSAGES. */
async function maybeSummarize(params: {
  ai: InstanceType<typeof GoogleGenAI>;
  sessionId: string;
  history: HistoryEntry[];
}): Promise<{ history: HistoryEntry[]; summary: string }> {
  const { ai, sessionId, history } = params;
  if (history.length <= MAX_MESSAGES) {
    return { history, summary: await loadSummary(sessionId) };
  }

  const existingSummary = await loadSummary(sessionId);
  const overflowCount = history.length - MAX_MESSAGES;
  const toSummarize = history.slice(0, overflowCount);
  const keep = history.slice(overflowCount);

  const summarizeContents: HistoryEntry[] = [];
  if (existingSummary) {
    summarizeContents.push({
      role: "user",
      parts: [{ text: `Existing summary:\n${existingSummary}` }],
    });
  }
  summarizeContents.push({
    role: "user",
    parts: [
      {
        text:
          "Summarize the following conversation history into bullet points of stable facts, preferences, decisions, and open tasks. " +
          "Be concise. Do NOT include chatter.\n\n" +
          JSON.stringify(toSummarize),
      },
    ],
  });

  const resp = await ai.models.generateContent({
    model: MODEL,
    contents: summarizeContents,
    config: {
      temperature: 0.2,
      maxOutputTokens: 220,
    } as { temperature: number; maxOutputTokens: number },
  });

  const newSummary = safeTextFromResp(resp as Parameters<typeof safeTextFromResp>[0]);
  const mergedSummary = existingSummary ? `${existingSummary}\n${newSummary}` : newSummary;
  await saveSummary(sessionId, mergedSummary);
  return { history: keep, summary: mergedSummary };
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "GEMINI_API_KEY not configured" }, { status: 500 });
  }

  let body: { sessionId?: string; message?: string; system?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { sessionId, message, system } = body;
  if (!sessionId || !message) {
    return NextResponse.json({ error: "sessionId and message required" }, { status: 400 });
  }

  const ai = new GoogleGenAI({ apiKey });

  let history = await loadHistory(sessionId);
  history.push({
    role: "user",
    parts: [{ text: clip(message, MAX_CHARS_PER_MSG) }],
  });
  history = trimToLastMessages(history);

  const { history: compressedHistory, summary } = await maybeSummarize({
    ai,
    sessionId,
    history,
  });

  const contents: HistoryEntry[] = [];
  if (system) {
    contents.push({ role: "user", parts: [{ text: `Instruction:\n${clip(system, 800)}` }] });
  }
  if (summary) {
    contents.push({
      role: "user",
      parts: [{ text: `Conversation summary (memory):\n${summary}` }],
    });
  }
  contents.push(...compressedHistory);

  try {
    const resp = await ai.models.generateContent({
      model: MODEL,
      contents,
      config: {
        temperature: TEMPERATURE,
        maxOutputTokens: MAX_OUTPUT_TOKENS,
      } as { temperature: number; maxOutputTokens: number },
    });

    const text =
      typeof (resp as { text?: string }).text === "string"
        ? (resp as { text: string }).text
        : safeTextFromResp(resp as Parameters<typeof safeTextFromResp>[0]);

    compressedHistory.push({
      role: "model",
      parts: [{ text: clip(text, 2000) }],
    });
    const finalHistory = trimToLastMessages(compressedHistory);
    await saveHistory(sessionId, finalHistory);

    const usage = (resp as { usageMetadata?: unknown }).usageMetadata;

    return NextResponse.json({
      message: text,
      topic: "Style",
      citations: [] as string[],
      usage,
      text,
    });
  } catch (err) {
    console.error("Gemini chat error:", err);
    return NextResponse.json(
      { error: "Chat failed", message: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
