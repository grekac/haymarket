import {
  Car, Building2, Smartphone, Briefcase, Wrench,
  Sofa, Shirt, Baby, PawPrint, LayoutGrid, LucideIcon,
  Truck, Cog, KeyRound, Bike, Ship, Bus, Sparkles, Hammer,
} from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = {
  Car, Building2, Smartphone, Briefcase, Wrench,
  Sofa, Shirt, Baby, PawPrint, LayoutGrid,
  Truck, Cog, KeyRound, Bike, Ship, Bus, Sparkles, Hammer,
};

export function CategoryIcon({ name, className }: { name: string; className?: string }) {
  const Icon = ICON_MAP[name] ?? LayoutGrid;
  return <Icon className={className} strokeWidth={2} />;
}

/** Градиенты — deep blue + emerald palette */
export const CATEGORY_GRADIENT: Record<string, string> = {
  cars: "from-[#1e40af] to-[#0a3d91]",
  "new-cars": "from-[#2563eb] to-[#1d4ed8]",
  "car-rental": "from-[#0ea5e9] to-[#0284c7]",
  "car-parts": "from-[#475569] to-[#334155]",
  trucks: "from-[#b45309] to-[#92400e]",
  "machinery-rental": "from-[#ca8a04] to-[#a16207]",
  motorcycles: "from-[#7c3aed] to-[#5b21b6]",
  "water-transport": "from-[#0891b2] to-[#0e7490]",
  buses: "from-[#059669] to-[#047857]",
  "real-estate": "from-[#059669] to-[#047857]",
  electronics: "from-[#3b82f6] to-[#1d4ed8]",
  jobs: "from-[#0a3d91] to-[#082f72]",
  services: "from-[#10b981] to-[#059669]",
  "home-furniture": "from-[#2563eb] to-[#1e40af]",
  clothing: "from-[#34d399] to-[#059669]",
  kids: "from-[#60a5fa] to-[#3b82f6]",
  animals: "from-[#059669] to-[#047857]",
  other: "from-[#64748b] to-[#475569]",
};

export const CATEGORY_SHADOW: Record<string, string> = {
  cars: "shadow-blue-900/20",
  "new-cars": "shadow-blue-600/20",
  "car-rental": "shadow-sky-600/20",
  "car-parts": "shadow-slate-600/20",
  trucks: "shadow-amber-800/20",
  "machinery-rental": "shadow-yellow-700/20",
  motorcycles: "shadow-violet-700/20",
  "water-transport": "shadow-cyan-700/20",
  buses: "shadow-emerald-600/20",
  "real-estate": "shadow-emerald-600/20",
  electronics: "shadow-blue-500/20",
  jobs: "shadow-blue-900/20",
  services: "shadow-emerald-500/20",
  "home-furniture": "shadow-blue-600/20",
  clothing: "shadow-emerald-400/20",
  kids: "shadow-blue-400/20",
  animals: "shadow-emerald-600/20",
  other: "shadow-slate-500/15",
};
