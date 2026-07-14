import Image from "next/image";
import { cn } from "@/lib/utils";

export function BrandLogo({
  size = 32,
  className,
  withName = false,
  nameClassName,
}: {
  size?: number;
  className?: string;
  withName?: boolean;
  nameClassName?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2 min-w-0", className)}>
      <Image
        src="/logo.png"
        alt="HayMarket"
        width={size}
        height={size}
        className="rounded-xl shrink-0 object-cover"
        priority
      />
      {withName && (
        <span className={cn("font-semibold tracking-tight truncate", nameClassName)}>
          HayMarket
        </span>
      )}
    </span>
  );
}
