"use client";

import { useRouter } from "next/navigation";
import { Search, MapPin, Sparkles } from "lucide-react";
import { FormEvent, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";

type Suggestion = {
  id: string;
  title: string;
  price: number;
  city: string;
  imageUrl: string | null;
  category: { name: string };
};

export function PremiumSearchBar({ large, defaultValue = "" }: { large?: boolean; defaultValue?: string }) {
  const router = useRouter();
  const [q, setQ] = useState(defaultValue);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

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

  function submit(e: FormEvent) {
    e.preventDefault();
    setShowSuggestions(false);
    router.push(q.trim() ? `/search?q=${encodeURIComponent(q.trim())}` : "/search");
  }

  return (
    <div ref={wrapperRef} className="w-full relative">
      <form onSubmit={submit}>
        <div
          className={`relative flex items-center glass border border-[var(--border)] shadow-[var(--shadow-md)] transition-all duration-300 focus-within:shadow-[var(--shadow-float)] focus-within:border-[var(--brand)]/30 ${
            large ? "rounded-[22px] h-[52px] md:h-[56px]" : "rounded-[18px] h-[44px]"
          }`}
        >
          <Search className={`absolute left-4 text-[var(--text-muted)] ${large ? "w-5 h-5" : "w-4 h-4"}`} />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            placeholder="iPhone, Toyota, квартира..."
            className={`w-full bg-transparent outline-none text-[var(--text-primary)] placeholder:text-[var(--text-muted)] ${
              large ? "pl-12 pr-12 text-[17px]" : "pl-11 pr-10 text-[15px]"
            }`}
          />
          {loading && (
            <Sparkles className={`absolute text-[var(--text-muted)] animate-pulse ${large ? "right-12 w-4 h-4" : "right-10 w-3.5 h-3.5"}`} />
          )}
          {large && (
            <button
              type="button"
              onClick={() => router.push("/map")}
              className="absolute right-2 p-2 rounded-full hover:bg-[var(--bg-hover)] transition-colors duration-200"
              aria-label="Карта"
            >
              <MapPin className="w-5 h-5 text-[var(--brand)]" />
            </button>
          )}
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
                {s.imageUrl && <Image src={s.imageUrl} alt="" fill unoptimized className="object-cover" sizes="44px" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{s.title}</p>
                <p className="text-xs text-[var(--text-muted)]">{formatPrice(s.price)} · {s.city}</p>
              </div>
            </Link>
          ))}
          <button
            type="button"
            onClick={() => {
              setShowSuggestions(false);
              router.push(`/search?q=${encodeURIComponent(q.trim())}`);
            }}
            className="w-full text-center text-sm font-medium text-[var(--text-secondary)] py-3 border-t border-[var(--border)] hover:bg-[var(--bg-hover)]"
          >
            Все результаты →
          </button>
        </div>
      )}
    </div>
  );
}
