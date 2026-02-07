import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { randomBytes } from "crypto";

const PINTEREST_OAUTH_URL = "https://www.pinterest.com/oauth/";
const SCOPES = ["boards:read", "pins:read"];

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.redirect(new URL("/login", process.env.NEXTAUTH_URL ?? "http://localhost:3000"));
  }

  const clientId = process.env.PINTEREST_APP_ID ?? process.env.PINTEREST_CLIENT_ID;
  const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

  if (!clientId) {
    console.error("[pinterest/auth] PINTEREST_APP_ID or PINTEREST_CLIENT_ID not set");
    return NextResponse.redirect(new URL("/profile?pinterest=config_error", baseUrl));
  }

  const userId = (session.user as { id?: string }).id ?? session.user.email;
  const nonce = randomBytes(16).toString("hex");
  const statePayload = `${userId}:${nonce}`;
  const state = Buffer.from(statePayload).toString("base64url");

  const redirectUri = `${baseUrl}/api/pinterest/callback`;
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: SCOPES.join(","),
    state,
  });

  return NextResponse.redirect(`${PINTEREST_OAUTH_URL}?${params.toString()}`);
}
