"use client";

import { useState } from "react";

const COLLAPSED_CHARS = 220;

export function ListingDescriptionClamp({ description }: { description: string }) {
  const [expanded, setExpanded] = useState(false);
  const text = description.trim();
  const needsClamp = text.length > COLLAPSED_CHARS;
  const shown =
    !needsClamp || expanded ? text : `${text.slice(0, COLLAPSED_CHARS).trimEnd()}…`;

  if (!text) return null;

  return (
    <section className="space-y-2">
      <h2 className="font-semibold text-base">Описание</h2>
      <p className="text-[15px] leading-relaxed text-[var(--text-secondary)] whitespace-pre-wrap">
        {shown}
      </p>
      {needsClamp && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="text-sm font-semibold text-[var(--accent)] hover:underline"
        >
          {expanded ? "Свернуть" : "Читать полностью"}
        </button>
      )}
    </section>
  );
}
