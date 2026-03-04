import type { GoogleGenAI } from "@google/genai";

type GenerateParams = {
  contents: unknown;
  config?: unknown;
  models?: string[];
};

const DEFAULT_TEXT_MODELS = [
  "gemini-2.5-flash-lite",
  "gemini-2.5-flash",
  "gemini-2.0-flash-lite",
];

function normalizeModelList(list: string[]): string[] {
  return Array.from(new Set(list.map((m) => m.trim()).filter(Boolean)));
}

export function getGeminiTextModelCandidates(): string[] {
  const envList = (process.env.GEMINI_TEXT_MODELS ?? "")
    .split(",")
    .map((m) => m.trim())
    .filter(Boolean);
  return normalizeModelList([...envList, ...DEFAULT_TEXT_MODELS]);
}

function canTryNextModel(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : JSON.stringify(err);
  return /NOT_FOUND|404|no longer available to new users|RESOURCE_EXHAUSTED|429|quota/i.test(msg);
}

export async function generateContentWithTextModelFallback(
  ai: InstanceType<typeof GoogleGenAI>,
  params: GenerateParams
) {
  const models = normalizeModelList(params.models ?? getGeminiTextModelCandidates());
  if (models.length === 0) throw new Error("No Gemini text models configured");

  let lastError: unknown = null;
  for (const model of models) {
    try {
      return await ai.models.generateContent({
        model,
        contents: params.contents as never,
        config: params.config as never,
      });
    } catch (err) {
      lastError = err;
      if (!canTryNextModel(err)) throw err;
    }
  }

  throw lastError ?? new Error("All Gemini text models failed");
}
