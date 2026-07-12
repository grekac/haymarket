"use client";

import { useEffect, useState } from "react";

type Props = {
  modelId: string | null | undefined;
  generation: string | null | undefined;
  value: string;
  onChange: (bodyCode: string) => void;
  className?: string;
};

type Variant = { id: string; code: string; label: string };

export function CarBodyFilter({ modelId, generation, value, onChange, className }: Props) {
  const [variants, setVariants] = useState<Variant[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!modelId || !generation) {
      setVariants([]);
      return;
    }

    setLoading(true);
    fetch(`/api/cars/body-variants?modelId=${modelId}&generation=${encodeURIComponent(generation)}`)
      .then((r) => r.json())
      .then((data: { variants?: Variant[] }) => setVariants(data.variants ?? []))
      .finally(() => setLoading(false));
  }, [modelId, generation]);

  if (!modelId || !generation || variants.length <= 1) return null;

  return (
    <div className={className}>
      <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2 block">
        Кузов
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={loading}
        className="w-full px-3 py-2.5 rounded-xl text-sm bg-[var(--bg-input)] border border-[var(--border)]"
      >
        <option value="">{loading ? "Загрузка..." : "Все кузова"}</option>
        {variants.map((v) => (
          <option key={v.code} value={v.code}>
            {v.label}
          </option>
        ))}
      </select>
    </div>
  );
}
