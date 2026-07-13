export const COMPARE_KEY = "haymarket_compare";
export const MAX_COMPARE = 4;

export type CompareItem = {
  id: string;
  title: string;
  price: number;
  currency: string;
  image?: string;
  category?: string;
};

export function getCompareList(): CompareItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(COMPARE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveCompareList(items: CompareItem[]) {
  localStorage.setItem(COMPARE_KEY, JSON.stringify(items.slice(0, MAX_COMPARE)));
  window.dispatchEvent(new Event("haymarket:compare"));
}

export function addToCompare(item: CompareItem): { ok: boolean; message?: string } {
  const list = getCompareList();
  if (list.some((x) => x.id === item.id)) {
    return { ok: false, message: "Уже в сравнении" };
  }
  if (list.length >= MAX_COMPARE) {
    return { ok: false, message: `Максимум ${MAX_COMPARE} объявления` };
  }
  saveCompareList([...list, item]);
  return { ok: true };
}

export function removeFromCompare(id: string) {
  saveCompareList(getCompareList().filter((x) => x.id !== id));
}

export function clearCompare() {
  localStorage.removeItem(COMPARE_KEY);
  window.dispatchEvent(new Event("haymarket:compare"));
}
