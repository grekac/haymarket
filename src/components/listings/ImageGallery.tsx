"use client";

import { useState } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function ImageGallery({ images, fullBleed }: { images: { url: string }[]; fullBleed?: boolean }) {
  const [current, setCurrent] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);

  if (!images.length) {
    return (
      <div className={cn(
        "aspect-[4/5] bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--text-muted)]",
        fullBleed ? "rounded-none md:rounded-[24px]" : "rounded-[24px]"
      )}>
        Нет фото
      </div>
    );
  }

  const prev = () => setCurrent((c) => (c === 0 ? images.length - 1 : c - 1));
  const next = () => setCurrent((c) => (c === images.length - 1 ? 0 : c + 1));

  return (
    <>
      <div className={cn(
        "relative aspect-[4/5] md:aspect-[16/10] overflow-hidden bg-[var(--bg-secondary)] group",
        fullBleed ? "rounded-none md:rounded-[24px]" : "rounded-[24px]"
      )}>
        <Image
          src={images[current].url}
          alt=""
          fill
          className="object-cover cursor-pointer"
          onClick={() => setFullscreen(true)}
          sizes="100vw"
          quality={95}
          priority
          unoptimized
        />
        {images.length > 1 && (
          <>
            <button onClick={prev} className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full glass text-[var(--text-primary)] flex items-center justify-center md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button onClick={next} className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full glass text-[var(--text-primary)] flex items-center justify-center md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200">
              <ChevronRight className="w-5 h-5" />
            </button>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-300",
                    i === current ? "bg-white w-5" : "bg-white/50 w-1.5"
                  )}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {fullscreen && (
        <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center" onClick={() => setFullscreen(false)}>
          <button className="absolute top-4 right-4 text-white z-10 p-2" onClick={() => setFullscreen(false)}>
            <X className="w-7 h-7" />
          </button>
          <Image src={images[current].url} alt="" fill className="object-contain p-4" sizes="100vw" quality={100} unoptimized />
          {images.length > 1 && (
            <>
              <button onClick={(e) => { e.stopPropagation(); prev(); }} className="absolute left-4 text-white"><ChevronLeft className="w-10 h-10" /></button>
              <button onClick={(e) => { e.stopPropagation(); next(); }} className="absolute right-4 text-white"><ChevronRight className="w-10 h-10" /></button>
            </>
          )}
        </div>
      )}
    </>
  );
}
