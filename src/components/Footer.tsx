import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { BrandLogo } from "@/components/layout/BrandLogo";

export async function Footer() {
  const t = await getTranslations("footer");

  return (
    <footer className="hidden md:block border-t border-[var(--border)] bg-[var(--bg-card)] mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-12 md:py-14">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-10">
          <div>
            <div className="mb-3">
              <BrandLogo size={32} withName />
            </div>
            <p className="text-sm text-[var(--text-muted)] max-w-xs leading-relaxed">{t("tagline")}</p>
          </div>

          <div className="flex gap-16 text-sm">
            <div>
              <p className="font-medium mb-3 text-[var(--text-secondary)]">{t("cities")}</p>
              <div className="space-y-2 text-[var(--text-muted)]">
                {["Ереван", "Гюмри", "Ванадзор"].map((city) => (
                  <Link
                    key={city}
                    href={`/search?city=${encodeURIComponent(city)}`}
                    className="block hover:text-[var(--brand)] transition-colors"
                  >
                    {city}
                  </Link>
                ))}
              </div>
            </div>
            <div>
              <p className="font-medium mb-3 text-[var(--text-secondary)]">{t("sections")}</p>
              <div className="space-y-2 text-[var(--text-muted)]">
                <Link href="/categories" className="block hover:text-[var(--brand)] transition-colors">
                  {t("categories")}
                </Link>
                <Link href="/create" className="block hover:text-[var(--brand)] transition-colors">
                  {t("post")}
                </Link>
                <Link href="/search" className="block hover:text-[var(--brand)] transition-colors">
                  {t("search")}
                </Link>
              </div>
            </div>
          </div>
        </div>

        <p className="text-xs text-[var(--text-muted)] mt-10 pt-6 border-t border-[var(--border)]">
          © {new Date().getFullYear()} HayMarket
        </p>
      </div>
    </footer>
  );
}
