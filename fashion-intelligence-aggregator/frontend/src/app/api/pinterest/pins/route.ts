import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { connectMongo } from "@/lib/db";
import { PinterestPinModel } from "@/lib/pinterestPinModel";
import { authOptions } from "@/lib/authOptions";
import { getSessionUserId } from "@/lib/sessionUserId";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = getSessionUserId(session);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const boardId = searchParams.get("boardId") ?? undefined;

  try {
    await connectMongo();
    const filter: { userId: string; boardId?: string } = { userId };
    if (boardId) filter.boardId = boardId;
    const pins = await PinterestPinModel.find(filter)
      .sort({ syncedAt: -1 })
      .lean();
    const list = pins.map((p) => ({
      pinId: p.pinId,
      boardId: p.boardId,
      boardName: p.boardName,
      imageUrl: p.imageUrl,
      link: p.link,
      title: p.title,
      description: p.description,
      syncedAt: p.syncedAt?.toISOString?.(),
    }));
    return NextResponse.json(list);
  } catch (err) {
    console.error("[pinterest/pins GET]", err);
    return NextResponse.json(
      { error: "Failed to fetch pins" },
      { status: 500 }
    );
  }
}
