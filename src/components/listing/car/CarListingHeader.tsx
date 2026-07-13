import { Card } from "@/components/ui/Card";
import { buildCarSubtitleChips } from "@/lib/car-listing-extra";

export function CarListingHeader({ title, chips }: { title: string; chips: string[] }) {
  return (
    <header className="space-y-3 animate-fade-up">
      <h1 className="text-xl md:text-2xl font-bold tracking-tight leading-snug text-[var(--text-primary)]">
        {title}
      </h1>
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
    </header>
  );
}

export function CarDescriptionBlock({ description }: { description: string }) {
  return (
    <Card className="p-5 md:p-6">
      <h2 className="font-semibold text-base mb-3">Описание</h2>
      <p className="text-[15px] leading-relaxed text-[var(--text-secondary)] whitespace-pre-wrap">
        {description}
      </p>
    </Card>
  );
}
