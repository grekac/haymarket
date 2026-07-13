"use client";

import { useState } from "react";
import { MapPin } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

const BOUNDS = { minLat: 38.8, maxLat: 41.3, minLng: 43.4, maxLng: 46.6 };

function toPercent(lat: number, lng: number) {
  const x = ((lng - BOUNDS.minLng) / (BOUNDS.maxLng - BOUNDS.minLng)) * 100;
  const y = ((BOUNDS.maxLat - lat) / (BOUNDS.maxLat - BOUNDS.minLat)) * 100;
  return { x, y };
}

export function CarLocationBlock({
  city,
  district,
  address,
  latitude,
  longitude,
}: {
  city: string;
  district?: string | null;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}) {
  const [showMap, setShowMap] = useState(false);
  const hasCoords = latitude != null && longitude != null;
  const label = [city, district, address].filter(Boolean).join(", ");

  return (
    <Card className="p-5 md:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-semibold text-base">Расположение</h2>
          <p className="text-sm text-[var(--text-secondary)] mt-1 flex items-center gap-1.5">
            <MapPin className="w-4 h-4 shrink-0 text-[var(--accent)]" />
            {label}
          </p>
        </div>
        {hasCoords && (
          <button
            type="button"
            onClick={() => setShowMap((v) => !v)}
            className="text-sm font-medium text-[var(--accent)] hover:underline shrink-0"
          >
            {showMap ? "Скрыть карту" : "Показать на карте"}
          </button>
        )}
      </div>

      {showMap && hasCoords && (
        <div
          className={cn(
            "relative mt-4 aspect-[16/9] rounded-xl overflow-hidden border border-[var(--border)]",
            "bg-gradient-to-br from-emerald-50 to-sky-50 dark:from-emerald-950/30 dark:to-sky-950/30 animate-fade-in"
          )}
        >
          <div className="absolute inset-0 opacity-25 bg-[url('https://tile.openstreetmap.org/6/38/24.png')] bg-cover" />
          <span
            className="absolute w-4 h-4 rounded-full bg-[var(--accent)] border-2 border-white shadow-lg"
            style={{
              left: `${toPercent(latitude!, longitude!).x}%`,
              top: `${toPercent(latitude!, longitude!).y}%`,
              transform: "translate(-50%, -50%)",
            }}
          />
        </div>
      )}
    </Card>
  );
}
