import { prisma } from "@/lib/prisma";

export type CarPriceInput = {
  brand: string;
  model: string;
  generation?: string | null;
  year: number;
  mileage?: number;
  transmission?: string;
  engineType?: string;
  engineVolume?: number | null;
  power?: number | null;
  driveType?: string | null;
  bodyType?: string | null;
  condition?: string;
  city?: string;
  listedPrice?: number;
};

export type PriceEstimateResult = {
  price: number;
  priceMin: number;
  priceMax: number;
  comparablesCount: number;
  source: "market" | "ai" | "hybrid" | "baseline";
  reasoning: string;
  verdict?: "good_deal" | "fair" | "above_market" | null;
};

type Comparable = {
  price: number;
  year: number;
  mileage: number;
  condition: string;
};

const BRAND_BASE_AMD: Record<string, number> = {
  Toyota: 9_500_000,
  Lexus: 14_000_000,
  BMW: 12_000_000,
  Mercedes: 13_000_000,
  "Mercedes-Benz": 13_000_000,
  Audi: 11_000_000,
  Hyundai: 6_500_000,
  Kia: 6_200_000,
  Nissan: 7_000_000,
  Honda: 8_500_000,
  Mazda: 7_500_000,
  Volkswagen: 8_000_000,
  Ford: 7_800_000,
  Chevrolet: 7_200_000,
  Mitsubishi: 6_800_000,
  Subaru: 8_200_000,
  Volvo: 10_500_000,
  Porsche: 22_000_000,
  Tesla: 18_000_000,
  Lada: 2_800_000,
  Renault: 5_500_000,
  Peugeot: 5_800_000,
  Opel: 5_200_000,
  Skoda: 6_000_000,
  Geely: 5_500_000,
  Chery: 5_000_000,
  Haval: 6_500_000,
};

function median(values: number[]): number {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 1 ? sorted[mid] : Math.round((sorted[mid - 1] + sorted[mid]) / 2);
}

