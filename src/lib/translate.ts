export type Lang = "ru" | "hy" | "en";

const HY_CHARS = /[\u0530-\u058F]/;
const CYRILLIC = /[\u0400-\u04FF]/;

export function detectLang(text: string): Lang {
  if (HY_CHARS.test(text)) return "hy";
  if (CYRILLIC.test(text)) return "ru";
  return "en";
}

/** Перевод через MyMemory (бесплатно, без ключа) */
export async function translateText(text: string, to: Lang, from?: Lang): Promise<string> {
  const src = from ?? detectLang(text);
  if (src === to) return text;

  const langPair = `${src}|${to}`;
  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${langPair}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return text;
    const data = await res.json();
    return data.responseData?.translatedText ?? text;
  } catch {
    return text;
  }
}

export const LANG_LABELS: Record<Lang, string> = {
  ru: "Русский",
  hy: "Հայերեն",
  en: "English",
};
