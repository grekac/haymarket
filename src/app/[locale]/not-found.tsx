import Link from "next/link";

export default function NotFound() {
  return (
    <div className="max-w-lg mx-auto px-4 py-20 text-center">
      <span className="text-6xl mb-4 block">😕</span>
      <h1 className="text-2xl font-bold text-surface-900 mb-2">
        Страница не найдена
      </h1>
      <p className="text-surface-800/60 mb-6">
        Возможно, объявление было удалено или ссылка неверна.
      </p>
      <Link
        href="/"
        className="inline-flex bg-brand-500 hover:bg-brand-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
      >
        На главную
      </Link>
    </div>
  );
}
