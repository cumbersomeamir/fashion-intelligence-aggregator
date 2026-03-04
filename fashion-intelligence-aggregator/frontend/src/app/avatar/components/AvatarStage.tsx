"use client";

import { useEffect, useMemo, useState } from "react";

interface AvatarStageProps {
  speaking: boolean;
  thinking: boolean;
}

type Dot = { x: number; y: number; r: number; phase: number };

type Ribbon = {
  d: string;
  width: number;
  opacity: number;
  gradientId: string;
};

function polar(cx: number, cy: number, radius: number, angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: cx + Math.cos(rad) * radius, y: cy + Math.sin(rad) * radius };
}

function ribbonPath(phase: number, idx: number, speed: number, intensity: number): Ribbon {
  const cx = 500;
  const cy = 500;
  const count = 14;
  const base = (360 / count) * idx + phase * 50 * speed;

  const innerR = 42 + Math.sin(phase * 1.9 + idx * 0.5) * 7;
  const outerR = 370 + Math.cos(phase * 1.1 + idx * 0.7) * 32 * intensity;

  const start = polar(cx, cy, innerR, base - 18);
  const end = polar(cx, cy, outerR, base + 86 + Math.sin(phase + idx) * 9);
  const c1 = polar(cx, cy, innerR + 120 + Math.sin(phase * 1.4 + idx) * 15, base + 14);
  const c2 = polar(cx, cy, outerR - 120 + Math.cos(phase * 1.3 + idx) * 22, base + 58);

  const d = `M ${start.x.toFixed(2)} ${start.y.toFixed(2)} C ${c1.x.toFixed(2)} ${c1.y.toFixed(2)}, ${c2.x.toFixed(2)} ${c2.y.toFixed(2)}, ${end.x.toFixed(2)} ${end.y.toFixed(2)}`;
  const width = 11 + ((idx * 7) % 5) + Math.sin(phase * 2.4 + idx) * 1.8;
  const opacity = 0.34 + ((idx * 3) % 4) * 0.08;
  return {
    d,
    width,
    opacity,
    gradientId: `ribbon-grad-${idx % 4}`,
  };
}

