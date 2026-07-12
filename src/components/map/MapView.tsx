"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { MapPin } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { CITIES } from "@/lib/utils";

type MapItem = {
  id: string;
  title: string;
  price: number;
  currency: string;
  city: string;
  latitude: number;
  longitude: number;
  image: string | null;
  category: string;
  isPromoted: boolean;
  distanceKm: number;
};

const BOUNDS = { minLat: 38.8, maxLat: 41.3, minLng: 43.4, maxLng: 46.6 };

function toPercent(lat: number, lng: number) {
  const x = ((lng - BOUNDS.minLng) / (BOUNDS.maxLng - BOUNDS.minLng)) * 100;
  const y = ((BOUNDS.maxLat - lat) / (BOUNDS.maxLat - BOUNDS.minLat)) * 100;
  return { x, y };
}

export function MapView() {
  const [items, setItems] = useState<MapItem[]>([]);
  const [city, setCity] = useState("Ереван");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const coords: Record<string, { lat: number; lng: number }> = {
      Ереван: { lat: 40.1776, lng: 44.5126 },
      Гюмри: { lat: 40.7894, lng: 43.8475 },
      Ванадзор: { lat: 40.8128, lng: 44.4883 },
    };
    const c = coords[city] ?? coords["Ереван"];
    fetch(`/api/map/listings?lat=${c.lat}&lng=${c.lng}&radius=80`)
      .then((r) => r.json())
      .then((d) => setItems(d.items ?? []))
      .finally(() => setLoading(false));
  }, [city]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {CITIES.slice(0, 6).map((c) => (
          <button
            key={c}
            onClick={() => setCity(c)}
            className={`px-3 py-1.5 rounded-xl text-sm border transition-colors ${
              city === c ? "border-[var(--accent)] bg-[var(--accent)]/10" : "border-[var(--border)]"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="relative aspect-[16/10] rounded-2xl overflow-hidden border border-[var(--border)] bg-gradient-to-br from-emerald-50 to-sky-50 dark:from-emerald-950/30 dark:to-sky-950/30">
        <div className="absolute inset-0 opacity-20 bg-[url('https://tile.openstreetmap.org/6/38/24.png')] bg-cover" />
        {items.map((item) => {
          const { x, y } = toPercent(item.latitude, item.longitude);
          return (
            <Link
              key={item.id}
              href={`/listing/${item.id}`}
              className="absolute group"
              style={{ left: `${x}%`, top: `${y}%`, transform: "translate(-50%, -50%)" }}
              title={item.title}
            >
              <span className={`block w-3 h-3 rounded-full border-2 border-white shadow-md ${item.isPromoted ? "bg-amber-500" : "bg-[var(--accent)]"}`} />
            </Link>
          );
        })}
        <div className="absolute bottom-3 left-3 text-xs bg-[var(--bg-card)]/90 px-2 py-1 rounded-lg border border-[var(--border)]">
          {loading ? "Загрузка..." : `${items.length} объявлений рядом`}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {items.slice(0, 8).map((item) => (
          <Link key={item.id} href={`/listing/${item.id}`} className="flex gap-3 p-3 rounded-xl border border-[var(--border)] hover:shadow-md transition-all">
            {item.image && (
              <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0">
                <Image src={item.image} alt="" fill className="object-cover" sizes="64px" />
              </div>
            )}
            <div className="min-w-0">
              <p className="font-semibold text-sm">{formatPrice(item.price, item.currency)}</p>
              <p className="text-xs text-[var(--text-secondary)] line-clamp-2">{item.title}</p>
              <p className="text-xs text-[var(--text-muted)] mt-1 flex items-center gap-1">
                <MapPin className="w-3 h-3" /> {item.distanceKm.toFixed(1)} км
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
