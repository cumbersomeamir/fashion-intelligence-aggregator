import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { connectMongo } from "@/lib/db";
import { ProfileAssetModel } from "@/lib/profileAssetModel";
import { authOptions } from "@/lib/authOptions";
import { getSessionUserId } from "@/lib/sessionUserId";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = getSessionUserId(session);
  const sessionId = request.nextUrl.searchParams.get("sessionId")?.trim() || null;

  if (!userId && !sessionId) {
    return NextResponse.json({ assets: [] });
  }

  try {
    await connectMongo();

    if (userId && sessionId) {
      await ProfileAssetModel.updateMany(
        { sessionId, userId: { $exists: false } },
        { $set: { userId } }
      );
    }

    const orFilters: Array<Record<string, string>> = [];
    if (userId) orFilters.push({ userId });
    if (sessionId) orFilters.push({ sessionId });

    const docs = await ProfileAssetModel.find(orFilters.length > 1 ? { $or: orFilters } : orFilters[0])
      .sort({ createdAt: -1 })
      .limit(150)
      .lean();

    const seen = new Set<string>();
    const assets = docs
      .filter((doc) => {
        const key = typeof doc.imageUrl === "string" ? doc.imageUrl : "";
        if (!key || seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .map((doc) => ({
        id: doc.assetId,
        url: doc.imageUrl,
        createdAt: doc.createdAt instanceof Date ? doc.createdAt.toISOString() : new Date().toISOString(),
      }));

    return NextResponse.json({ assets });
  } catch (err) {
    console.error("[profile-assets GET]", err);
    return NextResponse.json({ error: "Failed to fetch profile assets" }, { status: 500 });
  }
}
