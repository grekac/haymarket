import { cn } from "@/lib/utils";

type Props = {
  slug: string;
  className?: string;
};

function Shadow() {
  return <ellipse cx="32" cy="54" rx="14" ry="3.5" fill="#000" opacity="0.08" />;
}

/** Иконки в стиле Avito — объёмные, на цветном фоне */
export function CategoryIllustration({ slug, className }: Props) {
  const s = cn("w-full h-full", className);

  switch (slug) {
    case "cars":
      return (
        <svg viewBox="0 0 64 64" fill="none" className={s} aria-hidden>
          <Shadow />
          <path d="M12 34h40l3-9H15l-3 9z" fill="#4A9FE8" />
          <rect x="10" y="34" width="44" height="13" rx="5" fill="url(#carBody)" />
          <circle cx="20" cy="47" r="5.5" fill="#2B6CB0" />
          <circle cx="44" cy="47" r="5.5" fill="#2B6CB0" />
          <circle cx="20" cy="47" r="2" fill="#BEE3F8" />
          <circle cx="44" cy="47" r="2" fill="#BEE3F8" />
          <rect x="22" y="36" width="9" height="7" rx="1.5" fill="#90CDF4" />
          <rect x="33" y="36" width="9" height="7" rx="1.5" fill="#90CDF4" />
          <defs>
            <linearGradient id="carBody" x1="10" y1="34" x2="54" y2="47">
              <stop stopColor="#63B3ED" />
              <stop offset="1" stopColor="#3182CE" />
            </linearGradient>
          </defs>
        </svg>
      );

    case "real-estate":
      return (
        <svg viewBox="0 0 64 64" fill="none" className={s} aria-hidden>
          <Shadow />
          <path d="M32 12L12 30v22h40V30L32 12z" fill="url(#house)" />
          <rect x="27" y="38" width="10" height="14" rx="1" fill="#276749" />
          <rect x="19" y="30" width="7" height="7" rx="1" fill="#9AE6B4" />
          <rect x="38" y="30" width="7" height="7" rx="1" fill="#9AE6B4" />
          <defs>
            <linearGradient id="house" x1="12" y1="12" x2="52" y2="52">
              <stop stopColor="#68D391" />
              <stop offset="1" stopColor="#38A169" />
            </linearGradient>
          </defs>
        </svg>
      );

    case "electronics":
      return (
        <svg viewBox="0 0 64 64" fill="none" className={s} aria-hidden>
          <Shadow />
          <rect x="20" y="10" width="24" height="42" rx="5" fill="url(#phone)" />
          <rect x="24" y="16" width="16" height="28" rx="2" fill="#D6BCFA" />
          <circle cx="32" cy="48" r="2" fill="#FAF5FF" />
          <defs>
            <linearGradient id="phone" x1="20" y1="10" x2="44" y2="52">
              <stop stopColor="#B794F4" />
              <stop offset="1" stopColor="#805AD5" />
            </linearGradient>
          </defs>
        </svg>
      );

    case "jobs":
      return (
        <svg viewBox="0 0 64 64" fill="none" className={s} aria-hidden>
          <Shadow />
          <rect x="16" y="24" width="32" height="24" rx="4" fill="url(#case)" />
          <path d="M26 24v-7a6 6 0 0112 0v7" stroke="#744210" strokeWidth="3" fill="none" />
          <rect x="22" y="32" width="20" height="3" rx="1" fill="#FEFCBF" />
          <rect x="22" y="38" width="14" height="3" rx="1" fill="#FEFCBF" />
          <defs>
            <linearGradient id="case" x1="16" y1="24" x2="48" y2="48">
              <stop stopColor="#F6AD55" />
              <stop offset="1" stopColor="#DD6B20" />
            </linearGradient>
          </defs>
        </svg>
      );

    case "services":
      return (
        <svg viewBox="0 0 64 64" fill="none" className={s} aria-hidden>
          <Shadow />
          <circle cx="32" cy="30" r="16" fill="url(#wrenchBg)" />
          <path d="M32 18l2 8h8l-6 5 2 8-6-5-6 5 2-8-6-5h8l2-8z" fill="#FFF5F5" />
          <defs>
            <linearGradient id="wrenchBg" x1="16" y1="14" x2="48" y2="46">
              <stop stopColor="#FC8181" />
              <stop offset="1" stopColor="#E53E3E" />
            </linearGradient>
          </defs>
        </svg>
      );

    case "home-furniture":
      return (
        <svg viewBox="0 0 64 64" fill="none" className={s} aria-hidden>
          <Shadow />
          <rect x="12" y="32" width="40" height="12" rx="3" fill="url(#sofa)" />
          <rect x="14" y="22" width="14" height="12" rx="2" fill="#FBD38D" />
          <rect x="36" y="24" width="12" height="10" rx="2" fill="#FBD38D" />
          <rect x="14" y="44" width="5" height="6" rx="1" fill="#C05621" />
          <rect x="45" y="44" width="5" height="6" rx="1" fill="#C05621" />
          <defs>
            <linearGradient id="sofa" x1="12" y1="32" x2="52" y2="44">
              <stop stopColor="#ED8936" />
              <stop offset="1" stopColor="#C05621" />
            </linearGradient>
          </defs>
        </svg>
      );

    case "clothing":
      return (
        <svg viewBox="0 0 64 64" fill="none" className={s} aria-hidden>
          <Shadow />
          <path d="M32 14c-2 0-4 2-4 4v4l-9 5 2 26h22l2-26-9-5v-4c0-2-2-4-4-4z" fill="url(#shirt)" />
          <path d="M26 24h12" stroke="#FED7E2" strokeWidth="2" />
          <defs>
            <linearGradient id="shirt" x1="19" y1="14" x2="45" y2="53">
              <stop stopColor="#F687B3" />
              <stop offset="1" stopColor="#D53F8C" />
            </linearGradient>
          </defs>
        </svg>
      );

    case "kids":
      return (
        <svg viewBox="0 0 64 64" fill="none" className={s} aria-hidden>
          <Shadow />
          <circle cx="32" cy="24" r="9" fill="url(#baby)" />
          <path d="M20 50c0-9 5-14 12-14s12 5 12 14" fill="#76E4F7" />
          <circle cx="29" cy="22" r="1.5" fill="#fff" />
          <circle cx="35" cy="22" r="1.5" fill="#fff" />
          <path d="M30 26c2 1.5 4 1.5 6 0" stroke="#fff" strokeWidth="1.5" fill="none" />
          <defs>
            <linearGradient id="baby" x1="23" y1="15" x2="41" y2="33">
              <stop stopColor="#4FD1C5" />
              <stop offset="1" stopColor="#319795" />
            </linearGradient>
          </defs>
        </svg>
      );

    case "animals":
      return (
        <svg viewBox="0 0 64 64" fill="none" className={s} aria-hidden>
          <Shadow />
          <ellipse cx="32" cy="36" rx="13" ry="10" fill="url(#pet)" />
          <circle cx="32" cy="22" r="9" fill="#9AE6B4" />
          <circle cx="23" cy="17" r="4.5" fill="#C6F6D5" />
          <circle cx="41" cy="17" r="4.5" fill="#C6F6D5" />
          <circle cx="29" cy="21" r="1.5" fill="#22543D" />
          <circle cx="35" cy="21" r="1.5" fill="#22543D" />
          <ellipse cx="32" cy="25" rx="2.5" ry="1.5" fill="#276749" />
          <defs>
            <linearGradient id="pet" x1="19" y1="26" x2="45" y2="46">
              <stop stopColor="#68D391" />
              <stop offset="1" stopColor="#48BB78" />
            </linearGradient>
          </defs>
        </svg>
      );

    default:
      return (
        <svg viewBox="0 0 64 64" fill="none" className={s} aria-hidden>
          <Shadow />
          <rect x="14" y="14" width="16" height="16" rx="4" fill="#CBD5E0" />
          <rect x="34" y="14" width="16" height="16" rx="4" fill="#A0AEC0" />
          <rect x="14" y="34" width="16" height="16" rx="4" fill="#A0AEC0" />
          <rect x="34" y="34" width="16" height="16" rx="4" fill="#718096" />
        </svg>
      );
  }
}

/** Фон иконки как на Avito */
export const CATEGORY_TILE: Record<string, { bg: string; dark: string }> = {
  cars: { bg: "#E8F4FD", dark: "#1a2a3a" },
  "real-estate": { bg: "#E6F6EF", dark: "#1a2e24" },
  electronics: { bg: "#F3E8FF", dark: "#2a1a3a" },
  jobs: { bg: "#FEF3E2", dark: "#3a2a1a" },
  services: { bg: "#FEE8E8", dark: "#3a1a1a" },
  "home-furniture": { bg: "#FFF0E6", dark: "#3a2418" },
  clothing: { bg: "#FCE7F3", dark: "#3a1a2a" },
  kids: { bg: "#E0F7FA", dark: "#1a2e30" },
  animals: { bg: "#ECFCCB", dark: "#1a2e14" },
  other: { bg: "#F1F5F9", dark: "#2a2a2e" },
};
