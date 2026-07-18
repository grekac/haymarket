import { Link } from "@/i18n/navigation";

export default function NotFound() {
  return (
    <div className="max-w-lg mx-auto px-4 py-20 text-center">
      <p className="text-6xl mb-4" aria-hidden>
        😕
      </p>
      <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Страница не найдена</h1>
      <p className="text-[var(--text-muted)] mb-6">
        Возможно, объявление было удалено или ссылка неверна.
      </p>
      <Link
        href="/"
        className="inline-flex bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--accent-fg)] font-semibold px-6 py-3 rounded-xl transition-colors"
      >
        На главную
      </Link>
    </div>
  );
}
