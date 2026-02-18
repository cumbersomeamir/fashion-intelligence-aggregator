import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const MODEL = "gemini-2.0-flash";
const ATTIRE_PROMPT =
  "Which fashion attire do you see in this picture, summarise how it looks in one line.";

function extractText(response: { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> }): string {
  const parts = response.candidates?.[0]?.content?.parts ?? [];
  return parts
    .map((part) => part.text ?? "")
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "GEMINI_API_KEY not configured" }, { status: 500 });
  }

  let body: { imageUrl?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const imageUrl = body.imageUrl?.trim();
  if (!imageUrl) {
    return NextResponse.json({ error: "imageUrl is required" }, { status: 400 });
  }

  let imageBase64 = "";
  let imageMime = "image/jpeg";
  try {
    const imageRes = await fetch(imageUrl, { headers: { Accept: "image/*" } });
    if (!imageRes.ok) {
      return NextResponse.json({ error: "Failed to fetch image" }, { status: 400 });
    }
    const contentType = imageRes.headers.get("content-type")?.split(";")[0].trim();
    if (contentType?.startsWith("image/")) {
      imageMime = contentType;
    }
    const buffer = await imageRes.arrayBuffer();
    imageBase64 = Buffer.from(buffer).toString("base64");
  } catch (err) {
    console.error("[reels/attire-summary fetch]", err);
    return NextResponse.json({ error: "Failed to fetch image" }, { status: 400 });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const resp = await ai.models.generateContent({
      model: MODEL,
      contents: [
        {
          role: "user",
          parts: [
            {
              inlineData: {
                mimeType: imageMime,
                data: imageBase64,
              },
            },
            { text: ATTIRE_PROMPT },
          ],
        },
      ],
      config: {
        temperature: 0.1,
        maxOutputTokens: 70,
      } as { temperature: number; maxOutputTokens: number },
    });

    const text =
      typeof (resp as { text?: string }).text === "string"
        ? (resp as { text: string }).text.trim()
        : extractText(resp as Parameters<typeof extractText>[0]);

    const summary = text.replace(/\s+/g, " ").trim();
    if (!summary) {
      return NextResponse.json({ error: "Could not summarize attire" }, { status: 502 });
    }

    return NextResponse.json({ summary });
  } catch (err) {
    console.error("[reels/attire-summary]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to summarize attire" },
      { status: 500 }
    );
  }
}
