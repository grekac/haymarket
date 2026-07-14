import type { SpecSection } from "@/lib/listing-specs-builder";

function SpecRows({ rows }: { rows: { label: string; value: string }[] }) {
  const visible = rows.filter((r) => r.value);
  if (!visible.length) return null;
  return (
    <div className="divide-y divide-[var(--border)]">
      {visible.map((row) => (
        <div key={row.label} className="grid grid-cols-[minmax(0,42%)_1fr] gap-3 py-3 text-sm">
          <span className="text-[var(--text-muted)]">{row.label}</span>
          <span className="font-medium text-right">{row.value}</span>
        </div>
      ))}
    </div>
  );
}

export function PremiumSpecsTable({
  sections,
  subtitle,
}: {
  sections: SpecSection[];
  subtitle?: string;
}) {
  const nonEmpty = sections.filter((s) => s.entries.some((e) => e.value));
  if (!nonEmpty.length) return null;

  return (
    <>
      {nonEmpty.map((section) => (
        <section key={section.title} className="space-y-2">
          <h2 className="font-semibold text-base">{section.title}</h2>
          {subtitle && <p className="text-xs text-[var(--text-muted)]">{subtitle}</p>}
          <SpecRows rows={section.entries} />
        </section>
      ))}
    </>
  );
}

export function ListingHeader({ title, chips }: { title: string; chips: string[] }) {
  return (
    <header className="space-y-3 animate-fade-up">
      <h1 className="text-xl md:text-2xl font-bold tracking-tight leading-snug text-[var(--text-primary)]">
        {title}
      </h1>
      {chips.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {chips.map((chip) => (
            <span
              key={chip}
              className="px-3 py-1.5 rounded-full bg-[var(--bg-secondary)] text-xs font-medium text-[var(--text-secondary)]"
            >
              {chip}
            </span>
          ))}
        </div>
      )}
    </header>
  );
}

export function DescriptionBlock({ description }: { description: string }) {
  return (
    <section className="space-y-2">
      <h2 className="font-semibold text-base">Описание</h2>
      <p className="text-[15px] leading-relaxed text-[var(--text-secondary)] whitespace-pre-wrap">
        {description}
      </p>
    </section>
  );
}

export function VideoBlock({ url }: { url: string }) {
  return (
    <section className="space-y-2">
      <h2 className="font-semibold text-base">Видео</h2>
      <video src={url} controls className="w-full rounded-xl" preload="metadata" />
    </section>
  );
}
