"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";

const STORAGE_KEY = "haymarket_recent";
const MAX_ITEMS = 12;

type RecentItem = {
  id: string;
  title: string;
  price: number;
  currency: string;
  image?: string;
  viewedAt: number;
};

export function trackRecentlyViewed(item: Omit<RecentItem, "viewedAt">) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const list: RecentItem[] = raw ? JSON.parse(raw) : [];
    const next = [
      { ...item, viewedAt: Date.now() },
      ...list.filter((x) => x.id !== item.id),
    ].slice(0, MAX_ITEMS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
}

export function RecentlyViewed() {
  const [items, setItems] = useState<RecentItem[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {
      /* ignore */
    }
  }, []);

  if (items.length === 0) return null;

  return (
    <section className="px-4 mb-2 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-[17px] font-semibold tracking-tight">Недавно смотрели</h2>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-none">
        {items.map((item) => (
          <Link
            key={item.id}
            href={`/listing/${item.id}`}
            className="shrink-0 w-[140px] rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] overflow-hidden hover:shadow-md transition-shadow"
          >
            <div className="relative h-[90px] bg-[var(--bg-secondary)]">
              {item.image ? (
                <Image src={item.image} alt="" fill unoptimized className="object-cover" sizes="140px" />
              ) : null}
            </div>
            <div className="p-2.5">
              <p className="text-[12px] font-medium line-clamp-2 leading-tight">{item.title}</p>
              <p className="text-[11px] font-bold text-[var(--accent)] mt-1">
                {formatPrice(item.price, item.currency)}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
