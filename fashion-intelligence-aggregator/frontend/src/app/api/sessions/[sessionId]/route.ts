import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { connectMongo } from "@/lib/db";
import { SessionModel } from "@/lib/sessionModel";
import { authOptions } from "@/lib/authOptions";
import { getSessionUserId } from "@/lib/sessionUserId";
import type { ChatMessage } from "@/types";

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
      update.messages = body.messages;
    }
    if (body.title !== undefined) {
      update.title = body.title;
    }
    if (body.currentTopic !== undefined) {
      update.currentTopic = body.currentTopic;
    }

    const doc = await SessionModel.findOneAndUpdate(
      { sessionId, userId },
      { $set: update },
      { new: true }
    ).lean();

    if (!doc) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

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
