import { Card } from "@/components/ui/Card";
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
        <Card key={section.title} className="p-5 md:p-6">
          <h2 className="font-semibold text-base mb-1">{section.title}</h2>
          {subtitle && <p className="text-xs text-[var(--text-muted)] mb-4">{subtitle}</p>}
          {!subtitle && <div className="mb-4" />}
          <SpecRows rows={section.entries} />
        </Card>
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
    <Card className="p-5 md:p-6">
      <h2 className="font-semibold text-base mb-3">Описание</h2>
      <p className="text-[15px] leading-relaxed text-[var(--text-secondary)] whitespace-pre-wrap">
        {description}
      </p>
    </Card>
  );
}

export function VideoBlock({ url }: { url: string }) {
  return (
    <Card className="p-5 md:p-6">
      <h2 className="font-semibold text-base mb-3">Видео</h2>
      <video src={url} controls className="w-full rounded-2xl" preload="metadata" />
    </Card>
  );
}
