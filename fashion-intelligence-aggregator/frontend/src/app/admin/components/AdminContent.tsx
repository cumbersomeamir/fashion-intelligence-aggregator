"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type ReelItem = {
  id: string;
  creator: string;
  title: string;
  brand: string;
  priceHint: string;
  baseImageUrl: string;
};

export function AdminContent() {
  const [creator, setCreator] = useState("@");
  const [title, setTitle] = useState("");
  const [brand, setBrand] = useState("");
  const [priceHint, setPriceHint] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reels, setReels] = useState<ReelItem[]>([]);

  const canSubmit = useMemo(
    () => !!creator.trim() && !!title.trim() && !!brand.trim() && !!priceHint.trim() && !!imageUrl.trim() && !saving,
    [brand, creator, imageUrl, priceHint, saving, title]
  );

  const loadReels = useCallback(async () => {
    try {
      const res = await fetch("/api/reels/items");
      const data = (await res.json()) as { reels?: ReelItem[] };
      if (!res.ok) return;
      setReels(Array.isArray(data.reels) ? data.reels : []);
    } catch {}
  }, []);

  useEffect(() => {
    loadReels();
  }, [loadReels]);

  const onFileUpload = useCallback(async (file: File | null) => {
    if (!file) return;
    setError(null);
    setNotice(null);
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/reels/upload-image", { method: "POST", body: form });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        throw new Error(data.error ?? "Upload failed");
      }
      setImageUrl(data.url);
      setNotice("Image uploaded");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }, []);

  const onSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!canSubmit) return;
      setSaving(true);
      setError(null);
      setNotice(null);
      try {
        const res = await fetch("/api/reels/items", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            creator: creator.trim(),
            title: title.trim(),
            brand: brand.trim(),
            priceHint: priceHint.trim(),
            baseImageUrl: imageUrl.trim(),
          }),
        });
        const data = (await res.json()) as { error?: string };
        if (!res.ok) throw new Error(data.error ?? "Failed to save reel");

        setTitle("");
        setBrand("");
        setPriceHint("");
        setImageUrl("");
        setNotice("Reel added and now visible on /reels");
        await loadReels();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to save reel");
      } finally {
        setSaving(false);
      }
    },
    [brand, canSubmit, creator, imageUrl, loadReels, priceHint, title]
  );

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-10">
      <h1 className="font-headline text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white">Admin Reels Upload</h1>
      <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">Create a reel item that will appear on the /reels feed.</p>

      <form onSubmit={onSubmit} className="mt-6 rounded-2xl glass-card p-4 sm:p-6 space-y-3">
        <input value={creator} onChange={(e) => setCreator(e.target.value)} placeholder="@creator" className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-2" />
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Reel title" className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-2" />
        <input value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="Brand" className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-2" />
        <input value={priceHint} onChange={(e) => setPriceHint(e.target.value)} placeholder="$199" className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-2" />
        <div className="flex flex-col sm:flex-row gap-2">
          <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="Image URL (autofilled after upload)" className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-2" />
          <label className="inline-flex items-center justify-center px-4 py-2 rounded-xl border border-zinc-300 dark:border-zinc-600 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800">
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={(e) => void onFileUpload(e.target.files?.[0] ?? null)}
            />
            {uploading ? "Uploading..." : "Upload Image"}
          </label>
        </div>

        <button
          type="submit"
          disabled={!canSubmit}
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-accent text-white font-semibold disabled:opacity-50"
        >
          {saving ? "Saving..." : "Add Reel"}
        </button>
        {notice && <p className="text-sm text-emerald-600 dark:text-emerald-400">{notice}</p>}
        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
      </form>

      <div className="mt-8">
        <h2 className="font-semibold text-zinc-900 dark:text-white mb-3">Current Reels</h2>
        <div className="space-y-2">
          {reels.map((reel) => (
            <div key={reel.id} className="rounded-xl glass-section p-3">
              <p className="text-sm font-medium text-zinc-900 dark:text-white">{reel.title}</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">{reel.creator} | {reel.brand} | {reel.priceHint}</p>
            </div>
          ))}
          {reels.length === 0 && (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">No reels yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
