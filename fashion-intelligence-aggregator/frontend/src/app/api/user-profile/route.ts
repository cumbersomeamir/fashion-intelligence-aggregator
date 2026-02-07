import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { connectMongo } from "@/lib/db";
import { UserProfileModel } from "@/lib/userProfileModel";
import { authOptions } from "@/lib/authOptions";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = (session.user as { id?: string }).id ?? session.user.email;

  try {
    await connectMongo();
    const doc = await UserProfileModel.findOne({ userId }).lean();
    if (!doc) {
      return NextResponse.json(null);
    }
    const {
      _id,
      __v,
      createdAt,
      updatedAt,
      pinterestAccessToken,
      pinterestRefreshToken,
      ...profile
    } = doc as Record<string, unknown>;
    return NextResponse.json(profile);
  } catch (err) {
    console.error("[user-profile GET]", err);
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = (session.user as { id?: string }).id ?? session.user.email;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  try {
    await connectMongo();
    const existing = await UserProfileModel.findOne({ userId }).lean();
    if (existing) {
      return NextResponse.json(
        { error: "Profile already exists. Onboarding is only allowed once at signup." },
        { status: 409 }
      );
    }

    const displayName = (body.displayName as string)?.trim() || session.user.name || "User";
    const username = (body.username as string)?.trim() || session.user.email?.split("@")[0] || "user";
    const profilePictureUrl = (body.profilePictureUrl as string)?.trim() || session.user.image || undefined;

    const doc = await UserProfileModel.create({
      userId,
      displayName,
      username,
      profilePictureUrl,
      tryOnCount: 0,
      followersCount: 0,
      followingCount: 0,
      wardrobeItems: [],
      likedItems: [],
      pinterestConnected: false,
      onboardingCompleted: true,
    });

    const { _id, __v, createdAt, updatedAt, ...profile } = doc.toObject();
    return NextResponse.json(profile);
  } catch (err) {
    console.error("[user-profile POST]", err);
    return NextResponse.json({ error: "Failed to create profile" }, { status: 500 });
  }
}
