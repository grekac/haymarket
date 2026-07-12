/** Common trim packages when DB has no separate trim entries */
const DEFAULT_TRIMS: Record<string, string[]> = {
  "C-Class": ["C180", "C200", "C220", "C250", "C300", "C350", "C43 AMG", "C63 AMG"],
  "E-Class": ["E200", "E220", "E250", "E300", "E350", "E400", "E43 AMG", "E63 AMG"],
  "S-Class": ["S350", "S400", "S450", "S500", "S560", "S600", "S63 AMG", "S65 AMG"],
  "A-Class": ["A160", "A180", "A200", "A220", "A250", "A35 AMG", "A45 AMG"],
  "GLC-Class": ["GLC200", "GLC220", "GLC250", "GLC300", "GLC43 AMG", "GLC63 AMG"],
  "GLE-Class": ["GLE300", "GLE350", "GLE400", "GLE450", "GLE53 AMG", "GLE63 AMG"],
  "Series 1": ["116i", "118i", "120i", "125i", "128i", "M135i", "M140i"],
  "Series 2": ["218i", "220i", "225i", "228i", "230i", "M240i"],
  "Series 3": ["318i", "320i", "325i", "330i", "335i", "340i", "M340i", "M3"],
  "Series 5": ["520i", "525i", "530i", "535i", "540i", "550i", "M550i", "M5"],
  "Series 7": ["730i", "735i", "740i", "750i", "760i", "M760i"],
  "Golf": ["1.0 TSI", "1.4 TSI", "1.5 TSI", "GTI", "GTD", "R", "e-Golf"],
  "Camry": ["2.0", "2.5", "3.5 V6", "Hybrid"],
  "Civic": ["1.5 Turbo", "2.0", "Type R", "Hybrid"],
  "Corolla": ["1.6", "1.8", "2.0", "Hybrid"],
  "A3": ["30 TFSI", "35 TFSI", "40 TFSI", "S3", "RS3"],
  "A4": ["35 TDI", "40 TDI", "45 TFSI", "S4", "RS4"],
  "A6": ["40 TDI", "45 TFSI", "50 TDI", "55 TFSI", "S6", "RS6"],
  "Q5": ["40 TDI", "45 TFSI", "50 TDI", "SQ5"],
  "X5": ["xDrive30d", "xDrive40i", "xDrive45e", "M50i", "X5 M"],
  "X3": ["xDrive20d", "xDrive30i", "M40i", "X3 M"],
};

export function getDefaultTrimsForModel(modelName: string): string[] {
  return DEFAULT_TRIMS[modelName] ?? [];
}
