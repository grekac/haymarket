"use client";

import { useState, useEffect } from "react";
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

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
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
  const [shared, setShared] = useState(false);

  useEffect(() => {
    setSubscribed(localStorage.getItem(`haymarket_sub_${sellerId}`) === "1");
  }, [sellerId]);

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
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    }
  }

  const wrap = sticky ? "lg:sticky lg:top-20" : "";

  return (
    <div className={wrap}>
      <div className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] shadow-[var(--shadow-sm)]">
        <p className="text-[30px] md:text-[34px] font-bold tracking-tight leading-none tabular-nums">
          {formatPrice(price, currency)}
        </p>

        <div className="mt-4 space-y-2">
          {showPhone ? (
            <a
              href={`tel:${phone.replace(/\s/g, "")}`}
              className="flex h-12 items-center justify-center gap-2 rounded-xl bg-[var(--accent)] text-[var(--accent-fg)] font-semibold text-sm active:scale-[0.98] transition-transform"
            >
              <Phone className="w-4 h-4" />
              {phone}
            </a>
          ) : (
            <button
              type="button"
              onClick={() => setShowPhone(true)}
              className="w-full h-12 rounded-xl bg-[var(--accent)] text-[var(--accent-fg)] font-semibold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
            >
              <Phone className="w-4 h-4" />
              Позвонить
            </button>
          )}

          <div className="grid grid-cols-2 gap-2">
            <AskSellerButton
              listingId={listingId}
              label="Написать"
              className="!h-11 !rounded-xl !w-full !justify-center !text-sm !font-semibold !bg-[var(--bg-secondary)] !text-[var(--text-primary)] !border !border-[var(--border)] hover:!bg-[var(--bg-hover)]"
            />
            <a
              href={whatsAppUrl(phone, `Здравствуйте! Интересует: ${title}`)}
              target="_blank"
              rel="noopener noreferrer"
              className="h-11 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold bg-[#25D366]/10 text-[#1a9e52] border border-[#25D366]/25 hover:bg-[#25D366]/15 transition-colors"
            >
              <WhatsAppIcon className="w-4 h-4" />
              WhatsApp
            </a>
          </div>

          <button
            type="button"
            onClick={share}
            className="w-full h-10 rounded-xl text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] transition-colors flex items-center justify-center gap-1.5"
          >
            <Share2 className="w-3.5 h-3.5" />
            {shared ? "Ссылка скопирована" : "Поделиться"}
          </button>
        </div>

        <div className="flex items-center justify-between gap-1 mt-4 pt-4 border-t border-[var(--border)]">
          <button
            type="button"
            onClick={toggleFavorite}
            title="В избранное"
            className={cn(
              "flex-1 flex flex-col items-center gap-1 py-2 rounded-lg text-[11px] font-medium transition-colors",
              fav ? "text-[var(--danger)]" : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
            )}
          >
            <Heart className={cn("w-5 h-5", fav && "fill-current")} />
            Избранное
          </button>
          <div className="flex-1 flex flex-col items-center">
            <CompareButton listing={compare} compact className="!flex-col !gap-1 !py-2 !px-0 !h-auto !text-[11px] !font-medium !text-[var(--text-muted)]" />
          </div>
          <button
            type="button"
            onClick={toggleSubscribe}
            title="Подписаться"
            className={cn(
              "flex-1 flex flex-col items-center gap-1 py-2 rounded-lg text-[11px] font-medium transition-colors",
              subscribed ? "text-[var(--accent)]" : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
            )}
          >
            <Bell className="w-5 h-5" />
            {subscribed ? "Подписан" : "Подписка"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function CarContactBarMobile(
  props: Omit<Parameters<typeof CarContactActions>[0], "sticky">
) {
  const waUrl = whatsAppUrl(props.phone, `Здравствуйте! Интересует: ${props.title}`);

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 md:hidden glass border-t border-[var(--border)] px-3 py-2.5 pb-[calc(0.625rem+env(safe-area-inset-bottom))]">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => props.phone && window.open(`tel:${props.phone.replace(/\s/g, "")}`)}
          className="flex-[1.2] h-11 rounded-xl bg-[var(--accent)] text-[var(--accent-fg)] font-semibold text-sm flex items-center justify-center gap-1.5"
        >
          <Phone className="w-4 h-4" />
          Звонок
        </button>
        <AskSellerButton
          listingId={props.listingId}
          compact
          className="!flex-1 !h-11 !rounded-xl"
        />
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-11 h-11 shrink-0 rounded-xl bg-[#25D366]/12 text-[#1a9e52] border border-[#25D366]/25 flex items-center justify-center"
          aria-label="WhatsApp"
        >
          <WhatsAppIcon className="w-5 h-5" />
        </a>
      </div>
    </div>
  );
}
