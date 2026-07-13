/** UTF-8 text that was stored/read as Latin-1 (РђРІС‚Рѕ → Авто) */
export function fixMojibake(text: string): string {
  if (!text || !/[РЂ-Сџ]/.test(text)) return text;
  try {
    const bytes = Uint8Array.from([...text].map((c) => c.charCodeAt(0) & 0xff));
    const decoded = new TextDecoder("utf-8").decode(bytes);
    if (decoded && !/[РЂ-Сџ]{3,}/.test(decoded)) return decoded;
  } catch {
    /* ignore */
  }
  return text;
}
