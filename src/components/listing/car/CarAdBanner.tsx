export function CarAdBanner() {
  const enabled = process.env.NEXT_PUBLIC_ADS_ENABLED === "true";
  if (!enabled) return null;

  return (
    <aside
      className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--bg-secondary)]/50 p-6 text-center"
      aria-hidden={!enabled}
    >
      <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider">Реклама</p>
      <p className="text-sm text-[var(--text-secondary)] mt-2">
        Место под промо-баннер (включается админом)
      </p>
    </aside>
  );
}
