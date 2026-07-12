type AssistInput = {
  categorySlug?: string;
  categoryName?: string;
  city?: string;
  condition?: string;
  imageCount?: number;
  carBrand?: string;
  carModel?: string;
  carYear?: number;
  hint?: string;
};

const PRICE_HINTS: Record<string, { min: number; max: number }> = {
  cars: { min: 3_000_000, max: 25_000_000 },
  "real-estate": { min: 30_000_000, max: 150_000_000 },
  electronics: { min: 50_000, max: 1_500_000 },
  jobs: { min: 200_000, max: 1_500_000 },
  services: { min: 10_000, max: 200_000 },
  "home-furniture": { min: 20_000, max: 800_000 },
  clothing: { min: 5_000, max: 150_000 },
  kids: { min: 5_000, max: 200_000 },
  animals: { min: 10_000, max: 500_000 },
  other: { min: 10_000, max: 500_000 },
};

export async function assistListing(input: AssistInput) {
  const slug = input.categorySlug ?? "other";
  const range = PRICE_HINTS[slug] ?? PRICE_HINTS.other;
  const mid = Math.round((range.min + range.max) / 2);
  const city = input.city ?? "Ереван";
  const cond = input.condition === "new" ? "новое" : "б/у";

  let title = "";
  let description = "";

  if (slug === "cars" && input.carBrand) {
    title = `${input.carBrand} ${input.carModel ?? ""} ${input.carYear ?? ""}`.trim();
    description = `Продаётся ${cond} автомобиль ${title}. Город: ${city}. Состояние хорошее, все вопросы в чате. Возможен торг.`;
  } else if (slug === "real-estate") {
    title = `Недвижимость в ${city}`;
    description = `${cond === "новое" ? "Новая" : "Уютная"} недвижимость в ${city}. Удобное расположение. Звоните или пишите в чат HayMarket.`;
  } else if (slug === "electronics") {
    title = input.hint?.trim() || `Электроника в ${city}`;
    description = `${title}. ${cond}, полностью рабочее. Быстрая сделка через HayMarket.`;
  } else {
    const cat = input.categoryName ?? "Товар";
    title = input.hint?.trim() || `${cat} — ${city}`;
    description = `Продаётся ${cat.toLowerCase()} (${cond}) в ${city}. Актуальное объявление на HayMarket. Пишите в безопасный чат.`;
  }

  const price = mid;
  const priceMin = Math.round(range.min * 0.85);
  const priceMax = Math.round(range.max * 1.1);

  return {
    title: title.slice(0, 120),
    description: description.slice(0, 2000),
    price,
    priceMin,
    priceMax,
    categorySlug: slug,
    source: "ai" as const,
  };
}
