/** Человекочитаемые коды поколений для UI */
const VW_GOLF_ALIASES: Record<string, string> = {
  "TYPE 17": "Mk1",
  "TYPE 1G": "Mk2",
  "TYPE 1H": "Mk3",
  "TYPE 1J": "Mk4",
  "TYPE 1K": "Mk5",
  "TYPE 5K": "Mk6",
  "TYPE 5G": "Mk7",
  "TYPE 5H": "Mk8",
  FACELIFT: "Mk7 FL",
};

export function displayGenerationCode(
  code: string,
  brandSlug?: string,
  modelSlug?: string
): string {
  const c = code.split("/")[0].trim().toUpperCase();
  if (brandSlug === "volkswagen" && modelSlug === "golf" && VW_GOLF_ALIASES[c]) {
    return VW_GOLF_ALIASES[c];
  }
  return code.split("/")[0].trim();
}
