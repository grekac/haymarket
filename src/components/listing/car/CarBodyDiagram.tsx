"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { getBodyPartLabel } from "@/lib/car-listing-extra";
import { cn } from "@/lib/utils";

/** Вид сверху: каждая деталь — отдельный path */
const BODY_PARTS: { id: string; d: string; label: string }[] = [
  {
    id: "bumper_f",
    d: "M 38 12 L 82 12 Q 88 12 88 18 L 88 26 L 32 26 L 32 18 Q 32 12 38 12 Z",
    label: "Бампер передний",
  },
  {
    id: "hood",
    d: "M 34 28 L 86 28 L 86 58 L 34 58 Z",
    label: "Капот",
  },
  {
    id: "fender_fl",
    d: "M 18 30 L 32 30 L 32 56 L 18 56 Q 14 56 14 50 L 14 36 Q 14 30 18 30 Z",
    label: "Крыло переднее левое",
  },
  {
    id: "fender_fr",
    d: "M 88 30 L 102 30 Q 106 30 106 36 L 106 50 Q 106 56 102 56 L 88 56 Z",
    label: "Крыло переднее правое",
  },
  {
    id: "door_fl",
    d: "M 18 58 L 32 58 L 32 98 L 18 98 Q 14 98 14 92 L 14 64 Q 14 58 18 58 Z",
    label: "Дверь передняя левая",
  },
  {
    id: "door_fr",
    d: "M 88 58 L 102 58 Q 106 58 106 64 L 106 92 Q 106 98 102 98 L 88 98 Z",
    label: "Дверь передняя правая",
  },
  {
    id: "roof",
    d: "M 38 60 L 82 60 L 80 118 L 40 118 Z",
    label: "Крыша",
  },
  {
    id: "door_rl",
    d: "M 18 100 L 32 100 L 32 138 L 18 138 Q 14 138 14 132 L 14 106 Q 14 100 18 100 Z",
    label: "Дверь задняя левая",
  },
  {
    id: "door_rr",
    d: "M 88 100 L 102 100 Q 106 100 106 106 L 106 132 Q 106 138 102 138 L 88 138 Z",
    label: "Дверь задняя правая",
  },
  {
    id: "trunk",
    d: "M 36 120 L 84 120 L 86 152 L 34 152 Z",
    label: "Крышка багажника",
  },
  {
    id: "bumper_r",
    d: "M 34 154 L 86 154 L 88 160 Q 88 168 82 168 L 38 168 Q 32 168 32 160 Z",
    label: "Бампер задний",
  },
];

type PartState = "ok" | "painted" | "damaged";

function partState(id: string, painted: Set<string>, damaged: Set<string>): PartState {
  if (damaged.has(id)) return "damaged";
  if (painted.has(id)) return "painted";
  return "ok";
}

const STATE_STYLES: Record<PartState, { fill: string; stroke: string }> = {
  ok: {
    fill: "var(--bg-secondary)",
    stroke: "var(--border)",
  },
  painted: {
    fill: "rgb(251 191 36 / 0.45)",
    stroke: "rgb(245 158 11)",
  },
  damaged: {
    fill: "rgb(248 113 113 / 0.5)",
    stroke: "rgb(239 68 68)",
  },
};

export function CarBodyDiagram({
  paintedParts = [],
  damagedParts = [],
  compact,
}: {
  paintedParts?: string[];
  damagedParts?: string[];
  compact?: boolean;
}) {
  const painted = new Set(paintedParts);
  const damaged = new Set(damagedParts);
  const [hovered, setHovered] = useState<string | null>(null);

  const hasMarks = painted.size > 0 || damaged.size > 0;

  return (
    <div className={compact ? "" : "contents"}>
      {!compact && (
        <Card className="p-5 md:p-6">
          <DiagramInner
            painted={painted}
            damaged={damaged}
            hovered={hovered}
            setHovered={setHovered}
            hasMarks={hasMarks}
          />
        </Card>
      )}
      {compact && (
        <div>
          <h3 className="font-semibold text-sm mb-1">Схема кузова</h3>
          <p className="text-xs text-[var(--text-muted)] mb-3">
            Нажмите на деталь — увидите название. Красный — повреждение, жёлтый — окраска.
          </p>
          <DiagramInner
            painted={painted}
            damaged={damaged}
            hovered={hovered}
            setHovered={setHovered}
            hasMarks={hasMarks}
          />
        </div>
      )}
    </div>
  );
}

