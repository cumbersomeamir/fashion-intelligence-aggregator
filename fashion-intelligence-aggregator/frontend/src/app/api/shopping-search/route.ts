import { NextRequest, NextResponse } from "next/server";
import { connectMongo } from "@/lib/db";
import { GlobalProductModel } from "@/lib/globalProductModel";

const SERPAPI_BASE = "https://serpapi.com/search.json";

/** Country-specific params to force Google Shopping results to a single country. */
const COUNTRY_PARAMS: Record<
  string,
  { gl: string; google_domain: string; location: string }
> = {
  in: {
    gl: "in",
    google_domain: "google.co.in",
    location: "Lucknow,Uttar Pradesh,India",
  },
  us: {
    gl: "us",
    google_domain: "google.com",
    location: "New York,New York,United States",
  },
  uk: {
    gl: "uk",
    google_domain: "google.co.uk",
    location: "London,England,United Kingdom",
  },
  ae: {
    gl: "ae",
    google_domain: "google.ae",
    location: "Dubai,Dubai,United Arab Emirates",
  },
  ca: {
    gl: "ca",
    google_domain: "google.ca",
    location: "Toronto,Ontario,Canada",
  },
};

const DEFAULT_COUNTRY = "in";
let globalIndexesEnsured = false;

export interface SerpShoppingResult {
  position: number;
  title: string;
  product_id?: string;
  product_link?: string;
  source?: string;
  source_icon?: string;
  price?: string;
  extracted_price?: number;
  old_price?: string;
  extracted_old_price?: number;
  rating?: number;
  reviews?: number;
  thumbnail?: string;
  serpapi_thumbnail?: string;
  tag?: string;
  extensions?: string[];
  delivery?: string;
  /** Ready-made URL to fetch seller/merchant links via Google Immersive Product API */
  serpapi_immersive_product_api?: string;
}

export interface SerpShoppingResponse {
  search_metadata?: { status: string };
  shopping_results?: SerpShoppingResult[];
  error?: string;
}

function canonicalKeyForResult(result: SerpShoppingResult): string | null {
  const productId = result.product_id?.trim();
  if (productId) return `pid:${productId}`;
  const productLink = result.product_link?.trim();
  if (productLink) return `plink:${productLink}`;
  return null;
}

function buildUpsertFilter(result: SerpShoppingResult, canonicalKey: string | null): Record<string, unknown> | null {
  const candidates: Array<Record<string, string>> = [];
  if (canonicalKey) candidates.push({ canonicalKey });
  if (result.product_id?.trim()) candidates.push({ product_id: result.product_id.trim() });
  if (result.product_link?.trim()) candidates.push({ product_link: result.product_link.trim() });
  if (candidates.length === 0) return null;
  if (candidates.length === 1) return candidates[0];
  return { $or: candidates };
}

async function ensureGlobalIndexes(): Promise<void> {
  if (globalIndexesEnsured) return;
  await GlobalProductModel.collection.createIndex(
    { canonicalKey: 1 },
    { unique: true, sparse: true, name: "canonicalKey_unique" }
  );
  globalIndexesEnsured = true;
}

export async function GET(request: NextRequest) {
  const apiKey = process.env.SERPAPI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "SERPAPI_API_KEY is not configured" },
      { status: 503 }
    );
  }

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();
  const countryCode = (searchParams.get("country")?.trim() ?? DEFAULT_COUNTRY).toLowerCase();
  const overrides = COUNTRY_PARAMS[countryCode] ?? COUNTRY_PARAMS[DEFAULT_COUNTRY];

  if (!q) {
    return NextResponse.json(
      { error: "Missing required query parameter: q" },
      { status: 400 }
    );
  }

  const params = new URLSearchParams({
    engine: "google_shopping",
    q,
    api_key: apiKey,
    gl: overrides.gl,
    google_domain: overrides.google_domain,
    location: overrides.location,
    hl: "en",
  });

  try {
    const res = await fetch(`${SERPAPI_BASE}?${params.toString()}`, {
      headers: { Accept: "application/json" },
      next: { revalidate: 60 },
    });
    const data = (await res.json()) as SerpShoppingResponse;

    if (!res.ok) {
      return NextResponse.json(
        { error: data.error ?? "SerpAPI request failed" },
        { status: res.status }
      );
    }

    const results = data.shopping_results ?? [];
    let attempted = 0;
    let saved = 0;
    let globalDbOk = true;
    let globalDbError: string | null = null;
    try {
      await connectMongo();
      await ensureGlobalIndexes();
      const now = new Date();
      for (const r of results) {
        const canonicalKey = canonicalKeyForResult(r);
        const filter = buildUpsertFilter(r, canonicalKey);
        if (filter) {
          attempted += 1;
          const setFields: Record<string, unknown> = {
            title: r.title,
            lastSeenAt: now,
            product_id: r.product_id,
            product_link: r.product_link,
            source: r.source,
            source_icon: r.source_icon,
            price: r.price,
            extracted_price: r.extracted_price,
            old_price: r.old_price,
            extracted_old_price: r.extracted_old_price,
            rating: r.rating,
            reviews: r.reviews,
            thumbnail: r.thumbnail,
            serpapi_thumbnail: r.serpapi_thumbnail,
            tag: r.tag,
            extensions: r.extensions,
            delivery: r.delivery,
            serpapi_immersive_product_api: r.serpapi_immersive_product_api,
            position: r.position,
            searchQuery: q,
            country: countryCode,
          };
          if (canonicalKey) {
            setFields.canonicalKey = canonicalKey;
          }

          try {
            await GlobalProductModel.findOneAndUpdate(
              filter,
              {
                $set: setFields,
                $setOnInsert: { firstSeenAt: now },
              },
              { upsert: true, new: true, runValidators: true }
            );
            saved += 1;
          } catch (err) {
            const duplicateKey =
              typeof err === "object" &&
              err !== null &&
              "code" in err &&
              (err as { code?: number }).code === 11000;
            if (duplicateKey && canonicalKey) {
              await GlobalProductModel.findOneAndUpdate(
                { canonicalKey },
                {
                  $set: setFields,
                },
                { upsert: false, new: true, runValidators: true }
              );
              saved += 1;
            } else {
              throw err;
            }
          }
        }
      }
    } catch (dbErr) {
      console.error("[shopping-search] Global DB upsert:", dbErr);
      globalDbOk = false;
      globalDbError = dbErr instanceof Error ? dbErr.message : "Global DB sync failed";
    }
    return NextResponse.json({
      results,
      globalDb: {
        ok: globalDbOk,
        attempted,
        saved,
        error: globalDbError,
      },
    });
  } catch (e) {
    console.error("[shopping-search]", e);
    return NextResponse.json(
      { error: "Failed to fetch shopping results" },
      { status: 502 }
    );
  }
}
