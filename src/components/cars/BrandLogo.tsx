"use client";

import { useState, useMemo, useEffect } from "react";
import { getLogoUrlCandidates, brandInitials, isValidLogoUrl, LOGO_INITIALS } from "@/lib/car-logos";

type Props = {
  name: string;
  slug: string;
  logoUrl?: string | null;
  size?: number;
};

export function BrandLogo({ name, slug, logoUrl, size = 40 }: Props) {
  const candidates = useMemo(() => {
    const list: string[] = [];
    if (logoUrl && isValidLogoUrl(logoUrl)) list.push(logoUrl);
    if (logoUrl && logoUrl !== LOGO_INITIALS && !list.includes(logoUrl)) list.push(logoUrl);
    for (const u of getLogoUrlCandidates(slug, name)) {
      if (!list.includes(u)) list.push(u);
    }
    return list;
  }, [slug, name, logoUrl]);

  const [idx, setIdx] = useState(0);

  useEffect(() => {
    setIdx(0);
  }, [slug, logoUrl]);

  if (!candidates.length || idx >= candidates.length) {
    return (
      <div
        className="rounded-lg bg-[var(--bg-hover)] text-[var(--text-secondary)] flex items-center justify-center font-medium shrink-0"
        style={{ width: size, height: size, fontSize: size * 0.32 }}
        title={name}
      >
        {brandInitials(name)}
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={candidates[idx]}
      alt={name}
      width={size}
      height={size}
      loading="lazy"
      decoding="async"
      className="object-contain shrink-0"
      style={{ width: size, height: size }}
      onError={() => setIdx((i) => i + 1)}
    />
  );
}
