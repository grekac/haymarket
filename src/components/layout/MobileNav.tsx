"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { useEffect, useState } from "react";
import { Home, Heart, SquarePlus, MessageCircle, User } from "lucide-react";
import { cn } from "@/lib/utils";

export function MobileNav() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const [badges, setBadges] = useState({ favorites: 0, messages: 0 });

  const NAV = [
    { href: "/", icon: Home, label: t("home") },
    { href: "/favorites", icon: Heart, label: t("favorites"), badgeKey: "favorites" as const },
    { href: "/my", icon: SquarePlus, label: t("ads") },
    { href: "/messages", icon: MessageCircle, label: t("chats"), badgeKey: "messages" as const },
    { href: "/profile", icon: User, label: t("profile") },
  ];

  const hideOnListing = pathname.startsWith("/listing/");
  const hideOnChat = /^\/messages\/[^/]+$/.test(pathname);
  const hideOnCreate = pathname.startsWith("/create");

  useEffect(() => {
    fetch("/api/nav/badges")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setBadges({ favorites: d.favorites ?? 0, messages: d.messages ?? 0 }))
      .catch(() => {});
  }, [pathname]);

  if (hideOnListing || hideOnChat || hideOnCreate) return null;

  return (
    <nav className="app-fixed bottom-0 z-50 md:hidden border-t border-[var(--border)]/70 bg-[var(--bg-glass)] backdrop-blur-xl">
      <div
        className="grid grid-cols-5 h-14 px-1"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        {NAV.map(({ href, icon: Icon, label, badgeKey }) => {
          const active =
            href === "/"
              ? pathname === "/"
              : pathname === href || pathname.startsWith(`${href}/`);
          const badge = badgeKey ? badges[badgeKey] : 0;

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "relative flex flex-col items-center justify-center gap-0.5 transition-colors",
                active ? "text-[var(--accent)]" : "text-[var(--text-muted)]"
              )}
              aria-current={active ? "page" : undefined}
            >
              <span className="relative">
                <Icon className="w-[22px] h-[22px]" strokeWidth={active ? 2.25 : 1.75} />
                {badge > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 min-w-[15px] h-[15px] px-1 rounded-full bg-[var(--danger)] text-white text-[9px] font-bold flex items-center justify-center leading-none">
                    {badge > 9 ? "9+" : badge}
                  </span>
                )}
              </span>
              <span className="text-[10px] leading-none font-medium">{label}</span>
              {active && (
                <span className="absolute top-1 w-1 h-1 rounded-full bg-[var(--accent)]" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
