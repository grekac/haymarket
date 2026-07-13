"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Phone, Share2, Heart, Bell } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { AskSellerButton } from "@/components/chat/AskSellerButton";
import { CompareButton } from "@/components/listings/CompareButton";
import type { CompareItem } from "@/lib/compare";

function whatsAppUrl(phone: string, text: string) {
  const digits = phone.replace(/\D/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}

export function CarContactActions({
  listingId,
  title,
  price,
  currency,
  phone,
  isFavorited: initialFav,
  compare,
  sellerId,
  sticky,
}: {
  listingId: string;
  title: string;
  price: number;
  currency: string;
  phone: string;
  isFavorited: boolean;
  compare: CompareItem;
  sellerId: string;
  sticky?: boolean;
}) {
  const router = useRouter();
  const [fav, setFav] = useState(initialFav);
  const [showPhone, setShowPhone] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  async function toggleFavorite() {
    const res = await fetch("/api/favorites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ listingId }),
    });
    if (res.status === 401) {
      router.push(`/login?next=/listing/${listingId}`);
      return;
    }
    const data = await res.json();
    setFav(data.favorited);
  }

  function toggleSubscribe() {
    const key = `haymarket_sub_${sellerId}`;
    const next = !subscribed;
    setSubscribed(next);
    if (next) localStorage.setItem(key, "1");
    else localStorage.removeItem(key);
  }

  async function share() {
    const url = window.location.href;
    const shareData = { title, text: `${title} — ${formatPrice(price, currency)}`, url };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        /* cancelled */
      }
    } else {
      await navigator.clipboard.writeText(url);
    }
  }

  const wrap = sticky
    ? "lg:sticky lg:top-20 space-y-4"
    : "space-y-4";

  return (
    <div className={wrap}>
      <div className="p-5 md:p-6 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] shadow-[var(--shadow-sm)]">
        <p className="text-[32px] md:text-[36px] font-bold tracking-tight leading-none">
          {formatPrice(price, currency)}
        </p>

        <div className="grid grid-cols-2 gap-2 mt-4">
          {showPhone ? (
            <a
              href={`tel:${phone.replace(/\s/g, "")}`}
              className="col-span-2 h-12 rounded-xl bg-emerald-600 text-white font-semibold text-sm flex items-center justify-center gap-2"
            >
              <Phone className="w-4 h-4" /> {phone}
            </a>
          ) : (
            <button
              type="button"
              onClick={() => setShowPhone(true)}
              className="col-span-2 h-12 rounded-xl bg-emerald-600 text-white font-semibold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
            >
              <Phone className="w-4 h-4" /> Позвонить
            </button>
          )}
          <AskSellerButton listingId={listingId} className="!h-12 !rounded-xl !w-full !justify-center" />
          <a
            href={whatsAppUrl(phone, `Здравствуйте! Интересует: ${title}`)}
            target="_blank"
            rel="noopener noreferrer"
            className="h-12 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] font-semibold text-sm flex items-center justify-center gap-2 hover:bg-[var(--bg-hover)] transition-colors"
          >
            WhatsApp
          </a>
          <button
            type="button"
            onClick={share}
            className="h-12 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] font-semibold text-sm flex items-center justify-center gap-2 hover:bg-[var(--bg-hover)] transition-colors"
          >
            <Share2 className="w-4 h-4" /> Поделиться
          </button>
        </div>

        <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-[var(--border)]">
          <button
            type="button"
            onClick={toggleFavorite}
            className={cn(
              "inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition-colors",
              fav
                ? "bg-[var(--danger-soft)] border-[var(--danger)]/30 text-[var(--danger)]"
                : "border-[var(--border)] text-[var(--text-secondary)]"
            )}
          >
            <Heart className={cn("w-3.5 h-3.5", fav && "fill-current")} />
            Избранное
          </button>
          <CompareButton listing={compare} compact className="!px-3 !py-2 !text-xs !rounded-lg" />
          <button
            type="button"
            onClick={toggleSubscribe}
            className={cn(
              "inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition-colors",
              subscribed
                ? "bg-[var(--accent)]/10 border-[var(--accent)]/30 text-[var(--accent)]"
                : "border-[var(--border)] text-[var(--text-secondary)]"
            )}
          >
            <Bell className="w-3.5 h-3.5" />
            {subscribed ? "Подписан" : "На продавца"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function CarContactBarMobile(props: Omit<Parameters<typeof CarContactActions>[0], "sticky">) {
  return (
    <div className="fixed bottom-0 inset-x-0 z-40 md:hidden glass border-t border-[var(--border)] px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => props.phone && window.open(`tel:${props.phone.replace(/\s/g, "")}`)}
          className="flex-1 h-12 rounded-xl bg-emerald-600 text-white font-semibold text-sm flex items-center justify-center gap-2"
        >
          <Phone className="w-4 h-4" /> Позвонить
        </button>
        <AskSellerButton listingId={props.listingId} compact />
      </div>
    </div>
  );
}
