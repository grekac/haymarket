"use client";

import { useState } from "react";
import { Heart, Phone } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { AskSellerButton } from "@/components/chat/AskSellerButton";

export function ListingActions({
  listingId,
  isFavorited: initial,
  phone,
  compact,
}: {
  listingId: string;
  isFavorited: boolean;
  phone?: string;
  compact?: boolean;
}) {
  const [fav, setFav] = useState(initial);
  const [showPhone, setShowPhone] = useState(false);
  const router = useRouter();

  async function toggleFavorite() {
    const res = await fetch("/api/favorites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ listingId }),
    });
    if (res.status === 401) { router.push("/login"); return; }
    const data = await res.json();
    setFav(data.favorited);
  }

  if (compact) {
    return (
      <div className="app-fixed bottom-0 md:hidden glass border-t border-[var(--border)]/60 px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
        <div className="flex gap-2">
          <button
            onClick={toggleFavorite}
            className={cn(
              "w-12 h-12 rounded-[16px] flex items-center justify-center border transition-all duration-200 active:scale-95",
              fav ? "bg-[var(--danger-soft)] border-[var(--danger)]/30 text-[var(--danger)]" : "bg-[var(--bg-secondary)] border-[var(--border)]"
            )}
          >
            <Heart className={cn("w-5 h-5", fav && "fill-current")} />
          </button>
          <AskSellerButton listingId={listingId} compact />
          {phone && (
            showPhone ? (
              <a
                href={`tel:${phone.replace(/\s/g, "")}`}
                className="flex-1 h-12 rounded-[16px] bg-[var(--emerald)] text-white font-semibold text-[15px] flex items-center justify-center gap-2"
              >
                <Phone className="w-5 h-5" /> {phone}
              </a>
            ) : (
              <button
                onClick={() => setShowPhone(true)}
                className="flex-1 h-12 rounded-[16px] bg-[var(--emerald)] text-white font-semibold text-[15px] flex items-center justify-center gap-2 active:scale-[0.98] transition-transform duration-200"
              >
                <Phone className="w-5 h-5" /> Позвонить
              </button>
            )
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={toggleFavorite}
        className={cn(
          "inline-flex items-center gap-2 px-4 py-2.5 rounded-[16px] font-semibold text-[14px] border transition-all duration-200",
          fav ? "bg-[var(--danger-soft)] border-[var(--danger)]/30 text-[var(--danger)]" : "bg-[var(--bg-secondary)] border-[var(--border)]"
        )}
      >
        <Heart className={cn("w-4 h-4", fav && "fill-current")} /> Избранное
      </button>
      <AskSellerButton listingId={listingId} />
    </div>
  );
}

export function PhoneButton({ phone }: { phone: string }) {
  const [show, setShow] = useState(false);
  if (!show) {
    return (
      <button
        onClick={() => setShow(true)}
        className="w-full h-12 rounded-[16px] bg-[var(--emerald)] text-white font-semibold text-[15px] flex items-center justify-center gap-2 transition-all duration-200 hover:opacity-90"
      >
        <Phone className="w-5 h-5" /> Позвонить
      </button>
    );
  }
  return (
    <a href={`tel:${phone.replace(/\s/g, "")}`} className="block">
      <div className="w-full h-12 rounded-[16px] bg-[var(--emerald)] text-white font-semibold text-[15px] flex items-center justify-center gap-2">
        <Phone className="w-5 h-5" /> {phone}
      </div>
    </a>
  );
}
