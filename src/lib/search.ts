const SYNONYMS: Record<string, string[]> = {
  айфон: ["iphone", "телефон", "смартфон", "apple"],
  iphone: ["айфон", "телефон", "смартфон", "apple"],
  телефон: ["айфон", "iphone", "смартфон", "samsung", "xiaomi"],
  смартфон: ["айфон", "iphone", "телефон"],
  машина: ["авто", "автомобиль", "машину", "car", "toyota", "hyundai"],
  авто: ["машина", "автомобиль", "car", "транспорт"],
  автомобиль: ["машина", "авто", "car"],
  квартира: ["недвижимость", "дом", "студия", "жильё", "жилье"],
  дом: ["недвижимость", "квартира", "дача"],
  ноутбук: ["laptop", "macbook", "компьютер", "пк"],
  macbook: ["ноутбук", "laptop", "apple", "компьютер"],
  компьютер: ["ноутбук", "macbook", "пк", "pc"],
  велосипед: ["велик", "bike", "mtb", "горный"],
  собака: ["щенок", "пёс", "пес", "животное"],
  кошка: ["кот", "котёнок", "котенок", "животное"],
  работа: ["вакансия", "job", "менеджер", "зарплата"],
  диван: ["мебель", "софа", "кресло"],
  куртка: ["одежда", "пальто", "куртку", "jacket"],
};

export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/ё/g, "е")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function tokenize(text: string): string[] {
  return normalizeText(text)
    .split(" ")
    .filter((t) => t.length > 1);
}

export function expandQuery(query: string): string[] {
  const tokens = tokenize(query);
  const expanded = new Set(tokens);

  for (const token of tokens) {
    const syns = SYNONYMS[token];
    if (syns) syns.forEach((s) => expanded.add(normalizeText(s)));
  }

  return Array.from(expanded);
}

function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;

  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      const cost = b[i - 1] === a[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }

  return matrix[b.length][a.length];
}

function wordSimilarity(a: string, b: string): number {
  if (a === b) return 1;
  if (a.includes(b) || b.includes(a)) return 0.85;

  const maxLen = Math.max(a.length, b.length);
  if (maxLen < 3) return 0;

  const dist = levenshtein(a, b);
  const threshold = a.length <= 5 ? 1 : a.length <= 8 ? 2 : 3;

  if (dist <= threshold) {
    return 1 - dist / maxLen;
  }

  return 0;
}

export function scoreListing(
  query: string,
  listing: {
    title: string;
    description: string;
    category?: { name: string };
  }
): number {
  const q = normalizeText(query);
  if (!q) return 0;

  const title = normalizeText(listing.title);
  const description = normalizeText(listing.description);
  const category = listing.category ? normalizeText(listing.category.name) : "";
  const queryTokens = expandQuery(query);
  const titleTokens = tokenize(listing.title);

  let score = 0;

  if (title === q) score += 100;
  if (title.includes(q)) score += 80;
  if (description.includes(q)) score += 30;
  if (category.includes(q)) score += 25;

  for (const qt of queryTokens) {
    if (title.includes(qt)) score += 40;
    if (description.includes(qt)) score += 12;
    if (category.includes(qt)) score += 15;

    for (const tt of titleTokens) {
      const sim = wordSimilarity(qt, tt);
      if (sim > 0.6) score += sim * 35;
    }
  }

  const qWords = q.split(" ");
  const matchedWords = qWords.filter(
    (w) => title.includes(w) || description.includes(w) || category.includes(w)
  );
  score += (matchedWords.length / qWords.length) * 20;

  return score;
}

export function smartSearch<T extends { title: string; description: string; category?: { name: string } }>(
  query: string,
  listings: T[],
  minScore = 8
): T[] {
  if (!query.trim()) return listings;

  return listings
    .map((listing) => ({
      listing,
      score: scoreListing(query, listing),
    }))
    .filter(({ score }) => score >= minScore)
    .sort((a, b) => b.score - a.score)
    .map(({ listing }) => listing);
}
