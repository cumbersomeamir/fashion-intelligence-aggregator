import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const bucket = process.env.AWS_S3_BUCKET;
const region = process.env.AWS_REGION;
const accessKey = process.env.AWS_ACCESS_KEY_ID;
const secretKey = process.env.AWS_SECRET_ACCESS_KEY;

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE_BYTES = 5 * 1024 * 1024;

function getExt(mime: string): string {
  const map: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
  };
  return map[mime] ?? "jpg";
}

function cleanSegment(value: string, fallback: string): string {
  const cleaned = value.replace(/[^a-zA-Z0-9-_]/g, "_").slice(0, 80);
  return cleaned || fallback;
}

export async function POST(request: NextRequest) {
  if (!bucket || !region || !accessKey || !secretKey) {
    return NextResponse.json({ error: "AWS S3 is not configured" }, { status: 503 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = formData.get("file") as File | null;
  const scopeRaw = String(formData.get("scope") ?? "misc");
  const sellerIdRaw = String(formData.get("sellerId") ?? "");
  const productIdRaw = String(formData.get("productId") ?? "");
  const draftIdRaw = String(formData.get("draftId") ?? "");

  if (!file || typeof file === "string") {
    return NextResponse.json({ error: "Missing or invalid file" }, { status: 400 });
  }

  const mime = file.type?.toLowerCase() ?? "";
  if (!ALLOWED_TYPES.includes(mime)) {
    return NextResponse.json({ error: "Invalid file type. Use JPEG, PNG, WebP, or GIF." }, { status: 400 });
  }
  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json({ error: "File too large (max 5 MB)" }, { status: 400 });
  }

  const ext = getExt(mime);
  const sellerOrDraft = sellerIdRaw || draftIdRaw || crypto.randomUUID();
  const sellerSegment = cleanSegment(sellerOrDraft, "draft");
  const scopeSegment = cleanSegment(scopeRaw, "misc");
  const productSegment = productIdRaw ? `/${cleanSegment(productIdRaw, "item")}` : "";
  const key = `seller/${sellerSegment}/${scopeSegment}${productSegment}/${Date.now()}-${crypto.randomUUID()}.${ext}`;

  const client = new S3Client({
    region,
    credentials: { accessKeyId: accessKey, secretAccessKey: secretKey },
  });

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    await client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: buffer,
        ContentType: mime,
      })
    );
  } catch (err) {
    console.error("[seller/upload-image]", err);
    return NextResponse.json({ error: "Failed to upload image" }, { status: 502 });
  }

  const url = `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
  return NextResponse.json({
    assetId: crypto.randomUUID(),
    url,
    key,
  });
}
