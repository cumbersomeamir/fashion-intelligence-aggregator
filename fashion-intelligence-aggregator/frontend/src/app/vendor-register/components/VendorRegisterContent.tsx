"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type UploadedAsset = {
  assetId: string;
  url: string;
  key?: string;
  label?: string;
};

type ProductDraft = {
  id: string;
  name: string;
  category: string;
  description: string;
  price: string;
  images: UploadedAsset[];
  uploading: boolean;
};

type SellerCreateResponse = {
  sellerId?: string;
  error?: string;
};

function newProductDraft(): ProductDraft {
  return {
    id: crypto.randomUUID(),
    name: "",
    category: "",
    description: "",
    price: "",
    images: [],
    uploading: false,
  };
}

function isPrivateSellerS3Url(url: string): boolean {
  return /^https?:\/\/[^/]+\.s3\.[^/]+\.amazonaws\.com\/seller\//i.test(url);
}

function getDisplayImageUrl(url: string): string {
  if (isPrivateSellerS3Url(url)) {
    return `/api/seller/image?url=${encodeURIComponent(url)}`;
  }
  return url;
}

export function VendorRegisterContent() {
  const draftId = useMemo(() => crypto.randomUUID(), []);

  const [businessName, setBusinessName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [businessEmail, setBusinessEmail] = useState("");
  const [businessPhone, setBusinessPhone] = useState("");
  const [businessCategory, setBusinessCategory] = useState("");
  const [website, setWebsite] = useState("");
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");

  const [businessImages, setBusinessImages] = useState<UploadedAsset[]>([]);
  const [products, setProducts] = useState<ProductDraft[]>([newProductDraft()]);
  const [uploadingBusiness, setUploadingBusiness] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [createdSellerId, setCreatedSellerId] = useState<string | null>(null);

  async function uploadImage(
    file: File,
    options: { scope: string; productId?: string; sellerId?: string }
  ): Promise<UploadedAsset> {
    const form = new FormData();
    form.append("file", file);
    form.append("scope", options.scope);
    form.append("draftId", draftId);
    if (options.productId) form.append("productId", options.productId);
    if (options.sellerId) form.append("sellerId", options.sellerId);

    const res = await fetch("/api/seller/upload-image", { method: "POST", body: form });
    const data = (await res.json()) as { assetId?: string; url?: string; key?: string; error?: string };
    if (!res.ok || !data.url) {
      throw new Error(data.error ?? "Image upload failed");
    }

    return {
      assetId: data.assetId ?? crypto.randomUUID(),
      url: data.url,
      key: data.key,
    };
  }

  async function onBusinessImageFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setError(null);
    setNotice(null);
    setUploadingBusiness(true);
    try {
      const uploaded: UploadedAsset[] = [];
      for (const file of Array.from(files)) {
        uploaded.push(await uploadImage(file, { scope: "business", sellerId: createdSellerId ?? undefined }));
      }
      setBusinessImages((prev) => [...prev, ...uploaded]);
      setNotice("Business image(s) uploaded.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload business images");
    } finally {
      setUploadingBusiness(false);
    }
  }

  async function onProductImageFiles(productId: string, files: FileList | null) {
    if (!files || files.length === 0) return;
    setError(null);
    setNotice(null);

    setProducts((prev) => prev.map((p) => (p.id === productId ? { ...p, uploading: true } : p)));
    try {
      const uploaded: UploadedAsset[] = [];
      for (const file of Array.from(files)) {
        uploaded.push(
          await uploadImage(file, {
            scope: "products",
            productId,
            sellerId: createdSellerId ?? undefined,
          })
        );
      }
      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, images: [...p.images, ...uploaded] } : p))
      );
      setNotice("Product image(s) uploaded.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload product images");
    } finally {
      setProducts((prev) => prev.map((p) => (p.id === productId ? { ...p, uploading: false } : p)));
    }
  }

  function updateProduct(id: string, patch: Partial<ProductDraft>) {
    setProducts((prev) => prev.map((product) => (product.id === id ? { ...product, ...patch } : product)));
  }

  function removeProduct(id: string) {
    setProducts((prev) => {
      const next = prev.filter((product) => product.id !== id);
      return next.length > 0 ? next : [newProductDraft()];
    });
  }

  function removeProductImage(productId: string, assetId: string) {
    setProducts((prev) =>
      prev.map((product) =>
        product.id === productId
          ? { ...product, images: product.images.filter((image) => image.assetId !== assetId) }
          : product
      )
    );
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setNotice(null);
    setCreatedSellerId(null);

    if (!businessName.trim()) {
      setError("Business name is required.");
      return;
    }

    const normalizedProducts = products.filter(
      (product) => product.name.trim() && product.category.trim()
    );
    if (normalizedProducts.length === 0) {
      setError("Add at least one product with name and category.");
      return;
    }

    const productWithoutImage = normalizedProducts.find((product) => product.images.length === 0);
    if (productWithoutImage) {
      setError(`Upload at least one image for product "${productWithoutImage.name}".`);
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        sellerId: draftId,
        businessName: businessName.trim(),
        ownerName: ownerName.trim(),
        ownerEmail: ownerEmail.trim(),
        businessEmail: businessEmail.trim(),
        businessPhone: businessPhone.trim(),
        businessCategory: businessCategory.trim(),
        website: website.trim(),
        address: address.trim(),
        description: description.trim(),
        businessImages,
        products: normalizedProducts.map((product) => ({
          name: product.name.trim(),
          category: product.category.trim(),
          description: product.description.trim(),
          price: product.price.trim() ? Number(product.price.trim()) : undefined,
          images: product.images,
        })),
      };

      const res = await fetch("/api/seller", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as SellerCreateResponse;
      if (!res.ok || !data.sellerId) {
        throw new Error(data.error ?? "Failed to register seller");
      }

      setCreatedSellerId(data.sellerId);
      setNotice("Seller registered successfully. You can now generate product photoshoots.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to register seller");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen min-h-[100dvh] bg-[var(--bg)] px-4 sm:px-6 py-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-center justify-between gap-3">
          <div>
            <h1 className="font-headline text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white">
              Seller Registration
            </h1>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Register your business, upload products, and start model photoshoots.
            </p>
          </div>
          <Link
            href="/login"
            className="inline-flex items-center px-4 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 text-sm text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            Back to Login
          </Link>
        </div>

        <form onSubmit={onSubmit} className="space-y-6">
          <section className="rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-4 sm:p-6">
            <h2 className="font-semibold text-zinc-900 dark:text-white">Business Details</h2>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="Business name *"
                className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-2"
              />
              <input
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                placeholder="Owner name"
                className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-2"
              />
              <input
                value={ownerEmail}
                onChange={(e) => setOwnerEmail(e.target.value)}
                placeholder="Owner email"
                className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-2"
              />
              <input
                value={businessEmail}
                onChange={(e) => setBusinessEmail(e.target.value)}
                placeholder="Business email"
                className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-2"
              />
              <input
                value={businessPhone}
                onChange={(e) => setBusinessPhone(e.target.value)}
                placeholder="Business phone"
                className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-2"
              />
              <input
                value={businessCategory}
                onChange={(e) => setBusinessCategory(e.target.value)}
                placeholder="Business category (e.g. Streetwear)"
                className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-2"
              />
              <input
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="Website"
                className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 sm:col-span-2"
              />
              <input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Address"
                className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 sm:col-span-2"
              />
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Business description"
                rows={3}
                className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 sm:col-span-2"
              />
            </div>
          </section>

          <section className="rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-4 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-semibold text-zinc-900 dark:text-white">Business Photos</h2>
              <label className="inline-flex items-center justify-center px-4 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 text-sm cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  multiple
                  className="hidden"
                  onChange={(e) => void onBusinessImageFiles(e.target.files)}
                />
                {uploadingBusiness ? "Uploading..." : "Upload Images"}
              </label>
            </div>
            {businessImages.length > 0 ? (
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                {businessImages.map((image) => (
                  <div key={image.assetId} className="rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800">
                    <img
                      src={getDisplayImageUrl(image.url)}
                      alt="Business"
                      className="w-full h-24 object-cover"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">
                Upload photos for your business storefront/branding.
              </p>
            )}
          </section>

          <section className="rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-4 sm:p-6">
            <div className="flex items-center justify-between gap-3 mb-4">
              <h2 className="font-semibold text-zinc-900 dark:text-white">Products</h2>
              <button
                type="button"
                onClick={() => setProducts((prev) => [...prev, newProductDraft()])}
                className="px-4 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                Add Item
              </button>
            </div>

            <div className="space-y-4">
              {products.map((product, index) => (
                <div
                  key={product.id}
                  className="rounded-xl border border-zinc-200 dark:border-zinc-700 p-3 sm:p-4 bg-zinc-50/60 dark:bg-zinc-800/40"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                      Product #{index + 1}
                    </p>
                    <button
                      type="button"
                      onClick={() => removeProduct(product.id)}
                      className="text-xs text-red-600 dark:text-red-400 hover:underline"
                    >
                      Delete Item
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      value={product.name}
                      onChange={(e) => updateProduct(product.id, { name: e.target.value })}
                      placeholder="Product name *"
                      className="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2"
                    />
                    <input
                      value={product.category}
                      onChange={(e) => updateProduct(product.id, { category: e.target.value })}
                      placeholder="Category *"
                      className="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2"
                    />
                    <input
                      value={product.price}
                      onChange={(e) => updateProduct(product.id, { price: e.target.value })}
                      placeholder="Price"
                      className="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2"
                    />
                    <div className="flex items-center">
                      <label className="inline-flex items-center justify-center px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 text-sm cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800">
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp,image/gif"
                          multiple
                          className="hidden"
                          onChange={(e) => void onProductImageFiles(product.id, e.target.files)}
                        />
                        {product.uploading ? "Uploading..." : "Upload Product Images"}
                      </label>
                    </div>
                    <textarea
                      value={product.description}
                      onChange={(e) => updateProduct(product.id, { description: e.target.value })}
                      placeholder="Product description"
                      rows={2}
                      className="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 sm:col-span-2"
                    />
                  </div>

                  {product.images.length > 0 && (
                    <div className="mt-3 grid grid-cols-2 sm:grid-cols-5 gap-2">
                      {product.images.map((image) => (
                        <div key={image.assetId} className="relative rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-700">
                          <img
                            src={getDisplayImageUrl(image.url)}
                            alt={product.name || "Product image"}
                            className="w-full h-20 object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => removeProductImage(product.id, image.assetId)}
                            className="absolute top-1 right-1 h-5 w-5 rounded-full bg-black/60 text-white text-xs"
                            aria-label="Delete image"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-3 rounded-xl bg-gradient-accent text-white font-semibold disabled:opacity-60"
            >
              {submitting ? "Saving..." : "Register Seller"}
            </button>
            {createdSellerId && (
              <Link
                href={`/seller/generate?sellerId=${encodeURIComponent(createdSellerId)}`}
                className="inline-flex items-center px-6 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                Open Model Photoshoots
              </Link>
            )}
          </div>

          {notice && <p className="text-sm text-emerald-600 dark:text-emerald-400">{notice}</p>}
          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
        </form>
      </div>
    </div>
  );
}
