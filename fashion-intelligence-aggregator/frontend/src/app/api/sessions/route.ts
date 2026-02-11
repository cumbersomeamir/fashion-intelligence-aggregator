import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { connectMongo } from "@/lib/db";
import { SessionModel } from "@/lib/sessionModel";
import { authOptions } from "@/lib/authOptions";
import { getSessionUserId } from "@/lib/sessionUserId";

/** GET /api/sessions - List sessions for current user */
export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = getSessionUserId(session);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectMongo();
    const docs = await SessionModel.find({ userId })
      .sort({ lastActivityAt: -1 })
      .limit(50)
      .select("sessionId title messages currentTopic createdAt updatedAt lastActivityAt")
      .lean();

    const list = docs.map((d) => ({
      sessionId: d.sessionId,
      title: d.title,
      preview: (d.messages as { content?: string }[])?.[0]?.content?.slice(0, 80) ?? "",
      messageCount: (d.messages as unknown[])?.length ?? 0,
      currentTopic: d.currentTopic,
      createdAt: d.createdAt,
      updatedAt: d.updatedAt,
      lastActivityAt: d.lastActivityAt,
    }));

    return NextResponse.json({ sessions: list });
  } catch (err) {
    console.error("[sessions GET]", err);
    return NextResponse.json({ error: "Failed to list sessions" }, { status: 500 });
  }
}

/** POST /api/sessions - Create new session */
export async function POST() {
  const session = await getServerSession(authOptions);
  const userId = getSessionUserId(session);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectMongo();
    const sessionId = crypto.randomUUID();
    await SessionModel.create({
      sessionId,
      userId,
      title: "New Chat",
      messages: [],
      currentTopic: null,
    });

    return NextResponse.json({ sessionId });
  } catch (err) {
    console.error("[sessions POST]", err);
    return NextResponse.json({ error: "Failed to create session" }, { status: 500 });
  }
}
