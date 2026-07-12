"use client";

import { Palette } from "lucide-react";
import { useState } from "react";
import { useTheme } from "./ThemeProvider";
import { THEMES } from "@/lib/themes";

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="p-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-all"
        aria-label="Сменить фон"
      >
        <Palette className="w-4 h-4" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 z-50 bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl shadow-xl p-2 min-w-[180px]">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)] px-3 py-2">
              Тема оформления
            </p>
            {THEMES.map((t) => (
              <button
                key={t.id}
                onClick={() => { setTheme(t.id); setOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                  theme === t.id
                    ? "bg-[var(--bg-hover)] font-semibold text-[var(--text-primary)]"
                    : "text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]"
                }`}
              >
                <span
                  className="w-6 h-6 rounded-lg border-2 border-[var(--border)] shrink-0 shadow-sm"
                  style={{ backgroundColor: t.preview }}
                />
                {t.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
