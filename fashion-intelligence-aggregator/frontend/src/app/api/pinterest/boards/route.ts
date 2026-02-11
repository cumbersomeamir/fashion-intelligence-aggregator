import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { connectMongo } from "@/lib/db";
import { PinterestBoardModel } from "@/lib/pinterestBoardModel";
import { authOptions } from "@/lib/authOptions";
import { getSessionUserId } from "@/lib/sessionUserId";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = getSessionUserId(session);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectMongo();
    const boards = await PinterestBoardModel.find({ userId })
      .sort({ lastSyncedAt: -1 })
      .lean();
    const list = boards.map((b) => ({
      boardId: b.boardId,
      name: b.name,
      description: b.description,
      pinCount: b.pinCount ?? 0,
      thumbnailUrl: b.thumbnailUrl,
      lastSyncedAt: b.lastSyncedAt?.toISOString?.(),
    }));
    return NextResponse.json(list);
  } catch (err) {
    console.error("[pinterest/boards GET]", err);
    return NextResponse.json(
      { error: "Failed to fetch boards" },
      { status: 500 }
    );
  }
}
