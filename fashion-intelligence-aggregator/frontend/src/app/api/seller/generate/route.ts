import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI, Modality } from "@google/genai";
import { S3Client, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { connectMongo } from "@/lib/db";
import { SellerModel } from "@/lib/sellerModel";

const apiKey = process.env.GEMINI_API_KEY;
const MODEL = process.env.GEMINI_IMAGE_MODEL || "gemini-3-pro-image-preview";

const bucket = process.env.AWS_S3_BUCKET;
const region = process.env.AWS_REGION;
const accessKey = process.env.AWS_ACCESS_KEY_ID;
const secretKey = process.env.AWS_SECRET_ACCESS_KEY;

type GenerateBody = {
  sellerId?: unknown;
  productId?: unknown;
  referenceImageBase64?: unknown;
  referenceImageMime?: unknown;
  referenceImageUrl?: unknown;
};

type SellerImageDoc = {
  url?: string;
};

type SellerProductDoc = {
  productId?: string;
  name?: string;
  category?: string;
  description?: string;
  images?: SellerImageDoc[];
};

function clean(value: unknown, maxLen = 220): string {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLen);
}

function cleanUrl(value: unknown): string {
  const url = clean(value, 1200);
  if (!url) return "";
  if (!/^https?:\/\//i.test(url)) return "";
  return url;
}

function contentTypeForKey(key: string): string {
  const lower = key.toLowerCase();
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".gif")) return "image/gif";
  if (lower.endsWith(".webp")) return "image/webp";
  return "image/jpeg";
}

function extForMime(mime: string): string {
  const normalized = mime.toLowerCase();
  if (normalized.includes("png")) return "png";
  if (normalized.includes("gif")) return "gif";
  if (normalized.includes("webp")) return "webp";
  return "jpg";
}

function keyFromS3Url(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (!parsed.pathname || parsed.pathname === "/") return null;
    return parsed.pathname.slice(1);
  } catch {
    return null;
  }
}

async function streamToBuffer(stream: import("stream").Readable): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

function canUseS3(): boolean {
  return !!bucket && !!region && !!accessKey && !!secretKey;
}

function getS3Client() {
  if (!canUseS3()) return null;
  return new S3Client({
    region,
    credentials: { accessKeyId: accessKey!, secretAccessKey: secretKey! },
  });
}

async function loadImageAsBase64(url: string): Promise<{ data: string; mime: string }> {
  const key = keyFromS3Url(url);
  const client = getS3Client();

  if (client && key && key.startsWith("seller/")) {
    const out = await client.send(
      new GetObjectCommand({
        Bucket: bucket!,
        Key: key,
      })
    );
    if (!out.Body) throw new Error("Product image is empty");
    const bytes = await streamToBuffer(out.Body as import("stream").Readable);
    return {
      data: bytes.toString("base64"),
      mime: out.ContentType ?? contentTypeForKey(key),
    };
  }

  const res = await fetch(url, { headers: { Accept: "image/*" } });
  if (!res.ok) {
    throw new Error(`Failed to fetch product image (${res.status})`);
  }
  const buf = await res.arrayBuffer();
  const mime = res.headers.get("content-type") || "image/jpeg";
  return {
    data: Buffer.from(buf).toString("base64"),
    mime,
  };
}

