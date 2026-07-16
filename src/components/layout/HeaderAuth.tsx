"use client";

import { useEffect, useState } from "react";
import NextLink from "next/link";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { NotificationBell } from "./NotificationBell";
import { MessageCircle, User } from "lucide-react";

type MeUser = {
  id: string;
  name: string;
  role: string;
} | null;

export function HeaderAuth({ variant }: { variant: "mobile" | "desktop" }) {
  const t = useTranslations("nav");
  const [user, setUser] = useState<MeUser>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/auth/me", { credentials: "same-origin" })
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) setUser(data.user ?? null);
      })
      .catch(() => {
        if (!cancelled) setUser(null);
      })
      .finally(() => {
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (variant === "mobile") {
    if (!ready || !user) return null;
    return <NotificationBell />;
  }

  if (!ready) {
    return <div className="w-[120px] h-9" aria-hidden />;
  }

  if (user) {
    return (
      <>
        <Link
          href="/messages"
          className="p-2.5 rounded-full hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          aria-label={t("messages")}
          title={t("messages")}
        >
          <MessageCircle className="w-5 h-5" />
        </Link>
        <NotificationBell />
        <Link
          href="/profile"
          className="ml-0.5 h-9 px-2.5 rounded-full hover:bg-[var(--bg-hover)] inline-flex items-center gap-1.5 text-[13px] font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
        >
          <span className="w-7 h-7 rounded-full bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center">
            <User className="w-3.5 h-3.5" />
          </span>
          <span className="max-w-[88px] truncate hidden lg:inline">{user.name.split(" ")[0]}</span>
        </Link>
        {user.role === "ADMIN" && (
          <NextLink
            href="/admin"
            className="px-2.5 py-1.5 rounded-lg text-[12px] font-semibold text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
          >
            {t("admin")}
          </NextLink>
        )}
      </>
    );
  }

  return (
    <>
      <Link
        href="/login"
        className="h-9 px-3 rounded-full text-[13px] font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] inline-flex items-center transition-colors"
      >
        {t("login")}
      </Link>
      <Link
        href="/register"
        className="h-9 px-3 rounded-full text-[13px] font-semibold border border-[var(--border)] hover:bg-[var(--bg-hover)] inline-flex items-center transition-colors"
      >
        {t("register")}
      </Link>
    </>
  );
}
