"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { saveProfile } from "@/lib/api";
import type {
  FitPreference,
  SleevePreference,
  LengthPreference,
  BudgetSensitivity,
  OccasionFrequency,
  Climate,
} from "@/types";

const STYLE_OPTIONS = [
  "minimal",
  "classic",
  "Scandinavian",
  "trendy",
  "relaxed",
  "professional",
  "preppy",
  "urban",
  "sustainable",
  "luxe",
  "modern",
  "cozy",
];

const FIT_OPTIONS: FitPreference[] = ["slim", "regular", "relaxed", "oversized"];
const SLEEVE_OPTIONS: SleevePreference[] = ["short", "long", "no preference"];
const LENGTH_OPTIONS: LengthPreference[] = ["cropped", "standard", "long"];

const BUDGET_TIERS = [
  { id: "500-1000", label: "$50 - $100" },
  { id: "1000-3000", label: "$100 - $300" },
  { id: "3000+", label: "$300+" },
];
const BUDGET_SENSITIVITY: BudgetSensitivity[] = ["value", "balanced", "premium"];

const OCCASION_OPTIONS = ["work", "casual", "party", "gym", "travel", "ethnic", "formal"];
const OCCASION_FREQUENCY: OccasionFrequency[] = ["daily", "occasional", "rare"];

const FABRIC_OPTIONS = ["cotton", "wool", "linen", "synthetics", "blends"];
const FABRIC_SENSITIVITIES = ["breathable", "stretch", "wrinkle-resistant", "skin-sensitive"];

const CLIMATE_OPTIONS: Climate[] = ["hot", "moderate", "cold"];

const STEPS = [
  { id: 1, title: "About you", short: "Name" },
  { id: 2, title: "Body & fit", short: "Measurements" },
  { id: 3, title: "Style & budget", short: "Preferences" },
  { id: 4, title: "Brands & style", short: "Final" },
];

function ChipMulti({
  options,
  selected,
  onToggle,
  label,
}: {
  options: string[];
  selected: string[];
  onToggle: (opt: string) => void;
  label?: string;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onToggle(opt)}
          className={`
            min-h-[40px] px-4 py-2 rounded-xl text-xs font-medium transition-all duration-300 touch-manipulation
            ${
              selected.includes(opt)
                ? "bg-gradient-accent text-white shadow-button"
                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 border border-[var(--border-subtle)]"
            }
          `}
        >
          {label ? opt.replace(/_/g, " ") : opt}
        </button>
      ))}
    </div>
  );
}

function ChipSingle<T extends string>({
  options,
  value,
  onChange,
  labels,
}: {
  options: T[];
  value: T | undefined;
  onChange: (v: T) => void;
  labels?: Record<T, string>;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={`
            min-h-[40px] px-4 py-2 rounded-xl text-xs font-medium transition-all duration-300 touch-manipulation
            ${
              value === opt
                ? "bg-gradient-accent text-white shadow-button"
                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 border border-[var(--border-subtle)]"
            }
          `}
        >
          {labels?.[opt] ?? opt}
        </button>
      ))}
    </div>
  );
}

function NumInput({
  label,
  value,
  onChange,
  unit,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  unit?: string;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
        {label}
        {unit && <span className="text-zinc-400 dark:text-zinc-500 font-normal ml-1">({unit})</span>}
      </span>
      <input
        type="number"
        inputMode="decimal"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1.5 w-full min-h-[44px] rounded-xl border border-[var(--border-subtle)] bg-zinc-50 dark:bg-zinc-800/50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all duration-300 touch-manipulation placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
      />
    </label>
  );
}

