import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  href?: string;
  label?: string;
  className?: string;
  sticky?: boolean;
};

export function BackButton({ href = "/", label = "Назад", className, sticky }: Props) {
  return (
    <div
      className={cn(
        sticky && "sticky top-0 z-30 glass border-b border-[var(--border)]/60 -mx-4 px-4 py-3 mb-4 md:static md:border-0 md:bg-transparent md:backdrop-blur-none md:-mx-0 md:px-0 md:py-0 md:mb-6",
        className
      )}
    >
      <Link
        href={href}
        className="inline-flex items-center gap-1.5 text-[15px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
      >
        <ChevronLeft className="w-5 h-5 shrink-0" />
        {label}
      </Link>
    </div>
  );
}
