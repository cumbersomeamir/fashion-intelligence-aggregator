import { NextRequest, NextResponse } from "next/server";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 min
const CACHE_MAX = 20;
const cache = new Map<string, { bytes: Buffer; contentType: string; at: number }>();

function getCached(url: string): { bytes: Buffer; contentType: string } | null {
  const entry = cache.get(url);
  if (!entry || Date.now() - entry.at > CACHE_TTL_MS) {
    if (entry) cache.delete(url);
    return null;
  }
  return { bytes: entry.bytes, contentType: entry.contentType };
}

function setCache(url: string, bytes: Buffer, contentType: string) {
  if (cache.size >= CACHE_MAX) {
    const oldest = [...cache.entries()].sort((a, b) => a[1].at - b[1].at)[0];
    if (oldest) cache.delete(oldest[0]);
  }
  cache.set(url, { bytes, contentType, at: Date.now() });
}

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

/** Map key extension to Content-Type */
function contentTypeForKey(key: string): string {
  const lower = key.toLowerCase();
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".gif")) return "image/gif";
  if (lower.endsWith(".webp")) return "image/webp";
  return "image/jpeg";
}

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

  const cached = getCached(url);
  if (cached) {
    const body = new Uint8Array(cached.bytes);
    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": cached.contentType,
        "Cache-Control": "private, max-age=3600",
        "X-Profile-Image-Cache": "hit",
      },
    });
  }

  const client = new S3Client({
    region,
    credentials: { accessKeyId: accessKey, secretAccessKey: secretKey },
  });

  try {
    const cmd = new GetObjectCommand({ Bucket: bucket, Key: key });
    const out = await client.send(cmd);
    const body = out.Body;
    if (!body) {
      return NextResponse.json({ error: "Empty image" }, { status: 502 });
    }
    const bytes = await streamToBuffer(body as import("stream").Readable);
    const contentType = out.ContentType ?? contentTypeForKey(key);
    setCache(url, bytes, contentType);
    return new NextResponse(new Uint8Array(bytes), {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (err) {
    console.error("[profile-image]", err);
    return NextResponse.json({ error: "Failed to load image" }, { status: 502 });
  }
}

async function streamToBuffer(stream: import("stream").Readable): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}
