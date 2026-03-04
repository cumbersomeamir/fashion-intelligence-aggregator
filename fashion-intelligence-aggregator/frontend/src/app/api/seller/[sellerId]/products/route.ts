import { NextRequest, NextResponse } from "next/server";
import { connectMongo } from "@/lib/db";
import { SellerModel } from "@/lib/sellerModel";

type ProductAssetInput = {
  url?: unknown;
  key?: unknown;
  label?: unknown;
};

type AddProductBody = {
  name?: unknown;
  category?: unknown;
  description?: unknown;
  price?: unknown;
  images?: unknown;
};

function clean(value: unknown, maxLen = 220): string {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLen);
}

function cleanNumber(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value) && value >= 0) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed) && parsed >= 0) return parsed;
  }
  return undefined;
}

function cleanUrl(value: unknown): string {
  const url = clean(value, 1200);
  if (!url) return "";
  if (!/^https?:\/\//i.test(url)) return "";
  return url;
}

function sanitizeAssets(input: unknown) {
  const list = Array.isArray(input) ? input : [];
  const now = new Date();
  return list
    .map((entry) => {
      const typed = (entry ?? {}) as ProductAssetInput;
      const url = cleanUrl(typed.url);
      if (!url) return null;
      return {
        assetId: crypto.randomUUID(),
        url,
        key: clean(typed.key, 1200) || undefined,
        label: clean(typed.label, 120) || undefined,
        createdAt: now,
      };
    })
    .filter((entry): entry is NonNullable<typeof entry> => !!entry);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ sellerId: string }> }
) {
  const { sellerId } = await params;
  if (!sellerId) {
    return NextResponse.json({ error: "sellerId is required" }, { status: 400 });
  }

  let body: AddProductBody;
  try {
    body = (await request.json()) as AddProductBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const name = clean(body.name, 140);
  const category = clean(body.category, 120);
  if (!name || !category) {
    return NextResponse.json({ error: "name and category are required" }, { status: 400 });
  }

  const product = {
    productId: crypto.randomUUID(),
    name,
    category,
    description: clean(body.description, 800) || undefined,
    price: cleanNumber(body.price),
    images: sanitizeAssets(body.images),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  try {
    await connectMongo();
    const doc = await SellerModel.findOneAndUpdate(
      { sellerId },
      { $push: { products: product } },
      { new: true }
    ).lean();

    if (!doc) {
      return NextResponse.json({ error: "Seller not found" }, { status: 404 });
    }

    return NextResponse.json({ product });
  } catch (err) {
    console.error("[seller/:sellerId/products POST]", err);
    return NextResponse.json({ error: "Failed to add product" }, { status: 500 });
  }
}
