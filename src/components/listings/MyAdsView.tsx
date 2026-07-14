"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Pencil, Percent, CircleDot } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { fixMojibake } from "@/lib/text-encoding";

type ListingRow = {
  id: string;
  title: string;
  price: number;
  currency: string;
  status: string;
  images: { url: string }[];
};

type TabId = "action" | "sell" | "archive";

const TABS: { id: TabId; label: string }[] = [
  { id: "action", label: "Ждут действий" },
  { id: "sell", label: "Можно продать" },
  { id: "archive", label: "Архив" },
];

function tabForStatus(status: string): TabId {
  if (status === "ACTIVE") return "sell";
  if (status === "SOLD" || status === "ARCHIVED") return "archive";
  return "action";
}

function statusLabel(status: string) {
  switch (status) {
    case "PENDING":
      return "Нужна модерация";
    case "REJECTED":
      return "Отклонено";
    case "ACTIVE":
      return "Активно";
    case "SOLD":
      return "Продано";
    case "ARCHIVED":
      return "В архиве";
    default:
      return status;
  }
}

export function MyAdsView({ listings }: { listings: ListingRow[] }) {
  const counts = useMemo(() => {
    const c = { action: 0, sell: 0, archive: 0 };
    for (const l of listings) c[tabForStatus(l.status)] += 1;
    return c;
  }, [listings]);

  const initialTab: TabId =
    counts.action > 0 ? "action" : counts.sell > 0 ? "sell" : "archive";

  const [tab, setTab] = useState<TabId>(initialTab);

  const filtered = listings.filter((l) => tabForStatus(l.status) === tab);

  const needsPayment = filtered.filter((l) => l.status === "PENDING" || l.status === "REJECTED");
  const rest = filtered.filter((l) => l.status !== "PENDING" && l.status !== "REJECTED");

  return (
    <div className="pb-36 md:pb-12">
      <header className="px-4 pt-3 pb-2 md:pt-6">
        <h1 className="text-[20px] md:text-[28px] font-bold tracking-tight text-center md:text-left">
          Мои объявления
        </h1>
      </header>

      <div className="px-4 mt-2">
        <Link
          href="/create"
          className="flex items-center justify-between gap-3 p-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-700 text-white active:scale-[0.99] transition-transform"
        >
          <div>
            <p className="font-semibold text-[15px]">Скидки и акции</p>
            <p className="text-[12px] text-white/80 mt-0.5">настройте для покупателей</p>
          </div>
          <span className="w-10 h-10 rounded-full bg-emerald-400/90 text-emerald-950 flex items-center justify-center shrink-0">
            <Percent className="w-5 h-5" strokeWidth={2.5} />
          </span>
        </Link>
      </div>

      <div className="mt-4 border-b border-[var(--border)] overflow-x-auto scrollbar-none">
        <div className="flex px-2 min-w-max">
          {TABS.map((t) => {
            const active = tab === t.id;
            const count = counts[t.id];
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={cn(
                  "relative px-3 py-3 text-[14px] font-medium whitespace-nowrap transition-colors",
                  active ? "text-[var(--text-primary)]" : "text-[var(--text-muted)]"
                )}
              >
                {t.label}
                {count > 0 && (
                  <sup className="ml-0.5 text-[10px] font-semibold text-[var(--text-muted)]">
                    {count}
                  </sup>
                )}
                {active && (
                  <span className="absolute left-3 right-3 bottom-0 h-[2px] rounded-full bg-[var(--text-primary)]" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-4 pt-4 space-y-5">
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[var(--border)] p-8 text-center">
            <p className="text-sm text-[var(--text-muted)]">
              {tab === "action" && "Нет объявлений, ожидающих действий"}
              {tab === "sell" && "Нет активных объявлений"}
              {tab === "archive" && "Архив пуст"}
            </p>
          </div>
        ) : (
          <>
            {needsPayment.length > 0 && (
              <section className="space-y-3">
                <h2 className="text-[15px] font-semibold">Нужна оплата</h2>
                <div className="space-y-2">
                  {needsPayment.map((l) => (
                    <ListingRowCard key={l.id} listing={l} />
                  ))}
                </div>
              </section>
            )}

            {rest.length > 0 && (
              <section className="space-y-2">
                {needsPayment.length > 0 && (
                  <h2 className="text-[15px] font-semibold pt-1">Остальные</h2>
                )}
                {rest.map((l) => (
                  <ListingRowCard key={l.id} listing={l} />
                ))}
              </section>
            )}
          </>
        )}
      </div>

      <div className="fixed bottom-[calc(3.5rem+env(safe-area-inset-bottom))] inset-x-0 z-40 px-4 pb-3 md:static md:mt-8 md:px-4 md:max-w-2xl md:mx-auto">
        <Link
          href="/create"
          className="flex h-12 items-center justify-center rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)] text-[15px] font-semibold text-[var(--text-primary)] active:scale-[0.98] transition-transform shadow-[var(--shadow-sm)]"
        >
          Разместить объявление
        </Link>
      </div>
    </div>
  );
}

function ListingRowCard({ listing }: { listing: ListingRow }) {
  const image = listing.images[0]?.url;
  const title = fixMojibake(listing.title);

  return (
    <div className="flex items-center gap-3 p-3 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)]/50">
      <Link
        href={`/listing/${listing.id}`}
        className="relative w-14 h-14 rounded-xl overflow-hidden bg-[var(--bg-card)] shrink-0"
      >
        {image ? (
          <Image src={image} alt="" fill unoptimized className="object-cover" sizes="56px" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[var(--text-muted)]">
            <CircleDot className="w-5 h-5" />
          </div>
        )}
      </Link>

      <Link href={`/listing/${listing.id}`} className="flex-1 min-w-0">
        <p className="text-[14px] font-medium line-clamp-2 leading-snug">{title}</p>
        <p className="text-[13px] text-[var(--text-secondary)] mt-0.5 tabular-nums">
          {formatPrice(listing.price, listing.currency)}
        </p>
        <p className="text-[11px] text-[var(--text-muted)] mt-0.5">{statusLabel(listing.status)}</p>
      </Link>

      <Link
        href={`/listing/${listing.id}/edit`}
        className="p-2.5 rounded-xl text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] shrink-0"
        aria-label="Редактировать"
      >
        <Pencil className="w-4 h-4" />
      </Link>
    </div>
  );
}
