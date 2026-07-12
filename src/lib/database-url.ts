/** Нормализует DATABASE_URL для Supabase + Render (IPv4 pooler). */
export function getDatabaseUrl(): string | undefined {
  const raw = process.env.DATABASE_URL?.trim();
  if (!raw) return undefined;

  try {
    const url = new URL(raw);
    if (!url.searchParams.has("sslmode")) url.searchParams.set("sslmode", "require");
    if (!url.searchParams.has("connect_timeout")) url.searchParams.set("connect_timeout", "30");
    return url.toString();
  } catch {
    return raw;
  }
}

export function isDirectSupabaseHost(url: string): boolean {
  return /db\.[a-z0-9]+\.supabase\.co/i.test(url);
}

export function databaseUrlHint(): string {
  return [
    "Render не видит прямой хост db.*.supabase.co (только IPv6).",
    "Supabase → Connect → Session pooler → скопируйте URI.",
    "Формат: postgresql://postgres.qfrtdhkgmssbqdvqjxfe:ПАРОЛЬ@aws-0-РЕГИОН.pooler.supabase.com:5432/postgres",
    "Логин: postgres.qfrtdhkgmssbqdvqjxfe (не просто postgres).",
    "Если проект на паузе — Supabase Dashboard → Restore project.",
  ].join(" ");
}
