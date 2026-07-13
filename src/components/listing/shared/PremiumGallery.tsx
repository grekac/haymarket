"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X, Expand } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  images: { url: string }[];
  className?: string;
};

export function PremiumGallery({ images, className }: Props) {
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
            quality={85}
            priority={current === 0}
            loading={current === 0 ? "eager" : "lazy"}
            unoptimized
          />
          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={prev}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Предыдущее"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={next}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Следующее"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}
          <button
            type="button"
            onClick={() => setFullscreen(true)}
            className="absolute top-3 right-3 w-9 h-9 rounded-lg bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="На весь экран"
          >
            <Expand className="w-4 h-4" />
          </button>
        </div>

        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {images.map((img, i) => (
              <button
                key={img.url}
                type="button"
                onClick={() => setCurrent(i)}
                className={cn(
                  "relative w-20 h-14 shrink-0 rounded-lg overflow-hidden border-2 transition-colors",
                  i === current ? "border-[var(--accent)]" : "border-transparent opacity-70 hover:opacity-100"
                )}
              >
                <Image
                  src={img.url}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="80px"
                  loading="lazy"
                  unoptimized
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {fullscreen && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center animate-fade-in">
          <button
            type="button"
            onClick={() => setFullscreen(false)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="relative w-full max-w-5xl aspect-[16/10] mx-4">
            <Image src={images[current].url} alt="" fill className="object-contain" unoptimized />
          </div>
        </div>
      )}
    </>
  );
}
