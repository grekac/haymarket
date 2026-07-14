"use client";

import { useState } from "react";
import { MapPin, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

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

  const osmEmbed =
    hasCoords
      ? `https://www.openstreetmap.org/export/embed.html?bbox=${longitude! - 0.02}%2C${latitude! - 0.015}%2C${longitude! + 0.02}%2C${latitude! + 0.015}&layer=mapnik&marker=${latitude}%2C${longitude}`
      : null;

  return (
    <section className="space-y-3">
      <h2 className="font-semibold text-base">Местоположение</h2>
      <p className="text-[15px] text-[var(--text-secondary)] flex items-start gap-2">
        <MapPin className="w-4 h-4 shrink-0 mt-0.5 text-[var(--accent)]" />
        <span>{label}</span>
      </p>

      {hasCoords && osmEmbed && (
        <>
          <button
            type="button"
            onClick={() => setShowMap((v) => !v)}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--accent)] hover:underline"
          >
            Узнать подробности
            {showMap ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showMap && (
            <div
              className={cn(
                "relative aspect-[16/10] rounded-2xl overflow-hidden border border-[var(--border)]",
                "bg-[var(--bg-secondary)] animate-fade-in shadow-[var(--shadow-sm)]"
              )}
            >
              <iframe
                title="Карта расположения"
                src={osmEmbed}
                className="absolute inset-0 w-full h-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
              <a
                href={`https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=15/${latitude}/${longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute bottom-2 right-2 px-2.5 py-1 rounded-lg text-[11px] font-medium glass"
              >
                Открыть карту
              </a>
            </div>
          )}
        </>
      )}
    </section>
  );
}
