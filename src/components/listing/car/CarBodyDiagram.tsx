import { Card } from "@/components/ui/Card";
import { getBodyPartLabel } from "@/lib/car-listing-extra";
import { cn } from "@/lib/utils";

const PARTS = [
  { id: "hood", x: 50, y: 18, w: 28, h: 14 },
  { id: "roof", x: 50, y: 38, w: 22, h: 22 },
  { id: "trunk", x: 50, y: 72, w: 26, h: 14 },
  { id: "door_fl", x: 32, y: 42, w: 10, h: 18 },
  { id: "door_fr", x: 68, y: 42, w: 10, h: 18 },
  { id: "door_rl", x: 32, y: 58, w: 10, h: 16 },
  { id: "door_rr", x: 68, y: 58, w: 10, h: 16 },
  { id: "fender_fl", x: 22, y: 28, w: 12, h: 10 },
  { id: "fender_fr", x: 78, y: 28, w: 12, h: 10 },
  { id: "bumper_f", x: 50, y: 8, w: 32, h: 8 },
  { id: "bumper_r", x: 50, y: 88, w: 32, h: 8 },
] as const;

export function CarBodyDiagram({ paintedParts = [] }: { paintedParts?: string[] }) {
  const painted = new Set(paintedParts);

  return (
    <Card className="p-5 md:p-6">
      <h2 className="font-semibold text-base mb-1">Состояние кузова</h2>
      <p className="text-xs text-[var(--text-muted)] mb-4">
        Окрашенные элементы отмечены оранжевым
      </p>

      <div className="relative mx-auto w-full max-w-[280px] aspect-[3/5]">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <ellipse cx="50" cy="50" rx="34" ry="46" fill="var(--bg-secondary)" stroke="var(--border)" strokeWidth="1" />
          {PARTS.map((part) => (
            <rect
              key={part.id}
              x={part.x - part.w / 2}
              y={part.y - part.h / 2}
              width={part.w}
              height={part.h}
              rx={2}
              className={cn(
                "transition-colors duration-200",
                painted.has(part.id) ? "fill-amber-400/70 stroke-amber-500" : "fill-transparent stroke-[var(--border)]"
              )}
              strokeWidth={painted.has(part.id) ? 1.5 : 0.8}
            />
          ))}
        </svg>
      </div>

      {painted.size > 0 ? (
        <ul className="mt-4 flex flex-wrap gap-2">
          {[...painted].map((id) => (
            <li
              key={id}
              className="text-xs px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300"
            >
              {getBodyPartLabel(id)}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-[var(--text-muted)] mt-3">Данные об окраске не указаны</p>
      )}
    </Card>
  );
}
