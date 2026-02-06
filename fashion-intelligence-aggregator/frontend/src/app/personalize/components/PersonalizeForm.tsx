"use client";

import { useState, useCallback, useEffect } from "react";
import { Card } from "@/components/Card";
import { useStore } from "@/state/store";
import { saveProfile, getProfile } from "@/lib/api";
import type { Profile, FitPreference, SleevePreference, LengthPreference, BudgetSensitivity, OccasionFrequency, Climate } from "@/types";

const STYLE_OPTIONS = [
  "minimal", "classic", "Scandinavian", "trendy", "relaxed", "professional",
  "preppy", "urban", "sustainable", "luxe", "modern", "cozy",
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

const SECTION_ICONS: Record<string, React.ReactNode> = {
  "1": (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  "2": (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
    </svg>
  ),
  "3": (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  "4": (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  "5": (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
    </svg>
  ),
  "6": (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
    </svg>
  ),
  "7": (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  ),
  "8": (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
    </svg>
  ),
};

function Section({ number, title, hint, children }: { number: string; title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-[var(--border-subtle)] p-4 sm:p-5 space-y-4 bg-white dark:bg-zinc-900 shadow-elevation-1 transition-all duration-300 hover:shadow-elevation-2">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-subtle flex items-center justify-center text-accent shrink-0">
          {SECTION_ICONS[number] || <span className="font-bold text-sm">{number}</span>}
        </div>
        <div className="min-w-0">
          <h2 className="font-headline text-sm font-semibold text-zinc-900 dark:text-zinc-100">{title}</h2>
          {hint && <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 leading-relaxed">{hint}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}

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
            ${selected.includes(opt)
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
            ${value === opt
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

export function PersonalizeForm() {
  const { profile, setProfile } = useStore();
  const [saved, setSaved] = useState(false);

  const m = profile?.measurements ?? {};
  const [height, setHeight] = useState(m.height !== undefined ? String(m.height) : "");
  const [weight, setWeight] = useState(m.weight !== undefined ? String(m.weight) : "");
  const [chest, setChest] = useState(m.chest !== undefined ? String(m.chest) : "");
  const [waist, setWaist] = useState(m.waist !== undefined ? String(m.waist) : "");
  const [hips, setHips] = useState(m.hips !== undefined ? String(m.hips) : "");
  const [shoulder, setShoulder] = useState(m.shoulder !== undefined ? String(m.shoulder) : "");
  const [inseam, setInseam] = useState(m.inseam !== undefined ? String(m.inseam) : "");

  const [fitPreference, setFitPreference] = useState<FitPreference | undefined>(profile?.fitPreference);
  const [sleevePreference, setSleevePreference] = useState<SleevePreference | undefined>(profile?.sleevePreference);
  const [lengthPreference, setLengthPreference] = useState<LengthPreference | undefined>(profile?.lengthPreference);

  const [budgetTier, setBudgetTier] = useState<string | undefined>(profile?.budgetTier);
  const [budgetSensitivity, setBudgetSensitivity] = useState<BudgetSensitivity | undefined>(profile?.budgetSensitivity);

  const [occasions, setOccasions] = useState<string[]>(profile?.occasions ?? []);
  const [occasionFrequency, setOccasionFrequency] = useState<OccasionFrequency | undefined>(profile?.occasionFrequency);

  const [fabricPrefs, setFabricPrefs] = useState<string[]>(profile?.fabricPrefs ?? []);
  const [fabricSensitivities, setFabricSensitivities] = useState<string[]>(profile?.fabricSensitivities ?? []);

  const [climate, setClimate] = useState<Climate | undefined>(profile?.climate);

  const [stylePrefs, setStylePrefs] = useState<string[]>(profile?.stylePrefs ?? []);

  const [favoriteBrands, setFavoriteBrands] = useState<string>(Array.isArray(profile?.favoriteBrands) ? profile.favoriteBrands.join(", ") : "");
  const [brandsToAvoid, setBrandsToAvoid] = useState<string>(Array.isArray(profile?.brandsToAvoid) ? profile.brandsToAvoid.join(", ") : "");

  useEffect(() => {
    let cancelled = false;
    getProfile().then((data) => {
      if (!cancelled && data) setProfile(data);
    });
    return () => { cancelled = true; };
  }, [setProfile]);

  useEffect(() => {
    const p = profile;
    const m = p?.measurements ?? {};
    setHeight(m.height !== undefined ? String(m.height) : "");
    setWeight(m.weight !== undefined ? String(m.weight) : "");
    setChest(m.chest !== undefined ? String(m.chest) : "");
    setWaist(m.waist !== undefined ? String(m.waist) : "");
    setHips(m.hips !== undefined ? String(m.hips) : "");
    setShoulder(m.shoulder !== undefined ? String(m.shoulder) : "");
    setInseam(m.inseam !== undefined ? String(m.inseam) : "");
    setFitPreference(p?.fitPreference);
    setSleevePreference(p?.sleevePreference);
    setLengthPreference(p?.lengthPreference);
    setBudgetTier(p?.budgetTier);
    setBudgetSensitivity(p?.budgetSensitivity);
    setOccasions(p?.occasions ?? []);
    setOccasionFrequency(p?.occasionFrequency);
    setFabricPrefs(p?.fabricPrefs ?? []);
    setFabricSensitivities(p?.fabricSensitivities ?? []);
    setClimate(p?.climate);
    setStylePrefs(p?.stylePrefs ?? []);
    setFavoriteBrands(Array.isArray(p?.favoriteBrands) ? p.favoriteBrands.join(", ") : "");
    setBrandsToAvoid(Array.isArray(p?.brandsToAvoid) ? p.brandsToAvoid.join(", ") : "");
  }, [profile]);

  const toggleMulti = useCallback((arr: string[], setArr: (v: string[]) => void, item: string) => {
    setArr(arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item]);
  }, []);

  const buildProfile = useCallback((): Profile => ({
    ...profile,
    measurements: {
      height: height ? Number(height) : undefined,
      weight: weight ? Number(weight) : undefined,
      chest: chest ? Number(chest) : undefined,
      waist: waist ? Number(waist) : undefined,
      hips: hips ? Number(hips) : undefined,
      shoulder: shoulder ? Number(shoulder) : undefined,
      inseam: inseam ? Number(inseam) : undefined,
    },
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
    favoriteBrands: favoriteBrands.trim() ? favoriteBrands.split(/,\s*/).map((b) => b.trim()).filter(Boolean) : undefined,
    brandsToAvoid: brandsToAvoid.trim() ? brandsToAvoid.split(/,\s*/).map((b) => b.trim()).filter(Boolean) : undefined,
  }), [
    profile,
    height, weight, chest, waist, hips, shoulder, inseam,
    fitPreference, sleevePreference, lengthPreference,
    budgetTier, budgetSensitivity,
    occasions, occasionFrequency,
    fabricPrefs, fabricSensitivities,
    climate,
    stylePrefs,
    favoriteBrands, brandsToAvoid,
  ]);

  const handleSave = async () => {
    const next = buildProfile();
    setProfile(next);
    try {
      await saveProfile(next);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      setProfile(profile);
    }
  };

  const hasSaved =
    (profile?.stylePrefs?.length ?? 0) > 0 ||
    (profile?.measurements && (profile.measurements.height != null || profile.measurements.chest != null)) ||
    profile?.fitPreference != null ||
    profile?.budgetTier != null ||
    (profile?.occasions?.length ?? 0) > 0;

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-6 sm:py-8 pb-[max(2rem,env(safe-area-inset-bottom))] min-w-0 space-y-6 overflow-x-hidden">
      {/* Header */}
      <div className="mb-2">
        <h1 className="font-headline text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white mb-2">
          Personalize
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Your choices power{" "}
          <span className="font-medium text-gradient">Fit</span>,{" "}
          <span className="font-medium text-gradient">Recommendations</span>, and chat topics
        </p>
      </div>

      {/* Saved status */}
      {hasSaved && (
        <div className="p-4 rounded-2xl bg-gradient-subtle border border-accent/20 shadow-glow">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-accent flex items-center justify-center shadow-button shrink-0">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-zinc-900 dark:text-white">Profile Saved</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Your style, fit, budget, and occasion preferences are stored
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Form sections */}
      <div className="space-y-4">
        {/* 1) Body & Fit Data */}
        <Section
          number="1"
          title="Body & Measurements"
          hint="Powers Size & Measurement and Good Fit. Optional: shoulder, inseam."
        >
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <NumInput label="Height" value={height} onChange={setHeight} unit="cm" placeholder="e.g. 170" />
            <NumInput label="Weight" value={weight} onChange={setWeight} unit="kg" placeholder="e.g. 65" />
            <NumInput label="Chest" value={chest} onChange={setChest} unit="in" placeholder="e.g. 38" />
            <NumInput label="Waist" value={waist} onChange={setWaist} unit="in" placeholder="e.g. 32" />
            <NumInput label="Hips" value={hips} onChange={setHips} unit="in" placeholder="e.g. 36" />
            <NumInput label="Shoulder" value={shoulder} onChange={setShoulder} unit="in" placeholder="optional" />
            <NumInput label="Inseam" value={inseam} onChange={setInseam} unit="in" placeholder="optional" />
          </div>
        </Section>

        {/* 2) Fit preference */}
        <Section number="2" title="Fit Preference" hint="Slim / regular / relaxed / oversized. Optional: sleeve & length.">
          <div className="space-y-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">Fit</p>
              <ChipSingle options={FIT_OPTIONS} value={fitPreference} onChange={setFitPreference} />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">Sleeve (optional)</p>
              <ChipSingle options={SLEEVE_OPTIONS} value={sleevePreference} onChange={setSleevePreference} labels={{ short: "Short", long: "Long", "no preference": "No preference" }} />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">Length (optional)</p>
              <ChipSingle options={LENGTH_OPTIONS} value={lengthPreference} onChange={setLengthPreference} />
            </div>
          </div>
        </Section>

        {/* 3) Budget */}
        <Section number="3" title="Budget Range" hint="Powers Budget topic and recommendations.">
          <div className="space-y-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">Price Range</p>
              <div className="flex flex-wrap gap-2">
                {BUDGET_TIERS.map(({ id, label }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setBudgetTier(budgetTier === id ? undefined : id)}
                    className={`
                      min-h-[40px] px-4 py-2 rounded-xl text-xs font-medium transition-all duration-300 touch-manipulation
                      ${budgetTier === id
                        ? "bg-gradient-accent text-white shadow-button"
                        : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 border border-[var(--border-subtle)]"
                      }
                    `}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">Sensitivity</p>
              <ChipSingle options={BUDGET_SENSITIVITY} value={budgetSensitivity} onChange={setBudgetSensitivity} />
            </div>
          </div>
        </Section>

        {/* 4) Occasion */}
        <Section number="4" title="Occasion Preferences" hint="Powers Occasion topic and ranking. Pick all that apply.">
          <div className="space-y-4">
            <ChipMulti options={OCCASION_OPTIONS} selected={occasions} onToggle={(o) => toggleMulti(occasions, setOccasions, o)} />
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">How Often (optional)</p>
              <ChipSingle options={OCCASION_FREQUENCY} value={occasionFrequency} onChange={setOccasionFrequency} />
            </div>
          </div>
        </Section>

        {/* 5) Fabric */}
        <Section number="5" title="Fabric Preferences & Sensitivities" hint="Powers Fabric topic and product info.">
          <div className="space-y-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">Preferences</p>
              <ChipMulti options={FABRIC_OPTIONS} selected={fabricPrefs} onToggle={(f) => toggleMulti(fabricPrefs, setFabricPrefs, f)} />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">Sensitivities</p>
              <ChipMulti options={FABRIC_SENSITIVITIES} selected={fabricSensitivities} onToggle={(f) => toggleMulti(fabricSensitivities, setFabricSensitivities, f)} label="yes" />
            </div>
          </div>
        </Section>

        {/* 6) Climate */}
        <Section number="6" title="Climate" hint="Helps fabric and layering logic.">
          <ChipSingle options={CLIMATE_OPTIONS} value={climate} onChange={setClimate} />
        </Section>

        {/* 7) Brand affinity */}
        <Section number="7" title="Brand Affinity" hint="Favorite brands and brands to avoid (optional).">
          <div className="space-y-4">
            <label className="block">
              <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Favorite Brands</span>
              <input
                type="text"
                value={favoriteBrands}
                onChange={(e) => setFavoriteBrands(e.target.value)}
                placeholder="e.g. Nike, Zara, H&M"
                className="mt-1.5 w-full min-h-[44px] rounded-xl border border-[var(--border-subtle)] bg-zinc-50 dark:bg-zinc-800/50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all duration-300 touch-manipulation placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Brands to Avoid</span>
              <input
                type="text"
                value={brandsToAvoid}
                onChange={(e) => setBrandsToAvoid(e.target.value)}
                placeholder="optional"
                className="mt-1.5 w-full min-h-[44px] rounded-xl border border-[var(--border-subtle)] bg-zinc-50 dark:bg-zinc-800/50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all duration-300 touch-manipulation placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
              />
            </label>
          </div>
        </Section>

        {/* 8) Style preferences */}
        <Section number="8" title="Style Preferences" hint="Style tags for recommendations.">
          <div className="flex flex-wrap gap-2">
            {STYLE_OPTIONS.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => toggleMulti(stylePrefs, setStylePrefs, tag)}
                className={`
                  min-h-[44px] px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 touch-manipulation
                  ${stylePrefs.includes(tag)
                    ? "bg-gradient-accent text-white shadow-button"
                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 border border-[var(--border-subtle)]"
                  }
                `}
              >
                {tag}
              </button>
            ))}
          </div>
        </Section>
      </div>

      {/* Save button */}
      <button
        type="button"
        onClick={handleSave}
        className={`
          w-full min-h-[52px] rounded-2xl px-6 py-3.5 font-semibold text-base
          transition-all duration-300 touch-manipulation
          ${saved
            ? "bg-green-500 text-white shadow-lg"
            : "btn-primary"
          }
        `}
      >
        {saved ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            Saved to Profile
          </span>
        ) : (
          "Save to Profile"
        )}
      </button>
    </div>
  );
}
