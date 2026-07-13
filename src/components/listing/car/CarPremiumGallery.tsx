"use client";

import { useState, useCallback } from "react";
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
  const [direction, setDirection] = useState<"left" | "right" | "none">("none");

  const go = useCallback((next: number, dir: "left" | "right") => {
    setDirection(dir);
    setCurrent(next);
  }, []);

  const prev = () => go(current === 0 ? images.length - 1 : current - 1, "left");
  const next = () => go(current === images.length - 1 ? 0 : current + 1, "right");

  if (!images.length) {
    return (
      <div
        className={cn(
          "relative aspect-[16/10] rounded-3xl overflow-hidden",
          "bg-gradient-to-br from-[var(--bg-secondary)] via-[var(--bg-card)] to-[var(--accent)]/5",
          "border border-[var(--border)] flex flex-col items-center justify-center gap-4",
          "animate-fade-up",
          className
        )}
      >
        <CarSilhouetteIllustration className="w-48 h-auto opacity-80 animate-float-soft" />
        <div className="flex items-center gap-2 text-[var(--text-muted)] text-sm">
          <Camera className="w-4 h-4" />
          Фото скоро появятся
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={cn("space-y-3 animate-fade-up", className)}>
        <div
          className={cn(
            "relative aspect-[16/10] rounded-3xl overflow-hidden group",
            "bg-[var(--bg-secondary)] shadow-[var(--shadow-md)]",
            "ring-1 ring-[var(--border)]/60"
          )}
        >
          <div
            key={current}
            className={cn(
              "absolute inset-0 animate-gallery-fade",
              direction === "left" && "origin-center",
              direction === "right" && "origin-center"
            )}
          >
            <Image
              src={images[current].url}
              alt=""
              fill
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
              sizes="(max-width: 1024px) 100vw, 66vw"
              quality={92}
              priority={current === 0}
              unoptimized
            />
          </div>

          {/* Градиент снизу */}
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/50 via-black/20 to-transparent pointer-events-none" />

          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={prev}
                className={cn(
                  "absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full",
                  "glass flex items-center justify-center",
                  "opacity-0 group-hover:opacity-100 md:opacity-100",
                  "transition-all duration-200 hover:scale-105 active:scale-95",
                  "shadow-lg"
                )}
                aria-label="Предыдущее фото"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={next}
                className={cn(
                  "absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full",
                  "glass flex items-center justify-center",
                  "opacity-0 group-hover:opacity-100 md:opacity-100",
                  "transition-all duration-200 hover:scale-105 active:scale-95",
                  "shadow-lg"
                )}
                aria-label="Следующее фото"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          <button
            type="button"
            onClick={() => setFullscreen(true)}
            className={cn(
              "absolute top-3 right-3 w-10 h-10 rounded-xl glass flex items-center justify-center",
              "opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-105"
            )}
            aria-label="На весь экран"
          >
            <Expand className="w-4 h-4" />
          </button>

          <div className="absolute bottom-3 left-3 px-3 py-1.5 rounded-full glass text-xs font-semibold tabular-nums">
            {current + 1} / {images.length}
          </div>

          {images.length > 1 && (
            <div className="absolute bottom-3 right-3 flex gap-1 md:hidden">
              {images.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => go(i, i > current ? "right" : "left")}
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-300",
                    i === current ? "w-5 bg-white" : "w-1.5 bg-white/40"
                  )}
                  aria-label={`Фото ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none snap-x">
            {images.map((img, i) => (
              <button
                key={i}
                type="button"
                onClick={() => go(i, i > current ? "right" : "left")}
                className={cn(
                  "relative shrink-0 w-[76px] h-[56px] rounded-xl overflow-hidden snap-start",
                  "border-2 transition-all duration-300 ease-out",
                  i === current
                    ? "border-[var(--accent)] ring-2 ring-[var(--accent)]/25 scale-105 shadow-md"
                    : "border-transparent opacity-65 hover:opacity-100 hover:scale-[1.02]"
                )}
              >
                <Image src={img.url} alt="" fill className="object-cover" sizes="76px" unoptimized />
              </button>
            ))}
          </div>
        )}
      </div>

      {fullscreen && (
        <div
          className="fixed inset-0 z-[100] bg-black/96 flex items-center justify-center animate-fade-in backdrop-blur-sm"
          onClick={() => setFullscreen(false)}
        >
          <button
            type="button"
            className="absolute top-5 right-5 w-11 h-11 rounded-full glass text-white flex items-center justify-center hover:scale-105 transition-transform z-10"
            onClick={() => setFullscreen(false)}
          >
            <X className="w-6 h-6" />
          </button>
          <div key={`fs-${current}`} className="relative w-full h-full animate-gallery-fade">
            <Image
              src={images[current].url}
              alt=""
              fill
              className="object-contain p-8 md:p-12"
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
                className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full glass text-white flex items-center justify-center hover:scale-105 transition-transform"
              >
                <ChevronLeft className="w-7 h-7" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  next();
                }}
                className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full glass text-white flex items-center justify-center hover:scale-105 transition-transform"
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