function DiagramInner({
  painted,
  damaged,
  hovered,
  setHovered,
  hasMarks,
}: {
  painted: Set<string>;
  damaged: Set<string>;
  hovered: string | null;
  setHovered: (id: string | null) => void;
  hasMarks: boolean;
}) {
  return (
    <>
      <div className="flex flex-wrap gap-3 mb-4 text-[11px] text-[var(--text-muted)]">
        <span className="inline-flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-[var(--bg-secondary)] border border-[var(--border)]" />
          Заводское
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-amber-400/60 border border-amber-500" />
          Окрашено
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-red-400/60 border border-red-500" />
          Повреждено
        </span>
      </div>

      <div className="relative mx-auto w-full max-w-[220px] p-6 rounded-2xl bg-gradient-to-b from-[var(--bg-secondary)] to-[var(--bg-card)] border border-[var(--border)]">
        {/* Сетка парковки */}
        <div
          className="absolute inset-4 rounded-xl opacity-[0.35]"
          style={{
            backgroundImage:
              "linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)",
            backgroundSize: "14px 14px",
          }}
        />
        <svg
          viewBox="0 0 120 180"
          className="relative w-full h-auto drop-shadow-md animate-scale-in"
          role="img"
          aria-label="Схема кузова автомобиля вид сверху"
        >
          <defs>
            <filter id="partShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodOpacity="0.15" />
            </filter>
            <linearGradient id="carBodyBase" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--bg-card)" />
              <stop offset="100%" stopColor="var(--bg-secondary)" />
            </linearGradient>
          </defs>
          <ellipse cx="60" cy="90" rx="48" ry="76" fill="url(#carBodyBase)" opacity="0.9" />
          {[
            [8, 42],
            [112, 42],
            [8, 128],
            [112, 128],
          ].map(([cx, cy], i) => (
            <ellipse key={i} cx={cx} cy={cy} rx={8} ry={12} fill="#1a1a1a" opacity={0.22} />
          ))}
          {BODY_PARTS.map((part, idx) => {
            const state = partState(part.id, painted, damaged);
            const styles = STATE_STYLES[state];
            const isHover = hovered === part.id;
            const isMarked = state !== "ok";
            return (
              <path
                key={part.id}
                d={part.d}
                fill={styles.fill}
                stroke={styles.stroke}
                strokeWidth={isHover ? 2.2 : 1.4}
                filter="url(#partShadow)"
                className={cn(
                  "transition-all duration-200 cursor-default",
                  isMarked && "animate-part-pop"
                )}
                style={{
                  animationDelay: `${idx * 0.04}s`,
                  transform: isHover ? "scale(1.02)" : undefined,
                  transformOrigin: "center",
                  filter: isHover ? "brightness(1.1)" : undefined,
                }}
                onMouseEnter={() => setHovered(part.id)}
                onMouseLeave={() => setHovered(null)}
              />
            );
          })}
          <path d="M 40 58 L 80 58 L 78 68 L 42 68 Z" fill="var(--accent)" opacity="0.18" stroke="var(--accent)" strokeOpacity="0.1" strokeWidth="0.5" />
          <path d="M 42 118 L 78 118 L 76 128 L 44 128 Z" fill="var(--accent)" opacity="0.14" stroke="var(--accent)" strokeOpacity="0.1" strokeWidth="0.5" />
          {/* Направление */}
          <text x="60" y="6" textAnchor="middle" fontSize="6" fill="var(--text-muted)" opacity="0.6">
            перед
          </text>
        </svg>

        {hovered && (
          <p className="text-center text-xs font-medium text-[var(--text-secondary)] mt-2 animate-fade-in">
            {getBodyPartLabel(hovered)}
            {damaged.has(hovered) && " — повреждение"}
            {!damaged.has(hovered) && painted.has(hovered) && " — окрашено"}
          </p>
        )}
      </div>

      {hasMarks ? (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {[...damaged].map((id) => (
            <span
              key={`d-${id}`}
              className="text-[11px] px-2 py-0.5 rounded-md bg-red-500/10 text-red-600 dark:text-red-400 font-medium"
            >
              {getBodyPartLabel(id)}
            </span>
          ))}
          {[...painted]
            .filter((id) => !damaged.has(id))
            .map((id) => (
              <span
                key={`p-${id}`}
                className="text-[11px] px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-300 font-medium"
              >
                {getBodyPartLabel(id)}
              </span>
            ))}
        </div>
      ) : (
        <p className="text-sm text-[var(--text-muted)] mt-3 text-center">
          Все элементы в заводском окрасе
        </p>
      )}
    </>
  );
}
