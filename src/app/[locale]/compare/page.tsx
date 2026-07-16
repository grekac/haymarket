"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { BackButton } from "@/components/ui/BackButton";
import { clearCompare, getCompareList, removeFromCompare } from "@/lib/compare";
import { formatPrice } from "@/lib/utils";

type Listing = {
  id: string;
  title: string;
  price: number;
  currency: string;
  city: string;
  description: string;
  category: { name: string };
  images: { url: string }[];
  carDetails?: {
    brand: string;
    model: string;
    year: number;
    mileage: number;
    transmission: string;
    engineType: string;
  } | null;
  realEstate?: { area: number; rooms: number | null; floor: number | null } | null;
};

export default function ComparePage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ids = getCompareList().map((x) => x.id);
    if (ids.length === 0) {
      setLoading(false);
      return;
    }
    fetch(`/api/listings/compare?ids=${ids.join(",")}`)
      .then((r) => r.json())
      .then((data) => setListings(data))
      .finally(() => setLoading(false));
  }, []);

  function onRemove(id: string) {
    removeFromCompare(id);
    setListings((prev) => prev.filter((l) => l.id !== id));
  }

  const rows: { label: string; values: (string | number)[] }[] = [
    { label: "Цена", values: listings.map((l) => formatPrice(l.price, l.currency)) },
    { label: "Город", values: listings.map((l) => l.city) },
    { label: "Категория", values: listings.map((l) => l.category.name) },
    { label: "Марка", values: listings.map((l) => l.carDetails?.brand ?? "—") },
    { label: "Модель", values: listings.map((l) => l.carDetails?.model ?? "—") },
    { label: "Год", values: listings.map((l) => l.carDetails?.year ?? "—") },
    { label: "Пробег", values: listings.map((l) => (l.carDetails ? `${l.carDetails.mileage.toLocaleString()} км` : "—")) },
    { label: "Площадь", values: listings.map((l) => (l.realEstate ? `${l.realEstate.area} м²` : "—")) },
    { label: "Комнаты", values: listings.map((l) => l.realEstate?.rooms ?? "—") },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 md:py-10 pb-28">
      <BackButton href="/search" />
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Сравнение</h1>
        {listings.length > 0 && (
          <button type="button" onClick={() => { clearCompare(); setListings([]); }} className="text-sm text-[var(--text-muted)] hover:underline">
            Очистить всё
          </button>
        )}
      </div>

      {loading && <p className="text-[var(--text-muted)]">Загрузка…</p>}

      {!loading && listings.length === 0 && (
        <div className="text-center py-16 text-[var(--text-muted)]">
          <p>Нет объявлений для сравнения.</p>
          <Link href="/search" className="text-[var(--accent)] underline mt-2 inline-block">Найти объявления</Link>
        </div>
      )}

      {listings.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse">
            <thead>
              <tr>
                <th className="text-left p-3 text-sm text-[var(--text-muted)] w-32" />
                {listings.map((l) => (
                  <th key={l.id} className="p-3 align-top">
                    <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-[var(--bg-secondary)] mb-2">
                      {l.images[0]?.url && (
                        <Image src={l.images[0].url} alt="" fill className="object-cover" />
                      )}
                    </div>
                    <Link href={`/listing/${l.id}`} className="font-semibold text-sm line-clamp-2 hover:underline">
                      {l.title}
                    </Link>
                    <button type="button" onClick={() => onRemove(l.id)} className="text-xs text-red-600 mt-2 hover:underline">
                      Убрать
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.label} className="border-t border-[var(--border)]">
                  <td className="p-3 text-sm font-medium text-[var(--text-muted)]">{row.label}</td>
                  {row.values.map((val, i) => (
                    <td key={i} className="p-3 text-sm">{val}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
