"use client";

import { useEffect, useRef } from "react";
import { BrandLogo } from "./BrandLogo";
import { LOGO_INITIALS } from "@/lib/car-logos";

type Brand = { id: string; name: string; slug: string; logoUrl: string };

export function BrandPickerButton({
  brand,
  selected,
  onSelect,
  onLogoResolved,
}: {
  brand: Brand;
  selected: boolean;
  onSelect: () => void;
  onLogoResolved: (id: string, url: string) => void;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const resolved = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const needsResolve =
      !brand.logoUrl ||
      brand.logoUrl === LOGO_INITIALS ||
      brand.logoUrl.includes("car-logos-dataset");

    if (!needsResolve) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || resolved.current) return;
        resolved.current = true;

        fetch(`/api/cars/resolve-logo?id=${brand.id}`)
          .then((r) => r.json())
          .then((d) => {
            if (d.url && d.url !== LOGO_INITIALS) {
              onLogoResolved(brand.id, d.url);
            }
          })
          .catch(() => {});
      },
      { rootMargin: "80px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [brand.id, brand.logoUrl, onLogoResolved]);

  return (
    <button
      ref={ref}
      type="button"
      onClick={onSelect}
      className={`w-full flex flex-col items-center gap-1.5 p-2.5 rounded-2xl border transition-all [content-visibility:auto] ${
        selected
          ? "border-[var(--accent)] bg-[var(--accent)]/8 shadow-sm ring-1 ring-[var(--accent)]/20"
          : "border-[var(--border)] bg-[var(--bg-card)] hover:bg-[var(--bg-hover)]"
      }`}
    >
      <BrandLogo name={brand.name} slug={brand.slug} logoUrl={brand.logoUrl} size={36} />
      <span className="text-[10px] font-semibold text-center leading-tight line-clamp-2 w-full">
        {brand.name}
      </span>
    </button>
  );
}
