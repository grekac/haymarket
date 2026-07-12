"use client";

import { useEffect, useState } from "react";

type Props = {
  modelId: string | null | undefined;
  value: string;
  onChange: (trim: string) => void;
  className?: string;
};

export function CarTrimFilter({ modelId, value, onChange, className }: Props) {
  const [trims, setTrims] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!modelId) {
      setTrims([]);
      return;
    }

    setLoading(true);
    fetch(`/api/cars/trims?modelId=${modelId}`)
      .then((r) => r.json())
      .then((data: { trims?: string[] }) => setTrims(data.trims ?? []))
      .finally(() => setLoading(false));
  }, [modelId]);

  if (!modelId) return null;

  return (
    <div className={className}>
      <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2 block">
        Комплектация
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={loading}
        className="w-full px-3 py-2.5 rounded-xl text-sm bg-[var(--bg-input)] border border-[var(--border)]"
      >
        <option value="">{loading ? "Загрузка..." : "Все комплектации"}</option>
        {trims.map((trim) => (
          <option key={trim} value={trim}>
            {trim}
          </option>
        ))}
      </select>
    </div>
  );
}
