import { createHash } from "crypto";

export type VehicleQueryType = "VIN" | "PLATE" | "CHASSIS";

export type SectionStatus = "verified" | "partial" | "unavailable" | "demo";

export type ReportSection = {
  id: string;
  title: string;
  status: SectionStatus;
  source: string;
  summary?: string;
  items: Array<{ label: string; value: string }>;
};

export type HistoryPayload = {
  query: { type: VehicleQueryType; value: string; normalized: string };
  vehicle: {
    make?: string;
    model?: string;
    year?: number;
    body?: string;
    wmi?: string;
  };
  sections: ReportSection[];
  disclaimers: string[];
  generatedAt: string;
};

export function detectQueryType(raw: string): VehicleQueryType {
  const v = raw.trim().toUpperCase().replace(/\s+/g, "");
  if (/^[A-HJ-NPR-Z0-9]{17}$/.test(v)) return "VIN";
  // Armenian plates vary; treat medium alnum as plate, long chassis-like as chassis
  if (v.length >= 8 && v.length <= 12 && /[A-Z]/.test(v) && /\d/.test(v)) return "PLATE";
  if (v.length >= 6) return "CHASSIS";
  return "PLATE";
}

export function normalizeQuery(raw: string, type?: VehicleQueryType): {
  type: VehicleQueryType;
  normalized: string;
  fingerprint: string;
} {
  const cleaned = raw.trim().toUpperCase().replace(/[\s\-._]/g, "");
  const t = type ?? detectQueryType(cleaned);
  const fingerprint = createHash("sha256").update(`${t}:${cleaned}`).digest("hex");
  return { type: t, normalized: cleaned, fingerprint };
}

/** Minimal WMI map for demo VIN decode (not a full Autocheck DB). */
const WMI: Record<string, { make: string; country: string }> = {
  WBA: { make: "BMW", country: "DE" },
  WBS: { make: "BMW M", country: "DE" },
  WDD: { make: "Mercedes-Benz", country: "DE" },
  WVW: { make: "Volkswagen", country: "DE" },
  TMB: { make: "Škoda", country: "CZ" },
  VF1: { make: "Renault", country: "FR" },
  VF3: { make: "Peugeot", country: "FR" },
  JTD: { make: "Toyota", country: "JP" },
  JT2: { make: "Toyota", country: "JP" },
  JHM: { make: "Honda", country: "JP" },
  KMH: { make: "Hyundai", country: "KR" },
  KNA: { make: "Kia", country: "KR" },
  XTA: { make: "Lada", country: "RU" },
  XW8: { make: "Volkswagen", country: "RU" },
  Z8T: { make: "Toyota", country: "RU" },
};

export function decodeVinBasic(vin: string): HistoryPayload["vehicle"] {
  const v = vin.toUpperCase();
  if (v.length !== 17) return {};
  const wmi = v.slice(0, 3);
  const meta = WMI[wmi];
  // Model year character (pos 10) — simplified ISO mapping for common years
  const yearChar = v[9];
  const yearMap: Record<string, number> = {
    A: 2010, B: 2011, C: 2012, D: 2013, E: 2014, F: 2015, G: 2016, H: 2017,
    J: 2018, K: 2019, L: 2020, M: 2021, N: 2022, P: 2023, R: 2024, S: 2025,
    T: 2026, V: 2027, W: 2028, X: 2029, Y: 2030,
    "1": 2001, "2": 2002, "3": 2003, "4": 2004, "5": 2005, "6": 2006, "7": 2007, "8": 2008, "9": 2009,
  };
  return {
    make: meta?.make,
    year: yearMap[yearChar],
    wmi,
    body: v.slice(3, 8),
  };
}
