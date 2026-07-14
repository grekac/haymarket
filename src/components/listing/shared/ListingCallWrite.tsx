"use client";

import { useState } from "react";
import { Phone } from "lucide-react";
import { AskSellerButton } from "@/components/chat/AskSellerButton";

export function ListingCallWrite({
  listingId,
  phone,
}: {
  listingId: string;
  phone: string;
}) {
  const [showPhone, setShowPhone] = useState(false);

  return (
    <div className="grid grid-cols-2 gap-2.5">
      {showPhone ? (
        <a
          href={`tel:${phone.replace(/\s/g, "")}`}
          className="flex h-12 items-center justify-center gap-2 rounded-xl bg-[var(--accent)] text-[var(--accent-fg)] font-semibold text-sm active:scale-[0.98] transition-transform"
        >
          <Phone className="w-4 h-4" />
          {phone}
        </a>
      ) : (
        <button
          type="button"
          onClick={() => setShowPhone(true)}
          className="h-12 rounded-xl bg-[var(--accent)] text-[var(--accent-fg)] font-semibold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
        >
          <Phone className="w-4 h-4" />
          Позвонить
        </button>
      )}
      <AskSellerButton
        listingId={listingId}
        label="Написать"
        className="h-12 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] font-semibold text-sm hover:bg-[var(--bg-hover)] active:scale-[0.98] transition-all"
      />
    </div>
  );
}
