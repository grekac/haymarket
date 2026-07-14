"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";

export function ListingFavoriteButton({
  listingId,
  className,
}: {
  listingId: string;
  className?: string;
}) {
  const router = useRouter();
  const [fav, setFav] = useState(false);
  const [busy, setBusy] = useState(false);

  async function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (busy) return;
    setBusy(true);
    const prev = fav;
    setFav(!prev);
    try {
      const res = await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId }),
      });
      if (res.status === 401) {
        setFav(prev);
        router.push(`/login?next=/listing/${listingId}`);
        return;
      }
      const data = await res.json();
      setFav(Boolean(data.favorited));
    } catch {
      setFav(prev);
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={busy}
      className={cn(
        "p-1 -m-1 rounded-full transition-colors active:scale-90",
        fav ? "text-red-500" : "text-[var(--text-muted)]",
        className
      )}
      aria-label={fav ? "В избранном" : "В избранное"}
      aria-pressed={fav}
    >
      <Heart className={cn("w-[18px] h-[18px]", fav && "fill-current")} />
    </button>
  );
}
