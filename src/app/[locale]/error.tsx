"use client";

import { useEffect } from "react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/Button";

export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[locale-error]", error);
  }, [error]);

  return (
    <div className="max-w-lg mx-auto px-4 py-16 text-center">
      <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Что-то пошло не так</h1>
      <p className="text-sm text-[var(--text-muted)] mb-6">
        Страница временно недоступна. Попробуйте ещё раз или вернитесь на главную.
      </p>
      <div className="flex flex-wrap gap-3 justify-center">
        <Button type="button" onClick={reset}>
          Повторить
        </Button>
        <Link
          href="/"
          className="inline-flex items-center px-4 py-2 rounded-xl border border-[var(--border)] text-sm font-semibold hover:bg-[var(--bg-hover)]"
        >
          На главную
        </Link>
      </div>
    </div>
  );
}
