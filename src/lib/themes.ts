export const THEMES = [
  { id: "white", label: "Белый", preview: "#ffffff" },
  { id: "gray", label: "Серый", preview: "#f0f0f0" },
  { id: "warm", label: "Тёплый", preview: "#f5f3f0" },
  { id: "cool", label: "Холодный", preview: "#f0f4f8" },
] as const;

export type ThemeId = (typeof THEMES)[number]["id"];

export const THEME_STORAGE_KEY = "haymarket-theme";
