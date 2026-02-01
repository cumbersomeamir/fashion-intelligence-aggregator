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
  { id: "500-1000", label: "₹500 – ₹1,000" },
  { id: "1000-3000", label: "₹1,000 – ₹3,000" },
  { id: "3000+", label: "₹3,000+" },
];
const BUDGET_SENSITIVITY: BudgetSensitivity[] = ["value", "balanced", "premium"];

const OCCASION_OPTIONS = ["work", "casual", "party", "gym", "travel", "ethnic", "formal"];
const OCCASION_FREQUENCY: OccasionFrequency[] = ["daily", "occasional", "rare"];

const FABRIC_OPTIONS = ["cotton", "wool", "linen", "synthetics", "blends"];
const FABRIC_SENSITIVITIES = ["breathable", "stretch", "wrinkle-resistant", "skin-sensitive"];

const CLIMATE_OPTIONS: Climate[] = ["hot", "moderate", "cold"];

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-zinc-200 dark:border-zinc-700 p-3 sm:p-4 space-y-3 bg-zinc-50/50 dark:bg-zinc-800/30">
      <div>
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{title}</h2>
        {hint && <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5">{hint}</p>}
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
            min-h-[40px] px-3 py-2 rounded-full text-xs font-medium transition-all touch-manipulation
            ${selected.includes(opt)
              ? "bg-accent text-white ring-2 ring-accent/30"
              : "bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-300 dark:hover:bg-zinc-600"
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
            min-h-[40px] px-3 py-2 rounded-full text-xs font-medium transition-all touch-manipulation
            ${value === opt
              ? "bg-accent text-white ring-2 ring-accent/30"
              : "bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-300 dark:hover:bg-zinc-600"
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
        {unit && <span className="text-zinc-400 dark:text-zinc-500 font-normal"> ({unit})</span>}
      </span>
      <input
        type="number"
        inputMode="decimal"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1 w-full min-h-[44px] rounded-lg border border-zinc-200 dark:border-zinc-600 bg-white dark:bg-zinc-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent touch-manipulation"
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
    <div className="mx-auto max-w-2xl px-3 sm:px-4 py-4 sm:py-6 min-w-0 space-y-4">
      <Card className="p-4 sm:p-5 shadow-md bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm">
        <h1 className="font-headline text-xl sm:text-2xl font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
          Personalize
        </h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4">
          Your choices power <span className="font-medium text-accent">Fit</span>, <span className="font-medium text-accent">Recommendations</span>, and chat topics. Easy to fill, no fluff.
        </p>

        {hasSaved && (
          <div className="mb-4 p-3 rounded-xl bg-accent/10 dark:bg-accent/20 border border-accent/20">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-accent mb-1.5">Saved</p>
            <p className="text-xs text-zinc-600 dark:text-zinc-300">
              Style, fit, budget, occasions &amp; more are stored. Edit below and save again to update.
            </p>
          </div>
        )}

        <div className="space-y-4">
          {/* 1) Body & Fit Data */}
          <Section
            title="1. Body & measurements"
            hint="Powers Size & Measurement and Good Fit (haptic). Optional: shoulder, inseam."
          >
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
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
          <Section title="2. Fit preference" hint="Slim / regular / relaxed / oversized. Optional: sleeve & length.">
            <div className="space-y-3">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">Fit</p>
                <ChipSingle options={FIT_OPTIONS} value={fitPreference} onChange={setFitPreference} />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">Sleeve (optional)</p>
                <ChipSingle options={SLEEVE_OPTIONS} value={sleevePreference} onChange={setSleevePreference} labels={{ "no preference": "No preference" }} />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">Length (optional)</p>
                <ChipSingle options={LENGTH_OPTIONS} value={lengthPreference} onChange={setLengthPreference} />
              </div>
            </div>
          </Section>

          {/* 3) Budget */}
          <Section title="3. Budget range" hint="Powers Budget topic and recommendations.">
            <div className="space-y-3">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">Price range</p>
                <div className="flex flex-wrap gap-2">
                  {BUDGET_TIERS.map(({ id, label }) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setBudgetTier(budgetTier === id ? undefined : id)}
                      className={`
                        min-h-[40px] px-3 py-2 rounded-full text-xs font-medium transition-all touch-manipulation
                        ${budgetTier === id ? "bg-accent text-white ring-2 ring-accent/30" : "bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-300 dark:hover:bg-zinc-600"}
                      `}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">Sensitivity</p>
                <ChipSingle options={BUDGET_SENSITIVITY} value={budgetSensitivity} onChange={setBudgetSensitivity} />
              </div>
            </div>
          </Section>

          {/* 4) Occasion */}
          <Section title="4. Occasion preferences" hint="Powers Occasion topic and ranking. Pick all that apply.">
            <div className="space-y-3">
              <ChipMulti options={OCCASION_OPTIONS} selected={occasions} onToggle={(o) => toggleMulti(occasions, setOccasions, o)} />
              <div>
                <p className="text-[10px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">How often (optional)</p>
                <ChipSingle options={OCCASION_FREQUENCY} value={occasionFrequency} onChange={setOccasionFrequency} />
              </div>
            </div>
          </Section>

          {/* 5) Fabric */}
          <Section title="5. Fabric preferences & sensitivities" hint="Powers Fabric topic and product info.">
            <div className="space-y-3">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">Preferences</p>
                <ChipMulti options={FABRIC_OPTIONS} selected={fabricPrefs} onToggle={(f) => toggleMulti(fabricPrefs, setFabricPrefs, f)} />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">Sensitivities (e.g. breathable, skin-sensitive)</p>
                <ChipMulti options={FABRIC_SENSITIVITIES} selected={fabricSensitivities} onToggle={(f) => toggleMulti(fabricSensitivities, setFabricSensitivities, f)} label="yes" />
              </div>
            </div>
          </Section>

          {/* 6) Climate */}
          <Section title="6. Climate" hint="Helps fabric and layering logic.">
            <ChipSingle options={CLIMATE_OPTIONS} value={climate} onChange={setClimate} />
          </Section>

          {/* 7) Brand affinity */}
          <Section title="7. Brand affinity (optional)" hint="Favorite brands and brands to avoid. Comma-separated.">
            <div className="space-y-3">
              <label className="block">
                <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Favorite brands</span>
                <input
                  type="text"
                  value={favoriteBrands}
                  onChange={(e) => setFavoriteBrands(e.target.value)}
                  placeholder="e.g. Myntra, Zara, H&M"
                  className="mt-1 w-full min-h-[44px] rounded-lg border border-zinc-200 dark:border-zinc-600 bg-white dark:bg-zinc-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent touch-manipulation"
                />
              </label>
              <label className="block">
                <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Brands to avoid</span>
                <input
                  type="text"
                  value={brandsToAvoid}
                  onChange={(e) => setBrandsToAvoid(e.target.value)}
                  placeholder="optional"
                  className="mt-1 w-full min-h-[44px] rounded-lg border border-zinc-200 dark:border-zinc-600 bg-white dark:bg-zinc-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent touch-manipulation"
                />
              </label>
            </div>
          </Section>

          {/* Style preferences */}
          <Section title="8. Style preferences" hint="Style tags for recommendations.">
            <div className="flex flex-wrap gap-2">
              {STYLE_OPTIONS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleMulti(stylePrefs, setStylePrefs, tag)}
                  className={`
                    min-h-[44px] px-4 py-2.5 rounded-full text-sm font-medium transition-all touch-manipulation
                    ${stylePrefs.includes(tag)
                      ? "bg-accent text-white ring-2 ring-accent/30"
                      : "bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-300 dark:hover:bg-zinc-600"
                    }
                  `}
                >
                  {tag}
                </button>
              ))}
            </div>
          </Section>
        </div>

        <button
          type="button"
          onClick={handleSave}
          className="w-full min-h-[48px] mt-4 rounded-xl bg-accent text-white px-6 py-3 font-semibold hover:bg-accent/90 focus:ring-2 focus:ring-accent focus:ring-offset-2 active:bg-accent/80 transition-all touch-manipulation"
        >
          {saved ? "✓ Saved to profile" : "Save to profile"}
        </button>
      </Card>
    </div>
  );
}