function buildPrompt(product: {
  name?: string;
  category?: string;
  description?: string;
}) {
  const name = clean(product.name, 160);
  const category = clean(product.category, 140);
  const description = clean(product.description, 900);

  return [
    "You are a fashion model photoshoot generator.",
    "You have two images:",
    "1) Product image (garment/accessory to promote).",
    "2) User reference image.",
    "Create a premium ecommerce-style fashion photoshoot image using a suitable professional model.",
    "Keep the product design, colors, silhouette, and details faithful to the product image.",
    "Use tasteful studio-quality lighting and a clean campaign-style composition.",
    "Output only one final image and no text.",
    name ? `Product name: ${name}` : "",
    category ? `Product category: ${category}` : "",
    description ? `Product details: ${description}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

export async function POST(request: NextRequest) {
  if (!apiKey) {
    return NextResponse.json({ error: "GEMINI_API_KEY not configured" }, { status: 503 });
  }

  let body: GenerateBody;
  try {
    body = (await request.json()) as GenerateBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const sellerId = clean(body.sellerId, 80);
  const productId = clean(body.productId, 80);
  const referenceImageBase64 = clean(body.referenceImageBase64, 20_000_000);
  const referenceImageMime = clean(body.referenceImageMime, 80) || "image/jpeg";
  const referenceImageUrl = cleanUrl(body.referenceImageUrl);

  if (!sellerId || !productId || !referenceImageBase64) {
    return NextResponse.json(
      { error: "sellerId, productId, and referenceImageBase64 are required" },
      { status: 400 }
    );
  }

  try {
    await connectMongo();
    const seller = await SellerModel.findOne({ sellerId }).lean();
    if (!seller) {
      return NextResponse.json({ error: "Seller not found" }, { status: 404 });
    }

    const products = (Array.isArray(seller.products) ? seller.products : []) as SellerProductDoc[];
    const product = products.find((item) => item.productId === productId);
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    const firstImage = Array.isArray(product.images) ? product.images[0] : null;
    const productImageUrl = cleanUrl(firstImage?.url);
    if (!productImageUrl) {
      return NextResponse.json({ error: "Product has no image" }, { status: 400 });
    }

    const productImage = await loadImageAsBase64(productImageUrl);
    const client = new GoogleGenAI({ apiKey });
    const response = await client.models.generateContent({
      model: MODEL,
      contents: [
        {
          role: "user",
          parts: [
            { inlineData: { mimeType: productImage.mime, data: productImage.data } },
            { inlineData: { mimeType: referenceImageMime, data: referenceImageBase64 } },
            { text: buildPrompt(product) },
          ],
        },
      ],
      config: {
        responseModalities: [Modality.TEXT, Modality.IMAGE],
        temperature: 0.4,
      },
    });

    const parts = response.candidates?.[0]?.content?.parts ?? [];
    const imageParts = parts.filter((part) => part.inlineData?.data);
    if (imageParts.length === 0) {
      return NextResponse.json({ error: "Model did not return an image" }, { status: 502 });
    }

    const last = imageParts[imageParts.length - 1];
    const generatedMime = last.inlineData?.mimeType ?? "image/png";
    const generatedData = last.inlineData?.data ?? "";
    if (!generatedData) {
      return NextResponse.json({ error: "Generated image is empty" }, { status: 502 });
    }

    const photoshootId = crypto.randomUUID();
    let generatedImageUrl = `data:${generatedMime};base64,${generatedData}`;
    let generatedImageKey: string | undefined;

    const s3 = getS3Client();
    if (s3 && bucket && region) {
      const key = `seller/${sellerId}/photoshoots/${Date.now()}-${photoshootId}.${extForMime(generatedMime)}`;
      await s3.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: key,
          Body: Buffer.from(generatedData, "base64"),
          ContentType: generatedMime,
        })
      );
      generatedImageKey = key;
      generatedImageUrl = `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
    }

    await SellerModel.updateOne(
      { sellerId },
      {
        $push: {
          photoshoots: {
            photoshootId,
            productId,
            productName: clean(product.name, 140) || undefined,
            referenceImageUrl: referenceImageUrl || undefined,
            generatedImageUrl,
            generatedImageKey,
            prompt: buildPrompt(product),
            createdAt: new Date(),
          },
        },
      }
    );

    return NextResponse.json({
      photoshootId,
      image: generatedImageUrl,
      productName: product.name ?? "",
    });
  } catch (err) {
    console.error("[seller/generate POST]", err);
    const message = err instanceof Error ? err.message : "Failed to generate photoshoot";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
