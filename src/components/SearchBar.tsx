"use client";

import { useRouter } from "next/navigation";
import { Search, Sparkles } from "lucide-react";
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

export function SearchBar({ defaultValue = "", large = false }: { defaultValue?: string; large?: boolean }) {
  const router = useRouter();
  const [query, setQuery] = useState(defaultValue);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search/suggest?q=${encodeURIComponent(query.trim())}`);
        setSuggestions(await res.json());
        setShowSuggestions(true);
      } catch {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setShowSuggestions(false);
    router.push(query.trim() ? `/search?q=${encodeURIComponent(query.trim())}` : "/search");
  }

  return (
    <div ref={wrapperRef} className="w-full relative">
      <form onSubmit={handleSubmit} className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[var(--text-muted)]" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => { setFocused(true); suggestions.length > 0 && setShowSuggestions(true); }}
          onBlur={() => setFocused(false)}
          placeholder="iPhone, квартира, Toyota..."
          className={`w-full pl-11 pr-4 bg-[var(--bg-card)] border text-[var(--text-primary)] rounded-2xl transition-all duration-300 ${
            large ? "py-4 text-base" : "py-2.5 text-sm"
          } ${
            focused || large
              ? "border-[var(--accent-soft)] shadow-xl"
              : "border-[var(--border)] shadow-md"
          } focus:outline-none`}
        />
        {loading && (
          <Sparkles className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] animate-pulse" />
        )}
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
                <p className="text-sm font-medium text-[var(--text-primary)] truncate">{s.title}</p>
                <p className="text-xs text-[var(--text-muted)]">
                  {formatPrice(s.price)} · {s.city}
                </p>
              </div>
            </Link>
          ))}
          <button
            onClick={() => {
              setShowSuggestions(false);
              router.push(`/search?q=${encodeURIComponent(query.trim())}`);
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
