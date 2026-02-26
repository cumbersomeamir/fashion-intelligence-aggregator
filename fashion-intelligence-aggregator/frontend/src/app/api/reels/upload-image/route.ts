import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { isAdminEmail } from "@/lib/admin";

const bucket = process.env.AWS_S3_BUCKET;
const region = process.env.AWS_REGION;
const accessKey = process.env.AWS_ACCESS_KEY_ID;
const secretKey = process.env.AWS_SECRET_ACCESS_KEY;

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE_BYTES = 4 * 1024 * 1024;

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
  const session = await getServerSession(authOptions);
  const email = session?.user?.email ?? null;
  if (!session || !isAdminEmail(email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

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
  if (!file || typeof file === "string") {
    return NextResponse.json({ error: "Missing or invalid file" }, { status: 400 });
  }

  const mime = file.type?.toLowerCase() ?? "";
  if (!ALLOWED_TYPES.includes(mime)) {
    return NextResponse.json({ error: "Invalid file type. Use JPEG, PNG, WebP, or GIF." }, { status: 400 });
  }
  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json({ error: "File too large (max 4 MB)" }, { status: 400 });
  }

  const ext = getExt(mime);
  const key = `reels-images/${crypto.randomUUID()}.${ext}`;
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
    console.error("[reels/upload-image]", err);
    return NextResponse.json({ error: "Failed to upload image" }, { status: 502 });
  }

  const url = `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
  return NextResponse.json({ url, key });
}
