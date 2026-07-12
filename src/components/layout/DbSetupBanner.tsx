import Link from "next/link";

/** Баннер, если база подключена, но таблицы ещё не созданы */
export function DbSetupBanner() {
  return (
    <div className="bg-amber-500/15 border-b border-amber-500/30 px-4 py-3 text-center text-sm">
      <p className="text-amber-900 dark:text-amber-100">
        База подключена, но таблицы ещё не созданы.{" "}
        <Link href="/api/health" className="underline font-medium">
          Проверить статус
        </Link>
        {" "}· Render Shell:{" "}
        <code className="text-xs bg-black/10 px-1 rounded">npx prisma db push</code>
        {" "}затем{" "}
        <code className="text-xs bg-black/10 px-1 rounded">npm run db:seed</code>
      </p>
    </div>
  );
}
