import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { connectMongo } from "@/lib/db";
import { ReelModel } from "@/lib/reelModel";
import { authOptions } from "@/lib/authOptions";
import { isAdminEmail } from "@/lib/admin";

type ReelItemPayload = {
  creator?: string;
  title?: string;
  brand?: string;
  priceHint?: string;
  baseImageUrl?: string;
  sortOrder?: number;
};

function clean(value: unknown, maxLen = 140): string {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLen);
}

export async function GET() {
  try {
    await connectMongo();
    const docs = await ReelModel.find({ isActive: true })
      .sort({ sortOrder: -1, createdAt: -1 })
      .limit(200)
      .lean();
    const reels = docs.map((doc) => ({
      id: doc.reelId,
      creator: doc.creator,
      title: doc.title,
      brand: doc.brand,
      priceHint: doc.priceHint,
      baseImageUrl: doc.baseImageUrl,
    }));
    return NextResponse.json({ reels });
  } catch (err) {
    console.error("[reels/items GET]", err);
    return NextResponse.json({ error: "Failed to fetch reels" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email ?? null;
  if (!session || !isAdminEmail(email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: ReelItemPayload;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const creator = clean(body.creator, 80);
  const title = clean(body.title, 200);
  const brand = clean(body.brand, 120);
  const priceHint = clean(body.priceHint, 60);
  const baseImageUrl = clean(body.baseImageUrl, 500);
  const sortOrder = typeof body.sortOrder === "number" && Number.isFinite(body.sortOrder) ? body.sortOrder : Date.now();

  if (!creator || !title || !brand || !priceHint || !baseImageUrl) {
    return NextResponse.json({ error: "creator, title, brand, priceHint, baseImageUrl are required" }, { status: 400 });
  }
  if (!/^https?:\/\//i.test(baseImageUrl)) {
    return NextResponse.json({ error: "baseImageUrl must be a valid URL" }, { status: 400 });
  }

  try {
    await connectMongo();
    const reelId = crypto.randomUUID();
    await ReelModel.create({
      reelId,
      creator,
      title,
      brand,
      priceHint,
      baseImageUrl,
      sortOrder,
      isActive: true,
      createdBy: email ?? undefined,
    });
    return NextResponse.json({ reelId });
  } catch (err) {
    console.error("[reels/items POST]", err);
    return NextResponse.json({ error: "Failed to create reel" }, { status: 500 });
  }
}
