import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { connectMongo } from "@/lib/db";
import { OnboardingModel } from "@/lib/onboardingModel";
import { authOptions } from "@/lib/authOptions";
import { getSessionUserId } from "@/lib/sessionUserId";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

/** GET: Returns profile. If authenticated, fetch from Onboarding; else proxy to Express. */
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = getSessionUserId(session);
  const sessionId = request.nextUrl.searchParams.get("sessionId")?.trim();

  // Authenticated: fetch from Onboarding collection
  if (userId) {
    try {
      await connectMongo();
      const doc = await OnboardingModel.findOne({ userId }).lean();
      if (doc) {
        const { _id, __v, createdAt, updatedAt, userId: _u, username, displayName, ...profile } =
          doc as Record<string, unknown>;
        return NextResponse.json(profile);
      }
    } catch (err) {
      console.error("[profile GET onboarding]", err);
    }
  }

  // Fallback: proxy to Express (sessionId required)
  if (!sessionId) {
    return NextResponse.json({});
  }
  try {
    const res = await fetch(`${API_BASE}/api/profile?sessionId=${encodeURIComponent(sessionId)}`);
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error("[profile GET proxy]", err);
    return NextResponse.json({});
  }
}

/** POST: Saves profile. If authenticated, save to Onboarding and sync to Express; else save to Express only. */
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = getSessionUserId(session);

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const sessionId = (body.sessionId as string)?.trim();
  if (!sessionId) {
    return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });
  }

  const profileData = { ...body };
  delete profileData.sessionId;

  // Authenticated: save to Onboarding (upsert)
  if (userId) {
    try {
      await connectMongo();
      const username =
        (session!.user!.email?.split("@")[0] as string) || "user";
      await OnboardingModel.findOneAndUpdate(
        { userId },
        {
          $set: {
            userId,
            username,
            displayName: session!.user!.name,
            ...profileData,
          },
        },
        { new: true, upsert: true, runValidators: true }
      );
    } catch (err) {
      console.error("[profile POST onboarding]", err);
    }
  }

  // Always sync to Express profile API (for Personalise page)
  try {
    const res = await fetch(`${API_BASE}/api/profile`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...body, sessionId }),
    });
    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json(data, { status: res.status });
    }
    return NextResponse.json(data);
  } catch (err) {
    console.error("[profile POST proxy]", err);
    return NextResponse.json({ error: "Failed to save profile" }, { status: 500 });
  }
}