function roundPrice(value: number) {
  return Math.round(value / 10_000) * 10_000;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

async function fetchComparables(input: CarPriceInput): Promise<Comparable[]> {
  const yearWindow = 3;

  const exact = await prisma.listing.findMany({
    where: {
      status: "ACTIVE",
      price: { gt: 0 },
      carDetails: {
        brand: input.brand,
        model: input.model,
        year: { gte: input.year - yearWindow, lte: input.year + yearWindow },
      },
    },
    select: {
      price: true,
      condition: true,
      carDetails: { select: { year: true, mileage: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 25,
  });

  let rows = exact;

  if (rows.length < 3) {
    rows = await prisma.listing.findMany({
      where: {
        status: "ACTIVE",
        price: { gt: 0 },
        carDetails: { brand: input.brand, model: input.model },
      },
      select: {
        price: true,
        condition: true,
        carDetails: { select: { year: true, mileage: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 25,
    });
  }

  if (rows.length < 3) {
    rows = await prisma.listing.findMany({
      where: {
        status: "ACTIVE",
        price: { gt: 0 },
        carDetails: { brand: input.brand },
      },
      select: {
        price: true,
        condition: true,
        carDetails: { select: { year: true, mileage: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 25,
    });
  }

  return rows
    .filter((r) => r.carDetails)
    .map((r) => ({
      price: r.price,
      year: r.carDetails!.year,
      mileage: r.carDetails!.mileage,
      condition: r.condition,
    }));
}

function adjustForVehicle(base: number, input: CarPriceInput, comps: Comparable[]): number {
  let price = base;
  const currentYear = new Date().getFullYear();
  const age = Math.max(0, currentYear - input.year);
  const mileage = input.mileage ?? age * 15_000;

  if (comps.length) {
    const medianYear = median(comps.map((c) => c.year));
    const yearDiff = input.year - medianYear;
    price *= 1 + yearDiff * 0.065;

    const medianMileage = median(comps.map((c) => c.mileage));
    const mileageDiff = mileage - medianMileage;
    price *= 1 - clamp(mileageDiff / 10_000, -0.12, 0.12) * 0.02;
  } else {
    const brandBase = BRAND_BASE_AMD[input.brand] ?? 6_000_000;
    const depreciation = Math.pow(0.92, age);
    price = brandBase * depreciation;
    if (mileage > 0) {
      price *= 1 - clamp((mileage - age * 15_000) / 10_000, -0.1, 0.15) * 0.015;
    }
  }

  if (input.condition === "new") price *= 1.12;
  if (input.engineType === "Электро") price *= 1.08;
  if (input.engineType === "Гибрид") price *= 1.05;
  if (input.driveType === "Полный") price *= 1.03;

  return price;
}

function buildRange(mid: number, comps: Comparable[]) {
  if (comps.length >= 3) {
    const prices = comps.map((c) => c.price).sort((a, b) => a - b);
    const spread = prices[prices.length - 1] - prices[0];
    const padding = Math.max(spread * 0.15, mid * 0.08);
    return {
      priceMin: roundPrice(clamp(mid - padding, mid * 0.75, mid * 0.95)),
      priceMax: roundPrice(clamp(mid + padding, mid * 1.05, mid * 1.35)),
    };
  }

  return {
    priceMin: roundPrice(mid * 0.88),
    priceMax: roundPrice(mid * 1.12),
  };
}

function verdictFromListed(listedPrice: number, estimate: number): PriceEstimateResult["verdict"] {
  const ratio = listedPrice / estimate;
  if (ratio <= 0.94) return "good_deal";
  if (ratio >= 1.08) return "above_market";
  return "fair";
}

async function refineWithOpenAI(
  input: CarPriceInput,
  market: { price: number; priceMin: number; priceMax: number; comparablesCount: number }
): Promise<{ price: number; priceMin: number; priceMax: number; reasoning: string } | null> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) return null;

  const prompt = `Ты эксперт по рынку подержанных авто в Армении (AMD).
Оцени рыночную цену. Ответь ТОЛЬКО JSON: {"price":number,"priceMin":number,"priceMax":number,"reasoning":"кратко на русском"}

Авто: ${input.brand} ${input.model}${input.generation ? ` ${input.generation}` : ""}, ${input.year} г.
Пробег: ${input.mileage ?? "не указан"} км
КПП: ${input.transmission ?? "—"}, двигатель: ${input.engineType ?? "—"}
Город: ${input.city ?? "Ереван"}, состояние: ${input.condition === "new" ? "новое" : "б/у"}
Статистика HayMarket: ${market.comparablesCount} похожих объявлений, медиана ~${market.price} AMD (${market.priceMin}–${market.priceMax})`;

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        temperature: 0.2,
        messages: [
          { role: "system", content: "Отвечай только валидным JSON без markdown." },
          { role: "user", content: prompt },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!res.ok) return null;
    const data = await res.json();
    const text = data.choices?.[0]?.message?.content;
    if (!text) return null;

    const parsed = JSON.parse(text) as {
      price?: number;
      priceMin?: number;
      priceMax?: number;
      reasoning?: string;
    };

    if (!parsed.price) return null;

    return {
      price: roundPrice(parsed.price),
      priceMin: roundPrice(parsed.priceMin ?? parsed.price * 0.9),
      priceMax: roundPrice(parsed.priceMax ?? parsed.price * 1.1),
      reasoning: parsed.reasoning?.slice(0, 300) ?? "Оценка на основе рынка Армении",
    };
  } catch {
    return null;
  }
}

export async function estimateCarPrice(input: CarPriceInput): Promise<PriceEstimateResult> {
  if (!input.brand?.trim() || !input.model?.trim() || !input.year) {
    throw new Error("Укажите марку, модель и год");
  }

  const comparables = await fetchComparables(input);
  const base = comparables.length ? median(comparables.map((c) => c.price)) : BRAND_BASE_AMD[input.brand] ?? 6_000_000;
  const adjusted = adjustForVehicle(base, input, comparables);
  const mid = roundPrice(adjusted);
  const range = buildRange(mid, comparables);

  let price = mid;
  let priceMin = range.priceMin;
  let priceMax = range.priceMax;
  let source: PriceEstimateResult["source"] = comparables.length ? "market" : "baseline";
  let reasoning =
    comparables.length >= 3
      ? `На основе ${comparables.length} похожих объявлений ${input.brand} ${input.model} на HayMarket`
      : comparables.length > 0
        ? `Мало объявлений (${comparables.length}), оценка с поправкой на год и пробег`
        : `Базовая оценка по марке ${input.brand} с учётом возраста и пробега`;

  const ai = await refineWithOpenAI(input, {
    price: mid,
    priceMin,
    priceMax,
    comparablesCount: comparables.length,
  });

  if (ai) {
    price = roundPrice(mid * 0.65 + ai.price * 0.35);
    priceMin = roundPrice(Math.min(priceMin, ai.priceMin));
    priceMax = roundPrice(Math.max(priceMax, ai.priceMax));
    reasoning = ai.reasoning;
    source = comparables.length ? "hybrid" : "ai";
  }

  const result: PriceEstimateResult = {
    price,
    priceMin,
    priceMax,
    comparablesCount: comparables.length,
    source,
    reasoning,
    verdict: input.listedPrice && input.listedPrice > 0 ? verdictFromListed(input.listedPrice, price) : null,
  };

  return result;
}

export async function estimateCarPriceForListing(listingId: string): Promise<PriceEstimateResult | null> {
  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    include: { carDetails: true },
  });

  if (!listing?.carDetails) return null;

  return estimateCarPrice({
    brand: listing.carDetails.brand,
    model: listing.carDetails.model,
    generation: listing.carDetails.generation,
    year: listing.carDetails.year,
    mileage: listing.carDetails.mileage,
    transmission: listing.carDetails.transmission,
    engineType: listing.carDetails.engineType,
    engineVolume: listing.carDetails.engineVolume,
    power: listing.carDetails.power,
    driveType: listing.carDetails.driveType,
    bodyType: listing.carDetails.bodyType,
    condition: listing.condition,
    city: listing.city,
    listedPrice: listing.price,
  });
}
