"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Search, SlidersHorizontal, Sparkles } from "lucide-react";
import { formatPrice } from "@/lib/utils";

type Suggestion = {
  id: string;
  title: string;
  price: number;
  city: string;
  imageUrl: string | null;
  category: { name: string };
};

const CITY_KEY = "haymarket_city";

export function HomeMobileSearch({
  defaultCity = "Ереван",
  searchInLabel = "Поиск в {city}",
}: {
  defaultCity?: string;
  searchInLabel?: string;
}) {
  const router = useRouter();
  const [city, setCity] = useState(defaultCity);
  const [q, setQ] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(CITY_KEY);
      if (saved) setCity(saved);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (q.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search/suggest?q=${encodeURIComponent(q.trim())}`);
        setSuggestions(await res.json());
        setShowSuggestions(true);
      } catch {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [q]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const placeholder = searchInLabel.replace("{city}", city);

  function submit(e: FormEvent) {
    e.preventDefault();
    setShowSuggestions(false);
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (city) params.set("city", city);
    router.push(`/search?${params.toString()}`);
  }

  return (
    <div ref={wrapperRef} className="relative w-full">
      <form onSubmit={submit}>
        <div className="flex items-center h-11 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)]/70 px-3 gap-2">
          <Search className="w-[18px] h-[18px] text-[var(--text-muted)] shrink-0" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            placeholder={placeholder}
            className="flex-1 min-w-0 bg-transparent outline-none text-[15px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
          />
          {loading && <Sparkles className="w-4 h-4 text-[var(--text-muted)] animate-pulse shrink-0" />}
          <button
            type="button"
            onClick={() => {
              const params = new URLSearchParams();
              if (city) params.set("city", city);
              router.push(`/search?${params.toString()}`);
            }}
            className="p-1.5 -mr-1 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]"
            aria-label="Фильтры"
          >
            <SlidersHorizontal className="w-[18px] h-[18px]" />
          </button>
        </div>
      </form>

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl shadow-xl z-50 overflow-hidden">
          {suggestions.map((s) => (
            <Link
              key={s.id}
              href={`/listing/${s.id}`}
              onClick={() => setShowSuggestions(false)}
              className="flex items-center gap-3 px-4 py-3 hover:bg-[var(--bg-hover)] transition-colors"
            >
              <div className="relative w-11 h-11 rounded-xl overflow-hidden bg-[var(--bg-secondary)] shrink-0">
                {s.imageUrl && (
                  <Image src={s.imageUrl} alt="" fill className="object-cover" sizes="44px" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{s.title}</p>
                <p className="text-xs text-[var(--text-muted)]">
                  {formatPrice(s.price)} · {s.city}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
