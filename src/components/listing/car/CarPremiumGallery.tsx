"use client";

import { useState, useCallback, useRef } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X, Expand, Camera } from "lucide-react";
import { cn } from "@/lib/utils";
import { CarSilhouetteIllustration } from "./CarIllustration";

type Props = {
  images: { url: string }[];
  className?: string;
};

export function CarPremiumGallery({ images, className }: Props) {
  const [current, setCurrent] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const touchX = useRef<number | null>(null);

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

  if (!images.length) {
    return (
      <div
        className={cn(
          "relative aspect-[4/3] md:aspect-[16/10] md:rounded-2xl overflow-hidden",
          "bg-gradient-to-br from-[var(--bg-secondary)] via-[var(--bg-card)] to-[var(--accent)]/5",
          "border border-[var(--border)] flex flex-col items-center justify-center gap-4",
          className
        )}
      >
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
      <div className={cn("space-y-2", className)}>
        <div
          className={cn(
            "relative aspect-[4/3] md:aspect-[16/10] md:rounded-2xl overflow-hidden group",
            "bg-[var(--bg-secondary)] md:shadow-[var(--shadow-md)]",
            "md:ring-1 md:ring-[var(--border)]/60 -mx-4 md:mx-0"
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
              sizes="(max-width: 1024px) 100vw, 66vw"
              quality={92}
              priority={current === 0}
              unoptimized
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
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none snap-x">
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
                <Image src={img.url} alt="" fill className="object-cover" sizes="64px" unoptimized />
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
              unoptimized
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
