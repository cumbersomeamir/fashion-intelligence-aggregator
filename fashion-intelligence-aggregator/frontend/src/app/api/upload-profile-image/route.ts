import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const bucket = process.env.AWS_S3_BUCKET;
const region = process.env.AWS_REGION;
const accessKey = process.env.AWS_ACCESS_KEY_ID;
const secretKey = process.env.AWS_SECRET_ACCESS_KEY;

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

function getExt(mime: string): string {
  const map: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
  };
  return map[mime] ?? "jpg";
}

export async function POST(request: NextRequest) {
  if (!bucket || !region || !accessKey || !secretKey) {
    return NextResponse.json(
      { error: "AWS S3 is not configured (AWS_S3_BUCKET, AWS_REGION, credentials in .env.local)" },
      { status: 503 }
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = formData.get("file") as File | null;
  const sessionId = (formData.get("sessionId") as string)?.trim();

  if (!file || typeof file === "string") {
    return NextResponse.json({ error: "Missing or invalid file" }, { status: 400 });
  }
  if (!sessionId) {
    return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });
  }

  const mime = file.type?.toLowerCase() ?? "";
  if (!ALLOWED_TYPES.includes(mime)) {
    return NextResponse.json(
      { error: "Invalid file type. Use JPEG, PNG, WebP, or GIF." },
      { status: 400 }
    );
  }
  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json({ error: "File too large (max 5 MB)" }, { status: 400 });
  }

  const safeSessionId = sessionId.replace(/[^a-zA-Z0-9-_]/g, "_").slice(0, 64);
  const ext = getExt(mime);
  const key = `profile-images/${safeSessionId}.${ext}`;

  const client = new S3Client({
    region,
    credentials: { accessKeyId: accessKey, secretAccessKey: secretKey },
  });

  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    await client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: buffer,
        ContentType: mime,
        // No ACL — bucket has "Block public access" / ACLs disabled; use bucket policy or presigned URLs for read access
      })
    );
  } catch (err) {
    console.error("[upload-profile-image]", err);
    return NextResponse.json(
      { error: "Failed to upload to S3." },
      { status: 502 }
    );
  }

  // Direct URL; if bucket blocks public read, use GET /api/profile-image?key=... (presigned) for viewing
  const url = `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
  return NextResponse.json({ url, key });
}
