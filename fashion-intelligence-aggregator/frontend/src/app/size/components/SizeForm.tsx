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
    <div className="mx-auto max-w-xl px-3 sm:px-4 py-6 sm:py-8 min-w-0">
      <Card highlight={highlightSize} className="p-4 sm:p-6">
        <h1 className="font-headline text-xl sm:text-2xl font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
          Size & Measurement
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mb-5 sm:mb-6">
          Body measurements. Good Fit triggers soft haptic when supported.
        </p>
        <div className="space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Height (cm)</span>
            <input
              type="number"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              className="mt-1 w-full min-h-[48px] rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-accent touch-manipulation"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Weight (kg)</span>
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="mt-1 w-full min-h-[48px] rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-accent touch-manipulation"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Chest (in)</span>
            <input
              type="number"
              value={chest}
              onChange={(e) => setChest(e.target.value)}
              className="mt-1 w-full min-h-[48px] rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-accent touch-manipulation"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Waist (in)</span>
            <input
              type="number"
              value={waist}
              onChange={(e) => setWaist(e.target.value)}
              className="mt-1 w-full min-h-[48px] rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-accent touch-manipulation"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Hips (in)</span>
            <input
              type="number"
              value={hips}
              onChange={(e) => setHips(e.target.value)}
              className="mt-1 w-full min-h-[48px] rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-accent touch-manipulation"
            />
          </label>
          <button
            type="button"
            onClick={handleCheckFit}
            disabled={fitStatus === "checking"}
            className="mt-4 w-full min-h-[48px] rounded-xl bg-accent text-white py-3 font-medium hover:bg-accent/90 active:bg-accent/80 disabled:opacity-50 transition-colors touch-manipulation"
          >
            {fitStatus === "checking" ? "Checking…" : "Check Fit"}
          </button>
          {fitStatus === "good-fit" && (
            <p className="text-center text-accent font-medium">Good Fit</p>
          )}
          {fitStatus === "adjust" && (
            <p className="text-center text-zinc-500 dark:text-zinc-400 text-sm">
              Add chest, waist, and hips for a fit check.
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}
