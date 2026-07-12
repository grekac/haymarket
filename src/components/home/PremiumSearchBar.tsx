"use client";

import { useRouter } from "next/navigation";
import { Search, MapPin } from "lucide-react";
import { FormEvent, useState } from "react";

export function PremiumSearchBar({ large }: { large?: boolean }) {
  const router = useRouter();
  const [q, setQ] = useState("");

  function submit(e: FormEvent) {
    e.preventDefault();
    router.push(q.trim() ? `/search?q=${encodeURIComponent(q.trim())}` : "/search");
  }

  return (
    <form onSubmit={submit} className="w-full">
      <div
        className={`relative flex items-center glass border border-[var(--border)] shadow-[var(--shadow-md)] transition-all duration-300 focus-within:shadow-[var(--shadow-float)] focus-within:border-[var(--brand)]/30 ${
          large ? "rounded-[22px] h-[52px] md:h-[56px]" : "rounded-[18px] h-[44px]"
        }`}
      >
        <Search className={`absolute left-4 text-[var(--text-muted)] ${large ? "w-5 h-5" : "w-4 h-4"}`} />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="iPhone, Toyota, квартира..."
          className={`w-full bg-transparent outline-none text-[var(--text-primary)] placeholder:text-[var(--text-muted)] ${
            large ? "pl-12 pr-4 text-[17px]" : "pl-11 pr-4 text-[15px]"
          }`}
        />
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
  );
}
