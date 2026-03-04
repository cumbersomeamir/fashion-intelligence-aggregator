import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { connectMongo } from "@/lib/db";
import { SellerModel } from "@/lib/sellerModel";
import { authOptions } from "@/lib/authOptions";
import { getSessionUserId } from "@/lib/sessionUserId";

type SellerAssetInput = {
  url?: unknown;
  key?: unknown;
  label?: unknown;
};

type SellerProductInput = {
  name?: unknown;
  category?: unknown;
  description?: unknown;
  price?: unknown;
  images?: unknown;
};

type CreateSellerBody = {
  sellerId?: unknown;
  businessName?: unknown;
  ownerName?: unknown;
  ownerEmail?: unknown;
  businessEmail?: unknown;
  businessPhone?: unknown;
  businessCategory?: unknown;
  website?: unknown;
  address?: unknown;
  description?: unknown;
  businessImages?: unknown;
  products?: unknown;
};

function clean(value: unknown, maxLen = 220): string {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLen);
}

function cleanId(value: unknown): string {
  return clean(value, 80).replace(/[^a-zA-Z0-9-_]/g, "");
}

function cleanOptionalNumber(value: unknown): number | undefined {
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
      const typed = (entry ?? {}) as SellerAssetInput;
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

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = getSessionUserId(session);
  const sessionEmail = session?.user?.email?.trim().toLowerCase() ?? "";
  const querySellerId = request.nextUrl.searchParams.get("sellerId")?.trim() ?? "";
  const queryEmail = request.nextUrl.searchParams.get("ownerEmail")?.trim().toLowerCase() ?? "";

  try {
    await connectMongo();

    if (querySellerId) {
      const doc = await SellerModel.findOne({ sellerId: querySellerId }).lean();
      if (!doc) {
        return NextResponse.json({ error: "Seller not found" }, { status: 404 });
      }
      return NextResponse.json({
        seller: {
          sellerId: doc.sellerId,
          ownerUserId: doc.ownerUserId ?? null,
          ownerEmail: doc.ownerEmail ?? null,
          businessName: doc.businessName,
          ownerName: doc.ownerName ?? "",
          businessEmail: doc.businessEmail ?? "",
          businessPhone: doc.businessPhone ?? "",
          businessCategory: doc.businessCategory ?? "",
          website: doc.website ?? "",
          address: doc.address ?? "",
          description: doc.description ?? "",
          businessImages: Array.isArray(doc.businessImages) ? doc.businessImages : [],
          products: Array.isArray(doc.products) ? doc.products : [],
          photoshoots: Array.isArray(doc.photoshoots) ? doc.photoshoots : [],
          storageFolders: doc.storageFolders ?? {},
          createdAt: doc.createdAt ?? null,
          updatedAt: doc.updatedAt ?? null,
        },
      });
    }

    const filters: Array<Record<string, string>> = [];
    if (userId) filters.push({ ownerUserId: userId });
    if (sessionEmail) filters.push({ ownerEmail: sessionEmail });
    if (queryEmail) filters.push({ ownerEmail: queryEmail });

    if (filters.length === 0) {
      return NextResponse.json({ sellers: [] });
    }

    const docs = await SellerModel.find(filters.length > 1 ? { $or: filters } : filters[0])
      .sort({ updatedAt: -1, createdAt: -1 })
      .limit(50)
      .lean();

    const sellers = docs.map((doc) => ({
      sellerId: doc.sellerId,
      businessName: doc.businessName,
      ownerName: doc.ownerName ?? "",
      businessEmail: doc.businessEmail ?? "",
      businessCategory: doc.businessCategory ?? "",
      productCount: Array.isArray(doc.products) ? doc.products.length : 0,
      businessImageCount: Array.isArray(doc.businessImages) ? doc.businessImages.length : 0,
      photoshootCount: Array.isArray(doc.photoshoots) ? doc.photoshoots.length : 0,
      updatedAt: doc.updatedAt ?? null,
    }));

    return NextResponse.json({ sellers });
  } catch (err) {
    console.error("[seller GET]", err);
    return NextResponse.json({ error: "Failed to fetch sellers" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = getSessionUserId(session);
  const sessionEmail = session?.user?.email?.trim().toLowerCase() ?? "";

  let body: CreateSellerBody;
  try {
    body = (await request.json()) as CreateSellerBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const businessName = clean(body.businessName, 140);
  if (!businessName) {
    return NextResponse.json({ error: "businessName is required" }, { status: 400 });
  }

  const rawProducts = Array.isArray(body.products) ? (body.products as SellerProductInput[]) : [];
  if (rawProducts.length === 0) {
    return NextResponse.json({ error: "At least one product is required" }, { status: 400 });
  }

  const businessImages = sanitizeAssets(body.businessImages);

  const products: Array<{
    productId: string;
    name: string;
    category: string;
    description?: string;
    price?: number;
    images: ReturnType<typeof sanitizeAssets>;
    createdAt: Date;
    updatedAt: Date;
  }> = [];

  for (let i = 0; i < rawProducts.length; i += 1) {
    const raw = rawProducts[i];
    const name = clean(raw.name, 140);
    const category = clean(raw.category, 120);
    if (!name || !category) {
      return NextResponse.json({ error: `Product ${i + 1} requires name and category` }, { status: 400 });
    }
    products.push({
      productId: crypto.randomUUID(),
      name,
      category,
      description: clean(raw.description, 800) || undefined,
      price: cleanOptionalNumber(raw.price),
      images: sanitizeAssets(raw.images),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  const requestedSellerId = cleanId(body.sellerId);
  const sellerId = requestedSellerId || crypto.randomUUID();
  const ownerEmail =
    sessionEmail ||
    clean(body.ownerEmail ?? body.businessEmail, 180).toLowerCase() ||
    undefined;

  const storageBase = `seller/${sellerId}`;

  try {
    await connectMongo();
    const existing = await SellerModel.findOne({ sellerId }).select("sellerId").lean();
    if (existing) {
      return NextResponse.json({ error: "sellerId already exists" }, { status: 409 });
    }

    await SellerModel.create({
      sellerId,
      ownerUserId: userId ?? undefined,
      ownerEmail,
      businessName,
      ownerName: clean(body.ownerName, 120) || undefined,
      businessEmail: clean(body.businessEmail, 180) || undefined,
      businessPhone: clean(body.businessPhone, 40) || undefined,
      businessCategory: clean(body.businessCategory, 120) || undefined,
      website: clean(body.website, 220) || undefined,
      address: clean(body.address, 260) || undefined,
      description: clean(body.description, 1200) || undefined,
      businessImages,
      products,
      photoshoots: [],
      storageFolders: {
        base: storageBase,
        businessImages: `${storageBase}/business`,
        products: `${storageBase}/products`,
        photoshoots: `${storageBase}/photoshoots`,
      },
    });

    return NextResponse.json({ sellerId }, { status: 201 });
  } catch (err) {
    console.error("[seller POST]", err);
    return NextResponse.json({ error: "Failed to create seller" }, { status: 500 });
  }
}
