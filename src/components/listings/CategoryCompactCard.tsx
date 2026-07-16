import Image from "next/image";
import Link from "next/link";
import { CategoryIcon } from "./CategoryIcon";
import { cn } from "@/lib/utils";

type Props = {
  slug: string;
  name: string;
  icon: string;
  imageUrl: string | null;
  count?: number;
  size?: "sm" | "md";
  priority?: boolean;
};

export function CategoryCompactCard({
  slug,
  name,
  icon,
  imageUrl,
  count,
  size = "sm",
  priority = false,
}: Props) {
  const isMd = size === "md";

  return (
    <Link
      href={`/search?category=${slug}`}
      className={cn(
        "group flex flex-col rounded-lg border border-[var(--border)] bg-[var(--bg-card)] overflow-hidden",
        "hover:border-[var(--border-hover)] hover:bg-[var(--bg-hover)] transition-colors duration-150",
        isMd ? "p-2.5" : "p-1.5"
      )}
    >
      <div
        className={cn(
          "relative w-full overflow-hidden rounded-md bg-[var(--bg-secondary)] shrink-0",
          isMd ? "aspect-[5/4]" : "aspect-square"
        )}
      >
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={name}
            fill
            priority={priority}
            className="object-cover"
            sizes={isMd ? "20vw" : "15vw"}
            quality={75}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <CategoryIcon
              name={icon}
              className={cn("text-[var(--text-muted)]", isMd ? "w-6 h-6" : "w-4 h-4")}
            />
          </div>
        )}
      </div>
      <div className={cn("min-w-0", isMd ? "mt-2 px-0.5" : "mt-1 px-0.5")}>
        <p
          className={cn(
            "font-medium leading-tight line-clamp-2 text-[var(--text-primary)]",
            isMd ? "text-xs" : "text-[10px] sm:text-[11px]"
          )}
        >
          {name}
        </p>
        {count !== undefined && count > 0 && (
          <p className={cn("text-[var(--text-muted)] mt-0.5", isMd ? "text-[10px]" : "text-[9px]")}>
            {count}
          </p>
        )}
      </div>
    </Link>
  );
}
