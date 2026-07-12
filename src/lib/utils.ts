import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export const CITIES = [
  "Ереван", "Гюмри", "Ванадзор", "Абовян", "Капан",
  "Раздан", "Армавир", "Иджеван", "Горис", "Аштарак",
] as const;

export const CONDITIONS = [
  { value: "new", label: "Новое" },
  { value: "used", label: "Б/у" },
  { value: "refurbished", label: "Восстановленное" },
] as const;

export const TRANSMISSIONS = ["Автомат", "Механика", "Робот", "Вариатор"] as const;
export const ENGINE_TYPES = ["Бензин", "Дизель", "Гибрид", "Электро", "Газ"] as const;
export const DRIVE_TYPES = ["Передний", "Задний", "Полный"] as const;
export const BODY_TYPES = ["Седан", "Хэтчбек", "Универсал", "Кроссовер", "Внедорожник", "Купе", "Минивэн", "Пикап"] as const;
export const PROPERTY_TYPES = [
  { value: "APARTMENT", label: "Квартира" },
  { value: "HOUSE", label: "Дом" },
  { value: "COMMERCIAL", label: "Коммерческая" },
  { value: "LAND", label: "Участок" },
] as const;

export function formatPrice(price: number, currency = "AMD"): string {
  if (price === 0) return "Договорная";
  return new Intl.NumberFormat("hy-AM", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(price);
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "только что";
  if (diffMins < 60) return `${diffMins} мин. назад`;
  if (diffHours < 24) return `${diffHours} ч. назад`;
  if (diffDays < 7) return `${diffDays} дн. назад`;
  return d.toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat("ru-RU").format(n);
}

export function formatListingCount(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 19) return `${formatNumber(n)} объявлений`;
  if (mod10 === 1) return `${formatNumber(n)} объявление`;
  if (mod10 >= 2 && mod10 <= 4) return `${formatNumber(n)} объявления`;
  return `${formatNumber(n)} объявлений`;
}
