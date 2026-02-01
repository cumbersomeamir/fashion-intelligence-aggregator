import { NextRequest, NextResponse } from "next/server";

/** Response from SerpApi Google Immersive Product API – stores are direct merchant links. */
interface ImmersiveStore {
  name?: string;
  link?: string;
  price?: string;
  extracted_price?: number;
  extracted_total?: number;
}

interface ImmersiveProductResponse {
  product_results?: {
    stores?: ImmersiveStore[];
  };
  error?: string;
}

export interface ShoppingProductResponse {
  merchantLink: string | null;
  sellers: Array<{ name: string; link: string; price?: string; extracted_price?: number }>;
}

/**
 * GET /api/shopping-product?serpapi_url=...
 * Fetches product details from SerpApi Google Immersive Product API and returns
 * direct merchant/seller links (Myntra, Amazon, etc.) instead of the Google product page.
 */
export async function GET(request: NextRequest) {
  const apiKey = process.env.SERPAPI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "SERPAPI_API_KEY is not configured" },
      { status: 503 }
    );
  }

  const { searchParams } = new URL(request.url);
  const serpapiUrl = searchParams.get("serpapi_url")?.trim();

  if (!serpapiUrl) {
    return NextResponse.json(
      { error: "Missing required query parameter: serpapi_url" },
      { status: 400 }
    );
  }

  const url = new URL(serpapiUrl);
  if (url.origin !== "https://serpapi.com" || !url.pathname.includes("search")) {
    return NextResponse.json(
      { error: "Invalid serpapi_url" },
      { status: 400 }
    );
  }
  url.searchParams.set("api_key", apiKey);

  try {
    const res = await fetch(url.toString(), {
      headers: { Accept: "application/json" },
      next: { revalidate: 300 },
    });
    const data = (await res.json()) as ImmersiveProductResponse;

    if (!res.ok) {
      return NextResponse.json(
        { error: data.error ?? "SerpAPI request failed" },
        { status: res.status }
      );
    }

    const stores = data.product_results?.stores ?? [];
    const sellers = stores
      .filter((s): s is ImmersiveStore & { link: string } => Boolean(s.link))
      .map((s) => ({
        name: s.name ?? "Store",
        link: s.link,
        price: s.price,
        extracted_price: s.extracted_price,
      }));

    const best =
      sellers.length > 0
        ? sellers.slice().sort((a, b) => (a.extracted_price ?? 1e9) - (b.extracted_price ?? 1e9))[0]
        : null;
    const merchantLink = best?.link ?? null;

    const body: ShoppingProductResponse = {
      merchantLink,
      sellers: sellers.map(({ name, link, price, extracted_price }) => ({
        name,
        link,
        price,
        extracted_price,
      })),
    };
    return NextResponse.json(body);
  } catch (e) {
    console.error("[shopping-product]", e);
    return NextResponse.json(
      { error: "Failed to fetch product sellers" },
      { status: 502 }
    );
  }
}
