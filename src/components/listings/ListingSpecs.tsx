import { Card } from "@/components/ui/Card";
import { getAttributeDisplayEntries,
  formatAttributeValue,
  parseAttributes,
} from "@/lib/category-fields";
import { PROPERTY_TYPES } from "@/lib/utils";
import { formatNumber } from "@/lib/utils";
import type { CarDetails, RealEstateDetails } from "@prisma/client";

type SpecRow = { label: string; value: string };

function rows(entries: SpecRow[]) {
  return entries
    .filter((e) => e.value)
    .map((e) => (
      <div key={e.label} className="flex justify-between py-2.5 border-b border-[var(--border)] gap-4">
        <span className="text-[var(--text-muted)] shrink-0">{e.label}</span>
        <span className="font-medium text-right">{e.value}</span>
      </div>
    ));
}

export function ListingSpecs({
  categorySlug,
  condition,
  attributes,
  carDetails,
  realEstate,
}: {
  categorySlug: string;
  condition?: string;
  attributes?: string | null;
  carDetails?: CarDetails | null;
  realEstate?: RealEstateDetails | null;
}) {
  const sections: { title: string; entries: SpecRow[] }[] = [];

  const conditionLabel =
    condition === "new" ? "Новое" : condition === "refurbished" ? "Восстановленное" : "Б/у";

  if (carDetails) {
    sections.push({
      title: "Автомобиль",
      entries: [
        { label: "Марка", value: carDetails.brand },
        { label: "Модель", value: carDetails.model },
        { label: "Поколение", value: carDetails.generation ?? "" },
        { label: "Год", value: String(carDetails.year) },
        { label: "Пробег", value: `${formatNumber(carDetails.mileage)} км` },
        { label: "КПП", value: carDetails.transmission },
        { label: "Двигатель", value: carDetails.engineType },
        { label: "Объём", value: carDetails.engineVolume ? `${carDetails.engineVolume} л` : "" },
        { label: "Мощность", value: carDetails.power ? `${carDetails.power} л.с.` : "" },
        { label: "Привод", value: carDetails.driveType ?? "" },
        { label: "Кузов", value: carDetails.bodyType ?? "" },
        { label: "Цвет", value: carDetails.color ?? "" },
        { label: "Владельцев", value: carDetails.ownersCount ? String(carDetails.ownersCount) : "" },
        { label: "Состояние", value: conditionLabel },
        { label: "Растаможен", value: carDetails.customsCleared ? "Да" : "Нет" },
        { label: "Обмен", value: carDetails.exchangePossible ? "Возможен" : "" },
        { label: "Торг", value: carDetails.bargainingPossible ? "Возможен" : "" },
      ],
    });
  }

  if (realEstate) {
    const propertyLabel =
      PROPERTY_TYPES.find((t) => t.value === realEstate.propertyType)?.label ??
      realEstate.propertyType;

    sections.push({
      title: "Недвижимость",
      entries: [
        {
          label: "Сделка",
          value: formatAttributeValue("dealType", realEstate.dealType),
        },
        { label: "Тип", value: propertyLabel },
        { label: "Площадь", value: `${realEstate.area} м²` },
        { label: "Комнаты", value: realEstate.rooms ? String(realEstate.rooms) : "" },
        {
          label: "Этаж",
          value:
            realEstate.floor != null
              ? `${realEstate.floor}${realEstate.totalFloors ? ` / ${realEstate.totalFloors}` : ""}`
              : "",
        },
        {
          label: "Год постройки",
          value: realEstate.buildingYear ? String(realEstate.buildingYear) : "",
        },
        {
          label: "Ремонт",
          value: formatAttributeValue("renovationType", realEstate.renovationType ?? ""),
        },
        {
          label: "Отопление",
          value: formatAttributeValue("heating", realEstate.heating ?? ""),
        },
        {
          label: "Балкон",
          value: formatAttributeValue("balcony", realEstate.balcony ?? ""),
        },
        {
          label: "Санузлов",
          value: realEstate.bathrooms ? String(realEstate.bathrooms) : "",
        },
        { label: "Мебель", value: realEstate.furniture ? "Есть" : "" },
        { label: "Парковка", value: realEstate.parking ? "Есть" : "" },
      ],
    });
  }

  const attrs = parseAttributes(attributes);
  const attrEntries = getAttributeDisplayEntries(categorySlug, attrs);
  if (attrEntries.length) {
    const groupTitle =
      categorySlug === "electronics"
        ? "Электроника"
        : categorySlug === "jobs"
          ? "Вакансия"
          : categorySlug === "services"
            ? "Услуга"
            : "Характеристики";

    sections.push({
      title: groupTitle,
      entries: [
        { label: "Состояние", value: conditionLabel },
        ...attrEntries,
      ],
    });
  } else if (!carDetails && !realEstate) {
    sections.push({
      title: "Характеристики",
      entries: [{ label: "Состояние", value: conditionLabel }],
    });
  }

  if (!sections.length) return null;

  return (
    <>
      {sections.map((section) => (
        <Card key={section.title} className="p-5">
          <h2 className="font-semibold text-[15px] mb-4">{section.title}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-0 text-[14px]">
            {rows(section.entries)}
          </div>
        </Card>
      ))}
    </>
  );
}
