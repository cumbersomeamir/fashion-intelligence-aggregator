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

  return (
    <div className="mx-auto max-w-2xl px-3 sm:px-4 py-6 sm:py-8 min-w-0">
      <Card className="p-4 sm:p-6">
        <h1 className="font-headline text-xl sm:text-2xl font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
          Personalize
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mb-5 sm:mb-6">
          Style preference chips + body data. Saved to global profile. UI copy references Personalization Embeddings.
        </p>
        <div className="flex flex-wrap gap-2 mb-5 sm:mb-6">
          {STYLE_OPTIONS.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => toggle(tag)}
              className={`
                min-h-[44px] px-4 py-2.5 sm:min-h-0 sm:px-3 sm:py-1.5 rounded-full text-sm transition-colors touch-manipulation active:scale-[0.98]
                ${
                  selected.includes(tag)
                    ? "bg-accent text-white"
                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700"
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
          className="w-full sm:w-auto min-h-[48px] sm:min-h-0 rounded-xl bg-accent text-white px-6 py-3 sm:py-2.5 font-medium hover:bg-accent/90 active:bg-accent/80 transition-colors touch-manipulation"
        >
          {saved ? "Saved" : "Save to profile"}
        </button>
      </Card>
    </div>
  );
}
