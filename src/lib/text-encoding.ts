/** Detect classic UTF-8-as-Windows-1252/Latin-1 mojibake: "РђРІС‚Рѕ" for "Авто".
 * Must NOT match normal Cyrillic (к, о, а…) — those are U+0400–U+04FF too. */
function looksLikeUtf8Mojibake(text: string): boolean {
  // Typical mojibake runs: capital Cyrillic "Р"/"С" followed by another Cyrillic in the
  // U+0400–U+045F block forming multi-byte UTF-8 mis-decoded sequences.
  return /(?:Р[ђѓєѕіїјљњћќўџЀ-џ]|С[ђѓєѕіїјљњћќўџЀ-џ]){2,}/.test(text);
}

/**
 * Fix UTF-8 text that was stored/read as Latin-1 (РђРІС‚Рѕ → Авто).
 * Safe for normal Russian: returns unchanged when not mojibake.
 */
export function fixMojibake(text: string): string {
  if (!text || !looksLikeUtf8Mojibake(text)) return text;
  try {
    const bytes = Uint8Array.from([...text].map((c) => c.charCodeAt(0) & 0xff));
    const decoded = new TextDecoder("utf-8").decode(bytes);
    if (decoded && !looksLikeUtf8Mojibake(decoded)) return decoded;
  } catch {
    /* ignore */
  }
  return text;
}
