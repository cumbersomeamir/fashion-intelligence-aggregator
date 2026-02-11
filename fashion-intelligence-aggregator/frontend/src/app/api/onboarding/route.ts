import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { connectMongo } from "@/lib/db";
import { OnboardingModel } from "@/lib/onboardingModel";
import { UserProfileModel } from "@/lib/userProfileModel";
import { authOptions } from "@/lib/authOptions";
import { getSessionUserId } from "@/lib/sessionUserId";

export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = getSessionUserId(session);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectMongo();
    const doc = await OnboardingModel.findOne({ userId }).lean();
    if (!doc) {
      return NextResponse.json(null);
    }
    const { _id, __v, createdAt, updatedAt, userId: _u, ...profile } = doc as Record<string, unknown>;
    return NextResponse.json(profile);
  } catch (err) {
    console.error("[onboarding GET]", err);
    return NextResponse.json({ error: "Failed to fetch onboarding" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const userId = getSessionUserId(session);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const username =
    (body.username as string)?.trim()?.toLowerCase()?.replace(/\s+/g, "") ||
    session!.user!.email?.split("@")[0] ||
    "user";
  const displayName =
    (body.displayName as string)?.trim() || session!.user!.name || "User";

  const payload = {
    userId,
    username,
    displayName,
    measurements: body.measurements,
    fitPreference: body.fitPreference,
    sleevePreference: body.sleevePreference,
    lengthPreference: body.lengthPreference,
    budgetTier: body.budgetTier,
    budgetSensitivity: body.budgetSensitivity,
    occasions: body.occasions,
    occasionFrequency: body.occasionFrequency,
    fabricPrefs: body.fabricPrefs,
    fabricSensitivities: body.fabricSensitivities,
    climate: body.climate,
    favoriteBrands: body.favoriteBrands,
    brandsToAvoid: body.brandsToAvoid,
    stylePrefs: body.stylePrefs,
    profile_image: body.profile_image,
  };

  try {
    await connectMongo();
    const doc = await OnboardingModel.findOneAndUpdate(
      { userId },
      { $set: payload },
      { new: true, upsert: true, runValidators: true }
    ).lean();

    // Create or update UserProfile with onboardingCompleted flag
    const id = (session!.user as { id?: string }).id;
    const existingProfile = await UserProfileModel.findOne(
      id ? { $or: [{ userId }, { userId: id }] } : { userId }
    );
    if (existingProfile) {
      await UserProfileModel.findByIdAndUpdate(existingProfile._id, {
        $set: { onboardingCompleted: true, displayName, username },
      });
    } else {
      await UserProfileModel.create({
        userId,
        displayName,
        username,
        profilePictureUrl: session!.user!.image,
        tryOnCount: 0,
        followersCount: 0,
        followingCount: 0,
        wardrobeItems: [],
        likedItems: [],
        pinterestConnected: false,
        onboardingCompleted: true,
      });
    }

    const { _id, __v, createdAt, updatedAt, ...saved } = doc as Record<string, unknown>;
    return NextResponse.json(saved);
  } catch (err) {
    console.error("[onboarding POST]", err);
    return NextResponse.json({ error: "Failed to save onboarding" }, { status: 500 });
  }
}
