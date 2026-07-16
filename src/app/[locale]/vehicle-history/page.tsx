import { setRequestLocale } from "next-intl/server";
import { VehicleHistorySearchForm } from "@/components/vehicle-history/VehicleHistorySearchForm";
import { Link } from "@/i18n/navigation";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string; listingId?: string }>;
};

export default async function VehicleHistoryPage({ params, searchParams }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const sp = await searchParams;

  return (
    <div className="max-w-lg mx-auto px-4 py-6 md:py-10 pb-28">
      <p className="text-[13px] text-[var(--text-muted)] font-medium">HayPass</p>
      <h1 className="text-[28px] font-bold tracking-tight mt-1">Проверка истории авто</h1>
      <p className="text-[14px] text-[var(--text-secondary)] mt-2 leading-relaxed">
        VIN, госномер или номер кузова. Сейчас доступны расшифровка VIN и совпадения на HayMarket.
        Официальные ДТП / розыск / залоги подключаются по мере договоров с источниками в Армении.
      </p>

      <div className="mt-6">
        <VehicleHistorySearchForm defaultQuery={sp.q || ""} listingId={sp.listingId} />
      </div>

      <div className="mt-8 rounded-2xl border border-[var(--border)] p-4 space-y-2 text-[13px] text-[var(--text-muted)]">
        <p className="font-semibold text-[var(--text-secondary)]">Источники данных (архитектура)</p>
        <p>• VIN decoder — live</p>
        <p>• HayMarket internal — live</p>
        <p>• ГАИ / страховки / ТО / таможня — adapters planned</p>
        <Link href="/profile" className="inline-block pt-2 text-[var(--accent)] font-medium hover:underline">
          Мои отчёты появятся в профиле после входа
        </Link>
      </div>
    </div>
  );
}
