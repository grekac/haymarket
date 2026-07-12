import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { CategoryIcon, CATEGORY_GRADIENT, CATEGORY_SHADOW } from "./CategoryIcon";
import { cn, formatListingCount } from "@/lib/utils";
import { categoryLink } from "@/lib/categories";

export type CategoryItem = {
  slug: string;
  name: string;
  icon: string;
  imageUrl?: string | null;
  count?: number;
  childCount?: number;
};

type Props = CategoryItem & {
  className?: string;
  showCount?: boolean;
  variant?: "compact" | "tile" | "row" | "orb";
  href?: string;
  subtitle?: string;
};

export function CategoryCard({
  slug,
  name,
  icon,
  count,
  childCount = 0,
  className,
  showCount = false,
  variant = "tile",
  href,
  subtitle,
}: Props) {
  const gradient = CATEGORY_GRADIENT[slug] ?? CATEGORY_GRADIENT.other;
  const shadow = CATEGORY_SHADOW[slug] ?? CATEGORY_SHADOW.other;
  const link = href ?? categoryLink(slug, childCount);

  if (variant === "orb") {
    return (
      <Link
        href={link}
        className={cn(
          "group flex flex-col items-center gap-2.5 min-w-[72px] snap-start",
          "active:scale-95 transition-transform duration-200",
          className
        )}
      >
        <div
          className={cn(
            "w-[60px] h-[60px] rounded-full bg-gradient-to-br flex items-center justify-center",
            "shadow-[var(--shadow-md)] group-hover:shadow-[var(--shadow-lg)]",
            "transition-all duration-300",
            gradient,
            shadow
          )}
        >
          <CategoryIcon name={icon} className="w-6 h-6 text-white" />
        </div>
        <p className="text-[12px] font-medium text-center leading-tight line-clamp-2 text-[var(--text-primary)] w-full max-w-[80px]">
          {name}
        </p>
      </Link>
    );
  }

  if (variant === "row") {
    return (
      <Link
        href={link}
        className={cn(
          "group flex items-center gap-3.5 p-4 rounded-[20px]",
          "bg-[var(--bg-card)] border border-[var(--border)]",
          "hover:shadow-[var(--shadow-md)] transition-all duration-300",
          className
        )}
      >
        <div className={cn("w-12 h-12 rounded-full bg-gradient-to-br flex items-center justify-center shrink-0 shadow-md", gradient, shadow)}>
          <CategoryIcon name={icon} className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[15px] font-semibold">{name}</p>
          {subtitle && <p className="text-xs text-[var(--text-muted)] mt-0.5 line-clamp-2">{subtitle}</p>}
          {showCount && count !== undefined && count > 0 && (
            <p className="text-xs text-[var(--text-muted)] mt-0.5">{formatListingCount(count)}</p>
          )}
        </div>
        <ChevronRight className="w-4 h-4 text-[var(--text-muted)] group-hover:translate-x-0.5 transition-transform shrink-0" />
      </Link>
    );
  }

  if (variant === "compact") {
    return (
      <Link
        href={link}
        className={cn(
          "group flex flex-col items-center gap-2 py-1 min-w-[68px] snap-start",
          "active:scale-95 transition-transform duration-200",
          className
        )}
      >
        <div
          className={cn(
            "w-12 h-12 rounded-full bg-gradient-to-br flex items-center justify-center shadow-md",
            "group-hover:scale-105 transition-transform duration-300",
            gradient,
            shadow
          )}
        >
          <CategoryIcon name={icon} className="w-5 h-5 text-white" />
        </div>
        <p className="text-[11px] font-medium text-center leading-tight line-clamp-2 text-[var(--text-primary)] w-full">
          {name}
        </p>
      </Link>
    );
  }

  return (
    <Link
      href={link}
      className={cn(
        "group flex flex-col items-center gap-3 p-5 rounded-[22px]",
        "bg-[var(--bg-card)] border border-[var(--border)]",
        "hover:shadow-[var(--shadow-md)] active:scale-[0.98] transition-all duration-300",
        className
      )}
    >
      <div className={cn("w-14 h-14 rounded-full bg-gradient-to-br flex items-center justify-center shadow-lg", gradient, shadow)}>
        <CategoryIcon name={icon} className="w-6 h-6 text-white" />
      </div>
      <p className="text-sm font-medium text-center leading-snug">{name}</p>
      {subtitle && <p className="text-xs text-[var(--text-muted)] text-center -mt-1">{subtitle}</p>}
    </Link>
  );
}
