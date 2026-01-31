"use client";

import { useState } from "react";
import { Card } from "@/components/Card";
import { useStore } from "@/state/store";
import { saveProfile } from "@/lib/api";

const STYLE_OPTIONS = [
  "minimal", "classic", "Scandinavian", "trendy", "relaxed", "professional",
  "preppy", "urban", "sustainable", "luxe", "modern", "cozy",
];

export function PersonalizeForm() {
  const { profile, setProfile } = useStore();
  const [selected, setSelected] = useState<string[]>(profile?.stylePrefs ?? []);
  const [saved, setSaved] = useState(false);

  const toggle = (tag: string) => {
    setSelected((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSave = async () => {
    const next = { ...profile, stylePrefs: selected, measurements: profile?.measurements };
    setProfile(next);
    try {
      await saveProfile(next);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      setProfile(next);
    }
  };

  const hasSaved = (profile?.stylePrefs?.length ?? 0) > 0;

  return (
    <div className="mx-auto max-w-2xl px-3 sm:px-4 py-4 sm:py-6 min-w-0">
      <Card className="p-4 sm:p-5 shadow-md bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm">
        <h1 className="font-headline text-xl sm:text-2xl font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
          Personalize
        </h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4">
          Personalization Embeddings — your choices affect <span className="font-medium text-accent">Recommendations</span>.
        </p>

        {hasSaved && (
          <div className="mb-4 p-3 rounded-xl bg-accent/10 dark:bg-accent/20 border border-accent/20">
            <p className="text-xs font-semibold uppercase tracking-wider text-accent mb-1.5">Saved preferences</p>
            <div className="flex flex-wrap gap-1.5">
              {(profile?.stylePrefs ?? []).map((p) => (
                <span key={p} className="px-2 py-0.5 rounded-full bg-accent/20 text-accent text-xs font-medium">
                  {p}
                </span>
              ))}
            </div>
          </div>
        )}

        <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
          Style preferences
        </p>
        <div className="flex flex-wrap gap-2 mb-4">
          {STYLE_OPTIONS.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => toggle(tag)}
              className={`
                min-h-[44px] px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-200 touch-manipulation active:scale-[0.98]
                shadow-sm
                ${
                  selected.includes(tag)
                    ? "bg-accent text-white shadow-md ring-2 ring-accent/30"
                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 border border-zinc-200/60 dark:border-zinc-700/60"
                }
              `}
            >
              {tag}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={handleSave}
          className="w-full min-h-[48px] rounded-xl bg-accent text-white px-6 py-3 font-semibold hover:bg-accent/90 focus:ring-2 focus:ring-accent focus:ring-offset-2 active:bg-accent/80 transition-all touch-manipulation"
        >
          {saved ? "✓ Saved to profile" : "Save to profile"}
        </button>
      </Card>
    </div>
  );
}
