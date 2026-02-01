import { NextRequest, NextResponse } from "next/server";

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
}

export interface SerpShoppingResponse {
  search_metadata?: { status: string };
  shopping_results?: SerpShoppingResult[];
  error?: string;
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
    return NextResponse.json({ results });
  } catch (e) {
    console.error("[shopping-search]", e);
    return NextResponse.json(
      { error: "Failed to fetch shopping results" },
      { status: 502 }
    );
  }
}
