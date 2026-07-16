"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, X, Expand, Camera, Heart, Share2 } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { CarSilhouetteIllustration } from "./CarIllustration";

type Props = {
  images: { url: string }[];
  listingId: string;
  title?: string;
  price?: number;
  currency?: string;
  isFavorited?: boolean;
  className?: string;
};

export function CarPremiumGallery({
  images,
  listingId,
  title = "",
  price = 0,
  currency = "AMD",
  isFavorited: initialFav = false,
  className,
}: Props) {
  const router = useRouter();
  const [current, setCurrent] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const [fav, setFav] = useState(initialFav);
  const [favBusy, setFavBusy] = useState(false);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const touchX = useRef<number | null>(null);

  useEffect(() => {
    setFav(initialFav);
  }, [initialFav]);

  const go = useCallback((next: number) => {
    setCurrent(next);
  }, []);

  const prev = () => go(current === 0 ? images.length - 1 : current - 1);
  const next = () => go(current === images.length - 1 ? 0 : current + 1);

  function onTouchStart(e: React.TouchEvent) {
    touchX.current = e.touches[0].clientX;
  }

  function onTouchEnd(e: React.TouchEvent) {
    if (touchX.current == null || images.length < 2) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    touchX.current = null;
    if (Math.abs(dx) < 40) return;
    if (dx < 0) next();
    else prev();
  }

  function onMobileScroll() {
    const el = scrollerRef.current;
    if (!el || !images.length) return;
    const w = el.clientWidth || 1;
    const idx = Math.round(el.scrollLeft / w);
    if (idx !== current && idx >= 0 && idx < images.length) setCurrent(idx);
  }

  async function toggleFavorite(e: React.MouseEvent) {
    e.stopPropagation();
    if (favBusy) return;
    setFavBusy(true);
    const prevFav = fav;
    setFav(!prevFav);
    try {
      const res = await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId }),
      });
      if (res.status === 401) {
        setFav(prevFav);
        router.push(`/login?next=/listing/${listingId}`);
        return;
      }
      const data = await res.json();
      setFav(Boolean(data.favorited));
    } catch {
      setFav(prevFav);
    } finally {
      setFavBusy(false);
    }
  }

  async function share(e: React.MouseEvent) {
    e.stopPropagation();
    const url = window.location.href;
    const shareData = {
      title: title || "HayMarket",
      text: title ? `${title} — ${formatPrice(price, currency)}` : url,
      url,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        /* cancelled */
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      /* ignore */
    }
  }

  const overlayActions = (
    <div className="absolute top-3 right-3 z-20 flex items-center gap-2 md:hidden">
      <button
        type="button"
        onClick={share}
        className="w-9 h-9 rounded-full bg-black/35 backdrop-blur-md text-white flex items-center justify-center active:scale-95 transition-transform"
        aria-label="Поделиться"
      >
        <Share2 className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={toggleFavorite}
        disabled={favBusy}
        className={cn(
          "w-9 h-9 rounded-full backdrop-blur-md flex items-center justify-center active:scale-95 transition-all",
          fav ? "bg-white/95 text-red-500 shadow-[0_0_0_3px_rgba(239,68,68,0.35)]" : "bg-black/35 text-white"
        )}
        aria-label={fav ? "В избранном" : "В избранное"}
        aria-pressed={fav}
      >
        <Heart className={cn("w-[18px] h-[18px] transition-transform", fav && "fill-current scale-110")} />
      </button>
    </div>
  );

  if (!images.length) {
    return (
      <div
        className={cn(
          "relative aspect-[4/3] md:aspect-[16/10] md:rounded-2xl overflow-hidden",
          "bg-gradient-to-br from-[var(--bg-secondary)] via-[var(--bg-card)] to-[var(--accent)]/5",
          "md:border md:border-[var(--border)] flex flex-col items-center justify-center gap-4",
          "-mx-4 md:mx-0",
          className
        )}
      >
        {overlayActions}
        <CarSilhouetteIllustration className="w-48 h-auto opacity-80" />
        <div className="flex items-center gap-2 text-[var(--text-muted)] text-sm">
          <Camera className="w-4 h-4" />
          Фото скоро появятся
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={cn("md:space-y-2", className)}>
        {/* Mobile: Avito-style horizontal snap gallery */}
        <div className="relative -mx-4 md:hidden">
          <div
            ref={scrollerRef}
            onScroll={onMobileScroll}
            className="flex overflow-x-auto snap-x snap-mandatory scrollbar-none overscroll-x-contain"
            style={{ WebkitOverflowScrolling: "touch" }}
          >
            {images.map((img, i) => (
              <div
                key={i}
                className="relative w-full shrink-0 snap-center aspect-[4/3] bg-[var(--bg-secondary)]"
              >
                <Image
                  src={img.url}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="100vw"
                  quality={90}
                  priority={i === 0}
                  draggable={false}
                />
              </div>
            ))}
          </div>

          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
          {overlayActions}

          {images.length > 1 && (
            <div className="absolute bottom-3 inset-x-0 flex flex-col items-center gap-2 pointer-events-none">
              <div className="flex gap-1.5">
                {images.map((_, i) => (
                  <span
                    key={i}
                    className={cn(
                      "h-1 rounded-full transition-all",
                      i === current ? "w-4 bg-white" : "w-1.5 bg-white/45"
                    )}
                  />
                ))}
              </div>
              <span className="px-2 py-0.5 rounded-full bg-black/40 text-white text-[11px] font-semibold tabular-nums">
                {current + 1} / {images.length}
              </span>
            </div>
          )}
        </div>

        {/* Desktop gallery */}
        <div
          className={cn(
            "relative aspect-[16/10] rounded-2xl overflow-hidden group hidden md:block",
            "bg-[var(--bg-secondary)] shadow-[var(--shadow-md)] ring-1 ring-[var(--border)]/60"
          )}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <div key={current} className="absolute inset-0 animate-gallery-fade">
            <Image
              src={images[current].url}
              alt=""
              fill
              className="object-cover"
              sizes="66vw"
              quality={92}
              priority={current === 0}
            />
          </div>

          <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/45 to-transparent pointer-events-none" />

          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={prev}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full glass flex items-center justify-center opacity-90 hover:scale-105 active:scale-95 transition-transform shadow-lg"
                aria-label="Предыдущее фото"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={next}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full glass flex items-center justify-center opacity-90 hover:scale-105 active:scale-95 transition-transform shadow-lg"
                aria-label="Следующее фото"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          <button
            type="button"
            onClick={() => setFullscreen(true)}
            className="absolute top-3 right-3 w-9 h-9 rounded-xl glass flex items-center justify-center"
            aria-label="На весь экран"
          >
            <Expand className="w-4 h-4" />
          </button>

          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full glass text-xs font-semibold tabular-nums">
            {current + 1} / {images.length}
          </div>
        </div>

        {images.length > 1 && (
          <div className="hidden md:flex gap-1.5 overflow-x-auto pb-1 scrollbar-none snap-x">
            {images.map((img, i) => (
              <button
                key={i}
                type="button"
                onClick={() => go(i)}
                className={cn(
                  "relative shrink-0 w-[64px] h-[48px] rounded-lg overflow-hidden snap-start",
                  "border-2 transition-all",
                  i === current
                    ? "border-[var(--accent)]"
                    : "border-transparent opacity-70 hover:opacity-100"
                )}
              >
                <Image src={img.url} alt="" fill className="object-cover" sizes="64px" />
              </button>
            ))}
          </div>
        )}
      </div>

      {fullscreen && (
        <div
          className="fixed inset-0 z-[100] bg-black/96 flex items-center justify-center animate-fade-in"
          onClick={() => setFullscreen(false)}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <button
            type="button"
            className="absolute top-5 right-5 w-11 h-11 rounded-full glass text-white flex items-center justify-center z-10"
            onClick={() => setFullscreen(false)}
          >
            <X className="w-6 h-6" />
          </button>
          <div key={`fs-${current}`} className="relative w-full h-full animate-gallery-fade">
            <Image
              src={images[current].url}
              alt=""
              fill
              className="object-contain p-6 md:p-12"
              sizes="100vw"
              quality={100}
            />
          </div>
          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  prev();
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full glass text-white flex items-center justify-center"
              >
                <ChevronLeft className="w-7 h-7" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  next();
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full glass text-white flex items-center justify-center"
              >
                <ChevronRight className="w-7 h-7" />
              </button>
              <p className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/70 text-sm tabular-nums">
                {current + 1} / {images.length}
              </p>
            </>
          )}
        </div>
      )}
    </>
  );
}
