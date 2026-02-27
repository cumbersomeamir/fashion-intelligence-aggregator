import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { connectMongo } from "@/lib/db";
import { SessionModel } from "@/lib/sessionModel";
import { authOptions } from "@/lib/authOptions";
import { getSessionUserId } from "@/lib/sessionUserId";

type SessionMessage = {
  id?: string;
  type?: string;
  tryOnResultImage?: string;
  tryOnProduct?: {
    title?: string;
    source?: string;
    price?: string;
  };
};

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
      .limit(120)
      .select("sessionId title messages lastActivityAt updatedAt")
      .lean();

    const assets: Array<{
      id: string;
      sessionId: string;
      sessionTitle: string;
      image: string;
      productTitle: string;
      productSource: string;
      productPrice: string;
      lastActivityAt: Date | string;
    }> = [];

    for (const sessionDoc of docs) {
      const messages = Array.isArray(sessionDoc.messages)
        ? (sessionDoc.messages as SessionMessage[])
        : [];

      for (let i = messages.length - 1; i >= 0; i -= 1) {
        const msg = messages[i];
        const image = typeof msg?.tryOnResultImage === "string" ? msg.tryOnResultImage.trim() : "";
        if (!image || msg?.type !== "try-on") continue;

        assets.push({
          id: `${sessionDoc.sessionId}-${msg.id ?? i}`,
          sessionId: sessionDoc.sessionId,
          sessionTitle: sessionDoc.title ?? "New Chat",
          image,
          productTitle: msg.tryOnProduct?.title ?? "",
          productSource: msg.tryOnProduct?.source ?? "",
          productPrice: msg.tryOnProduct?.price ?? "",
          lastActivityAt: sessionDoc.lastActivityAt ?? sessionDoc.updatedAt ?? new Date().toISOString(),
        });
      }
    }

    return NextResponse.json({ assets });
  } catch (err) {
    console.error("[history/assets GET]", err);
    return NextResponse.json({ error: "Failed to load assets" }, { status: 500 });
  }
}
