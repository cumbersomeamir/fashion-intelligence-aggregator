import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const MODEL = "gemini-2.0-flash";

const CLASSIFICATION_PROMPT = `You are a prompt classifier for a fashion concierge app. The user can either:
1. CHAT - Ask questions, get advice, discuss fit/budget/style/fabric/occasion, comparisons, try-on help, general conversation
2. SEARCH - Look for specific products to buy (e.g. "blue dress", "sneakers under 100", "winter coats", "show me red heels")

Analyze the user's prompt and:
- If they want to FIND, BUY, SHOW ME, or SEARCH for products → respond with SEARCH and extract a short product search query (2-6 keywords, e.g. "blue summer dress" or "white sneakers under 50").
- If they want advice, explanations, recommendations without a specific product search, or general chat → respond with CHAT.

Respond with ONLY valid JSON, no other text:
{"type":"chat"}
OR
{"type":"search","query":"extracted search keywords"}

Examples:
- "what fabric is best for summer?" → {"type":"chat"}
- "show me blue dresses under 50" → {"type":"search","query":"blue dresses under 50"}
- "compare cotton vs linen" → {"type":"chat"}
- "find me white sneakers" → {"type":"search","query":"white sneakers"}
- "help me choose between these" → {"type":"chat"}
- "I need a winter coat" → {"type":"search","query":"winter coat"}
- "can you recommend something casual?" → {"type":"chat"}
- "black leather jacket" → {"type":"search","query":"black leather jacket"}`;

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "GEMINI_API_KEY not configured" }, { status: 500 });
  }

  let body: { prompt?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const prompt = typeof body?.prompt === "string" ? body.prompt.trim() : "";
  if (!prompt) {
    return NextResponse.json({ error: "prompt is required" }, { status: 400 });
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    const resp = await ai.models.generateContent({
      model: MODEL,
      contents: [
        {
          role: "user",
          parts: [
            { text: CLASSIFICATION_PROMPT },
            { text: `\n\nUser prompt: ${prompt}` },
          ],
        },
      ],
      config: {
        temperature: 0.1,
        maxOutputTokens: 80,
      } as { temperature: number; maxOutputTokens: number },
    });

    const text =
      typeof (resp as { text?: string }).text === "string"
        ? (resp as { text: string }).text
        : (resp as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> }).candidates?.[0]?.content?.parts
            ?.map((p) => p.text ?? "")
            .join("")
            .trim() ?? "";

    const parsed = parseModelSwitcherResponse(text);
    return NextResponse.json(parsed);
  } catch (err) {
    console.error("[model-switcher]", err);
    return NextResponse.json({ type: "chat" });
  }
}

function parseModelSwitcherResponse(text: string): { type: "chat" | "search"; query?: string } {
  const trimmed = text.trim();
  const jsonMatch = trimmed.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return { type: "chat" };

  try {
    const obj = JSON.parse(jsonMatch[0]) as { type?: string; query?: string };
    const type = String(obj?.type ?? "").toLowerCase();
    if (type === "search" && typeof obj?.query === "string" && obj.query.trim()) {
      return { type: "search", query: obj.query.trim() };
    }
    return { type: "chat" };
  } catch {
    return { type: "chat" };
  }
}
