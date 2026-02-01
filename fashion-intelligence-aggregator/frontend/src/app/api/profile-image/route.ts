import { NextRequest, NextResponse } from "next/server";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const bucket = process.env.AWS_S3_BUCKET;
const region = process.env.AWS_REGION;
const accessKey = process.env.AWS_ACCESS_KEY_ID;
const secretKey = process.env.AWS_SECRET_ACCESS_KEY;

/** Extract S3 key from a stored profile_image URL (e.g. https://bucket.s3.region.amazonaws.com/profile-images/xxx.jpg) */
function keyFromUrl(url: string): string | null {
  try {
    const u = new URL(url);
    if (!u.pathname || u.pathname === "/") return null;
    return u.pathname.slice(1); // remove leading /
  } catch {
    return null;
  }
}

const PRESIGN_EXPIRES_IN = 3600; // 1 hour

export async function GET(request: NextRequest) {
  if (!bucket || !region || !accessKey || !secretKey) {
    return NextResponse.json({ error: "S3 not configured" }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url")?.trim();

  if (!url) {
    return NextResponse.json({ error: "Missing query parameter: url" }, { status: 400 });
  }

  const key = keyFromUrl(url);
  if (!key || !key.startsWith("profile-images/")) {
    return NextResponse.json({ error: "Invalid profile image URL" }, { status: 400 });
  }

  const client = new S3Client({
    region,
    credentials: { accessKeyId: accessKey, secretAccessKey: secretKey },
  });

  try {
    const signedUrl = await getSignedUrl(
      client,
      new GetObjectCommand({ Bucket: bucket, Key: key }),
      { expiresIn: PRESIGN_EXPIRES_IN }
    );
    return NextResponse.redirect(signedUrl, 302);
  } catch (err) {
    console.error("[profile-image]", err);
    return NextResponse.json({ error: "Failed to generate image URL" }, { status: 502 });
  }
}
