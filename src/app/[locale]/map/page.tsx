import { MapView } from "@/components/map/MapView";

export default function MapPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-6 md:py-10">
      <h1 className="text-2xl font-semibold mb-2">Карта объявлений</h1>
      <p className="text-sm text-[var(--text-muted)] mb-6">Объявления рядом с вами в Армении</p>
      <MapView />
    </div>
  );
}
