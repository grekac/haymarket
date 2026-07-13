import { Gauge, Calendar, Fuel, Cog } from "lucide-react";

const CHIP_ICONS = [Gauge, Calendar, Fuel, Cog] as const;

export function CarListingHeader({ title, chips }: { title: string; chips: string[] }) {
  return (
    <header className="space-y-4 animate-fade-up">
      <div className="relative">
        <div className="absolute -left-1 top-0 bottom-0 w-1 rounded-full bg-gradient-to-b from-[var(--accent)] to-[var(--accent)]/20" />
        <h1 className="text-xl md:text-[1.65rem] font-bold tracking-tight leading-snug text-[var(--text-primary)] pl-3">
          {title}
        </h1>
      </div>
      <div className="flex flex-wrap gap-2">
        {chips.map((chip, i) => {
          const Icon = CHIP_ICONS[i % CHIP_ICONS.length];
          return (
            <span
              key={chip}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--bg-secondary)] border border-[var(--border)]/80 text-xs font-medium text-[var(--text-secondary)] animate-scale-in premium-card-hover"
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <Icon className="w-3.5 h-3.5 text-[var(--accent)]" />
              {chip}
            </span>
          );
        })}
      </div>
    </header>
  );
}

export function CarDescriptionBlock({ description }: { description: string }) {
  return (
    <div className="p-5 md:p-6 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] premium-card-hover animate-fade-up animate-delay-3">
      <h2 className="font-semibold text-base mb-3">Описание</h2>
      <p className="text-[15px] leading-relaxed text-[var(--text-secondary)] whitespace-pre-wrap">
        {description}
      </p>
    </div>
  );
}
