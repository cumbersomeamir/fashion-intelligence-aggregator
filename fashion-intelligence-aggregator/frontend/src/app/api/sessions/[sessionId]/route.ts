import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { connectMongo } from "@/lib/db";
import { SessionModel } from "@/lib/sessionModel";
import { authOptions } from "@/lib/authOptions";
import { getSessionUserId } from "@/lib/sessionUserId";
import type { ChatMessage } from "@/types";

const MAX_SEARCH_RESULTS_PER_MESSAGE = 12;
const SOFT_MAX_SESSION_BYTES = 12 * 1024 * 1024;

function approximateBytes(value: unknown): number {
  return Buffer.byteLength(JSON.stringify(value ?? null), "utf8");
}

function sanitizeMessages(messages: ChatMessage[]): ChatMessage[] {
  return messages.map((message) => {
    const next: ChatMessage = { ...message };
    if (Array.isArray(next.searchResults) && next.searchResults.length > MAX_SEARCH_RESULTS_PER_MESSAGE) {
      next.searchResults = next.searchResults.slice(0, MAX_SEARCH_RESULTS_PER_MESSAGE);
    }
    return next;
  });
}

function fitMessagesToBudget(messages: ChatMessage[]): ChatMessage[] {
  const next = messages.map((m) => ({ ...m }));
  if (approximateBytes(next) <= SOFT_MAX_SESSION_BYTES) return next;

  for (let i = 0; i < next.length && approximateBytes(next) > SOFT_MAX_SESSION_BYTES; i += 1) {
    const msg = next[i];
    if (msg.type === "try-on" && typeof msg.tryOnResultImage === "string" && msg.tryOnResultImage.length > 0) {
      next[i] = { ...msg, tryOnResultImage: undefined };
    }
  }

  while (next.length > 1 && approximateBytes(next) > SOFT_MAX_SESSION_BYTES) {
    next.shift();
  }
  return next;
}

/** GET /api/sessions/:sessionId - Fetch one session */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const session = await getServerSession(authOptions);
  const userId = getSessionUserId(session);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { sessionId } = await params;
  if (!sessionId) {
    return NextResponse.json({ error: "sessionId required" }, { status: 400 });
  }

  try {
    await connectMongo();
    const doc = await SessionModel.findOne({
      sessionId,
      userId,
    }).lean();

    if (!doc) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    return NextResponse.json({
      sessionId: doc.sessionId,
      title: doc.title ?? "New Chat",
      messages: doc.messages ?? [],
      currentTopic: doc.currentTopic ?? null,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  } catch (err) {
    console.error("[sessions/:sessionId GET]", err);
    return NextResponse.json({ error: "Failed to fetch session" }, { status: 500 });
  }
}

/** PATCH /api/sessions/:sessionId - Update session (messages, title, topic) */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const session = await getServerSession(authOptions);
  const userId = getSessionUserId(session);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { sessionId } = await params;
  if (!sessionId) {
    return NextResponse.json({ error: "sessionId required" }, { status: 400 });
  }

  let body: { messages?: ChatMessage[]; title?: string; currentTopic?: string | null };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  try {
    await connectMongo();

    const update: Record<string, unknown> = {
      lastActivityAt: new Date(),
    };

    if (body.messages !== undefined) {
      const sanitized = sanitizeMessages(body.messages);
      update.messages = fitMessagesToBudget(sanitized);
    }
    if (body.title !== undefined) {
      update.title = body.title;
    }
    if (body.currentTopic !== undefined) {
      update.currentTopic = body.currentTopic;
    }

    const doc = await SessionModel.findOneAndUpdate(
      { sessionId, userId },
      {
        $set: update,
        $setOnInsert: {
          sessionId,
          userId,
          title: body.title ?? "New Chat",
          messages: [],
          currentTopic: null,
        },
      },
      { new: true, upsert: true, runValidators: true }
    ).lean();

    return NextResponse.json({
      sessionId: doc.sessionId,
      title: doc.title,
      messages: doc.messages ?? [],
      currentTopic: doc.currentTopic ?? null,
    });
  } catch (err) {
    console.error("[sessions/:sessionId PATCH]", err);
    return NextResponse.json({ error: "Failed to update session" }, { status: 500 });
  }
}
