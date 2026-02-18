import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { connectMongo } from "@/lib/db";
import { SessionModel } from "@/lib/sessionModel";
import { authOptions } from "@/lib/authOptions";
import { getSessionUserId } from "@/lib/sessionUserId";

const EMPTY_DRAFT_REUSE_WINDOW_MS = 24 * 60 * 60 * 1000;

/** GET /api/sessions/current - Get or create current session for user */
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = getSessionUserId(session);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const sessionIdParam = searchParams.get("sessionId")?.trim();

  try {
    await connectMongo();

    if (sessionIdParam) {
      const existing = await SessionModel.findOne({
        sessionId: sessionIdParam,
        userId,
      }).lean();
      if (existing) {
        return NextResponse.json({
          sessionId: existing.sessionId,
          messages: existing.messages ?? [],
          currentTopic: existing.currentTopic ?? null,
          title: existing.title ?? "New Chat",
        });
      }
    }

    const cutoff = new Date(Date.now() - EMPTY_DRAFT_REUSE_WINDOW_MS);
    const draft = await SessionModel.findOne({
      userId,
      title: "New Chat",
      lastActivityAt: { $gte: cutoff },
      $or: [{ messages: { $exists: false } }, { messages: { $size: 0 } }],
    })
      .sort({ lastActivityAt: -1 })
      .lean();

    if (draft) {
      return NextResponse.json({
        sessionId: draft.sessionId,
        messages: draft.messages ?? [],
        currentTopic: draft.currentTopic ?? null,
        title: draft.title ?? "New Chat",
      });
    }

    const sessionId = crypto.randomUUID();
    await SessionModel.create({
      sessionId,
      userId,
      title: "New Chat",
      messages: [],
      currentTopic: null,
    });

    return NextResponse.json({
      sessionId,
      messages: [],
      currentTopic: null,
      title: "New Chat",
    });
  } catch (err) {
    console.error("[sessions/current GET]", err);
    return NextResponse.json({ error: "Failed to get session" }, { status: 500 });
  }
}
