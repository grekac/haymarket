"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X, Expand } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  images: { url: string }[];
  className?: string;
};

export function CarPremiumGallery({ images, className }: Props) {
  const [current, setCurrent] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);

  if (!images.length) {
    return (
      <div
        className={cn(
          "aspect-[16/10] rounded-2xl bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--text-muted)]",
          className
        )}
      >
        Нет фото
      </div>
    );
  }

  const prev = () => setCurrent((c) => (c === 0 ? images.length - 1 : c - 1));
  const next = () => setCurrent((c) => (c === images.length - 1 ? 0 : c + 1));

  return (
    <>
      <div className={cn("space-y-3", className)}>
        <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-[var(--bg-secondary)] group">
          <Image
            src={images[current].url}
            alt=""
            fill
            className="object-cover transition-opacity duration-300"
            sizes="(max-width: 1024px) 100vw, 66vw"
            quality={90}
            priority
            unoptimized
          />
          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={prev}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full glass flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Previous"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={next}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full glass flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Next"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}
          <button
            type="button"
            onClick={() => setFullscreen(true)}
            className="absolute top-3 right-3 w-9 h-9 rounded-full glass flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Fullscreen"
          >
            <Expand className="w-4 h-4" />
          </button>
          <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full glass text-xs font-medium">
            {current + 1} / {images.length}
          </div>
        </div>

        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none snap-x">
            {images.map((img, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setCurrent(i)}
                className={cn(
                  "relative shrink-0 w-[72px] h-[54px] rounded-xl overflow-hidden border-2 transition-all duration-200 snap-start",
                  i === current
                    ? "border-[var(--accent)] ring-2 ring-[var(--accent)]/20"
                    : "border-transparent opacity-70 hover:opacity-100"
                )}
              >
                <Image src={img.url} alt="" fill className="object-cover" sizes="72px" unoptimized />
              </button>
            ))}
          </div>
        )}
      </div>

      {fullscreen && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
          onClick={() => setFullscreen(false)}
        >
          <button
            type="button"
            className="absolute top-4 right-4 text-white p-2"
            onClick={() => setFullscreen(false)}
          >
            <X className="w-7 h-7" />
          </button>
          <Image
            src={images[current].url}
            alt=""
            fill
            className="object-contain p-6"
            sizes="100vw"
            quality={100}
            unoptimized
          />
          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  prev();
                }}
                className="absolute left-4 text-white"
              >
                <ChevronLeft className="w-10 h-10" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  next();
                }}
                className="absolute right-4 text-white"
              >
                <ChevronRight className="w-10 h-10" />
              </button>
            </>
          )}
        </div>
      )}
    </>
  );
}
