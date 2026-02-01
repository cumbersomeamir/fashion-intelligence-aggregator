/**
 * Virtual try-on using Google AI Studio Gemini 3 Pro Image (Nano Banana Pro).
 * Uses GEMINI_API_KEY from .env.local (same key as chat).
 */
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI, Modality } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;
const TRY_ON_MODEL = "gemini-3-pro-image-preview";

const TRY_ON_PROMPT = `You are a virtual try-on assistant. You have two images:
1. First image: a garment/product (e.g. sweater, shirt).
2. Second image: a person (user's profile photo).

Generate a single photorealistic image showing the person from the second image wearing the garment from the first image. Keep the person's pose and identity consistent; only change the clothing to the garment from image 1. Output only the result image, no text.`;

export async function POST(request: NextRequest) {
  if (!apiKey) {
    return NextResponse.json(
      { error: "Try-on requires GEMINI_API_KEY in .env.local (Google AI Studio)." },
      { status: 503 }
    );
  }

  let body: { productImageUrl?: string; profileImageBase64?: string; profileImageMime?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const productImageUrl = body.productImageUrl?.trim();
  const profileImageBase64 = body.profileImageBase64?.trim();
  const profileMime = body.profileImageMime ?? "image/jpeg";

  if (!productImageUrl) {
    return NextResponse.json({ error: "Missing productImageUrl" }, { status: 400 });
  }
  if (!profileImageBase64) {
    return NextResponse.json({ error: "Missing profileImageBase64 (upload a profile image first)" }, { status: 400 });
  }

  let productBase64: string;
  try {
    const res = await fetch(productImageUrl, { headers: { Accept: "image/*" } });
    if (!res.ok) throw new Error(`Fetch product image: ${res.status}`);
    const buf = await res.arrayBuffer();
    productBase64 = Buffer.from(buf).toString("base64");
  } catch (e) {
    console.error("[try-on] fetch product image", e);
    return NextResponse.json({ error: "Failed to fetch product image" }, { status: 400 });
  }

  try {
    const client = new GoogleGenAI({ apiKey });

    const response = await client.models.generateContent({
      model: TRY_ON_MODEL,
      contents: [
        {
          role: "user",
          parts: [
            { inlineData: { mimeType: "image/jpeg", data: productBase64 } },
            { inlineData: { mimeType: profileMime, data: profileImageBase64 } },
            { text: TRY_ON_PROMPT },
          ],
        },
      ],
      config: {
        responseModalities: [Modality.TEXT, Modality.IMAGE],
        temperature: 0.4,
      },
    });

    const parts = response.candidates?.[0]?.content?.parts ?? [];
    const imageParts = parts.filter((p) => p.inlineData?.data);
    if (imageParts.length > 0) {
      const last = imageParts[imageParts.length - 1];
      const mime = last.inlineData!.mimeType ?? "image/png";
      const dataUrl = `data:${mime};base64,${last.inlineData!.data}`;
      return NextResponse.json({ image: dataUrl });
    }

    const textPart = parts.find((p) => p.text);
    if (textPart?.text) {
      return NextResponse.json(
        { error: "Model returned text only. Try again or use a clearer product/person image." },
        { status: 502 }
      );
    }
    return NextResponse.json({ error: "No image in response" }, { status: 502 });
  } catch (err) {
    console.error("[try-on]", err);
    const msg = err instanceof Error ? err.message : "Try-on failed";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
