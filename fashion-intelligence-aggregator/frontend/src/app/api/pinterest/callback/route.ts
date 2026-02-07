import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import { connectMongo } from "@/lib/db";
import { UserProfileModel } from "@/lib/userProfileModel";

const PINTEREST_TOKEN_URL = "https://api.pinterest.com/v5/oauth/token";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const errorParam = searchParams.get("error");

  const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  const profileUrl = new URL("/profile", baseUrl);

  if (errorParam) {
    profileUrl.searchParams.set("pinterest", `error:${errorParam}`);
    return NextResponse.redirect(profileUrl);
  }

  if (!code || !state) {
    profileUrl.searchParams.set("pinterest", "missing_params");
    return NextResponse.redirect(profileUrl);
  }

  let userId: string;
  try {
    const decoded = Buffer.from(state, "base64url").toString("utf8");
    const [uid] = decoded.split(":");
    if (!uid) throw new Error("Invalid state");
    userId = uid;
  } catch {
    profileUrl.searchParams.set("pinterest", "invalid_state");
    return NextResponse.redirect(profileUrl);
  }

  const clientId = process.env.PINTEREST_APP_ID ?? process.env.PINTEREST_CLIENT_ID;
  const clientSecret = process.env.PINTEREST_APP_SECRET ?? process.env.PINTEREST_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.error("[pinterest/callback] Pinterest credentials not set");
    profileUrl.searchParams.set("pinterest", "config_error");
    return NextResponse.redirect(profileUrl);
  }

  const redirectUri = `${baseUrl}/api/pinterest/callback`;

  const authHeader = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri,
  });

  let tokenRes: Response;
  try {
    tokenRes = await fetch(PINTEREST_TOKEN_URL, {
      method: "POST",
      headers: {
        Authorization: `Basic ${authHeader}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body.toString(),
    });
  } catch (err) {
    console.error("[pinterest/callback] Token request failed:", err);
    profileUrl.searchParams.set("pinterest", "token_request_failed");
    return NextResponse.redirect(profileUrl);
  }

  const tokenData = await tokenRes.json().catch(() => ({}));

  if (!tokenRes.ok) {
    console.error("[pinterest/callback] Token error:", tokenData);
    profileUrl.searchParams.set("pinterest", "token_error");
    return NextResponse.redirect(profileUrl);
  }

  const accessToken = tokenData.access_token as string | undefined;
  const refreshToken = tokenData.refresh_token as string | undefined;

  if (!accessToken) {
    profileUrl.searchParams.set("pinterest", "no_access_token");
    return NextResponse.redirect(profileUrl);
  }

  try {
    await connectMongo();
    await UserProfileModel.findOneAndUpdate(
      { userId },
      {
        $set: {
          pinterestConnected: true,
          pinterestAccessToken: accessToken,
          pinterestRefreshToken: refreshToken ?? undefined,
        },
      },
      { upsert: false }
    );

    profileUrl.searchParams.set("pinterest", "connected");
    return NextResponse.redirect(profileUrl);
  } catch (err) {
    console.error("[pinterest/callback] DB update failed:", err);
    profileUrl.searchParams.set("pinterest", "db_error");
    return NextResponse.redirect(profileUrl);
  }
}
