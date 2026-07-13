/** Декоративная иллюстрация автомобиля для пустых состояний и фона */
export function CarSilhouetteIllustration({
  className,
  variant = "side",
}: {
  className?: string;
  variant?: "side" | "top";
}) {
  if (variant === "top") {
    return (
      <svg
        viewBox="0 0 200 320"
        className={className}
        fill="none"
        aria-hidden
      >
        <defs>
          <linearGradient id="carTopGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.15" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.03" />
          </linearGradient>
        </defs>
        <ellipse cx="100" cy="160" rx="78" ry="130" fill="url(#carTopGrad)" />
        <path
          d="M70 40 L130 40 L128 280 L72 280 Z"
          stroke="var(--accent)"
          strokeOpacity="0.2"
          strokeWidth="1.5"
          fill="var(--bg-secondary)"
          fillOpacity="0.5"
        />
        <ellipse cx="42" cy="90" rx="14" ry="22" fill="var(--text-muted)" fillOpacity="0.15" />
        <ellipse cx="158" cy="90" rx="14" ry="22" fill="var(--text-muted)" fillOpacity="0.15" />
        <ellipse cx="42" cy="230" rx="14" ry="22" fill="var(--text-muted)" fillOpacity="0.15" />
        <ellipse cx="158" cy="230" rx="14" ry="22" fill="var(--text-muted)" fillOpacity="0.15" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 320 120"
      className={className}
      fill="none"
      aria-hidden
    >
      <defs>
        <linearGradient id="carSideGrad" x1="0%" y1="50%" x2="100%" y2="50%">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.08" />
          <stop offset="50%" stopColor="var(--accent)" stopOpacity="0.18" />
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.08" />
        </linearGradient>
        <linearGradient id="carGlass" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.25" />
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.05" />
        </linearGradient>
      </defs>
      {/* Тень */}
      <ellipse cx="160" cy="108" rx="120" ry="8" fill="var(--text-muted)" fillOpacity="0.08" />
      {/* Кузов */}
      <path
        d="M40 72 Q40 58 58 52 L95 48 Q115 44 135 48 L210 52 Q240 54 252 68 L268 78 Q276 82 276 88 L276 92 Q276 98 268 98 L52 98 Q40 98 40 88 Z"
        fill="url(#carSideGrad)"
        stroke="var(--accent)"
        strokeOpacity="0.25"
        strokeWidth="1.5"
      />
      {/* Окна */}
      <path
        d="M98 52 L128 50 L175 52 L195 58 L185 72 L115 72 L98 62 Z"
        fill="url(#carGlass)"
        stroke="var(--accent)"
        strokeOpacity="0.15"
        strokeWidth="1"
      />
      {/* Колёса */}
      <circle cx="88" cy="96" r="18" fill="var(--bg-secondary)" stroke="var(--border)" strokeWidth="2" />
      <circle cx="88" cy="96" r="8" fill="var(--text-muted)" fillOpacity="0.2" />
      <circle cx="232" cy="96" r="18" fill="var(--bg-secondary)" stroke="var(--border)" strokeWidth="2" />
      <circle cx="232" cy="96" r="8" fill="var(--text-muted)" fillOpacity="0.2" />
      {/* Фары */}
      <path d="M258 72 L272 76 L268 86 L252 82 Z" fill="var(--accent)" fillOpacity="0.35" />
      <path d="M48 76 L62 72 L58 84 L44 82 Z" fill="var(--accent)" fillOpacity="0.2" />
    </svg>
  );
}
