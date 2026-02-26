import { NextRequest, NextResponse } from "next/server";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";

const CACHE_TTL_MS = 5 * 60 * 1000;
const CACHE_MAX = 20;
const cache = new Map<string, { bytes: Buffer; contentType: string; at: number }>();

const bucket = process.env.AWS_S3_BUCKET;
const region = process.env.AWS_REGION;
const accessKey = process.env.AWS_ACCESS_KEY_ID;
const secretKey = process.env.AWS_SECRET_ACCESS_KEY;

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

function keyFromUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (!parsed.pathname || parsed.pathname === "/") return null;
    return parsed.pathname.slice(1);
  } catch {
    return null;
  }
}

function contentTypeForKey(key: string): string {
  const lower = key.toLowerCase();
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".gif")) return "image/gif";
  if (lower.endsWith(".webp")) return "image/webp";
  return "image/jpeg";
}

async function streamToBuffer(stream: import("stream").Readable): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
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
  if (!key || !key.startsWith("reels-images/")) {
    return NextResponse.json({ error: "Invalid reel image URL" }, { status: 400 });
  }

  const cached = getCached(url);
  if (cached) {
    return new NextResponse(new Uint8Array(cached.bytes), {
      status: 200,
      headers: {
        "Content-Type": cached.contentType,
        "Cache-Control": "private, max-age=3600",
        "X-Reel-Image-Cache": "hit",
      },
    });
  }

  const client = new S3Client({
    region,
    credentials: { accessKeyId: accessKey, secretAccessKey: secretKey },
  });

  try {
    const out = await client.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
    if (!out.Body) {
      return NextResponse.json({ error: "Empty image" }, { status: 502 });
    }
    const bytes = await streamToBuffer(out.Body as import("stream").Readable);
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
    console.error("[reels/image]", err);
    return NextResponse.json({ error: "Failed to load image" }, { status: 502 });
  }
}
