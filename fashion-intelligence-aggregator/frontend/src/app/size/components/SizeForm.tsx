"use client";

import { useState } from "react";
import { Card } from "@/components/Card";
import { useStore } from "@/state/store";
import { useVibrate } from "@/lib/useVibrate";

type FitStatus = "idle" | "checking" | "good-fit" | "adjust";

export function SizeForm() {
  const vibrate = useVibrate();
  const { profile, setProfile, currentTopic } = useStore();
  const [height, setHeight] = useState(profile?.measurements?.height ?? "");
  const [weight, setWeight] = useState(profile?.measurements?.weight ?? "");
  const [chest, setChest] = useState(profile?.measurements?.chest ?? "");
  const [waist, setWaist] = useState(profile?.measurements?.waist ?? "");
  const [hips, setHips] = useState(profile?.measurements?.hips ?? "");
  const [fitStatus, setFitStatus] = useState<FitStatus>("idle");

  const handleCheckFit = () => {
    setProfile({
      ...profile ?? {},
      measurements: {
        height: height ? Number(height) : undefined,
        weight: weight ? Number(weight) : undefined,
        chest: chest ? Number(chest) : undefined,
        waist: waist ? Number(waist) : undefined,
        hips: hips ? Number(hips) : undefined,
      },
    });
    setFitStatus("checking");
    setTimeout(() => {
      const hasEnough = [chest, waist, hips].filter(Boolean).length >= 2;
      if (hasEnough) {
        setFitStatus("good-fit");
        vibrate(10);
      } else {
        setFitStatus("adjust");
      }
    }, 800);
  };

  const highlightSize = currentTopic === "Fit";

  return (
    <div className="mx-auto max-w-xl px-3 sm:px-4 py-5 sm:py-6 min-w-0">
      <Card highlight={highlightSize} pulse={highlightSize} className="p-4 sm:p-6 shadow-md">
        <h1 className="font-headline text-xl sm:text-2xl font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
          Size & Measurement
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mb-4">
          Body measurements. Good Fit triggers soft haptic when supported.
        </p>

        {fitStatus !== "idle" && (
          <div className="mb-4 flex justify-center">
            {fitStatus === "good-fit" && (
              <span className="animate-good-fit inline-flex items-center gap-2 rounded-full bg-emerald-500/20 px-4 py-2 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                ✓ Good Fit
              </span>
            )}
            {fitStatus === "adjust" && (
              <span className="inline-flex items-center gap-2 rounded-full bg-amber-500/20 px-4 py-2 text-sm font-medium text-amber-700 dark:text-amber-400">
                Add chest, waist & hips
              </span>
            )}
            {fitStatus === "checking" && (
              <span className="inline-flex items-center gap-2 rounded-full bg-zinc-200 dark:bg-zinc-700 px-4 py-2 text-sm text-zinc-600 dark:text-zinc-400">
                Checking…
              </span>
            )}
          </div>
        )}

        <div className="space-y-4">
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 p-3 sm:p-4 space-y-3 bg-zinc-50/50 dark:bg-zinc-800/30">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Body</p>
            <label className="block">
              <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Height (cm)</span>
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className="mt-1 w-full min-h-[44px] rounded-lg border border-zinc-200 dark:border-zinc-600 bg-white dark:bg-zinc-800 px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-accent touch-manipulation"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Weight (kg)</span>
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="mt-1 w-full min-h-[44px] rounded-lg border border-zinc-200 dark:border-zinc-600 bg-white dark:bg-zinc-800 px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-accent touch-manipulation"
              />
            </label>
          </div>
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 p-3 sm:p-4 space-y-3 bg-zinc-50/50 dark:bg-zinc-800/30">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Measurements</p>
            <label className="block">
              <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Chest (in)</span>
              <input
                type="number"
                value={chest}
                onChange={(e) => setChest(e.target.value)}
                className="mt-1 w-full min-h-[44px] rounded-lg border border-zinc-200 dark:border-zinc-600 bg-white dark:bg-zinc-800 px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-accent touch-manipulation"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Waist (in)</span>
              <input
                type="number"
                value={waist}
                onChange={(e) => setWaist(e.target.value)}
                className="mt-1 w-full min-h-[44px] rounded-lg border border-zinc-200 dark:border-zinc-600 bg-white dark:bg-zinc-800 px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-accent touch-manipulation"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Hips (in)</span>
              <input
                type="number"
                value={hips}
                onChange={(e) => setHips(e.target.value)}
                className="mt-1 w-full min-h-[44px] rounded-lg border border-zinc-200 dark:border-zinc-600 bg-white dark:bg-zinc-800 px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-accent touch-manipulation"
              />
            </label>
          </div>
          <button
            type="button"
            onClick={handleCheckFit}
            disabled={fitStatus === "checking"}
            className="w-full min-h-[48px] rounded-xl bg-accent text-white py-3 font-semibold hover:bg-accent/90 focus:ring-2 focus:ring-accent focus:ring-offset-2 active:bg-accent/80 disabled:opacity-50 transition-all duration-200 touch-manipulation"
          >
            {fitStatus === "checking" ? "Checking…" : "Check Fit"}
          </button>
        </div>
      </Card>
    </div>
  );
}
