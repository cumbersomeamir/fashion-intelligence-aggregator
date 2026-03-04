"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type SellerAsset = {
  assetId: string;
  url: string;
  key?: string;
  label?: string;
};

type SellerProduct = {
  productId: string;
  name: string;
  category: string;
  description?: string;
  price?: number;
  images: SellerAsset[];
};

type SellerPhotoshoot = {
  photoshootId: string;
  productId: string;
  productName?: string;
  referenceImageUrl?: string;
  generatedImageUrl: string;
  createdAt?: string;
};

type SellerDetail = {
  sellerId: string;
  businessName: string;
  products: SellerProduct[];
  photoshoots: SellerPhotoshoot[];
};

function isPrivateSellerS3Url(url: string): boolean {
  return /^https?:\/\/[^/]+\.s3\.[^/]+\.amazonaws\.com\/seller\//i.test(url);
}

function getDisplayImageUrl(url: string): string {
  if (isPrivateSellerS3Url(url)) {
    return `/api/seller/image?url=${encodeURIComponent(url)}`;
  }
  return url;
}

function formatDate(date: string | undefined): string {
  if (!date) return "";
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString();
}

async function imageUrlToBase64(url: string): Promise<{ base64: string; mime: string }> {
  const res = await fetch(getDisplayImageUrl(url), { cache: "no-store" });
  if (!res.ok) {
    throw new Error("Failed to load saved reference image");
  }
  const blob = await res.blob();
  const mime = blob.type || "image/jpeg";
  const reader = new FileReader();
  const base64 = await new Promise<string>((resolve, reject) => {
    reader.onload = () => {
      const raw = typeof reader.result === "string" ? reader.result : "";
      resolve(raw.includes(",") ? raw.split(",")[1] : raw);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
  return { base64, mime };
}

interface SellerGenerateContentProps {
  initialSellerId?: string;
}

export function SellerGenerateContent({ initialSellerId = "" }: SellerGenerateContentProps) {

  const [sellerIdInput, setSellerIdInput] = useState(initialSellerId);
  const [seller, setSeller] = useState<SellerDetail | null>(null);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const selectedProduct = useMemo(
    () => seller?.products.find((product) => product.productId === selectedProductId) ?? null,
    [seller, selectedProductId]
  );

  async function fetchSellerById(sellerId: string) {
    setLoading(true);
    setError(null);
    setNotice(null);
    try {
      const res = await fetch(`/api/seller?sellerId=${encodeURIComponent(sellerId)}`, { cache: "no-store" });
      const data = (await res.json()) as { seller?: SellerDetail; error?: string };
      if (!res.ok || !data.seller) {
        throw new Error(data.error ?? "Seller not found");
      }
      setSeller(data.seller);
      const firstProductWithImage =
        data.seller.products.find((product) => Array.isArray(product.images) && product.images.length > 0) ??
        data.seller.products[0];
      const nextProductId = firstProductWithImage?.productId ?? "";
      setSelectedProductId(nextProductId);
      setNotice(`Loaded ${data.seller.businessName}`);
    } catch (err) {
      setSeller(null);
      setSelectedProductId("");
      setError(err instanceof Error ? err.message : "Failed to load seller");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!initialSellerId) return;
    void fetchSellerById(initialSellerId);
  }, [initialSellerId]);

  async function handleLoadSeller() {
    const sellerId = sellerIdInput.trim();
    if (!sellerId) {
      setError("Enter a seller ID.");
      return;
    }
    await fetchSellerById(sellerId);
  }

  async function handleGenerate() {
    setError(null);
    setNotice(null);
    setGeneratedImage(null);

    if (!seller?.sellerId) {
      setError("Load a seller first.");
      return;
    }
    if (!selectedProductId) {
      setError("Select a product.");
      return;
    }
    const selectedProductImageUrl = selectedProduct?.images?.[0]?.url?.trim() ?? "";
    if (!selectedProductImageUrl) {
      setError("Selected product has no image.");
      return;
    }
    setGenerating(true);
    setNotice("Generating photoshoot...");
    try {
      const saved = await imageUrlToBase64(selectedProductImageUrl);
      const referenceImageBase64 = saved.base64;
      const referenceImageMime = saved.mime;
      const referenceImageUrl = selectedProductImageUrl;

      const res = await fetch("/api/seller/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sellerId: seller.sellerId,
          productId: selectedProductId,
          referenceImageBase64,
          referenceImageMime,
          referenceImageUrl,
        }),
      });
      const data = (await res.json()) as { image?: string; error?: string };
      if (!res.ok || !data.image) {
        throw new Error(data.error ?? "Failed to generate photoshoot");
      }

      setGeneratedImage(data.image);
      setNotice("Photoshoot generated.");
      await fetchSellerById(seller.sellerId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate photoshoot");
    } finally {
      setGenerating(false);
    }
  }

  const photoshoots = seller?.photoshoots ?? [];
  const orderedPhotoshoots = [...photoshoots].sort((a, b) => {
    const aTime = new Date(a.createdAt ?? 0).getTime();
    const bTime = new Date(b.createdAt ?? 0).getTime();
    return bTime - aTime;
  });

  return (
    <div className="min-h-screen min-h-[100dvh] bg-[var(--bg)] px-4 sm:px-6 py-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between gap-3">
          <div>
            <h1 className="font-headline text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white">
              Seller Model Photoshoots
            </h1>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Select a product and generate a model-style campaign image.
            </p>
          </div>
          <Link
            href="/vendor-register"
            className="inline-flex items-center px-4 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            Back to Seller Form
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <section className="rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-4 sm:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                value={sellerIdInput}
                onChange={(e) => setSellerIdInput(e.target.value)}
                placeholder="Enter seller ID"
                className="flex-1 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-2"
              />
              <button
                type="button"
                onClick={() => void handleLoadSeller()}
                disabled={loading}
                className="px-4 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-60"
              >
                {loading ? "Loading..." : "Load Seller"}
              </button>
            </div>

            {seller && (
              <>
                <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 p-3 bg-zinc-50/70 dark:bg-zinc-800/40">
                  <p className="text-sm font-medium text-zinc-900 dark:text-white">{seller.businessName}</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                    Seller ID: {seller.sellerId}
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-800 dark:text-zinc-200">Select Product</label>
                  <select
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                    className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-2"
                  >
                    {seller.products.map((product) => (
                      <option key={product.productId} value={product.productId}>
                        {product.name} ({product.category})
                      </option>
                    ))}
                  </select>
                </div>

                {selectedProduct?.images?.[0]?.url && (
                  <div className="rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800">
                    <img
                      src={getDisplayImageUrl(selectedProduct.images[0].url)}
                      alt={selectedProduct.name}
                      className="w-full h-56 object-cover"
                    />
                  </div>
                )}

                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Reference source: selected product image only.
                </p>

                <button
                  type="button"
                  onClick={() => void handleGenerate()}
                  disabled={generating}
                  className="w-full px-5 py-3 rounded-xl bg-gradient-accent text-white font-semibold disabled:opacity-60"
                >
                  {generating ? "Generating..." : "Generate Photoshoot"}
                </button>
              </>
            )}

            {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
            {notice && <p className="text-sm text-emerald-600 dark:text-emerald-400">{notice}</p>}
          </section>

          <section className="rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-4 sm:p-6">
            <h2 className="font-semibold text-zinc-900 dark:text-white mb-3">Generated Output</h2>
            <div className="relative rounded-xl border border-zinc-200 dark:border-zinc-700 bg-black min-h-[380px] flex items-center justify-center overflow-hidden">
              {generatedImage ? (
                <img src={getDisplayImageUrl(generatedImage)} alt="Generated photoshoot" className="w-full h-full object-contain" />
              ) : (
                <p className="text-sm text-zinc-400">Your generated image will appear here.</p>
              )}
              {generating && (
                <div className="absolute inset-0 bg-black/55 flex items-center justify-center">
                  <p className="text-sm text-white">Generating photoshoot...</p>
                </div>
              )}
            </div>
            {generatedImage && (
              <a
                href={getDisplayImageUrl(generatedImage)}
                download={`seller-photoshoot-${Date.now()}.png`}
                className="mt-3 inline-flex items-center px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                Download Image
              </a>
            )}

            <h3 className="mt-6 mb-2 font-medium text-zinc-900 dark:text-white">Photoshoot History</h3>
            {orderedPhotoshoots.length === 0 ? (
              <p className="text-sm text-zinc-500 dark:text-zinc-400">No generated photoshoots yet.</p>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {orderedPhotoshoots.map((item) => (
                  <div key={item.photoshootId} className="rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800">
                    <img
                      src={getDisplayImageUrl(item.generatedImageUrl)}
                      alt={item.productName || "Generated photoshoot"}
                      className="w-full h-28 object-cover"
                    />
                    <div className="p-2">
                      <p className="text-[11px] font-medium text-zinc-800 dark:text-zinc-200 line-clamp-1">
                        {item.productName || "Product Photoshoot"}
                      </p>
                      <p className="text-[10px] text-zinc-500 dark:text-zinc-400 line-clamp-1">
                        {formatDate(item.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