export function OnboardingContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [chest, setChest] = useState("");
  const [waist, setWaist] = useState("");
  const [hips, setHips] = useState("");
  const [shoulder, setShoulder] = useState("");
  const [inseam, setInseam] = useState("");
  const [fitPreference, setFitPreference] = useState<FitPreference | undefined>();
  const [sleevePreference, setSleevePreference] = useState<SleevePreference | undefined>();
  const [lengthPreference, setLengthPreference] = useState<LengthPreference | undefined>();
  const [budgetTier, setBudgetTier] = useState<string | undefined>();
  const [budgetSensitivity, setBudgetSensitivity] = useState<BudgetSensitivity | undefined>();
  const [occasions, setOccasions] = useState<string[]>([]);
  const [occasionFrequency, setOccasionFrequency] = useState<OccasionFrequency | undefined>();
  const [fabricPrefs, setFabricPrefs] = useState<string[]>([]);
  const [fabricSensitivities, setFabricSensitivities] = useState<string[]>([]);
  const [climate, setClimate] = useState<Climate | undefined>();
  const [stylePrefs, setStylePrefs] = useState<string[]>([]);
  const [favoriteBrands, setFavoriteBrands] = useState("");
  const [brandsToAvoid, setBrandsToAvoid] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (session?.user) {
      setDisplayName(session.user.name ?? session.user.email?.split("@")[0] ?? "");
      setUsername(session.user.email?.split("@")[0] ?? "");
    }
  }, [session?.user]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router]);

  // If user already has profile, redirect to profile page
  useEffect(() => {
    if (status !== "authenticated" || !session?.user) return;
    fetch("/api/user-profile")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data !== null && data !== undefined) {
          router.replace("/profile");
        }
      })
      .catch(() => {});
  }, [status, session?.user, router]);

  const toggleMulti = useCallback((arr: string[], setArr: (v: string[]) => void, item: string) => {
    setArr(arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item]);
  }, []);

  const buildPayload = useCallback(() => {
    const measurements: Record<string, number | undefined> = {};
    if (height) measurements.height = Number(height);
    if (weight) measurements.weight = Number(weight);
    if (chest) measurements.chest = Number(chest);
    if (waist) measurements.waist = Number(waist);
    if (hips) measurements.hips = Number(hips);
    if (shoulder) measurements.shoulder = Number(shoulder);
    if (inseam) measurements.inseam = Number(inseam);

    return {
      displayName: displayName.trim() || undefined,
      username: username.trim().toLowerCase().replace(/\s+/g, "") || undefined,
      measurements: Object.keys(measurements).length ? measurements : undefined,
      fitPreference,
      sleevePreference,
      lengthPreference,
      budgetTier,
      budgetSensitivity,
      occasions: occasions.length ? occasions : undefined,
      occasionFrequency,
      fabricPrefs: fabricPrefs.length ? fabricPrefs : undefined,
      fabricSensitivities: fabricSensitivities.length ? fabricSensitivities : undefined,
      climate,
      stylePrefs: stylePrefs.length ? stylePrefs : undefined,
      favoriteBrands: favoriteBrands.trim()
        ? favoriteBrands.split(/,\s*/).map((b) => b.trim()).filter(Boolean)
        : undefined,
      brandsToAvoid: brandsToAvoid.trim()
        ? brandsToAvoid.split(/,\s*/).map((b) => b.trim()).filter(Boolean)
        : undefined,
    };
  }, [
    displayName,
    username,
    height,
    weight,
    chest,
    waist,
    hips,
    shoulder,
    inseam,
    fitPreference,
    sleevePreference,
    lengthPreference,
    budgetTier,
    budgetSensitivity,
    occasions,
    occasionFrequency,
    fabricPrefs,
    fabricSensitivities,
    climate,
    stylePrefs,
    favoriteBrands,
    brandsToAvoid,
  ]);

  const handleSubmit = async () => {
    setError("");
    setSubmitting(true);
    try {
      const payload = buildPayload();

      // 1. Save to MongoDB Onboarding collection
      const onboardingRes = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!onboardingRes.ok) {
        const data = await onboardingRes.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to save onboarding");
      }

      // 2. Sync to profile API so /Personalise page is pre-filled
      const profileForPersonalise = {
        measurements: payload.measurements,
        fitPreference: payload.fitPreference,
        sleevePreference: payload.sleevePreference,
        lengthPreference: payload.lengthPreference,
        budgetTier: payload.budgetTier,
        budgetSensitivity: payload.budgetSensitivity,
        occasions: payload.occasions,
        occasionFrequency: payload.occasionFrequency,
        fabricPrefs: payload.fabricPrefs,
        fabricSensitivities: payload.fabricSensitivities,
        climate: payload.climate,
        stylePrefs: payload.stylePrefs,
        favoriteBrands: payload.favoriteBrands,
        brandsToAvoid: payload.brandsToAvoid,
      };
      await saveProfile(profileForPersonalise);

      router.replace("/profile");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setSubmitting(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg)]">
        <div className="animate-pulse text-zinc-500">Loading...</div>
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  const currentStep = STEPS[step - 1];
  const isLastStep = step === 4;

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)]">
      <div className="absolute inset-0 bg-mesh opacity-30" />
      <div className="relative flex-1 mx-auto w-full max-w-2xl px-4 sm:px-6 py-6 sm:py-8">
        <Link
          href="/landing"
          className="inline-flex items-center gap-2.5 mb-6 group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-accent flex items-center justify-center shadow-button">
            <span className="text-white text-sm font-bold">FI</span>
          </div>
          <span className="font-headline font-semibold text-zinc-900 dark:text-white">
            Fashion Intelligence
          </span>
        </Link>

        {/* Progress */}
        <div className="flex gap-2 mb-8">
          {STEPS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setStep(s.id)}
              className={`flex-1 h-2 rounded-full transition-colors ${
                s.id === step
                  ? "bg-accent"
                  : s.id < step
                    ? "bg-accent/50"
                    : "bg-zinc-200 dark:bg-zinc-700"
              }`}
              aria-label={`Step ${s.id}: ${s.title}`}
            />
          ))}
        </div>

        <div className="rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-elevation-2 p-6 sm:p-8">
          <h1 className="font-headline text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white mb-1">
            {currentStep.title}
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
            Step {step} of 4 — You can skip any section and update later in Personalise
          </p>

          {/* Step 1: Name & Username */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <label htmlFor="displayName" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Display name
                </label>
                <input
                  id="displayName"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Amir Kid"
                  className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                  maxLength={50}
                />
              </div>
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.replace(/\s/g, "").toLowerCase())}
                  placeholder="e.g. amirkid1281"
                  className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                  maxLength={30}
                />
                <p className="text-xs text-zinc-500 mt-1">Lowercase, no spaces</p>
              </div>
            </div>
          )}

          {/* Step 2: Body & Fit */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
                  Body & Measurements (optional)
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <NumInput label="Height" value={height} onChange={setHeight} unit="cm" placeholder="170" />
                  <NumInput label="Weight" value={weight} onChange={setWeight} unit="kg" placeholder="65" />
                  <NumInput label="Chest" value={chest} onChange={setChest} unit="in" placeholder="38" />
                  <NumInput label="Waist" value={waist} onChange={setWaist} unit="in" placeholder="32" />
                  <NumInput label="Hips" value={hips} onChange={setHips} unit="in" placeholder="36" />
                  <NumInput label="Shoulder" value={shoulder} onChange={setShoulder} unit="in" placeholder="optional" />
                  <NumInput label="Inseam" value={inseam} onChange={setInseam} unit="in" placeholder="optional" />
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
                  Fit preference
                </p>
                <ChipSingle options={FIT_OPTIONS} value={fitPreference} onChange={setFitPreference} />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
                  Sleeve (optional)
                </p>
                <ChipSingle options={SLEEVE_OPTIONS} value={sleevePreference} onChange={setSleevePreference} labels={{ short: "Short", long: "Long", "no preference": "No preference" }} />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
                  Length (optional)
                </p>
                <ChipSingle options={LENGTH_OPTIONS} value={lengthPreference} onChange={setLengthPreference} />
              </div>
            </div>
          )}

          {/* Step 3: Budget, Occasion, Fabric, Climate */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
                  Budget range
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {BUDGET_TIERS.map(({ id, label }) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setBudgetTier(budgetTier === id ? undefined : id)}
                      className={`min-h-[40px] px-4 py-2 rounded-xl text-xs font-medium transition-all ${
                        budgetTier === id
                          ? "bg-gradient-accent text-white shadow-button"
                          : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <ChipSingle options={BUDGET_SENSITIVITY} value={budgetSensitivity} onChange={setBudgetSensitivity} />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
                  Occasions
                </p>
                <ChipMulti options={OCCASION_OPTIONS} selected={occasions} onToggle={(o) => toggleMulti(occasions, setOccasions, o)} />
                <p className="text-xs text-zinc-500 mt-2">How often?</p>
                <ChipSingle options={OCCASION_FREQUENCY} value={occasionFrequency} onChange={setOccasionFrequency} />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
                  Fabric preferences
                </p>
                <ChipMulti options={FABRIC_OPTIONS} selected={fabricPrefs} onToggle={(f) => toggleMulti(fabricPrefs, setFabricPrefs, f)} />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
                  Fabric sensitivities
                </p>
                <ChipMulti options={FABRIC_SENSITIVITIES} selected={fabricSensitivities} onToggle={(f) => toggleMulti(fabricSensitivities, setFabricSensitivities, f)} label="yes" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
                  Climate
                </p>
                <ChipSingle options={CLIMATE_OPTIONS} value={climate} onChange={setClimate} />
              </div>
            </div>
          )}

          {/* Step 4: Brands & Style */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Favorite brands
                </label>
                <input
                  type="text"
                  value={favoriteBrands}
                  onChange={(e) => setFavoriteBrands(e.target.value)}
                  placeholder="e.g. Nike, Zara, H&M"
                  className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Brands to avoid
                </label>
                <input
                  type="text"
                  value={brandsToAvoid}
                  onChange={(e) => setBrandsToAvoid(e.target.value)}
                  placeholder="optional"
                  className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
                  Style preferences
                </p>
                <div className="flex flex-wrap gap-2">
                  {STYLE_OPTIONS.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleMulti(stylePrefs, setStylePrefs, tag)}
                      className={`min-h-[44px] px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        stylePrefs.includes(tag)
                          ? "bg-gradient-accent text-white shadow-button"
                          : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {error && <p className="text-sm text-red-500 dark:text-red-400 mt-4">{error}</p>}

          <div className="flex gap-3 mt-8">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="px-6 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
              >
                Back
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => (isLastStep ? handleSubmit() : setStep(step + 1))}
              disabled={submitting}
              className="flex-1 py-3.5 rounded-xl bg-gradient-accent text-white font-semibold shadow-button hover:shadow-button-hover disabled:opacity-60 disabled:cursor-not-allowed transition-all"
            >
              {submitting ? "Saving..." : isLastStep ? "Finish & Continue" : "Next"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
