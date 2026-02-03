"use client";

import { useState } from "react";
import Image from "next/image";

interface LandingImageProps {
  src: string;
  alt: string;
  fill?: boolean;
  className?: string;
  sizes?: string;
  priority?: boolean;
  width?: number;
  height?: number;
}

/** Renders image with gradient + icon fallback when load fails (no broken image icon). */
export function LandingImage({
  src,
  alt,
  fill = true,
  className = "",
  sizes,
  priority,
  width,
  height,
}: LandingImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        className={`bg-gradient-to-br from-violet-500/20 via-zinc-200 dark:via-zinc-800 to-fuchsia-500/20 flex items-center justify-center ${fill ? "absolute inset-0" : ""} ${className}`}
        style={!fill && width && height ? { width, height } : undefined}
      >
        <span className="text-6xl opacity-40" aria-hidden>✨</span>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      width={fill ? undefined : width}
      height={fill ? undefined : height}
      className={className}
      sizes={sizes}
      priority={priority}
      onError={() => setFailed(true)}
    />
  );
}
