/** Координаты городов Армении */
export const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
  Ереван: { lat: 40.1776, lng: 44.5126 },
  Гюмри: { lat: 40.7894, lng: 43.8475 },
  Ванадзор: { lat: 40.8128, lng: 44.4883 },
  Абовян: { lat: 40.2739, lng: 44.6266 },
  Капан: { lat: 39.2077, lng: 46.4058 },
  Раздан: { lat: 40.5036, lng: 44.7739 },
  Армавир: { lat: 40.1545, lng: 44.0382 },
  Иджеван: { lat: 40.8796, lng: 45.147 },
  Горис: { lat: 39.5133, lng: 46.3397 },
  Аштарак: { lat: 40.2992, lng: 44.362 },
};

export function cityCoords(city: string) {
  return CITY_COORDS[city] ?? CITY_COORDS["Ереван"];
}

export function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