export function AvatarStage({ speaking, thinking }: AvatarStageProps) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setPhase((prev) => prev + (speaking ? 0.13 : thinking ? 0.09 : 0.045));
    }, 85);
    return () => window.clearInterval(id);
  }, [speaking, thinking]);

  const mode = useMemo(() => {
    if (speaking) return "speaking";
    if (thinking) return "thinking";
    return "idle";
  }, [speaking, thinking]);

  const intensity = mode === "speaking" ? 1 : mode === "thinking" ? 0.75 : 0.45;
  const speed = mode === "speaking" ? 1.5 : mode === "thinking" ? 1.1 : 0.62;
  const pulseScale = mode === "speaking" ? 1.07 : mode === "thinking" ? 1.03 : 1;

  const dots = useMemo<Dot[]>(
    () =>
      Array.from({ length: 52 }, (_, i) => {
        const t = i * 12.9898;
        const x = ((Math.sin(t) + 1) / 2) * 1000;
        const y = ((Math.cos(t * 1.27) + 1) / 2) * 1000;
        const r = 0.9 + ((i * 17) % 3) * 0.75;
        return { x, y, r, phase: i * 0.43 };
      }),
    []
  );

  const ribbons = useMemo<Ribbon[]>(
    () => Array.from({ length: 14 }, (_, idx) => ribbonPath(phase, idx, speed, intensity)),
    [phase, speed, intensity]
  );

  const shellClass = useMemo(() => {
    if (mode === "speaking") return "from-[#060b1f] via-[#0b1537] to-[#160a32]";
    if (mode === "thinking") return "from-[#0d0a22] via-[#171132] to-[#250f3f]";
    return "from-[#0a1024] via-[#101833] to-[#121a28]";
  }, [mode]);

  const status = mode === "speaking" ? "Voice Live" : mode === "thinking" ? "Thinking" : "Idle";

  const statusClass = useMemo(() => {
    if (mode === "speaking") return "bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-900/30 dark:border-indigo-800 dark:text-indigo-300";
    if (mode === "thinking") return "bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-900/30 dark:border-amber-800 dark:text-amber-300";
    return "bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-900/30 dark:border-emerald-800 dark:text-emerald-300";
  }, [mode]);

  const coreGlow = useMemo(() => {
    if (speaking) {
      return "radial-gradient(circle at center, rgba(255,255,255,0.96) 0%, rgba(180,210,255,0.94) 12%, rgba(132,174,255,0.56) 30%, rgba(129,140,248,0.20) 60%, transparent 76%)";
    }
    if (thinking) {
      return "radial-gradient(circle at center, rgba(255,255,255,0.95) 0%, rgba(214,188,255,0.82) 14%, rgba(167,139,250,0.44) 34%, rgba(124,58,237,0.16) 64%, transparent 80%)";
    }
    return "radial-gradient(circle at center, rgba(255,255,255,0.92) 0%, rgba(190,200,255,0.70) 12%, rgba(129,140,248,0.34) 34%, rgba(99,102,241,0.10) 64%, transparent 80%)";
  }, [speaking, thinking]);

  return (
    <div className={`relative h-[250px] sm:h-[290px] rounded-2xl overflow-hidden border border-zinc-200/70 dark:border-zinc-700 bg-gradient-to-br ${shellClass}`}>
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_20%_18%,rgba(99,102,241,0.30),transparent_42%),radial-gradient(circle_at_80%_30%,rgba(14,165,233,0.20),transparent_40%),radial-gradient(circle_at_52%_86%,rgba(244,114,182,0.12),transparent_45%)]" />
      <div className="absolute top-3 right-3 z-10">
        <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] ${statusClass}`}>
          {status}
        </span>
      </div>

      <svg viewBox="0 0 1000 1000" className="absolute inset-0 w-full h-full" aria-hidden>
        <defs>
          <linearGradient id="ribbon-grad-0" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7dd3fc" />
            <stop offset="52%" stopColor="#a5b4fc" />
            <stop offset="100%" stopColor="#fde68a" />
          </linearGradient>
          <linearGradient id="ribbon-grad-1" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#93c5fd" />
            <stop offset="50%" stopColor="#c4b5fd" />
            <stop offset="100%" stopColor="#fcd34d" />
          </linearGradient>
          <linearGradient id="ribbon-grad-2" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#67e8f9" />
            <stop offset="50%" stopColor="#818cf8" />
            <stop offset="100%" stopColor="#f9a8d4" />
          </linearGradient>
          <linearGradient id="ribbon-grad-3" x1="100%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#bae6fd" />
            <stop offset="50%" stopColor="#d8b4fe" />
            <stop offset="100%" stopColor="#fef3c7" />
          </linearGradient>
          <filter id="ribbon-glow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <g>
          {dots.map((dot, idx) => {
            const alpha = 0.2 + Math.abs(Math.sin(phase * 1.2 + dot.phase)) * 0.65;
            return (
              <circle
                key={idx}
                cx={dot.x}
                cy={dot.y}
                r={dot.r}
                fill="#fff8dc"
                opacity={alpha}
              />
            );
          })}
        </g>

        <g style={{ mixBlendMode: "screen" as const }}>
          {ribbons.map((ribbon, idx) => (
            <path
              key={`outer-${idx}`}
              d={ribbon.d}
              fill="none"
              stroke={`url(#${ribbon.gradientId})`}
              strokeWidth={ribbon.width}
              strokeLinecap="round"
              opacity={ribbon.opacity}
              filter="url(#ribbon-glow)"
            />
          ))}
          {ribbons.map((ribbon, idx) => (
            <path
              key={`inner-${idx}`}
              d={ribbon.d}
              fill="none"
              stroke={`url(#${ribbon.gradientId})`}
              strokeWidth={Math.max(2.3, ribbon.width * 0.28)}
              strokeLinecap="round"
              opacity={Math.min(0.92, ribbon.opacity + 0.28)}
            />
          ))}
        </g>

        <circle
          cx="500"
          cy="500"
          r={80 * pulseScale}
          fill="url(#center-core)"
          opacity={0.95}
        />
        <defs>
          <radialGradient id="center-core" cx="50%" cy="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
            <stop offset="28%" stopColor="#dbeafe" stopOpacity="0.9" />
            <stop offset="58%" stopColor="#a5b4fc" stopOpacity={mode === "speaking" ? "0.65" : "0.45"} />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
          </radialGradient>
        </defs>
      </svg>

      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: coreGlow }}
      />
    </div>
  );
}
