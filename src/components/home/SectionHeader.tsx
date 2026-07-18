import { Link } from "@/i18n/navigation";
import { ArrowRight } from "lucide-react";

export function SectionHeader({
  title,
  subtitle,
  href,
}: {
  title: string;
  subtitle?: string;
  href?: string;
}) {
  return (
    <div className="flex items-end justify-between mb-4">
      <div>
        <h2 className="text-[20px] font-semibold tracking-tight">{title}</h2>
        {subtitle && <p className="text-[13px] text-[var(--text-muted)] mt-0.5">{subtitle}</p>}
      </div>
      {href && (
        <Link
          href={href}
          className="text-[13px] font-medium text-[var(--accent)] flex items-center gap-0.5 hover:opacity-80 transition-opacity duration-200"
        >
          Все <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      )}
    </div>
  );
}
