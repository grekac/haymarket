import { Card } from "@/components/ui/Card";
import type { CarDetails } from "@prisma/client";
import type { CarListingExtras } from "@/lib/car-listing-extra";
import { formatNumber } from "@/lib/utils";

type Row = { label: string; value: string };

function SpecRows({ rows }: { rows: Row[] }) {
  const visible = rows.filter((r) => r.value);
  if (!visible.length) return null;
  return (
    <div className="divide-y divide-[var(--border)]">
      {visible.map((row) => (
        <div key={row.label} className="grid grid-cols-[minmax(0,42%)_1fr] gap-3 py-3 text-sm">
          <span className="text-[var(--text-muted)]">{row.label}</span>
          <span className="font-medium text-right">{row.value}</span>
        </div>
      ))}
    </div>
  );
}

export function CarSpecsTable({
  car,
  extras,
  conditionLabel,
}: {
  car: CarDetails;
  extras: CarListingExtras;
  conditionLabel: string;
}) {
  const rows: Row[] = [
    { label: "Год", value: String(car.year) },
    { label: "Поколение", value: car.generation ?? "" },
    { label: "Пробег", value: `${formatNumber(car.mileage)} км` },
    { label: "VIN", value: car.vin ?? "" },
    { label: "ПТС", value: extras.pts ?? "" },
    { label: "Владельцев", value: car.ownersCount ? String(car.ownersCount) : "" },
    { label: "Состояние", value: conditionLabel },
    { label: "Модификация", value: extras.modification ?? "" },
    { label: "Объём", value: car.engineVolume ? `${car.engineVolume} л` : "" },
    { label: "Мощность", value: car.power ? `${car.power} л.с.` : "" },
    { label: "Двигатель", value: car.engineType },
    { label: "Коробка", value: car.transmission },
    { label: "Привод", value: car.driveType ?? "" },
    { label: "Комплектация", value: extras.trim ?? "" },
    { label: "Кузов", value: car.bodyType ?? "" },
    { label: "Цвет", value: car.color ?? "" },
    { label: "Руль", value: extras.steeringWheel ?? "" },
    { label: "Таможня", value: car.customsCleared ? "Растаможен" : "Не растаможен" },
    { label: "Экокласс", value: extras.ecoClass ?? "" },
  ];

  return (
    <Card className="p-5 md:p-6">
      <h2 className="font-semibold text-base mb-1">Характеристики</h2>
      <p className="text-xs text-[var(--text-muted)] mb-4">Полные данные об автомобиле</p>
      <SpecRows rows={rows} />
    </Card>
  );
}
