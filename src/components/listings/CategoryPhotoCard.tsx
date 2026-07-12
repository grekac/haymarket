import Image from "next/image";
import Link from "next/link";
import { CategoryIcon } from "./CategoryIcon";

type CategoryPhotoCardProps = {
  slug: string;
  name: string;
  icon: string;
  imageUrl: string | null;
  count: number;
  size?: "sm" | "md" | "lg";
  priority?: boolean;
};

export function CategoryPhotoCard({
  slug,
  name,
  icon,
  imageUrl,
  count,
  size = "md",
  priority = false,
}: CategoryPhotoCardProps) {
  const heights = {
    sm: "h-32",
    md: "h-36 sm:h-40",
    lg: "h-44 sm:h-52",
  };

  return (
    <Link
      href={`/search?category=${slug}`}
      className={`group relative block overflow-hidden rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] hover:border-[var(--border-hover)] transition-colors duration-150 ${heights[size]}`}
    >
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={name}
          fill
          priority={priority}
          unoptimized
          className="object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-300"
          sizes="(max-width: 640px) 50vw, 25vw"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <CategoryIcon name={icon} className="w-8 h-8 text-[var(--text-muted)]" />
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-3">
        <p className={`text-white font-medium leading-tight ${size === "lg" ? "text-base" : "text-sm"}`}>
          {name}
        </p>
        <p className="text-white/50 text-[11px] mt-0.5">{count}</p>
      </div>
    </Link>
  );
}
