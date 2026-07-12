import Image from "next/image";
import Link from "next/link";

type CategoryPhotoCardProps = {
  slug: string;
  name: string;
  imageUrl: string | null;
  count: number;
  size?: "sm" | "md" | "lg";
  priority?: boolean;
};

export function CategoryPhotoCard({
  slug,
  name,
  imageUrl,
  count,
  size = "md",
  priority = false,
}: CategoryPhotoCardProps) {
  const sizeClasses = {
    sm: "aspect-[4/3] rounded-2xl",
    md: "aspect-[4/3] rounded-2xl sm:rounded-3xl",
    lg: "aspect-[3/4] sm:aspect-auto sm:min-h-[280px] rounded-3xl",
  };

  const textClasses = {
    sm: "text-sm",
    md: "text-sm sm:text-base",
    lg: "text-lg sm:text-xl",
  };

  return (
    <Link
      href={`/search?category=${slug}`}
      className={`group relative block overflow-hidden bg-[var(--bg-secondary)] shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ${sizeClasses[size]}`}
    >
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={name}
          fill
          priority={priority}
          className="object-cover transition-transform duration-700 group-hover:scale-110"
          sizes={
            size === "lg"
              ? "(max-width: 1024px) 50vw, 33vw"
              : "(max-width: 640px) 50vw, 25vw"
          }
          quality={95}
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-neutral-200 to-neutral-300" />
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-black/5" />
      <div className="absolute inset-0 ring-1 ring-inset ring-white/10" />

      <div className={`absolute bottom-0 left-0 right-0 ${size === "lg" ? "p-5 sm:p-6" : "p-4"}`}>
        <p className={`text-white font-bold leading-tight ${textClasses[size]}`}>
          {name}
        </p>
        <p className="text-white/60 text-xs sm:text-sm mt-1">
          {count} объявлений
        </p>
      </div>
    </Link>
  );
}
